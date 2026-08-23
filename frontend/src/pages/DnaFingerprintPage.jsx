import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";

const STOCK_DNA_PROFILES = {
  RELIANCE: { name: "Reliance Industries Ltd", sector: "Energy & Conglomerate", growth: 84, debt: 42, news: 78, mgmt: 82, fear: 40, summary: "High capital ambition backed by integrated cash cow refining assets and fast-growing retail/telecom monopolies." },
  TCS: { name: "Tata Consultancy Services", sector: "IT & Tech", growth: 72, debt: 8, news: 54, mgmt: 94, fear: 25, summary: "Ultra-low balance sheet leverage, pristine corporate governance, and disciplined high-margin free cash flow generation." },
  INFY: { name: "Infosys Ltd", sector: "IT & Tech", growth: 70, debt: 10, news: 68, mgmt: 86, fear: 32, summary: "Strong deal pipeline conversion, high return on equity (ROE), and steady dividend payout predictability." },
  HDFCBANK: { name: "HDFC Bank Ltd", sector: "Banking & Finance", growth: 76, debt: 65, news: 60, mgmt: 90, fear: 28, summary: "Unrivaled retail CASA distribution network with gold-standard underwriting underwriting and low gross NPAs." },
  TATAMOTORS: { name: "Tata Motors Ltd", sector: "Auto & EV", growth: 88, debt: 58, news: 82, mgmt: 78, fear: 55, summary: "Aggressive EV transition leader with high operational beta, strong commercial vehicle domestic market share, and JLR turnaround." },
  ADANIENT: { name: "Adani Enterprises Ltd", sector: "Metals & Infra", growth: 92, debt: 82, news: 94, mgmt: 68, fear: 78, summary: "Hyper-growth infrastructure incubator with high capital intensity, elevated leverage, and high headline volatility." },
  ATGL: { name: "Adani Total Gas Ltd", sector: "Energy & Utilities", growth: 78, debt: 62, news: 86, mgmt: 70, fear: 65, summary: "City gas distribution franchisee with high regulatory linkage, expanding CNG corridor capex, and LNG terminal synergy." },
  WIPRO: { name: "Wipro Ltd", sector: "IT & Tech", growth: 58, debt: 15, news: 64, mgmt: 74, fear: 42, summary: "Transformation phase focusing on large deal BFSI turnaround, higher consulting mix, and margin recovery." },
  ITC: { name: "ITC Ltd", sector: "FMCG & Diversified", growth: 64, debt: 5, news: 42, mgmt: 92, fear: 18, summary: "Cash cow FMCG & cigarettes moat with zero debt, high dividend yield, and expanding paperboards/agri exports." },
  SUNPHARMA: { name: "Sun Pharmaceutical Industries", sector: "Pharma & Health", growth: 74, debt: 18, news: 58, mgmt: 84, fear: 30, summary: "Global specialty pipeline momentum with strong domestic formulation leadership and high R&D reinvestment." },
  TITAN: { name: "Titan Company Ltd", sector: "Consumer Retail", growth: 86, debt: 24, news: 62, mgmt: 92, fear: 35, summary: "Dominant organized jewelry market share with strong brand equity, rapid store expansion, and high ROIC." }
};

export default function DnaFingerprintPage() {
  const [stocks, setStocks] = useState([]);
  const [stock1Sym, setStock1Sym] = useState("RELIANCE");
  const [stock2Sym, setStock2Sym] = useState("TATAMOTORS");

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await apiClient.getStocks();
        if (data && data.length > 0) {
          setStocks(data);
          if (window.__SELECTED_STOCK_SYMBOL) {
            setStock1Sym(window.__SELECTED_STOCK_SYMBOL);
          }
        }
      } catch (e) {}
    };
    fetchStocks();
  }, []);

  const s1 = STOCK_DNA_PROFILES[stock1Sym] || {
    name: `${stock1Sym} Ltd`,
    sector: "Core Sector",
    growth: 75,
    debt: 45,
    news: 65,
    mgmt: 80,
    fear: 40,
    summary: "Balanced growth and capital allocation profile across domestic market constituents."
  };

  const s2 = STOCK_DNA_PROFILES[stock2Sym] || {
    name: `${stock2Sym} Ltd`,
    sector: "Core Sector",
    growth: 72,
    debt: 50,
    news: 70,
    mgmt: 76,
    fear: 48,
    summary: "Competitive domestic market contender with active operational expansion."
  };

  // Calculate Euclidean / Cosine Genetic Match %
  const diffGrowth = Math.abs(s1.growth - s2.growth);
  const diffDebt = Math.abs(s1.debt - s2.debt);
  const diffNews = Math.abs(s1.news - s2.news);
  const diffMgmt = Math.abs(s1.mgmt - s2.mgmt);
  const diffFear = Math.abs(s1.fear - s2.fear);
  const avgDistance = (diffGrowth + diffDebt + diffNews + diffMgmt + diffFear) / 5;
  const matchScore = Math.max(15, Math.min(96, Math.round(100 - avgDistance * 1.4)));

  const matchClassification = matchScore >= 80 ? "Genetic Twins · High Behavioral Correlation" : matchScore >= 60 ? "Shared Core Traits · Sector Divergence" : "Genetic Opposites · Ideal Diversifier";
  const matchColor = matchScore >= 80 ? "#2F6F62" : matchScore >= 60 ? "#B8935A" : "#101B33";

  const allSymbols = Object.keys(STOCK_DNA_PROFILES);

  return (
    <div className="grid">
      {/* Top Banner & Quick Stock Selectors */}
      <div className="page-banner">
        <div>
          <h2>Stock DNA Fingerprint</h2>
          <p>Growth Ambition, Debt Leverage, News Sensitivity, Management Fidelity, and Market Fear — reduced into a comparable genetic strand.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold-light)" }}>Primary:</span>
            <select
              value={stock1Sym}
              onChange={(e) => setStock1Sym(e.target.value)}
              style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "8px", padding: "7px 10px", fontSize: "12.5px", fontWeight: 600 }}
            >
              {(stocks.length > 0 ? stocks : allSymbols.map(s => ({ symbol: s, name: STOCK_DNA_PROFILES[s].name }))).map((s) => (
                <option key={s.symbol} value={s.symbol}>{s.symbol} ({s.name})</option>
              ))}
            </select>
          </div>

          <span style={{ fontWeight: 700, color: "var(--navy)" }}>vs</span>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#2F6F62" }}>Comparison:</span>
            <select
              value={stock2Sym}
              onChange={(e) => setStock2Sym(e.target.value)}
              style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "8px", padding: "7px 10px", fontSize: "12.5px", fontWeight: 600 }}
            >
              {(stocks.length > 0 ? stocks : allSymbols.map(s => ({ symbol: s, name: STOCK_DNA_PROFILES[s].name }))).map((s) => (
                <option key={s.symbol} value={s.symbol}>{s.symbol} ({s.name})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main DNA Match Score Gauge */}
      <div className="card c5" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div className="card-head">
            <div className="card-eyebrow">
              <div>
                <span>Behavioral Synthesis</span>
                <h3 style={{ fontSize: "19px" }}>DNA Genetic Match</h3>
              </div>
            </div>
            <span className="tag live" style={{ background: "rgba(47,111,98,.12)", color: "#2F6F62", fontWeight: 700 }}>
              {matchScore}% Match
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 0" }}>
            <div className="gauge big" style={{ width: "160px", height: "160px" }}>
              <svg width="160" height="160" viewBox="0 0 170 170">
                <circle cx="85" cy="85" r="72" fill="none" stroke="#F0E9D8" strokeWidth="13" />
                <circle
                  cx="85"
                  cy="85"
                  r="72"
                  fill="none"
                  stroke={matchColor}
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeDasharray="452"
                  strokeDashoffset={452 - (452 * matchScore) / 100}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="gauge-center">
                <div style={{ color: matchColor, fontSize: "40px", fontWeight: 700, fontFamily: "var(--serif)", lineHeight: 1 }}>
                  {matchScore}%
                </div>
                <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "4px" }}>
                  Genetic Affinity
                </div>
              </div>
            </div>

            <div style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(216,188,139,.15)", color: matchColor, padding: "5px 14px", borderRadius: "16px", fontSize: "12px", fontWeight: 700 }}>
              <span>●</span> {matchClassification}
            </div>
          </div>
        </div>

        <div style={{ background: "var(--paper)", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "12px", color: "var(--ink)", lineHeight: "1.5", marginTop: "12px" }}>
          💡 <b>Genetic Verdict:</b> {stock1Sym} and {stock2Sym} share core attributes in {diffGrowth <= 15 ? "growth momentum" : diffDebt <= 15 ? "debt discipline" : "market sensitivity"}, but diverge sharply on {diffDebt > 25 ? "balance sheet leverage" : "event volatility"}.
        </div>
      </div>

      {/* 5 Genetic Trait Comparison Bars */}
      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>5-Strand Breakdown</span>
              <h3 style={{ fontSize: "19px" }}>Trait Comparison</h3>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", fontSize: "11.5px", fontWeight: 700 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#B8935A" }}></span>
              {stock1Sym}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#2F6F62" }}></span>
              {stock2Sym}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Growth */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
              <span>Growth Ambition &amp; Capex</span>
              <span>{s1.growth} vs {s2.growth}</span>
            </div>
            <div style={{ display: "flex", gap: "6px", height: "8px" }}>
              <div style={{ flex: 1, background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${s1.growth}%`, height: "100%", background: "#B8935A", borderRadius: "4px" }}></div>
              </div>
              <div style={{ flex: 1, background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${s2.growth}%`, height: "100%", background: "#2F6F62", borderRadius: "4px" }}></div>
              </div>
            </div>
          </div>

          {/* Debt Load */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
              <span>Balance Sheet Debt &amp; Leverage</span>
              <span>{s1.debt} vs {s2.debt}</span>
            </div>
            <div style={{ display: "flex", gap: "6px", height: "8px" }}>
              <div style={{ flex: 1, background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${s1.debt}%`, height: "100%", background: "#B8935A", borderRadius: "4px" }}></div>
              </div>
              <div style={{ flex: 1, background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${s2.debt}%`, height: "100%", background: "#2F6F62", borderRadius: "4px" }}></div>
              </div>
            </div>
          </div>

          {/* News Sensitivity */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
              <span>News &amp; Event Sensitivity (Beta)</span>
              <span>{s1.news} vs {s2.news}</span>
            </div>
            <div style={{ display: "flex", gap: "6px", height: "8px" }}>
              <div style={{ flex: 1, background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${s1.news}%`, height: "100%", background: "#B8935A", borderRadius: "4px" }}></div>
              </div>
              <div style={{ flex: 1, background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${s2.news}%`, height: "100%", background: "#2F6F62", borderRadius: "4px" }}></div>
              </div>
            </div>
          </div>

          {/* Management Reliability */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
              <span>Management Reliability &amp; Governance</span>
              <span>{s1.mgmt} vs {s2.mgmt}</span>
            </div>
            <div style={{ display: "flex", gap: "6px", height: "8px" }}>
              <div style={{ flex: 1, background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${s1.mgmt}%`, height: "100%", background: "#B8935A", borderRadius: "4px" }}></div>
              </div>
              <div style={{ flex: 1, background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${s2.mgmt}%`, height: "100%", background: "#2F6F62", borderRadius: "4px" }}></div>
              </div>
            </div>
          </div>

          {/* Market Fear */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
              <span>Drawdown Resistance &amp; Market Fear</span>
              <span>{s1.fear} vs {s2.fear}</span>
            </div>
            <div style={{ display: "flex", gap: "6px", height: "8px" }}>
              <div style={{ flex: 1, background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${s1.fear}%`, height: "100%", background: "#B8935A", borderRadius: "4px" }}></div>
              </div>
              <div style={{ flex: 1, background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${s2.fear}%`, height: "100%", background: "#2F6F62", borderRadius: "4px" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Double Helix SVG DNA Strand */}
      <div className="section-title">
        <h2>Continuous Double-Helix Genetic Strand</h2>
        <div className="rule"></div>
      </div>

      <div className="card c12" style={{ padding: "18px 24px", background: "var(--paper)" }}>
        <svg viewBox="0 0 760 90" width="100%" height="90">
          {/* Base Pairs Crossbars */}
          {[40, 90, 140, 190, 240, 290, 340, 390, 440, 490, 540, 590, 640, 690, 740].map((cx, idx) => (
            <line key={idx} x1={cx} y1={25} x2={cx} y2={65} stroke="rgba(16,27,51,.15)" strokeDasharray="2 2" strokeWidth="1" />
          ))}

          {/* Helix Strand 1 (Gold - Stock 1) */}
          <path
            d="M 10 45 Q 60 15, 110 45 T 210 45 T 310 45 T 410 45 T 510 45 T 610 45 T 710 45 T 760 45"
            fill="none"
            stroke="#B8935A"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Helix Strand 2 (Teal - Stock 2) */}
          <path
            d="M 10 45 Q 60 75, 110 45 T 210 45 T 310 45 T 410 45 T 510 45 T 610 45 T 710 45 T 760 45"
            fill="none"
            stroke="#2F6F62"
            strokeWidth="3"
            strokeDasharray="5 3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
