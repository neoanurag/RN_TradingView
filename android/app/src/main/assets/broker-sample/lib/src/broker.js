/**
 * @module Make sure that you include Promise polyfill in your bundle to support old browsers
 * @see {@link https://caniuse.com/#search=Promise | Browsers with native Promise support}
 * @see {@link https://www.npmjs.com/package/promise-polyfill | Polyfill}
 */
/**
 * Imports the objects for columns on the "Account Summary", "Orders", and "Positions" pages
 */
import { accountSummaryColumns, ordersPageColumns, positionsPageColumns, } from "./columns";
import { makeApiRequest } from 'helpers';
/**
 * Defines an array of order statuses, including only "Inactive" and "Working" statuses.
 * This variable is used to retrieve bracket orders associated with a parent ID in `_getBrackets` function.
 */
const activeOrderStatuses = [3 /* OrderStatus.Inactive */, 6 /* OrderStatus.Working */];
const loginNumber = 599976187;
/**
 * The Broker API implementation.
 * The Broker API is a key component that enables trading.
 * Its main purpose is to connect TradingView charts with the trading logic.
 */
export class BrokerSample {
    constructor(host, quotesProvider) {
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
        /** Handles updates to the equity value by calling the `equityUpdate` method of the Trading Host */
        this._handleEquityUpdate = (value) => {
            this._host.equityUpdate(value);
        };
        this._quotesProvider = quotesProvider;
        this._host = host;
        this.fetchAccountData();
        // Create a delegate object
        this._amChangeDelegate = this._host.factory.createDelegate();
        // Create watched values for user's balance and equity
        this._balanceValue = this._host.factory.createWatchedValue(this._accountManagerData.balance);
        this._equityValue = this._host.factory.createWatchedValue(this._accountManagerData.equity);
        // Subscribe to updates on the user's balance and equity values in the Account Manager
        this._amChangeDelegate.subscribe(null, (values) => {
            this._balanceValue.setValue(values.balance);
            this._equityValue.setValue(values.equity);
        });
    }
    // startUpdatingAccountData(interval: number): void {
    //   setInterval(() => {
    //     this.fetchAccountDataFromAPI();
    //   }, interval);
    // }
    updateAccountData(newTitle, newBalance, newEquity, newPl) {
        this._accountManagerData.title = newTitle;
        this._accountManagerData.balance = newBalance;
        this._accountManagerData.equity = newEquity;
        this._accountManagerData.pl = newPl;
        this._balanceValue.setValue(newBalance);
        this._equityValue.setValue(newEquity);
        this._amChangeDelegate.fire(this._accountManagerData);
    }
    getAccountData() {
        return this._accountManagerData;
    }
    async fetchUser() {
        const response = await makeApiRequest(`/api/User/get?login=${loginNumber}&source=tv`);
        if (response.data) {
            this._accountlist = response.data;
        }
        else {
            console.error("Failed to fetch user data:", response);
        }
    }
    async fetchAccountData() {
        const response = await makeApiRequest(`/api/User/get_trade_state?login=${loginNumber}&source=tv`);
        if (response.data) {
            const { data } = response;
            this.updateAccountData(data.title, data.balance, data.equity, data.pl);
        }
        else {
            console.error("Failed to fetch account data:", response);
        }
    }
    async fetchPositions() {
        const response = await makeApiRequest(`/api/Position/get_page?login=${loginNumber}&source=tv`);
        if (response.data) {
            this._positionlist = response.data;
        }
        else {
            console.error("Failed to fetch positions data:", response);
        }
    }
    async fetchOrders() {
        const response = await makeApiRequest(`/api/Order/get_page?login=${loginNumber}&offset=0&total=6&source=tv`);
        if (response.data) {
            this._orderlist = response.data;
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
    /**
     * Places an order and returns an object with the order ID.
     * The library calls this method when users place orders in the UI.
     */
    async placeOrder(preOrder) {
        if (preOrder.duration) {
            // tslint:disable-next-line:no-console
            console.log("Durations are not implemented in this sample.");
        }
        // Open the Account Manager
        this._host.activateBottomWidget();
        if ((preOrder.type === 2 /* OrderType.Market */ || preOrder.type === undefined) &&
            this._getBrackets(preOrder.symbol).length > 0) {
            this._updateOrder(this._createOrder(preOrder));
            return {};
        }
        // Create orders with brackets
        const orders = this._createOrderWithBrackets(preOrder);
        orders.forEach((order) => {
            this._updateOrder(order);
        });
        return {};
    }
    /**
     * Modifies an existing order.
     * The library calls this method when a user wants to modify an existing order.
     */
    async modifyOrder(order) {
        // Retrieve the order from `_orderById` map
        const originalOrder = this._orderById[order.id];
        if (originalOrder === undefined) {
            return;
        }
        this._updateOrder(order);
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
    /**
     * Enables a dialog that allows adding bracket orders to a position.
     * The library calls this method when users modify existing position with bracket orders.
     */
    async editPositionBrackets(positionId, modifiedBrackets) {
        var _a, _b;
        // Retrieve the position object using its ID
        const position = this._positionById[positionId];
        // Retrieve all brackets associated with this position
        const positionBrackets = this._getBrackets(positionId);
        // Create a modified position object based on the original position
        const modifiedPosition = { ...position };
        // Update take-profit and stop-loss prices in the modified position object if they are provided
        (_a = modifiedPosition.takeProfit) !== null && _a !== void 0 ? _a : (modifiedPosition.takeProfit = modifiedBrackets.takeProfit);
        (_b = modifiedPosition.stopLoss) !== null && _b !== void 0 ? _b : (modifiedPosition.stopLoss = modifiedBrackets.stopLoss);
        this._updatePosition(modifiedPosition);
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
    /** Closes a position by the specified ID */
    async closePosition(positionId) {
        const position = this._positionById[positionId];
        const handler = () => {
            this.placeOrder({
                symbol: position.symbol,
                side: position.side === -1 /* Side.Sell */ ? 1 /* Side.Buy */ : -1 /* Side.Sell */,
                type: 2 /* OrderType.Market */,
                qty: position.qty,
            });
        };
        await handler();
    }
    /** Returns users's orders */
    async orders() {
        await this.fetchOrders();
        return this._orders();
    }
    /** Returns user's positions */
    async positions() {
        await this.fetchPositions();
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
        const position = this._positionById[positionId];
        const handler = () => {
            return this.placeOrder({
                symbol: position.symbol,
                side: position.side === -1 /* Side.Sell */ ? 1 /* Side.Buy */ : -1 /* Side.Sell */,
                type: 2 /* OrderType.Market */,
                qty: position.qty * 2,
            });
        };
        await handler();
    }
    /** Cancels a single order with a given ID */
    cancelOrder(orderId) {
        const order = this._orderById[orderId];
        const handler = () => {
            order.status = 1 /* OrderStatus.Canceled */;
            this._updateOrder(order);
            this._getBrackets(order.id).forEach((bracket) => this.cancelOrder(bracket.id));
            return Promise.resolve();
        };
        return handler();
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
        ];
        return {
            accountTitle: "Trading Sample",
            // Custom fields that are displayed in the "Account Summary" row
            summary: summaryProps,
            // Columns that build the "Orders" page
            orderColumns: ordersPageColumns,
            // Columns that build the "Positions" page
            positionColumns: positionsPageColumns,
            // Columns that build the custom "Account Summary" page
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
                min: 1,
                max: 1e12,
                step: 1,
            },
            pipValue: pipSize * pointValue * accountCurrencyRate || 1,
            pipSize: pipSize,
            minTick: mintick,
            description: "",
        };
    }
    /** Represents a mock function for a current account by returning an account ID '1' */
    currentAccount() {
        var _a, _b;
        if (this.currentAccountSelected === undefined) {
            this.currentAccountSelected = (_a = this._accountlist[0]) === null || _a === void 0 ? void 0 : _a.id;
        }
        return (_b = this._accountlist[0]) === null || _b === void 0 ? void 0 : _b.id;
    }
    /** Represents a mock function and returns information about the account with an ID '1' */
    async accountsMetainfo() {
        var _a;
        await this.fetchUser();
        if (this.currentAccountSelected == undefined) {
            this.currentAccountSelected = (_a = this._accountlist[0]) === null || _a === void 0 ? void 0 : _a.id;
        }
        return [...this._accountlist];
    }
    setCurrentAccount(id) {
        this.currentAccountSelected = id;
        this._host.currentAccountUpdate();
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
                id: positionId,
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
        this._recalculateAMData();
        // Notify the library about "Profit and loss" updates
        this._host.plUpdate(position.symbol, position.profit);
        this._host.positionPartialUpdate(position.id, position);
        // Recalculate values in the Account Manager
        this._recalculateAMData();
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
        // return Object.values(this._orderById);
        return this._orderlist;
    }
    /** Updates a given order */
    _updateOrder(order) {
        // Define execution checks for different order sides and types
        const executionChecks = {
            [-1 /* Side.Sell */]: {
                // Check for Market order: whether the order has a price
                [2 /* OrderType.Market */]: () => !!order.price,
                // Check for Limit order: whether the limit price is defined and the last price is greater than or equal to the limit price
                [1 /* OrderType.Limit */]: () => order.limitPrice !== undefined && order.last >= order.limitPrice,
                // Check for Stop order: whether the stop price is defined and the last price is less than or equal to the stop price
                [3 /* OrderType.Stop */]: () => order.stopPrice !== undefined && order.last <= order.stopPrice,
                // Stop-limit orders are not implemented, so the check function always returns `false`
                [4 /* OrderType.StopLimit */]: () => false,
            },
            [1 /* Side.Buy */]: {
                [2 /* OrderType.Market */]: () => !!order.price,
                [1 /* OrderType.Limit */]: () => order.limitPrice !== undefined && order.last <= order.limitPrice,
                [3 /* OrderType.Stop */]: () => order.stopPrice !== undefined && order.last >= order.stopPrice,
                [4 /* OrderType.StopLimit */]: () => false,
            },
        };
        // Check if the order already exists
        const hasOrderAlready = Boolean(this._orderById[order.id]);
        // Store or update the order in the `_orderById` map
        this._orderById[order.id] = order;
        Object.assign(this._orderById[order.id], order);
        // Subscribe to real-time data updates if the order is new
        if (!hasOrderAlready) {
            this._subscribeData(order.symbol, order.id, (last) => {
                // Ignore if the last price hasn't changed
                if (order.last === last) {
                    return;
                }
                // Update the order's last price
                order.last = last;
                if (order.price == null) {
                    order.price = order.last;
                }
                // Check if the order should be executed based on its status, side, and type
                if (order.status === 6 /* OrderStatus.Working */ &&
                    executionChecks[order.side][order.type]()) {
                    const positionData = { ...order };
                    // Update order properties
                    order.price = order.last;
                    order.avgPrice = order.last;
                    // Create a position for the order
                    const position = this._createPositionForOrder(positionData);
                    // Update the order status to "Filled"
                    order.status = 2 /* OrderStatus.Filled */;
                    this._updateOrder(order);
                    // Update the status of associated bracket orders to "Working" and link them to the created position
                    this._getBrackets(order.id).forEach((bracket) => {
                        bracket.status = 6 /* OrderStatus.Working */;
                        bracket.parentId = position.id;
                        bracket.parentType = 2 /* ParentType.Position */;
                        this._updateOrder(bracket);
                    });
                }
                /*
                Update the order object with the `last` value.
                This value is displayed in the Account Manager.
                */
                this._updateOrderLast(order);
            });
        }
        // Notify the library that order data should be updated by calling the `orderUpdate` method of the Trading Host
        this._host.orderUpdate(order);
        // Update the take-profit and stop-loss values of the parent entity if applicable
        if (order.parentId !== undefined) {
            // Define the entity type: order or position
            const entity = order.parentType === 2 /* ParentType.Position */
                ? this._positionById[order.parentId]
                : this._orderById[order.parentId];
            // If the parent entity doesn't exist, exit `_updateOrder`
            if (entity === undefined) {
                return;
            }
            // Update the take-profit values based on the order status
            if (order.limitPrice !== undefined) {
                entity.takeProfit =
                    order.status !== 1 /* OrderStatus.Canceled */ ? order.limitPrice : undefined;
            }
            // Update the stop-loss based on the order status
            if (order.stopPrice !== undefined) {
                entity.stopLoss =
                    order.status !== 1 /* OrderStatus.Canceled */ ? order.stopPrice : undefined;
            }
            // If the parent entity is a position, update this position by calling `_updatePosition`
            if (order.parentType === 2 /* ParentType.Position */) {
                return this._updatePosition(entity);
            }
            // If the parent entity is an order, update this order by calling `_updateOrder` recursively
            this._updateOrder(entity);
        }
    }
    /** Updates a given position */
    _updatePosition(position) {
        const hasPositionAlready = Boolean(this._positionById[position.id]);
        if (hasPositionAlready && !position.qty) {
            this._unsubscribeData(position.id);
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
            this._subscribeData(position.symbol, position.id, (last) => {
                if (position.last === last) {
                    return;
                }
                position.last = last;
                position.profit =
                    (position.last - position.price) *
                        position.qty *
                        (position.side === -1 /* Side.Sell */ ? -1 : 1);
                this._host.plUpdate(position.symbol, position.profit);
                this._host.positionPartialUpdate(position.id, position);
                this._recalculateAMData();
            });
        }
        this._positionById[position.id] = position;
        this._host.positionUpdate(position);
    }
    /** Subscribes to receive real-time quotes for a specific symbol */
    _subscribeData(symbol, id, updateFunction) {
        this._quotesProvider.subscribeQuotes([], [symbol], (symbols) => {
            const deltaData = symbols[0];
            if (deltaData.s !== "ok") {
                return;
            }
            if (typeof deltaData.v.lp === "number") {
                updateFunction(deltaData.v.lp);
            }
        }, getDatafeedSubscriptionId(id));
    }
    /** Unsubscribes the data listener associated with the provided ID from receiving real-time quote updates */
    _unsubscribeData(id) {
        this._quotesProvider.unsubscribeQuotes(getDatafeedSubscriptionId(id));
    }
    /** Recalculates equity and profit and loss values that are displayed in the Account Manager */
    _recalculateAMData() {
        let pl = 0;
        this._positions.forEach((position) => {
            pl += position.profit || 0;
        });
        this._accountManagerData.pl = pl;
        this._accountManagerData.equity = this._accountManagerData.balance + pl;
        // Evoke event: notify all subscribers that values in the Account Manager are updated
        this._amChangeDelegate.fire(this._accountManagerData);
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
/** Changes the position or order side to its opposite and returns the modified `side` property */
function changeSide(side) {
    return side === 1 /* Side.Buy */ ? -1 /* Side.Sell */ : 1 /* Side.Buy */;
}
/** Gets a datafeed subscription ID */
function getDatafeedSubscriptionId(id) {
    return `SampleBroker-${id}`;
}
