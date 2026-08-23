import React, { useState } from "react";

const MACRO_FACTORS = [
  {
    id: "usd",
    name: "USD / INR Exchange Rate",
    capitalExposure: "52% of Capital",
    riskLevel: "High Sensitivity",
    stocks: ["TCS", "INFY", "WIPRO", "TATACONSUM"],
    impactNote: "Every ₹1 depreciation in INR against USD expands Tier-1 IT operating margins by ~35-40 bps, but inflates foreign currency loan servicing."
  },
  {
    id: "crude",
    name: "Brent Crude Oil Benchmark",
    capitalExposure: "38% of Capital",
    riskLevel: "Moderate Sensitivity",
    stocks: ["ONGC", "BPCL", "ASIANPAINT", "INDIGO"],
    impactNote: "Crude above $85/bbl expands ONGC upstream realization but compresses gross refining margins for OMCs and gross margins for paint/aviation."
  },
  {
    id: "interest",
    name: "RBI Repo Rate & Liquidity",
    capitalExposure: "44% of Capital",
    riskLevel: "High Sensitivity",
    stocks: ["HDFCBANK", "ICICIBANK", "SBIN", "BAJFINANCE"],
    impactNote: "A 25 bps rate cut eases corporate lending demand and lowers bond yield marks, while lowering wholesale deposit acquisition costs."
  },
  {
    id: "monsoon",
    name: "Monsoon Rainfall & Rural Demand",
    capitalExposure: "26% of Capital",
    riskLevel: "Seasonal Factor",
    stocks: ["ITC", "TATACONSUM", "MARUTI"],
    impactNote: "Adequate rainfall supports rural disposable income, driving entry-level passenger vehicle sales and staple FMCG volume expansion."
  }
];

export default function DependencyMapPage() {
  const [selectedFactor, setSelectedFactor] = useState("usd");

  const activeFactor = MACRO_FACTORS.find(f => f.id === selectedFactor) || MACRO_FACTORS[0];

  return (
    <div className="grid">
      {/* Top Banner */}
      <div className="page-banner">
        <div>
          <h2>Portfolio Hidden Dependency Map</h2>
          <p>Your holdings may appear diversified across sectors on paper — until you uncover the common systemic macro factors quietly driving correlation underneath all of them.</p>
        </div>

        <div className="chip-tabs">
          {MACRO_FACTORS.map((f) => (
            <div
              key={f.id}
              className={`chip-tab ${selectedFactor === f.id ? "active" : ""}`}
              onClick={() => setSelectedFactor(f.id)}
            >
              {f.name}
            </div>
          ))}
        </div>
      </div>

      {/* SVG Interactive Neural Dependency Graph */}
      <div className="card c7" style={{ padding: "20px" }}>
        <div className="card-head" style={{ marginBottom: "12px" }}>
          <div className="card-eyebrow">
            <div>
              <span>Systemic Correlation Network</span>
              <h3 style={{ fontSize: "19px" }}>Macro Risk Exposure Web</h3>
            </div>
          </div>
          <span className="tag live" style={{ background: "rgba(216,188,139,.2)", color: "var(--navy)", fontWeight: 700 }}>
            {activeFactor.capitalExposure}
          </span>
        </div>

        <div style={{ background: "var(--paper)", borderRadius: "12px", border: "1px solid var(--line)", padding: "14px", display: "flex", justifyContent: "center" }}>
          <svg viewBox="0 0 520 280" width="100%" height="280">
            {/* Center Node: Portfolio */}
            <circle cx="260" cy="140" r="32" fill="var(--navy)" filter="drop-shadow(0 4px 10px rgba(16,27,51,.25))"/>
            <text x="260" y="137" textAnchor="middle" fill="var(--gold-light)" fontSize="11" fontWeight="700" fontFamily="sans-serif">YOUR</text>
            <text x="260" y="150" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="600" fontFamily="sans-serif">PORTFOLIO</text>

            {/* Connecting Hub Lines */}
            <line x1="260" y1="140" x2="110" y2="60" stroke={selectedFactor === "usd" ? "var(--gold)" : "#E6DCC4"} strokeWidth={selectedFactor === "usd" ? "2.5" : "1.2"} strokeDasharray={selectedFactor === "usd" ? "none" : "3 3"} />
            <line x1="260" y1="140" x2="110" y2="220" stroke={selectedFactor === "crude" ? "#2F6F62" : "#E6DCC4"} strokeWidth={selectedFactor === "crude" ? "2.5" : "1.2"} strokeDasharray={selectedFactor === "crude" ? "none" : "3 3"} />
            <line x1="260" y1="140" x2="410" y2="60" stroke={selectedFactor === "interest" ? "#A14545" : "#E6DCC4"} strokeWidth={selectedFactor === "interest" ? "2.5" : "1.2"} strokeDasharray={selectedFactor === "interest" ? "none" : "3 3"} />
            <line x1="260" y1="140" x2="410" y2="220" stroke={selectedFactor === "monsoon" ? "#7986B5" : "#E6DCC4"} strokeWidth={selectedFactor === "monsoon" ? "2.5" : "1.2"} strokeDasharray={selectedFactor === "monsoon" ? "none" : "3 3"} />

            {/* Hub 1: USD */}
            <g style={{ cursor: "pointer" }} onClick={() => setSelectedFactor("usd")}>
              <circle cx="110" cy="60" r="26" fill="#B8935A" stroke={selectedFactor === "usd" ? "var(--navy)" : "none"} strokeWidth="2.5"/>
              <text x="110" y="63" textAnchor="middle" fill="#FFF" fontSize="9.5" fontWeight="700">USD/INR</text>
            </g>

            {/* Hub 2: Crude Oil */}
            <g style={{ cursor: "pointer" }} onClick={() => setSelectedFactor("crude")}>
              <circle cx="110" cy="220" r="26" fill="#2F6F62" stroke={selectedFactor === "crude" ? "var(--navy)" : "none"} strokeWidth="2.5"/>
              <text x="110" y="223" textAnchor="middle" fill="#FFF" fontSize="9.5" fontWeight="700">CRUDE</text>
            </g>

            {/* Hub 3: Interest Rates */}
            <g style={{ cursor: "pointer" }} onClick={() => setSelectedFactor("interest")}>
              <circle cx="410" cy="60" r="26" fill="#A14545" stroke={selectedFactor === "interest" ? "var(--navy)" : "none"} strokeWidth="2.5"/>
              <text x="410" y="63" textAnchor="middle" fill="#FFF" fontSize="9.5" fontWeight="700">RATES</text>
            </g>

            {/* Hub 4: Monsoon */}
            <g style={{ cursor: "pointer" }} onClick={() => setSelectedFactor("monsoon")}>
              <circle cx="410" cy="220" r="26" fill="#7986B5" stroke={selectedFactor === "monsoon" ? "var(--navy)" : "none"} strokeWidth="2.5"/>
              <text x="410" y="223" textAnchor="middle" fill="#FFF" fontSize="9.5" fontWeight="700">MONSOON</text>
            </g>

            {/* Leaf Stock Nodes for USD */}
            <line x1="110" y1="60" x2="35" y2="35" stroke="#E6DCC4"/>
            <line x1="110" y1="60" x2="35" y2="85" stroke="#E6DCC4"/>
            <circle cx="35" cy="35" r="14" fill={selectedFactor === "usd" ? "var(--navy)" : "#D9BC8B"}/><text x="35" y="39" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="700">TCS</text>
            <circle cx="35" cy="85" r="14" fill={selectedFactor === "usd" ? "var(--navy)" : "#D9BC8B"}/><text x="35" y="89" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="700">INFY</text>

            {/* Leaf Stock Nodes for Crude */}
            <line x1="110" y1="220" x2="35" y2="195" stroke="#E6DCC4"/>
            <line x1="110" y1="220" x2="35" y2="245" stroke="#E6DCC4"/>
            <circle cx="35" cy="195" r="14" fill={selectedFactor === "crude" ? "var(--navy)" : "#D9BC8B"}/><text x="35" y="199" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="700">ONGC</text>
            <circle cx="35" cy="245" r="14" fill={selectedFactor === "crude" ? "var(--navy)" : "#D9BC8B"}/><text x="35" y="249" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="700">BPCL</text>

            {/* Leaf Stock Nodes for Rates */}
            <line x1="410" y1="60" x2="485" y2="35" stroke="#E6DCC4"/>
            <line x1="410" y1="60" x2="485" y2="85" stroke="#E6DCC4"/>
            <circle cx="485" cy="35" r="14" fill={selectedFactor === "interest" ? "var(--navy)" : "#D9BC8B"}/><text x="485" y="39" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="700">HDFC</text>
            <circle cx="485" cy="85" r="14" fill={selectedFactor === "interest" ? "var(--navy)" : "#D9BC8B"}/><text x="485" y="89" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="700">ICICI</text>

            {/* Leaf Stock Nodes for Monsoon */}
            <line x1="410" y1="220" x2="485" y2="195" stroke="#E6DCC4"/>
            <line x1="410" y1="220" x2="485" y2="245" stroke="#E6DCC4"/>
            <circle cx="485" cy="195" r="14" fill={selectedFactor === "monsoon" ? "var(--navy)" : "#D9BC8B"}/><text x="485" y="199" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="700">ITC</text>
            <circle cx="485" cy="245" r="14" fill={selectedFactor === "monsoon" ? "var(--navy)" : "#D9BC8B"}/><text x="485" y="249" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="700">MARUTI</text>
          </svg>
        </div>
      </div>

      {/* Selected Macro Factor Analysis & AI Rebalance Verdict */}
      <div className="card c5" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div className="card-head">
            <div className="card-eyebrow">
              <div>
                <span>Concentration Audit</span>
                <h3 style={{ fontSize: "19px" }}>{activeFactor.name}</h3>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(216,188,139,.15)", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--line)", marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--navy)", fontWeight: 700 }}>Direct Portfolio Capital Exposure:</span>
              <span style={{ fontSize: "14px", color: "#2F6F62", fontWeight: 700, fontFamily: "var(--mono, monospace)" }}>
                {activeFactor.capitalExposure}
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
              {activeFactor.stocks.map(s => (
                <span key={s} className="ticker-chip" style={{ background: "var(--navy)", color: "#FFF", fontSize: "11px", padding: "3px 8px" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <p style={{ fontSize: "12.5px", color: "var(--ink)", lineHeight: "1.6", marginBottom: "14px" }}>
            {activeFactor.impactNote}
          </p>
        </div>

        {/* AI Quantitative Rebalance Verdict */}
        <div style={{ background: "var(--paper)", border: "1.5px solid var(--gold-light)", padding: "14px", borderRadius: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <span>🧠 AI Optimization Verdict:</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--ink-soft)", margin: 0, lineHeight: "1.5" }}>
            52% of your portfolio shares severe USD/INR exchange rate sensitivity. Your apparent multi-stock diversification is narrower than it looks on paper. Consider increasing allocation to domestic power/defense utilities.
          </p>
        </div>
      </div>
    </div>
  );
}
