/**
 * @module Make sure that you include Promise polyfill in your bundle to support old browsers
 * @see {@link https://caniuse.com/#search=Promise | Browsers with native Promise support}
 * @see {@link https://www.npmjs.com/package/promise-polyfill | Polyfill}
 */
import { AccountManagerInfo, ActionMetaInfo, ConnectionStatus, DefaultContextMenuActionsParams, Execution, IBrokerConnectionAdapterHost, IBrokerWithoutRealtime, InstrumentInfo, TradeContext, Order, Position, PreOrder, Side, Brackets, AccountId, AccountMetainfo, PlaceOrderResult } from "../../charting_library/broker-api";
import { IDatafeedQuotesApi } from "../../charting_library/datafeed-api";
/** Defines a structure of the data object related to the custom "Account Summary" page in the Account Manager */
interface AccountManagerData {
    title: string;
    balance: number;
    equity: number;
    pl: number;
}
/**
 * The Broker API implementation.
 * The Broker API is a key component that enables trading.
 * Its main purpose is to connect TradingView charts with the trading logic.
 */
export declare class BrokerSample implements IBrokerWithoutRealtime {
    /**
     * Creates instance of the Trading Host.
     * The Trading Host is an API for interaction between the Broker API and the library code related to trading.
     * Its main purpose is to receive information from the backend server where trading logic is implemented and provide updates to the library.
     */
    private readonly _host;
    /** Defines the initial values for the custom "Account Summary" page in the Account Manager */
    private readonly _accountManagerData;
    private _accountlist;
    private _positionlist;
    private _orderlist;
    /**
     * Initializes a variable of the "IDelegate" type.
     * Delegates are functions that are used to subscribe to specific events and get triggered when these events occur.
     * In this example, delegates notify some places in the code about changes in the user's equity and balance values.
     */
    private readonly _amChangeDelegate;
    /**
     * Initializes variables of the "IWatchedValue" type.
     * Watched values are values that should be constantly updated.
     * In this example, balance and equity are watched values, so users have up-to-date data about their account's state.
     */
    private readonly _balanceValue;
    private readonly _equityValue;
    /** Initializes an empty map to store positions indexed by their IDs */
    private readonly _positionById;
    /** Initializes an array to store position data */
    private readonly _positions;
    /** Initializes an empty map to store orders indexed by their IDs */
    private readonly _orderById;
    /** Initializes an array to store execution  data */
    private readonly _executions;
    /** Represents a quotes provider for retrieving and managing market quotes */
    private readonly _quotesProvider;
    /** Initializes the counter to 1, used to assign unique IDs to orders and positions */
    private _idsCounter;
    currentAccountSelected: any;
    constructor(host: IBrokerConnectionAdapterHost, quotesProvider: IDatafeedQuotesApi);
    updateAccountData(newTitle: string, newBalance: number, newEquity: number, newPl: number): void;
    getAccountData(): AccountManagerData;
    private fetchUser;
    fetchAccountData(): Promise<void>;
    private fetchPositions;
    private fetchOrders;
    /**
     * Subscribes to updates of the equity value.
     * The library calls this method when users open Order Ticket.
     */
    subscribeEquity(): void;
    /**
     * Unsubscribes from updates of the equity value.
     * The library calls this method when users close Order Ticket.
     */
    unsubscribeEquity(): void;
    /**
     * Defines the connection status for the Broker API.
     * If any other value than `1` ("Connected") is returned, the Account Manager will display an endless spinner.
     */
    connectionStatus(): ConnectionStatus;
    /**
     * Returns an array of `ActionMetaInfo` elements by calling the `defaultContextMenuActions` method of the Trading Host.
     * Each `ActionMetaInfo` element represents one context menu item.
     *
     * The library calls `chartContextMenuActions` when users open the context menu on the chart.
     * This method also renders the "Trade" button in the context menu.
     */
    chartContextMenuActions(context: TradeContext, options?: DefaultContextMenuActionsParams): Promise<ActionMetaInfo[]>;
    /**
     * Checks if a symbol can be traded.
     * In this sample, `isTradable` is a mock function that always returns `true`, meaning that all symbols can be traded.
     */
    isTradable(symbol: string): Promise<boolean>;
    /**
     * Places an order and returns an object with the order ID.
     * The library calls this method when users place orders in the UI.
     */
    placeOrder(preOrder: PreOrder): Promise<PlaceOrderResult>;
    /**
     * Modifies an existing order.
     * The library calls this method when a user wants to modify an existing order.
     */
    modifyOrder(order: Order): Promise<void>;
    /**
     * Enables a dialog that allows adding bracket orders to a position.
     * The library calls this method when users modify existing position with bracket orders.
     */
    editPositionBrackets(positionId: string, modifiedBrackets: Brackets): Promise<void>;
    /** Closes a position by the specified ID */
    closePosition(positionId: string): Promise<void>;
    /** Returns users's orders */
    orders(): Promise<Order[]>;
    /** Returns user's positions */
    positions(): Promise<Position[]>;
    /** Returns executions for the specified symbol */
    executions(symbol: string): Promise<Execution[]>;
    /** Reverses the side of a position */
    reversePosition(positionId: string): Promise<void>;
    /** Cancels a single order with a given ID */
    cancelOrder(orderId: string): Promise<void>;
    /** Cancels multiple orders for a symbol and side */
    cancelOrders(symbol: string, side: Side | undefined, ordersIds: string[]): Promise<void>;
    /** Builds the Account Manager that displays trading information */
    accountManagerInfo(): AccountManagerInfo;
    /**
     * Returns symbol information.
     * The library calls this method when users open the Order Ticket or DOM panel.
     */
    symbolInfo(symbol: string): Promise<InstrumentInfo>;
    /** Represents a mock function for a current account by returning an account ID '1' */
    currentAccount(): AccountId;
    /** Represents a mock function and returns information about the account with an ID '1' */
    accountsMetainfo(): Promise<AccountMetainfo[]>;
    setCurrentAccount(id: AccountId): void;
    /** Creates custom items in the Account Manager context menu */
    private _bottomContextMenuItems;
    /** Creates a position for a particular order and returns a position data object */
    private _createPositionForOrder;
    /** Handles updates to the equity value by calling the `equityUpdate` method of the Trading Host */
    private _handleEquityUpdate;
    /**
     * Updates order objects by calling the `orderPartialUpdate` method of the Trading Host.
     * `orderPartialUpdate` is used if the Account Manager has custom columns.
     * In this example, the Account Manager has the custom column called "Last".
     */
    private _updateOrderLast;
    /** Retrieves all orders stored in the `_orderById` map and returns an array containing all orders */
    private _orders;
    /** Updates a given order */
    private _updateOrder;
    /** Updates a given position */
    private _updatePosition;
    /** Subscribes to receive real-time quotes for a specific symbol */
    private _subscribeData;
    /** Unsubscribes the data listener associated with the provided ID from receiving real-time quote updates */
    private _unsubscribeData;
    /** Recalculates equity and profit and loss values that are displayed in the Account Manager */
    private _recalculateAMData;
    /** Creates an order with bracket orders and returns an array of data objects representing these orders */
    private _createOrderWithBrackets;
    /** Gets an array of bracket order objects associated with a specific parent ID */
    private _getBrackets;
    /** Creates a working order based on the `PreOrder` object and returns an object that contains information about this order */
    private _createOrder;
    /** Creates a take-profit order and returns an object that contains information about this order */
    private _createTakeProfitBracket;
    /** Creates a stop-loss order and returns an object that contains information about this order */
    private _createStopLossBracket;
    /** Gets a take-profit order by searching among the orders associated with a given order or position that has a non-undefined `limitPrice` */
    private _getTakeProfitBracket;
    /** Gets a stop-loss order by searching among the orders associated with a given order or position that has a non-undefined `stopPrice` */
    private _getStopLossBracket;
    /** Updates the orders' bracket orders based on the provided parameters */
    private _updateOrdersBracket;
    /** Updates the positions' bracket orders based on the provided parameters */
    private _updatePositionsBracket;
    /** Sets the order status to "Canceled" and updates the order object */
    private _setCanceledStatusAndUpdate;
    /** Sets the order status to "Filled" and updates the order object */
    private _setFilledStatusAndUpdate;
}
export {};
