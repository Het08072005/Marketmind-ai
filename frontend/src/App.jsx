import React, { useState } from "react";
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
import EsgPage from "./pages/EsgPage";
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
      case "esg":
        return <EsgPage />;
      case "news":
        return <NewsPage goPage={goPage} />;
      case "domino":
        return <DominoPage goPage={goPage} />;
      case "trust":
        return <TrustMeterPage />;
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
        />

        <Ticker />

        <div className="content">
          <div className="page active" data-page={currentPage}>
            {renderCurrentPage()}
          </div>
        </div>
      </div>

      {/* Floating AI & Voice Assistant */}
      <FloatingAssistant
        isOpen={assistantOpen}
        setIsOpen={setAssistantOpen}
        initialTab={assistantInitialTab}
      />
    </div>
  );
}
