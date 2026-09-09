import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Ticker from "./components/Ticker";
import FloatingAssistant from "./components/FloatingAssistant";
import { useNavigation } from "./hooks/useNavigation";
import { useBackendStatus } from "./hooks/useBackendStatus";
import { apiClient } from "./api/client";

// Page Components
import DashboardPage from "./pages/DashboardPage";
import MarketOverviewPage from "./pages/MarketOverviewPage";
import PortfolioPage from "./pages/PortfolioPage";
import VoiceAssistantPage from "./pages/VoiceAssistantPage";
import LearningPage from "./pages/LearningPage";
import SectorPage from "./pages/SectorPage";
import AlertsPage from "./pages/AlertsPage";
import ReportsPage from "./pages/ReportsPage";
import CandlestickPage from "./pages/CandlestickPage";
import NewsPage from "./pages/NewsPage";
import DominoPage from "./pages/DominoPage";
import ThesisBreakerPage from "./pages/ThesisBreakerPage";
import DnaFingerprintPage from "./pages/DnaFingerprintPage";
import StockAutopsyPage from "./pages/StockAutopsyPage";
import AccountingCheckerPage from "./pages/AccountingCheckerPage";
import RedFlagDnaPage from "./pages/RedFlagDnaPage";
import DependencyMapPage from "./pages/DependencyMapPage";
import SettingsPage from "./pages/SettingsPage";
import HomePage from "./pages/HomePage";

export default function App() {
  const { currentPage, currentMeta, goPage, sidebarOpen, setSidebarOpen } = useNavigation();
  const { isOnline, latency } = useBackendStatus();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInitialTab, setAssistantInitialTab] = useState("chat");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Route every microphone request to the single Deepgram-backed Alex capture flow.
  useEffect(() => {
    const openVoiceAssistant = () => {
      setAssistantInitialTab("chat");
      setAssistantOpen(true);
    };
    window.addEventListener("marketmind:open_voice_assistant", openVoiceAssistant);
    return () => window.removeEventListener("marketmind:open_voice_assistant", openVoiceAssistant);
  }, []);

  // Dashboard ambient wake word listener ("Hey Alex")
  useEffect(() => {
    if (assistantOpen || isMicMuted) return undefined;
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return undefined;

    let recognition = null;
    let disposed = false;

    const startWakeRecognition = () => {
      if (disposed) return;
      try {
        recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN";

        recognition.onresult = (event) => {
          let heard = "";
          for (let i = 0; i < event.results.length; ++i) {
            heard += event.results[i][0].transcript + " ";
          }
          const lower = heard.toLowerCase().trim();
          const match = lower.match(/\b(?:hey|hi|hello)?\s*(?:alex|alexa)\b\s*(.*)/i);
          if (match) {
            const query = match[1]?.trim() || "Hey Alex";
            try {
              if ("speechSynthesis" in window) {
                window.speechSynthesis.resume();
              }
            } catch (e) {}
            setAssistantInitialTab("chat");
            setAssistantOpen(true);
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("marketmind:voice_wake_query", { detail: query }));
            }, 150);
            try { recognition.abort(); } catch (e) { }
          }
        };

        recognition.onerror = () => { };

        recognition.onend = () => {
          if (!disposed && !assistantOpen && !isMicMuted) {
            setTimeout(startWakeRecognition, 1200);
          }
        };

        recognition.start();
      } catch (err) {
        // Browser mic access policy or already running
      }
    };

    startWakeRecognition();

    return () => {
      disposed = true;
      if (recognition) {
        try { recognition.abort(); } catch (e) { }
      }
    };
  }, [assistantOpen, isMicMuted]);

  // Global Autonomous Voice Action Listener
  useEffect(() => {
    const handleAutonomousVoiceAction = (e) => {
      const action = e.detail;
      if (!action) return;

      console.log("⚡ App received autonomous voice action:", action);

      if (action.type === "DOMINO_SIMULATE" || action.target_page === "domino") {
        window.__PENDING_DOMINO_ACTION = action;
      }

      if (action.type === "THESIS_ACTION" || action.target_page === "thesis") {
        window.__PENDING_THESIS_ACTION = action;
      }

      if (action.type?.startsWith("DNA_") || action.target_page === "dna") {
        window.__PENDING_DNA_ACTION = action;
      }

      if (action.type === "DEPENDENCY_ACTION" || action.target_page === "dependency") {
        window.__PENDING_DEPENDENCY_ACTION = action;
      }

      if (action.command?.includes("CANDLE") || action.target_page === "candles") {
        window.__PENDING_CANDLE_ACTION = action;
      }

      if (action.target_page === "portfolio" || action.type?.includes("PORTFOLIO") || action.command?.includes("PORTFOLIO")) {
        window.__PENDING_PORTFOLIO_ACTION = action;
      }

      if (action.target_page === "alerts" || action.command?.includes("ALERT")) {
        window.__PENDING_ALERTS_ACTION = action;
      }

      if (action.target_page === "sector" || action.command?.includes("SECTOR")) {
        window.__PENDING_SECTOR_ACTION = action;
      }

      if (action.target_page === "reports" || action.command?.includes("REPORT")) {
        window.__PENDING_REPORTS_ACTION = action;
      }

      if (action.target_page === "news" || action.command?.includes("NEWS")) {
        window.__PENDING_NEWS_ACTION = action;
      }

      const sym = (action.params?.symbol || action.params?.symbol1 || "").toUpperCase();
      const companyName = action.params?.name || sym;

      if (action.command === "SEARCH_COMPANY" || action.type === "SEARCH_COMPANY") {
        setGlobalSearch(action.params?.query || companyName || sym);
        if (currentPage !== "overview") {
          goPage("overview");
        }
      }

      if (sym) {
        window.__SELECTED_STOCK_SYMBOL = sym;
        try {
          localStorage.setItem("mm_selected_candle_symbol", sym);
        } catch (e) { }
      }

      if (action.target_page && action.target_page !== currentPage) {
        goPage(action.target_page);
      }

      if (sym) {
        window.dispatchEvent(new CustomEvent("marketmind:stock_changed", { detail: { symbol: sym, name: companyName, action } }));
      }
    };

    window.addEventListener("marketmind:voice_action", handleAutonomousVoiceAction);
    return () => {
      window.removeEventListener("marketmind:voice_action", handleAutonomousVoiceAction);
    };
  }, [goPage, currentPage]);

  const openAssistant = (tab = "chat") => {
    setAssistantInitialTab(tab);
    setAssistantOpen(true);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage goPage={goPage} openAssistant={openAssistant} searchQuery={globalSearch} onSearchChange={setGlobalSearch} />;
      case "overview":
        return <MarketOverviewPage goPage={goPage} openAssistant={openAssistant} searchQuery={globalSearch} onSearchChange={setGlobalSearch} />;
      case "portfolio":
        return <PortfolioPage />;
      case "voice":
        return <VoiceAssistantPage openAssistant={openAssistant} />;
      case "learning":
        return <LearningPage />;
      case "sector":
        return <SectorPage />;
      case "alerts":
        return <AlertsPage />;
      case "reports":
        return <ReportsPage />;
      case "candles":
        return <CandlestickPage goPage={goPage} searchQuery={globalSearch} />;
      case "news":
        return <NewsPage goPage={goPage} searchQuery={globalSearch} />;
      case "domino":
        return <DominoPage goPage={goPage} />;
      case "breaker":
      case "thesis":
        return <ThesisBreakerPage searchQuery={globalSearch} />;
      case "dna":
        return <DnaFingerprintPage />;
      case "autopsy":
        return <StockAutopsyPage goPage={goPage} />;
      case "accounting":
        return <AccountingCheckerPage goPage={goPage} />;
      case "redflag":
        return <RedFlagDnaPage />;
      case "dependency":
        return <DependencyMapPage />;
      case "settings":
        return <SettingsPage goPage={goPage} />;
      case "home":
        return <HomePage goPage={goPage} openAssistant={openAssistant} />;
      default:
        return <DashboardPage goPage={goPage} openAssistant={openAssistant} searchQuery={globalSearch} />;
    }
  };

  // If in homepage mode, provide full immersive screen (institutional landing presentation)
  if (currentPage === "home") {
    return (
      <div className="home-fullscreen-view" style={{ minHeight: "100vh", background: "#FAF6EC" }}>
        <HomePage goPage={goPage} openAssistant={openAssistant} />
        {/* Floating AI & Voice Assistant accessible */}
        <FloatingAssistant
          isOpen={assistantOpen}
          setIsOpen={setAssistantOpen}
          initialTab={assistantInitialTab}
          isMicMuted={isMicMuted}
          setIsMicMuted={setIsMicMuted}
        />
      </div>
    );
  }

  // If in learning mode, provide full immersive screen (hide app sidebar, topbar, ticker)
  if (currentPage === "learning") {
    return (
      <div className="learning-fullscreen-view">
        <LearningPage onBack={() => goPage("dashboard")} />
        {/* Floating AI & Voice Assistant accessible if needed */}
        <FloatingAssistant
          isOpen={assistantOpen}
          setIsOpen={setAssistantOpen}
          initialTab={assistantInitialTab}
          isMicMuted={isMicMuted}
          setIsMicMuted={setIsMicMuted}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        goPage={goPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`main ${currentPage === "settings" ? "main-settings" : ""}`}>
        <Topbar
          eyebrow={currentMeta.eyebrow}
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          backendOnline={isOnline}
          backendLatency={latency}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {currentPage !== "candles" && currentPage !== "settings" && <Ticker />}

        <div className={`content ${currentPage === "settings" ? "content-settings" : ""}`}>
          <div className="page active" data-page={currentPage} style={currentPage === "settings" ? { height: "100%" } : undefined}>
            {renderCurrentPage()}
          </div>
        </div>
      </div>

      {/* Floating AI & Voice Assistant with Mute / Privacy controls (hidden on settings page) */}
      {currentPage !== "settings" && (
        <FloatingAssistant
          isOpen={assistantOpen}
          setIsOpen={setAssistantOpen}
          initialTab={assistantInitialTab}
          isMicMuted={isMicMuted}
          setIsMicMuted={setIsMicMuted}
          onFabClick={() => {
            if (currentPage === "dashboard") {
              window.dispatchEvent(new CustomEvent("marketmind:open_dashboard_copilot"));
              return;
            }
            setAssistantOpen(true);
          }}
        />
      )}
    </div>
  );
}
