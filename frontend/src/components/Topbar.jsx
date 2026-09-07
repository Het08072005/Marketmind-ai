import React, { useState, useEffect } from "react";
import { getIndianMarketStatus } from "../utils/marketHours";

export default function Topbar({ eyebrow, title, subtitle, onOpenSidebar, backendOnline, backendLatency, searchQuery, onSearchChange }) {
  const [marketInfo, setMarketInfo] = useState(() => getIndianMarketStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setMarketInfo(getIndianMarketStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="topbar">
      <button className="hamburger" onClick={onOpenSidebar} aria-label="Open navigation">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18"/>
        </svg>
      </button>

      <div className="page-heading">
        {eyebrow ? <div className="eyebrow" id="pgEyebrow">{eyebrow}</div> : null}
        <h1 id="pgTitle">{title}</h1>
        {subtitle ? (
          <p
            className="page-subtitle"
            style={{
              margin: "2px 0 0 0",
              fontSize: "13px",
              color: "#64748B",
              fontFamily: "var(--sans)",
              fontWeight: 400,
              lineHeight: 1.4
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {/* Right Cluster: Exchange Telemetry, Global Search, Notifications & User */}
      <div className="topbar-actions-cluster">
        {/* Institutional Indian Exchange Live Clock & Market Hours Status */}
        <div
          className="topbar-market-capsule"
          title={`National Stock Exchange of India (NSE) / BSE\nRegular Session: 09:15 – 15:30 IST (Mon–Fri)\nStatus: ${marketInfo.sessionDesc}`}
        >
          <div
            className={`topbar-status-tag ${marketInfo.isOpen ? "tag-open" : marketInfo.isPostMarket || marketInfo.isPreMarket ? "tag-post" : "tag-closed"}`}
          >
            <span className={`topbar-dot ${marketInfo.isOpen ? "dot-pulsing" : ""}`} />
            <span className="topbar-status-text">{marketInfo.shortLabel}</span>
          </div>

          <div className="topbar-capsule-divider" />

          <div className="topbar-datetime-block">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="topbar-clock-icon">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="topbar-date-part">{marketInfo.weekday}, {marketInfo.dateStr}</span>
            <span className="topbar-time-sep">·</span>
            <span className="topbar-time-part">{marketInfo.timeStr}</span>
            <span className="topbar-tz-pill">IST</span>
          </div>
        </div>

        {/* Global Search Box */}
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/>
            <path d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search tickers, sectors, news…"
            value={searchQuery || ""}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange("")}
              className="search-clear-btn"
              title="Clear search"
            >
              ✕
            </button>
          ) : (
            <span className="search-kbd-hint">⌘K</span>
          )}
        </div>

        {/* Notification Bell */}
        <button className="icon-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17, stroke: "currentColor" }}>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
          </svg>
          <span className="notification-badge-dot">1</span>
        </button>

        {/* User Monogram Profile */}
        <div className="topbar-user-avatar" title="Institutional Trader">
          <span>T</span>
        </div>
      </div>
    </div>
  );
}
