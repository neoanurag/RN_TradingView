// datafeed.d.ts

import { LibrarySymbolInfo, SearchSymbolResultItem } from '../charting_library';

declare class Datafeed {
  constructor();
  
  onReady(callback: (configurationData: any) => void): void;
  
  getServerTime(callback: (serverTime: number) => void): Promise<void>;
  
  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: (result: SearchSymbolResultItem[]) => void
  ): Promise<void>;
  
  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: LibrarySymbolInfo) => void,
    onResolveErrorCallback: (reason: string) => void,
    extension?: any
  ): Promise<void>;
  
  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    periodParams: {
      from: number;
      to: number;
      countBack: number;
      firstDataRequest: boolean;
    },
    onHistoryCallback: (bars: any[], meta: { noData: boolean }) => void,
    onErrorCallback: (error: any) => void
  ): Promise<void>;
  
  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    onRealtimeCallback: (bar: any) => void,
    listenerGUID: string,
    onResetCacheNeededCallback: () => void
  ): void;
  
  unsubscribeBars(listenerGUID: string): void;
  
  getQuotes(
    symbols: string[],
    onDataCallback: (quotes: any[]) => void,
    onErrorCallback: (error: string) => void
  ): Promise<void>;
  
  subscribeQuotes(
    symbols: string[],
    fastSymbols: string[],
    onRealtimeCallback: (data: any[]) => void,
    listenerGUID: string
  ): void;
  
  unsubscribeQuotes(listenerGUID: string): void;
}

declare const datafeed: Datafeed;
export default Datafeed;