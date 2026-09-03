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
    if (activeFilter === "BUY" && s.signal !== "STRONG BUY") return false;
    if (activeFilter === "ACCUMULATE" && s.signal !== "ACCUMULATE ON DIP") return false;
    if (activeFilter === "HOLD" && s.signal !== "HOLD / NEUTRAL") return false;
    if (activeFilter === "AVOID" && s.signal !== "CAUTION / AVOID") return false;

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

          {/* Overview Summary Statistics Bar */}
          <div className="radar-stats-grid">
            <div className="radar-stat-box stat-total">
              <div className="radar-stat-top">
                <span className="radar-stat-icon icon-total">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </span>
                <span className="radar-stat-lbl">Tracked Leaders</span>
              </div>
              <div className="radar-stat-val">{radarData?.summary?.total_tracked || 38}</div>
            </div>

            <div className="radar-stat-box stat-buy">
              <div className="radar-stat-top">
                <span className="radar-stat-icon icon-buy">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                </span>
                <span className="radar-stat-lbl">Strong Buy (Top Tier)</span>
              </div>
              <div className="radar-stat-val val-buy">{radarData?.summary?.strong_buy_count || 16}</div>
            </div>

            <div className="radar-stat-box stat-accumulate">
              <div className="radar-stat-top">
                <span className="radar-stat-icon icon-accumulate">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 22 12 12 22 2 12"/>
                  </svg>
                </span>
                <span className="radar-stat-lbl">Accumulate on Dip</span>
              </div>
              <div className="radar-stat-val val-accumulate">{radarData?.summary?.accumulate_count || 10}</div>
            </div>

            <div className="radar-stat-box stat-hold">
              <div className="radar-stat-top">
                <span className="radar-stat-icon icon-hold">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="5" width="14" height="14" rx="2"/>
                  </svg>
                </span>
                <span className="radar-stat-lbl">Hold / Range-Bound</span>
              </div>
              <div className="radar-stat-val val-hold">{radarData?.summary?.hold_count || 8}</div>
            </div>

            <div className="radar-stat-box stat-avoid">
              <div className="radar-stat-top">
                <span className="radar-stat-icon icon-avoid">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
                <span className="radar-stat-lbl">Caution / Avoid</span>
              </div>
              <div className="radar-stat-val val-avoid">{radarData?.summary?.avoid_count || 4}</div>
            </div>

            <div className="radar-stat-box stat-rr">
              <div className="radar-stat-top">
                <span className="radar-stat-icon icon-rr">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 3v18M3 12h18"/>
                  </svg>
                </span>
                <span className="radar-stat-lbl">Avg Risk-to-Reward</span>
              </div>
              <div className="radar-stat-val val-rr">{radarData?.summary?.avg_risk_reward || "1:3.0"}</div>
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
                All Leaders ({radarStocks.length || (isInitialLoading ? "..." : radarData?.summary?.total_tracked || 38)})
              </button>
              <button
                type="button"
                className={`radar-filter-tab ${activeFilter === "BUY" ? "active" : ""}`}
                onClick={() => setActiveFilter("BUY")}
              >
                ▲ Strong Buy ({radarData?.summary?.strong_buy_count || 16})
              </button>
              <button
                type="button"
                className={`radar-filter-tab ${activeFilter === "ACCUMULATE" ? "active" : ""}`}
                onClick={() => setActiveFilter("ACCUMULATE")}
              >
                ◆ Accumulate on Dip ({radarData?.summary?.accumulate_count || 10})
              </button>
              <button
                type="button"
                className={`radar-filter-tab ${activeFilter === "HOLD" ? "active" : ""}`}
                onClick={() => setActiveFilter("HOLD")}
              >
                ■ Hold / Neutral ({radarData?.summary?.hold_count || 8})
              </button>
              <button
                type="button"
                className={`radar-filter-tab ${activeFilter === "AVOID" ? "active" : ""}`}
                onClick={() => setActiveFilter("AVOID")}
              >
                ▼ Caution / Avoid ({radarData?.summary?.avoid_count || 4})
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
                <option value="conviction">Sort: Highest Conviction</option>
                <option value="upside">Sort: Highest Upside %</option>
                <option value="change">Sort: Today's Gainers</option>
                <option value="price">Sort: Price (High to Low)</option>
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
                const iconSymbol = stock.variant === "buy" ? "▲" : stock.variant === "accumulate" ? "◆" : stock.variant === "hold" ? "■" : "▼";

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
                              {stock.hft_pattern}
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
                          <span>{iconSymbol}</span>
                          <span>{stock.signal}</span>
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

                    {/* Bottom Row: Full Institutional Rationale & Catalyst */}
                    <div className="radar-explanation-callout">
                      <div className="radar-catalyst-tag">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                        <strong>Analysis Summary:</strong> {stock.catalyst || stock.hft_pattern}
                      </div>
                      <div className="radar-rationale-text">
                        <strong>AI Rationale:</strong> {stock.explanation || `Institutional positioning reflects solid operational performance and sustained volume absorption above primary support.`}
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
