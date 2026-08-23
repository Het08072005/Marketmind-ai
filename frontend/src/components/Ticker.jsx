import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { tickers as fallbackTickers } from "../data/mockData";

export default function Ticker() {
  const [tickerList, setTickerList] = useState(fallbackTickers);

  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const stocks = await apiClient.getStocks();
        if (stocks && stocks.length > 0) {
          const formatted = stocks.slice(0, 12).map((s) => {
            const isPos = !s.change.startsWith("-") && !s.change.startsWith("−");
            return {
              s: s.symbol,
              p: typeof s.price === "number" ? s.price.toLocaleString("en-IN") : s.price,
              c: s.change,
              up: isPos,
            };
          });
          setTickerList(formatted);
        }
      } catch (e) {
        console.warn("Using fallback tickers", e);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 20000);
    return () => clearInterval(interval);
  }, []);

  const renderTicks = (list, keyPrefix) =>
    list.map((t, idx) => (
      <span key={`${keyPrefix}-${t.s}-${idx}`} className="tick">
        <b>{t.s}</b> ₹{t.p}{" "}
        <span className={t.up ? "up" : "down"}>{t.c}</span>
      </span>
    ));

  return (
    <div className="ticker-wrap">
      <div className="ticker-track" id="tickerTrack">
        {renderTicks(tickerList, "set1")}
        {renderTicks(tickerList, "set2")}
      </div>
    </div>
  );
}
