import React, { useState } from "react";

export default function AlertsPage() {
  const [symbol, setSymbol] = useState("HDFC Bank");
  const [condition, setCondition] = useState("RSI crosses above");
  const [threshold, setThreshold] = useState("70");
  const [alertCreated, setAlertCreated] = useState(false);

  const handleSaveAlert = () => {
    setAlertCreated(true);
    setTimeout(() => setAlertCreated(false), 3000);
  };

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Smart Alerts &amp; Watchlist</h2>
          <p>Get notified the moment price, RSI or sentiment crosses a threshold you choose.</p>
        </div>
        <button className="pill-btn" onClick={handleSaveAlert}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Create Alert
        </button>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>New Rule</span><h3 style={{ fontSize: "18px" }}>Create Alert</h3></div></div>
        </div>
        <div className="field">
          <label>Symbol</label>
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        </div>
        <div className="field">
          <label>Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option>RSI crosses above</option>
            <option>Price crosses above</option>
            <option>Price crosses below</option>
            <option>Sentiment shifts negative</option>
          </select>
        </div>
        <div className="field">
          <label>Threshold</label>
          <input type="text" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </div>
        <button className="btn-block" type="button" onClick={handleSaveAlert}>
          {alertCreated ? "✓ Alert Rule Saved!" : "Save Alert Rule"}
        </button>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Active Rules</span><h3>Alert Rules</h3></div></div>
        </div>
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Condition</th>
                <th>Threshold</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="sym">HDFC Bank</td><td>RSI crosses above</td><td className="num">70</td><td><span className="status-dot on"></span>Triggered</td><td><button className="pill-btn ghost">Edit</button></td></tr>
              <tr><td className="sym">Infosys</td><td>Price crosses above</td><td className="num">₹1,900</td><td><span className="status-dot on"></span>Active</td><td><button className="pill-btn ghost">Edit</button></td></tr>
              <tr><td className="sym">Tata Motors</td><td>Sentiment shifts negative</td><td className="num">—</td><td><span className="status-dot on"></span>Active</td><td><button className="pill-btn ghost">Edit</button></td></tr>
              <tr><td className="sym">Wipro</td><td>Price crosses below</td><td className="num">₹500</td><td><span className="status-dot off"></span>Paused</td><td><button className="pill-btn ghost">Edit</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-title"><h2>Watchlist</h2><div className="rule"></div></div>
      <div className="card c12">
        <div className="watch-row">
          <div className="watch-id"><div className="watch-logo">HD</div><div><div className="watch-name">HDFC Bank</div><div className="watch-sub">RSI crossed 72</div></div></div>
          <div className="watch-right"><div className="watch-price">₹1,672.40</div><span className="alert-flag">Overbought</span></div>
        </div>
        <div className="watch-row">
          <div className="watch-id"><div className="watch-logo">IN</div><div><div className="watch-name">Infosys</div><div className="watch-sub">Price near target</div></div></div>
          <div className="watch-right"><div className="watch-price">₹1,904.10</div><div className="watch-change up">+2.4%</div></div>
        </div>
        <div className="watch-row">
          <div className="watch-id"><div className="watch-logo">TA</div><div><div className="watch-name">Tata Motors</div><div className="watch-sub">Sentiment shift</div></div></div>
          <div className="watch-right"><div className="watch-price">₹974.85</div><div className="watch-change down">−1.1%</div></div>
        </div>
        <div className="watch-row">
          <div className="watch-id"><div className="watch-logo">WI</div><div><div className="watch-name">Wipro</div><div className="watch-sub">Alert paused</div></div></div>
          <div className="watch-right"><div className="watch-price">₹512.90</div><span className="alert-flag ok">Stable</span></div>
        </div>
        <div className="watch-row">
          <div className="watch-id"><div className="watch-logo">IT</div><div><div className="watch-name">ITC</div><div className="watch-sub">No active alerts</div></div></div>
          <div className="watch-right"><div className="watch-price">₹468.15</div><div className="watch-change up">+1.2%</div></div>
        </div>
      </div>
    </div>
  );
}
