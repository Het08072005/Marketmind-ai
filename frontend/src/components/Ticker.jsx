import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";

const getStoredTickers = () => {
  try {
    const raw = localStorage.getItem("marketmind_live_tickers");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [];
};

export default function Ticker() {
  const [tickerList, setTickerList] = useState(getStoredTickers);
  const [activeSymbol, setActiveSymbol] = useState(() => window.__SELECTED_STOCK_SYMBOL || "RELIANCE");

  useEffect(() => {
    let isMounted = true;
    const fetchLivePrices = async () => {
      try {
        const stocks = await apiClient.getStocks();
        if (isMounted && stocks && stocks.length > 0) {
          const formatted = stocks.slice(0, 14).map((s) => {
            const isPos = !s.change.startsWith("-") && !s.change.startsWith("−");
            return {
              s: s.symbol,
              p: typeof s.price === "number" ? s.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : s.price,
              c: s.change,
              up: isPos,
            };
          });
          setTickerList(formatted);
          try {
            localStorage.setItem("marketmind_live_tickers", JSON.stringify(formatted));
            localStorage.setItem("marketmind_live_stocks", JSON.stringify(stocks));
          } catch (e) {}
        }
      } catch (e) {
        console.warn("Live ticker synchronization note:", e);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleStockChanged = (e) => {
      if (e.detail?.symbol) {
        setActiveSymbol(e.detail.symbol);
      }
    };
    window.addEventListener("marketmind:stock_changed", handleStockChanged);
    return () => window.removeEventListener("marketmind:stock_changed", handleStockChanged);
  }, []);

  const handleTickClick = (sym) => {
    window.__SELECTED_STOCK_SYMBOL = sym;
    setActiveSymbol(sym);
    window.dispatchEvent(new CustomEvent("marketmind:stock_changed", { detail: { symbol: sym } }));
  };

  const renderTicks = (list, keyPrefix) => {
    if (!list || list.length === 0) {
      return (
        <span className="tick" style={{ opacity: 0.75 }}>
          <span className="pulse-dot" style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", marginRight: 6 }}></span>
          <b>NSE LIVE FEED</b> Connecting to real-time market data...
        </span>
      );
    }

    return list.map((t, idx) => {
      const isSelected = activeSymbol && (t.s.toUpperCase() === activeSymbol.toUpperCase());
      return (
        <span
          key={`${keyPrefix}-${t.s}-${idx}`}
          className={`tick ${isSelected ? "selected" : ""}`}
          onClick={() => handleTickClick(t.s)}
          style={{
            cursor: "pointer",
            padding: isSelected ? "3px 10px" : "3px 8px",
            borderRadius: "6px",
            border: isSelected ? "1px solid rgba(243, 213, 155, 0.45)" : "1px solid transparent",
            background: isSelected ? "rgba(255, 255, 255, 0.08)" : "transparent",
            transition: "all 0.2s ease"
          }}
          title={`Click to analyze ${t.s} (Real Live Quote)`}
        >
          <b>{t.s}</b> ₹{t.p}{" "}
          <span className={t.up ? "up" : "down"}>{t.c}</span>
        </span>
      );
    });
  };

  return (
    <div className="ticker-wrap">
      <div className="ticker-track" id="tickerTrack">
        {renderTicks(tickerList, "set1")}
        {renderTicks(tickerList, "set2")}
      </div>
    </div>
  );
}
