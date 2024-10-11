// main.js

import Datafeed from "./datafeed.js";
import { BrokerSample } from "./../broker-sample/lib/broker.js";
import tokenManager from "./token_manager.js";
import { SaveLoadAdapter } from "./save.js"; 

async function initTradingViewWidget() {
  console.log("Initializing TradingView widget...11111");
  try {
    const token = await tokenManager.getToken();
    if (token) {
      class AuthenticatedDatafeed extends Datafeed {
        constructor() {
          super();
          this.tokenManager = tokenManager;
        }
      }
      let autoSaveContent = null;
      const saveLoadAdapter = new SaveLoadAdapter(); 
      try {
        autoSaveContent = await saveLoadAdapter.loadAutoSaveChart();
      } catch (error) {
        console.log("No auto-save found, starting with a fresh chart");
      }
      
      window.tvWidget = new TradingView.widget({
        symbol: "XAUUSD",
        interval: "1",
        fullscreen: true,
        container: "tv_chart_container",
        datafeed: new AuthenticatedDatafeed(),
        library_path: "./../charting_library/",
        debug: true,
        theme: "dark",
        timezone: "Europe/Istanbul",
        disabled_features: ["header_undo_redo", "header_quick_search", "header_fullscreen_button", "adaptive_logo", "dom_widget", "support_multicharts", "header_layouttoggle"],
        broker_factory: function (host) {
          return new BrokerSample(host, new AuthenticatedDatafeed());
        },
        broker_config: {
          configFlags: {
            supportPositions: true,
            supportClosePosition: true,
            supportOrderBrackets: true,
            supportPositionBrackets: true,
            editPositionBrackets: true,
            supportEditAmount: false,
            supportOrdersHistory: true,
            supportExecutions: true,
            supportNativeReversePosition: true,
           
          },
        },
        save_load_adapter: saveLoadAdapter, 
        widgetbar: {
          datawindow: true,
          watchlist: true,
          details: true,
          watchlist_settings: {
              default_symbols: ["NZDUSD", "USDJPY", "USDCHF"],
              readonly: false
          }
      },
      });

      window.tvWidget.onChartReady(function() {
        if (autoSaveContent) {
          window.tvWidget.load(autoSaveContent);
        }

        setInterval(function() {
          window.tvWidget.save(function(chartData) {
            saveLoadAdapter.saveAutoSaveChart(chartData);
          });
        }, 4000);
      });
    }
  } catch (error) {
    console.error("Error initializing TradingView:", error);
  }
}

initTradingViewWidget();
