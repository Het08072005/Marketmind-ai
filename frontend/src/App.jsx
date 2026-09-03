import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Ticker from "./components/Ticker";
import FloatingAssistant from "./components/FloatingAssistant";
import { useNavigation } from "./hooks/useNavigation";
import { useBackendStatus } from "./hooks/useBackendStatus";

// Page Components
import DashboardPage from "./pages/DashboardPage";
import PortfolioPage from "./pages/PortfolioPage";
import VoiceAssistantPage from "./pages/VoiceAssistantPage";
import LearningPage from "./pages/LearningPage";
import SectorPage from "./pages/SectorPage";
import AlertsPage from "./pages/AlertsPage";
import ReportsPage from "./pages/ReportsPage";
import CandlestickPage from "./pages/CandlestickPage";
import NewsPage from "./pages/NewsPage";
import DominoPage from "./pages/DominoPage";
import TrustMeterPage from "./pages/TrustMeterPage";
import ThesisBreakerPage from "./pages/ThesisBreakerPage";
import DnaFingerprintPage from "./pages/DnaFingerprintPage";
import TimeMachinePage from "./pages/TimeMachinePage";
import StockAutopsyPage from "./pages/StockAutopsyPage";
import AccountingCheckerPage from "./pages/AccountingCheckerPage";
import RedFlagDnaPage from "./pages/RedFlagDnaPage";
import GhostPortfolioPage from "./pages/GhostPortfolioPage";
import DependencyMapPage from "./pages/DependencyMapPage";

export default function App() {
  const { currentPage, currentMeta, goPage, sidebarOpen, setSidebarOpen } = useNavigation();
  const { isOnline, latency } = useBackendStatus();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInitialTab, setAssistantInitialTab] = useState("chat");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Global Autonomous Voice Action Listener
  useEffect(() => {
    const handleAutonomousVoiceAction = (e) => {
      const action = e.detail;
      if (!action) return;

      console.log("⚡ App received autonomous voice action:", action);

      // Do NOT navigate away if user is in the Voice Stock Assistant & Copilot research terminal
      if (action.target_page && currentPage !== "voice" && window.location.hash !== "#voice") {
        goPage(action.target_page);
      }

      if (action.params?.symbol) {
        window.__SELECTED_STOCK_SYMBOL = action.params.symbol;
      }
    };

    window.addEventListener("marketmind:voice_action", handleAutonomousVoiceAction);
    return () => {
      window.removeEventListener("marketmind:voice_action", handleAutonomousVoiceAction);
    };
  }, [goPage, currentPage]);

  // Ambient Hands-Free Wake Word Detector ("Hey Alex", "Hey Alexa", "Hey MarketPulse", "Hey Pulse")
  useEffect(() => {
    if (assistantOpen || isMicMuted) return; // Release mic when assistant modal is active or mic is muted

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let ambientRec = null;
    let isStopped = false;

    const startWakeWordListener = () => {
      if (isStopped) return;
      try {
        ambientRec = new SpeechRecognition();
        ambientRec.continuous = true;
        ambientRec.interimResults = true;
        ambientRec.lang = "en-IN";

        ambientRec.onresult = (event) => {
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          const lower = text.toLowerCase().trim();
          const wakeKeywords = [
            "hey alex",
            "hey alexa",
            "hey pulse",
            "hey market pulse",
            "hey marketpulse",
            "alexa",
            "alex",
            "marketpulse",
            "मार्केटपल्स"
          ];

          const foundWake = wakeKeywords.find((w) => lower.includes(w));
          if (foundWake) {
            console.log("🎙️ Ambient Wake Word Triggered:", text);
            isStopped = true;
            try {
              ambientRec.stop();
            } catch (e) {}

            setAssistantOpen(true);
            setAssistantInitialTab("chat");

            // Extract query payload after the wake keyword
            const remaining = lower.split(foundWake).pop().trim();
            const finalQuery = remaining.length > 1 ? remaining : "hey alex";

            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent("marketmind:voice_wake_query", { detail: finalQuery })
              );
            }, 300);
          }
        };

        ambientRec.onerror = () => {
          // Keep ambient listener silent on transient mic pauses
        };

        ambientRec.onend = () => {
          if (!isStopped) {
            setTimeout(startWakeWordListener, 1000);
          }
        };

        ambientRec.start();
      } catch (err) {
        console.warn("Ambient mic status:", err);
      }
    };

    startWakeWordListener();

    return () => {
      isStopped = true;
      if (ambientRec) {
        try {
          ambientRec.stop();
        } catch (e) {}
      }
    };
  }, [assistantOpen]);

  const openAssistant = (tab = "chat") => {
    setAssistantInitialTab(tab);
    setAssistantOpen(true);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage goPage={goPage} openAssistant={openAssistant} />;
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
        return <CandlestickPage />;
      case "news":
        return <NewsPage goPage={goPage} searchQuery={globalSearch} />;
      case "domino":
        return <DominoPage goPage={goPage} />;
      case "trust":
        return <TrustMeterPage />;
      case "breaker":
      case "thesis":
        return <ThesisBreakerPage />;
      case "dna":
        return <DnaFingerprintPage />;
      case "timemachine":
        return <TimeMachinePage />;
      case "autopsy":
        return <StockAutopsyPage goPage={goPage} />;
      case "accounting":
        return <AccountingCheckerPage goPage={goPage} />;
      case "redflag":
        return <RedFlagDnaPage />;
      case "ghost":
        return <GhostPortfolioPage />;
      case "dependency":
        return <DependencyMapPage />;
      default:
        return <DashboardPage goPage={goPage} openAssistant={openAssistant} />;
    }
  };

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
      <div className="main">
        <Topbar
          eyebrow={currentMeta.eyebrow}
          title={currentMeta.title}
          onOpenSidebar={() => setSidebarOpen(true)}
          backendOnline={isOnline}
          backendLatency={latency}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {currentPage !== "candles" && <Ticker />}

        <div className="content">
          <div className="page active" data-page={currentPage}>
            {renderCurrentPage()}
          </div>
        </div>
      </div>

      {/* Floating AI & Voice Assistant with Mute / Privacy controls */}
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
