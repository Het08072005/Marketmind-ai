import React from "react";
import logoImg from "../assets/marketmind-logo.png";

export default function Sidebar({ currentPage, goPage, isOpen, onClose }) {
  const navOverview = [
    { key: "dashboard", label: "Dashboard", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
    )},
    { key: "portfolio", label: "Portfolio Simulator", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 15l3.5-4 3 3L20 7"/></svg>
    )},
    { key: "voice", label: "Voice Stock Assistant", badge: "Live", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1"/><path d="M12 18v4M9 22h6"/></svg>
    )},
    { key: "learning", label: "Learning Mode", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h5"/></svg>
    )},
    { key: "sector", label: "Sector Comparison", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    )},
    { key: "alerts", label: "Smart Alerts", badge: "3", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
    )},
    { key: "reports", label: "AI Report Generator", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg>
    )},
    { key: "candles", label: "Candlestick Patterns", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-9 3 5 3-8 3 7 5-4"/></svg>
    )},
    { key: "esg", label: "ESG & Sustainability", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l7 7"/></svg>
    )},
  ];

  const navAdvanced = [
    { key: "news", label: "Latest News", badge: "Live", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h13a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2z"/><path d="M19 9h2v10a2 2 0 0 1-2 2"/><path d="M8 8h6M8 12h6M8 16h3"/></svg>
    )},
    { key: "domino", label: "Domino Predictor", badge: "Flagship", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="18" r="2.4"/><circle cx="12" cy="12" r="2.4"/><path d="M8 7l2.5 3M16 7l-2.5 3M8 17l2.5-3M16 17l-2.5-3"/></svg>
    )},
    { key: "trust", label: "Management Trust Meter", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
    )},
    { key: "thesis", label: "Investment Thesis Breaker", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9"/></svg>
    )},
    { key: "dna", label: "Stock DNA Fingerprint", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3c0 6 12 6 12 12M18 21c0-6-12-6-12-12"/><path d="M8 5h8M8 19h8M7 9h10M7 15h10"/></svg>
    )},
    { key: "timemachine", label: "Decision Time Machine", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    )},
  ];

  const navDetective = [
    { key: "forensic", label: "Forensic Health & Autopsy", badge: "Engine", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12h6M12 9v6"/></svg>
    )},
    { key: "ghost", label: "Ghost Portfolio", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 0-7 7v11l2.5-2 2 2 2.5-2 2.5 2 2-2 2.5 2V9a7 7 0 0 0-7-7z"/><circle cx="9.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="10" r="1" fill="currentColor" stroke="none"/></svg>
    )},
    { key: "dependency", label: "Hidden Dependency Map", icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><circle cx="12" cy="13" r="2.2"/><path d="M12 7.2V11M9.8 14.5 6.6 17.3M14.2 14.5l3.2 2.8"/></svg>
    )},
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
        <div
          className="brand"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 12px 20px",
            borderBottom: "1px solid rgba(216,188,139,.18)",
            marginBottom: "20px",
            background: "none",
          }}
        >
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              goPage("dashboard");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              width: "100%",
              background: "none",
            }}
          >
            <img
              src={logoImg}
              alt="MarketMind AI"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "44px",
                objectFit: "contain",
                objectPosition: "left center",
                display: "block",
                background: "none",
                filter: "drop-shadow(0 2px 10px rgba(0,0,0,.4))",
              }}
            />
          </a>
          <button className="sidebar-close" onClick={onClose} aria-label="Close navigation" style={{ marginLeft: "8px" }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="nav-scroll">
          <div className="nav-label">Overview</div>
          <nav className="primary">
            {navOverview.map((item) => (
              <a
                key={item.key}
                className={`nav-item ${currentPage === item.key ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  goPage(item.key);
                }}
                href={`#${item.key}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </a>
            ))}
          </nav>

          <div className="nav-label">Advanced Intelligence</div>
          <nav className="primary">
            {navAdvanced.map((item) => (
              <a
                key={item.key}
                className={`nav-item ${currentPage === item.key ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  goPage(item.key);
                }}
                href={`#${item.key}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </a>
            ))}
          </nav>

          <div className="nav-label">Financial Detective</div>
          <nav className="primary">
            {navDetective.map((item) => (
              <a
                key={item.key}
                className={`nav-item ${currentPage === item.key ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  goPage(item.key);
                }}
                href={`#${item.key}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </a>
            ))}
          </nav>
        </div>

        <div className="sidebar-foot">
          <div className="user-block">
            <div className="user-av">RU</div>
            <div>
              <div className="user-name">Random User</div>
              <div className="user-role">Analyst Workspace</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
