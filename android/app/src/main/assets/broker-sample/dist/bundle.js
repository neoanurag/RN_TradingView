(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Brokers = {}));
}(this, (function (exports) { 'use strict';

    /**
     * Column structure for the "Orders" page
     */
    const ordersPageColumns = [
        {
            label: "Time",
            id: "time",
            dataFields: ["timeSetup"],
            formatter: "date" /* StandardFormatterName.Date */,
        },
        {
            label: "Symbol",
            formatter: "symbol" /* StandardFormatterName.Symbol */,
            id: "symbol" /* CommonAccountManagerColumnId.Symbol */,
            dataFields: ["symbolName", "symbolName", "message"],
        },
        {
            label: "Side",
            id: "side",
            dataFields: ["side"],
            formatter: "side" /* StandardFormatterName.Side */,
        },
        {
            label: "Type",
            id: "type",
            dataFields: ["type", "parentId", "stopType"],
            formatter: "type" /* StandardFormatterName.Type */,
        },
        {
            label: "Qty",
            alignment: "right",
            id: "qty",
            dataFields: ["qty"],
            help: "Size in lots",
        },
        {
            label: "Limit Price",
            alignment: "right",
            id: "limitPrice",
            dataFields: ["limitPrice"],
            formatter: "formatPrice" /* StandardFormatterName.FormatPrice */,
        },
        {
            label: "Stop Price",
            alignment: "right",
            id: "stopPrice",
            dataFields: ["stopPrice"],
            formatter: "formatPrice" /* StandardFormatterName.FormatPrice */,
        },
        {
            label: "Last",
            alignment: "right",
            id: "last",
            dataFields: ["last"],
            formatter: "formatPriceForexSup" /* StandardFormatterName.FormatPriceForexSup */,
            highlightDiff: true,
        },
        {
            label: "Execution",
            id: "execution",
            dataFields: ["execution"],
        },
        {
            label: "Status",
            id: "status",
            dataFields: ["status"],
            formatter: "status" /* StandardFormatterName.Status */,
            supportedStatusFilters: [0 /* OrderStatusFilter.All */],
        },
        {
            label: "Order ID",
            id: "id",
            alignment: "left",
            dataFields: ["id"],
        },
    ];
    /**
     * Column structure for the "Positions" page
     */
    const positionsPageColumns = [
        {
            label: "Time",
            id: "time",
            dataFields: ["timeSetup"],
            formatter: "date" /* StandardFormatterName.Date */,
        },
        {
            label: "Symbol",
            formatter: "symbol" /* StandardFormatterName.Symbol */,
            id: "symbol" /* CommonAccountManagerColumnId.Symbol */,
            dataFields: ["symbolName", "symbolName", "message"],
        },
        {
            label: "Side",
            id: "side",
            dataFields: ["side"],
            formatter: "side" /* StandardFormatterName.Side */,
        },
        {
            label: "Volume",
            alignment: "right",
            id: "qty",
            dataFields: ["qty"],
            help: "Size in lots",
        },
        {
            label: "Open Price",
            alignment: "right",
            id: "avgPrice",
            dataFields: ["avgPrice"],
            formatter: "formatPrice" /* StandardFormatterName.FormatPrice */,
        },
        {
            label: "Current",
            alignment: "right",
            id: "last",
            dataFields: ["last"],
            formatter: "formatPriceForexSup" /* StandardFormatterName.FormatPriceForexSup */,
            highlightDiff: true,
        },
        {
            label: "Profit",
            alignment: "right",
            id: "pl",
            dataFields: ["pl"],
            formatter: "profit" /* StandardFormatterName.Profit */,
        },
        {
            label: "Stop Loss",
            alignment: "right",
            id: "stopLoss",
            dataFields: ["stopLoss"],
        },
        {
            label: "Take Profit",
            alignment: "right",
            id: "takeProfit",
            dataFields: ["takeProfit"],
        },
        {
            label: "Position ID",
            alignment: "left",
            id: "id",
            dataFields: ["id"],
        },
    ];
    /**
     * Column structure for the custom "Account Summary" page
     */
    const accountSummaryColumns = [
        {
            label: "Title",
            notSortable: true,
            id: "title",
            dataFields: ["title"],
            formatter: "custom_uppercase",
        },
        {
            label: "Balance",
            alignment: "right",
            id: "balance",
            dataFields: ["balance"],
            formatter: "fixed" /* StandardFormatterName.Fixed */,
        },
        {
            label: "Open PL",
            alignment: "right",
            id: "pl",
            dataFields: ["pl"],
            formatter: "profit" /* StandardFormatterName.Profit */,
            notSortable: true,
        },
        {
            label: "Equity",
            alignment: "right",
            id: "equity",
            dataFields: ["equity"],
            formatter: "fixed" /* StandardFormatterName.Fixed */,
            notSortable: true,
        },
    ];
    /**
     * Column structure for the "History" page
     */
    const historyPageColumns = [
        {
            label: "Time",
            id: "time",
            dataFields: ["timeSetup"],
            formatter: "date" /* StandardFormatterName.Date */,
        },
        {
            label: "Symbol",
            formatter: "symbol" /* StandardFormatterName.Symbol */,
            id: "symbol" /* CommonAccountManagerColumnId.Symbol */,
            dataFields: ["symbol", "symbol", "message"],
        },
        {
            label: "Side",
            id: "side",
            dataFields: ["side"],
            formatter: "side" /* StandardFormatterName.Side */,
        },
        {
            label: "Quantity",
            alignment: "right",
            id: "qty",
            dataFields: ["qty"],
            formatter: "fixed" /* StandardFormatterName.Fixed */,
        },
        {
            label: "Limit Price",
            alignment: "right",
            id: "limitPrice",
            dataFields: ["limitPrice"],
            formatter: "formatPrice" /* StandardFormatterName.FormatPrice */,
        },
        {
            label: "Stop Price",
            alignment: "right",
            id: "stopPrice",
            dataFields: ["stopPrice"],
            formatter: "formatPrice" /* StandardFormatterName.FormatPrice */,
        },
        {
            label: "Take Profit",
            alignment: "right",
            id: "takeProfit",
            dataFields: ["takeProfit"],
        },
        {
            label: "Status",
            id: "status",
            dataFields: ["status"],
            formatter: "status" /* StandardFormatterName.Status */,
        },
        {
            label: "Order ID",
            notSortable: true,
            id: "id",
            dataFields: ["id"],
        },
    ];

    async function makeApiRequest(path, params) {
        if (params !== undefined) {
            const paramKeys = Object.keys(params);
            if (paramKeys.length !== 0) {
                path += "?";
            }
            path += paramKeys
                .map((key) => {
                return `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toString())}`;
            })
                .join("&");
        }
        const headers = {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        };
        const response = await fetch(`${path}`, { headers: headers });
        return response.json();
    }
    async function makePostApiRequest(path, body) {
        const response = await fetch(`${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(body),
        });
        return response.json();
    }
    async function makeCRMApiRequest(path, body) {
        const response = await fetch(`${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("crm_token")}`,
            },
            body: JSON.stringify(body),
        });
        return response.json();
    }

    class BalanceEquityStreaming {
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

    /**
     * @module Make sure that you include Promise polyfill in your bundle to support old browsers
     * @see {@link https://caniuse.com/#search=Promise | Browsers with native Promise support}
     * @see {@link https://www.npmjs.com/package/promise-polyfill | Polyfill}
     */
    //   export const BASE_URL = "https://oponew-ehhgc5eudvg0fsa8.spaincentral-01.azurewebsites.net/";
    const BASE_URL = "https://opotrade.azurewebsites.net";
    const OPO_BASE_URL = "https://myaccount.opofinance.com";
    /**
     * Defines an array of order statuses, including only "Inactive" and "Working" statuses.
     * This variable is used to retrieve bracket orders associated with a parent ID in `_getBrackets` function.
     */
    const activeOrderStatuses = [3 /* OrderStatus.Inactive */, 6 /* OrderStatus.Working */];
    let loginNumber = 0;
    const LAST_USED_ACCOUNT_STORAGE_KEY = "lastUsedAccount";
    /**
     * The Broker API implementation.
     * The Broker API is a key component that enables trading.
     * Its main purpose is to connect TradingView charts with the trading logic.
     */
    class BrokerSample {
        // private subscriptions: Map<string, any>;
        constructor(host, quotesProvider, balanceEquityStreaming) {
            /** Defines the initial values for the custom "Account Summary" page in the Account Manager */
            this._accountManagerData = {
                title: "Trading Sample",
                balance: 10000000,
                equity: 10000000,
                pl: 0,
            };
            this._accountlist = [];
            this._positionlist = [];
            this._orderlist = [];
            this._orderHistorylist = [];
            this._symbolDigits = {};
            /** Initializes an empty map to store positions indexed by their IDs */
            this._positionById = {};
            /** Initializes an array to store position data */
            this._positions = [];
            /** Initializes an empty map to store orders indexed by their IDs */
            this._orderById = {};
            /** Initializes an array to store execution  data */
            this._executions = [];
            /** Initializes the counter to 1, used to assign unique IDs to orders and positions */
            this._idsCounter = 1;
            this.currentAccountSelected = null;
            this._activeSymbols = new Set();
            this._subscribedSymbols = new Set();
            this._accountSuffixes = new Map();
            /** Handles updates to the equity value by calling the `equityUpdate` method of the Trading Host */
            this._handleEquityUpdate = (value) => {
                this._host.equityUpdate(value);
            };
            this._quotesProvider = quotesProvider;
            this._host = host;
            this._balanceEquityStreaming = balanceEquityStreaming;
            this._plValue = this._host.factory.createWatchedValue(this._accountManagerData.pl);
            //   this.fetchAccountData();
            // this.subscriptions = new Map();
            // Create a delegate object
            this._amChangeDelegate = this._host.factory.createDelegate();
            // Create watched values for user's balance and equity
            this._balanceValue = this._host.factory.createWatchedValue(this._accountManagerData.balance);
            this._equityValue = this._host.factory.createWatchedValue(this._accountManagerData.equity);
            try {
                const storedAccountId = localStorage.getItem(LAST_USED_ACCOUNT_STORAGE_KEY);
                if (storedAccountId) {
                    this.currentAccountSelected = storedAccountId;
                }
            }
            catch (e) {
                console.error("Error accessing localStorage", e);
            }
            // Subscribe to updates on the user's balance and equity values in the Account Manager
            this._amChangeDelegate.subscribe(null, (values) => {
                this.updateWatchedValues(values);
            });
        }
        //   subscribeDOM?(symbol: string): void {
        //    throw new Error("Method not implemented.");
        //   }
        //   unsubscribeDOM?(symbol: string): void {
        //    throw new Error("Method not implemented.");
        //   }
        //   previewOrder?(order: PreOrder): Promise<OrderPreviewResult> {
        //    throw new Error("Method not implemented.");
        //   }
        //   closeIndividualPosition?(individualPositionId: string, amount?: number): Promise<void> {
        //    throw new Error("Method not implemented.");
        //   }
        //   leverageInfo?(leverageInfoParams: LeverageInfoParams): Promise<LeverageInfo> {
        //    throw new Error("Method not implemented.");
        //   }
        //   setLeverage?(leverageSetParams: LeverageSetParams): Promise<LeverageSetResult> {
        //    throw new Error("Method not implemented.");
        //   }
        //   previewLeverage?(leverageSetParams: LeverageSetParams): Promise<LeveragePreviewResult> {
        //    throw new Error("Method not implemented.");
        //   }
        //   subscribeMarginAvailable?(symbol: string): void {
        //    throw new Error("Method not implemented.");
        //   }
        //   subscribePipValue?(symbol: string): void {
        //    throw new Error("Method not implemented.");
        //   }
        //   unsubscribePipValue?(symbol: string): void {
        //    throw new Error("Method not implemented.");
        //   }
        //   unsubscribeMarginAvailable?(symbol: string): void {
        //    throw new Error("Method not implemented.");
        //   }
        //   individualPositions?(): Promise<IndividualPosition[]> {
        //    throw new Error("Method not implemented.");
        //   }
        //   formatter?(symbol: string, alignToMinMove: boolean): Promise<INumberFormatter> {
        //    throw new Error("Method not implemented.");
        //   }
        //   spreadFormatter?(symbol: string): Promise<INumberFormatter> {
        //    throw new Error("Method not implemented.");
        //   }
        //   quantityFormatter?(symbol: string): Promise<INumberFormatter> {
        //    throw new Error("Method not implemented.");
        //   }
        //   getOrderDialogOptions?(symbol: string): Promise<OrderDialogOptions | undefined> {
        //    throw new Error("Method not implemented.");
        //   }
        //   getPositionDialogOptions?(): PositionDialogOptions | undefined {
        //    throw new Error("Method not implemented.");
        //   }
        //   getSymbolSpecificTradingOptions?(symbol: string): Promise<SymbolSpecificTradingOptions | undefined> {
        //    throw new Error("Method not implemented.");
        //   }
        async ordersHistory() {
            await this.fetchOrderHistory();
            return Promise.resolve(this._orderHistorylist);
            // throw new Error("Method not implemented.");
        }
        async fetchOrderHistory() {
            if (loginNumber === 0) {
                console.warn("Login number is not set. Waiting...");
                await new Promise((resolve) => setTimeout(resolve, 500));
                console.error("Login number is still not set after waiting");
                return;
            }
            const response = await makeApiRequest(`${BASE_URL}/api/History/get_page?login=${loginNumber}&offset=0&total=1000&source=tv`);
            if (response.data) {
                this._orderHistorylist = response.data.map((item) => ({
                    ...item,
                    qty: item.qty / 10000, // Convert units to lots
                    timeSetup: item.timeSetup * 1000,
                }));
            }
            else {
                console.error("Failed to fetch order data:", response);
            }
        }
        handleWebSocketUpdates(values) {
            this._accountManagerData.balance = values.balance;
            this._accountManagerData.equity = values.equity;
            this._accountManagerData.pl = values.pl;
            this._amChangeDelegate.fire(this._accountManagerData);
        }
        // Update the watched balance and equity values
        updateWatchedValues(values) {
            this._balanceValue.setValue(values.balance);
            this._equityValue.setValue(values.equity);
            this._plValue.setValue(values.pl);
        }
        updateAccountData(newTitle, newBalance, newEquity, newPl) {
            this._accountManagerData.title = newTitle;
            this._accountManagerData.balance = newBalance;
            this._accountManagerData.equity = newEquity;
            this._accountManagerData.pl = newPl;
            this._balanceValue.setValue(newBalance);
            this._equityValue.setValue(newEquity);
            this._plValue.setValue(newPl);
            this._amChangeDelegate.fire(this._accountManagerData);
        }
        getAccountData() {
            return this._accountManagerData;
        }
        subscribeBalanceEquityData() {
            console.log("loginNumber", loginNumber);
            if (this._balanceEquityStreaming) {
                this._balanceEquityStreaming.close();
                this._balanceEquityStreaming.unsubscribe(this.handleWebSocketUpdates.bind(this));
            }
            // Set up the WebSocket connection to stream balance and equity
            this._balanceEquityStreaming = new BalanceEquityStreaming(loginNumber);
            // Subscribe to updates from the WebSocket stream
            this._balanceEquityStreaming.subscribe(this.handleWebSocketUpdates.bind(this));
        }
        fetchAccountManageerData() {
            this.fetchAccountData();
            this.fetchOrders();
            this.fetchPositions();
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
        // private removeSuffix(symbol: string): string {
        //   const suffix = this.getSuffix();
        //   if (suffix && symbol && symbol.endsWith(suffix)) {
        //     return symbol.slice(0, -suffix.length);
        //   }
        //   return symbol;
        // }
        async fetchUser() {
            var _a;
            const data = await makeCRMApiRequest(`${OPO_BASE_URL}/client-api/accounts?version=1.0.0`);
            if (Array.isArray(data)) {
                const filteredAccounts = data.filter((account) => account.type.id === 57 ||
                    account.type.id === 58 ||
                    account.type.id === 59 ||
                    account.type.id === 60 ||
                    account.type.id === 61 ||
                    account.type.id === 62 ||
                    account.type.id === 63 ||
                    account.type.id === 64 ||
                    account.type.id === 65 ||
                    account.type.id === 66 ||
                    account.type.id === 67);
                loginNumber = parseInt(filteredAccounts[0].login);
                this.subscribeBalanceEquityData();
                this.fetchAccountManageerData();
                this._accountlist = filteredAccounts.map((account) => {
                    var _a, _b;
                    const suffix = (_a = BrokerSample.accountTypeIdToSuffixMap[account.type.id]) !== null && _a !== void 0 ? _a : "";
                    this._accountSuffixes.set(account.login, suffix);
                    return {
                        id: account.login,
                        name: `${((_b = account.type) === null || _b === void 0 ? void 0 : _b.description) || "Account"} ${account.login}`,
                    };
                });
                // Check if the stored account ID is among the fetched accounts
                let accountToUse = this.currentAccountSelected;
                if (!this._accountlist.find((account) => account.id === accountToUse)) {
                    // If not found, use the first account
                    accountToUse = (_a = this._accountlist[0]) === null || _a === void 0 ? void 0 : _a.id;
                }
                this.currentAccountSelected = accountToUse;
                loginNumber = parseInt(accountToUse);
                // Now fetch account data for the selected account
                this.subscribeBalanceEquityData();
                this.fetchAccountManageerData();
                console.log("Filtered account logins:", this._accountlist);
            }
            else {
                console.error("Unexpected response format:", data);
            }
        }
        async fetchAccountData() {
            if (loginNumber === 0) {
                console.warn("Login number is not set. Waiting...");
                await new Promise((resolve) => setTimeout(resolve, 500));
                console.error("Login number is still not set after waiting");
                return;
            }
            const response = await makeApiRequest(`${BASE_URL}/api/User/get_trade_state?login=${loginNumber}&source=tv`);
            if (response.data) {
                console.log("fetchAccountData", response.data);
                const { data } = response;
                this.updateAccountData(data.title, data.balance, data.equity, data.pl);
                this._host.currentAccountUpdate();
            }
            else {
                console.error("Failed to fetch account data:", response);
            }
        }
        async fetchPositions() {
            if (loginNumber === 0) {
                console.warn("Login number is not set. Waiting...");
                await new Promise((resolve) => setTimeout(resolve, 500));
                console.error("Login number is still not set after waiting");
                return;
            }
            console.log("fetchPositions");
            const response = await makeApiRequest(`${BASE_URL}/api/Position/get_page?login=${loginNumber}&offset=0&total=1000&source=tv`);
            if (response.data) {
                this._positionlist = response.data.map((item) => ({
                    id: item.id.toString(),
                    symbol: "Opofinance:" + item.symbol,
                    symbolName: item.symbol,
                    side: item.side === 1 ? 1 : -1,
                    qty: item.qty / 10000,
                    avgPrice: item.price,
                    profit: item.profit,
                    timeSetup: item.timeCreate * 1000,
                }));
                console.log("fetchPositions", this._positionlist);
            }
            else {
                console.error("Failed to fetch positions data:", response);
            }
        }
        async fetchOrders() {
            if (loginNumber === 0) {
                console.warn("Login number is not set. Waiting...");
                await new Promise((resolve) => setTimeout(resolve, 500));
                console.error("Login number is still not set after waiting");
                return;
            }
            const response = await makeApiRequest(`${BASE_URL}/api/Order/get_page?login=${loginNumber}&offset=0&total=1000&source=tv`);
            if (response.data) {
                this._orderlist = response.data.map((item) => ({
                    ...item,
                    symbol: "Opofinance:" + item.symbol,
                    symbolName: item.symbol,
                    qty: item.qty / 10000, // Convert units to lots
                    timeSetup: item.timeSetup * 1000,
                }));
            }
            else {
                console.error("Failed to fetch order data:", response);
            }
        }
        /**
         * Subscribes to updates of the equity value.
         * The library calls this method when users open Order Ticket.
         */
        subscribeEquity() {
            this._equityValue.subscribe(this._handleEquityUpdate, {
                callWithLast: true,
            });
        }
        /**
         * Unsubscribes from updates of the equity value.
         * The library calls this method when users close Order Ticket.
         */
        unsubscribeEquity() {
            this._equityValue.unsubscribe(this._handleEquityUpdate);
        }
        /**
         * Defines the connection status for the Broker API.
         * If any other value than `1` ("Connected") is returned, the Account Manager will display an endless spinner.
         */
        connectionStatus() {
            return 1 /* ConnectionStatus.Connected */;
        }
        /**
         * Returns an array of `ActionMetaInfo` elements by calling the `defaultContextMenuActions` method of the Trading Host.
         * Each `ActionMetaInfo` element represents one context menu item.
         *
         * The library calls `chartContextMenuActions` when users open the context menu on the chart.
         * This method also renders the "Trade" button in the context menu.
         */
        chartContextMenuActions(context, options) {
            return this._host.defaultContextMenuActions(context);
        }
        /**
         * Checks if a symbol can be traded.
         * In this sample, `isTradable` is a mock function that always returns `true`, meaning that all symbols can be traded.
         */
        isTradable(symbol) {
            return Promise.resolve(true);
        }
        // Map TradingView OrderType to your API action and type
        mapOrderTypeToActionAndType(orderType, side) {
            let action = "";
            let type = 0;
            if (orderType === 2 /* OrderType.Market */) {
                action = "200";
                type = side === 1 ? 0 : 1; // 0 for Buy Market, 1 for Sell Market
            }
            else if (orderType === 1 /* OrderType.Limit */) {
                action = "201";
                type = side === 1 ? 2 : 3; // 2 for Buy Limit, 3 for Sell Limit
            }
            else if (orderType === 3 /* OrderType.Stop */) {
                action = "201";
                type = side === 1 ? 4 : 5; // 4 for Buy Stop, 5 for Sell Stop
            }
            else {
                throw new Error("Unsupported order type");
            }
            return { action, type };
        }
        // Places an order and returns an object with the order ID.
        // The library calls this method when users place orders in the UI.
        async placeOrder(preOrder) {
            console.log("placeOrder", preOrder);
            const symbolWithSuffix = this.appendSuffix(preOrder.symbol);
            try {
                // Map the order type and side to your API parameters
                const { action, type } = this.mapOrderTypeToActionAndType(preOrder.type, preOrder.side);
                // Validate required fields
                if (!preOrder.symbol || !preOrder.qty) {
                    throw new Error("Symbol and quantity are required");
                }
                let digits = this._symbolDigits[preOrder.symbol];
                // Construct the payload
                const payload = {
                    action: action,
                    login: Number(this.currentAccountSelected),
                    symbol: symbolWithSuffix.includes(":")
                        ? symbolWithSuffix.split(":")[1]
                        : symbolWithSuffix,
                    volume: preOrder.qty * 10000,
                    typeFill: preOrder.type === 2 /* OrderType.Market */ ? 0 : 2, // 0 for Market, 2 for Pending Orders
                    type: type,
                    digits: digits,
                    source: "tv",
                    position: preOrder.positionId,
                    priceTrigger: 0,
                };
                // For pending orders, add additional fields
                if (preOrder.type === 1 /* OrderType.Limit */ ||
                    preOrder.type === 3 /* OrderType.Stop */) {
                    // Ensure price is provided
                    const price = preOrder.limitPrice || preOrder.stopPrice;
                    if (!price) {
                        throw new Error("Price is required for limit and stop orders");
                    }
                    payload.priceOrder = price;
                    // payload.digits = 5; // Adjust as necessary
                    payload.typetime = 0; // As per your API requirements
                }
                //for bracket orders
                if (preOrder.takeProfit !== undefined ||
                    preOrder.stopLoss !== undefined) {
                    payload.priceSL = preOrder.stopLoss || 0;
                    payload.priceTP = preOrder.takeProfit || 0;
                }
                // Send the request to your API
                const response = await this.sendRequest(payload);
                // Handle the API response
                if (response && response.success) {
                    const responseData = response.data;
                    const orderId = responseData.id.toString();
                    // Create an order object to represent the new order
                    const result = {
                        id: orderId,
                        symbol: responseData.symbol,
                        side: preOrder.side,
                        qty: responseData.qty / 10000,
                        type: responseData.type,
                        filledQty: responseData.filledQty / 10000,
                        avgPrice: responseData.avgPrice,
                        limitPrice: responseData.limitPrice,
                        stopPrice: responseData.stopPrice,
                        status: responseData.status === 2
                            ? 6 /* OrderStatus.Working */
                            : 5 /* OrderStatus.Rejected */,
                        // status: (responseData.status === 5 || responseData.status === 2 ? 2 : responseData.status),
                        stopLoss: responseData.stopLoss,
                        takeProfit: responseData.takeProfit,
                        // parentId: preOrder.positionId,
                        // Include any additional fields from responseData as needed
                    };
                    // Update internal order storage
                    if (preOrder.takeProfit !== undefined ||
                        preOrder.stopLoss !== undefined) {
                        const orders = this._createOrderWithBrackets(result);
                        orders.forEach((order) => {
                            this._updateOrder({ ...order, timeSetup: Date.now() });
                        });
                    }
                    else {
                        if (preOrder.positionId) {
                            const position = {
                                ...result,
                                id: preOrder.positionId.toString(),
                                qty: 0,
                                status: 2 /* OrderStatus.Filled */,
                                timeSetup: Date.now()
                            };
                            this._updatePosition(position);
                        }
                        else {
                            this._updateOrder({ ...result, timeSetup: Date.now() });
                        }
                    }
                    return { orderId };
                }
                else {
                    // Handle errors
                    const errorMessage = response ? response.message : "Unknown error";
                    console.error("Failed to place order:", errorMessage);
                    return Promise.reject(new Error(errorMessage));
                }
            }
            catch (error) {
                console.error("Error in placeOrder:", error);
                return Promise.reject(error);
            }
        }
        /**
         * Modifies an existing order.
         * The library calls this method when a user wants to modify an existing order.
         */
        async modifyOrder(order) {
            const symbolWithSuffix = this.appendSuffix(order.symbol);
            // Retrieve the order from `_orderById` map
            const originalOrder = this._orderById[order.id];
            if (originalOrder === undefined) {
                console.error("Original order not found:", order.id);
                return;
            }
            try {
                //  // Map the order type and side to your API parameters
                //  const { action } = this.mapOrderTypeToActionAndType(
                //   order.type,
                //   order.side
                // );
                const body = {
                    action: "203",
                    order: parseInt(order.id),
                    externalID: "",
                    login: this.currentAccountSelected,
                    symbol: symbolWithSuffix.includes(":")
                        ? symbolWithSuffix.split(":")[1]
                        : symbolWithSuffix,
                    priceOrder: order.limitPrice,
                    priceSL: order.stopLoss === undefined ? 0 : order.stopLoss,
                    priceTP: order.takeProfit === undefined ? 0 : order.takeProfit,
                    volumeInitial: order.qty * 10000,
                    digits: 5,
                };
                const response = await this.modifyOrderApi(body);
                if (response && response.success) {
                    // Create an order object to represent the new order
                    const responseData = response.data;
                    const modifiedOrder = {
                        id: responseData.order.toString(),
                        symbol: order.symbol.includes(":")
                            ? order.symbol.split(":")[1]
                            : order.symbol,
                        side: order.side,
                        qty: responseData.volumeInitial / 10000,
                        type: order.type,
                        limitPrice: order.limitPrice,
                        stopPrice: order.stopPrice,
                        avgPrice: responseData.last,
                        status: responseData.order === "0"
                            ? 5 /* OrderStatus.Rejected */
                            : 6 /* OrderStatus.Working */, // Adjust based on your API's response
                        // Include any additional fields from responseData as needed
                    };
                    // Update internal order storage
                    this._orderById[order.id] = {
                        ...modifiedOrder,
                        symbolName: modifiedOrder.symbol,
                    };
                    this._host.orderUpdate({
                        ...modifiedOrder,
                        symbolName: modifiedOrder.symbol,
                    });
                }
                else {
                    // Handle errors
                    const errorMessage = response ? response.message : "Unknown error";
                    console.error("Failed to place order:", errorMessage);
                    return Promise.reject(new Error(errorMessage));
                }
            }
            catch (error) {
                console.error("API error modifying order:", error);
                return Promise.reject(new Error(error.message));
            }
            // If the order has no parent, it may be a standalone order or a parent of brackets
            if (order.parentId !== undefined) {
                return;
            }
            // Get the take-profit and stop-loss brackets associated with this order
            const takeProfitBracket = this._getTakeProfitBracket(order);
            const stopLossBracket = this._getStopLossBracket(order);
            // Update the object of the take-profit bracket order
            this._updateOrdersBracket({
                parent: order,
                bracket: takeProfitBracket,
                newPrice: order.takeProfit,
                bracketType: 1 /* BracketType.TakeProfit */,
            });
            // Update the object of the stop-loss bracket order
            this._updateOrdersBracket({
                parent: order,
                bracket: stopLossBracket,
                newPrice: order.stopLoss,
                bracketType: 0 /* BracketType.StopLoss */,
            });
        }
        /** Helper method for calling the broker's API to modify the order */
        async modifyOrderApi(body) {
            try {
                const response = await makePostApiRequest(`${BASE_URL}/api/Order/update_order`, body);
                return response; // Return the broker's response
            }
            catch (error) {
                throw new Error("Failed to modify order: " + error.message);
            }
        }
        editIndividualPositionBrackets(positionId, modifiedBrackets) {
            console.log("placeOrder editIndividualPositionBrackets", positionId, modifiedBrackets);
            return Promise.resolve();
        }
        /**
         * Enables a dialog that allows adding bracket orders to a position.
         * The library calls this method when users modify existing position with bracket orders.
         */
        async editPositionBrackets(positionId, modifiedBrackets) {
            var _a, _b;
            console.log("placeOrder editPositionBrackets", positionId, modifiedBrackets);
            // Retrieve the position object using its ID
            const position = this._positionById[positionId];
            // Retrieve all brackets associated with this position
            const positionBrackets = this._getBrackets(positionId);
            // Create a modified position object based on the original position
            const modifiedPosition = { ...position };
            const symbolWithSuffix = this.appendSuffix(modifiedPosition.symbol); // Add this line
            // Map the order type and side to your API parameters
            //  const { action } = this.mapOrderTypeToActionAndType(
            //   modifiedPosition.type,
            //   modifiedPosition.side
            // );
            const body = {
                action: "203",
                position: parseInt(positionId),
                externalID: "",
                login: loginNumber,
                symbol: symbolWithSuffix.split(":")[1],
                // priceOrder: modifiedPosition.seenPrice,
                priceSL: modifiedBrackets.stopLoss === undefined ? 0 : modifiedBrackets.stopLoss,
                priceTP: modifiedBrackets.takeProfit === undefined
                    ? 0
                    : modifiedBrackets.takeProfit,
                volumeInitial: modifiedPosition.qty * 10000,
                digits: 5,
            };
            const response = await this.editPositionsApi(body);
            console.log("placeOrder edit data", response.data);
            const result = response.data;
            if (response && response.success) {
                (_a = modifiedPosition.takeProfit) !== null && _a !== void 0 ? _a : (modifiedPosition.takeProfit = modifiedBrackets.takeProfit);
                (_b = modifiedPosition.stopLoss) !== null && _b !== void 0 ? _b : (modifiedPosition.stopLoss = modifiedBrackets.stopLoss);
                modifiedPosition.symbol = symbolWithSuffix.split(":")[1];
                modifiedPosition.qty = result.volumeInitial / 10000;
                modifiedPosition.symbolName = result.symbol;
                console.log("modifiedPosition", modifiedPosition);
                this._updatePosition({ ...modifiedPosition });
            }
            else {
                // Handle errors
                const errorMessage = response ? response.message : "Unknown error";
                console.error("Failed to place order:", errorMessage);
                return Promise.reject(new Error(errorMessage));
            }
            // Update take-profit and stop-loss prices in the modified position object if they are provided
            // Find the take-profit and stop-loss brackets from the position's brackets
            const takeProfitBracket = positionBrackets.find((bracket) => bracket.limitPrice !== undefined);
            const stopLossBracket = positionBrackets.find((bracket) => bracket.stopPrice !== undefined);
            // Update the object of the take-profit bracket order
            this._updatePositionsBracket({
                parent: modifiedPosition,
                bracket: takeProfitBracket,
                bracketType: 1 /* BracketType.TakeProfit */,
                newPrice: modifiedBrackets.takeProfit,
            });
            // Update the object of the stop-loss bracket order
            this._updatePositionsBracket({
                parent: modifiedPosition,
                bracket: stopLossBracket,
                bracketType: 0 /* BracketType.StopLoss */,
                newPrice: modifiedBrackets.stopLoss,
            });
        }
        async editPositionsApi(body) {
            try {
                const response = await makePostApiRequest(`${BASE_URL}/api/Position/update_position`, body);
                return response; // Return the broker's response
            }
            catch (error) {
                throw new Error("Failed to edit position: " + error.message);
            }
        }
        /** Closes a position by the specified ID */
        async closePosition(positionId) {
            const position = this._positionById[positionId];
            const symbolWithSuffix = this.appendSuffix(position.symbol);
            // Check if the position exists
            if (!position) {
                return Promise.reject(new Error("Position not found"));
            }
            const handler = () => {
                this.placeOrder({
                    symbol: symbolWithSuffix,
                    side: position.side === -1 /* Side.Sell */ ? 1 /* Side.Buy */ : -1 /* Side.Sell */,
                    type: 2 /* OrderType.Market */,
                    qty: position.qty,
                    positionId: parseInt(positionId),
                });
            };
            await handler();
        }
        /** Returns users's active orders */
        async orders() {
            if (this.currentAccountSelected) {
                await this.fetchOrders();
            }
            return this._orders();
        }
        /** Returns user's positions */
        async positions() {
            if (this.currentAccountSelected) {
                await this.fetchPositions();
            }
            if (this._positionlist.length > 0) {
                this._positionlist.forEach((position) => {
                    // this._positionById[position.id] = position;
                    // Check if this position is new or updated before processing
                    const existingPosition = this._positionById[position.id];
                    // If position does not exist or is updated, call _updatePosition()
                    if (!existingPosition ||
                        existingPosition.qty !== position.qty ||
                        existingPosition.price !== position.price) {
                        this._updatePosition(position);
                        console.log("position", position);
                    }
                });
            }
            return Promise.resolve(this._positionlist.slice());
        }
        /** Returns executions for the specified symbol */
        executions(symbol) {
            return Promise.resolve(this._executions.filter((data) => {
                return data.symbol === symbol;
            }));
        }
        /** Reverses the side of a position */
        async reversePosition(positionId) {
            console.log("reversePosition", positionId);
            const position = this._positionById[positionId];
            const symbolWithSuffix = this.appendSuffix(position.symbol);
            // Check if the position exists
            if (!position) {
                return Promise.reject(new Error("Position not found"));
            }
            const handler = () => {
                return this.placeOrder({
                    symbol: symbolWithSuffix,
                    side: position.side === -1 /* Side.Sell */ ? 1 /* Side.Buy */ : -1 /* Side.Sell */,
                    type: 2 /* OrderType.Market */,
                    qty: position.qty * 2,
                    positionId: parseInt(positionId),
                });
            };
            await handler();
        }
        /** Cancels a single order with a given ID */
        cancelOrder(orderId) {
            const order = this._orderById[orderId];
            // Check if the order exists
            if (!order) {
                console.error("Order not found for cancellation:", orderId);
                return Promise.reject(new Error("Order not found"));
            }
            // Define a function that will cancel the order and its brackets
            const handler = async () => {
                try {
                    // Update the order status to "Placing" while the API call is being made
                    order.status = 4 /* OrderStatus.Placing */;
                    this._updateOrder(order);
                    // Make API call to broker to cancel the order
                    const response = await this.cancelOrderApi(orderId);
                    if (response.success) {
                        // Update the order status to Canceled in TradingView
                        order.status = 1 /* OrderStatus.Canceled */;
                        order.id = orderId.toString();
                        this._updateOrder(order);
                        // return Promise.resolve();
                    }
                    else {
                        // Handle broker's API failure response
                        console.error("Failed to cancel order:", response.message);
                        order.status = 5 /* OrderStatus.Rejected */;
                        this._updateOrder(order);
                        return Promise.reject(new Error(response.message));
                    }
                }
                catch (error) {
                    // Handle any errors from the API call itself
                    console.error("Error canceling order via API:", error);
                    order.status = 5 /* OrderStatus.Rejected */;
                    this._updateOrder(order);
                    return Promise.reject(new Error(error.message));
                }
            };
            // Cancel associated bracket orders if any exist
            this._getBrackets(order.id).forEach((bracket) => {
                this.cancelOrder(bracket.id);
            });
            return handler();
        }
        /** Helper method for calling the broker's API to cancel the order */
        async cancelOrderApi(orderId) {
            try {
                // Replace with your actual broker's cancel API endpoint and payload structure
                const response = await makeApiRequest(`${BASE_URL}/api/Order/cancel?ticket=${orderId}`);
                return response; // Return the broker's response
            }
            catch (error) {
                throw new Error("Failed to cancel order: " + error.message);
            }
        }
        /** Cancels multiple orders for a symbol and side */
        cancelOrders(symbol, side, ordersIds) {
            const closeHandler = () => {
                return Promise.all(ordersIds.map((orderId) => {
                    return this.cancelOrder(orderId);
                })).then(() => { }); // tslint:disable-line:no-empty
            };
            return closeHandler();
        }
        /** Builds the Account Manager that displays trading information */
        accountManagerInfo() {
            // Data object for the "Account Summary" row
            const summaryProps = [
                {
                    text: "Balance",
                    wValue: this._balanceValue,
                    formatter: "fixed" /* StandardFormatterName.Fixed */, // Default value
                    isDefault: true,
                },
                {
                    text: "Equity",
                    wValue: this._equityValue,
                    formatter: "fixed" /* StandardFormatterName.Fixed */, // Default value
                    isDefault: true,
                },
                {
                    text: "P/L",
                    wValue: this._plValue,
                    formatter: "profit" /* StandardFormatterName.Profit */,
                    isDefault: true,
                },
            ];
            return {
                accountTitle: "OPO Trade",
                // Custom fields that are displayed in the "Account Summary" row
                summary: summaryProps,
                // Columns that build the "Orders" page
                orderColumns: ordersPageColumns,
                // Columns that build the "Positions" page
                positionColumns: positionsPageColumns,
                // Columns that build the custom "Account Summary" page
                historyColumns: historyPageColumns,
                // Columns that build the custom "History" page
                pages: [
                    {
                        id: "accountsummary",
                        title: "Account Summary",
                        tables: [
                            {
                                id: "accountsummary",
                                columns: accountSummaryColumns,
                                getData: () => {
                                    return Promise.resolve([this._accountManagerData]);
                                },
                                initialSorting: {
                                    property: "balance",
                                    asc: false,
                                },
                                changeDelegate: this._amChangeDelegate,
                            },
                        ],
                    },
                ],
                // Function to create a custom context menu in the Account Manager
                contextMenuActions: (contextMenuEvent, activePageActions) => {
                    return Promise.resolve(this._bottomContextMenuItems(activePageActions));
                },
            };
        }
        /**
         * Returns symbol information.
         * The library calls this method when users open the Order Ticket or DOM panel.
         */
        async symbolInfo(symbol) {
            const mintick = await this._host.getSymbolMinTick(symbol);
            const pipSize = mintick; // Pip size can differ from minTick
            const accountCurrencyRate = 1; // Account currency rate
            const pointValue = 1; // USD value of 1 point of price
            return {
                qty: {
                    min: 0.01,
                    max: 50,
                    step: 0.01,
                },
                pipValue: pipSize * pointValue * accountCurrencyRate || 1,
                pipSize: pipSize,
                minTick: mintick,
                description: "",
                units: "Lots",
            };
        }
        /** Represents a mock function for a current account by returning an account ID '1' */
        currentAccount() {
            var _a;
            if (this.currentAccountSelected === undefined) {
                this.currentAccountSelected = (_a = this._accountlist[0]) === null || _a === void 0 ? void 0 : _a.id;
            }
            return this.currentAccountSelected;
        }
        /** Represents a mock function and returns information about the account with an ID '1' */
        async accountsMetainfo() {
            var _a;
            console.log("sequence accountsMetainfo");
            if (this._accountlist.length === 0) {
                await this.fetchUser();
            }
            if (this.currentAccountSelected == undefined) {
                this.currentAccountSelected = (_a = this._accountlist[0]) === null || _a === void 0 ? void 0 : _a.id;
            }
            return [...this._accountlist];
        }
        setCurrentAccount(id) {
            this.currentAccountSelected = id;
            loginNumber = parseInt(id);
            this.fetchAccountData();
            //close socket connection & reinitialize with new loginNumber
            this.restartSocketForGetSelectedAccount();
            this._host.currentAccountUpdate();
            const suffix = this._accountSuffixes.get(id) || "";
            try {
                localStorage.setItem("suffix", suffix);
            }
            catch (e) {
                console.error("Error accessing localStorage", e);
            }
            try {
                localStorage.setItem(LAST_USED_ACCOUNT_STORAGE_KEY, id);
            }
            catch (e) {
                console.error("Error accessing localStorage", e);
            }
        }
        restartSocketForGetSelectedAccount() {
            this._balanceEquityStreaming.close();
            this._balanceEquityStreaming.unsubscribe(this.handleWebSocketUpdates.bind(this));
            this._balanceEquityStreaming = new BalanceEquityStreaming(loginNumber);
            this._balanceEquityStreaming.subscribe(this.handleWebSocketUpdates.bind(this));
        }
        /** Creates custom items in the Account Manager context menu */
        _bottomContextMenuItems(activePageActions) {
            const separator = { separator: true };
            const sellBuyButtonsVisibility = this._host.sellBuyButtonsVisibility();
            if (activePageActions.length) {
                activePageActions.push(separator);
            }
            return activePageActions.concat([
                // Create button that modifies the visibility of the "Sell" and "Buy" buttons
                {
                    text: "Show Buy/Sell Buttons",
                    action: () => {
                        if (sellBuyButtonsVisibility) {
                            sellBuyButtonsVisibility.setValue(!sellBuyButtonsVisibility.value());
                        }
                    },
                    checkable: true,
                    checked: sellBuyButtonsVisibility !== null && sellBuyButtonsVisibility.value(),
                },
                // Create button that opens "Chart settings → Trading" dialog
                {
                    text: "Trading Settings...",
                    action: () => {
                        this._host.showTradingProperties();
                    },
                },
            ]);
        }
        /** Creates a position for a particular order and returns a position data object */
        _createPositionForOrder(order) {
            // Create the position ID from the order's symbol
            const positionId = order.symbol;
            // Retrieve existing position object by ID if it exists
            let position = this._positionById[positionId];
            // Extract order side and quantity
            const orderSide = order.side;
            const orderQty = order.qty;
            // Check whether the order is a bracket order
            const isPositionClosedByBracket = order.parentId !== undefined;
            order.avgPrice = order.price;
            // Update the position object if it already exists, otherwise create a new one
            if (position) {
                // Compare new order and existing position sides
                const sign = order.side === position.side ? 1 : -1;
                // Calculate average price based on the order and position sides: "Buy" or "Sell"
                if (sign > 0) {
                    position.avgPrice =
                        (position.qty * position.avgPrice + order.qty * order.price) /
                            (position.qty + order.qty);
                }
                else {
                    position.avgPrice = position.avgPrice;
                    const amountToClose = Math.min(orderQty, position.qty);
                    this._accountManagerData.balance +=
                        (order.price - position.avgPrice) *
                            amountToClose *
                            (position.side === -1 /* Side.Sell */ ? -1 : 1);
                }
                // Recalculate position quantity
                position.qty = position.qty + order.qty * sign;
                // Get an array of bracket orders associated with the position ID
                const brackets = this._getBrackets(position.id);
                // Check the position quantity: whether it is closed
                if (position.qty <= 0) {
                    brackets.forEach((bracket) => {
                        // If the executed order is a bracket order, set its status to "Filled"
                        if (isPositionClosedByBracket) {
                            this._setFilledStatusAndUpdate(bracket);
                            return;
                        }
                        // For other orders, set their status to "Canceled"
                        this._setCanceledStatusAndUpdate(bracket);
                    });
                    // Change position side and reverse the quantity sign from negative to positive
                    position.side = changeSide(position.side);
                    position.qty *= -1;
                }
                else {
                    /*
                                      If the position quantity is positive (which indicates the position is open),
                                      go through brackets and update their side and quantity to match the position's side and quantity.
                                      */
                    brackets.forEach((bracket) => {
                        bracket.side = changeSide(position.side);
                        bracket.qty = position.qty;
                        this._updateOrder(bracket);
                    });
                }
            }
            else {
                // Create a new position object if it doesn't exist
                position = {
                    ...order,
                    id: order.id,
                    avgPrice: order.price,
                };
            }
            // Create execution object for executed order
            const execution = {
                id: `${this._idsCounter++}`,
                brokerSymbol: order.brokerSymbol,
                price: order.price,
                qty: orderQty,
                side: orderSide,
                symbol: order.symbol,
                time: Date.now(),
            };
            // Update executions list and notify the library about execution update
            this._executions.push(execution);
            this._host.executionUpdate(execution);
            // Update position and Account Manager data
            this._updatePosition(position);
            // this._recalculateAMData();
            // Notify the library about "Profit and loss" updates
            this._host.plUpdate(position.symbol, position.profit);
            this._host.positionPartialUpdate(position.id, position);
            // Recalculate values in the Account Manager
            // this._recalculateAMData();
            return position;
        }
        /**
         * Updates order objects by calling the `orderPartialUpdate` method of the Trading Host.
         * `orderPartialUpdate` is used if the Account Manager has custom columns.
         * In this example, the Account Manager has the custom column called "Last".
         */
        _updateOrderLast(order) {
            this._host.orderPartialUpdate(order.id, { last: order.last });
        }
        /** Retrieves all orders stored in the `_orderById` map and returns an array containing all orders */
        _orders() {
            //  Object.values(this._orderById);
            if (this._orderlist.length > 0) {
                this._orderlist.forEach((order) => {
                    // this._orderById[order.id] = order;
                    // Check if this order is new or updated before processing
                    const existingOrder = this._orderById[order.id];
                    // If the order does not exist or has been modified, call _updateOrder()
                    if (!existingOrder ||
                        existingOrder.qty !== order.qty ||
                        existingOrder.price !== order.price) {
                        this._updateOrder(order);
                        console.log("orders", order);
                    }
                });
            }
            return Object.values(this._orderById);
        }
        async sendRequest(body) {
            try {
                const response = await makePostApiRequest(`${BASE_URL}/api/Trade/send_request`, body);
                return response;
            }
            catch (error) {
                console.error("[sendRequest]:  error=", error);
            }
        }
        _updateOrder(order) {
            console.log("placeOrder _updateOrder 1", order);
            const hasOrderAlready = Boolean(this._orderById[order.id]);
            this._orderById[order.id] = {
                ...order,
                symbolName: this.getSymbolName(order.symbol),
            };
            if (!hasOrderAlready) {
                this._activeSymbols.add(order.symbol);
                this._ensureRealtimeSubscription(order.symbol);
            }
            this._host.orderUpdate({
                ...order,
                symbolName: this.getSymbolName(order.symbol),
                timeSetup: Date.now()
            });
            if (order.parentId !== undefined) {
                const entity = order.parentType === 2 /* ParentType.Position */
                    ? this._positionById[order.parentId]
                    : this._orderById[order.parentId];
                if (entity === undefined) {
                    return;
                }
                if (order.limitPrice !== undefined) {
                    entity.takeProfit =
                        order.status !== 1 /* OrderStatus.Canceled */ ? order.limitPrice : undefined;
                }
                if (order.stopPrice !== undefined) {
                    entity.stopLoss =
                        order.status !== 1 /* OrderStatus.Canceled */ ? order.stopPrice : undefined;
                }
                if (order.parentType === 2 /* ParentType.Position */) {
                    return this._updatePosition(({ ...entity, timeSetup: order.timeSetup }));
                }
                this._updateOrder({ ...entity, timeSetup: order.timeSetup });
            }
        }
        /** Updates a given position */
        _updatePosition(position) {
            const hasPositionAlready = Boolean(this._positionById[position.id]);
            if (position.timeSetup == undefined) {
                position.timeSetup = Date.now();
            }
            if (hasPositionAlready && !position.qty) {
                // Remove symbol from active symbols set if no more orders or positions use it
                if (!this._isSymbolUsed(position.symbol)) {
                    this._activeSymbols.delete(position.symbol);
                    this._unsubscribeRealtimeIfNeeded(position.symbol);
                }
                const index = this._positions.indexOf(position);
                if (index !== -1) {
                    this._positions.splice(index, 1);
                }
                delete this._positionById[position.id];
                this._host.positionUpdate(position);
                return;
            }
            if (!hasPositionAlready) {
                this._positions.push(position);
                this._activeSymbols.add(position.symbol);
                // Subscribe to real-time updates for the symbol
                this._ensureRealtimeSubscription(position.symbol);
            }
            this._positionById[position.id] = position;
            this._host.positionUpdate(position);
        }
        _ensureRealtimeSubscription(symbol) {
            if (!this._isSubscribedToRealtime(symbol)) {
                this.subscribeRealtime(symbol);
            }
        }
        _unsubscribeRealtimeIfNeeded(symbol) {
            if (!this._isSymbolUsed(symbol) && this._isSubscribedToRealtime(symbol)) {
                this.unsubscribeRealtime(symbol);
            }
        }
        _isSymbolUsed(symbol) {
            // Check if any orders or positions are using the symbol
            return (Object.values(this._orderById).some((order) => order.symbol === symbol) ||
                Object.values(this._positionById).some((position) => position.symbol === symbol));
        }
        _isSubscribedToRealtime(symbol) {
            return this._subscribedSymbols.has(symbol);
        }
        /** Subscribes to receive real-time quotes for a specific symbol */
        // private _subscribeData(
        //   symbol: string,
        //   id: string,
        //   updateFunction: (last: number) => void
        // ): void {
        //   this._quotesProvider.subscribeQuotes(
        //     [],
        //     [symbol],
        //     (symbols: QuoteData[]) => {
        //       const deltaData = symbols[0];
        //       if (deltaData.s !== "ok") {
        //         return;
        //       }
        //       if (typeof deltaData.v.lp === "number") {
        //         updateFunction(deltaData.v.lp);
        //       }
        //     },
        //     getDatafeedSubscriptionId(id)
        //   );
        // }
        /** Unsubscribes the data listener associated with the provided ID from receiving real-time quote updates */
        // private _unsubscribeData(id: string): void {
        //   this._quotesProvider.unsubscribeQuotes(getDatafeedSubscriptionId(id));
        // }
        _mapQuoteValuesToTradingQuotes(quoteValues) {
            return {
                bid: quoteValues.bid,
                ask: quoteValues.ask,
                bid_size: quoteValues.bid_size,
                ask_size: quoteValues.ask_size,
                trade: quoteValues.last_price || quoteValues.lp, // Use 'lp' or 'last_price' for the last price
                size: quoteValues.volume,
                // spread: quoteValues.spread,
                // Map any other necessary fields
                // For example:
                // ch: quoteValues.ch,
                // chp: quoteValues.chp,
                // isDelayed: quoteValues.isDelayed,
                // isHalted: quoteValues.isHalted,
            };
        }
        subscribeRealtime(symbol) {
            const adjustedSymbol = this.appendSuffix(symbol.includes(":") ? symbol.split(":")[1] : symbol);
            const subscriptionId = getDatafeedSubscriptionId(`realtime-${symbol}`);
            // Subscribe to the datafeed
            this._quotesProvider.subscribeQuotes([], [adjustedSymbol], (quotes) => {
                const quoteData = quotes[0];
                if (quoteData.s !== "ok") {
                    console.error(`Error in quote data for symbol ${symbol}: ${quoteData.s}`);
                    return;
                }
                const quoteValues = quoteData.v;
                const lastPrice = quoteValues.lp;
                // Check if lastPrice is defined
                if (lastPrice !== undefined) {
                    // Calculate digits from the last price
                    const digits = this.calculateDigitsFromPrice(lastPrice);
                    // Store the digits for the symbol
                    this._symbolDigits[symbol] = digits;
                }
                else {
                    // Handle the case where lastPrice is undefined
                    // You can set a default number of digits, e.g., 5
                    this._symbolDigits[symbol] = 5; // Default value; adjust as necessary
                }
                // Map DatafeedQuoteValues to TradingQuotes
                const tradingQuotes = this._mapQuoteValuesToTradingQuotes(quoteValues);
                // Call the host's realtimeUpdate method
                this._host.realtimeUpdate(symbol, tradingQuotes);
                // Process the real-time data to update orders and positions
                this._handleRealTimeUpdate(symbol, quoteValues);
            }, subscriptionId);
            this._subscribedSymbols.add(symbol);
            console.log(`Subscribed to real-time updates for ${symbol} with ID ${subscriptionId}`);
        }
        calculateDigitsFromPrice(price) {
            if (price === undefined) {
                return 0; // Or throw an error, or return a default value
            }
            const priceStr = price.toString();
            const decimalIndex = priceStr.indexOf('.');
            if (decimalIndex === -1)
                return 0; // No decimal point means zero digits
            const fractionalPart = priceStr.slice(decimalIndex + 1);
            return fractionalPart.length;
        }
        unsubscribeRealtime(symbol) {
            const subscriptionId = getDatafeedSubscriptionId(`realtime-${symbol}`);
            this._quotesProvider.unsubscribeQuotes(subscriptionId);
            this._subscribedSymbols.delete(symbol);
            console.log(`Unsubscribed from real-time updates for ${symbol} with ID ${subscriptionId}`);
        }
        _handleRealTimeUpdate(symbol, quoteValues) {
            const lastPrice = quoteValues.last_price || quoteValues.lp; // Use 'lp' if 'last_price' is not available
            if (lastPrice === undefined) {
                return;
            }
            // Update orders
            Object.values(this._orderById).forEach((order) => {
                if (order.symbol === symbol && order.status === 6 /* OrderStatus.Working */) {
                    if (order.last === lastPrice) {
                        return;
                    }
                    order.last = lastPrice;
                    if (order.price == null) {
                        order.price = order.last;
                    }
                    const executionChecks = {
                        [-1 /* Side.Sell */]: {
                            [2 /* OrderType.Market */]: () => !!order.price,
                            [1 /* OrderType.Limit */]: () => order.limitPrice !== undefined && order.last >= order.limitPrice,
                            [3 /* OrderType.Stop */]: () => order.stopPrice !== undefined && order.last <= order.stopPrice,
                            [4 /* OrderType.StopLimit */]: () => false,
                        },
                        [1 /* Side.Buy */]: {
                            [2 /* OrderType.Market */]: () => !!order.price,
                            [1 /* OrderType.Limit */]: () => order.limitPrice !== undefined && order.last <= order.limitPrice,
                            [3 /* OrderType.Stop */]: () => order.stopPrice !== undefined && order.last >= order.stopPrice,
                            [4 /* OrderType.StopLimit */]: () => false,
                        },
                    };
                    if (executionChecks[order.side][order.type]()) {
                        const positionData = { ...order };
                        order.price = order.last;
                        order.avgPrice = order.last;
                        const position = this._createPositionForOrder(positionData);
                        order.status = 2 /* OrderStatus.Filled */;
                        this._updateOrder(order);
                        // Execute bracket orders
                        this._getBrackets(order.id).forEach((bracket) => {
                            bracket.status = 6 /* OrderStatus.Working */;
                            bracket.parentId = position.id;
                            bracket.parentType = 2 /* ParentType.Position */;
                            this._updateOrder(bracket);
                        });
                    }
                    this._updateOrderLast(order);
                }
            });
            // Update positions
            Object.values(this._positionById).forEach((position) => {
                if (position.symbol === symbol) {
                    if (position.last === lastPrice) {
                        return;
                    }
                    position.last = lastPrice;
                    position.profit =
                        (position.last - position.price) *
                            position.qty *
                            (position.side === -1 /* Side.Sell */ ? -1 : 1);
                    this._host.plUpdate(position.symbol, position.profit);
                    this._host.positionPartialUpdate(position.id, position);
                    // this._recalculateAMData();
                }
            });
        }
        // private handleRealTimeUpdate(
        //   symbol: string,
        //   quoteValues: DatafeedQuoteValues
        // ): void {
        //   // Map DatafeedQuoteValues to TradingQuotes
        //   const data: TradingQuotes = {
        //     bid: quoteValues.bid,
        //     ask: quoteValues.ask,
        //     bid_size: quoteValues.bid_size,
        //     ask_size: quoteValues.ask_size,
        //     trade: quoteValues.last_price,
        //     size: quoteValues.volume,
        //     // Include other properties as needed
        //   };
        //   console.log("handleRealTimeUpdate", data);
        //   // Call the host's realtimeUpdate method to update the chart
        //   this._host.realtimeUpdate(symbol, data);
        // }
        /** Recalculates equity and profit and loss values that are displayed in the Account Manager */
        // private _recalculateAMData(): void {
        //   let pl = 0;
        //   this._positions.forEach((position: Position) => {
        //     pl += position.profit || 0;
        //   });
        //   this._accountManagerData.pl = pl;
        //   this._accountManagerData.equity = this._accountManagerData.balance + pl;
        //   // Evoke event: notify all subscribers that values in the Account Manager are updated
        //   this._amChangeDelegate.fire(this._accountManagerData);
        // }
        getSymbolName(symbol) {
            return symbol.includes(":") ? symbol.split(":")[1] : symbol;
        }
        /** Creates an order with bracket orders and returns an array of data objects representing these orders */
        _createOrderWithBrackets(preOrder) {
            const orders = [];
            const order = this._createOrder(preOrder);
            orders.push(order);
            // If true, create a take-profit order
            if (order.takeProfit !== undefined) {
                const takeProfit = this._createTakeProfitBracket(order);
                orders.push(takeProfit);
            }
            // If true, create a stop-loss order
            if (order.stopLoss !== undefined) {
                const stopLoss = this._createStopLossBracket(order);
                orders.push(stopLoss);
            }
            return orders;
        }
        /** Gets an array of bracket order objects associated with a specific parent ID */
        _getBrackets(parentId) {
            return this._orders().filter((order) => order.parentId === parentId &&
                activeOrderStatuses.includes(order.status));
        }
        /** Creates a working order based on the `PreOrder` object and returns an object that contains information about this order */
        _createOrder(preOrder) {
            return {
                id: `${this._idsCounter++}`,
                duration: preOrder.duration, // duration is not used in this sample
                limitPrice: preOrder.limitPrice,
                profit: 0,
                qty: preOrder.qty,
                side: preOrder.side || 1 /* Side.Buy */,
                status: 6 /* OrderStatus.Working */,
                stopPrice: preOrder.stopPrice,
                symbol: preOrder.symbol,
                type: preOrder.type || 2 /* OrderType.Market */,
                takeProfit: preOrder.takeProfit,
                stopLoss: preOrder.stopLoss,
                symbolName: preOrder.symbol,
            };
        }
        /** Creates a take-profit order and returns an object that contains information about this order */
        _createTakeProfitBracket(entity) {
            return {
                symbol: entity.symbol,
                qty: entity.qty,
                id: `${this._idsCounter++}`,
                parentId: entity.id,
                parentType: 1 /* ParentType.Order */,
                limitPrice: entity.takeProfit,
                side: changeSide(entity.side),
                status: 3 /* OrderStatus.Inactive */,
                type: 1 /* OrderType.Limit */,
                symbolName: entity.symbol,
            };
        }
        /** Creates a stop-loss order and returns an object that contains information about this order */
        _createStopLossBracket(entity) {
            return {
                symbol: entity.symbol,
                qty: entity.qty,
                id: `${this._idsCounter++}`,
                parentId: entity.id,
                parentType: 1 /* ParentType.Order */,
                stopPrice: entity.stopLoss,
                price: entity.stopPrice,
                side: changeSide(entity.side),
                status: 3 /* OrderStatus.Inactive */,
                type: 3 /* OrderType.Stop */,
                symbolName: entity.symbol,
            };
        }
        /** Gets a take-profit order by searching among the orders associated with a given order or position that has a non-undefined `limitPrice` */
        _getTakeProfitBracket(entity) {
            return this._getBrackets(entity.id).find((bracket) => bracket.limitPrice !== undefined);
        }
        /** Gets a stop-loss order by searching among the orders associated with a given order or position that has a non-undefined `stopPrice` */
        _getStopLossBracket(entity) {
            return this._getBrackets(entity.id).find((bracket) => bracket.stopPrice !== undefined);
        }
        /** Updates the orders' bracket orders based on the provided parameters */
        _updateOrdersBracket(params) {
            const { parent, bracket, bracketType, newPrice } = params;
            // Check if the bracket should be canceled
            const shouldCancelBracket = bracket !== undefined && newPrice === undefined;
            if (shouldCancelBracket) {
                // Set the bracket order status to "Canceled"
                this._setCanceledStatusAndUpdate(bracket);
                return;
            }
            if (newPrice === undefined) {
                return;
            }
            // Check if a new bracket should be created
            const shouldCreateNewBracket = bracket === undefined;
            // Handle the take-profit bracket order type
            if (bracketType === 1 /* BracketType.TakeProfit */) {
                const takeProfitBracket = shouldCreateNewBracket
                    ? this._createTakeProfitBracket(parent)
                    : { ...bracket, limitPrice: newPrice };
                this._updateOrder(takeProfitBracket);
                return;
            }
            // Handle the stop-loss bracket order type
            if (bracketType === 0 /* BracketType.StopLoss */) {
                const stopLossBracket = shouldCreateNewBracket
                    ? this._createStopLossBracket(parent)
                    : { ...bracket, stopPrice: newPrice };
                this._updateOrder(stopLossBracket);
                return;
            }
        }
        /** Updates the positions' bracket orders based on the provided parameters */
        _updatePositionsBracket(params) {
            console.log("placeOrder _updatePositionsBracket", params);
            const { parent, bracket, bracketType, newPrice } = params;
            // Check if the bracket should be canceled
            const shouldCancelBracket = bracket !== undefined && newPrice === undefined;
            if (shouldCancelBracket) {
                // Set the bracket order status to "Canceled"
                this._setCanceledStatusAndUpdate(bracket);
                return;
            }
            if (newPrice === undefined) {
                return;
            }
            // Check if a new bracket should be created
            const shouldCreateNewBracket = bracket === undefined;
            // Handle the take-profit bracket order type
            if (bracketType === 1 /* BracketType.TakeProfit */) {
                // If `true`, create a new take-profit bracket
                if (shouldCreateNewBracket) {
                    const takeProfitBracket = this._createTakeProfitBracket(parent);
                    takeProfitBracket.status = 6 /* OrderStatus.Working */;
                    takeProfitBracket.parentType = 2 /* ParentType.Position */;
                    this._updateOrder(takeProfitBracket);
                    return;
                }
                // Update the existing bracket order with a new take-profit price
                bracket.limitPrice = newPrice;
                bracket.takeProfit = newPrice;
                this._updateOrder(bracket);
                return;
            }
            // Handle the stop-loss bracket order type
            if (bracketType === 0 /* BracketType.StopLoss */) {
                // If `true`, create a new stop-loss bracket
                if (shouldCreateNewBracket) {
                    const stopLossBracket = this._createStopLossBracket(parent);
                    stopLossBracket.status = 6 /* OrderStatus.Working */;
                    stopLossBracket.parentType = 2 /* ParentType.Position */;
                    this._updateOrder(stopLossBracket);
                    return;
                }
                // Update the existing bracket order with a new stop-loss price
                bracket.stopPrice = newPrice;
                bracket.stopLoss = newPrice;
                this._updateOrder(bracket);
                return;
            }
        }
        /** Sets the order status to "Canceled" and updates the order object */
        _setCanceledStatusAndUpdate(order) {
            order.status = 1 /* OrderStatus.Canceled */;
            this._updateOrder(order);
        }
        /** Sets the order status to "Filled" and updates the order object */
        _setFilledStatusAndUpdate(order) {
            order.status = 2 /* OrderStatus.Filled */;
            this._updateOrder(order);
        }
    }
    BrokerSample.accountTypeIdToSuffixMap = {
        // ECN accounts
        57: ".",
        61: ".",
        65: ".",
        // Standard accounts
        58: "!",
        62: "!",
        66: "!",
        // ECNPRO accounts (no suffix)
        59: "",
        63: "",
        67: "",
        // Social accounts
        60: "#",
        64: "#",
    };
    /** Changes the position or order side to its opposite and returns the modified `side` property */
    function changeSide(side) {
        return side === 1 /* Side.Buy */ ? -1 /* Side.Sell */ : 1 /* Side.Buy */;
    }
    /** Gets a datafeed subscription ID */
    function getDatafeedSubscriptionId(id) {
        return `SampleBroker-${id}`;
    }

    exports.BASE_URL = BASE_URL;
    exports.BrokerSample = BrokerSample;
    exports.OPO_BASE_URL = OPO_BASE_URL;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
