import React from "react";

export default function Topbar({ eyebrow, title, onOpenSidebar, backendOnline, backendLatency }) {
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
      </div>


      <div className="search-box">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/>
          <path d="M21 21l-4.3-4.3"/>
        </svg>
        <input type="text" placeholder="Search tickers, reports, sectors…" />
      </div>

      <button className="icon-btn" aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
        </svg>
        <span className="dot"></span>
      </button>

      <button className="icon-btn" aria-label="Settings">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
        </svg>
      </button>
    </div>
  );
}
