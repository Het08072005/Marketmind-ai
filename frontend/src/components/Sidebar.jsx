import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Mic,
  BookOpen,
  PieChart,
  Bell,
  FileText,
  CandlestickChart,
  Newspaper,
  Share2,
  Lightbulb,
  Dna,
  Link2,
  Settings,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import logoImg from "../assets/marketmind-final-logo.png";

export default function Sidebar({ currentPage, goPage, isOpen, onClose }) {
  const navOverview = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "overview", label: "Market Overview", icon: <BarChart2 size={18} /> },
    { key: "portfolio", label: "Portfolio Simulator", icon: <TrendingUp size={18} /> },
    { key: "voice", label: "Voice Assistant", badge: "Live", badgeType: "live", icon: <Mic size={18} /> },
    { key: "learning", label: "Learning Mode", icon: <BookOpen size={18} /> },
    { key: "sector", label: "Sector Intelligence", icon: <PieChart size={18} /> },
    { key: "alerts", label: "Smart Alerts", badge: "3", badgeType: "count", icon: <Bell size={18} /> },
    { key: "reports", label: "AI Reports", icon: <FileText size={18} /> },
    { key: "candles", label: "Candlestick Intel", icon: <CandlestickChart size={18} /> },
  ];

  const navAdvanced = [
    { key: "news", label: "Latest News", badge: "Live", badgeType: "live", icon: <Newspaper size={18} /> },
    { key: "domino", label: "Domino Predictor", badge: "Flagship", badgeType: "flagship", icon: <Share2 size={18} /> },
    { key: "thesis", label: "Thesis Breaker", icon: <Lightbulb size={18} /> },
    { key: "dna", label: "Stock DNA", icon: <Dna size={18} /> },
  ];

  const navDetective = [
    { key: "dependency", label: "Hidden Dependency", icon: <Link2 size={18} /> },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
        <div className="brand">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              goPage("home");
            }}
            className="sidebar-brand-link"
            title="MarketMind AI - View Homepage & Platform Overview"
          >
            <img
              src={logoImg}
              alt="MarketMind AI"
              className="sidebar-brand-img"
            />
          </a>
          <button className="sidebar-close" onClick={onClose} aria-label="Close navigation" style={{ marginLeft: "8px" }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
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
                {item.badge && (
                  <span className={`nav-badge badge-${item.badgeType || "default"}`}>
                    {item.badge}
                  </span>
                )}
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
                {item.badge && (
                  <span className={`nav-badge badge-${item.badgeType || "default"}`}>
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          <div className="nav-label">Financial Detective</div>
          <nav className="primary">
            {navDetective.map((item) => (
              <a
                key={item.key}
                className={`nav-item nav-item-detective ${currentPage === item.key ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  goPage(item.key);
                }}
                href={`#${item.key}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge badge-${item.badgeType || "default"}`}>
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>

        <div className="sidebar-foot">
          <a
            href="#settings"
            className={`sidebar-settings-btn ${currentPage === "settings" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              goPage("settings");
            }}
            title="Settings & Configurations"
          >
            <Settings size={18} className="settings-icon" />
            <span className="settings-title">Settings</span>
            <ChevronRight size={16} className="settings-chevron" />
          </a>
        </div>
      </aside>
    </>
  );
}
