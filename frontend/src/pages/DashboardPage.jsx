import React from "react";

export default function DashboardPage({ goPage, openAssistant }) {
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
            Simulated
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#AFB6CC", maxWidth: "480px", lineHeight: "1.55" }}>
          Build and stress-test strategies with virtual capital before committing real money — full order book, slippage and P&amp;L modelling.
        </p>
        <div className="hero-stats">
          <div className="hstat"><div className="v pos">₹12,84,320</div><div className="l">Virtual NAV</div></div>
          <div className="hstat"><div className="v pos">+18.6%</div><div className="l">Since Inception</div></div>
          <div className="hstat"><div className="v">1.42</div><div className="l">Sharpe Ratio</div></div>
          <div className="hstat"><div className="v">₹10,00,000</div><div className="l">Starting Capital</div></div>
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
            Open Simulator
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
            <div><span>Voice-Based</span><h3 style={{ fontSize: "18px" }}>Stock Assistant</h3></div>
          </div>
          <div className="card-icon" style={{ background: "var(--teal-light)" }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10v1a7 7 0 0 0 14 0v-1"/>
              <path d="M12 18v4M9 22h6"/>
            </svg>
          </div>
        </div>
        <p className="desc">Ask about any ticker aloud and hear a spoken answer, powered by the assistant docked bottom-right.</p>
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
            Try Speaking
          </button>
          <span className="tag live">Live</span>
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
          <span className="tag" style={{ background: "rgba(217,188,139,.18)", color: "var(--gold-light)" }}>New</span>
        </div>
        <p style={{ fontSize: "13px", color: "#AFB6CC", maxWidth: "480px", lineHeight: "1.55" }}>
          Give it one event — “Crude Oil +30%” — and watch 1st, 2nd, 3rd and 4th-order effects ripple through fuel costs, airline margins, ticket prices and tourism, with every affected company mapped.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", margin: "16px 0 4px", fontSize: "12.5px" }}>
          <span style={{ background: "rgba(217,188,139,.16)", color: "var(--gold-light)", padding: "8px 14px", borderRadius: "20px" }}>Oil +30%</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8B92A8" strokeWidth="2" strokeLinecap="round" style={{ width: "16px", height: "16px" }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          <span style={{ background: "rgba(255,255,255,.06)", color: "#CBD1E0", padding: "8px 14px", borderRadius: "20px" }}>IndiGo fuel cost ↑</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8B92A8" strokeWidth="2" strokeLinecap="round" style={{ width: "16px", height: "16px" }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          <span style={{ background: "rgba(255,255,255,.06)", color: "#CBD1E0", padding: "8px 14px", borderRadius: "20px" }}>Ticket prices ↑</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8B92A8" strokeWidth="2" strokeLinecap="round" style={{ width: "16px", height: "16px" }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          <span style={{ background: "rgba(255,255,255,.06)", color: "#CBD1E0", padding: "8px 14px", borderRadius: "20px" }}>Tourism impact</span>
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
        </div>
        <p className="desc">Every promise made on an earnings call, checked against what actually happened.</p>
        <div className="esg-wrap">
          <div className="gauge">
            <svg width="118" height="118" viewBox="0 0 118 118">
              <circle cx="59" cy="59" r="50" fill="none" stroke="#F0E9D8" strokeWidth="11"/>
              <circle cx="59" cy="59" r="50" fill="none" stroke="#B8935A" strokeWidth="11" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="88"/>
            </svg>
            <div className="gauge-center">
              <div className="n">72</div>
              <div className="l">Trust Score</div>
            </div>
          </div>
          <div className="esg-list">
            <div className="esg-item"><span>Kept</span><b>13</b></div>
            <div className="esg-item"><span>Delayed</span><b>3</b></div>
            <div className="esg-item"><span>Broken</span><b>2</b></div>
          </div>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}>
          <a className="link-btn" onClick={() => goPage("trust")}>
            Open Trust Meter <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Investment Thesis Breaker */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">★</div>
            <div><span>Reasoning-first</span><h3 style={{ fontSize: "18px" }}>Investment Thesis Breaker</h3></div>
          </div>
        </div>
        <p className="desc">Save WHY you bought — get alerted when that reason starts breaking, not just when price moves.</p>
        <div className="watch-row">
          <div className="watch-id">
            <div className="watch-logo">RE</div>
            <div><div className="watch-name">Reliance — "Revenue growth"</div><div className="watch-sub">22% → 14% YoY</div></div>
          </div>
          <div className="watch-right"><span className="alert-flag">Weakening</span></div>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}>
          <a className="link-btn" onClick={() => goPage("thesis")}>
            View my theses <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Stock DNA Fingerprint */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">★</div>
            <div><span>Hidden similarities</span><h3 style={{ fontSize: "18px" }}>Stock DNA Fingerprint</h3></div>
          </div>
        </div>
        <p className="desc">Growth, Debt, News Sensitivity, Management Reliability and Market Fear — reduced to a comparable DNA strand.</p>
        <svg viewBox="0 0 160 60" width="100%" height="56">
          <polyline points="0,30 12,10 24,45 36,15 48,40 60,20 72,35 84,12 96,42 108,18 120,32 132,8 144,38 156,22" fill="none" stroke="#B8935A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}>
          <a className="link-btn" onClick={() => goPage("dna")}>
            Compare DNA <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Decision Time Machine */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">★</div>
            <div><span>Learn from history</span><h3 style={{ fontSize: "18px" }}>Decision Time Machine</h3></div>
          </div>
        </div>
        <p className="desc">Travel to a past date, decide with only the information available then, and see where your reasoning held up.</p>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}>
          <a className="link-btn" onClick={() => goPage("timemachine")}>
            Travel back <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Financial Detective Suite Section */}
      <div className="section-title">
        <h2>Financial Detective Suite</h2>
        <div className="rule"></div>
      </div>

      {/* AI Stock Autopsy */}
      <div className="card hero-card c8" style={{ background: "linear-gradient(135deg,#1B2F52,#12213D 70%)" }}>
        <div className="hero-top">
          <div><div className="eyebrow">Find what other investors don't see</div><h2>AI Stock Autopsy</h2></div>
          <span className="tag" style={{ background: "rgba(217,188,139,.18)", color: "var(--gold-light)" }}>New</span>
        </div>
        <p style={{ fontSize: "13px", color: "#AFB6CC", maxWidth: "480px", lineHeight: "1.55" }}>
          Reconstruct the hidden warning signs that appeared 6–12 months before real historical collapses — then scan your own holdings for the same disease.
        </p>
        <div className="hero-actions">
          <button className="btn-gold" onClick={() => goPage("autopsy")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            Run an Autopsy
          </button>
          <button className="btn-ghost" onClick={() => goPage("redflag")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M6 2v20"/><path d="M6 3h11l-3 4 3 4H6"/></svg>
            Check Red-Flag DNA
          </button>
        </div>
      </div>

      {/* Accounting Reality Checker */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">★</div>
            <div><span>Beyond profit</span><h3 style={{ fontSize: "18px" }}>Accounting Reality Checker</h3></div>
          </div>
        </div>
        <p className="desc">Profit up, cash flow down — the AI flags when reported growth quality looks weak.</p>
        <div className="verdict-box" style={{ margin: 0, padding: "14px 16px" }}>
          <div className="vi">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>
          </div>
          <div>
            <div className="vl">Verdict</div>
            <div className="vt" style={{ fontSize: "14px" }}>Profit quality questionable</div>
          </div>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "12px" }}>
          <a className="link-btn" onClick={() => goPage("accounting")}>
            Open checker <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Ghost Portfolio */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">★</div>
            <div><span>Path not taken</span><h3 style={{ fontSize: "18px" }}>Ghost Portfolio</h3></div>
          </div>
        </div>
        <div className="ghost-compare" style={{ gap: "10px" }}>
          <div className="ghost-block real" style={{ padding: "12px" }}>
            <div className="gl" style={{ fontSize: "9px" }}>Real You</div>
            <div className="gv" style={{ fontSize: "20px" }}>₹12.4L</div>
          </div>
          <div className="ghost-vs" style={{ width: "20px", fontSize: "12px" }}>vs</div>
          <div className="ghost-block ghost" style={{ padding: "12px" }}>
            <div className="gl" style={{ fontSize: "9px" }}>👻 Ghost</div>
            <div className="gv" style={{ fontSize: "20px" }}>₹13.1L</div>
          </div>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "12px" }}>
          <a className="link-btn" onClick={() => goPage("ghost")}>
            See what you missed <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Hidden Dependency Map */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">★</div>
            <div><span>Hidden risk</span><h3 style={{ fontSize: "18px" }}>Dependency Map</h3></div>
          </div>
        </div>
        <p className="desc">10 stocks can still share one hidden risk factor underneath.</p>
        <div className="risk-node-row" style={{ borderBottom: "none", padding: "6px 0" }}>
          <div className="risk-node-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <div className="risk-node-name">USD Exposure</div>
            <div className="risk-node-sub">5 of 10 holdings</div>
          </div>
          <div className="risk-node-count">5</div>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "4px" }}>
          <a className="link-btn" onClick={() => goPage("dependency")}>
            View full map <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Financial Red-Flag DNA */}
      <div className="card c8">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">★</div>
            <div><span>Collapse fingerprint</span><h3 style={{ fontSize: "18px" }}>Financial Red-Flag DNA</h3></div>
          </div>
        </div>
        <p className="desc">Matched against historical failures like DHFL, Yes Bank and Satyam — one current holding shows elevated similarity.</p>
        <div className="bar-row">
          <div className="lbl">SpiceJet</div>
          <div className="bar-track"><div className="bar-fill" style={{ width: "73%", background: "linear-gradient(90deg,#A14545,#C97A7A)" }}></div></div>
          <div className="val">73%</div>
        </div>
        <div className="bar-row">
          <div className="lbl">Reliance</div>
          <div className="bar-track"><div className="bar-fill" style={{ width: "21%" }}></div></div>
          <div className="val">21%</div>
        </div>
      </div>

      {/* Portfolio & Market Intelligence Section */}
      <div className="section-title">
        <h2>Portfolio &amp; Market Intelligence</h2>
        <div className="rule"></div>
      </div>

      {/* Sector Comparison */}
      <div className="card c6">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">04</div>
            <div><span>Comparative</span><h3>Sector Comparison Engine</h3></div>
          </div>
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </div>
        </div>
        <p className="desc">Reliance Industries measured side by side against its Energy &amp; Conglomerate sector peers.</p>
        <div className="bar-row"><div className="lbl">Revenue Gr.</div><div className="bar-track"><div className="bar-fill you" style={{ width: "78%" }}></div></div><div className="val">14.2%</div></div>
        <div className="bar-row"><div className="lbl">Sector Avg</div><div className="bar-track"><div className="bar-fill" style={{ width: "58%" }}></div></div><div className="val">9.8%</div></div>
        <div className="bar-row"><div className="lbl">Net Margin</div><div className="bar-track"><div className="bar-fill you" style={{ width: "64%" }}></div></div><div className="val">8.1%</div></div>
        <div className="bar-row"><div className="lbl">Sector Avg</div><div className="bar-track"><div className="bar-fill" style={{ width: "49%" }}></div></div><div className="val">6.4%</div></div>
        <div className="legend">
          <span><i style={{ background: "var(--gold)" }}></i>Reliance</span>
          <span><i style={{ background: "var(--teal)" }}></i>Sector Average</span>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}>
          <a className="link-btn" onClick={() => goPage("sector")}>
            Open full comparison <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Candlestick Pattern Detection */}
      <div className="card c6">
        <div className="card-head">
          <div className="card-eyebrow">
            <div className="card-num">07</div>
            <div><span>Chart Intelligence</span><h3>Candlestick Pattern Detection</h3></div>
          </div>
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M3 17l4-9 3 5 3-8 3 7 5-4"/></svg>
          </div>
        </div>
        <span className="pattern-flag">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>
          Bullish Engulfing detected · TCS · 2h ago
        </span>
        <svg viewBox="0 0 320 100" width="100%" height="96">
          <line x1="0" y1="20" x2="320" y2="20" stroke="#EEE6D2" strokeWidth="1"/>
          <line x1="0" y1="50" x2="320" y2="50" stroke="#EEE6D2" strokeWidth="1"/>
          <line x1="0" y1="80" x2="320" y2="80" stroke="#EEE6D2" strokeWidth="1"/>
          <g stroke="#A14545" strokeWidth="1.4">
            <line x1="20" y1="24" x2="20" y2="50"/><rect x="15" y="30" width="10" height="14" fill="#A14545"/>
            <line x1="55" y1="30" x2="55" y2="58" stroke="#2F6F62"/><rect x="50" y="34" width="10" height="16" fill="#2F6F62"/>
            <line x1="90" y1="20" x2="90" y2="46" stroke="#A14545"/><rect x="85" y="24" width="10" height="12" fill="#A14545"/>
          </g>
          <g stroke="#2F6F62" strokeWidth="1.6">
            <line x1="130" y1="18" x2="130" y2="52"/><rect x="123" y="26" width="14" height="20" fill="#2F6F62"/>
            <line x1="170" y1="10" x2="170" y2="46" strokeWidth="2.4"/><rect x="161" y="16" width="18" height="24" fill="#2F6F62" strokeWidth="2.4"/>
          </g>
          <g stroke="#A14545" strokeWidth="1.4"><line x1="210" y1="22" x2="210" y2="50"/><rect x="205" y="27" width="10" height="14" fill="#A14545"/></g>
          <g stroke="#2F6F62" strokeWidth="1.4"><line x1="245" y1="18" x2="245" y2="44"/><rect x="239" y="22" width="12" height="16" fill="#2F6F62"/><line x1="280" y1="8" x2="280" y2="38" strokeWidth="2"/><rect x="271" y="12" width="18" height="20" fill="#2F6F62" strokeWidth="2"/></g>
        </svg>
        <div className="card-foot">
          <span style={{ fontSize: "11.5px", color: "var(--ink-soft)" }}>Auto-scan across 46 watchlisted tickers</span>
          <a className="link-btn" onClick={() => goPage("candles")}>
            View all patterns <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Smart Alerts */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow"><div className="card-num">05</div><div><span>Watchlist</span><h3 style={{ fontSize: "18px" }}>Smart Alerts</h3></div></div>
          <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></div>
        </div>
        <div className="watch-row"><div className="watch-id"><div className="watch-logo">HD</div><div><div className="watch-name">HDFC Bank</div><div className="watch-sub">RSI crossed 72</div></div></div><div className="watch-right"><div className="watch-price">₹1,672.40</div><span className="alert-flag">Overbought</span></div></div>
        <div className="watch-row"><div className="watch-id"><div className="watch-logo">IN</div><div><div className="watch-name">Infosys</div><div className="watch-sub">Price near target</div></div></div><div className="watch-right"><div className="watch-price">₹1,904.10</div><div className="watch-change up">+2.4%</div></div></div>
        <div className="watch-row"><div className="watch-id"><div className="watch-logo">TA</div><div><div className="watch-name">Tata Motors</div><div className="watch-sub">Sentiment shift</div></div></div><div className="watch-right"><div className="watch-price">₹974.85</div><div className="watch-change down">−1.1%</div></div></div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}><a className="link-btn" onClick={() => goPage("alerts")}>Manage alerts <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
      </div>

      {/* ESG Score */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow"><div className="card-num">08</div><div><span>Sustainability</span><h3 style={{ fontSize: "18px" }}>ESG Score</h3></div></div>
          <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l7 7"/></svg></div>
        </div>
        <div className="esg-wrap">
          <div className="gauge"><svg width="118" height="118" viewBox="0 0 118 118"><circle cx="59" cy="59" r="50" fill="none" stroke="#F0E9D8" strokeWidth="11"/><circle cx="59" cy="59" r="50" fill="none" stroke="#2F6F62" strokeWidth="11" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="72"/></svg><div className="gauge-center"><div className="n">77</div><div className="l">of 100</div></div></div>
          <div className="esg-list"><div className="esg-item"><span>Environmental</span><b>81</b></div><div className="esg-item"><span>Social</span><b>74</b></div><div className="esg-item"><span>Governance</span><b>76</b></div></div>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}><a className="link-btn" onClick={() => goPage("esg")}>Full ESG breakdown <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
      </div>

      {/* Learning Mode */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow"><div className="card-num">03</div><div><span>Beginner-Friendly</span><h3 style={{ fontSize: "18px" }}>Learning Mode</h3></div></div>
          <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
        </div>
        <div className="lesson"><div className="lesson-ring"><svg width="36" height="36"><circle cx="18" cy="18" r="14" fill="none" stroke="#F0E9D8" strokeWidth="4"/><circle cx="18" cy="18" r="14" fill="none" stroke="#B8935A" strokeWidth="4" strokeDasharray="88" strokeDashoffset="20"/></svg><span className="pct">78%</span></div><div><div className="lesson-name">Understanding P/E Ratio</div><div className="lesson-desc">Valuation basics · 4 min</div></div></div>
        <div className="lesson"><div className="lesson-ring"><svg width="36" height="36"><circle cx="18" cy="18" r="14" fill="none" stroke="#F0E9D8" strokeWidth="4"/><circle cx="18" cy="18" r="14" fill="none" stroke="#2F6F62" strokeWidth="4" strokeDasharray="88" strokeDashoffset="55"/></svg><span className="pct">38%</span></div><div><div className="lesson-name">What is RSI?</div><div className="lesson-desc">Momentum indicators · 6 min</div></div></div>
        <div className="lesson"><div className="lesson-ring"><svg width="36" height="36"><circle cx="18" cy="18" r="14" fill="none" stroke="#F0E9D8" strokeWidth="4"/><circle cx="18" cy="18" r="14" fill="none" stroke="#A14545" strokeWidth="4" strokeDasharray="88" strokeDashoffset="80"/></svg><span className="pct">9%</span></div><div><div className="lesson-name">Reading Volatility</div><div className="lesson-desc">Risk fundamentals · 5 min</div></div></div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}><a className="link-btn" onClick={() => goPage("learning")}>Continue learning <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
      </div>

      {/* AI Report Generator */}
      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow"><div className="card-num">06</div><div><span>One-Click</span><h3 style={{ fontSize: "18px" }}>AI Report Generator</h3></div></div>
          <div className="card-icon" style={{ background: "var(--rose-light)" }}><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" stroke="#A14545"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></div>
        </div>
        <div className="report-row"><div className="report-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div><div><div className="report-name">Reliance Industries — Q1 Summary</div><div className="report-meta">Generated 2 hrs ago · 6 pages</div></div></div>
        <div className="report-row"><div className="report-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div><div><div className="report-name">Nifty Banking — Weekly Outlook</div><div className="report-meta">Generated yesterday · 4 pages</div></div></div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "6px" }}><button className="pill-btn" onClick={() => goPage("reports")}><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>Generate New PDF</button></div>
      </div>
    </div>
  );
}
