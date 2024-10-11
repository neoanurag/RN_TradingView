/**
 * @module Make sure that you include Promise polyfill in your bundle to support old browsers
 * @see {@link https://caniuse.com/#search=Promise | Browsers with native Promise support}
 * @see {@link https://www.npmjs.com/package/promise-polyfill | Polyfill}
 */

import {
  AccountManagerInfo,
  AccountManagerSummaryField,
  ActionMetaInfo,
  ConnectionStatus,
  DefaultContextMenuActionsParams,
  Execution,
  IBrokerConnectionAdapterHost,
  //IBrokerWithoutRealtime,
  IBrokerTerminal,
  IDelegate,
  InstrumentInfo,
  TradeContext,
  IWatchedValue,
  MenuSeparator,
  Order,
  OrderStatus,
  OrderType,
  Position,
  PreOrder,
  Side,
  Brackets,
  AccountId,
  AccountMetainfo,
  PlaceOrderResult,
  StandardFormatterName,
  ParentType,
  TradingQuotes,
  // IndividualPosition,
  // INumberFormatter,
  // LeverageInfo,
  // LeverageInfoParams,
  // LeveragePreviewResult,
  // LeverageSetParams,
  // LeverageSetResult,
  // OrderDialogOptions,
  // OrderPreviewResult,
  // PositionDialogOptions,
  // SymbolSpecificTradingOptions,
  //   TradingQuotes,
} from "../../charting_library/broker-api";

import {
  QuoteData,
  //   QuoteData,
} from "../../charting_library/datafeed-api";
// import datafeed from "../../src/datafeed";
import Datafeed from "../../src/datafeed";

/**
 * Imports the objects for columns on the "Account Summary", "Orders", and "Positions" pages
 */
import {
  accountSummaryColumns,
  ordersPageColumns,
  positionsPageColumns,
  historyPageColumns,
} from "./columns.js";
import {
  makeApiRequest,
  makeCRMApiRequest,
  makePostApiRequest,
} from "./helpers.js";
//   export const BASE_URL = "https://oponew-ehhgc5eudvg0fsa8.spaincentral-01.azurewebsites.net/";
export const BASE_URL = "https://opotrade.azurewebsites.net";
export const OPO_BASE_URL = "https://myaccount.opofinance.com";

import { BalanceEquityStreaming } from "./streaming.js";

/** Defines an enumerated type which represents different types of bracket orders */
const enum BracketType {
  StopLoss,
  TakeProfit,
  TrailingStop,
}
// interface QuoteOkData {
//   n: string; // Symbol name
//   s: "ok"; // Status code
//   v: DatafeedQuoteValues; // Quote values
// }
interface SimpleMap<TValue> {
  [key: string]: TValue;
}

/** Defines a structure of the data object related to the custom "Account Summary" page in the Account Manager */
interface AccountManagerData {
  title: string;
  balance: number;
  equity: number;
  pl: number;
}
interface DatafeedQuoteValues {
  bid?: number;
  ask?: number;
  bid_size?: number;
  ask_size?: number;
  last_price?: number;
  volume?: number;
  lp?: number;
  // Add any other fields your datafeed provides
}

/** Defines parameters for updating parent orders */
interface UpdateParentBracketParams {
  parent: Position | Order;
  bracket: Order | undefined;
  bracketType: BracketType;
  newPrice: number | undefined;
}
type Symbol = {
  symbolName?: string;
};
/**
 * Defines an array of order statuses, including only "Inactive" and "Working" statuses.
 * This variable is used to retrieve bracket orders associated with a parent ID in `_getBrackets` function.
 */
const activeOrderStatuses = [OrderStatus.Inactive, OrderStatus.Working];
let loginNumber: number = 0;

const LAST_USED_ACCOUNT_STORAGE_KEY = "lastUsedAccount";

/**
 * The Broker API implementation.
 * The Broker API is a key component that enables trading.
 * Its main purpose is to connect TradingView charts with the trading logic.
 */
export class BrokerSample implements IBrokerTerminal {
  /**
   * Creates instance of the Trading Host.
   * The Trading Host is an API for interaction between the Broker API and the library code related to trading.
   * Its main purpose is to receive information from the backend server where trading logic is implemented and provide updates to the library.
   */
  private readonly _host: IBrokerConnectionAdapterHost;

  /** Defines the initial values for the custom "Account Summary" page in the Account Manager */
  private readonly _accountManagerData: AccountManagerData = {
    title: "Trading Sample",
    balance: 10000000,
    equity: 10000000,
    pl: 0,
  };
  private _accountlist: AccountMetainfo[] = [];
  private _positionlist: Position[] = [];
  private _orderlist: Order[] = [];
  private _orderHistorylist: Order[] = [];
  private _symbolDigits: { [symbol: string]: number } = {};
  /**
   * Initializes a variable of the "IDelegate" type.
   * Delegates are functions that are used to subscribe to specific events and get triggered when these events occur.
   * In this example, delegates notify some places in the code about changes in the user's equity and balance values.
   */
  private readonly _amChangeDelegate: IDelegate<
    (values: AccountManagerData) => void
  >;

  /**
   * Initializes variables of the "IWatchedValue" type.
   * Watched values are values that should be constantly updated.
   * In this example, balance and equity are watched values, so users have up-to-date data about their account's state.
   */
  private readonly _balanceValue: IWatchedValue<number>;
  private readonly _equityValue: IWatchedValue<number>;
  private readonly _plValue: IWatchedValue<number>;

  /** Initializes an empty map to store positions indexed by their IDs */
  private readonly _positionById: SimpleMap<Position & Symbol> = {};

  /** Initializes an array to store position data */
  private readonly _positions: Position[] = [];

  /** Initializes an empty map to store orders indexed by their IDs */
  private readonly _orderById: SimpleMap<Order & Symbol> = {};

  /** Initializes an array to store execution  data */
  private readonly _executions: Execution[] = [];

  /** Represents a quotes provider for retrieving and managing market quotes */
  // private readonly _quotesProvider: any;
  private readonly _quotesProvider: Datafeed;

  /** Initializes the counter to 1, used to assign unique IDs to orders and positions */
  private _idsCounter: number = 1;
  currentAccountSelected: any = null;
  private _balanceEquityStreaming: BalanceEquityStreaming;
  // private subscriptions: Map<string, any>;
  public constructor(
    host: IBrokerConnectionAdapterHost,
    quotesProvider: Datafeed,
    balanceEquityStreaming: BalanceEquityStreaming
  ) {
    this._quotesProvider = quotesProvider;
    this._host = host;
    this._balanceEquityStreaming = balanceEquityStreaming;
    this._plValue = this._host.factory.createWatchedValue(
      this._accountManagerData.pl
    );

    //   this.fetchAccountData();
    // this.subscriptions = new Map();
    // Create a delegate object
    this._amChangeDelegate = this._host.factory.createDelegate();

    // Create watched values for user's balance and equity
    this._balanceValue = this._host.factory.createWatchedValue(
      this._accountManagerData.balance
    );
    this._equityValue = this._host.factory.createWatchedValue(
      this._accountManagerData.equity
    );

    try {
      const storedAccountId = localStorage.getItem(
        LAST_USED_ACCOUNT_STORAGE_KEY
      );
      if (storedAccountId) {
        this.currentAccountSelected = storedAccountId;
      }
    } catch (e) {
      console.error("Error accessing localStorage", e);
    }

    // Subscribe to updates on the user's balance and equity values in the Account Manager
    this._amChangeDelegate.subscribe(null, (values: AccountManagerData) => {
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

  async ordersHistory?(): Promise<Order[]> {
    await this.fetchOrderHistory()

    return Promise.resolve(this._orderHistorylist);
    // throw new Error("Method not implemented.");
   }

   private async fetchOrderHistory() {
    if (loginNumber === 0) {
      console.warn("Login number is not set. Waiting...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.error("Login number is still not set after waiting");
      return;
    }
    const response = await makeApiRequest(
      `${BASE_URL}/api/History/get_page?login=${loginNumber}&offset=0&total=1000&source=tv`
    );
    if (response.data) {
      this._orderHistorylist = response.data.map((item: any) => ({
        ...item,
        qty: item.qty / 10000, // Convert units to lots
        timeSetup:item.timeSetup *1000,
      }));
    } else {
      console.error("Failed to fetch order data:", response);
    }
  }

  private handleWebSocketUpdates(values: AccountManagerData) {
    this._accountManagerData.balance = values.balance;
    this._accountManagerData.equity = values.equity;
    this._accountManagerData.pl = values.pl;
    this._amChangeDelegate.fire(this._accountManagerData);
  }

  // Update the watched balance and equity values
  private updateWatchedValues(values: AccountManagerData) {
    this._balanceValue.setValue(values.balance);
    this._equityValue.setValue(values.equity);
    this._plValue.setValue(values.pl);
  }

  updateAccountData(
    newTitle: string,
    newBalance: number,
    newEquity: number,
    newPl: number
  ): void {
    this._accountManagerData.title = newTitle;
    this._accountManagerData.balance = newBalance;
    this._accountManagerData.equity = newEquity;
    this._accountManagerData.pl = newPl;

    this._balanceValue.setValue(newBalance);
    this._equityValue.setValue(newEquity);
    this._plValue.setValue(newPl); 

    this._amChangeDelegate.fire(this._accountManagerData);
  }

  getAccountData(): AccountManagerData {
    return this._accountManagerData;
  }

  subscribeBalanceEquityData() {
    console.log("loginNumber",loginNumber);
  if(this._balanceEquityStreaming){
    this._balanceEquityStreaming.close();
    this._balanceEquityStreaming.unsubscribe(
      this.handleWebSocketUpdates.bind(this)
    );
  }
    // Set up the WebSocket connection to stream balance and equity
    this._balanceEquityStreaming = new BalanceEquityStreaming(loginNumber);
    // Subscribe to updates from the WebSocket stream
    this._balanceEquityStreaming.subscribe(
      this.handleWebSocketUpdates.bind(this)
    );
  }

  fetchAccountManageerData() {
    this.fetchAccountData();
    this.fetchOrders();
    this.fetchPositions();
  }

  private _activeSymbols: Set<string> = new Set();
  private _subscribedSymbols: Set<string> = new Set();

  private static accountTypeIdToSuffixMap: { [key: number]: string } = {
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

  // Helper function to get the current suffix
  private getSuffix(): string {
    return localStorage.getItem("suffix") || "";
  }

  // Helper function to append the suffix
  private appendSuffix(symbol: string): string {
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

  private async fetchUser() {
    const data = await makeCRMApiRequest(
      `${OPO_BASE_URL}/client-api/accounts?version=1.0.0`
    );

    if (Array.isArray(data)) {
      const filteredAccounts = data.filter(
        (account) =>
          account.type.id === 57 ||
          account.type.id === 58 ||
          account.type.id === 59 ||
          account.type.id === 60 ||
          account.type.id === 61 ||
          account.type.id === 62 ||
          account.type.id === 63 ||
          account.type.id === 64 ||
          account.type.id === 65 ||
          account.type.id === 66 ||
          account.type.id === 67
      );
      loginNumber = parseInt(filteredAccounts[0].login);
      this.subscribeBalanceEquityData();
      this.fetchAccountManageerData();
      this._accountlist = filteredAccounts.map((account) => {
        const suffix =
          BrokerSample.accountTypeIdToSuffixMap[account.type.id] ?? "";
        this._accountSuffixes.set(account.login, suffix);
        return {
          id: account.login,
          name: `${account.type?.description || "Account"} ${account.login}`,
        };
      });

      // Check if the stored account ID is among the fetched accounts
      let accountToUse = this.currentAccountSelected;
      if (!this._accountlist.find((account) => account.id === accountToUse)) {
        // If not found, use the first account
        accountToUse = this._accountlist[0]?.id;
      }
      this.currentAccountSelected = accountToUse;
      loginNumber = parseInt(accountToUse);

      // Now fetch account data for the selected account
      this.subscribeBalanceEquityData();
      this.fetchAccountManageerData();

      console.log("Filtered account logins:", this._accountlist);
    } else {
      console.error("Unexpected response format:", data);
    }
  }

  async fetchAccountData(): Promise<void> {
    if (loginNumber === 0) {
      console.warn("Login number is not set. Waiting...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.error("Login number is still not set after waiting");
      return;
    }
    const response = await makeApiRequest(
      `${BASE_URL}/api/User/get_trade_state?login=${loginNumber}&source=tv`
    );
    if (response.data) {
      console.log("fetchAccountData", response.data);
      const { data } = response;
      this.updateAccountData(data.title, data.balance, data.equity, data.pl);
      this._host.currentAccountUpdate();
    } else {
      console.error("Failed to fetch account data:", response);
    }
  }

  private async fetchPositions() {
    if (loginNumber === 0) {
      console.warn("Login number is not set. Waiting...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.error("Login number is still not set after waiting");
      return;
    }
    console.log("fetchPositions");
    const response = await makeApiRequest(
      `${BASE_URL}/api/Position/get_page?login=${loginNumber}&offset=0&total=1000&source=tv`
    );
    if (response.data) {
      this._positionlist = response.data.map((item: any) => ({
        id: item.id.toString(),
        symbol:this.getSymbolWithPrefix(item.symbol),
        symbolName: item.symbol,
        side: item.side === 1 ? 1 : -1,
        qty: item.qty / 10000,
        avgPrice: item.price,
        profit: item.profit,
        timeSetup: item.timeCreate *1000,
      }));
      console.log("fetchPositions", this._positionlist);
    } else {
      console.error("Failed to fetch positions data:", response);
    }
  }

  private async fetchOrders() {
    if (loginNumber === 0) {
      console.warn("Login number is not set. Waiting...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.error("Login number is still not set after waiting");
      return;
    }
    const response = await makeApiRequest(
      `${BASE_URL}/api/Order/get_page?login=${loginNumber}&offset=0&total=1000&source=tv`
    );
    if (response.data) {
      this._orderlist = response.data.map((item: any) => ({
        ...item,
        symbol: this.getSymbolWithPrefix(item.symbol),
        symbolName: item.symbol,
        qty: item.qty / 10000, // Convert units to lots
        timeSetup:item.timeSetup *1000,
      }));
    } else {
      console.error("Failed to fetch order data:", response);
    }
  }

  /**
   * Subscribes to updates of the equity value.
   * The library calls this method when users open Order Ticket.
   */
  public subscribeEquity(): void {
    this._equityValue.subscribe(this._handleEquityUpdate, {
      callWithLast: true,
    });
  }

  /**
   * Unsubscribes from updates of the equity value.
   * The library calls this method when users close Order Ticket.
   */
  public unsubscribeEquity(): void {
    this._equityValue.unsubscribe(this._handleEquityUpdate);
  }

  /**
   * Defines the connection status for the Broker API.
   * If any other value than `1` ("Connected") is returned, the Account Manager will display an endless spinner.
   */
  public connectionStatus(): ConnectionStatus {
    return ConnectionStatus.Connected;
  }

  /**
   * Returns an array of `ActionMetaInfo` elements by calling the `defaultContextMenuActions` method of the Trading Host.
   * Each `ActionMetaInfo` element represents one context menu item.
   *
   * The library calls `chartContextMenuActions` when users open the context menu on the chart.
   * This method also renders the "Trade" button in the context menu.
   */
  public chartContextMenuActions(
    context: TradeContext,
    options?: DefaultContextMenuActionsParams
  ): Promise<ActionMetaInfo[]> {
    return this._host.defaultContextMenuActions(context);
  }

  /**
   * Checks if a symbol can be traded.
   * In this sample, `isTradable` is a mock function that always returns `true`, meaning that all symbols can be traded.
   */
  public isTradable(symbol: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  // Map TradingView OrderType to your API action and type
  mapOrderTypeToActionAndType(
    orderType: OrderType,
    side: Side
  ): { action: string; type: number } {
    let action = "";
    let type = 0;

    if (orderType === OrderType.Market) {
      action = "200";
      type = side === 1 ? 0 : 1; // 0 for Buy Market, 1 for Sell Market
    } else if (orderType === OrderType.Limit) {
      action = "201";
      type = side === 1 ? 2 : 3; // 2 for Buy Limit, 3 for Sell Limit
    } else if (orderType === OrderType.Stop) {
      action = "201";
      type = side === 1 ? 4 : 5; // 4 for Buy Stop, 5 for Sell Stop
    } else {
      throw new Error("Unsupported order type");
    }

    return { action, type };
  }

  // Places an order and returns an object with the order ID.
  // The library calls this method when users place orders in the UI.
  public async placeOrder(preOrder: PreOrder | any): Promise<PlaceOrderResult> {
    console.log("placeOrder", preOrder);
    const symbolWithSuffix = this.appendSuffix(preOrder.symbol);
    try {
      // Map the order type and side to your API parameters
      const { action, type } = this.mapOrderTypeToActionAndType(
        preOrder.type,
        preOrder.side
      );

      // Validate required fields
      if (!preOrder.symbol || !preOrder.qty) {
        throw new Error("Symbol and quantity are required");
      }
      let digits = this._symbolDigits[preOrder.symbol];
      // Construct the payload
      const payload: any = {
        action: action,
        login: Number(this.currentAccountSelected),
        symbol: symbolWithSuffix.includes(":")
          ? symbolWithSuffix.split(":")[1]
          : symbolWithSuffix,
        volume: preOrder.qty * 10000,
        typeFill: preOrder.type === OrderType.Market ? 0 : 2, // 0 for Market, 2 for Pending Orders
        type: type,
        digits: digits,
        source: "tv",
        position: preOrder.positionId,
        priceTrigger: 0,
      };

      // For pending orders, add additional fields
      if (
        preOrder.type === OrderType.Limit ||
        preOrder.type === OrderType.Stop
      ) {
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
      if (
        preOrder.takeProfit !== undefined ||
        preOrder.stopLoss !== undefined
      ) {
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
          status:
            responseData.status === 2
              ? OrderStatus.Working
              : OrderStatus.Rejected,
          // status: (responseData.status === 5 || responseData.status === 2 ? 2 : responseData.status),
          stopLoss: responseData.stopLoss ? responseData.stopLoss : undefined,
          takeProfit: responseData.takeProfit ? responseData.takeProfit : undefined,
          // parentId: preOrder.positionId,
          // Include any additional fields from responseData as needed
        };

        // Update internal order storage
        if (
          preOrder.takeProfit !== undefined ||
          preOrder.stopLoss !== undefined
        ) {
          const orders = this._createOrderWithBrackets(result);

          orders.forEach((order: Order) => {
            this._updateOrder({...order, timeSetup:Date.now()});
          });
        } else {
          if (preOrder.positionId) {
            const position = {
              ...result,
              id: preOrder.positionId.toString(),
              qty: 0,
              status: OrderStatus.Filled,
              timeSetup:Date.now() 
            };
            this._updatePosition(position);
          } else {
            this._updateOrder({ ...result, timeSetup:Date.now()});
          }
        }
        return { orderId };
      } else {
        // Handle errors
        const errorMessage = response ? response.message : "Unknown error";
        console.error("Failed to place order:", errorMessage);
        return Promise.reject(new Error(errorMessage));
      }
    } catch (error) {
      console.error("Error in placeOrder:", error);
      return Promise.reject(error);
    }
  }
  /**
   * Modifies an existing order.
   * The library calls this method when a user wants to modify an existing order.
   */
  public async modifyOrder(order: Order): Promise<void> {
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
        const modifiedOrder: Order = {
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
          status:
            responseData.order === "0"
              ? OrderStatus.Rejected
              : OrderStatus.Working, // Adjust based on your API's response
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
      } else {
        // Handle errors
        const errorMessage = response ? response.message : "Unknown error";
        console.error("Failed to place order:", errorMessage);
        return Promise.reject(new Error(errorMessage));
      }
    } catch (error: any) {
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
      bracketType: BracketType.TakeProfit,
    });

    // Update the object of the stop-loss bracket order
    this._updateOrdersBracket({
      parent: order,
      bracket: stopLossBracket,
      newPrice: order.stopLoss,
      bracketType: BracketType.StopLoss,
    });
  }

  /** Helper method for calling the broker's API to modify the order */
  private async modifyOrderApi(body: any): Promise<any> {
    try {
      const response = await makePostApiRequest(
        `${BASE_URL}/api/Order/update_order`,
        body
      );

      return response; // Return the broker's response
    } catch (error: any) {
      throw new Error("Failed to modify order: " + error.message);
    }
  }

  editIndividualPositionBrackets(
    positionId: string,
    modifiedBrackets: Brackets
  ): Promise<void> {
    console.log(
      "placeOrder editIndividualPositionBrackets",
      positionId,
      modifiedBrackets
    );
    return Promise.resolve();
  }

  /**
   * Enables a dialog that allows adding bracket orders to a position.
   * The library calls this method when users modify existing position with bracket orders.
   */
  public async editPositionBrackets(
    positionId: string,
    modifiedBrackets: Brackets
  ): Promise<void> {
    console.log(
      "placeOrder editPositionBrackets",
      positionId,
      modifiedBrackets
    );
    // Retrieve the position object using its ID
    const position = this._positionById[positionId];
    // Retrieve all brackets associated with this position
    const positionBrackets = this._getBrackets(positionId);

    // Create a modified position object based on the original position
    const modifiedPosition: Position = { ...position };
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
      priceSL:
        modifiedBrackets.stopLoss === undefined ? 0 : modifiedBrackets.stopLoss,
      priceTP:
        modifiedBrackets.takeProfit === undefined
          ? 0
          : modifiedBrackets.takeProfit,
      volumeInitial: modifiedPosition.qty * 10000,
      digits: 5,
    };
    const response = await this.editPositionsApi(body);
    console.log("placeOrder edit data", response.data);
    const result = response.data;
    if (response && response.success) {
      modifiedPosition.takeProfit ??= modifiedBrackets.takeProfit;
      modifiedPosition.stopLoss ??= modifiedBrackets.stopLoss;
      modifiedPosition.symbol = symbolWithSuffix.split(":")[1];
      modifiedPosition.qty = result.volumeInitial / 10000;
      modifiedPosition.symbolName = result.symbol;
      console.log("modifiedPosition", modifiedPosition);
      this._updatePosition({ ...modifiedPosition });
    } else {
      // Handle errors
      const errorMessage = response ? response.message : "Unknown error";
      console.error("Failed to place order:", errorMessage);
      return Promise.reject(new Error(errorMessage));
    }
    // Update take-profit and stop-loss prices in the modified position object if they are provided
    // Find the take-profit and stop-loss brackets from the position's brackets
    const takeProfitBracket = positionBrackets.find(
      (bracket: Order) => bracket.limitPrice !== undefined
    );
    const stopLossBracket = positionBrackets.find(
      (bracket: Order) => bracket.stopPrice !== undefined
    );

    // Update the object of the take-profit bracket order
    this._updatePositionsBracket({
      parent: modifiedPosition,
      bracket: takeProfitBracket,
      bracketType: BracketType.TakeProfit,
      newPrice: modifiedBrackets.takeProfit,
    });

    // Update the object of the stop-loss bracket order
    this._updatePositionsBracket({
      parent: modifiedPosition,
      bracket: stopLossBracket,
      bracketType: BracketType.StopLoss,
      newPrice: modifiedBrackets.stopLoss,
    });
  }

  private async editPositionsApi(body: any): Promise<any> {
    try {
      const response = await makePostApiRequest(
        `${BASE_URL}/api/Position/update_position`,
        body
      );

      return response; // Return the broker's response
    } catch (error: any) {
      throw new Error("Failed to edit position: " + error.message);
    }
  }
  /** Closes a position by the specified ID */
  public async closePosition(positionId: string): Promise<void> {
    const position = this._positionById[positionId];
    const symbolWithSuffix = this.appendSuffix(position.symbol);

    // Check if the position exists
    if (!position) {
      return Promise.reject(new Error("Position not found"));
    }

    const handler = () => {
      this.placeOrder({
        symbol: symbolWithSuffix,
        side: position.side === Side.Sell ? Side.Buy : Side.Sell,
        type: OrderType.Market,
        qty: position.qty,
        positionId: parseInt(positionId),
      } as unknown as PreOrder);
    };

    await handler();
  }

  /** Returns users's active orders */
  public async orders(): Promise<Order[]> {
    if (this.currentAccountSelected) {
      await this.fetchOrders();
    }
    return this._orders();
  }

  /** Returns user's positions */
  public async positions(): Promise<Position[]> {
    if (this.currentAccountSelected) {
      await this.fetchPositions();
    }
    if (this._positionlist.length > 0) {
      this._positionlist.forEach((position) => {
        // this._positionById[position.id] = position;
        // Check if this position is new or updated before processing
        const existingPosition = this._positionById[position.id];

        // If position does not exist or is updated, call _updatePosition()
        if (
          !existingPosition ||
          existingPosition.qty !== position.qty ||
          existingPosition.price !== position.price
        ) {
          this._updatePosition(position);
          console.log("position", position);
        }
      });
    }
    return Promise.resolve(this._positionlist.slice());
  }

  /** Returns executions for the specified symbol */
  public executions(symbol: string): Promise<Execution[]> {
    return Promise.resolve(
      this._executions.filter((data: Execution) => {
        return data.symbol === symbol;
      })
    );
  }

  /** Reverses the side of a position */
  public async reversePosition(positionId: string): Promise<void> {
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
        side: position.side === Side.Sell ? Side.Buy : Side.Sell,
        type: OrderType.Market,
        qty: position.qty * 2,
        positionId: parseInt(positionId),
      } as unknown as PreOrder);
    };

    await handler();
  }

  /** Cancels a single order with a given ID */
  public cancelOrder(orderId: string): Promise<void> {
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
        order.status = OrderStatus.Placing;
        this._updateOrder(order);

        // Make API call to broker to cancel the order
        const response = await this.cancelOrderApi(orderId);

        if (response.success) {
          // Update the order status to Canceled in TradingView
          order.status = OrderStatus.Canceled;
          order.id = orderId.toString();
          this._updateOrder(order);

          // return Promise.resolve();
        } else {
          // Handle broker's API failure response
          console.error("Failed to cancel order:", response.message);
          order.status = OrderStatus.Rejected;
          this._updateOrder(order);
          return Promise.reject(new Error(response.message));
        }
      } catch (error: any) {
        // Handle any errors from the API call itself
        console.error("Error canceling order via API:", error);
        order.status = OrderStatus.Rejected;
        this._updateOrder(order);
        return Promise.reject(new Error(error.message));
      }
    };
    // Cancel associated bracket orders if any exist
    this._getBrackets(order.id).forEach((bracket: Order) => {
      this.cancelOrder(bracket.id);
    });
    return handler();
  }

  /** Helper method for calling the broker's API to cancel the order */
  private async cancelOrderApi(orderId: string): Promise<any> {
    try {
      // Replace with your actual broker's cancel API endpoint and payload structure
      const response = await makeApiRequest(
        `${BASE_URL}/api/Order/cancel?ticket=${orderId}`
      );
      return response; // Return the broker's response
    } catch (error: any) {
      throw new Error("Failed to cancel order: " + error.message);
    }
  }

  /** Cancels multiple orders for a symbol and side */
  public cancelOrders(
    symbol: string,
    side: Side | undefined,
    ordersIds: string[]
  ): Promise<void> {
    const closeHandler = () => {
      return Promise.all(
        ordersIds.map((orderId: string) => {
          return this.cancelOrder(orderId);
        })
      ).then(() => {}); // tslint:disable-line:no-empty
    };

    return closeHandler();
  }

  /** Builds the Account Manager that displays trading information */
  public accountManagerInfo(): AccountManagerInfo {
    // Data object for the "Account Summary" row
    const summaryProps: AccountManagerSummaryField[] = [
      {
        text: "Balance",
        wValue: this._balanceValue,
        formatter: StandardFormatterName.Fixed, // Default value
        isDefault: true,
      },
      {
        text: "Equity",
        wValue: this._equityValue,
        formatter: StandardFormatterName.Fixed, // Default value
        isDefault: true,
      },
      {
        text: "P/L",
        wValue: this._plValue,
        formatter: StandardFormatterName.Profit,
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
      contextMenuActions: (
        contextMenuEvent: MouseEvent,
        activePageActions: ActionMetaInfo[]
      ) => {
        return Promise.resolve(this._bottomContextMenuItems(activePageActions));
      },
    };
  }

  /**
   * Returns symbol information.
   * The library calls this method when users open the Order Ticket or DOM panel.
   */
  public async symbolInfo(symbol: string): Promise<InstrumentInfo> {
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
  public currentAccount() {
    if (this.currentAccountSelected === undefined) {
      this.currentAccountSelected = this._accountlist[0]?.id;
    }

    return this.currentAccountSelected;
  }

  /** Represents a mock function and returns information about the account with an ID '1' */
  public async accountsMetainfo(): Promise<AccountMetainfo[]> {
    console.log("sequence accountsMetainfo");
    if (this._accountlist.length === 0) {
      await this.fetchUser();
    }

    if (this.currentAccountSelected == undefined) {
      this.currentAccountSelected = this._accountlist[0]?.id;
    }
    return [...this._accountlist];
  }
  private _accountSuffixes: Map<string, string> = new Map();

  setCurrentAccount(id: AccountId) {
    this.currentAccountSelected = id;
    loginNumber = parseInt(id);
    this.fetchAccountData();
   
    //close socket connection & reinitialize with new loginNumber
    this.restartSocketForGetSelectedAccount();
    this._host.currentAccountUpdate();
    const suffix = this._accountSuffixes.get(id) || "";
    try {
      localStorage.setItem("suffix", suffix);
    } catch (e) {
      console.error("Error accessing localStorage", e);
    }
    try {
      localStorage.setItem(LAST_USED_ACCOUNT_STORAGE_KEY, id);
    } catch (e) {
      console.error("Error accessing localStorage", e);
    }
  }

  private restartSocketForGetSelectedAccount() {
    this._balanceEquityStreaming.close();
    this._balanceEquityStreaming.unsubscribe(
      this.handleWebSocketUpdates.bind(this)
    );
    this._balanceEquityStreaming = new BalanceEquityStreaming(loginNumber);
    this._balanceEquityStreaming.subscribe(
      this.handleWebSocketUpdates.bind(this)
    );
  }
  /** Creates custom items in the Account Manager context menu */
  private _bottomContextMenuItems(
    activePageActions: ActionMetaInfo[]
  ): ActionMetaInfo[] {
    const separator: MenuSeparator = { separator: true };
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
            sellBuyButtonsVisibility.setValue(
              !sellBuyButtonsVisibility.value()
            );
          }
        },
        checkable: true,
        checked:
          sellBuyButtonsVisibility !== null && sellBuyButtonsVisibility.value(),
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
  private _createPositionForOrder(order: Order): Position {
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
      } else {
        position.avgPrice = position.avgPrice;

        const amountToClose = Math.min(orderQty, position.qty);
        this._accountManagerData.balance +=
          (order.price - position.avgPrice) *
          amountToClose *
          (position.side === Side.Sell ? -1 : 1);
      }

      // Recalculate position quantity
      position.qty = position.qty + order.qty * sign;

      // Get an array of bracket orders associated with the position ID
      const brackets = this._getBrackets(position.id);

      // Check the position quantity: whether it is closed
      if (position.qty <= 0) {
        brackets.forEach((bracket: Order) => {
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
      } else {
        /*
                          If the position quantity is positive (which indicates the position is open),
                          go through brackets and update their side and quantity to match the position's side and quantity.
                          */
        brackets.forEach((bracket: Order) => {
          bracket.side = changeSide(position.side);
          bracket.qty = position.qty;

          this._updateOrder(bracket);
        });
      }
    } else {
      // Create a new position object if it doesn't exist
      position = {
        ...order,
        id: order.id,
        avgPrice: order.price,
      };
    }

    // Create execution object for executed order
    const execution: Execution = {
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

  /** Handles updates to the equity value by calling the `equityUpdate` method of the Trading Host */
  private _handleEquityUpdate = (value: number): void => {
    this._host.equityUpdate(value);
  };

  /**
   * Updates order objects by calling the `orderPartialUpdate` method of the Trading Host.
   * `orderPartialUpdate` is used if the Account Manager has custom columns.
   * In this example, the Account Manager has the custom column called "Last".
   */
  private _updateOrderLast(order: Order): void {
    this._host.orderPartialUpdate(order.id, { last: order.last });
  }

  /** Retrieves all orders stored in the `_orderById` map and returns an array containing all orders */
  private _orders(): Order[] {
    //  Object.values(this._orderById);
    if (this._orderlist.length > 0) {
      this._orderlist.forEach((order) => {
        // this._orderById[order.id] = order;
        // Check if this order is new or updated before processing
        const existingOrder = this._orderById[order.id];

        // If the order does not exist or has been modified, call _updateOrder()
        if (
          !existingOrder ||
          existingOrder.qty !== order.qty ||
          existingOrder.price !== order.price
        ) {
          this._updateOrder(order);
          console.log("orders", order);
        }
      });
    }
    return Object.values(this._orderById);
  }

  private async sendRequest(body: any) {
    try {
      const response = await makePostApiRequest(
        `${BASE_URL}/api/Trade/send_request`,
        body
      );

      return response;
    } catch (error) {
      console.error("[sendRequest]:  error=", error);
    }
  }
  private _updateOrder(order: Order & Symbol): void {
    console.log("placeOrder _updateOrder 1",order);
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
      // timeSetup:Date.now()
      symbol:this.getSymbolWithPrefix(order.symbol),
    });

    if (order.parentId !== undefined) {
      const entity =
        order.parentType === ParentType.Position
          ? this._positionById[order.parentId]
          : this._orderById[order.parentId];

      if (entity === undefined) {
        return;
      }

      if (order.limitPrice !== undefined) {
        entity.takeProfit =
          order.status !== OrderStatus.Canceled ? order.limitPrice : undefined;
      }

      if (order.stopPrice !== undefined) {
        entity.stopLoss =
          order.status !== OrderStatus.Canceled ? order.stopPrice : undefined;
      }

      if (order.parentType === ParentType.Position) {
        return this._updatePosition(({...entity as Position, timeSetup:order.timeSetup}));
      }
      this._updateOrder(entity as Order);
    }
  }

  private getSymbolWithPrefix(symbol: string): string {
    return symbol.includes(":") ? symbol : `Opofinance:${symbol}`;
  }

  /** Updates a given position */
  private _updatePosition(position: Position): void {
    const hasPositionAlready = Boolean(this._positionById[position.id]);
    position.symbol=this.getSymbolWithPrefix(position.symbol);
    
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

  private _ensureRealtimeSubscription(symbol: string): void {
    if (!this._isSubscribedToRealtime(symbol)) {
      this.subscribeRealtime(symbol);
    }
  }

  private _unsubscribeRealtimeIfNeeded(symbol: string): void {
    if (!this._isSymbolUsed(symbol) && this._isSubscribedToRealtime(symbol)) {
      this.unsubscribeRealtime(symbol);
    }
  }

  private _isSymbolUsed(symbol: string): boolean {
    // Check if any orders or positions are using the symbol
    return (
      Object.values(this._orderById).some((order) => order.symbol === symbol) ||
      Object.values(this._positionById).some(
        (position) => position.symbol === symbol
      )
    );
  }

  private _isSubscribedToRealtime(symbol: string): boolean {
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

  private _mapQuoteValuesToTradingQuotes(
    quoteValues: DatafeedQuoteValues
  ): TradingQuotes {
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

  public subscribeRealtime(symbol: string): void {
    const adjustedSymbol = this.appendSuffix(
      symbol.includes(":") ? symbol.split(":")[1] : symbol
    );
    const subscriptionId = getDatafeedSubscriptionId(`realtime-${symbol}`);

    // Subscribe to the datafeed
    this._quotesProvider.subscribeQuotes(
      [],
      [adjustedSymbol],
      (quotes: QuoteData[]) => {
        const quoteData = quotes[0];
        if (quoteData.s !== "ok") {
          console.error(
            `Error in quote data for symbol ${symbol}: ${quoteData.s}`
          );
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
        } else {
          // Handle the case where lastPrice is undefined
          // You can set a default number of digits, e.g., 5
          this._symbolDigits[symbol] = 5; // Default value; adjust as necessary
        }
        // Map DatafeedQuoteValues to TradingQuotes
        const tradingQuotes: TradingQuotes =
          this._mapQuoteValuesToTradingQuotes(quoteValues);

        // Call the host's realtimeUpdate method
        this._host.realtimeUpdate(symbol, tradingQuotes);

        // Process the real-time data to update orders and positions
        this._handleRealTimeUpdate(symbol, quoteValues);
      },
      subscriptionId
    );

    this._subscribedSymbols.add(symbol);

    console.log(
      `Subscribed to real-time updates for ${symbol} with ID ${subscriptionId}`
    );
  }


  private calculateDigitsFromPrice(price: number | undefined): number {
    if (price === undefined) {
      return 0; // Or throw an error, or return a default value
    }
    const priceStr = price.toString();
    const decimalIndex = priceStr.indexOf('.');
    if (decimalIndex === -1) return 0; // No decimal point means zero digits
    const fractionalPart = priceStr.slice(decimalIndex + 1);
    return fractionalPart.length;
  }

  public unsubscribeRealtime(symbol: string): void {
    const subscriptionId = getDatafeedSubscriptionId(`realtime-${symbol}`);
    this._quotesProvider.unsubscribeQuotes(subscriptionId);
    this._subscribedSymbols.delete(symbol);
    console.log(
      `Unsubscribed from real-time updates for ${symbol} with ID ${subscriptionId}`
    );
  }

  private _handleRealTimeUpdate(
    symbol: string,
    quoteValues: DatafeedQuoteValues
  ): void {
    const lastPrice = quoteValues.last_price || quoteValues.lp; // Use 'lp' if 'last_price' is not available
    if (lastPrice === undefined) {
      return;
    }

    // Update orders
    Object.values(this._orderById).forEach((order) => {
      if (order.symbol === symbol && order.status === OrderStatus.Working) {
        if (order.last === lastPrice) {
          return;
        }

        order.last = lastPrice;
        if (order.price == null) {
          order.price = order.last;
        }

        const executionChecks = {
          [Side.Sell]: {
            [OrderType.Market]: () => !!order.price,
            [OrderType.Limit]: () =>
              order.limitPrice !== undefined && order.last >= order.limitPrice,
            [OrderType.Stop]: () =>
              order.stopPrice !== undefined && order.last <= order.stopPrice,
            [OrderType.StopLimit]: () => false,
          },
          [Side.Buy]: {
            [OrderType.Market]: () => !!order.price,
            [OrderType.Limit]: () =>
              order.limitPrice !== undefined && order.last <= order.limitPrice,
            [OrderType.Stop]: () =>
              order.stopPrice !== undefined && order.last >= order.stopPrice,
            [OrderType.StopLimit]: () => false,
          },
        };

        if (executionChecks[order.side][order.type]()) {
          const positionData = { ...order };

          order.price = order.last;
          order.avgPrice = order.last;

          const position = this._createPositionForOrder(positionData);
          order.status = OrderStatus.Filled;

          this._updateOrder(order);

          // Execute bracket orders
          this._getBrackets(order.id).forEach((bracket: Order) => {
            bracket.status = OrderStatus.Working;
            bracket.parentId = position.id;
            bracket.parentType = ParentType.Position;

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
          (position.side === Side.Sell ? -1 : 1);
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
  getSymbolName(symbol: string): string {
    return symbol.includes(":") ? symbol.split(":")[1] : symbol;
  }
  /** Creates an order with bracket orders and returns an array of data objects representing these orders */
  private _createOrderWithBrackets(preOrder: PreOrder): Order[] {
    const orders: Order[] = [];

    const order: Order = this._createOrder(preOrder);

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
  private _getBrackets(parentId: string): Order[] {
    return this._orders().filter(
      (order: Order) =>
        order.parentId === parentId &&
        activeOrderStatuses.includes(order.status)
    );
  }

  /** Creates a working order based on the `PreOrder` object and returns an object that contains information about this order */
  private _createOrder(preOrder: PreOrder): Order {
    return {
      id: `${this._idsCounter++}`,
      duration: preOrder.duration, // duration is not used in this sample
      limitPrice: preOrder.limitPrice,
      profit: 0,
      qty: preOrder.qty,
      side: preOrder.side || Side.Buy,
      status: OrderStatus.Working,
      stopPrice: preOrder.stopPrice,
      symbol: preOrder.symbol,
      type: preOrder.type || OrderType.Market,
      takeProfit: preOrder.takeProfit,
      stopLoss: preOrder.stopLoss,
      symbolName: preOrder.symbol,
    };
  }

  /** Creates a take-profit order and returns an object that contains information about this order */
  private _createTakeProfitBracket(entity: Order | Position): Order {
    return {
      symbol: entity.symbol,
      qty: entity.qty,
      id: `${this._idsCounter++}`,
      parentId: entity.id,
      parentType: ParentType.Order,
      limitPrice: entity.takeProfit,
      side: changeSide(entity.side),
      status: OrderStatus.Inactive,
      type: OrderType.Limit,
      symbolName: entity.symbol,
    };
  }

  /** Creates a stop-loss order and returns an object that contains information about this order */
  private _createStopLossBracket(entity: Order | Position) {
    return {
      symbol: entity.symbol,
      qty: entity.qty,
      id: `${this._idsCounter++}`,
      parentId: entity.id,
      parentType: ParentType.Order,
      stopPrice: entity.stopLoss,
      price: entity.stopPrice,
      side: changeSide(entity.side),
      status: OrderStatus.Inactive,
      type: OrderType.Stop,
      symbolName: entity.symbol,
    };
  }

  /** Gets a take-profit order by searching among the orders associated with a given order or position that has a non-undefined `limitPrice` */
  private _getTakeProfitBracket(entity: Order | Position): Order | undefined {
    return this._getBrackets(entity.id).find(
      (bracket: Order) => bracket.limitPrice !== undefined
    );
  }

  /** Gets a stop-loss order by searching among the orders associated with a given order or position that has a non-undefined `stopPrice` */
  private _getStopLossBracket(entity: Order | Position): Order | undefined {
    return this._getBrackets(entity.id).find(
      (bracket: Order) => bracket.stopPrice !== undefined
    );
  }

  /** Updates the orders' bracket orders based on the provided parameters */
  private _updateOrdersBracket(params: UpdateParentBracketParams): void {
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
    if (bracketType === BracketType.TakeProfit) {
      const takeProfitBracket = shouldCreateNewBracket
        ? this._createTakeProfitBracket(parent)
        : { ...bracket, limitPrice: newPrice };

      this._updateOrder(takeProfitBracket);

      return;
    }

    // Handle the stop-loss bracket order type
    if (bracketType === BracketType.StopLoss) {
      const stopLossBracket = shouldCreateNewBracket
        ? this._createStopLossBracket(parent)
        : { ...bracket, stopPrice: newPrice };

      this._updateOrder(stopLossBracket);

      return;
    }
  }

  /** Updates the positions' bracket orders based on the provided parameters */
  private _updatePositionsBracket(params: UpdateParentBracketParams): void {
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
    if (bracketType === BracketType.TakeProfit) {
      // If `true`, create a new take-profit bracket
      if (shouldCreateNewBracket) {
        const takeProfitBracket = this._createTakeProfitBracket(parent);

        takeProfitBracket.status = OrderStatus.Working;
        takeProfitBracket.parentType = ParentType.Position;

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
    if (bracketType === BracketType.StopLoss) {
      // If `true`, create a new stop-loss bracket
      if (shouldCreateNewBracket) {
        const stopLossBracket = this._createStopLossBracket(parent);

        stopLossBracket.status = OrderStatus.Working;
        stopLossBracket.parentType = ParentType.Position;

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
  private _setCanceledStatusAndUpdate(order: Order): void {
    order.status = OrderStatus.Canceled;

    this._updateOrder(order);
  }

  /** Sets the order status to "Filled" and updates the order object */
  private _setFilledStatusAndUpdate(order: Order): void {
    order.status = OrderStatus.Filled;

    this._updateOrder(order);
  }
}

/** Changes the position or order side to its opposite and returns the modified `side` property */
function changeSide(side: Side): Side {
  return side === Side.Buy ? Side.Sell : Side.Buy;
}

/** Gets a datafeed subscription ID */
function getDatafeedSubscriptionId(id: string): string {
  return `SampleBroker-${id}`;
}
