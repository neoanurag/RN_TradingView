/**
 * This file defines the structure of the Account Manager pages: "Orders", "Positions", and "Account Summary".
 * Each Account Manager page is a table, where each column is an `AccountManagerColumnBase` object.
 * These objects are used in the `accountManagerInfo` method which builds the Account Manager.
 */
import { AccountManagerColumn, OrderTableColumn } from '../../charting_library/broker-api';
/**
 * Column structure for the "Orders" page
 */
export declare const ordersPageColumns: OrderTableColumn[];
/**
 * Column structure for the "Positions" page
 */
export declare const positionsPageColumns: AccountManagerColumn[];
/**
 * Column structure for the custom "Account Summary" page
 */
export declare const accountSummaryColumns: AccountManagerColumn[];
