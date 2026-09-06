import React from "react";

export default function Topbar({ eyebrow, title, subtitle, onOpenSidebar, backendOnline, backendLatency, searchQuery, onSearchChange }) {
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
              fontSize: "13.5px",
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

      <div className="search-box">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/>
          <path d="M21 21l-4.3-4.3"/>
        </svg>
        <input
          type="text"
          placeholder="Search tickers, reports, sectors, news…"
          value={searchQuery || ""}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange && onSearchChange("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-soft)",
              fontSize: "12px",
              padding: "0 6px",
              lineHeight: 1
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <button className="icon-btn" aria-label="Notifications" style={{ position: "relative" }}>
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, stroke: "currentColor" }}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
        </svg>
        <span
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "#EF4444",
            color: "#FFFFFF",
            fontSize: "10px",
            fontWeight: 700,
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            boxShadow: "0 1px 3px rgba(239, 68, 68, 0.4)"
          }}
        >
          1
        </span>
      </button>

      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "600",
          fontSize: "14px",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
        }}
        title="Test User"
      >
        T
      </div>
    </div>
  );
}
