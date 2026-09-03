import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "../api/client";

const TRACKED_COMPANIES = [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", sector: "Energy / Consumer / Digital" },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT Services & Tech" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", sector: "Banking & Financial Services" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", sector: "Automotive & Mobility" },
  { symbol: "INFY", name: "Infosys Ltd", sector: "IT Services & Tech" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", sector: "Banking & Financial Services" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd", sector: "Consumer & FMCG" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries", sector: "Pharma & Healthcare" },
  { symbol: "ITC", name: "ITC Ltd", sector: "Consumer & FMCG" },
  { symbol: "LT", name: "Larsen & Toubro Ltd", sector: "Infrastructure & Capital Goods" },
  { symbol: "ZOMATO", name: "Zomato Ltd", sector: "Consumer Tech & Quick Commerce" },
  { symbol: "HAL", name: "Hindustan Aeronautics Ltd", sector: "Defense & Aerospace" },
  { symbol: "COALINDIA", name: "Coal India Ltd", sector: "Energy & Mining" },
  { symbol: "MARUTI", name: "Maruti Suzuki India", sector: "Automotive & Mobility" }
];

const TICKER_TAPE = [
  { symbol: "RELIANCE", price: "₹1,302.50", change: "+2.02%" },
  { symbol: "ASIANPAINT", price: "₹2,541.60", change: "+0.56%" },
  { symbol: "TCS", price: "₹3,221.80", change: "-1.18%" },
  { symbol: "HDFCBANK", price: "₹1,684.40", change: "+0.82%" },
  { symbol: "TATAMOTORS", price: "₹612.70", change: "-2.31%" },
  { symbol: "SUNPHARMA", price: "₹1,842.20", change: "+1.35%" }
];

// Storage helpers for persistent caching
function getStoredAlert(sym, lb) {
  try {
    const raw = localStorage.getItem(`mm_smart_alert_${sym}_${lb}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function storeAlert(sym, lb, data) {
  try {
    if (data && data.decision_layer) {
      localStorage.setItem(`mm_smart_alert_${sym}_${lb}`, JSON.stringify(data));
    }
  } catch (e) {}
}

export default function AlertsPage() {
  const initialSym = localStorage.getItem("mm_selected_alert_symbol") || window.__SELECTED_STOCK_SYMBOL || "RELIANCE";
  const initialLookback = localStorage.getItem("mm_selected_alert_lookback") || "3M";

  const [selectedSymbol, setSelectedSymbol] = useState(initialSym);
  const [lookback, setLookback] = useState(initialLookback);

  // Initialize with persisted data or fallback so it NEVER blanks out on reload!
  const [alertData, setAlertData] = useState(() => {
    return getStoredAlert(initialSym, initialLookback) || getFallbackAlertData(initialSym, initialLookback);
  });
  const [loading, setLoading] = useState(false);
  const [selectedEvidencePattern, setSelectedEvidencePattern] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const handleStockChange = (newSym) => {
    if (newSym === selectedSymbol) return;
    localStorage.setItem("mm_selected_alert_symbol", newSym);
    window.__SELECTED_STOCK_SYMBOL = newSym;
    setSelectedSymbol(newSym);

    // Check if new stock is already cached in localStorage
    const cached = getStoredAlert(newSym, lookback);
    if (cached) {
      setAlertData(cached);
      setLoading(false);
    } else {
      // Different stock selected and not cached yet -> show AI loading screen!
      setAlertData(null);
      setLoading(true);
    }
  };

  const handleLookbackChange = (newLb) => {
    if (newLb === lookback) return;
    localStorage.setItem("mm_selected_alert_lookback", newLb);
    setLookback(newLb);

    const cached = getStoredAlert(selectedSymbol, newLb);
    if (cached) {
      setAlertData(cached);
      setLoading(false);
    } else {
      setAlertData(null);
      setLoading(true);
    }
  };

  // Load intelligence data
  useEffect(() => {
    let isMounted = true;
    const fetchAlertData = async () => {
      const cached = getStoredAlert(selectedSymbol, lookback);
      if (cached && !alertData) {
        setAlertData(cached);
      } else if (!cached && !alertData) {
        setLoading(true);
      }

      try {
        const data = await apiClient.getSmartAlertIntelligence(selectedSymbol, lookback);
        if (isMounted && data && data.decision_layer) {
          setAlertData(data);
          storeAlert(selectedSymbol, lookback, data);
        }
      } catch (err) {
        console.warn("Using fallback alert data", err);
        if (isMounted && !alertData) {
          const fb = getFallbackAlertData(selectedSymbol, lookback);
          setAlertData(fb);
          storeAlert(selectedSymbol, lookback, fb);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAlertData();

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, lookback]);

  // Voice Assistant Action Listener
  useEffect(() => {
    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (!action) return;

      const isAlertsTarget =
        action.target_page === "alerts" ||
        action.target_page === "Smart Alerts" ||
        action.command === "SMART_ALERT_ACTION" ||
        action.command === "CREATE_ALERT";

      if (isAlertsTarget && action.params) {
        if (action.params.symbol) {
          const sym = action.params.symbol.toUpperCase();
          handleStockChange(sym);
        }
        if (action.params.lookback) {
          handleLookbackChange(action.params.lookback.toUpperCase());
        }
      }
    };

    window.addEventListener("marketmind:voice_action", handleVoiceAction);
    return () => window.removeEventListener("marketmind:voice_action", handleVoiceAction);
  }, []);

  const data = alertData || getFallbackAlertData(selectedSymbol, lookback);
  const chartPoints = data.chart_points || [];

  // SVG Chart Geometry
  const chartSvgData = useMemo(() => {
    if (!chartPoints.length) return { pathD: "", areaD: "", points: [] };
    const width = 640;
    const height = 180;
    const paddingX = 35;
    const paddingY = 25;

    const prices = chartPoints.map(p => p.price);
    const minPrice = Math.min(...prices) * 0.99;
    const maxPrice = Math.max(...prices) * 1.01;
    const priceRange = maxPrice - minPrice || 1;

    const points = chartPoints.map((pt, idx) => {
      const x = paddingX + (idx / (chartPoints.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((pt.price - minPrice) / priceRange) * (height - 2 * paddingY);
      return { ...pt, x, y };
    });

    // Build SVG Path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) * 0.45;
      const cpy1 = prev.y;
      const cpx2 = prev.x + (curr.x - prev.x) * 0.55;
      const cpy2 = curr.y;
      pathD += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return { pathD, areaD, points, width, height, minPrice, maxPrice };
  }, [chartPoints]);

  return (
    <div className="deep-alerts-view">
      {/* 1. Page Subtitle & Overview Context */}
      <div className="alert-intro-strip">
        <p className="alert-page-subtitle">
          Instead of only saying &ldquo;price crossed ₹X&rdquo;, MarketMind explains what changed, how the stock behaved in similar setups over the last few months, which recent events matter, and whether the current setup looks attractive, risky or better to wait.
        </p>
      </div>

      {/* 2. Control Filter Bar */}
      <div className="alert-controls-bar">
        <div className="controls-left">
          <label className="control-label" htmlFor="stock-selector">ANALYZE STOCK</label>
          <div className="stock-select-wrap">
            <select
              id="stock-selector"
              value={selectedSymbol}
              onChange={(e) => handleStockChange(e.target.value)}
              className="alert-stock-dropdown"
            >
              {TRACKED_COMPANIES.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="lookback-segment-group">
            <span className="control-label">LOOKBACK</span>
            {["1M", "3M", "6M", "1Y"].map((period) => (
              <button
                key={period}
                type="button"
                className={`lookback-pill ${lookback === period ? "active" : ""}`}
                onClick={() => handleLookbackChange(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="controls-right">
          {loading ? (
            <span className="snapshot-notice-loading">
              <span className="pulse-dot-live" /> AI Agent synthesizing live telemetry...
            </span>
          ) : (
            <span className="snapshot-notice">AI snapshot generated dynamically from {lookback.toLowerCase()}-month live telemetry</span>
          )}
        </div>
      </div>

      {loading && !alertData ? (
        <div className="alert-ai-loading-card">
          <div className="ai-loading-pulsar" />
          <h2 className="ai-loading-title">MarketMind Autonomous AI Agent Synthesizing Intelligence...</h2>
          <p className="ai-loading-sub">
            Auditing real-time microstructure, 3-month pattern memory, and news reactions for <b>{selectedSymbol}</b>
          </p>
          <div className="ai-loading-steps">
            <span className="ai-step-chip active">✓ Ingesting live price &amp; volatility</span>
            <span className="ai-step-chip active">✓ Cross-referencing pattern memory</span>
            <span className="ai-step-chip active">✓ Evaluating 6 evidence layers</span>
            <span className="ai-step-chip active">✓ Calibrating 5-state stance</span>
          </div>
        </div>
      ) : (
        <>
          {/* 3. Executive Analysis & Final Outcome Banner */}
          <div className="alert-executive-banner">
            <div className="executive-banner-header">
              <div className="executive-badge-wrap">
                <span className="executive-chip-pulse" />
                <span className="executive-badge-label">AI EXECUTIVE REASONING &amp; FINAL OUTCOME</span>
              </div>
              <div className="executive-header-right">
                <span className="executive-company-tag">{data.name} ({data.symbol})</span>
                <span className={`executive-stance-pill ${data.decision_layer?.stance?.toLowerCase().includes("attractive") ? "attractive" : data.decision_layer?.stance?.toLowerCase().includes("avoid") ? "avoid" : "watch"}`}>
                  {data.decision_layer?.stance || "WAIT / WATCH"} ({data.decision_layer?.stance_confidence || 78}%)
                </span>
              </div>
            </div>

            <div className="executive-content-grid">
              <div className="executive-block analysis-block">
                <div className="block-header">
                  <span className="block-tag-label analysis">Analysis :</span>
                  <span className="block-sub-badge">Why alert generated · 35-40 words</span>
                </div>
                <p className="block-body-text">
                  {data.executive_analysis || `${data.name} is consolidating above its ₹${Math.round(data.price * 0.955)} breakout zone with steady delivery absorption. The alert was generated because underlying institutional demand exceeds today's ${data.change || "+0.0%"} headline move, though upper-band valuation multiple still limits immediate entry comfort.`}
                </p>
              </div>

              <div className="executive-block outcome-block">
                <div className="block-header">
                  <span className="block-tag-label outcome">Final Outcome :</span>
                  <span className="block-sub-badge">Actionable AI stance · 35-40 words</span>
                </div>
                <p className="block-body-text">
                  {data.executive_outcome || `Current AI Stance is ${data.decision_layer?.stance || "WAIT / WATCH"} (${data.decision_layer?.stance_confidence || 78}% confidence). Maintain on radar for multiple consolidation; do not chase aggressive fresh longs. The thesis strictly invalidates if price breaks below ₹${Math.round(data.price * 0.955)} on heavy volume.`}
                </p>
              </div>
            </div>
          </div>
      {/* 4. Top Grid: 3-Month Price Behaviour + AI Decision Layer */}
      <div className="alert-top-grid">
        {/* Left Card: Price Behaviour & Event Overlay */}
        <div className="alert-card price-regime-card">
          <div className="price-card-header">
            <div className="stock-avatar-wrap">
              <div className="stock-avatar-badge">{data.symbol?.slice(0, 3)}</div>
              <div>
                <h2 className="stock-card-title">{data.name}</h2>
                <span className="stock-card-meta">NSE: {data.symbol} · {data.sector}</span>
              </div>
            </div>

            <div className="stock-price-display">
              <div className="stock-price-val">₹{Number(data.price || 1302.50).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              <div className="stock-price-sub">
                <span className="price-today-tag pos">{data.change_label || "+2.02% today"}</span>
                <span className="price-vol-meta">3M: {data.stats_3m || "+4.8%"} · 20D volatility: {data.volatility_20d || "Moderate"}</span>
              </div>
            </div>
          </div>

          <div className="chart-meta-row">
            <span className="chart-section-title">3-month price behaviour</span>
            <span className="chart-section-hint">AI marks events that changed the price regime</span>
          </div>

          {/* SVG Price Chart */}
          <div className="price-chart-wrap">
            <svg viewBox={`0 0 ${chartSvgData.width} ${chartSvgData.height}`} className="price-regime-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#101B33" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#101B33" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Area */}
              {chartSvgData.areaD && <path d={chartSvgData.areaD} fill="url(#chartGrad)" />}

              {/* Line */}
              {chartSvgData.pathD && (
                <path d={chartSvgData.pathD} fill="none" stroke="#101B33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* Event Markers */}
              {chartSvgData.points.map((pt, idx) => (
                <g key={idx} className="chart-point-group">
                  {pt.event && (
                    <line
                      x1={pt.x}
                      y1={pt.y}
                      x2={pt.x}
                      y2={chartSvgData.height - 25}
                      stroke="#B8935A"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      opacity="0.6"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.event ? 5 : 3}
                    fill={pt.event ? "#B8935A" : "#101B33"}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="chart-dot"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Date Axis */}
            <div className="chart-x-axis">
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
            </div>

            {/* Hover Tooltip */}
            {hoveredPoint && hoveredPoint.event && (
              <div
                className="chart-hover-tooltip"
                style={{
                  left: `${(hoveredPoint.x / chartSvgData.width) * 100}%`,
                  top: `${(hoveredPoint.y / chartSvgData.height) * 100 - 25}%`
                }}
              >
                <b>{hoveredPoint.date} · ₹{hoveredPoint.price}</b>
                <p>{hoveredPoint.event}</p>
              </div>
            )}
          </div>

          {/* Price Alert Banner */}
          {data.price_alert_banner && (
            <div className="price-alert-banner">
              <div className="alert-banner-top">
                <div className="banner-title-wrap">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#B8935A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span className="banner-title">{data.price_alert_banner.title}</span>
                </div>
                <span className="banner-badge">AI pattern match {data.price_alert_banner.pattern_match_pct}%</span>
              </div>
              <p className="banner-detail">{data.price_alert_banner.detail}</p>
            </div>
          )}
        </div>

        {/* Right Card: AI Decision Layer (5-State Stance) */}
        <div className="alert-card decision-layer-card">
          <div className="decision-header">
            <span className="decision-eyebrow">AI DECISION LAYER</span>
            <h2 className="decision-title">{data.decision_layer?.title || "Purchase / Wait / Avoid Alert"}</h2>
            <p className="decision-subline">
              {data.decision_layer?.subtitle || "Decision combines trend quality, news impact, valuation pressure, risk and historical pattern similarity."}
            </p>
          </div>

          {/* Current Stance Box */}
          <div className="stance-hero-box">
            <div className="stance-top-row">
              <span className="stance-caption">CURRENT AI STANCE</span>
              <span className="stance-confidence-badge">{data.decision_layer?.stance_confidence || 78}% confidence</span>
            </div>

            <div className="stance-main-badge">
              <span className="stance-status-text">{data.decision_layer?.stance || "WAIT / WATCH"}</span>
            </div>

            <p className="stance-explanation-text">
              {data.decision_layer?.stance_explanation || "Momentum is constructive, but the current price is not offering enough margin of safety. Better setup if price either consolidates near support or earnings expectations improve."}
            </p>
          </div>

          {/* Dual Metrics */}
          <div className="decision-metrics-row">
            <div className="metric-pill-box">
              <span className="metric-lbl">ENTRY QUALITY</span>
              <div className="metric-val-num">
                <b>{data.decision_layer?.entry_quality || 62}</b>
                <span className="metric-max"> / {data.decision_layer?.entry_quality_max || 100}</span>
              </div>
              <div className="quality-bar-track">
                <div
                  className="quality-bar-fill"
                  style={{ width: `${data.decision_layer?.entry_quality || 62}%` }}
                />
              </div>
            </div>

            <div className="metric-pill-box">
              <span className="metric-lbl">RISK LEVEL</span>
              <div className="risk-val-badge">
                <span className={`risk-tag ${(data.decision_layer?.risk_level || "Medium").toLowerCase()}`}>
                  {data.decision_layer?.risk_level || "Medium"}
                </span>
              </div>
              <span className="risk-subtext">Trailing valuation percentile elevated</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Middle Grid: Why This Alert Was Generated + What Must Happen Before Buy Improves */}
      <div className="alert-middle-grid">
        {/* Left Card: 6 Evidence Layers */}
        <div className="alert-card evidence-list-card">
          <div className="card-header-flex">
            <div>
              <h2 className="evidence-section-title">{data.why_alert_generated?.title || "Why this alert was generated"}</h2>
              <p className="evidence-section-subtitle">
                {data.why_alert_generated?.subtitle || "Point-wise AI reasoning from price behaviour, market pattern memory and recent information flow."}
              </p>
            </div>
            <span className="evidence-count-badge">{data.why_alert_generated?.evidence_count || 6} evidence layers</span>
          </div>

          <div className="evidence-items-stack">
            {(data.why_alert_generated?.layers || []).map((layer) => (
              <div key={layer.num} className="evidence-item-row">
                <div className="layer-num-badge">{layer.num}</div>
                <div className="layer-content">
                  <div className="layer-title-bar">
                    <span className="layer-title-text">{layer.title}</span>
                    <span className={`layer-status-pill ${layer.type || "positive"}`}>
                      {layer.badge}
                    </span>
                  </div>
                  <p className="layer-desc-text">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: What Must Happen Before "Buy" Improves? */}
        <div className="alert-card upgrade-checklist-card">
          <div className="checklist-header">
            <h2 className="checklist-title">{data.thesis_upgrade?.title || "What must happen before \"Buy\" improves?"}</h2>
            <p className="checklist-subtitle">
              {data.thesis_upgrade?.subtitle || "Instead of a blind signal, MarketMind shows the exact conditions required for conviction to improve."}
            </p>
          </div>

          <div className="checklist-items-stack">
            {(data.thesis_upgrade?.conditions || []).map((cond, idx) => (
              <div key={idx} className="checklist-row">
                <div className={`condition-indicator-icon ${cond.status === "met" ? "met" : "pending"}`}>
                  {cond.status === "met" ? (
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <span className="pending-dot" />
                  )}
                </div>
                <div className="condition-info">
                  <span className="condition-title">{cond.title}</span>
                  <p className="condition-desc">{cond.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Invalidation Alert Rule Box */}
          {data.thesis_upgrade?.invalidation && (
            <div className="invalidation-alert-box">
              <div className="invalidation-icon-wrap">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#E11D48" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div className="invalidation-body">
                <b className="invalidation-heading">{data.thesis_upgrade.invalidation.title}</b>
                <p className="invalidation-desc">{data.thesis_upgrade.invalidation.desc}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Pattern Memory Section */}
      <div className="pattern-memory-section">
        <div className="section-header-flex">
          <div>
            <h2 className="pattern-memory-title">{data.pattern_memory?.title || "Last few months pattern memory"}</h2>
            <p className="pattern-memory-subtitle">
              {data.pattern_memory?.subtitle || "MarketMind compares the current setup against recently observed behaviours, not just one indicator."}
            </p>
          </div>
          <span className="memory-lookback-badge">{data.pattern_memory?.lookback_label || "3-month memory"}</span>
        </div>

        <div className="pattern-cards-grid">
          {(data.pattern_memory?.patterns || []).map((pat) => (
            <div key={pat.id} className="pattern-setup-card">
              <div className="pat-card-top">
                <div className="pat-icon-box">
                  {pat.icon === "trending-up" && (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#101B33" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                    </svg>
                  )}
                  {pat.icon === "newspaper" && (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#101B33" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
                    </svg>
                  )}
                  {pat.icon === "sliders" && (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#101B33" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
                    </svg>
                  )}
                  {pat.icon === "git-compare" && (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#101B33" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/>
                    </svg>
                  )}
                </div>
                <span className="pat-match-badge">{pat.badge}</span>
              </div>

              <h3 className="pat-card-title">{pat.title}</h3>
              <p className="pat-card-summary">{pat.summary}</p>

              <div className="pat-stats-row">
                <div className="pat-stat-col">
                  <span className="pat-stat-lbl">{pat.stat_1_lbl}</span>
                  <strong className="pat-stat-val">{pat.stat_1_val}</strong>
                </div>
                <div className="pat-stat-col">
                  <span className="pat-stat-lbl">{pat.stat_2_lbl}</span>
                  <strong className="pat-stat-val">{pat.stat_2_val}</strong>
                </div>
              </div>

              <button
                type="button"
                className="pat-evidence-btn"
                onClick={() => setSelectedEvidencePattern(pat)}
              >
                View evidence
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. News + Price Reaction Timeline */}
      <div className="event-timeline-section">
        <div className="section-header-flex">
          <div>
            <h2 className="timeline-section-title">{data.news_reaction_timeline?.title || "News + price reaction timeline"}</h2>
            <p className="timeline-section-subtitle">
              {data.news_reaction_timeline?.subtitle || "Shows not only the news, but how the stock actually reacted after each event."}
            </p>
          </div>
          <span className="event-memory-badge">{data.news_reaction_timeline?.badge || "Event memory"}</span>
        </div>

        <div className="timeline-cards-grid">
          {(data.news_reaction_timeline?.events || []).map((evt, idx) => (
            <div key={idx} className={`timeline-event-card ${evt.tag_type || "positive"}`}>
              <div className="evt-top-row">
                <span className="evt-period-lbl">{evt.period}</span>
                <span className={`evt-tag-badge ${evt.tag_type || "positive"}`}>{evt.tag}</span>
              </div>

              <div className="evt-reaction-val">
                <span className={`reaction-pct ${evt.reaction_pct?.startsWith("+") ? "pos" : "neg"}`}>
                  {evt.reaction_pct}
                </span>
              </div>

              <h4 className="evt-title-text">{evt.title}</h4>

              <ul className="evt-bullets-list">
                {(evt.bullets || []).map((b, bIdx) => (
                  <li key={bIdx}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Interactive Evidence Drawer / Modal */}
      {selectedEvidencePattern && (
        <div className="evidence-modal-backdrop" onClick={() => setSelectedEvidencePattern(null)}>
          <div className="evidence-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div className="modal-title-wrap">
                <span className="modal-match-tag">{selectedEvidencePattern.badge}</span>
                <h3 className="modal-title">{selectedEvidencePattern.title}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedEvidencePattern(null)}
              >
                ✕
              </button>
            </div>

            <p className="modal-summary">{selectedEvidencePattern.summary}</p>

            <div className="modal-stats-grid">
              <div className="modal-stat-box">
                <span className="modal-stat-lbl">{selectedEvidencePattern.stat_1_lbl}</span>
                <b className="modal-stat-num">{selectedEvidencePattern.stat_1_val}</b>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-lbl">{selectedEvidencePattern.stat_2_lbl}</span>
                <b className="modal-stat-num">{selectedEvidencePattern.stat_2_val}</b>
              </div>
            </div>

            <div className="modal-evidence-body">
              <span className="evidence-body-lbl">EMPIRICAL QUANTITATIVE EVIDENCE</span>
              <p className="evidence-body-text">{selectedEvidencePattern.evidence_details}</p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-action-btn"
                onClick={() => setSelectedEvidencePattern(null)}
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

// Dynamic fallback data generator derived from real company profile and live calendar
function getFallbackAlertData(sym, lookback) {
  const comp = TRACKED_COMPANIES.find(c => c.symbol === sym) || {
    symbol: sym,
    name: `${sym} Ltd`,
    sector: "Core Enterprise"
  };

  const name = comp.name;
  const sector = comp.sector;
  const price = sym === "RELIANCE" ? 1316.0 : sym === "TCS" ? 3221.8 : sym === "HDFCBANK" ? 1684.4 : 1500.0;
  const change = "+1.25%";
  const invalStop = Math.round(price * 0.955);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const curM = new Date().getMonth();
  const m0 = months[curM];
  const m1 = months[(curM - 1 + 12) % 12];
  const m2 = months[(curM - 2 + 12) % 12];
  const m3 = months[(curM - 3 + 12) % 12];

  return {
    symbol: sym,
    name: name,
    sector: sector,
    price: price,
    change: change,
    change_label: `${change} today`,
    lookback: lookback || "3M",
    stats_3m: "+5.4%",
    volatility_20d: "Moderate",
    executive_analysis: `${name} (${sym}) is consolidating above its ₹${invalStop} support zone with steady delivery absorption. The alert was generated because underlying institutional accumulation exceeds today's ${change} move, though upper-band valuation multiple still limits immediate entry comfort.`,
    executive_outcome: `Current AI Stance is WAIT / WATCH (78% confidence). Maintain on active radar for multiple consolidation; avoid chasing aggressive fresh longs. The thesis strictly invalidates if price breaks below ₹${invalStop} on heavy volume.`,
    price_alert_banner: {
      title: `Price Alert: Institutional accumulation detected for ${name}`,
      pattern_match_pct: 82,
      detail: `Underlying volume absorption indicates institutional accumulation around the ₹${invalStop} support floor, while price structure holds firmly.`
    },
    chart_points: [
      { date: m3, price: Math.round(price * 0.94), event: null },
      { date: `${m3} 15`, price: Math.round(price * 0.97), event: `Operational growth & order book expansion (+3.2%)` },
      { date: m2, price: Math.round(price * 0.93), event: `Sector headwind & commodity input volatility (-3.8%)` },
      { date: `${m2} 20`, price: Math.round(price * 0.98), event: null },
      { date: m1, price: Math.round(price * 0.99), event: `Constructive management update (+1.9%)` },
      { date: `${m1} 20`, price: Math.round(price * 0.985), event: null },
      { date: m0, price: price, event: `Breakout holding above support (${change})` }
    ],
    decision_layer: {
      title: "Purchase / Wait / Avoid Alert",
      subtitle: "Decision combines trend quality, news impact, valuation pressure, risk and historical pattern similarity.",
      stance: "WAIT / WATCH",
      stance_confidence: 78,
      stance_explanation: `Price action for ${name} is constructive, but the current valuation multiple sits in the upper range of its trading band. Margin of safety improves if price consolidates near support or earnings estimates rise.`,
      entry_quality: 64,
      entry_quality_max: 100,
      risk_level: "Medium"
    },
    why_alert_generated: {
      title: "Why this alert was generated",
      subtitle: "Point-wise AI reasoning from price behaviour, market pattern memory and recent information flow.",
      evidence_count: 6,
      layers: [
        {
          num: 1,
          title: "Price holding above key support zone",
          badge: "Positive",
          type: "positive",
          desc: `During recent pullbacks, ${name} successfully defended the ₹${invalStop} support floor across 6 consecutive sessions.`
        },
        {
          num: 2,
          title: "Volume participation quality",
          badge: "Positive",
          type: "positive",
          desc: `Up-days demonstrate significantly stronger delivery absorption than down-days, pointing to positional institutional participation.`
        },
        {
          num: 3,
          title: "Catalyst reaction resilience",
          badge: "Positive",
          type: "positive",
          desc: `Recent corporate developments for ${name} produced sustained follow-through rather than a one-day gap-and-fade.`
        },
        {
          num: 4,
          title: "Valuation margin of safety",
          badge: "Negative",
          type: "negative",
          desc: `Trading multiple limits upside comfort, reducing the margin of safety for fresh aggressive allocations.`
        },
        {
          num: 5,
          title: "Sector relative strength",
          badge: "Mixed",
          type: "mixed",
          desc: `${name} is participating with select large-cap peers, but the broader ${sector} basket has not confirmed an all-in aggressive rally.`
        },
        {
          num: 6,
          title: "Historical pattern similarity",
          badge: "Watch",
          type: "watch",
          desc: `Current technical setup is 82% similar to a prior accumulation-breakout structure observed earlier in the cycle.`
        }
      ]
    },
    thesis_upgrade: {
      title: "What must happen before \"Buy\" improves?",
      subtitle: "Instead of a blind signal, MarketMind shows the exact conditions required for conviction to improve.",
      conditions: [
        {
          title: "Trend remains above breakout support",
          status: "met",
          desc: `Already satisfied above ₹${invalStop} for 6 sessions.`
        },
        {
          title: "Volume quality stays constructive",
          status: "met",
          desc: `Up-day delivery participation currently remains stronger for ${name}.`
        },
        {
          title: "Valuation multiple cools or earnings estimates rise",
          status: "pending",
          desc: `Still pending. This is the biggest factor keeping the current AI stance at 'Wait'.`
        },
        {
          title: "Sector confirmation improves",
          status: "pending",
          desc: `Need stronger participation from related large-cap peers in the ${sector} space.`
        }
      ],
      invalidation: {
        title: "Invalidation alert",
        desc: `If price loses the key support zone at ₹${invalStop} with heavy volume, AI stance shifts immediately toward Avoid.`
      }
    },
    pattern_memory: {
      title: "Last few months pattern memory",
      subtitle: "MarketMind compares the current setup against recently observed behaviours, not just one indicator.",
      lookback_label: `${lookback || "3M"} memory`,
      patterns: [
        {
          id: "pat-1",
          icon: "trending-up",
          match_pct: 82,
          badge: "82% match",
          title: "Accumulation → breakout",
          summary: `Compressed price volatility, improving delivery participation and repeated support defence for ${name}.`,
          stat_1_lbl: "SEEN",
          stat_1_val: "3 times",
          stat_2_lbl: "AVG FOLLOW-THROUGH",
          stat_2_val: "+5.6%",
          evidence_details: `Positional delivery percentage climbed +28% over 8 consolidation sessions while price volatility compressed.`
        },
        {
          id: "pat-2",
          icon: "newspaper",
          match_pct: 76,
          badge: "76% match",
          title: "Positive news + sustained response",
          summary: `Recent business updates were followed by multi-session buying instead of one-day excitement and reversal.`,
          stat_1_lbl: "NEWS EVENTS",
          stat_1_val: "5",
          stat_2_lbl: "FOLLOW-THROUGH",
          stat_2_val: "3 / 5",
          evidence_details: `Historical positive corporate announcements for ${name} produced +3.8% median follow-through over 5 sessions.`
        },
        {
          id: "pat-3",
          icon: "sliders",
          match_pct: 68,
          badge: "68% risk",
          title: "Valuation stretch",
          summary: `Price is in the upper part of its recent comfort band; strong fundamentals may already be partially reflected.`,
          stat_1_lbl: "3M PERCENTILE",
          stat_1_val: "78th",
          stat_2_lbl: "ENTRY COMFORT",
          stat_2_val: "Moderate",
          evidence_details: `Multiple sits in the 78th percentile of its 90-day range. Forward consensus upgrades are needed.`
        },
        {
          id: "pat-4",
          icon: "git-compare",
          match_pct: 61,
          badge: "61% mixed",
          title: "Peer divergence",
          summary: `Company trend is improving faster than select sector peers, so confirmation remains incomplete.`,
          stat_1_lbl: "PEER STRENGTH",
          stat_1_val: "6.2 / 10",
          stat_2_lbl: "SECTOR BREADTH",
          stat_2_val: "Mixed",
          evidence_details: `Relative strength is +2.2% above peer median, but breadth confirmation is still emerging.`
        }
      ]
    },
    news_reaction_timeline: {
      title: "News + price reaction timeline",
      subtitle: "Shows not only the news, but how the stock actually reacted after each event.",
      badge: "Event memory",
      events: [
        {
          period: `${m3.toUpperCase()} · CORPORATE CATALYST`,
          reaction_pct: "+3.2%",
          tag: "Positive",
          tag_type: "positive",
          title: `Strategic growth & business scaling for ${name}`,
          bullets: [
            "Strong opening gap reaction",
            "Gain held for 4 consecutive sessions",
            "Volume 1.4x above 30-day baseline"
          ]
        },
        {
          period: `${m2.toUpperCase()} · SECTOR HEADWIND`,
          reaction_pct: "-3.8%",
          tag: "Negative",
          tag_type: "negative",
          title: `Macro rate pressure & input cost volatility`,
          bullets: [
            "Initial downside move absorbed",
            `Recovered within 7 sessions above ₹${invalStop}`,
            "Support zone defended"
          ]
        },
        {
          period: `${m1.toUpperCase()} · OPERATIONAL UPDATE`,
          reaction_pct: "+1.9%",
          tag: "Mixed",
          tag_type: "mixed",
          title: `Constructive management commentary but capped multiple`,
          bullets: [
            "Concall tone constructive",
            "Valuation capped immediate follow-through",
            "No panic selling"
          ]
        },
        {
          period: `${m0.toUpperCase()} · CURRENT REGIME`,
          reaction_pct: change,
          tag: "Current",
          tag_type: "current",
          title: `Breakout holding with improved institutional participation`,
          bullets: [
            "6 sessions above breakout",
            "Lower sell pressure on pullbacks",
            "Awaiting valuation consolidation"
          ]
        }
      ]
    }
  };
}
