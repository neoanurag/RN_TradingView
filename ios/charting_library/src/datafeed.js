import { makeApiRequest } from "./helpers.js";
import streaming from "./streaming.js";

const source = "tv";
const bartDataType = "dhloc";
const lastBarsCache = new Map();

let fromDate = new Date();
fromDate.setMonth(fromDate.getMonth() - 1);
fromDate.setHours(0, 0, 0, 0);
const timeOffset = 3 * 60 * 60;

class Datafeed {
  configurationData;

  constructor() {
    this.configurationData = {
      exchanges: [
        {
          value: "Opofinance",
          name: "Opofinance",
          desc: "Opofinance",
        },
      ],

      supported_resolutions: [
        "1",
        "5",
        "15",
        "30",
        "60",
        "240",
        "1D",
        "1W",
        "1M",
      ],

      symbols_types: [
        { name: "All types", value: "" },
        { name: "Forex", value: "forex" },
        { name: "Metals", value: "metals" },
        { name: "Commodities", value: "commodities" },
        { name: "Stocks", value: "stocks" },
        { name: "Indices", value: "indices" },
        { name: "Cryptocurrencies", value: "crypto" },
      ],

      supports_marks: true,
      supports_time: true,
      supports_timescale_marks: true,
    };
  }

  // Retry helper function
  async retryApiRequest(url, params = {}, retries = 4, delay = 100) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await makeApiRequest(url, params);
      } catch (error) {
        // Check if the error has a status and if it's 400
        if (error.status === 400) {
          if (attempt < retries) {
            console.warn(
              `[retryApiRequest]: Attempt ${attempt} failed with 400 error. Retrying in ${delay}ms...`
            );
            await this.sleep(delay);
          } else {
            console.error(
              `[retryApiRequest]: All ${retries} attempts failed with 400 error.`
            );
            throw error;
          }
        } else {
          // For other errors, do not retry
          throw error;
        }
      }
    }
  }

  // Helper function to pause execution for a specified time
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Helper function to get the current suffix
  getSuffix() {
    return localStorage.getItem("suffix") || "";
  }

  // Helper function to append the suffix
  appendSuffix(symbol) {
    const suffix = this.getSuffix();
    if (suffix && symbol && !symbol.endsWith(suffix)) {
      return symbol + suffix;
    }
    return symbol;
  }

  // Helper function to remove the suffix
  removeSuffix(symbol) {
    const suffix = this.getSuffix();
    if (suffix && symbol && symbol.endsWith(suffix)) {
      return symbol.slice(0, -suffix.length);
    }
    return symbol;
  }

  onReady(callback) {
    setTimeout(() => callback(this.configurationData));
  }

  async getServerTime(callback) {
    try {
      const data = await this.retryApiRequest(`api/Test/getServerTime`);
      if (data?.unixTimestamp) {
        callback(data.unixTimestamp);
      }
    } catch (error) {
      console.error(
        "[getServerTime]: Failed to load server time, error=",
        error
      );
    }
  }

  async searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    const requestParams = {
      mask: userInput?.toUpperCase() || "",
      source: source,
    };
    try {
      const data = await this.retryApiRequest(
        `api/Symbol/getsymbolsbymask`,
        requestParams
      );
      if (data?.data) {
        const response = data.data;

        const newSymbols = response
          .filter(
            (item) =>
              item.type.toLowerCase() === symbolType.toLowerCase() ||
              symbolType === ""
          )
          .map((item) => {
            // Remove suffix from symbols before returning
            const symbolWithoutSuffix = this.removeSuffix(item.name);
            return {
              symbol: symbolWithoutSuffix,
              ticker: symbolWithoutSuffix,
              description: item.description,
              exchange: item.exchange,
              type: item.type,
              full_name: symbolWithoutSuffix,
            };
          });

        onResultReadyCallback(newSymbols);
      } else {
        onResultReadyCallback([]);
      }
    } catch (error) {
      console.error(
        "[searchSymbols]: Failed to search symbols, error=",
        error
      );
      onResultReadyCallback([]);
    }
  }

  resolveSymbol = async (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback,
    extension
  ) => {
    console.log("[resolveSymbol]: Method call", symbolName);
    try {
      const s1 = symbolName.replace("Opofinance:", "");
      // Append suffix to the symbol
      const symbolWithSuffix = this.appendSuffix(s1);
      const requestParams = {
        symbol: symbolWithSuffix,
        source: source,
      };

      const data = await this.retryApiRequest(
        `api/Symbol/getsymbolsbyname`,
        requestParams
      );

      if (data.data?.[0]) {
        const symbolItem = data.data[0];

        // Remove suffix before returning to client
        const symbolWithoutSuffix = this.removeSuffix(symbolItem.name);

        const symbolInfo = {
          ticker: symbolWithoutSuffix,
          name: symbolWithoutSuffix,
          description: symbolItem.description,
          type: symbolItem.type,
          session: symbolItem.session,
          timezone: symbolItem.timezone,
          exchange: symbolItem.exchange,
          minmov: symbolItem.minmov,
          pricescale: symbolItem.pricescale,
          has_intraday: symbolItem.has_intraday,
          has_weekly_and_monthly: symbolItem.has_weekly_and_monthly,
          supported_resolutions: symbolItem.supported_resolutions,
          intraday_multipliers: ["1"],
          has_empty_bars: symbolItem.has_empty_bars,
          listed_exchange: symbolItem.listed_exchange,
          visible_plots_set: symbolItem.visible_plots_set,
          currency_code: symbolItem.currency_code,
          volume_precision: symbolItem.volume_precision,
          data_status: symbolItem.data_status,
          sector: symbolItem.sector,
          industry: symbolItem.industry,
          delay: symbolItem.delay,
          format: symbolItem.format,
        };

        onSymbolResolvedCallback(symbolInfo);
      } else {
        onResolveErrorCallback("unknown_symbol");
        return;
      }
    } catch (error) {
      console.error("[resolveSymbol]: Failed to resolve symbol, error=", error);
      onResolveErrorCallback("unknown_symbol");
    }
  };

  getUnixTimestamp() {
    return Math.floor(Date.now() / 1000);
  }

  getUnixTimestampOneDayAgo() {
    const secondsInOneDay = 86400;
    return this.getUnixTimestamp() - secondsInOneDay;
  }

  async getBars(
    symbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback
  ) {
    const { from, to, countBack, firstDataRequest } = periodParams;

    try {
      const adjustedFrom = from + timeOffset;
      const adjustedTo = to + timeOffset;

      // Append suffix to the symbol
      const symbolWithSuffix = this.appendSuffix(symbolInfo.ticker || "");

      const requestParams = {
        symbol: symbolWithSuffix,
        from: adjustedFrom,
        to: adjustedTo,
        data: bartDataType,
        source: source,
        resolution: resolution,
      };

      const data = await this.retryApiRequest(`api/Tick/get`, requestParams);
      let bars = [];

      if (
        data.errorMessage ||
        !data?.data ||
        (data.data?.length ?? 0) === 0
      ) {
        onHistoryCallback([], { noData: true });
        return;
      }

      data.data.forEach((bar) => {
        bars.push({
          time: (bar.time - timeOffset) * 1000, // Convert to milliseconds
          low: bar.low,
          high: bar.high,
          open: bar.open,
          close: bar.close,
          volume: bar.volume,
        });
      });

      if (bars.length > countBack) {
        bars = bars.slice(bars.length - countBack);
      }

      onHistoryCallback(bars, { noData: false });

      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.ticker, {
          ...bars[bars.length - 1],
        });
      }
    } catch (error) {
      console.error("[getBars]: Failed to get bars, error=", error);
      onErrorCallback(error);
    }
  }

  subscribeBars(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    listenerGUID,
    onResetCacheNeededCallback
  ) {
    console.log("[subscribeBars]: Method call with listenerGUID:", listenerGUID);

    // Append suffix to the symbol
    const symbolWithSuffix = this.appendSuffix(symbolInfo.name);

    streaming.setSubscriber(
      "GetM1History",
      listenerGUID,
      symbolWithSuffix,
      (data) => {
        if (data && typeof data === "object" && data.time) {
          console.log("[subscribeBars]: Method call :", data);

          onRealtimeCallback(data);
        } else {
          console.error(
            "[SubscribeBars]: Unexpected data type",
            data
          );
        }
      }
    );
  }

  unsubscribeBars(listenerGUID) {
    console.log(
      "[unsubscribeBars]: Method call with listenerGUID:",
      listenerGUID
    );
    streaming.removeSubscriber(listenerGUID);
  }

  async getQuotes(symbols, onDataCallback, onErrorCallback) {
    try {
      const quotes = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            // Append suffix to the symbol
            const symbolWithSuffix = this.appendSuffix(symbol);
            const id = 1;
            const requestParams = { symbol: symbolWithSuffix, id, source };
            const response = await this.retryApiRequest(
              "api/Tick/last",
              requestParams
            );

            if (response.success && response.data.length > 0) {
              const {
                symbolname,
                lastprice,
                ask,
                bid,
                volume,
              } = response.data[0];

              // Remove suffix before returning to client
              const symbolWithoutSuffix = this.removeSuffix(symbolname);

              return {
                n: symbolWithoutSuffix,
                s: "ok",
                v: {
                  ch: 0,
                  chp: 0,
                  short_name: symbolWithoutSuffix,
                  exchange: "",
                  description: symbolWithoutSuffix,
                  lp: lastprice,
                  ask: ask,
                  bid: bid,
                  open_price: lastprice,
                  high_price: lastprice,
                  low_price: lastprice,
                  prev_close_price: lastprice,
                  volume,
                },
              };
            }
            throw new Error("Response unsuccessful or no data");
          } catch (error) {
            console.error(
              `[getQuotes]: Failed to get quote for ${symbol}, error=`,
              error
            );
            return {
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
          }
        })
      );

      onDataCallback(quotes);
    } catch (error) {
      console.error("[getQuotes]: Failed to get quotes, error=", error);
      onErrorCallback(error.toString());
    }
  }

  subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGUID) {
    console.log(
      "[subscribeQuotes]: Method call with listenerGUID:",
      listenerGUID,
      symbols,
      fastSymbols
    );

    fastSymbols.forEach((symbol) => {
      // Append suffix to the symbol
      const symbolWithSuffix = this.appendSuffix(symbol);
      streaming.setSubscriber(
        "GetQuotes",
        listenerGUID,
        symbolWithSuffix,
        (data) => {
          if (Array.isArray(data)) {
            onRealtimeCallback(data);
          } else {
            // console.error("[subscribeQuotes]: Unexpected data type", data);
          }
        }
      );
    });
  }

  unsubscribeQuotes(listenerGUID) {
    streaming.removeSubscriber(listenerGUID);
  }
}

export default Datafeed;
