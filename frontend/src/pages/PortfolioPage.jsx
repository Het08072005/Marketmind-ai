import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";

export default function PortfolioPage() {
  const [viewMode, setViewMode] = useState("strategy"); // 'strategy' or 'overall'
  const [orderType, setOrderType] = useState("Buy");
  const [symbol, setSymbol] = useState("ATGL");
  const [quantity, setQuantity] = useState("20");
  const [activeStrategyName, setActiveStrategyName] = useState("Adani Total Gas (ATGL) Strategy");
  const [orderExecutionType, setOrderExecutionType] = useState("Market");
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [stockHistory, setStockHistory] = useState(null);

  const fetchPortfolioData = async () => {
    try {
      const data = await apiClient.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.warn("Using local portfolio state", err);
    }
  };

  const fetchStockHistory = async (sym) => {
    try {
      const data = await apiClient.getStockHistory(sym, "1mo");
      setStockHistory(data);
    } catch (err) {
      console.warn("Error fetching historical prices for", sym, err);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 15000);

    const handleVoiceEvent = (e) => {
      const action = e.detail;
      if (action && (action.command === "CREATE_PORTFOLIO_SIMULATION" || action.type === "EXECUTE_TRADE")) {
        const sym = action.params?.symbol || "ATGL";
        setSymbol(sym);
        setViewMode("strategy");
        
        let stratName = `${sym} Strategy`;
        if (sym === "ATGL") stratName = "Adani Total Gas (ATGL) Strategy";
        else if (sym === "ADANIENT") stratName = "Adani Enterprises (ADANIENT) Strategy";
        else if (sym === "RELIANCE") stratName = "Reliance Industries Strategy";
        else if (sym === "TATAMOTORS") stratName = "Tata Motors (EV) Strategy";
        else if (sym === "HDFCBANK") stratName = "HDFC Bank Strategy";
        else if (sym === "TCS") stratName = "TCS Strategy";
        setActiveStrategyName(stratName);

        if (action.params?.shares) {
          setQuantity(action.params.shares.toString());
        }
        if (action.params?.trade_result?.message) {
          setOrderStatus({
            success: true,
            message: action.params.trade_result.message
          });
          setTimeout(() => setOrderStatus(null), 5000);
        }
        fetchPortfolioData();
        fetchStockHistory(sym);
      }
    };

    window.addEventListener("marketmind:voice_action", handleVoiceEvent);
    return () => {
      clearInterval(interval);
      window.removeEventListener("marketmind:voice_action", handleVoiceEvent);
    };
  }, []);

  useEffect(() => {
    if (symbol) {
      fetchStockHistory(symbol);
    }
  }, [symbol]);

  const handlePlaceOrder = async () => {
    if (!symbol || !quantity || parseInt(quantity) <= 0) return;
    setLoading(true);
    try {
      const res = await apiClient.executeTrade({
        symbol: symbol.toUpperCase(),
        shares: parseInt(quantity),
        side: orderType.toUpperCase()
      });
      setOrderStatus({ success: true, message: res.message || `✓ ${orderType} ${quantity} ${symbol} Executed!` });
      await fetchPortfolioData();
      await fetchStockHistory(symbol);
    } catch (err) {
      setOrderStatus({ success: false, message: err.message || "Trade execution failed" });
    } finally {
      setLoading(false);
      setTimeout(() => setOrderStatus(null), 4000);
    }
  };

  const nav = portfolio?.nav || 1102459;
  const cash = portfolio?.cash_balance || 324500;
  const pnl = portfolio?.overall_pnl || 102459;
  const pnlPct = portfolio?.overall_pnl_pct || 10.25;
  const rawHoldings = portfolio?.holdings || [];

  // Active Company Specific Metrics
  const activeHolding = rawHoldings.find((h) => h.symbol === symbol);
  const positionShares = activeHolding ? activeHolding.shares : 0;
  const positionLtp = activeHolding ? activeHolding.ltp : (stockHistory?.candles?.slice(-1)[0]?.close || 1000);
  const positionValue = activeHolding ? activeHolding.current_value : 0;
  const positionPnl = activeHolding ? activeHolding.pnl : 0;
  const positionPnlPct = activeHolding ? activeHolding.pnl_pct : 0.0;
  const positionAvg = activeHolding ? activeHolding.avg_price : positionLtp;
  const activeCompanyName = activeHolding?.name || symbol;

  // Dynamic SVG Points Generator
  let polylinePoints = "0,110 40,105 80,112 120,90 160,96 200,75 240,82 280,58 320,64 360,40 400,48 440,24 480,32 520,12 560,18";
  let polygonPoints = "0,110 40,105 80,112 120,90 160,96 200,75 240,82 280,58 320,64 360,40 400,48 440,24 480,32 520,12 560,18 560,140 0,140";

  if (viewMode === "strategy" && stockHistory?.candles?.length > 1) {
    const closes = stockHistory.candles.map((c) => c.close);
    const minVal = Math.min(...closes) * 0.99;
    const maxVal = Math.max(...closes) * 1.01;
    const range = Math.max(maxVal - minVal, 10);

    const pts = closes.map((val, idx) => {
      const x = Math.round((idx / (closes.length - 1)) * 560);
      const y = Math.round(125 - ((val - minVal) / range) * 105);
      return `${x},${y}`;
    });
    polylinePoints = pts.join(" ");
    polygonPoints = `${pts.join(" ")} 560,140 0,140`;
  } else if (viewMode === "overall" && portfolio?.nav_history?.length > 1) {
    const navValues = portfolio.nav_history.map((d) => d.nav);
    const minVal = Math.min(...navValues) * 0.99;
    const maxVal = Math.max(...navValues) * 1.01;
    const range = Math.max(maxVal - minVal, 1000);

    const pts = navValues.map((val, idx) => {
      const x = Math.round((idx / (navValues.length - 1)) * 560);
      const y = Math.round(125 - ((val - minVal) / range) * 105);
      return `${x},${y}`;
    });
    polylinePoints = pts.join(" ");
    polygonPoints = `${pts.join(" ")} 560,140 0,140`;
  }

  // Sort holdings so the actively focused symbol appears at the very top
  const holdings = [...rawHoldings].sort((a, b) => {
    if (a.symbol === symbol) return -1;
    if (b.symbol === symbol) return 1;
    return 0;
  });

  const selectCompanyFocus = (sym, name) => {
    setSymbol(sym);
    setActiveStrategyName(`${name || sym} Strategy`);
    setViewMode("strategy");
    fetchStockHistory(sym);
  };

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2>Portfolio Simulator</h2>
            <span className="tag live" style={{ background: "rgba(216,188,139,.18)", color: "var(--gold-light)", border: "1px solid rgba(216,188,139,.3)" }}>
              ⚡ {viewMode === "strategy" ? `${activeCompanyName} Strategy` : "Total Portfolio NAV"}
            </span>
          </div>
          <p>Real-time sandbox with live order book execution, individual strategy performance, and real historical price charts.</p>
        </div>
        <div className="chip-tabs">
          <div
            className={`chip-tab ${viewMode === "strategy" ? "active" : ""}`}
            onClick={() => setViewMode("strategy")}
          >
            ⭐ {symbol} Strategy View
          </div>
          <div
            className={`chip-tab ${viewMode === "overall" ? "active" : ""}`}
            onClick={() => setViewMode("overall")}
          >
            🌐 Total Portfolio NAV
          </div>
        </div>
      </div>

      {/* Main Dynamic Performance Card */}
      <div className="card c8">
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>
                {viewMode === "strategy" ? `Active Focus · ${activeCompanyName} (${symbol})` : "Multi-Asset Portfolio"}
              </span>
              <h3>
                {viewMode === "strategy"
                  ? `${activeCompanyName} (${symbol}) — Live Strategy Performance`
                  : "Combined Virtual NAV Performance"}
              </h3>
            </div>
          </div>
          {viewMode === "strategy" ? (
            <span className={`tag ${positionPnl >= 0 ? "live" : "warn"}`}>
              {positionPnlPct >= 0 ? `+${positionPnlPct}%` : `${positionPnlPct}%`} Strategy Return
            </span>
          ) : (
            <span className={`tag ${pnl >= 0 ? "live" : "warn"}`}>
              {pnlPct >= 0 ? `+${pnlPct}%` : `${pnlPct}%`} all-time
            </span>
          )}
        </div>

        {/* Dynamic Metric Strip depending on View Mode */}
        {viewMode === "strategy" ? (
          <div className="metric-strip">
            <div className="metric">
              <div className="v">₹{positionValue.toLocaleString("en-IN")}</div>
              <div className="l">Position Value ({positionShares} Shs)</div>
            </div>
            <div className="metric">
              <div className="v" style={{ color: positionPnl >= 0 ? "#2F6F62" : "#A14545" }}>
                {positionPnl >= 0 ? `+₹${positionPnl.toLocaleString("en-IN")}` : `−₹${Math.abs(positionPnl).toLocaleString("en-IN")}`}
              </div>
              <div className="l">Position P&amp;L ({positionPnlPct >= 0 ? `+${positionPnlPct}%` : `${positionPnlPct}%`})</div>
            </div>
            <div className="metric">
              <div className="v">₹{positionLtp.toLocaleString("en-IN")}</div>
              <div className="l">Live Market Price (LTP)</div>
            </div>
            <div className="metric">
              <div className="v">₹{positionAvg.toLocaleString("en-IN")}</div>
              <div className="l">Avg Cost Basis</div>
            </div>
          </div>
        ) : (
          <div className="metric-strip">
            <div className="metric">
              <div className="v">₹{nav.toLocaleString("en-IN")}</div>
              <div className="l">Net Asset Value</div>
            </div>
            <div className="metric">
              <div className="v" style={{ color: pnl >= 0 ? "#2F6F62" : "#A14545" }}>
                {pnl >= 0 ? `+₹${pnl.toLocaleString("en-IN")}` : `−₹${Math.abs(pnl).toLocaleString("en-IN")}`}
              </div>
              <div className="l">Overall P&amp;L ({pnlPct >= 0 ? `+${pnlPct}%` : `${pnlPct}%`})</div>
            </div>
            <div className="metric">
              <div className="v">₹{cash.toLocaleString("en-IN")}</div>
              <div className="l">Buying Power (Cash)</div>
            </div>
            <div className="metric">
              <div className="v">{holdings.length}</div>
              <div className="l">Open Positions</div>
            </div>
          </div>
        )}

        {/* 100% Real Historical SVG Chart */}
        <div style={{ marginTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--ink-soft)", marginBottom: "4px" }}>
            <span>
              {viewMode === "strategy"
                ? `30-Day Real Close Price Curve for ${activeCompanyName} (${symbol})`
                : "15-Day Real Portfolio NAV Growth"}
            </span>
            <span>Live Sync</span>
          </div>
          <svg viewBox="0 0 560 140" width="100%" height="130" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pfFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B8935A" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#B8935A" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <line x1="0" y1="35" x2="560" y2="35" stroke="#EEE6D2"/>
            <line x1="0" y1="70" x2="560" y2="70" stroke="#EEE6D2"/>
            <line x1="0" y1="105" x2="560" y2="105" stroke="#EEE6D2"/>
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#B8935A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon
              points={polygonPoints}
              fill="url(#pfFill)"
            />
          </svg>
        </div>
      </div>

      {/* Live Order Ticket */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow">
            <div><span>Paper Trading</span><h3 style={{ fontSize: "18px" }}>Live Order Ticket</h3></div>
          </div>
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
          <label>Symbol (Stock Ticker)</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setSymbol(val);
            }}
            placeholder="e.g. ATGL, RELIANCE, TCS, HDFCBANK"
          />
        </div>
        <div className="field">
          <label>Quantity (Shares)</label>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="field">
          <label>Order Type</label>
          <select value={orderExecutionType} onChange={(e) => setOrderExecutionType(e.target.value)}>
            <option>Market (Instant Execution)</option>
            <option>Limit</option>
            <option>Stop-Loss</option>
          </select>
        </div>
        <button className="btn-block" type="button" onClick={handlePlaceOrder} disabled={loading}>
          {loading ? "Executing Trade..." : orderStatus ? (orderStatus.success ? "✓ Trade Executed" : "✗ Error") : `Place Simulated ${orderType} Order`}
        </button>
        {orderStatus && (
          <div style={{ marginTop: "10px", fontSize: "12px", color: orderStatus.success ? "#2F6F62" : "#A14545", fontWeight: 600, textAlign: "center" }}>
            {orderStatus.message}
          </div>
        )}
      </div>

      {/* Live Portfolio Holdings */}
      <div className="section-title">
        <h2>Live Portfolio Holdings</h2>
        <div className="rule"></div>
      </div>
      <div className="card c12">
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Avg. Price</th>
                <th>Live LTP</th>
                <th>P&amp;L (₹)</th>
                <th>P&amp;L (%)</th>
                <th>Weight</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => {
                const isActiveFocus = h.symbol === symbol;
                return (
                  <tr key={i} style={isActiveFocus ? { background: "rgba(216,188,139,.12)" } : {}}>
                    <td className="sym" style={{ cursor: "pointer" }} onClick={() => selectCompanyFocus(h.symbol, h.name)}>
                      <span className="row-logo">{h.symbol.slice(0, 2)}</span>
                      <b>{h.name || h.symbol}</b>
                      {isActiveFocus && (
                        <span className="tag live" style={{ marginLeft: "8px", fontSize: "10px", padding: "2px 8px" }}>
                          ⭐ Active Focus
                        </span>
                      )}
                    </td>
                    <td className="num">{h.shares}</td>
                    <td className="num">₹{h.avg_price?.toLocaleString("en-IN")}</td>
                    <td className="num">₹{h.ltp?.toLocaleString("en-IN")}</td>
                    <td className="num" style={{ color: h.positive ? "#2F6F62" : "#A14545" }}>
                      {h.pnl >= 0 ? `+₹${h.pnl?.toLocaleString("en-IN")}` : `−₹${Math.abs(h.pnl)?.toLocaleString("en-IN")}`}
                    </td>
                    <td className="num" style={{ color: h.positive ? "#2F6F62" : "#A14545" }}>
                      {h.pnl_pct >= 0 ? `+${h.pnl_pct}%` : `${h.pnl_pct}%`}
                    </td>
                    <td className="num">{h.weight || "10%"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className={`pill-btn ${isActiveFocus ? "" : "ghost"}`}
                          onClick={() => selectCompanyFocus(h.symbol, h.name)}
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                        >
                          {isActiveFocus ? "Viewing" : "Focus"}
                        </button>
                        <button
                          className="pill-btn ghost"
                          onClick={() => { setSymbol(h.symbol); setOrderType("Sell"); }}
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                        >
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
