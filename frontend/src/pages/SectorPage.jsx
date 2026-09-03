import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "../api/client";

const SECTOR_CATEGORIES = {
  "Energy & Conglomerate": ["RELIANCE", "ONGC", "COALINDIA", "NTPC", "POWERGRID", "TATAPOWER", "BPCL", "IOC", "ADANIENT", "ATGL"],
  "Banking & Financial Services": ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "KOTAKBANK", "BAJFINANCE", "JIOFIN", "INDUSINDBK"],
  "IT Services & Tech": ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM", "LTIM", "PERSISTENT", "COFORGE"],
  "Automotive & Mobility": ["TATAMOTORS", "MARUTI", "M&M", "BAJAJ-AUTO", "EICHERMOT", "HEROMOTOCO", "TVSMOTOR"],
  "Consumer & FMCG": ["ITC", "HINDUNILVR", "TITAN", "NESTLEIND", "ASIANPAINT", "BRITANNIA", "VARUNBEV", "TRENT", "DABUR"],
  "Infrastructure & Metals": ["LT", "TATASTEEL", "JSWSTEEL", "HINDALCO", "VEDL", "ADANIPORTS", "DLF"],
  "Defense & Aerospace": ["HAL", "BEL", "BDL"],
  "Pharma & Healthcare": ["SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB", "APOLLOHOSP", "LUPIN", "MANKIND"],
  "Consumer Tech & Aviation": ["ZOMATO", "INDIGO", "SPICEJET", "NAUKRI", "NYKAA"],
  "Telecom & Communication": ["BHARTIARTL", "IDEA"],
};

export default function SectorPage() {
  const initialSym = window.__SELECTED_STOCK_SYMBOL || "RELIANCE";
  const getInitialSector = (sym) => {
    for (const [sec, syms] of Object.entries(SECTOR_CATEGORIES)) {
      if (syms.includes(sym)) return sec;
    }
    return "Energy & Conglomerate";
  };

  const [stocks, setStocks] = useState([]);
  const [selectedSector, setSelectedSector] = useState(getInitialSector(initialSym));
  const [selectedSymbol, setSelectedSymbol] = useState(initialSym);
  const [peerUniverseMode, setPeerUniverseMode] = useState("dynamic"); // "traditional" or "dynamic"
  const [activeScenarioKey, setActiveScenarioKey] = useState("+10% Crude Oil");
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "why_gap", "thesis_unlock", "counterfactual", "consensus"
  const [selectedMatrixCell, setSelectedMatrixCell] = useState(null);
  const [cfMarginSlider, setCfMarginSlider] = useState(14.8);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load stocks
  useEffect(() => {
    const loadStocks = async () => {
      try {
        const data = await apiClient.getStocks();
        if (data && data.length > 0) {
          setStocks(data);
        }
      } catch (err) {
        console.warn("Using fallback stocks", err);
      }
    };
    loadStocks();

    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (!action) return;

      const isSectorTarget =
        action.target_page === "sector" ||
        action.target_page === "Sector Intelligence" ||
        action.command === "SECTOR_ACTION" ||
        action.params?.scenario ||
        action.params?.tab ||
        action.params?.mode;

      if (isSectorTarget && action.params) {
        // 1. Symbol Switch
        if (action.params.symbol) {
          const sym = action.params.symbol.toUpperCase();
          setSelectedSymbol(sym);
          for (const [sec, syms] of Object.entries(SECTOR_CATEGORIES)) {
            if (syms.includes(sym)) {
              setSelectedSector(sec);
              break;
            }
          }
        }

        // 2. Sector Switch
        if (action.params.sector && SECTOR_CATEGORIES[action.params.sector]) {
          setSelectedSector(action.params.sector);
          const validSyms = SECTOR_CATEGORIES[action.params.sector] || [];
          if (validSyms.length > 0 && !validSyms.includes(selectedSymbol)) {
            setSelectedSymbol(validSyms[0]);
          }
        }

        // 3. Scenario Shock Switch
        if (action.params.scenario) {
          setActiveScenarioKey(action.params.scenario);
          setActiveTab("overview");
        }

        // 4. Tab Navigation (why_gap, thesis_unlock, counterfactual, consensus, overview)
        if (action.params.tab) {
          setActiveTab(action.params.tab);
        }

        // 5. Peer Universe Mode (traditional vs dynamic)
        if (action.params.mode) {
          setPeerUniverseMode(action.params.mode);
        }

        // 6. Counterfactual Margin Slider
        if (action.params.margin) {
          setCfMarginSlider(parseFloat(action.params.margin));
          setActiveTab("counterfactual");
        }
      }
    };

    window.addEventListener("marketmind:voice_action", handleVoiceAction);
    return () => window.removeEventListener("marketmind:voice_action", handleVoiceAction);
  }, []);

  // Fetch intelligence data whenever selectedSymbol changes
  useEffect(() => {
    let isMounted = true;
    const loadIntelligence = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getSectorIntelligence(selectedSymbol);
        if (isMounted && data) {
          setIntelligenceData(data);
        }
      } catch (err) {
        console.warn("Using fallback local intelligence data", err);
        // Fallback local intelligence data for immediate instant responsiveness
        if (isMounted) {
          const comp = stocks.find((s) => s.symbol === selectedSymbol);
          setIntelligenceData(getFallbackIntelligence(selectedSymbol, comp));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadIntelligence();
    return () => { isMounted = false; };
  }, [selectedSymbol]);

  // Update selected symbol if sector changes and current symbol isn't in sector
  useEffect(() => {
    const validSymbols = SECTOR_CATEGORIES[selectedSector] || [];
    if (validSymbols.length > 0 && !validSymbols.includes(selectedSymbol)) {
      setSelectedSymbol(validSymbols[0]);
    }
  }, [selectedSector]);

  // Active company
  const currentComp = useMemo(() => {
    return stocks.find((s) => s.symbol === selectedSymbol) || {
      symbol: selectedSymbol,
      name: selectedSymbol === "RELIANCE" ? "Reliance Industries Ltd" : `${selectedSymbol} Ltd`,
      price: 1316.0,
      revenue_growth: 14.2,
      net_margin: 8.1,
      roe: 11.6,
      pe_ratio: 24.8,
      sector: selectedSector
    };
  }, [stocks, selectedSymbol, selectedSector]);

  // Peers in active universe
  const activePeers = useMemo(() => {
    if (peerUniverseMode === "dynamic" && intelligenceData?.economic_exposure?.economic_peers) {
      const ecoSyms = [selectedSymbol, ...intelligenceData.economic_exposure.economic_peers];
      const uniqueSyms = Array.from(new Set(ecoSyms));
      return uniqueSyms.map(sym => {
        return stocks.find(s => s.symbol === sym) || {
          symbol: sym,
          name: sym === "RELIANCE" ? "Reliance Industries" : sym === "ONGC" ? "Oil & Natural Gas Corp" : sym === "COALINDIA" ? "Coal India Ltd" : sym === "BHARTIARTL" ? "Bharti Airtel Ltd" : sym === "ADANIENT" ? "Adani Enterprises" : `${sym} Ltd`,
          price: 1000,
          revenue_growth: 12.0,
          net_margin: 9.0,
          roe: 13.0,
          pe_ratio: 22.0
        };
      });
    }
    const tradSyms = SECTOR_CATEGORIES[selectedSector] || [];
    return stocks.filter(s => tradSyms.includes(s.symbol)).length > 0
      ? stocks.filter(s => tradSyms.includes(s.symbol))
      : tradSyms.map(sym => ({ symbol: sym, name: `${sym} Ltd`, revenue_growth: 12.0, net_margin: 8.0, roe: 12.0, pe_ratio: 25.0 }));
  }, [peerUniverseMode, intelligenceData, selectedSector, stocks, selectedSymbol]);

  // Radar points calculator (5 axes: Growth, Margins, ROE, Value, Risk)
  const getRadarCoordinates = (scores) => {
    const center = 105;
    const radius = 72;
    const values = [
      (scores?.Growth || 70) / 100,
      (scores?.Margins || 70) / 100,
      (scores?.ROE || 70) / 100,
      (scores?.Value || 60) / 100,
      (scores?.Risk || 75) / 100
    ];
    const angles = [
      -Math.PI / 2,                     // 12 o'clock: Growth
      -Math.PI / 2 + (2 * Math.PI) / 5,    // ~2 o'clock: Margins
      -Math.PI / 2 + (4 * Math.PI) / 5,    // ~5 o'clock: ROE
      -Math.PI / 2 + (6 * Math.PI) / 5,    // ~7 o'clock: Value
      -Math.PI / 2 + (8 * Math.PI) / 5     // ~10 o'clock: Risk
    ];
    return values.map((val, i) => {
      const r = radius * Math.min(Math.max(val, 0.2), 0.95);
      const x = Math.round(center + r * Math.cos(angles[i]));
      const y = Math.round(center + r * Math.sin(angles[i]));
      return `${x},${y}`;
    }).join(" ");
  };

  // Data helpers
  const data = intelligenceData || getFallbackIntelligence(selectedSymbol, currentComp);
  const activeScenario = data.scenarios?.[activeScenarioKey] || data.scenarios?.["+10% Crude Oil"];
  const opportunityMatrix = data.opportunity_matrix || {};

  return (
    <div className="sector-intelligence-view">
      {/* 1. Controls Bar: Sector & Benchmark Stock */}
      <div className="sector-controls-bar">
        <div className="sector-controls-left">
          <span className="sector-control-label">SELECT SECTOR &amp; FOCUS STOCK</span>
          <div className="sector-select-group">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="sector-dropdown"
            >
              {Object.keys(SECTOR_CATEGORIES).map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>

            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="sector-dropdown ticker-select"
            >
              {(SECTOR_CATEGORIES[selectedSector] || []).map((sym) => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="sector-controls-right">
          <span className="sector-ai-status">
            <span className="pulse-dot-live" /> AI Dynamic Peer Universe &amp; Causal Reasoning Active
          </span>
        </div>
      </div>

      {/* 2. Top Row Cards (Exact Layout from Screenshot) */}
      <div className="sector-top-grid">
        {/* Card 1: AI Investment Position */}
        <div className="sector-card position-card">
          <div className="card-top-meta">
            <span className="card-micro-eyebrow">AI INVESTMENT POSITION</span>
            <div className="score-ring-wrap">
              <svg width="68" height="68" viewBox="0 0 80 80" className="score-svg-gauge">
                <circle cx="40" cy="40" r="34" stroke="rgba(16, 27, 51, 0.09)" strokeWidth="6" fill="none" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#101B33"
                  strokeWidth="6"
                  strokeDasharray="213.6"
                  strokeDashoffset={213.6 - (213.6 * (data.overall_score || 78)) / 100}
                  strokeLinecap="round"
                  fill="none"
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div className="score-ring-content">
                <span className="score-ring-num">{data.overall_score || 78}</span>
                <span className="score-ring-lbl">AI SCORE</span>
              </div>
            </div>
          </div>

          <h2 className="position-headline">{data.headline || "Quality improving, valuation neutral"}</h2>
          <p className="position-subline">
            Explainable score from growth, margins, capital efficiency, valuation and risk.
          </p>

          <div className="position-tag-row">
            <span className="position-status-pill">{data.tag || "SELECTIVE ACCUMULATION"}</span>
          </div>

          <p className="position-ai-read">
            <strong style={{ color: "#101B33" }}>Institutional Thesis: </strong>
            {data.ai_read}
          </p>

          <div className="position-edge-pills">
            <div className={`edge-pill ${data.growth_edge?.status || "favorable"}`}>
              <span className="edge-pill-lbl">Growth Edge</span>
              <strong className="edge-pill-val">{data.growth_edge?.val || "+0.8 pp"}</strong>
            </div>
            <div className={`edge-pill ${data.margin_gap?.status || "unfavorable"}`}>
              <span className="edge-pill-lbl">Margin Gap</span>
              <strong className="edge-pill-val">{data.margin_gap?.val || "-6.7 pp"}</strong>
            </div>
            <div className="edge-pill neutral">
              <span className="edge-pill-lbl">Valuation</span>
              <strong className="edge-pill-val">{data.valuation_multiple?.val || "24.8x P/E"}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Relative Strength DNA (5-Axis Positioning) */}
        <div className="sector-card radar-card">
          <div className="card-top-meta">
            <span className="card-micro-eyebrow">RELATIVE STRENGTH DNA</span>
          </div>
          <h2 className="radar-headline">5-Axis Positioning</h2>

          <div className="radar-chart-stage">
            <svg viewBox="0 0 210 210" width="190" height="190" className="radar-svg">
              {/* Web Grid Rings */}
              <polygon points="105,25 180,80 151,173 59,173 30,80" fill="none" stroke="rgba(16, 27, 51, 0.08)" strokeWidth="1"/>
              <polygon points="105,45 161,86 139,156 71,156 49,86" fill="none" stroke="rgba(16, 27, 51, 0.08)" strokeWidth="1"/>
              <polygon points="105,65 142,93 128,139 82,139 68,93" fill="none" stroke="rgba(16, 27, 51, 0.08)" strokeWidth="1"/>
              
              {/* Axis Spoke Lines */}
              <line x1="105" y1="25" x2="105" y2="173" stroke="rgba(16, 27, 51, 0.07)"/>
              <line x1="30" y1="80" x2="180" y2="80" stroke="rgba(16, 27, 51, 0.07)"/>
              <line x1="59" y1="173" x2="180" y2="80" stroke="rgba(16, 27, 51, 0.05)" strokeDasharray="2 2"/>

              {/* Company Radar Polygon (Warm Gold) */}
              <polygon
                points={getRadarCoordinates(data.dna_scores)}
                fill="rgba(184, 147, 90, 0.42)"
                stroke="#B8935A"
                strokeWidth="2.4"
              />

              {/* Sector Avg Radar Polygon (Dark Forest/Teal) */}
              <polygon
                points={getRadarCoordinates(data.sector_dna_scores)}
                fill="rgba(47, 111, 98, 0.24)"
                stroke="#2F6F62"
                strokeWidth="2"
              />

              {/* Vertices */}
              <circle cx="105" cy="25" r="2.5" fill="#101B33"/>
              <circle cx="180" cy="80" r="2.5" fill="#101B33"/>
              <circle cx="151" cy="173" r="2.5" fill="#101B33"/>
              <circle cx="59" cy="173" r="2.5" fill="#101B33"/>
              <circle cx="30" cy="80" r="2.5" fill="#101B33"/>
            </svg>

            {/* Labels around axes */}
            <div className="radar-axis-labels">
              <span className="axis-label axis-growth">Growth</span>
              <span className="axis-label axis-margin">Margins</span>
              <span className="axis-label axis-roe">ROE</span>
              <span className="axis-label axis-value">Value</span>
              <span className="axis-label axis-risk">Risk</span>
            </div>
          </div>

          <div className="radar-legend">
            <span className="legend-item">
              <i className="legend-swatch comp-swatch" />
              {selectedSymbol}
            </span>
            <span className="legend-item">
              <i className="legend-swatch sector-swatch" />
              SECTOR AVG
            </span>
          </div>
        </div>

        {/* Card 3: AI Anomaly Radar */}
        <div className="sector-card anomaly-card">
          <div className="card-top-meta">
            <span className="card-micro-eyebrow">AI ANOMALY RADAR</span>
          </div>
          <h2 className="anomaly-headline">What changed first?</h2>
          <p className="anomaly-subline">
            Prioritized signals that deserve analyst attention before the headline ratio changes.
          </p>

          <div className="anomaly-list">
            {(data.anomalies || []).map((an, aIdx) => (
              <div key={aIdx} className="anomaly-item">
                <div className="anomaly-icon-wrap">
                  {an.trend === "down" ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/>
                    </svg>
                  ) : an.trend === "up" ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#B8935A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </div>
                <div className="anomaly-body">
                  <div className="anomaly-title-row">
                    <strong className="anomaly-title">{an.title}</strong>
                    <span className="anomaly-conf-pill">{an.confidence}%</span>
                  </div>
                  <p className="anomaly-detail">{an.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Universe Mode Selector & Secondary Tab Navigator */}
      <div className="sector-toolbar-strip">
        <div className="universe-toggle-group">
          <span className="universe-lbl">Peer Universe:</span>
          <button
            type="button"
            className={`universe-toggle-btn ${peerUniverseMode === "traditional" ? "active" : ""}`}
            onClick={() => setPeerUniverseMode("traditional")}
          >
            Traditional Sector ({selectedSector.split(" ")[0]})
          </button>
          <button
            type="button"
            className={`universe-toggle-btn ${peerUniverseMode === "dynamic" ? "active" : ""}`}
            onClick={() => setPeerUniverseMode("dynamic")}
          >
            AI Dynamic Economic Peers
          </button>
        </div>

        {/* Sub-Feature Deep Dive Tabs */}
        <div className="sector-nav-tabs">
          <button
            type="button"
            className={`sector-nav-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview Matrix &amp; Shocks
          </button>
          <button
            type="button"
            className={`sector-nav-tab ${activeTab === "why_gap" ? "active" : ""}`}
            onClick={() => setActiveTab("why_gap")}
          >
            Why-Gap Reasoning
          </button>
          <button
            type="button"
            className={`sector-nav-tab ${activeTab === "thesis_unlock" ? "active" : ""}`}
            onClick={() => setActiveTab("thesis_unlock")}
          >
            Thesis Unlock
          </button>
          <button
            type="button"
            className={`sector-nav-tab ${activeTab === "counterfactual" ? "active" : ""}`}
            onClick={() => setActiveTab("counterfactual")}
          >
            Counterfactual Simulator
          </button>
          <button
            type="button"
            className={`sector-nav-tab ${activeTab === "consensus" ? "active" : ""}`}
            onClick={() => setActiveTab("consensus")}
          >
            AI Consensus Map
          </button>
        </div>
      </div>

      {/* Dynamic Economic Exposure Callout Banner */}
      {peerUniverseMode === "dynamic" && data.economic_exposure && (
        <div className="economic-exposure-banner">
          <div className="exposure-insight-header">
            <span className="exposure-badge">AI INSIGHT</span>
            <p className="exposure-insight-text">{data.economic_exposure.insight}</p>
          </div>
          <div className="exposure-segments-grid">
            {(data.economic_exposure.segments || []).map((seg, sIdx) => (
              <div key={sIdx} className="exposure-segment-card">
                <div className="segment-top">
                  <strong className="segment-name">{seg.name}</strong>
                  <span className="segment-share">{seg.share}</span>
                </div>
                <div className="segment-peers-row">
                  <span className="seg-peers-lbl">Economic Peers:</span>
                  {(seg.peers || []).map(p => (
                    <span
                      key={p}
                      className="seg-peer-tag"
                      onClick={() => setSelectedSymbol(p)}
                      title={`Compare with ${p}`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <p className="segment-desc">{seg.commentary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Tab Panels */}
      {activeTab === "overview" && (
        <div className="sector-bottom-grid">
          {/* Bottom Card 1: Peer Opportunity Matrix ("Who wins on what?") */}
          <div className="sector-card matrix-card">
            <div className="card-top-meta">
              <span className="card-micro-eyebrow">PEER OPPORTUNITY MATRIX</span>
            </div>
            <h2 className="matrix-headline">Who wins on what?</h2>
            <p className="matrix-subline">
              AI-normalized comparison across growth, margin, return quality, value and risk. Click cells for short reasoning.
            </p>

            <div className="matrix-table-wrap">
              <table className="opportunity-matrix-table">
                <thead>
                  <tr>
                    <th className="th-company">Company</th>
                    <th>Growth</th>
                    <th>Margin</th>
                    <th>ROE</th>
                    <th>Value</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {activePeers.map((p) => {
                    const rowScores = opportunityMatrix[p.symbol] || {
                      Growth: Math.round(p.revenue_growth * 5.5),
                      Margin: Math.round(p.net_margin * 6),
                      ROE: Math.round(p.roe * 5),
                      Value: 60,
                      Risk: 75
                    };
                    const isSelected = p.symbol === selectedSymbol;

                    return (
                      <tr key={p.symbol} className={isSelected ? "matrix-row-selected" : ""}>
                        <td
                          className="td-company-name"
                          onClick={() => setSelectedSymbol(p.symbol)}
                          title="Click to focus company"
                        >
                          <span className="matrix-sym-pip">{p.symbol.slice(0, 2)}</span>
                          <strong>{p.name || p.symbol}</strong>
                        </td>
                        {["Growth", "Margin", "ROE", "Value", "Risk"].map((dim) => {
                          const score = rowScores[dim] || 60;
                          return (
                            <td
                              key={dim}
                              className={`matrix-score-cell score-intensity-${Math.floor(score / 20)}`}
                              onClick={() => setSelectedMatrixCell({ sym: p.symbol, dim, score })}
                            >
                              <span>{score}</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedMatrixCell && (
              <div className="matrix-cell-callout">
                <div className="cell-callout-header">
                  <strong>{selectedMatrixCell.sym} · {selectedMatrixCell.dim} Score: {selectedMatrixCell.score}/100</strong>
                  <button type="button" onClick={() => setSelectedMatrixCell(null)} className="cell-close-btn">×</button>
                </div>
                <p className="cell-callout-text">
                  {selectedMatrixCell.dim === "Growth" && `${selectedMatrixCell.sym} revenue velocity ranks in the top quartile of its active peer cluster.`}
                  {selectedMatrixCell.dim === "Margin" && `${selectedMatrixCell.sym} operating efficiency is reflecting current input cost absorption and pricing power.`}
                  {selectedMatrixCell.dim === "ROE" && `${selectedMatrixCell.sym} capital allocation delivers solid cash conversion of net earnings.`}
                  {selectedMatrixCell.dim === "Value" && `${selectedMatrixCell.sym} forward valuation multiple offers asymmetric safety relative to growth.`}
                  {selectedMatrixCell.dim === "Risk" && `${selectedMatrixCell.sym} balance sheet liquidity and low debt-to-equity isolate it from macro volatility.`}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Card 2: Scenario Lab · Causal Shock Engine */}
          <div className="sector-card shock-card">
            <div className="card-top-meta">
              <span className="card-micro-eyebrow">SCENARIO LAB · CAUSAL SHOCK ENGINE</span>
            </div>
            <h2 className="shock-headline">Stress the thesis, not just the price</h2>
            <p className="shock-subline">
              Switch scenarios to see which business driver breaks first.
            </p>

            <div className="shock-preset-buttons">
              {Object.keys(data.scenarios || {}).map((scKey) => (
                <button
                  key={scKey}
                  type="button"
                  className={`shock-preset-btn ${activeScenarioKey === scKey ? "active" : ""}`}
                  onClick={() => setActiveScenarioKey(scKey)}
                >
                  {scKey}
                </button>
              ))}
            </div>

            {activeScenario && (
              <div className="shock-results-box">
                <div className="shock-meta-row">
                  <strong className="shock-title">{activeScenario.description || activeScenario.label}</strong>
                  <span className="shock-model-conf">Model confidence {activeScenario.confidence}%</span>
                </div>

                {/* Impact Delta Bars */}
                <div className="shock-metric-bars">
                  <div className="shock-bar-item">
                    <span className="shock-metric-name">Margin</span>
                    <div className="shock-bar-track">
                      <div
                        className={`shock-bar-fill ${activeScenario.margin_delta < 0 ? "negative" : "positive"}`}
                        style={{ width: `${Math.min(Math.abs(activeScenario.margin_delta) * 20, 100)}%` }}
                      />
                    </div>
                    <span className={`shock-delta-val ${activeScenario.margin_delta < 0 ? "neg-txt" : "pos-txt"}`}>
                      {activeScenario.margin_delta > 0 ? "+" : ""}{activeScenario.margin_delta}%
                    </span>
                  </div>

                  <div className="shock-bar-item">
                    <span className="shock-metric-name">FCF</span>
                    <div className="shock-bar-track">
                      <div
                        className={`shock-bar-fill ${activeScenario.fcf_delta < 0 ? "negative" : "positive"}`}
                        style={{ width: `${Math.min(Math.abs(activeScenario.fcf_delta) * 12, 100)}%` }}
                      />
                    </div>
                    <span className={`shock-delta-val ${activeScenario.fcf_delta < 0 ? "neg-txt" : "pos-txt"}`}>
                      {activeScenario.fcf_delta > 0 ? "+" : ""}{activeScenario.fcf_delta}%
                    </span>
                  </div>

                  <div className="shock-bar-item">
                    <span className="shock-metric-name">AI Score</span>
                    <div className="shock-bar-track">
                      <div
                        className="shock-bar-fill score-fill"
                        style={{ width: `${(activeScenario.score_after / 100) * 100}%` }}
                      />
                    </div>
                    <span className="shock-delta-val">
                      {activeScenario.score_after} <small>({activeScenario.score_after - activeScenario.score_before > 0 ? "+" : ""}{activeScenario.score_after - activeScenario.score_before})</small>
                    </span>
                  </div>
                </div>

                <p className="shock-narrative-p">{activeScenario.narrative}</p>

                {/* Causal Chain Transmission Path */}
                {activeScenario.chain && (
                  <div className="causal-chain-strip">
                    <div className="chain-header-lbl">CAUSAL TRANSMISSION PATH:</div>
                    <div className="chain-steps-flow">
                      {activeScenario.chain.map((cStep, cIdx) => (
                        <div key={cIdx} className="chain-step-node">
                          <div className="chain-step-top">
                            <span className="chain-step-pip">{cIdx + 1}</span>
                            <strong className="chain-step-name">{cStep.step}</strong>
                          </div>
                          <p className="chain-step-desc">{cStep.desc}</p>
                          {cIdx < activeScenario.chain.length - 1 && (
                            <span className="chain-arrow-separator">↓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: "Why is this company different?" Engine */}
      {activeTab === "why_gap" && data.margin_breakdown && (
        <div className="sector-deepdive-panel">
          <div className="deepdive-header">
            <span className="card-micro-eyebrow">WHY-GAP REASONING ENGINE</span>
            <h2>Deconstructing the Margin &amp; Efficiency Variance</h2>
            <p>Moving beyond simple numerical comparisons to causal operational and business-mix drivers.</p>
          </div>

          <div className="why-gap-grid">
            <div className="why-gap-card">
              <h3 className="why-gap-title">Margin Gap Decomposition ({data.margin_breakdown.gap_percentage})</h3>
              <div className="causes-list">
                {(data.margin_breakdown.primary_causes || []).map((cause, cIdx) => (
                  <div key={cIdx} className="cause-item">
                    <div className="cause-bullet" />
                    <div>
                      <strong className="cause-factor">{cause.factor}</strong>
                      <span className="cause-impact">({cause.impact})</span>
                      <p className="cause-desc">{cause.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="why-attribution-card">
              <h3 className="attribution-title">AI Variance Attribution</h3>
              <div className="attribution-bar-wrap">
                <div
                  className="attrib-segment operational"
                  style={{ width: `${data.margin_breakdown.ai_attribution.operational_pct}%` }}
                >
                  {data.margin_breakdown.ai_attribution.operational_pct}% Operational
                </div>
                <div
                  className="attrib-segment mix"
                  style={{ width: `${data.margin_breakdown.ai_attribution.business_mix_pct}%` }}
                >
                  {data.margin_breakdown.ai_attribution.business_mix_pct}% Business-Mix
                </div>
              </div>
              <div className="attribution-conclusion-box">
                <strong className="conclusion-lbl">AI Conclusion:</strong>
                <p>{data.margin_breakdown.ai_attribution.conclusion}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Thesis Unlock Engine ("What Must Become True?") */}
      {activeTab === "thesis_unlock" && data.thesis_unlock && (
        <div className="sector-deepdive-panel">
          <div className="deepdive-header">
            <span className="card-micro-eyebrow">THESIS UNLOCK ENGINE</span>
            <h2>What Must Become True for an Upgrade?</h2>
            <p>{data.thesis_unlock.unlock_rule}</p>
          </div>

          <div className="unlock-status-banner">
            <div className="unlock-badge-item">
              <span>Current Score</span>
              <strong>{data.thesis_unlock.current_score} ({data.thesis_unlock.current_rating})</strong>
            </div>
            <span className="unlock-arrow-sep">➔</span>
            <div className="unlock-badge-item target">
              <span>Strong Buy Target</span>
              <strong>{data.thesis_unlock.target_threshold}+ ({data.thesis_unlock.target_rating})</strong>
            </div>
          </div>

          <div className="unlock-conditions-grid">
            {(data.thesis_unlock.conditions || []).map((cond, idx) => (
              <div key={idx} className={`condition-card ${cond.met ? "cond-passed" : "cond-progress"}`}>
                <div className="cond-top">
                  <span className="cond-num">{idx + 1}</span>
                  <strong className="cond-metric">{cond.metric}</strong>
                  <span className={`cond-status-tag ${cond.met ? "passed" : "pending"}`}>
                    {cond.met ? "PASSED" : "PENDING"}
                  </span>
                </div>
                <div className="cond-values">
                  <span>Current: <b>{cond.current}</b></span>
                  <span>Target: <b style={{ color: "#16A34A" }}>{cond.target}</b></span>
                </div>
                <p className="cond-delta-txt">{cond.delta}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Counterfactual Peer Simulator */}
      {activeTab === "counterfactual" && data.counterfactual && (
        <div className="sector-deepdive-panel">
          <div className="deepdive-header">
            <span className="card-micro-eyebrow">COUNTERFACTUAL PEER ENGINE</span>
            <h2>"What if {selectedSymbol} had Peer Margins?"</h2>
            <p>Simulate substituting financial drivers from competitors to isolate growth constraints.</p>
          </div>

          <div className="cf-simulator-card">
            <div className="cf-slider-row">
              <label className="cf-slider-lbl">
                Hypothetical Operating Margin: <b>{cfMarginSlider}%</b>
              </label>
              <input
                type="range"
                min="5"
                max="25"
                step="0.5"
                value={cfMarginSlider}
                onChange={(e) => setCfMarginSlider(parseFloat(e.target.value))}
                className="cf-slider"
              />
            </div>

            <div className="cf-results-comparison">
              <div className="cf-res-col">
                <span className="cf-col-lbl">Current State</span>
                <div className="cf-stat-box">
                  <span>Net Margin: <b>8.1%</b></span>
                  <span>Return on Equity: <b>11.6%</b></span>
                  <span>AI Score: <b>{data.overall_score}</b></span>
                  <span>Universe Rank: <b>#2</b></span>
                </div>
              </div>

              <div className="cf-res-col highlighted">
                <span className="cf-col-lbl">Simulated State</span>
                <div className="cf-stat-box sim-box">
                  <span>Simulated Margin: <b>{cfMarginSlider}%</b></span>
                  <span>Simulated ROE: <b>{Math.round((11.6 + (cfMarginSlider - 8.1) * 0.45) * 10) / 10}%</b></span>
                  <span>Simulated AI Score: <b>{Math.min(Math.round(78 + (cfMarginSlider - 8.1) * 1.2), 98)}</b></span>
                  <span>Projected Rank: <b>{cfMarginSlider >= 13 ? "#1" : "#2"}</b></span>
                </div>
              </div>
            </div>

            <div className="cf-takeaway-box">
              <strong style={{ color: "#B8935A" }}>Key Takeaway: </strong>
              <span>{data.counterfactual.takeaway}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: AI Intelligence Consensus (Disagreement Map) */}
      {activeTab === "consensus" && data.ai_disagreement && (
        <div className="sector-deepdive-panel">
          <div className="deepdive-header">
            <span className="card-micro-eyebrow">MARKETMIND INTELLIGENCE CONSENSUS</span>
            <h2>Multi-Engine Consensus &amp; Disagreement Map</h2>
            <p>{data.ai_disagreement.synthesis}</p>
          </div>

          <div className="consensus-engines-grid">
            {(data.ai_disagreement.engines || []).map((eng, eIdx) => (
              <div key={eIdx} className="consensus-engine-card">
                <div className="engine-top">
                  <strong className="engine-name">{eng.name}</strong>
                  <span
                    className="engine-stance-pill"
                    style={{ background: `${eng.color}18`, color: eng.color }}
                  >
                    {eng.stance}
                  </span>
                </div>
                <div className="engine-bar-track">
                  <div
                    className="engine-bar-fill"
                    style={{ width: `${eng.score}%`, background: eng.color }}
                  />
                </div>
                <div className="engine-score-val">
                  <span>Confidence</span>
                  <strong>{eng.score}%</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="disagreement-alert-box">
            <div className="disagreement-alert-icon">⚡</div>
            <div>
              <strong className="disagreement-alert-title">AI Models Disagree:</strong>
              <p className="disagreement-alert-text">
                Fundamentals and management governance models are firmly bullish, but valuation and petrochemical margins have not yet confirmed an unconditional breakout thesis.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback intelligence synthesizer for offline/local resilience (fully dynamic per company)
function getFallbackIntelligence(sym, comp, secAvg) {
  const name = comp?.name || `${sym} Ltd`;
  const sector = comp?.sector || "Core Industry";
  const price = parseFloat(comp?.price || 1000.0);
  const margin = parseFloat(comp?.net_margin || 9.5);
  const roe = parseFloat(comp?.roe || 13.5);
  const growth = parseFloat(comp?.revenue_growth || 12.0);
  const pe = parseFloat(comp?.pe_ratio || 24.0);

  const secMargin = secAvg?.margin || 8.5;
  const secRoe = secAvg?.roe || 12.0;
  const secGrowth = secAvg?.growth || 11.0;
  const secPe = secAvg?.pe || 24.0;

  const growthDiff = Math.round((growth - secGrowth) * 10) / 10;
  const marginDiff = Math.round((margin - secMargin) * 10) / 10;

  const growthScore = Math.min(Math.max(Math.round((growth / 20.0) * 85), 20), 96);
  const marginScore = Math.min(Math.max(Math.round((margin / 18.0) * 85), 20), 96);
  const roeScore = Math.min(Math.max(Math.round((roe / 22.0) * 90), 20), 96);
  const valueScore = Math.min(Math.max(Math.round((35.0 / Math.max(pe, 8.0)) * 55), 20), 94);
  const riskScore = 78;

  const overallScore = Math.round(growthScore * 0.25 + marginScore * 0.25 + roeScore * 0.20 + valueScore * 0.15 + riskScore * 0.15);

  let tag = "ACCUMULATE ON DIP";
  let headline = "Quality Improving, Valuation Neutral";
  if (overallScore >= 85) {
    tag = "STRONG BUY";
    headline = "High-Conviction Fundamental Compounder";
  } else if (overallScore >= 76) {
    tag = "SELECTIVE ACCUMULATION";
    headline = "Solid Operating Velocity, Balanced Multiple";
  } else if (overallScore < 68) {
    tag = "HOLD / NEUTRAL";
    headline = "Range Consolidation, Margin Watch";
  }

  const secLower = sector.toLowerCase();
  let aiRead = `${name} compounds top-line revenue at ${growth}%, outperforming the active sector benchmark (${secGrowth}%). Balance sheet leverage remains disciplined with ROE at ${roe}%.`;

  if (secLower.includes("pharma") || secLower.includes("health") || ["SUNPHARMA", "CIPLA", "DRREDDY", "DIVISLAB"].includes(sym)) {
    headline = "Specialty Generic Franchise, cGMP Moat";
    aiRead = `${name} maintains defensible domestic chronic formulation market share with revenue compounding at ${growth}%. While US price erosion creates moderate margin absorption (${margin}%), specialty generic pipelines and FDA compliance offer attractive medium-term risk-reward.`;
  } else if (secLower.includes("bank") || secLower.includes("finance") || ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK"].includes(sym)) {
    headline = "Deposit Moat, Net Interest Spread Resilience";
    aiRead = `${name} advances loan compounding at ${growth}%, outperforming systemic credit velocity. Stable CASA deposit franchise and disciplined underwriting protect ROE (${roe}%) across macro rate cycles.`;
  } else if (secLower.includes("it") || secLower.includes("tech") || ["TCS", "INFY", "WIPRO", "HCLTECH"].includes(sym)) {
    headline = "Enterprise Cloud Moat, Discretionary IT Resilience";
    aiRead = `${name} delivers premier Tier-1 capital efficiency with operating margins at ${margin}% and ROE at ${roe}%. Large enterprise AI and digital migration order books cushion against North American BFSI pauses.`;
  } else if (secLower.includes("auto") || ["TATAMOTORS", "MARUTI", "M&M", "BAJAJ-AUTO"].includes(sym)) {
    headline = "Premiumization Cycle, EV Fleet Scale";
    aiRead = `${name} captures strong domestic market share across premium and electric vehicle portfolios with revenue growing at ${growth}%. Operating margin (${margin}%) is poised to expand as manufacturing utilization crosses 85%.`;
  } else if (secLower.includes("consumer") || secLower.includes("fmcg") || ["ITC", "HINDUNILVR", "TITAN"].includes(sym)) {
    headline = "Brand Pricing Power, Rural Volume Recovery";
    aiRead = `${name} wields unassailable brand pricing power with return on equity at ${roe}%. Direct rural distribution reach and premium SKU monetization provide asymmetric downside safety.`;
  } else if (secLower.includes("energy") || ["RELIANCE", "ONGC", "COALINDIA"].includes(sym)) {
    headline = "Integrated Energy Moat, Upstream Cash Conversion";
    aiRead = `${name} leverages world-scale asset integration with top-line revenue velocity at ${growth}%. Consolidated free cash flows provide strong ballast while new energy monetization pipelines de-risk long-term terminal value.`;
  }

  const targetMargin = Math.round((margin + 2.2) * 10) / 10;
  const targetRoe = Math.round((roe + 2.5) * 10) / 10;

  return {
    symbol: sym,
    name: name,
    sector: sector,
    price: price,
    overall_score: overallScore,
    headline: headline,
    tag: tag,
    ai_read: aiRead,
    dna_scores: { Growth: growthScore, Margins: marginScore, ROE: roeScore, Value: valueScore, Risk: riskScore },
    sector_dna_scores: { Growth: 68, Margins: 72, ROE: 70, Value: 62, Risk: 70 },
    growth_edge: { val: `${growthDiff >= 0 ? "+" : ""}${growthDiff} pp`, status: growthDiff >= 0 ? "favorable" : "unfavorable", label: "Growth Edge" },
    margin_gap: { val: `${marginDiff >= 0 ? "+" : ""}${marginDiff} pp`, status: marginDiff >= 0 ? "favorable" : "unfavorable", label: "Margin Gap" },
    valuation_multiple: { val: `${pe}x P/E`, status: "neutral", label: "Valuation" },
    margin_breakdown: {
      gap_percentage: `${marginDiff >= 0 ? "+" : ""}${marginDiff}%`,
      primary_causes: [
        { factor: "Raw Material & Input Cost Squeeze", impact: `operating drag (${Math.round(marginDiff * 0.45 * 10) / 10} pp)`, desc: `Quarterly procurement cycle adjustments for ${name}.` },
        { factor: "Capacity Capex & Expansion Friction", impact: `depreciation load (${Math.round(marginDiff * 0.35 * 10) / 10} pp)`, desc: "Upfront capital expenditure on technology and infrastructure." },
        { factor: "Product Mix & Operating Leverage", impact: `portfolio benefit (${Math.round(marginDiff * 0.20 * 10) / 10} pp)`, desc: "Higher-margin offering additions cushioning downside." }
      ],
      ai_attribution: {
        operational_pct: 70,
        business_mix_pct: 30,
        conclusion: `70% of the variance appears operational, while ~30% is linked to product-mix differences against sector peers.`
      }
    },
    thesis_unlock: {
      current_score: overallScore,
      target_threshold: 85,
      current_rating: tag,
      target_rating: "STRONG BUY",
      unlock_rule: "If at least 3 of these 4 conditions occur, MarketMind estimates the investment thesis upgrades to Strong Buy.",
      conditions: [
        { metric: "Net Margin", current: `${margin}%`, target: `${targetMargin}%+`, status: margin >= targetMargin ? "on_track" : "in_progress", met: margin >= targetMargin, delta: margin >= targetMargin ? "Pass (Met)" : `+${Math.round((targetMargin - margin) * 10) / 10} pp needed` },
        { metric: "Return on Equity (ROE)", current: `${roe}%`, target: `${targetRoe}%+`, status: roe >= targetRoe ? "on_track" : "in_progress", met: roe >= targetRoe, delta: roe >= targetRoe ? "Pass (Met)" : `+${Math.round((targetRoe - roe) * 10) / 10} pp needed` },
        { metric: "Revenue Growth", current: `${growth}%`, target: `Maintain >${secGrowth}%`, status: growth >= secGrowth ? "on_track" : "in_progress", met: growth >= secGrowth, delta: growth >= secGrowth ? `Pass (${growth}%)` : `+${Math.round((secGrowth - growth) * 10) / 10} pp needed` },
        { metric: "Valuation P/E", current: `${pe}x`, target: "Remain below 28.0x", status: pe <= 28.0 ? "on_track" : "in_progress", met: pe <= 28.0, delta: pe <= 28.0 ? `Pass (${pe}x)` : `-${Math.round((pe - 28.0) * 10) / 10}x contraction needed` }
      ]
    },
    counterfactual: {
      prompt: `What if ${sym} expanded operating margins to 15.0%?`,
      hypothetical_metric: "Net Margin 15.0%",
      simulated_roe: `${Math.round((roe + 2.4) * 10) / 10}%`,
      simulated_score: Math.min(overallScore + 8, 96),
      current_rank: 2,
      simulated_rank: 1,
      takeaway: `Profitability and margin expansion represent the primary catalyst preventing ${sym} from securing Rank #1.`
    },
    ai_disagreement: {
      headline: "AI Models Show Broad Consensus",
      synthesis: `Fundamentals and management governance models are constructive, while valuation multiples trade near peer median levels for ${name}.`,
      engines: [
        { name: "Fundamentals AI", stance: "Bullish", score: Math.min(overallScore + 4, 96), color: "#16a34a" },
        { name: "News & Sentiment AI", stance: "Bullish", score: 76, color: "#16a34a" },
        { name: "Valuation Multiple AI", stance: "Neutral", score: valueScore, color: "#f59e0b" },
        { name: "Management Trust Meter", stance: "High Trust", score: 86, color: "#16a34a" },
        { name: "Forensic & Risk Engine", stance: "Stable", score: 74, color: "#16a34a" }
      ]
    },
    anomalies: [
      { title: margin < secMargin ? "Margin compression persists" : "Margin leadership premium", confidence: 91, trend: margin < secMargin ? "down" : "up", detail: `Operating net margin of ${margin}% compares against peer median of ${secMargin}%.` },
      { title: roe >= secRoe ? "Capital efficiency strength" : "Capital efficiency gap", confidence: 86, trend: roe >= secRoe ? "up" : "neutral", detail: `ROE of ${roe}% reflects capital reinvestment discipline relative to cost of capital.` },
      { title: growth >= secGrowth ? "Growth quality improving" : "Growth velocity moderation", confidence: 79, trend: growth >= secGrowth ? "up" : "down", detail: `Revenue expansion of ${growth}% establishes core volume momentum.` }
    ],
    economic_exposure: {
      insight: `Traditional sector peers ≠ economically relevant peers. ${name}'s operations and balance sheet involve multiple distinct economic drivers across specialized segments.`,
      segments: [
        { name: "Core Business Line", share: "60%", peers: [sym === "TCS" ? "INFY" : sym === "HDFCBANK" ? "ICICIBANK" : "RELIANCE"], commentary: "Primary revenue and operational cash flow driver" },
        { name: "Strategic Growth Verticals", share: "25%", peers: [sym === "TCS" ? "HCLTECH" : "SBIN"], commentary: "High-margin growth and expansion initiatives" },
        { name: "Platform Infrastructure & Tech", share: "15%", peers: ["TCS", "LT"], commentary: "Operational digitization and automation scale" }
      ],
      economic_peers: [sym === "TCS" ? "INFY" : sym === "HDFCBANK" ? "ICICIBANK" : "ONGC", sym === "TCS" ? "HCLTECH" : "COALINDIA", "BHARTIARTL", "ADANIENT"]
    },
    scenarios: {
      "+10% Crude Oil": {
        label: "+10% Crude Oil",
        description: "+10% crude oil shock",
        confidence: 82,
        margin_delta: -1.6,
        fcf_delta: -4.2,
        score_before: overallScore,
        score_after: overallScore - 4,
        narrative: `Higher logistics freight and crude derivative packaging input costs absorb ~160 bps of operating margin for ${name}.`,
        chain: [
          { step: "Crude +10%", desc: "Global benchmark rises on supply friction" },
          { step: "Logistics Inflation", desc: "Transportation and energy input inflation" },
          { step: "Margin Delta -1.6%", desc: "Gross margin absorbs logistics cost drag" },
          { step: `Score ${overallScore} → ${overallScore - 4}`, desc: "Short-term margin resilience recalibrated" }
        ]
      },
      "+150 bps Margin": {
        label: "+150 bps Margin",
        description: "+150 bps Operating Margin Expansion",
        confidence: 88,
        margin_delta: 1.5,
        fcf_delta: 8.4,
        score_before: overallScore,
        score_after: Math.min(overallScore + 8, 98),
        narrative: `Overhead discipline and pricing power pass-through push net margins toward ${Math.round((margin + 1.5) * 10) / 10}%, upgrading conviction for ${name}.`,
        chain: [
          { step: "Pricing Power", desc: "Customer contract pass-through and overhead discipline" },
          { step: "Operating Leverage", desc: "Fixed corporate costs amortized across higher margin" },
          { step: "Margin +150 bps", desc: `Net margin advances from ${margin}% to ${Math.round((margin + 1.5) * 10) / 10}%` },
          { step: "Score Upgrade", desc: `Crosses key institutional threshold (${overallScore} → ${Math.min(overallScore + 8, 98)})` }
        ]
      },
      "+100 bps Rates": {
        label: "+100 bps Rates",
        description: "+100 bps RBI Policy Repo Rate Hike",
        confidence: 85,
        margin_delta: -0.6,
        fcf_delta: -2.8,
        score_before: overallScore,
        score_after: overallScore - 3,
        narrative: `Benchmark sovereign yields harden, slightly increasing debt servicing costs on floating corporate borrowing for ${name}.`,
        chain: [
          { step: "Rates +100 bps", desc: "Sovereign 10-year benchmarks climb" },
          { step: "Capital Cost ↑", desc: "Weighted average cost of capital expands" },
          { step: "Score Recalibration", desc: `Discounted multiple adjusted (${overallScore} → ${overallScore - 3})` }
        ]
      },
      "-5% Revenue Growth": {
        label: "-5% Revenue Growth",
        description: "-5% Top-line Macro Growth Deceleration",
        confidence: 80,
        margin_delta: -1.7,
        fcf_delta: -5.8,
        score_before: overallScore,
        score_after: overallScore - 7,
        narrative: `Top-line volume moderation slows fixed overhead amortization, eroding operating margins for ${name}.`,
        chain: [
          { step: "Macro Slowdown", desc: "Client ordering and discretionary moderation" },
          { step: "Operating De-leverage", desc: "Fixed overhead friction presses against slower top-line" },
          { step: "Score Contraction", desc: `Growth edge contracts (${overallScore} → {overallScore - 7})` }
        ]
      }
    },
    opportunity_matrix: {
      [sym]: { Growth: growthScore, Margin: marginScore, ROE: roeScore, Value: valueScore, Risk: riskScore }
    }
  };
}
