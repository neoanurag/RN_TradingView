// const WEB_SOCKET_URL = "wss://oposocket.azurewebsites.net";

class Streaming {
  constructor() {
    this.wsInstances = {}; 
    this.subscribers = {}; 
  }

  setSubscriber(type, listenerGUID, symbol, callback) {
    this.subscribers[listenerGUID] = {
      type,
      symbol,
      ...(type === "GetQuotes" && { getQuotesCallback: callback }),
      ...(type === "GetM1History" && { getBarsCallback: callback }),
    };
    let url = "";
    if (type === "GetQuotes") {
      url = `${WEB_SOCKET_URL}/ws?symbol=${symbol}&id=1&methodtype=${type}&TP=1&source=tv`;
    } else if (type === "GetM1History") {
      url = `${WEB_SOCKET_URL}/ws?symbol=${symbol}&fromtime=0&totime=1&data=dhloc&source=tv&methodtype=GetM1History&TP=1`;
    }
    this.connectWebSocket(url, type, symbol);
  }

  removeSubscriber(listenerGUID) {
    if (this.subscribers[listenerGUID]) {
      const { type, symbol } = this.subscribers[listenerGUID];
      delete this.subscribers[listenerGUID];

      const hasOtherSubscribers = Object.values(this.subscribers).some(
        (sub) => sub.type === type && sub.symbol === symbol
      );

      const wsKey = `${type}_${symbol}`;
      if (!hasOtherSubscribers && this.wsInstances[wsKey]) {
        this.wsInstances[wsKey].close();
        delete this.wsInstances[wsKey];
      }
    }
  }

  connectWebSocket(url, type, symbol) {
    const wsKey = `${type}_${symbol}`;

    if (
      !this.wsInstances[wsKey] ||
      this.wsInstances[wsKey].readyState !== WebSocket.OPEN
    ) {
      if (this.wsInstances[wsKey]) {
        this.wsInstances[wsKey].close();
      }

      this.wsInstances[wsKey] = new WebSocket(url);

      this.wsInstances[wsKey].onopen = () => {
      };

      this.wsInstances[wsKey].onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (type === "GetQuotes") {
          this.processGetQuotesMessage(data, symbol);
        } else if (type === "GetM1History") {
          this.processSubscribeBarsMessage(data, symbol);
        }
      };

      this.wsInstances[wsKey].onerror = (error) => {
      };

      this.wsInstances[wsKey].onclose = () => {
      };
    }
  }

  processGetQuotesMessage(data, symbol) {
    if (data && data.length > 0) {
      const quote = data[0];
      const quoteData = {
        n: quote.symbolname,
        s: "ok",
        v: {
          ch: 0,
          chp: 0,
          short_name: quote.symbolname,
          exchange: "",
          description: quote.symbolname,
          lp: quote.lastprice,
          ask: quote.ask,
          bid: quote.bid,
          open_price: quote.lastprice,
          high_price: quote.lastprice,
          low_price: quote.lastprice,
          prev_close_price: quote.lastprice,
          volume: quote.volume,
        },
      };

      Object.values(this.subscribers).forEach((sub) => {
        if (
          sub.type === "GetQuotes" &&
          sub.symbol === quote.symbolname &&
          sub.getQuotesCallback
        ) {
          sub.getQuotesCallback([quoteData]);
        }
      });
    } else {
      const quoteData = {
        n: symbol,
        s: "error",
        v: {
          ch: 0,
          chp: 0,
          short_name: symbol,
          exchange: "",
          description: "No Data",
          lp: 0,
          ask: 0,
          bid: 0,
          open_price: 0,
          high_price: 0,
          low_price: 0,
          prev_close_price: 0,
          volume: 0,
        },
      };

      Object.values(this.subscribers).forEach((sub) => {
        if (
          sub.type === "GetQuotes" &&
          sub.symbol === symbol &&
          sub.getQuotesCallback
        ) {
          sub.getQuotesCallback([quoteData]);
        }
      });
    }
  }

  processSubscribeBarsMessage(data, symbol) {
    if (Array.isArray(data) && data.length > 0) {
      const lastBar = data[data.length - 1];
      if (lastBar && typeof lastBar === "object" && "time" in lastBar) {
        const bar = {
          time: (lastBar.time - 10800) * 1000, // Adjust time as needed
          close: parseFloat(lastBar.close),
          open: parseFloat(lastBar.open),
          high: parseFloat(lastBar.high),
          low: parseFloat(lastBar.low),
          volume: parseFloat(lastBar.volume),
        };

        Object.values(this.subscribers).forEach((sub) => {
          if (
            sub.type === "GetM1History" &&
            sub.symbol === symbol &&
            sub.getBarsCallback
          ) {
            sub.getBarsCallback(bar);
          }
        });
      } else {
        console.error("Invalid last bar data:", lastBar);
      }
    } else {
      console.error(
        "Invalid data received in processSubscribeBarsMessage:",
        data
      );
    }
  }
}

export default new Streaming();
