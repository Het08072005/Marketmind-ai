import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";

const TOP_SYMBOLS = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS", "WIPRO", 
  "ITC", "LT", "ICICIBANK", "SBIN", "SUNPHARMA", "MARUTI", "TITAN"
];

export default function EsgPage() {
  const [stocks, setStocks] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await apiClient.getStocks();
        if (data && data.length > 0) {
          setStocks(data);
          if (window.__SELECTED_STOCK_SYMBOL) {
            setSelectedSymbol(window.__SELECTED_STOCK_SYMBOL);
          }
        }
      } catch (e) {}
    };
    fetchStocks();

    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (action && (action.target_page === "esg" || action.command === "SHOW_ESG")) {
        const sym = action.params?.symbol || "RELIANCE";
        setSelectedSymbol(sym);
        window.__SELECTED_STOCK_SYMBOL = sym;
      }
    };
    window.addEventListener("marketmind:voice_action", handleVoiceAction);
    return () => window.removeEventListener("marketmind:voice_action", handleVoiceAction);
  }, []);

  const currentComp = stocks.find((s) => s.symbol === selectedSymbol) || {
    symbol: selectedSymbol,
    name: `${selectedSymbol} Ltd`,
    sector: "Energy & Conglomerate",
    price: 1320,
    esg: { overall: 77, environmental: 81, social: 74, governance: 76 }
  };

  const esg = currentComp.esg || { overall: 77, environmental: 81, social: 74, governance: 76 };
  const overallScore = esg.overall || 77;
  const ratingTier = overallScore >= 80 ? "Leader" : overallScore >= 70 ? "Strong Tier" : "Moderate Risk";
  const ratingRisk = overallScore >= 80 ? "Low ESG Risk" : overallScore >= 70 ? "Moderate ESG Risk" : "High ESG Risk";
  const ratingColor = overallScore >= 80 ? "#2F6F62" : overallScore >= 70 ? "#B8935A" : "#A14545";

  // Calculate circular gauge stroke dashoffset
  const circumference = 2 * Math.PI * 72; // ~452
  const strokeOffset = circumference - (circumference * overallScore) / 100;

  // Sector Peers with guaranteed fallback
  const sectorPeers = stocks.filter(s => s.sector === currentComp.sector && s.symbol !== selectedSymbol);
  const displayPeers = (sectorPeers.length >= 2 ? sectorPeers : stocks.filter(s => s.symbol !== selectedSymbol)).slice(0, 4);

  return (
    <div className="grid">
      {/* Top Banner & Quick Stock Selectors */}
      <div className="page-banner">
        <div>
          <h2>ESG &amp; Sustainability Score</h2>
          <p>Environmental, Social and Governance forensic audits for modern values-aligned capital allocation.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={selectedSymbol}
            onChange={(e) => {
              const sym = e.target.value;
              setSelectedSymbol(sym);
              window.__SELECTED_STOCK_SYMBOL = sym;
            }}
            style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "8px 12px", fontSize: "12.5px", fontWeight: 600 }}
          >
            {(stocks.length > 0 ? stocks : TOP_SYMBOLS.map(s => ({ symbol: s, name: s }))).map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.name} ({s.symbol}) — ESG: {s.esg?.overall || 75}/100
              </option>
            ))}
          </select>
          <div className="chip-tabs">
            {TOP_SYMBOLS.slice(0, 8).map((s) => (
              <div
                key={s}
                className={`chip-tab ${selectedSymbol === s ? "active" : ""}`}
                onClick={() => {
                  setSelectedSymbol(s);
                  window.__SELECTED_STOCK_SYMBOL = s;
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Overall ESG Score Gauge Card (Pixel-Perfect Alignment) */}
      <div className="card c5" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div className="card-head" style={{ marginBottom: "10px" }}>
            <div className="card-eyebrow">
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold-light)" }}>NSE: {selectedSymbol}</span>
                <h3 style={{ fontSize: "19px", fontFamily: "var(--serif)" }}>{currentComp.name}</h3>
              </div>
            </div>
            <span className="tag live" style={{ background: "rgba(47,111,98,.12)", color: "#2F6F62", fontWeight: 700 }}>
              {overallScore}/100
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
            <div className="gauge big" style={{ width: "160px", height: "160px" }}>
              <svg width="160" height="160" viewBox="0 0 170 170">
                <circle cx="85" cy="85" r="72" fill="none" stroke="#F0E9D8" strokeWidth="13" />
                <circle
                  cx="85"
                  cy="85"
                  r="72"
                  fill="none"
                  stroke={ratingColor}
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
              </svg>
              <div className="gauge-center">
                <div style={{ color: ratingColor, fontSize: "40px", fontWeight: 700, fontFamily: "var(--serif)", lineHeight: 1 }}>
                  {overallScore}
                </div>
                <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "4px" }}>
                  Score out of 100
                </div>
              </div>
            </div>

            {/* Clean Risk Pill Badge Below Circle */}
            <div style={{ marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "6px", background: overallScore >= 80 ? "rgba(47,111,98,.12)" : "rgba(184,147,90,.15)", color: ratingColor, padding: "5px 14px", borderRadius: "16px", fontSize: "12px", fontWeight: 700 }}>
              <span style={{ fontSize: "9px" }}>●</span> {ratingTier} · {ratingRisk}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px", background: "var(--paper)", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "12px" }}>
          <div><span style={{ color: "var(--ink-soft)", fontWeight: 500 }}>Decarbonization:</span> <b>Target 2035</b></div>
          <div><span style={{ color: "var(--ink-soft)", fontWeight: 500 }}>Board Independence:</span> <b>62.5%</b></div>
        </div>
      </div>

      {/* Detailed E, S, G Pillars Breakdown Card */}
      <div className="card c7" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div className="card-head" style={{ marginBottom: "16px" }}>
            <div className="card-eyebrow">
              <div>
                <span>Sustainability Pillars</span>
                <h3 style={{ fontSize: "19px" }}>Detailed Pillar Audit</h3>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Environmental (E) */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "165px", fontSize: "13px", fontWeight: 600, color: "var(--navy)", flexShrink: 0 }}>
                Environmental (E)
              </div>
              <div className="bar-track" style={{ flex: 1, height: "9px", background: "#F0E9D8", borderRadius: "6px", overflow: "hidden" }}>
                <div className="bar-fill" style={{ width: `${esg.environmental || 81}%`, background: "#2F6F62", height: "100%", borderRadius: "6px", transition: "width 0.8s ease" }}></div>
              </div>
              <div style={{ width: "55px", textAlign: "right", fontWeight: 700, color: "#2F6F62", fontSize: "13px", fontFamily: "var(--mono, monospace)" }}>
                {esg.environmental || 81}/100
              </div>
            </div>

            {/* Social (S) */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "165px", fontSize: "13px", fontWeight: 600, color: "var(--navy)", flexShrink: 0 }}>
                Social (S)
              </div>
              <div className="bar-track" style={{ flex: 1, height: "9px", background: "#F0E9D8", borderRadius: "6px", overflow: "hidden" }}>
                <div className="bar-fill you" style={{ width: `${esg.social || 74}%`, background: "#B8935A", height: "100%", borderRadius: "6px", transition: "width 0.8s ease" }}></div>
              </div>
              <div style={{ width: "55px", textAlign: "right", fontWeight: 700, color: "#B8935A", fontSize: "13px", fontFamily: "var(--mono, monospace)" }}>
                {esg.social || 74}/100
              </div>
            </div>

            {/* Corporate Governance (G) */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "165px", fontSize: "13px", fontWeight: 600, color: "var(--navy)", flexShrink: 0 }}>
                Corporate Governance (G)
              </div>
              <div className="bar-track" style={{ flex: 1, height: "9px", background: "#F0E9D8", borderRadius: "6px", overflow: "hidden" }}>
                <div className="bar-fill alt" style={{ width: `${esg.governance || 76}%`, background: "#101B33", height: "100%", borderRadius: "6px", transition: "width 0.8s ease" }}></div>
              </div>
              <div style={{ width: "55px", textAlign: "right", fontWeight: 700, color: "#101B33", fontSize: "13px", fontFamily: "var(--mono, monospace)" }}>
                {esg.governance || 76}/100
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px", background: "var(--paper)", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "12.5px", color: "var(--ink-soft)", lineHeight: "1.6" }}>
          💡 <b>Auditor Verdict:</b> Strong marks on renewable energy transition capex and board independence. Water recycling and supply-chain carbon disclosures audited with clean marks and zero severe governance penalties.
        </div>
      </div>

      {/* Sector Peer Benchmarks */}
      <div className="section-title">
        <h2>{currentComp.sector || "Sector"} ESG Benchmarks &amp; Peer Comparison</h2>
        <div className="rule"></div>
      </div>

      <div className="card c6">
        <div className="card-head">
          <div className="card-eyebrow">
            <div><span>Sector Benchmarks</span><h3 style={{ fontSize: "18px" }}>ESG vs. Peers</h3></div>
          </div>
        </div>

        <div className="bar-row" style={{ marginBottom: "12px", background: "rgba(216,188,139,.12)", padding: "8px 12px", borderRadius: "8px" }}>
          <div className="lbl" style={{ fontWeight: 700, color: "var(--navy)" }}>⭐ {currentComp.name}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${overallScore}%`, background: "var(--gold)" }}></div>
          </div>
          <div className="val" style={{ fontWeight: 700, color: "var(--navy)" }}>{overallScore}</div>
        </div>

        {displayPeers.map(p => (
          <div className="bar-row" key={p.symbol} style={{ marginBottom: "12px", padding: "4px 12px" }}>
            <div className="lbl" style={{ fontWeight: 500 }}>
              {p.name} ({p.symbol})
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${p.esg?.overall || 72}%`,
                  background: (p.esg?.overall || 72) >= 80 ? "#2F6F62" : "#B8935A"
                }}
              ></div>
            </div>
            <div className="val" style={{ fontWeight: 600 }}>{p.esg?.overall || 72}</div>
          </div>
        ))}
      </div>

      {/* Multi-Asset Portfolio ESG Scorecard */}
      <div className="card c6">
        <div className="card-head">
          <div className="card-eyebrow">
            <div><span>Multi-Asset Intelligence</span><h3 style={{ fontSize: "18px" }}>Holdings ESG Audit</h3></div>
          </div>
        </div>
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>E</th>
                <th>S</th>
                <th>G</th>
                <th>Overall</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(stocks.length > 0 ? stocks.slice(0, 6) : displayPeers).map((stk) => (
                <tr key={stk.symbol} style={stk.symbol === selectedSymbol ? { background: "rgba(216,188,139,.15)" } : {}}>
                  <td className="sym">
                    <span className="row-logo">{stk.symbol.slice(0, 2)}</span>
                    <b>{stk.name || stk.symbol}</b>
                  </td>
                  <td className="num">{stk.esg?.environmental || 78}</td>
                  <td className="num">{stk.esg?.social || 74}</td>
                  <td className="num">{stk.esg?.governance || 79}</td>
                  <td className="num" style={{ fontWeight: 700, color: (stk.esg?.overall || 77) >= 80 ? "#2F6F62" : "#B8935A" }}>
                    {stk.esg?.overall || 77}
                  </td>
                  <td>
                    <button
                      className="pill-btn ghost"
                      onClick={() => {
                        setSelectedSymbol(stk.symbol);
                        window.__SELECTED_STOCK_SYMBOL = stk.symbol;
                      }}
                      style={{ fontSize: "11px", padding: "3px 8px" }}
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
