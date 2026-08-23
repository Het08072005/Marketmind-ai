import React from "react";
import { tickers } from "../data/mockData";

export default function Ticker() {
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
        {renderTicks(tickers, "set1")}
        {renderTicks(tickers, "set2")}
      </div>
    </div>
  );
}
