import React, { useState, useEffect } from "react";
import {
  Settings,
  Palette,
  Mic,
  Bell,
  Database,
  BarChart2,
  Shield,
  Keyboard,
  Info,
  RotateCcw,
  BookmarkCheck,
  Check,
  ChevronDown,
  Sparkles,
  Sliders,
  CheckCircle2,
  SlidersHorizontal
} from "lucide-react";

export default function SettingsPage({ goPage }) {
  const [activeTab, setActiveTab] = useState("general");
  const [toastMessage, setToastMessage] = useState("");

  // Form state for General Settings
  const defaultGeneralState = {
    accountName: "Test User",
    email: "testuser@marketmind.ai",
    defaultMarket: "Indian Market",
    defaultDashboard: "Dashboard",
    dateFormat: "DD/MM/YYYY",
    language: "English",
    autoRefresh: true,
    refreshInterval: "Every 30 seconds",
  };

  const [generalState, setGeneralState] = useState(() => {
    try {
      const saved = localStorage.getItem("marketmind_general_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.accountName && parsed.accountName.toLowerCase().includes("het")) {
          parsed.accountName = "Test User";
        }
        if (parsed.email && parsed.email.toLowerCase().includes("het")) {
          parsed.email = "testuser@marketmind.ai";
        }
        return { ...defaultGeneralState, ...parsed };
      }
      return defaultGeneralState;
    } catch {
      return defaultGeneralState;
    }
  });

  // State for other tabs
  const [appearanceTheme, setAppearanceTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("blue");
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [voiceAccent, setVoiceAccent] = useState("Indian English (en-IN)");
  const [catalystAlerts, setCatalystAlerts] = useState(true);
  const [redFlagAlerts, setRedFlagAlerts] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [portfolioCapital, setPortfolioCapital] = useState("₹1,00,00,000");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveGeneral = () => {
    try {
      localStorage.setItem("marketmind_general_settings", JSON.stringify(generalState));
      showToast("✓ Settings saved successfully!");
    } catch (e) {
      showToast("✓ Settings updated!");
    }
  };

  const handleResetGeneral = () => {
    setGeneralState(defaultGeneralState);
    try {
      localStorage.setItem("marketmind_general_settings", JSON.stringify(defaultGeneralState));
    } catch (e) {}
    showToast("Settings reset to default.");
  };

  const tabs = [
    { id: "general", label: "General", icon: <Settings size={16} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
    { id: "voice", label: "Voice Assistant", icon: <Mic size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { id: "data", label: "Data & API", icon: <Database size={16} /> },
    { id: "watchlist", label: "Watchlist & Portfolio", icon: <BarChart2 size={16} /> },
    { id: "privacy", label: "Privacy & Security", icon: <Shield size={16} /> },
    { id: "shortcuts", label: "Shortcuts", icon: <Keyboard size={16} /> },
    { id: "about", label: "About", icon: <Info size={16} /> },
  ];

  return (
    <div
      className="settings-page-wrapper"
      style={{
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "32px",
            background: "#0F172A",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: "10px",
            fontSize: "13.5px",
            fontWeight: "500",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          <CheckCircle2 size={18} style={{ color: "#38BDF8" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Full-Width Two-Column Settings Layout with Exact Equal Height & Viewport Fit */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "235px 1fr",
          gap: "18px",
          alignItems: "stretch",
          height: "100%",
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Left Side: Navigation Tabs Card (No 3rd image widget, exact height) */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(16, 27, 51, 0.08)",
            borderRadius: "16px",
            padding: "12px 10px",
            boxShadow: "0 4px 20px -4px rgba(16, 27, 51, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="settings-scroll-container"
        >
          {/* Header */}
          <div
            style={{
              padding: "4px 8px 10px",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: "#94A3B8",
              fontFamily: "var(--sans)",
              borderBottom: "1px solid #F1F5F9",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span>Preferences Menu</span>
            <SlidersHorizontal size={13} style={{ color: "#94A3B8" }} />
          </div>

          {/* Navigation Items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }} aria-label="Settings Categories">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: isActive ? "600" : "500",
                    color: isActive ? "#2563EB" : "#334155",
                    background: isActive ? "#EFF6FF" : "transparent",
                    border: isActive ? "1px solid rgba(37, 99, 235, 0.18)" : "1px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "all 0.16s ease",
                    fontFamily: "var(--sans)",
                    boxShadow: isActive ? "0 1px 4px rgba(37, 99, 235, 0.08)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#F8FAFC";
                      e.currentTarget.style.color = "#0F172A";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#334155";
                    }
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isActive ? "#2563EB" : "#64748B",
                      transition: "color 0.15s ease",
                    }}
                  >
                    {tab.icon}
                  </span>
                  <span style={{ flex: 1 }}>{tab.label}</span>
                  {isActive && (
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#2563EB",
                        boxShadow: "0 0 6px rgba(37, 99, 235, 0.6)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Content Card with Fixed Header, Inner Scroll, and Fixed Action Bar */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(16, 27, 51, 0.08)",
            borderRadius: "16px",
            padding: "16px 28px 14px",
            boxShadow: "0 4px 20px -4px rgba(16, 27, 51, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
            height: "100%",
            boxSizing: "border-box",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              {/* Fixed Header at Top of Card */}
              <div style={{ paddingBottom: "10px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px", flexShrink: 0 }}>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#101B33",
                    margin: "0 0 3px 0",
                    fontFamily: "'EB Garamond', Georgia, serif",
                    letterSpacing: "-0.2px",
                  }}
                >
                  General Settings
                </h2>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "#64748B",
                    margin: 0,
                    lineHeight: 1.4,
                    fontFamily: 'var(--sans)',
                    fontStyle: "normal",
                  }}
                >
                  Manage your basic preferences and account settings.
                </p>
              </div>

              {/* Inner Scrollable Container (scrollbar hidden) */}
              <div
                className="settings-scroll-container"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: "6px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {/* 1. Account Name */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                      paddingBottom: "8px",
                      marginBottom: "8px",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "16.5px",
                          fontWeight: "600",
                          color: "#101B33",
                          marginBottom: "2px",
                          fontFamily: "'EB Garamond', Georgia, serif",
                          letterSpacing: "0.1px",
                        }}
                      >
                        Account Name
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.3 }}>
                        This name will be used across MarketMind AI
                      </div>
                    </div>
                    <div style={{ width: "350px", flexShrink: 0 }}>
                      <input
                        type="text"
                        value={generalState.accountName}
                        onChange={(e) => setGeneralState({ ...generalState, accountName: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "7px 12px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "13.5px",
                          color: "#101B33",
                          background: "#FFFFFF",
                          outline: "none",
                          boxSizing: "border-box",
                          fontFamily: "var(--sans)",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                          transition: "all 0.18s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#2563EB";
                          e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.12)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#CBD5E1";
                          e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.02)";
                        }}
                      />
                    </div>
                  </div>

                  {/* 2. Email Address */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                      paddingBottom: "8px",
                      marginBottom: "8px",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "16.5px",
                          fontWeight: "600",
                          color: "#101B33",
                          marginBottom: "2px",
                          fontFamily: "'EB Garamond', Georgia, serif",
                          letterSpacing: "0.1px",
                        }}
                      >
                        Email Address
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.3 }}>
                        Used for notifications and account alerts
                      </div>
                    </div>
                    <div style={{ width: "350px", flexShrink: 0 }}>
                      <input
                        type="email"
                        value={generalState.email}
                        onChange={(e) => setGeneralState({ ...generalState, email: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "7px 12px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "13.5px",
                          color: "#101B33",
                          background: "#FFFFFF",
                          outline: "none",
                          boxSizing: "border-box",
                          fontFamily: "var(--sans)",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                          transition: "all 0.18s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#2563EB";
                          e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.12)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#CBD5E1";
                          e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.02)";
                        }}
                      />
                    </div>
                  </div>

                  {/* 3. Default Market */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                      paddingBottom: "8px",
                      marginBottom: "8px",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "16.5px",
                          fontWeight: "600",
                          color: "#101B33",
                          marginBottom: "2px",
                          fontFamily: "'EB Garamond', Georgia, serif",
                          letterSpacing: "0.1px",
                        }}
                      >
                        Default Market
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.3 }}>
                        Select your default market view
                      </div>
                    </div>
                    <div style={{ width: "350px", flexShrink: 0, position: "relative" }}>
                      <select
                        value={generalState.defaultMarket}
                        onChange={(e) => setGeneralState({ ...generalState, defaultMarket: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "7px 34px 7px 12px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "13.5px",
                          color: "#101B33",
                          background: "#FFFFFF",
                          outline: "none",
                          appearance: "none",
                          boxSizing: "border-box",
                          fontFamily: "var(--sans)",
                          cursor: "pointer",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                        }}
                      >
                        <option value="Indian Market">🇮🇳 Indian Market</option>
                        <option value="US Market (NYSE / NASDAQ)">🇺🇸 US Market (NYSE / NASDAQ)</option>
                        <option value="Global Multi-Asset">🌍 Global Multi-Asset</option>
                        <option value="Crypto & Digital Assets">🪙 Crypto & Digital Assets</option>
                      </select>
                      <ChevronDown
                        size={15}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          color: "#64748B",
                        }}
                      />
                    </div>
                  </div>

                  {/* 4. Default Dashboard */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                      paddingBottom: "8px",
                      marginBottom: "8px",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "16.5px",
                          fontWeight: "600",
                          color: "#101B33",
                          marginBottom: "2px",
                          fontFamily: "'EB Garamond', Georgia, serif",
                          letterSpacing: "0.1px",
                        }}
                      >
                        Default Dashboard
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.3 }}>
                        Choose which page to open on login
                      </div>
                    </div>
                    <div style={{ width: "350px", flexShrink: 0, position: "relative" }}>
                      <select
                        value={generalState.defaultDashboard}
                        onChange={(e) => setGeneralState({ ...generalState, defaultDashboard: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "7px 34px 7px 12px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "13.5px",
                          color: "#101B33",
                          background: "#FFFFFF",
                          outline: "none",
                          appearance: "none",
                          boxSizing: "border-box",
                          fontFamily: "var(--sans)",
                          cursor: "pointer",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                        }}
                      >
                        <option value="Dashboard">Dashboard</option>
                        <option value="Portfolio Simulator">Portfolio Simulator</option>
                        <option value="Domino Predictor">Domino Predictor</option>
                        <option value="Sector Intelligence">Sector Intelligence</option>
                        <option value="AI Reports">AI Reports</option>
                      </select>
                      <ChevronDown
                        size={15}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          color: "#64748B",
                        }}
                      />
                    </div>
                  </div>

                  {/* 5. Date Format */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                      paddingBottom: "8px",
                      marginBottom: "8px",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "16.5px",
                          fontWeight: "600",
                          color: "#101B33",
                          marginBottom: "2px",
                          fontFamily: "'EB Garamond', Georgia, serif",
                          letterSpacing: "0.1px",
                        }}
                      >
                        Date Format
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.3 }}>
                        Choose your preferred date format
                      </div>
                    </div>
                    <div style={{ width: "350px", flexShrink: 0, position: "relative" }}>
                      <select
                        value={generalState.dateFormat}
                        onChange={(e) => setGeneralState({ ...generalState, dateFormat: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "7px 34px 7px 12px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "13.5px",
                          color: "#101B33",
                          background: "#FFFFFF",
                          outline: "none",
                          appearance: "none",
                          boxSizing: "border-box",
                          fontFamily: "var(--sans)",
                          cursor: "pointer",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                        }}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                      <ChevronDown
                        size={15}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          color: "#64748B",
                        }}
                      />
                    </div>
                  </div>

                  {/* 6. Language */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                      paddingBottom: "8px",
                      marginBottom: "8px",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "16.5px",
                          fontWeight: "600",
                          color: "#101B33",
                          marginBottom: "2px",
                          fontFamily: "'EB Garamond', Georgia, serif",
                          letterSpacing: "0.1px",
                        }}
                      >
                        Language
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.3 }}>
                        Select your preferred language
                      </div>
                    </div>
                    <div style={{ width: "350px", flexShrink: 0, position: "relative" }}>
                      <select
                        value={generalState.language}
                        onChange={(e) => setGeneralState({ ...generalState, language: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "7px 34px 7px 12px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "13.5px",
                          color: "#101B33",
                          background: "#FFFFFF",
                          outline: "none",
                          appearance: "none",
                          boxSizing: "border-box",
                          fontFamily: "var(--sans)",
                          cursor: "pointer",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                        }}
                      >
                        <option value="English">English</option>
                        <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                        <option value="Gujarati (ગુજરાતી)">Gujarati (ગુજરાતી)</option>
                        <option value="Marathi (मराठी)">Marathi (मराठी)</option>
                      </select>
                      <ChevronDown
                        size={15}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          color: "#64748B",
                        }}
                      />
                    </div>
                  </div>

                  {/* 7. Auto Refresh Data */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                      paddingBottom: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "16.5px",
                          fontWeight: "600",
                          color: "#101B33",
                          marginBottom: "2px",
                          fontFamily: "'EB Garamond', Georgia, serif",
                          letterSpacing: "0.1px",
                        }}
                      >
                        Auto Refresh Data
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.3 }}>
                        Automatically refresh market data
                      </div>
                    </div>
                    <div
                      style={{
                        width: "350px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      {/* Toggle Switch */}
                      <div
                        onClick={() => setGeneralState({ ...generalState, autoRefresh: !generalState.autoRefresh })}
                        style={{
                          width: "44px",
                          height: "24px",
                          borderRadius: "12px",
                          background: generalState.autoRefresh ? "#2563EB" : "#CBD5E1",
                          position: "relative",
                          cursor: "pointer",
                          transition: "background 0.2s ease",
                          flexShrink: 0,
                        }}
                        role="switch"
                        aria-checked={generalState.autoRefresh}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: "#FFFFFF",
                            position: "absolute",
                            top: "3px",
                            left: generalState.autoRefresh ? "23px" : "3px",
                            transition: "left 0.2s ease",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.25)",
                          }}
                        />
                      </div>

                      {/* Refresh Interval Dropdown */}
                      <div style={{ flex: 1, position: "relative" }}>
                        <select
                          value={generalState.refreshInterval}
                          onChange={(e) => setGeneralState({ ...generalState, refreshInterval: e.target.value })}
                          disabled={!generalState.autoRefresh}
                          style={{
                            width: "100%",
                            padding: "7px 34px 7px 12px",
                            borderRadius: "8px",
                            border: "1px solid #CBD5E1",
                            fontSize: "13px",
                            color: generalState.autoRefresh ? "#101B33" : "#94A3B8",
                            background: generalState.autoRefresh ? "#FFFFFF" : "#F8FAFC",
                            outline: "none",
                            appearance: "none",
                            boxSizing: "border-box",
                            fontFamily: "var(--sans)",
                            cursor: generalState.autoRefresh ? "pointer" : "not-allowed",
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                          }}
                        >
                          <option value="Every 10 seconds">Every 10 seconds</option>
                          <option value="Every 30 seconds">Every 30 seconds</option>
                          <option value="Every 1 minute">Every 1 minute</option>
                          <option value="Every 5 minutes">Every 5 minutes</option>
                        </select>
                        <ChevronDown
                          size={14}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#64748B",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Action Bar at Bottom of Card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "12px",
                  paddingTop: "12px",
                  marginTop: "8px",
                  borderTop: "1px solid #E2E8F0",
                  flexShrink: 0,
                  background: "#FFFFFF",
                }}
              >
                <button
                  type="button"
                  onClick={handleResetGeneral}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#334155",
                    fontSize: "13.5px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontFamily: "var(--sans)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
                >
                  <RotateCcw size={14} />
                  Reset to Default
                </button>

                <button
                  type="button"
                  onClick={handleSaveGeneral}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 20px",
                    borderRadius: "8px",
                    background: "#2563EB",
                    border: "1px solid #2563EB",
                    color: "#FFFFFF",
                    fontSize: "13.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.28)",
                    transition: "all 0.15s ease",
                    fontFamily: "var(--sans)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}
                >
                  <BookmarkCheck size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === "appearance" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div style={{ paddingBottom: "10px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px", flexShrink: 0 }}>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#101B33",
                    margin: "0 0 3px 0",
                    fontFamily: "'EB Garamond', Georgia, serif",
                  }}
                >
                  Appearance Settings
                </h2>
                <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0, fontFamily: "var(--sans)", fontStyle: "normal" }}>
                  Customize visual styling, terminal theme, and color accents.
                </p>
              </div>

              <div className="settings-scroll-container" style={{ flex: 1, overflowY: "auto", paddingRight: "6px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "7px", borderBottom: "1px solid #F1F5F9" }}>
                    <div>
                      <div style={{ fontSize: "16.5px", fontWeight: "600", color: "#101B33", fontFamily: "'EB Garamond', Georgia, serif" }}>
                        Terminal Theme
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>Select your default background theme</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {[
                        { id: "light", label: "Clean Light" },
                        { id: "dark", label: "Dark Navy" },
                        { id: "system", label: "System Default" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setAppearanceTheme(t.id);
                            showToast(`Theme set to ${t.label}`);
                          }}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: appearanceTheme === t.id ? "2px solid #2563EB" : "1px solid #CBD5E1",
                            background: appearanceTheme === t.id ? "#EFF6FF" : "#FFFFFF",
                            color: appearanceTheme === t.id ? "#2563EB" : "#334155",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontFamily: "var(--sans)",
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "16.5px", fontWeight: "600", color: "#101B33", fontFamily: "'EB Garamond', Georgia, serif" }}>
                        Primary Accent Color
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>Used for badges, highlights, and primary actions</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {[
                        { id: "blue", color: "#2563EB" },
                        { id: "emerald", color: "#059669" },
                        { id: "indigo", color: "#6366F1" },
                        { id: "amber", color: "#D97706" },
                      ].map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setAccentColor(c.id);
                            showToast(`Accent color updated to ${c.id}`);
                          }}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: c.color,
                            cursor: "pointer",
                            border: accentColor === c.id ? "3px solid #101B33" : "2px solid #FFFFFF",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VOICE ASSISTANT */}
          {activeTab === "voice" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div style={{ paddingBottom: "10px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px", flexShrink: 0 }}>
                <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#101B33", margin: "0 0 3px 0", fontFamily: "'EB Garamond', Georgia, serif" }}>
                  Voice Assistant Preferences
                </h2>
                <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0, fontFamily: "var(--sans)", fontStyle: "normal" }}>
                  Configure speech synthesis, wake word detection, and audio feedback.
                </p>
              </div>

              <div className="settings-scroll-container" style={{ flex: 1, overflowY: "auto", paddingRight: "6px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "7px", borderBottom: "1px solid #F1F5F9" }}>
                    <div>
                      <div style={{ fontSize: "16.5px", fontWeight: "600", color: "#101B33", fontFamily: "'EB Garamond', Georgia, serif" }}>
                        Ambient Wake Word ("Hey Alex")
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>Continuously listen for wake phrase without pressing mic</div>
                    </div>
                    <div
                      onClick={() => {
                        setWakeWordEnabled(!wakeWordEnabled);
                        showToast(wakeWordEnabled ? "Wake word disabled" : "Wake word active: say 'Hey Alex'");
                      }}
                      style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "12px",
                        background: wakeWordEnabled ? "#2563EB" : "#CBD5E1",
                        position: "relative",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "#FFFFFF",
                          position: "absolute",
                          top: "3px",
                          left: wakeWordEnabled ? "23px" : "3px",
                          transition: "left 0.2s",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "16.5px", fontWeight: "600", color: "#101B33", fontFamily: "'EB Garamond', Georgia, serif" }}>
                        Voice Accent & Engine
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>Deepgram Nova-2 voice model locale</div>
                    </div>
                    <div style={{ width: "300px" }}>
                      <select
                        value={voiceAccent}
                        onChange={(e) => setVoiceAccent(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "13.5px",
                          fontFamily: "var(--sans)",
                        }}
                      >
                        <option value="Indian English (en-IN)">Indian English (en-IN)</option>
                        <option value="British English (en-GB)">British English (en-GB)</option>
                        <option value="US English (en-US)">US English (en-US)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div style={{ paddingBottom: "10px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px", flexShrink: 0 }}>
                <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#101B33", margin: "0 0 3px 0", fontFamily: "'EB Garamond', Georgia, serif" }}>
                  Notification Rules & Alerts
                </h2>
                <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0, fontFamily: "var(--sans)", fontStyle: "normal" }}>
                  Manage real-time notifications for Domino catalysts and stock signals.
                </p>
              </div>

              <div className="settings-scroll-container" style={{ flex: 1, overflowY: "auto", paddingRight: "6px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "7px", borderBottom: "1px solid #F1F5F9" }}>
                    <div>
                      <div style={{ fontSize: "16.5px", fontWeight: "600", color: "#101B33", fontFamily: "'EB Garamond', Georgia, serif" }}>
                        Domino Catalyst Alerts
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>Instant alerts when high-conviction supply-chain shock occurs</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={catalystAlerts}
                      onChange={(e) => setCatalystAlerts(e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "16.5px", fontWeight: "600", color: "#101B33", fontFamily: "'EB Garamond', Georgia, serif" }}>
                        Red-Flag Fraud DNA Detection
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>Notify when portfolio company triggers corporate governance warnings</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={redFlagAlerts}
                      onChange={(e) => setRedFlagAlerts(e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA & API */}
          {activeTab === "data" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div style={{ paddingBottom: "10px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px", flexShrink: 0 }}>
                <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#101B33", margin: "0 0 3px 0", fontFamily: "'EB Garamond', Georgia, serif" }}>
                  Data Streams & API Keys
                </h2>
                <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0, fontFamily: "var(--sans)", fontStyle: "normal" }}>
                  Configure external LLM keys and inspect live data streaming services.
                </p>
              </div>

              <div className="settings-scroll-container" style={{ flex: 1, overflowY: "auto", paddingRight: "6px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "16.5px", fontWeight: "600", color: "#101B33", fontFamily: "'EB Garamond', Georgia, serif" }}>
                        Live Market WebSocket Feed
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>Real-time NSE/BSE quote streamer</div>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#DCFCE7", color: "#166534", fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16A34A" }} />
                      Connected (32ms)
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: "16.5px", fontWeight: "600", color: "#101B33", marginBottom: "4px", fontFamily: "'EB Garamond', Georgia, serif" }}>
                      Custom Google Gemini API Key
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "8px" }}>
                      Optionally bypass shared rate-limits with your own Google AI Studio key
                    </div>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      style={{ width: "100%", maxWidth: "460px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WATCHLIST & PORTFOLIO */}
          {activeTab === "watchlist" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div style={{ paddingBottom: "10px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px", flexShrink: 0 }}>
                <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#101B33", margin: "0 0 3px 0", fontFamily: "'EB Garamond', Georgia, serif" }}>
                  Watchlist & Portfolio Configuration
                </h2>
                <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0, fontFamily: "var(--sans)", fontStyle: "normal" }}>
                  Set portfolio simulation parameters and risk thresholds.
                </p>
              </div>

              <div className="settings-scroll-container" style={{ flex: 1, overflowY: "auto", paddingRight: "6px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "16.5px", fontWeight: "600", color: "#101B33", fontFamily: "'EB Garamond', Georgia, serif" }}>
                        Default Starting Sandbox Capital
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>Virtual currency balance for backtests</div>
                    </div>
                    <input
                      type="text"
                      value={portfolioCapital}
                      onChange={(e) => setPortfolioCapital(e.target.value)}
                      style={{ width: "240px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", fontWeight: "600" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PRIVACY & SECURITY */}
          {activeTab === "privacy" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div style={{ paddingBottom: "10px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px", flexShrink: 0 }}>
                <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#101B33", margin: "0 0 3px 0", fontFamily: "'EB Garamond', Georgia, serif" }}>
                  Privacy & Data Security
                </h2>
                <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0, fontFamily: "var(--sans)", fontStyle: "normal" }}>
                  Manage session timeouts, stored credentials, and local terminal cache.
                </p>
              </div>

              <div className="settings-scroll-container" style={{ flex: 1, overflowY: "auto", paddingRight: "6px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "16.5px", fontWeight: "600", color: "#101B33", fontFamily: "'EB Garamond', Georgia, serif" }}>
                        Clear Local Storage Cache
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>Wipes temporary session memory and resets preferences</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.clear();
                        showToast("Local cache cleared successfully.");
                      }}
                      style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#DC2626", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div style={{ paddingBottom: "10px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px", flexShrink: 0 }}>
                <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#101B33", margin: "0 0 3px 0", fontFamily: "'EB Garamond', Georgia, serif" }}>
                  Keyboard Shortcuts
                </h2>
                <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0, fontFamily: "var(--sans)", fontStyle: "normal" }}>
                  Quick hotkeys to navigate the terminal with maximum speed.
                </p>
              </div>

              <div className="settings-scroll-container" style={{ flex: 1, overflowY: "auto", paddingRight: "6px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  {[
                    { key: "Cmd + K", action: "Open Global Search" },
                    { key: "Shift + Space", action: "Toggle AI Voice Assistant" },
                    { key: "1", action: "Go to Dashboard" },
                    { key: "2", action: "Go to Portfolio Simulator" },
                    { key: "3", action: "Go to Domino Predictor" },
                    { key: "S", action: "Open Settings" },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}
                    >
                      <span style={{ fontSize: "13.5px", color: "#334155" }}>{s.action}</span>
                      <kbd style={{ padding: "3px 8px", borderRadius: "6px", background: "#FFFFFF", border: "1px solid #CBD5E1", fontSize: "12px", fontWeight: "600", color: "#0F172A", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ABOUT */}
          {activeTab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div style={{ paddingBottom: "10px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px", flexShrink: 0 }}>
                <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#101B33", margin: "0 0 3px 0", fontFamily: "'EB Garamond', Georgia, serif" }}>
                  About MarketMind AI
                </h2>
                <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0, fontFamily: "var(--sans)", fontStyle: "normal" }}>
                  Autonomous Financial Terminal & Domino Intelligence Platform.
                </p>
              </div>

              <div className="settings-scroll-container" style={{ flex: 1, overflowY: "auto", paddingRight: "6px" }}>
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13.5px", color: "#64748B" }}>Version</span>
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0F172A" }}>v2.4.0 (Enterprise Edition)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13.5px", color: "#64748B" }}>Account</span>
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0F172A" }}>Test User (testuser@marketmind.ai)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13.5px", color: "#64748B" }}>Core Engines</span>
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#2563EB" }}>Market Domino · Thesis Breaker · Stock DNA</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
