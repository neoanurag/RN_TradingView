/**
 * This file defines the structure of the Account Manager pages: "Orders", "Positions", and "Account Summary".
 * Each Account Manager page is a table, where each column is an `AccountManagerColumnBase` object.
 * These objects are used in the `accountManagerInfo` method which builds the Account Manager.
 */
import {
  AccountManagerColumn,
  OrderTableColumn,
  OrderStatusFilter,
  StandardFormatterName,
  FormatterName,
  CommonAccountManagerColumnId,
} from "../../charting_library/broker-api";

/**
 * Column structure for the "Orders" page
 */
export const ordersPageColumns: OrderTableColumn[] = [
  {
    label: "Time",
    id: "time",
    dataFields: ["timeSetup"],
    formatter: StandardFormatterName.Date,
  },
  {
    label: "Symbol",
    formatter: StandardFormatterName.Symbol,
    id: CommonAccountManagerColumnId.Symbol,
    dataFields: ["symbolName", "symbolName", "message"],
  },
  {
    label: "Side",
    id: "side",
    dataFields: ["side"],
    formatter: StandardFormatterName.Side,
  },
  {
    label: "Type",
    id: "type",
    dataFields: ["type", "parentId", "stopType"],
    formatter: StandardFormatterName.Type,
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
    formatter: StandardFormatterName.FormatPrice,
  },
  {
    label: "Stop Price",
    alignment: "right",
    id: "stopPrice",
    dataFields: ["stopPrice"],
    formatter: StandardFormatterName.FormatPrice,
  },
  {
    label: "Last",
    alignment: "right",
    id: "last",
    dataFields: ["last"],
    formatter: StandardFormatterName.FormatPriceForexSup,
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
    formatter: StandardFormatterName.Status,
    supportedStatusFilters: [OrderStatusFilter.All],
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
export const positionsPageColumns: AccountManagerColumn[] = [
  {
    label: "Time",
    id: "time",
    dataFields: ["timeCreate"],
    formatter: StandardFormatterName.Date,
  },
  {
    label: "Symbol",
    formatter: StandardFormatterName.Symbol,
    id: CommonAccountManagerColumnId.Symbol,
    dataFields: ["symbolName", "symbolName", "message"],
  },
  {
    label: "Side",
    id: "side",
    dataFields: ["side"],
    formatter: StandardFormatterName.Side,
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
    formatter: StandardFormatterName.FormatPrice,
  },
  {
    label: "Current",
    alignment: "right",
    id: "last",
    dataFields: ["last"],
    formatter: StandardFormatterName.FormatPriceForexSup,
    highlightDiff: true,
  },
  {
    label: "Profit",
    alignment: "right",
    id: "pl",
    dataFields: ["pl"],
    formatter: StandardFormatterName.Profit,
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
export const accountSummaryColumns: AccountManagerColumn[] = [
  {
    label: "Title",
    notSortable: true,
    id: "title",
    dataFields: ["title"],
    formatter: "custom_uppercase" as FormatterName,
  },
  {
    label: "Balance",
    alignment: "right",
    id: "balance",
    dataFields: ["balance"],
    formatter: StandardFormatterName.Fixed,
  },
  {
    label: "Open PL",
    alignment: "right",
    id: "pl",
    dataFields: ["pl"],
    formatter: StandardFormatterName.Profit,
    notSortable: true,
  },
  {
    label: "Equity",
    alignment: "right",
    id: "equity",
    dataFields: ["equity"],
    formatter: StandardFormatterName.Fixed,
    notSortable: true,
  },
];

/**
 * Column structure for the "History" page
 */
export const historyPageColumns: AccountManagerColumn[] = [
  {
    label: "Time",
    id: "time",
    dataFields: ["timeSetup"],
    formatter: StandardFormatterName.Date,
  },

  {
    label: "Symbol",
    formatter: StandardFormatterName.Symbol,
    id: CommonAccountManagerColumnId.Symbol,
    dataFields: ["symbol", "symbol", "message"],
  },
  {
    label: "Side",
    id: "side",
    dataFields: ["side"],
    formatter: StandardFormatterName.Side,
  },
  {
    label: "Quantity",
    alignment: "right",
    id: "qty",
    dataFields: ["qty"],
    formatter: StandardFormatterName.Fixed, 
  },
  {
    label: "Limit Price",
    alignment: "right",
    id: "limitPrice",
    dataFields: ["limitPrice"],
    formatter: StandardFormatterName.FormatPrice,
  },
  {
    label: "Stop Price",
    alignment: "right",
    id: "stopPrice",
    dataFields: ["stopPrice"],
    formatter: StandardFormatterName.FormatPrice,
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
    formatter: StandardFormatterName.Status, 
  },
  {
    label: "Order ID",
    notSortable: true,
    id: "id",
    dataFields: ["id"],
  },
];
