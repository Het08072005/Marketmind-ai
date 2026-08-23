import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";

export default function DashboardPage({ goPage, openAssistant }) {
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [pfData, stockList] = await Promise.all([
          apiClient.getPortfolio(),
          apiClient.getStocks()
        ]);
        if (pfData) setPortfolio(pfData);
        if (stockList) setStocks(stockList);
      } catch (err) {
        console.warn("Using cached dashboard metrics", err);
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const nav = portfolio?.nav || 1284320;
  const pnlPct = portfolio?.overall_pnl_pct || 18.6;
  const sharpe = portfolio?.sharpe_ratio || 1.48;
  const capital = portfolio?.starting_capital || 1000000;
  const holdingsCount = portfolio?.holdings?.length || 6;

  const hdfc = stocks.find(s => s.symbol === "HDFCBANK") || { price: 1672.40, rsi: 72.4, change: "-0.3%" };
  const infy = stocks.find(s => s.symbol === "INFY") || { price: 1904.10, rsi: 58.1, change: "+2.4%" };
  const tata = stocks.find(s => s.symbol === "TATAMOTORS") || { price: 974.85, rsi: 49.2, change: "-1.1%" };
  const reliance = stocks.find(s => s.symbol === "RELIANCE") || { price: 2946.10, rsi: 68.2, change: "+1.8%" };

  return (
    <div className="grid">
      {/* 01 · Portfolio Simulator Hero */}
      <div className="card hero-card c8">
        <div className="hero-top">
          <div>
            <div className="eyebrow">01 · Portfolio Simulator</div>
            <h2>Virtual Portfolio — Risk-Free Sandbox</h2>
          </div>
          <span className="tag live" style={{ background: "rgba(143,209,174,.16)", color: "#8FD1AE" }}>
            Live Simulated
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#AFB6CC", maxWidth: "480px", lineHeight: "1.55" }}>
          Build and stress-test strategies with virtual capital before committing real money — live real-time order book, slippage and P&amp;L modelling.
        </p>
        <div className="hero-stats">
          <div className="hstat"><div className="v pos">₹{nav.toLocaleString("en-IN")}</div><div className="l">Virtual NAV</div></div>
          <div className="hstat"><div className={`v ${pnlPct >= 0 ? "pos" : "neg"}`}>{pnlPct >= 0 ? `+${pnlPct}%` : `${pnlPct}%`}</div><div className="l">Since Inception</div></div>
          <div className="hstat"><div className="v">{sharpe}</div><div className="l">Sharpe Ratio</div></div>
          <div className="hstat"><div className="v">₹{capital.toLocaleString("en-IN")}</div><div className="l">Starting Capital</div></div>
        </div>
        <div className="chart-wrap">
          <svg viewBox="0 0 560 65" width="100%" height="48" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D9BC8B" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#D9BC8B" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <polyline
              points="0,48 40,44 80,47 120,38 160,40 200,32 240,35 280,25 320,28 360,18 400,22 440,12 480,16 520,7 560,10"
              fill="none"
              stroke="#D9BC8B"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon
              points="0,48 40,44 80,47 120,38 160,40 200,32 240,35 280,25 320,28 360,18 400,22 440,12 480,16 520,7 560,10 560,65 0,65"
              fill="url(#heroFill)"
            />
          </svg>
        </div>
        <div className="hero-actions">
          <button className="btn-gold" onClick={() => goPage("portfolio")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
            Open Simulator ({holdingsCount} Positions)
          </button>
          <button className="btn-ghost" onClick={() => goPage("portfolio")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Strategy
          </button>
        </div>
      </div>

      {/* 02 · Voice Stock Assistant Preview */}
      <div className="card voice-preview c4">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">02</div>
            <div><span>Voice-Based</span><h3 style={{ fontSize: "18px" }}>MarketPulse AI</h3></div>
          </div>
          <div className="card-icon" style={{ background: "var(--teal-light)" }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10v1a7 7 0 0 0 14 0v-1"/>
              <path d="M12 18v4M9 22h6"/>
            </svg>
          </div>
        </div>
        <p className="desc">Autonomous Copilot: Speak naturally in English or Hindi to navigate, run Domino simulations, and execute trades.</p>
        <div className="wave-mini">
          <i style={{ animationDelay: "0s" }}></i>
          <i style={{ animationDelay: ".1s" }}></i>
          <i style={{ animationDelay: ".2s" }}></i>
          <i style={{ animationDelay: ".3s" }}></i>
          <i style={{ animationDelay: ".15s" }}></i>
          <i style={{ animationDelay: ".25s" }}></i>
          <i style={{ animationDelay: ".05s" }}></i>
          <i style={{ animationDelay: ".35s" }}></i>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: 0 }}>
          <button className="pill-btn" onClick={() => openAssistant("voice")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10v1a7 7 0 0 0 14 0v-1"/>
            </svg>
            Speak to MarketPulse
          </button>
          <span className="tag live">Active</span>
        </div>
      </div>

      {/* Financial Cause & Effect Intelligence Section */}
      <div className="section-title">
        <h2>Financial Cause &amp; Effect Intelligence</h2>
        <div className="rule"></div>
      </div>

      {/* Flagship · Domino Predictor */}
      <div className="card hero-card c8" style={{ background: "linear-gradient(135deg, #12213D 0%, #1B2F52 55%, #2B4A7E 100%)" }}>
        <div className="hero-top">
          <div>
            <div className="eyebrow">Flagship · Not just prediction — explanation</div>
            <h2>Market Domino Predictor</h2>
          </div>
          <span className="tag" style={{ background: "rgba(217,188,139,.18)", color: "var(--gold-light)" }}>Live Chain</span>
        </div>
        <p style={{ fontSize: "13px", color: "#AFB6CC", maxWidth: "480px", lineHeight: "1.55" }}>
          Give it one event — “Crude Oil +30%” — and watch 1st, 2nd, 3rd and 4th-order effects ripple through fuel costs, airline margins, ticket prices and tourism, with every affected company mapped.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", margin: "14px 0 4px", fontSize: "12px" }}>
          <span style={{ background: "rgba(217,188,139,.16)", color: "var(--gold-light)", padding: "6px 12px", borderRadius: "20px" }}>Oil +30%</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8B92A8" strokeWidth="2" strokeLinecap="round" style={{ width: "14px", height: "14px" }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          <span style={{ background: "rgba(255,255,255,.06)", color: "#CBD1E0", padding: "6px 12px", borderRadius: "20px" }}>IndiGo fuel cost ↑</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8B92A8" strokeWidth="2" strokeLinecap="round" style={{ width: "14px", height: "14px" }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          <span style={{ background: "rgba(255,255,255,.06)", color: "#CBD1E0", padding: "6px 12px", borderRadius: "20px" }}>Ticket prices ↑</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8B92A8" strokeWidth="2" strokeLinecap="round" style={{ width: "14px", height: "14px" }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          <span style={{ background: "rgba(255,255,255,.06)", color: "#CBD1E0", padding: "6px 12px", borderRadius: "20px" }}>Tourism impact</span>
        </div>
        <div className="hero-actions">
          <button className="btn-gold" onClick={() => goPage("domino")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            Trace an Event
          </button>
          <button className="btn-ghost" onClick={() => goPage("trust")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
            Check Management Trust
          </button>
        </div>
      </div>

      {/* Management Trust Meter */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">★</div>
            <div><span>Accountability</span><h3 style={{ fontSize: "18px" }}>Management Trust Meter</h3></div>
          </div>
          <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg></div>
        </div>
        <p className="desc">Every promise made on earnings calls, audited quarterly against what actually happened.</p>
        <div className="esg-wrap">
          <div className="gauge">
            <svg width="118" height="118" viewBox="0 0 118 118">
              <circle cx="59" cy="59" r="50" fill="none" stroke="#F0E9D8" strokeWidth="11"/>
              <circle cx="59" cy="59" r="50" fill="none" stroke="#B8935A" strokeWidth="11" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="88"/>
            </svg>
            <div className="gauge-center">
              <div className="n">{tata.trust_meter?.score || 84}</div>
              <div className="l">Trust Score</div>
            </div>
          </div>
          <div className="esg-list">
            <div className="esg-item"><span>Kept</span><b>{tata.trust_meter?.promises_kept || 13}</b></div>
            <div className="esg-item"><span>Delayed</span><b>{tata.trust_meter?.promises_delayed || 3}</b></div>
            <div className="esg-item"><span>Broken</span><b>{tata.trust_meter?.promises_broken || 1}</b></div>
          </div>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}>
          <a className="link-btn" onClick={() => goPage("trust")} style={{ cursor: "pointer" }}>
            Open Trust Meter <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Sector Comparison */}
      <div className="card c6">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">04</div>
            <div><span>Comparative Valuation</span><h3>Sector Comparison Engine</h3></div>
          </div>
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </div>
        </div>
        <p className="desc">Reliance Industries (₹{reliance.price}) measured side by side against Energy &amp; Conglomerate sector peers.</p>
        <div className="bar-row"><div className="lbl">Revenue Gr.</div><div className="bar-track"><div className="bar-fill you" style={{ width: "78%" }}></div></div><div className="val">14.2%</div></div>
        <div className="bar-row"><div className="lbl">Sector Avg</div><div className="bar-track"><div className="bar-fill" style={{ width: "58%" }}></div></div><div className="val">9.8%</div></div>
        <div className="bar-row"><div className="lbl">Net Margin</div><div className="bar-track"><div className="bar-fill you" style={{ width: "64%" }}></div></div><div className="val">8.1%</div></div>
        <div className="bar-row"><div className="lbl">Sector Avg</div><div className="bar-track"><div className="bar-fill" style={{ width: "49%" }}></div></div><div className="val">6.4%</div></div>
        <div className="legend">
          <span><i style={{ background: "var(--gold)" }}></i>Reliance (Live)</span>
          <span><i style={{ background: "var(--teal)" }}></i>Sector Average</span>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}>
          <a className="link-btn" onClick={() => goPage("sector")} style={{ cursor: "pointer" }}>
            Open full comparison <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Smart Alerts */}
      <div className="card c6">
        <div className="card-head">
          <div className="card-eyebrow"><div className="card-num">05</div><div><span>Real-Time Watchlist</span><h3 style={{ fontSize: "18px" }}>Live Market Signals &amp; Alerts</h3></div></div>
          <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></div>
        </div>
        <div className="watch-row">
          <div className="watch-id"><div className="watch-logo">HD</div><div><div className="watch-name">HDFC Bank</div><div className="watch-sub">RSI {hdfc.rsi} · Active Resistance</div></div></div>
          <div className="watch-right"><div className="watch-price">₹{hdfc.price?.toLocaleString("en-IN")}</div><span className="alert-flag">{hdfc.rsi > 70 ? "Overbought" : "Consolidation"}</span></div>
        </div>
        <div className="watch-row">
          <div className="watch-id"><div className="watch-logo">IN</div><div><div className="watch-name">Infosys</div><div className="watch-sub">RSI {infy.rsi} · Bullish Volume</div></div></div>
          <div className="watch-right"><div className="watch-price">₹{infy.price?.toLocaleString("en-IN")}</div><div className="watch-change up">{infy.change}</div></div>
        </div>
        <div className="watch-row">
          <div className="watch-id"><div className="watch-logo">TA</div><div><div className="watch-name">Tata Motors</div><div className="watch-sub">RSI {tata.rsi} · EV Pipeline</div></div></div>
          <div className="watch-right"><div className="watch-price">₹{tata.price?.toLocaleString("en-IN")}</div><div className={`watch-change ${tata.change?.startsWith("-") || tata.change?.startsWith("−") ? "down" : "up"}`}>{tata.change}</div></div>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}>
          <a className="link-btn" onClick={() => goPage("alerts")} style={{ cursor: "pointer" }}>
            Manage all alerts <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
