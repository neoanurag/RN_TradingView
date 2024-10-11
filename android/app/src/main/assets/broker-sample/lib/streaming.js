export class BalanceEquityStreaming {
    constructor(loginNumber) {
        this.ws = null;
        this.updateCallbacks = [];
        // this.reconnectInterval = reconnectInterval;
        this.loginNumber = loginNumber;
        // Initiate the WebSocket connection
        this.connect();
    }
    // Method to connect to the WebSocket
    connect() {
        this.ws = new WebSocket(`wss://opotrade.azurewebsites.net/ws?login=${this.loginNumber}&methodtype=GetTradeState&TP=3`);
        // Handle WebSocket open event
        this.ws.onopen = () => {
            console.log("WebSocket connection established");
            // You might want to send an initial request here if required
        };
        // Handle incoming messages
        this.ws.onmessage = (event) => {
            //console.log("WebSocket message received:", JSON.parse(event.data));
            const data = JSON.parse(event.data).answer;
            let balance = parseFloat(data.Balance);
            let equity = parseFloat(data.Equity);
            let pl = parseFloat(data.Profit);
            // if(balance && equity){
            //   this.updateCallbacks.forEach((callback) => {
            //     // Create a new object for each callback to avoid passing references
            //     const balanceEquityData:BalanceEquityData = { balance: balance, equity: equity,pl :pl};
            //     callback({ ...balanceEquityData }); // Spread the object to ensure a new copy
            // });
            // }
            this.updateCallbacks.forEach((callback) => {
                const balanceEquityData = {
                    balance: balance,
                    equity: equity,
                    pl: pl,
                };
                callback({ ...balanceEquityData });
            });
        };
        // Handle WebSocket close event and try to reconnect
        this.ws.onclose = () => {
            console.log("WebSocket connection closed. Attempting to reconnect...");
        };
        // Handle WebSocket errors
        this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }
    // Subscribe to balance and equity updates
    subscribe(callback) {
        this.updateCallbacks.push(callback);
    }
    // Unsubscribe from balance and equity updates
    unsubscribe(callback) {
        console.log("Closing Unsubscribing from balance and equity updates...");
        this.updateCallbacks = this.updateCallbacks.filter((cb) => cb !== callback);
    }
    // Close the WebSocket connection manually
    close() {
        if (this.ws) {
            console.log("Closing WebSocket connection...");
            this.ws.close();
            this.ws = null;
            this.updateCallbacks = [];
        }
    }
}
