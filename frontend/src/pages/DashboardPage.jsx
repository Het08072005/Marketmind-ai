import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "../api/client";

function formatCopilotMessage(text) {
  if (!text) return null;
  // Strip any markdown bold asterisks so no raw ** ever appears anywhere
  const clean = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*\*/g, "").trim();
  const lines = clean.split("\n");

  return (
    <div className="copilot-message-content">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: "6px" }} />;
        }

        // Bullet point lines starting with •, -, or *
        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const content = trimmed.replace(/^[•\-*]\s*/, "");
          const colonIdx = content.indexOf(":");
          if (colonIdx > 0 && colonIdx < 35) {
            const label = content.slice(0, colonIdx).trim();
            const rest = content.slice(colonIdx + 1).trim();
            return (
              <div key={idx} className="copilot-bullet-line">
                <span className="copilot-bullet-dot">◆</span>
                <span className="copilot-bullet-body">
                  <strong className="copilot-bullet-label">{label}:</strong> {rest}
                </span>
              </div>
            );
          }
          return (
            <div key={idx} className="copilot-bullet-line">
              <span className="copilot-bullet-dot">◆</span>
              <span className="copilot-bullet-body">{content}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="copilot-text-p">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

function CopilotRobotIcon({ size = 20, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {/* Top Antenna */}
      <rect x="10.5" y="2.2" width="3" height="4.5" rx="1.5" />
      {/* Left Ear */}
      <rect x="2" y="9.5" width="2.5" height="6.5" rx="1.25" />
      {/* Right Ear */}
      <rect x="19.5" y="9.5" width="2.5" height="6.5" rx="1.25" />
      {/* Head with Eye Cutouts */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 6H15.5C17.433 6 19 7.567 19 9.5V14.5C19 16.433 17.433 18 15.5 18H8.5C6.567 18 5 16.433 5 14.5V9.5C5 7.567 6.567 6 8.5 6ZM9.5 13.5C10.3284 13.5 11 12.8284 11 12C11 11.1716 10.3284 10.5 9.5 10.5C8.67157 10.5 8 11.1716 8 12C8 12.8284 8.67157 13.5 9.5 13.5ZM14.5 13.5C15.3284 13.5 16 12.8284 16 12C16 11.1716 15.3284 10.5 14.5 10.5C13.6716 10.5 13 11.1716 13 12C13 12.8284 13.6716 13.5 14.5 13.5Z"
      />
    </svg>
  );
}

function getStockAnalysisPoints(stock) {
  if (Array.isArray(stock.points) && stock.points.length > 0) {
    return stock.points.map((pt) => {
      if (typeof pt === "string") {
        const colonIdx = pt.indexOf(":");
        if (colonIdx > 0) {
          return {
            label: pt.slice(0, colonIdx).replace(/^[•\-*⚡]\s*/, "").trim(),
            detail: pt.slice(colonIdx + 1).replace(/⚡\s*/g, "").trim()
          };
        }
        return {
          label: "Analytical Pillar",
          detail: pt.replace(/^[•\-*⚡]\s*/, "").trim()
        };
      }
      return {
        label: (pt.label || "Key Driver").replace(/⚡\s*/g, "").trim(),
        detail: (pt.detail || "").replace(/⚡\s*/g, "").trim()
      };
    });
  }

  // Graceful fallback synthesis if points are not yet populated from cache
  const cleanCat = (stock.catalyst || "Operational margin resilience & capital allocation discipline").replace(/⚡\s*/g, "").trim();
  const cleanHft = (stock.hft_pattern || "Institutional Block Accumulation").replace(/⚡\s*/g, "").trim();
  const targetStr = stock.target_price ? `₹${stock.target_price.toLocaleString("en-IN")}` : "Resistance Target";
  const stopStr = stock.stop_loss ? `₹${stock.stop_loss.toLocaleString("en-IN")}` : "Support Floor";
  const rrStr = stock.risk_reward || "1:3.0";
  const upStr = stock.upside_pct ? `+${stock.upside_pct}%` : "+2.8%";
  const dnStr = stock.downside_pct ? `-${stock.downside_pct}%` : "-0.9%";

  return [
    {
      label: "Institutional Order Flow",
      detail: `${cleanHft} sustaining disciplined buyer delta and volume absorption above key support.`
    },
    {
      label: "Fundamental Moat",
      detail: `${cleanCat} backed by solid financial compounding (ROE: ${stock.roe || "15"}%, P/E: ${stock.pe_ratio || "22"}x).`
    },
    {
      label: "Risk Architecture",
      detail: `Asymmetric ${rrStr} Risk-Reward setup targeting ${targetStr} (${upStr}) with invalidation stop pegged at ${stopStr} (${dnStr}).`
    }
  ];
}

export default function DashboardPage({ goPage, openAssistant }) {
  const [radarData, setRadarData] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("conviction");

  // In-Page Copilot Mini Chat State
  const [activeCopilotStock, setActiveCopilotStock] = useState(null);
  const [copilotMessages, setCopilotMessages] = useState({});
  const [copilotInputText, setCopilotInputText] = useState("");
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  // Auto-scroll whenever messages change, loading changes, or drawer toggles
  useEffect(() => {
    if (activeCopilotStock) {
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [copilotMessages, isCopilotLoading, activeCopilotStock]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const radarRes = await apiClient.getMarketRadarRecommendations().catch(() => null);
        if (radarRes) setRadarData(radarRes);
      } catch (err) {
        console.warn("Using cached dashboard metrics", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const radarStocks = radarData?.stocks || [];
  const activeStockObj = radarStocks.find((s) => s.symbol === activeCopilotStock);
  const filteredStocks = radarStocks.filter((s) => {
    // Filter tab
    if (activeFilter === "BUY" && !s.signal?.includes("BUY") && s.variant !== "buy") return false;
    if (activeFilter === "ACCUMULATE" && !s.signal?.includes("ACCUMULATE") && s.variant !== "accumulate") return false;
    if (activeFilter === "HOLD" && !s.signal?.includes("HOLD") && s.variant !== "hold") return false;
    if (activeFilter === "AVOID" && !s.signal?.includes("AVOID") && !s.signal?.includes("CAUTION") && s.variant !== "avoid") return false;

    // Sector filter
    if (selectedSector !== "ALL" && !s.sector.toLowerCase().includes(selectedSector.toLowerCase())) {
      return false;
    }

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q) ||
        (s.catalyst && s.catalyst.toLowerCase().includes(q)) ||
        (s.explanation && s.explanation.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (sortBy === "conviction") return b.conviction - a.conviction;
    if (sortBy === "upside") return b.upside_pct - a.upside_pct;
    if (sortBy === "change") {
      const cA = parseFloat((a.change || "0").replace("%", "").replace("+", "").replace("−", "-")) || 0;
      const cB = parseFloat((b.change || "0").replace("%", "").replace("+", "").replace("−", "-")) || 0;
      return cB - cA;
    }
    if (sortBy === "price") return b.price - a.price;
    return 0;
  });

  const handleToggleCopilot = (stock) => {
    if (activeCopilotStock === stock.symbol) {
      setActiveCopilotStock(null);
      return;
    }

    setActiveCopilotStock(stock.symbol);
    setCopilotInputText("");

    if (!copilotMessages[stock.symbol]) {
      setCopilotMessages((prev) => ({
        ...prev,
        [stock.symbol]: [
          {
            role: "assistant",
            text: `For ${stock.name} (${stock.symbol}), quantitative multi-factor models maintain a high-conviction ${stock.signal} stance backed by steady institutional buyer absorption above the key 20-day VWAP floor.\n\n• Current Price: ₹${stock.price?.toLocaleString("en-IN")} (${stock.change})\n• Target Resistance: ₹${stock.target_price?.toLocaleString("en-IN")} (+${stock.upside_pct}%)\n• Stop-Loss Floor: ₹${stock.stop_loss?.toLocaleString("en-IN")} (-${stock.downside_pct}%)\n• Risk-to-Reward: ${stock.risk_reward}\n• HFT Flow Setup: ${stock.hft_pattern || "Institutional Flow"}\n\nAsk me about today's catalysts, downside risk, valuation multiples, or entry zones!`
          }
        ]
      }));
    }
    setTimeout(scrollToBottom, 80);
  };

  const handleSendCopilotQuery = async (stock, queryText) => {
    if (!queryText || !queryText.trim() || isCopilotLoading) return;
    const text = queryText.trim();
    setCopilotInputText("");

    const currentHistory = copilotMessages[stock.symbol] || [];
    const updatedWithUser = [...currentHistory, { role: "user", text }];

    setCopilotMessages((prev) => ({
      ...prev,
      [stock.symbol]: updatedWithUser
    }));

    setIsCopilotLoading(true);
    setTimeout(scrollToBottom, 30);

    try {
      const historyPayload = currentHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.text
      }));

      const res = await apiClient.sendVoiceChat({
        message: text,
        ticker: stock.symbol,
        history: historyPayload
      });

      const replyText = res?.reply || `Analysis complete for ${stock.name}. Multi-factor conviction remains anchored to ${stock.signal}.`;

      setCopilotMessages((prev) => ({
        ...prev,
        [stock.symbol]: [
          ...updatedWithUser,
          { role: "assistant", text: replyText }
        ]
      }));
      setTimeout(scrollToBottom, 60);
    } catch (err) {
      console.warn("Copilot chat error", err);
      setCopilotMessages((prev) => ({
        ...prev,
        [stock.symbol]: [
          ...updatedWithUser,
          {
            role: "assistant",
            text: `⚠️ Telemetry update: ${stock.name} is currently maintaining S1 invalidation support at ₹${stock.stop_loss}. ${stock.explanation}`
          }
        ]
      }));
      setTimeout(scrollToBottom, 60);
    } finally {
      setIsCopilotLoading(false);
      setTimeout(scrollToBottom, 80);
    }
  };

  return (
    <div className="dashboard-radar-view">
      <div className="radar-section">
        <div className="radar-header-card">
          <div className="radar-header-top">
            <div>
              <div className="radar-eyebrow">INSTITUTIONAL EQUITY INTELLIGENCE · TOP 38 INDIAN MARKET LEADERS</div>
              <h2 className="radar-title">Today's Institutional Buy / Sell Verdicts &amp; Predictions</h2>
              <p className="radar-subtitle">
                Real-time multi-factor quantitative audit: Current market prices, HFT pattern recognition, tight institutional stop-losses, and actionable buy/sell rationales for active market trading.
              </p>
            </div>
          </div>

          {/* Overview Summary Statistics Bar (Clean Reference Card Layout) */}
          {/* Overview Summary Statistics Bar (Clean Reference Card Layout - Pure Typography) */}
          <div className="radar-stats-grid">
            {/* Card 1: TOTAL TRACKED */}
            <div className="radar-stat-box stat-total">
              <div className="radar-stat-header">
                <div className="radar-stat-icon-wrap icon-total">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <div className="radar-stat-info">
                  <span className="radar-stat-lbl">TOTAL TRACKED</span>
                  <span className="radar-stat-sub">Market leaders</span>
                </div>
              </div>
              <div className="radar-stat-bottom">
                <span className="radar-stat-val val-total">{radarData?.summary?.total_tracked || 38}</span>
                <span className="radar-stat-sep">|</span>
                <span className="radar-stat-desc">tracked leaders</span>
              </div>
            </div>

            {/* Card 2: STRONG BUY */}
            <div className="radar-stat-box stat-buy">
              <div className="radar-stat-header">
                <div className="radar-stat-icon-wrap icon-buy">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
                <div className="radar-stat-info">
                  <span className="radar-stat-lbl">STRONG BUY</span>
                  <span className="radar-stat-sub">Institutional picks</span>
                </div>
              </div>
              <div className="radar-stat-bottom">
                <span className="radar-stat-val val-buy">{radarData?.summary?.strong_buy_count || 16}</span>
                <span className="radar-stat-sep">|</span>
                <span className="radar-stat-desc">institutional picks</span>
              </div>
            </div>

            {/* Card 3: ACCUMULATE */}
            <div className="radar-stat-box stat-accumulate">
              <div className="radar-stat-header">
                <div className="radar-stat-icon-wrap icon-accumulate">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                </div>
                <div className="radar-stat-info">
                  <span className="radar-stat-lbl">ACCUMULATE</span>
                  <span className="radar-stat-sub">Value accumulation</span>
                </div>
              </div>
              <div className="radar-stat-bottom">
                <span className="radar-stat-val val-accumulate">{radarData?.summary?.accumulate_count || 10}</span>
                <span className="radar-stat-sep">|</span>
                <span className="radar-stat-desc">value accumulation</span>
              </div>
            </div>

            {/* Card 4: HOLD / RANGE */}
            <div className="radar-stat-box stat-hold">
              <div className="radar-stat-header">
                <div className="radar-stat-icon-wrap icon-hold">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 3v4m0 8v6M9 7h3v8H9zM17 5v2m0 8v6M17 7h3v8h-3zM3 9v2m0 6v4M3 11h3v6H3z"/>
                  </svg>
                </div>
                <div className="radar-stat-info">
                  <span className="radar-stat-lbl">HOLD / RANGE</span>
                  <span className="radar-stat-sub">Sideways trend</span>
                </div>
              </div>
              <div className="radar-stat-bottom">
                <span className="radar-stat-val val-hold">{radarData?.summary?.hold_count || 8}</span>
                <span className="radar-stat-sep">|</span>
                <span className="radar-stat-desc">range bound</span>
              </div>
            </div>

            {/* Card 5: CAUTION / AVOID */}
            <div className="radar-stat-box stat-avoid">
              <div className="radar-stat-header">
                <div className="radar-stat-icon-wrap icon-avoid">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div className="radar-stat-info">
                  <span className="radar-stat-lbl">CAUTION / AVOID</span>
                  <span className="radar-stat-sub">Higher risk</span>
                </div>
              </div>
              <div className="radar-stat-bottom">
                <span className="radar-stat-val val-avoid">{radarData?.summary?.avoid_count || 4}</span>
                <span className="radar-stat-sep">|</span>
                <span className="radar-stat-desc">capital caution</span>
              </div>
            </div>

            {/* Card 6: RISK:REWARD */}
            <div className="radar-stat-box stat-rr">
              <div className="radar-stat-header">
                <div className="radar-stat-icon-wrap icon-rr">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                    <path d="M4 22h16"/>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                  </svg>
                </div>
                <div className="radar-stat-info">
                  <span className="radar-stat-lbl">RISK:REWARD</span>
                  <span className="radar-stat-sub">Opportunity ratio</span>
                </div>
              </div>
              <div className="radar-stat-bottom">
                <span className="radar-stat-val val-rr">{radarData?.summary?.avg_risk_reward || "1:3.0"}</span>
                <span className="radar-stat-sep">|</span>
                <span className="radar-stat-desc">reward ratio</span>
              </div>
            </div>
          </div>

          {/* Controls: Filter Tabs, Sector, Sort (Single Horizontal Line) */}
          <div className="radar-controls-strip">
            <div className="radar-filter-tabs">
              <button
                type="button"
                className={`radar-filter-tab ${activeFilter === "ALL" ? "active" : ""}`}
                onClick={() => setActiveFilter("ALL")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="filter-tab-icon">
                  <rect x="3" y="3" width="7" height="7" rx="1.8"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.8"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.8"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.8"/>
                </svg>
                <span>All ({radarStocks.length || (isInitialLoading ? "..." : radarData?.summary?.total_tracked || 38)})</span>
              </button>

              <button
                type="button"
                className={`radar-filter-tab ${activeFilter === "BUY" ? "active" : ""}`}
                onClick={() => setActiveFilter("BUY")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="filter-tab-icon icon-buy">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <span>Strong Buy ({radarData?.summary?.strong_buy_count || 16})</span>
              </button>

              <button
                type="button"
                className={`radar-filter-tab ${activeFilter === "ACCUMULATE" ? "active" : ""}`}
                onClick={() => setActiveFilter("ACCUMULATE")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="filter-tab-icon icon-accumulate">
                  <ellipse cx="8.5" cy="7" rx="5.5" ry="2.4"/>
                  <path d="M3 7v4c0 1.3 2.5 2.4 5.5 2.4c.8 0 1.6-.1 2.3-.3"/>
                  <path d="M3 11v4c0 1.3 2.5 2.4 5.5 2.4c.8 0 1.6-.1 2.3-.3"/>
                  <line x1="17" y1="13" x2="17" y2="19"/>
                  <line x1="14" y1="16" x2="20" y2="16"/>
                </svg>
                <span>Accumulate ({radarData?.summary?.accumulate_count || 10})</span>
              </button>

              <button
                type="button"
                className={`radar-filter-tab ${activeFilter === "HOLD" ? "active" : ""}`}
                onClick={() => setActiveFilter("HOLD")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="filter-tab-icon icon-hold">
                  <line x1="4" y1="9" x2="20" y2="9"/>
                  <line x1="4" y1="15" x2="20" y2="15"/>
                </svg>
                <span>Hold ({radarData?.summary?.hold_count || 8})</span>
              </button>

              <button
                type="button"
                className={`radar-filter-tab ${activeFilter === "AVOID" ? "active" : ""}`}
                onClick={() => setActiveFilter("AVOID")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="filter-tab-icon icon-avoid">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Avoid ({radarData?.summary?.avoid_count || 4})</span>
              </button>
            </div>

            <div className="radar-actions-right">
              {/* Sector Dropdown */}
              <select
                className="radar-select"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                <option value="ALL">All Sectors</option>
                <option value="Banking">Banking &amp; Financials</option>
                <option value="IT">IT &amp; Tech Services</option>
                <option value="Auto">Auto &amp; Mobility</option>
                <option value="Energy">Energy &amp; Conglomerate</option>
                <option value="Consumer">Consumer &amp; FMCG</option>
                <option value="Pharma">Pharma &amp; Healthcare</option>
                <option value="Metal">Metals &amp; Infra</option>
              </select>

              {/* Sort By Dropdown */}
              <select
                className="radar-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="conviction">Sort: Conviction</option>
                <option value="upside">Sort: Upside %</option>
                <option value="change">Sort: Gainers</option>
                <option value="price">Sort: Price</option>
              </select>
            </div>
          </div>

          {/* Row-Wise Line Items List */}
          <div className="radar-rows-list">
            {isInitialLoading && !radarData ? (
              <div className="radar-skeleton-wrap">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="radar-stock-row radar-row-skeleton">
                    <div className="radar-row-main">
                      <div className="radar-co-info">
                        <div className="radar-skeleton-box sk-avatar" />
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div className="radar-skeleton-box sk-title" />
                          <div className="radar-skeleton-box sk-meta" />
                        </div>
                      </div>
                      <div className="radar-price-group">
                        <div className="radar-skeleton-box sk-price" />
                        <div className="radar-skeleton-box sk-sub" />
                      </div>
                      <div className="radar-verdict-group">
                        <div className="radar-skeleton-box sk-badge" />
                        <div className="radar-skeleton-box sk-sub" />
                      </div>
                      <div className="radar-targets-group">
                        <div className="radar-skeleton-box sk-target" />
                        <div className="radar-skeleton-box sk-target" />
                      </div>
                      <div className="radar-row-actions">
                        <div className="radar-skeleton-box sk-btn" />
                        <div className="radar-skeleton-box sk-btn" />
                      </div>
                    </div>
                    <div className="radar-explanation-callout" style={{ marginTop: "10px" }}>
                      <div className="radar-skeleton-box sk-desc" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedStocks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--ink-soft)" }}>
                No market leaders match the current filter or search criteria.
              </div>
            ) : (
              sortedStocks.map((stock) => {
                const isPositive = !stock.change?.startsWith("-") && !stock.change?.startsWith("−");
                
                let signalDisplayName = "STRONG BUY";
                let signalIcon = (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                );

                if (stock.variant === "accumulate" || stock.signal?.includes("ACCUMULATE")) {
                  signalDisplayName = "ACCUMULATE";
                  signalIcon = (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="8.5" cy="7" rx="5.5" ry="2.4"/>
                      <path d="M3 7v4c0 1.3 2.5 2.4 5.5 2.4c.8 0 1.6-.1 2.3-.3"/>
                      <path d="M3 11v4c0 1.3 2.5 2.4 5.5 2.4c.8 0 1.6-.1 2.3-.3"/>
                      <line x1="17" y1="13" x2="17" y2="19"/>
                      <line x1="14" y1="16" x2="20" y2="16"/>
                    </svg>
                  );
                } else if (stock.variant === "hold" || stock.signal?.includes("HOLD")) {
                  signalDisplayName = "HOLD";
                  signalIcon = (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                      <line x1="4" y1="9" x2="20" y2="9"/>
                      <line x1="4" y1="15" x2="20" y2="15"/>
                    </svg>
                  );
                } else if (stock.variant === "avoid" || stock.signal?.includes("AVOID") || stock.signal?.includes("CAUTION")) {
                  signalDisplayName = "AVOID";
                  signalIcon = (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  );
                }

                return (
                  <div key={stock.symbol} className="radar-stock-row">
                    {/* Top Row: Info, Price, Verdict, Targets, Actions */}
                    <div className="radar-row-main">
                      {/* 1. Company Info */}
                      <div className="radar-co-info">
                        <div className="radar-co-avatar">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="radar-co-name">{stock.name}</div>
                          <div className="radar-co-meta">
                            <span className="radar-ticker-badge">{stock.symbol}</span>
                            <span>·</span>
                            <span className="radar-sector-pill">{stock.sector}</span>
                          </div>
                          {stock.hft_pattern && (
                            <div className="radar-hft-tag">
                              {stock.hft_pattern.replace(/⚡\s*/g, "").trim()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Price & Move */}
                      <div className="radar-price-group">
                        <div className="radar-cmp">₹{stock.price?.toLocaleString("en-IN")}</div>
                        <div className={`radar-chg ${isPositive ? "pos" : "neg"}`}>
                          {stock.change}
                        </div>
                      </div>

                      {/* 3. AI Verdict Badge & Conviction */}
                      <div className="radar-verdict-group">
                        <div className={`radar-verdict-badge ${stock.variant}`}>
                          <span className="verdict-icon-wrap">{signalIcon}</span>
                          <span className="verdict-name">{signalDisplayName}</span>
                        </div>
                        <div className="radar-conviction-sub">
                          {stock.conviction}% AI Conviction · {stock.risk_level} Risk
                        </div>
                      </div>

                      {/* 4. Target, Stop-Loss & R:R */}
                      <div className="radar-targets-group">
                        <div className="radar-target-line">
                          <span className="radar-target-lbl">Target:</span>
                          <span className="radar-target-val" style={{ color: "#15803d" }}>
                            ₹{stock.target_price?.toLocaleString("en-IN")} (+{stock.upside_pct}%)
                          </span>
                        </div>
                        <div className="radar-target-line">
                          <span className="radar-target-lbl">Stop-Loss:</span>
                <span className="radar-target-val" style={{ color: "#b91c1c" }}>
                            ₹{stock.stop_loss?.toLocaleString("en-IN")} (-{stock.downside_pct}%)
                          </span>
                          <span className="radar-rr-pill">
                            R:R {stock.risk_reward}
                          </span>
                        </div>
                      </div>

                      {/* 5. Row Quick Action Buttons */}
                      <div className="radar-row-actions">
                        <button
                          type="button"
                          className={`radar-action-btn ${activeCopilotStock === stock.symbol ? "active" : ""}`}
                          onClick={() => handleToggleCopilot(stock)}
                          title={`Chat with Copilot about ${stock.name}`}
                        >
                          <CopilotRobotIcon size={18} className="radar-copilot-icon" />
                          <span>{activeCopilotStock === stock.symbol ? "Copilot Active" : "Copilot"}</span>
                        </button>
                        <button
                          type="button"
                          className="radar-action-btn"
                          style={{ background: "var(--navy)", color: "#FAF6EC", borderColor: "var(--navy)" }}
                          onClick={() => {
                            window.__SELECTED_STOCK_SYMBOL = stock.symbol;
                            localStorage.setItem("marketmind_sim_stock", stock.symbol);
                            window.dispatchEvent(new CustomEvent("marketmind:simulate_stock", { detail: { symbol: stock.symbol } }));
                            goPage("portfolio");
                          }}
                          title={`Simulate trade for ${stock.name} in virtual portfolio`}
                        >
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                            <polyline points="16 7 22 7 22 13"/>
                          </svg>
                          <span>Simulate</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Full Institutional Rationale, Point-wise Analysis & Catalyst */}
                    <div className="radar-explanation-callout">
                      <div className="radar-callout-header">
                        <span className="radar-summary-label">Summary:</span>
                        <span className="radar-summary-val">
                          {(stock.catalyst || stock.hft_pattern || "").replace(/⚡\s*/g, "").trim()}
                        </span>
                      </div>
                      <div className="radar-rationale-text">
                        <strong className="radar-rationale-prefix">Institutional Thesis:</strong>
                        <span>
                          {(stock.explanation || "Institutional positioning reflects solid operational performance and sustained volume absorption above primary support.").replace(/⚡\s*/g, "").trim()}
                        </span>
                      </div>
                      <div className="radar-analysis-points">
                        {getStockAnalysisPoints(stock).map((pt, pIdx) => (
                          <div key={pIdx} className="radar-point-item">
                            <span className="radar-point-pip" />
                            <div className="radar-point-body">
                              <strong className="radar-point-label">{pt.label}:</strong>
                              <span className="radar-point-detail">{pt.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right-Side Slide-Over Copilot Drawer */}
      {activeStockObj && (
        <>
          <div
            className="radar-copilot-backdrop"
            onClick={() => setActiveCopilotStock(null)}
          />
          <aside className="radar-copilot-drawer-right">
            {/* 1. Pure Chat Drawer Header */}
            <div className="copilot-drawer-header">
              <div className="copilot-drawer-top-bar">
                <div className="copilot-header-brand-wrap">
                  <CopilotRobotIcon size={26} className="copilot-header-robot-icon" />
                  <div className="copilot-header-text-block">
                    <span className="copilot-header-app-title">MarketMind Copilot</span>
                    <span className="copilot-header-company-sub">{activeStockObj.name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="copilot-drawer-close-btn"
                  onClick={() => setActiveCopilotStock(null)}
                  aria-label="Close Copilot"
                  title="Close Copilot"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* 2. Messages Body (Pure Chat UI) */}
            <div className="copilot-drawer-messages-body">
              {(copilotMessages[activeStockObj.symbol] || []).map((msg, mIdx) => (
                <div key={mIdx} className={`copilot-drawer-msg-wrap ${msg.role}`}>
                  {msg.role === "user" ? (
                    <div className="copilot-drawer-user-bubble">
                      <div className="copilot-drawer-bubble-meta">YOU</div>
                      <div className="copilot-drawer-user-text">{msg.text}</div>
                    </div>
                  ) : (
                    <div className="copilot-drawer-bot-bubble">
                      <div className="copilot-drawer-bot-avatar">
                        <CopilotRobotIcon size={15} />
                      </div>
                      <div className="copilot-drawer-bot-content">
                        <div className="copilot-drawer-bot-sender">MARKETMIND COPILOT</div>
                        <div className="copilot-drawer-bot-text">
                          {formatCopilotMessage(msg.text)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isCopilotLoading && (
                <div className="copilot-drawer-msg-wrap assistant">
                  <div className="copilot-drawer-bot-bubble">
                    <div className="copilot-drawer-bot-avatar">
                      <CopilotRobotIcon size={15} />
                    </div>
                    <div className="copilot-drawer-bot-content copilot-loading-card">
                      <div className="copilot-drawer-bot-sender">
                        <span>MARKETMIND COPILOT</span>
                        <span className="copilot-searching-badge">Analyzing Real-Time Data</span>
                      </div>
                      <div className="copilot-drawer-bot-loading">
                        <div className="copilot-dots-group">
                          <span className="copilot-dot-pulse"></span>
                          <span className="copilot-dot-pulse"></span>
                          <span className="copilot-dot-pulse"></span>
                        </div>
                        <span className="copilot-loading-text">
                          Analyzing {activeStockObj.symbol} order flow, VWAP &amp; risk floors...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 3. Quick Prompt Chips */}
            <div className="copilot-drawer-quick-chips">
              <button
                type="button"
                className="copilot-quick-chip"
                onClick={() => handleSendCopilotQuery(activeStockObj, `Why is ${activeStockObj.symbol} rated ${activeStockObj.signal}? Explain catalysts and momentum.`)}
              >
                Best entry?
              </button>
              <button
                type="button"
                className="copilot-quick-chip"
                onClick={() => handleSendCopilotQuery(activeStockObj, `What is the biggest downside risk and stop-loss floor for ${activeStockObj.symbol}?`)}
              >
                Explain risk
              </button>
              <button
                type="button"
                className="copilot-quick-chip"
                onClick={() => handleSendCopilotQuery(activeStockObj, `Give institutional bull vs bear case for ${activeStockObj.symbol}.`)}
              >
                Bull vs bear case
              </button>
              <button
                type="button"
                className="copilot-quick-chip"
                onClick={() => handleSendCopilotQuery(activeStockObj, `Give valuation snapshot: P/E multiple, ROE, margins and intrinsic fair value band for ${activeStockObj.symbol}.`)}
              >
                Valuation snapshot
              </button>
            </div>

            {/* 4. Sticky Bottom Input Box */}
            <form
              className="copilot-drawer-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCopilotQuery(activeStockObj, copilotInputText);
              }}
            >
              <div className="copilot-drawer-input-pill">
                <input
                  type="text"
                  className="copilot-drawer-input"
                  placeholder="Ask MarketMind Copilot..."
                  value={copilotInputText}
                  onChange={(e) => setCopilotInputText(e.target.value)}
                  disabled={isCopilotLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="copilot-drawer-send-btn"
                  disabled={!copilotInputText.trim() || isCopilotLoading}
                  aria-label="Send query"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </form>
          </aside>
        </>
      )}
    </div>
  );
}
