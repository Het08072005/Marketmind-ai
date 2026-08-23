import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";

export default function AlertsPage() {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState("RELIANCE");
  const [condition, setCondition] = useState("RSI crosses above");
  const [threshold, setThreshold] = useState("70");
  const [alertCreated, setAlertCreated] = useState(false);
  const [alertsList, setAlertsList] = useState([
    { id: "alt-1", symbol: "HDFCBANK", name: "HDFC Bank", condition: "RSI crosses above", threshold: "70", status: "Triggered", active: true },
    { id: "alt-2", symbol: "INFY", name: "Infosys", condition: "Price crosses above", threshold: "₹1,200", status: "Active", active: true },
    { id: "alt-3", symbol: "TATAMOTORS", name: "Tata Motors", condition: "Sentiment shifts negative", threshold: "−0.20", status: "Active", active: true },
    { id: "alt-4", symbol: "WIPRO", name: "Wipro", condition: "Price crosses below", threshold: "₹175", status: "Paused", active: false },
    { id: "alt-5", symbol: "TCS", name: "TCS", condition: "RSI crosses below", threshold: "35", status: "Active", active: true },
  ]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await apiClient.getStocks();
        if (data && data.length > 0) {
          setStocks(data);
        }
      } catch (err) {
        console.warn("Stock fetch error in alerts", err);
      }
    };
    fetchStocks();

    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (action && (action.target_page === "alerts" || action.command === "CREATE_ALERT")) {
        const sym = action.params?.symbol || "RELIANCE";
        setSymbol(sym);
        if (action.params?.condition) setCondition(action.params.condition);
        if (action.params?.threshold) setThreshold(action.params.threshold.toString());

        // Automatically create and append alert
        const newAlt = {
          id: `alt-${Date.now()}`,
          symbol: sym,
          name: sym,
          condition: action.params?.condition || "Price Alert",
          threshold: action.params?.threshold || "Active Target",
          status: "Active",
          active: true,
        };
        setAlertsList((prev) => [newAlt, ...prev]);
        setAlertCreated(true);
        setTimeout(() => setAlertCreated(false), 4000);
      }
    };

    window.addEventListener("marketmind:voice_action", handleVoiceAction);
    return () => window.removeEventListener("marketmind:voice_action", handleVoiceAction);
  }, []);

  const handleSaveAlert = () => {
    if (!symbol) return;
    const stockObj = stocks.find((s) => s.symbol === symbol);
    const newAlert = {
      id: `alt-${Date.now()}`,
      symbol: symbol,
      name: stockObj?.name || symbol,
      condition: condition,
      threshold: threshold,
      status: "Active",
      active: true,
    };
    setAlertsList([newAlert, ...alertsList]);
    setAlertCreated(true);
    setTimeout(() => setAlertCreated(false), 3000);
  };

  const toggleAlertStatus = (id) => {
    setAlertsList(alertsList.map(a => {
      if (a.id === id) {
        const nextActive = !a.active;
        return { ...a, active: nextActive, status: nextActive ? "Active" : "Paused" };
      }
      return a;
    }));
  };

  const deleteAlert = (id) => {
    setAlertsList(alertsList.filter(a => a.id !== id));
  };

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Smart Alerts &amp; Watchlist</h2>
          <p>Autonomous quantitative triggers for RSI thresholds, institutional breakouts, and sentiment anomaly detection.</p>
        </div>
        <button className="pill-btn" onClick={handleSaveAlert}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Create Alert Rule
        </button>
      </div>

      {/* Alert Rule Builder */}
      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>Quantitative Rules</span>
              <h3 style={{ fontSize: "18px" }}>Configure Alert Rule</h3>
            </div>
          </div>
        </div>
        <div className="field">
          <label>Target Company</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid var(--line)", background: "var(--paper)", fontWeight: 600 }}
          >
            {stocks.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.name} ({s.symbol}) — ₹{s.price}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Condition Trigger</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option>RSI crosses above (Overbought)</option>
            <option>RSI crosses below (Oversold)</option>
            <option>Price crosses above Resistance</option>
            <option>Price crosses below Support</option>
            <option>Sentiment shifts negative</option>
            <option>Domino effect chain triggered</option>
          </select>
        </div>
        <div className="field">
          <label>Threshold Value</label>
          <input
            type="text"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="e.g. 70, ₹1,500, -0.30"
          />
        </div>
        <button className="btn-block" type="button" onClick={handleSaveAlert}>
          {alertCreated ? "✓ Alert Rule Saved & Monitoring!" : "Save Alert Rule"}
        </button>
      </div>

      {/* Active Rules List */}
      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>Live Watch</span>
              <h3>Active Alert Rules ({alertsList.filter(a => a.active).length} Active)</h3>
            </div>
          </div>
        </div>
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Condition</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alertsList.map((a) => (
                <tr key={a.id}>
                  <td className="sym">
                    <span className="row-logo">{a.symbol.slice(0, 2)}</span>
                    <b>{a.name || a.symbol}</b>
                  </td>
                  <td>{a.condition}</td>
                  <td className="num">{a.threshold}</td>
                  <td>
                    <span className={`status-dot ${a.status === "Triggered" ? "warn" : a.active ? "on" : "off"}`}></span>
                    <span style={{ fontWeight: 600, color: a.status === "Triggered" ? "#A14545" : a.active ? "#2F6F62" : "var(--ink-soft)" }}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="pill-btn ghost" onClick={() => toggleAlertStatus(a.id)} style={{ fontSize: "11px", padding: "4px 8px" }}>
                        {a.active ? "Pause" : "Resume"}
                      </button>
                      <button className="pill-btn ghost" onClick={() => deleteAlert(a.id)} style={{ fontSize: "11px", padding: "4px 8px", color: "#A14545" }}>
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Market Watchlist */}
      <div className="section-title">
        <h2>Live Real-Time Watchlist</h2>
        <div className="rule"></div>
      </div>
      <div className="card c12">
        {stocks.slice(0, 6).map((stk) => {
          const rsiVal = stk.rsi || 55;
          const isOverbought = rsiVal >= 70;
          const isOversold = rsiVal <= 35;
          const statusTag = isOverbought ? "Overbought" : isOversold ? "Oversold" : "Steady";

          return (
            <div className="watch-row" key={stk.symbol}>
              <div className="watch-id">
                <div className="watch-logo">{stk.symbol.slice(0, 2)}</div>
                <div>
                  <div className="watch-name">{stk.name} ({stk.symbol})</div>
                  <div className="watch-sub">RSI: {rsiVal} · Sector: {stk.sector}</div>
                </div>
              </div>
              <div className="watch-right">
                <div className="watch-price">₹{stk.price?.toLocaleString("en-IN")}</div>
                <div className={`watch-change ${stk.change?.includes("+") ? "up" : "down"}`}>
                  {stk.change}
                </div>
                <span className={`alert-flag ${isOverbought ? "warn" : isOversold ? "buy" : "ok"}`} style={{ marginLeft: "12px" }}>
                  {statusTag}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
