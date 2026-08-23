import React, { useState } from "react";
import { initialHoldings } from "../data/mockData";

export default function PortfolioPage() {
  const [activeTimeframe, setActiveTimeframe] = useState("1D");
  const [orderType, setOrderType] = useState("Buy");
  const [symbol, setSymbol] = useState("RELIANCE");
  const [quantity, setQuantity] = useState("25");
  const [orderExecutionType, setOrderExecutionType] = useState("Market");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handlePlaceOrder = () => {
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Portfolio Simulator</h2>
          <p>A risk-free sandbox to build, size and stress-test strategies with virtual capital before real money is on the line.</p>
        </div>
        <div className="chip-tabs">
          {["1D", "1W", "1M", "1Y", "All"].map((tf) => (
            <div
              key={tf}
              className={`chip-tab ${activeTimeframe === tf ? "active" : ""}`}
              onClick={() => setActiveTimeframe(tf)}
            >
              {tf}
            </div>
          ))}
        </div>
      </div>

      <div className="card c8">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Equity Curve</span><h3>Virtual NAV Performance</h3></div></div>
          <span className="tag live">+18.6% all-time</span>
        </div>
        <div className="metric-strip">
          <div className="metric"><div className="v">₹12,84,320</div><div className="l">Net Asset Value</div></div>
          <div className="metric"><div className="v" style={{ color: "#2F6F62" }}>+₹41,860</div><div className="l">Today's P&amp;L</div></div>
          <div className="metric"><div className="v">₹2,10,000</div><div className="l">Buying Power</div></div>
          <div className="metric"><div className="v">6</div><div className="l">Open Positions</div></div>
        </div>
        <svg viewBox="0 0 560 160" width="100%" height="160" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pfFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8935A" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#B8935A" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <line x1="0" y1="40" x2="560" y2="40" stroke="#EEE6D2"/>
          <line x1="0" y1="80" x2="560" y2="80" stroke="#EEE6D2"/>
          <line x1="0" y1="120" x2="560" y2="120" stroke="#EEE6D2"/>
          <polyline
            points="0,120 40,116 80,124 120,100 160,108 200,84 240,92 280,64 320,74 360,44 400,54 440,28 480,38 520,12 560,22"
            fill="none"
            stroke="#B8935A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon
            points="0,120 40,116 80,124 120,100 160,108 200,84 240,92 280,64 320,74 360,44 400,54 440,28 480,38 520,12 560,22 560,160 0,160"
            fill="url(#pfFill)"
          />
        </svg>
      </div>

      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Paper Trading</span><h3 style={{ fontSize: "18px" }}>Order Ticket</h3></div></div>
        </div>
        <div className="toggle-pair">
          <button
            type="button"
            className={`buy ${orderType === "Buy" ? "active" : ""}`}
            onClick={() => setOrderType("Buy")}
          >
            Buy
          </button>
          <button
            type="button"
            className={`sell ${orderType === "Sell" ? "active" : ""}`}
            onClick={() => setOrderType("Sell")}
          >
            Sell
          </button>
        </div>
        <div className="field">
          <label>Symbol</label>
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
        </div>
        <div className="field">
          <label>Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="field">
          <label>Order Type</label>
          <select value={orderExecutionType} onChange={(e) => setOrderExecutionType(e.target.value)}>
            <option>Market</option>
            <option>Limit</option>
            <option>Stop-Loss</option>
          </select>
        </div>
        <button className="btn-block" type="button" onClick={handlePlaceOrder}>
          {orderSuccess ? `✓ ${orderType} Order Executed!` : "Place Simulated Order"}
        </button>
      </div>

      <div className="section-title"><h2>Holdings</h2><div className="rule"></div></div>
      <div className="card c12">
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Avg. Price</th>
                <th>LTP</th>
                <th>P&amp;L</th>
                <th>Weight</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {initialHoldings.map((h, i) => (
                <tr key={i}>
                  <td className="sym"><span className="row-logo">{h.logo}</span>{h.sym}</td>
                  <td className="num">{h.qty}</td>
                  <td className="num">{h.avgPrice}</td>
                  <td className="num">{h.ltp}</td>
                  <td className="num" style={{ color: h.positive ? "#2F6F62" : "#A14545" }}>{h.pnl}</td>
                  <td className="num">{h.weight}</td>
                  <td><button className="pill-btn ghost" onClick={() => setSymbol(h.sym.toUpperCase())}>Trade</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
