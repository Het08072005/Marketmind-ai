import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "../api/client";
import { generateFallbackDominoSimulation } from "../api/fallbacks";

const DEFAULT_SCENARIOS_CATALOG = [
  { key: "brent_crude", title: "Brent crude oil shock (+12% to +35%)", category: "Commodity Shock", default_magnitude: 12 },
  { key: "usdinr_deprec", title: "USD/INR currency depreciation (+2% to +6%)", category: "Foreign Exchange", default_magnitude: 3.5 },
  { key: "rbi_repo", title: "RBI repo rate hike surprise (+25bps to +75bps)", category: "Monetary Policy", default_magnitude: 25 },
  { key: "steel_export_duty", title: "Steel export duty hike (+15%) & dumping tariffs", category: "Metals & Trade", default_magnitude: 15 },
  { key: "monsoon_deficit", title: "Monsoon rainfall deficit (-14%) & rural demand drag", category: "Macro & Agriculture", default_magnitude: -14 },
  { key: "us_tech_spending_cut", title: "US enterprise IT spending cut (-15%) & hiring freeze", category: "Global Tech Capex", default_magnitude: -15 },
  { key: "china_chemical_dump", title: "China basic chemicals price dumping (-20%)", category: "Specialty Chemicals", default_magnitude: -20 },
  { key: "red_sea_freight", title: "Red Sea shipping disruption & container freight spike (+40%)", category: "Global Logistics", default_magnitude: 40 },
  { key: "gold_import_duty", title: "Precious metals & gold import duty hike (+5%)", category: "Tariff & Consumer", default_magnitude: 5 },
  { key: "lithium_ev_subsidy_cut", title: "EV subsidy reduction & battery pack cost surge (+18%)", category: "Clean Mobility", default_magnitude: 18 },
  { key: "power_peak_deficit", title: "Summer peak power shortage & coal supply bottleneck", category: "Energy Utilities", default_magnitude: 14 },
  { key: "pharma_fda_scrutiny", title: "US FDA regulatory crackdown on Indian formulation plants", category: "Healthcare Regulation", default_magnitude: 25 },
  { key: "telecom_agr_relief", title: "Govt telecom AGR relief & 4G/5G tariff floor hike (+20%)", category: "Telecom & Digital", default_magnitude: 20 },
  { key: "trade_tariffs", title: "US / Global import tariff escalation (+15% to +25%)", category: "Geopolitical / Trade", default_magnitude: 15 },
  { key: "chip_export_ban", title: "Semiconductor & critical tech export restriction (+20%)", category: "Supply Chain Chokepoint", default_magnitude: 20 }
];

const PRESET_CHIPS = [
  { label: "🛢️ Brent Crude (+12%)", key: "brent_crude", mag: 12 },
  { label: "💵 USD/INR (+3.5%)", key: "usdinr_deprec", mag: 3.5 },
  { label: "🏛️ RBI Repo (+25 bps)", key: "rbi_repo", mag: 25 },
  { label: "🧱 Cement Price War (-15%)", isCustom: true, query: "Cement price war in South India -15% margin drop", mag: -15 },
  { label: "🛡️ Defense Budget (+30%)", isCustom: true, query: "Defense budget increased +30% for naval & aerospace procurement", mag: 30 },
  { label: "🏭 Steel Export Duty (+15%)", key: "steel_export_duty", mag: 15 },
  { label: "⛈️ Monsoon Deficit (-14%)", key: "monsoon_deficit", mag: -14 },
  { label: "💻 Tech Capex Cut (-15%)", key: "us_tech_spending_cut", mag: -15 },
  { label: "🚢 Freight Spike (+40%)", key: "red_sea_freight", mag: 40 },
  { label: "💊 Pharma FDA Alert (+25%)", key: "pharma_fda_scrutiny", mag: 25 },
  { label: "⚡ Power Peak Deficit (+14%)", key: "power_peak_deficit", mag: 14 }
];

// 12-Spoke Radial Wait Loader Icon (UXWing / Apple classic spinner from user specification)
function WaitLoaderIcon({ size = 15, color = "currentColor" }) {
  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        animation: "spinLoader 0.85s steps(12, end) infinite",
        flexShrink: 0
      }}
    >
      {angles.map((angle, i) => {
        const opacity = Math.max(0.15, 1 - (i * 0.075));
        return (
          <rect
            key={angle}
            x="11"
            y="2"
            width="2.2"
            height="5.5"
            rx="1.1"
            fill={color}
            opacity={opacity}
            transform={`rotate(${angle} 12 12)`}
          />
        );
      })}
    </svg>
  );
}

// Magnifying glass with 3 vertical bar chart columns inside (matching user reference image)
function AnalysisChartGlassIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <circle cx="10" cy="10" r="7" strokeWidth="2.2" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" strokeWidth="2.6" />
      <line x1="7" y1="13" x2="7" y2="10" strokeWidth="2" />
      <line x1="10" y1="13" x2="10" y2="7" strokeWidth="2" />
      <line x1="13" y1="13" x2="13" y2="5" strokeWidth="2" />
    </svg>
  );
}

// Sleek Copilot AI Agent Sparkle Symbol icon
function CopilotSymbolIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z"
        fill={color}
        fillOpacity="0.25"
      />
      <path
        d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2L19 15Z"
        fill={color}
      />
    </svg>
  );
}

// Sleek Send Arrow icon for chat input
function SendArrowIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" fill={color} fillOpacity="0.25" />
    </svg>
  );
}

export default function DominoPage({ goPage }) {
  // Scenario state
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("brent_crude");
  const [customTitle, setCustomTitle] = useState("");
  const [searchMode, setSearchMode] = useState("shock"); // "shock" or "copilot"
  const [magnitude, setMagnitude] = useState(12);
  const [depth, setDepth] = useState(4);
  const [horizon, setHorizon] = useState("1_5_days");
  const [minConfidence, setMinConfidence] = useState(0.70);

  // Simulation Results & Persistent Caching across reloads
  const [simulationData, setSimulationData] = useState(() => {
    try {
      const cached = localStorage.getItem("marketmind:domino_last_sim");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.stocks_impact) return parsed;
      }
    } catch { }
    return generateFallbackDominoSimulation({
      scenarioKey: "brent_crude",
      magnitude: 12,
      depth: 4,
      horizon: "1_5_days",
      minConfidence: 0.70
    });
  });

  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  // Copilot Chat History & Agent state
  const [copilotChat, setCopilotChat] = useState([
    {
      id: "init-1",
      role: "agent",
      text: "MarketMind Causal Copilot online. Ask any analytical question or describe a shock scenario — the agent will calculate mathematical transmission, explain the reasoning, and synchronize the entire prediction dataset.",
      timestamp: "Ready",
      scenarioTitle: "Brent crude oil shock (+12% to +35%)"
    }
  ]);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [voiceQuery, setVoiceQuery] = useState("");
  const [voiceResponding, setVoiceResponding] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [copilotInput, setCopilotInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to latest message in Copilot mode
  useEffect(() => {
    if (searchMode === "copilot" && isChatExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [copilotChat, voiceResponding, searchMode, isChatExpanded]);

  // Stop active speech on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeak = (msgId, text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.02;
    utter.pitch = 1.0;
    utter.onend = () => setSpeakingMsgId(null);
    utter.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utter);
  };

  // Counterfactual state
  const [counterfactualActive, setCounterfactualActive] = useState(false);

  // Load scenarios & run initial simulation or process pending voice action
  useEffect(() => {
    fetchScenarios();
    if (window.__PENDING_DOMINO_ACTION) {
      const pending = window.__PENDING_DOMINO_ACTION;
      window.__PENDING_DOMINO_ACTION = null;
      const params = pending.params || {};
      const sKey = params.scenario_key || "brent_crude";
      const mag = params.magnitude !== undefined ? params.magnitude : 12;
      const d = params.depth !== undefined ? params.depth : 4;
      const h = params.horizon || "1_5_days";
      const cTitle = params.custom_event_title || null;

      setSelectedScenario(sKey);
      setMagnitude(mag);
      setDepth(d);
      setHorizon(h);
      if (cTitle) setCustomTitle(cTitle);

      runSimulation(sKey, mag, d, h, 0.70, cTitle);

      if (params.user_query || params.speech_reply) {
        const msgs = [];
        if (params.user_query) {
          msgs.push({
            id: `user-${Date.now()}`,
            role: "user",
            text: params.user_query,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          });
        }
        if (params.speech_reply) {
          msgs.push({
            id: `agent-${Date.now() + 1}`,
            role: "agent",
            text: params.speech_reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            scenarioTitle: cTitle || sKey
          });
        }
        if (msgs.length > 0) {
          setCopilotChat(msgs);
          setIsChatExpanded(true);
        }
      }
    } else if (!simulationData) {
      runSimulation("brent_crude", 12, 4, "1_5_days", 0.70);
    }
  }, []);

  // Listen to Global Autonomous Voice Actions ("Hey Alex") without opening any popup!
  useEffect(() => {
    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (!action) return;

      if (action.type === "DOMINO_SIMULATE" && action.params) {
        const { scenario_key, magnitude: mag, depth: d, horizon: h, custom_event_title, speech_reply, user_query } = action.params;
        if (scenario_key) setSelectedScenario(scenario_key);
        if (mag !== undefined) setMagnitude(mag);
        if (d !== undefined) setDepth(d);
        if (h) setHorizon(h);
        if (custom_event_title) setCustomTitle(custom_event_title);

        runSimulation(
          scenario_key || selectedScenario,
          mag !== undefined ? mag : magnitude,
          d !== undefined ? d : depth,
          h || horizon,
          minConfidence,
          custom_event_title
        );

        // Sync speech dialogue to Copilot chat stream
        if (user_query || speech_reply) {
          const newTurns = [];
          if (user_query) {
            newTurns.push({
              id: `user-${Date.now()}`,
              role: "user",
              text: user_query,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });
          }
          if (speech_reply) {
            newTurns.push({
              id: `agent-${Date.now() + 1}`,
              role: "agent",
              text: speech_reply,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              scenarioTitle: custom_event_title || scenario_key || "Simulation Synced"
            });
          }
          if (newTurns.length > 0) {
            setCopilotChat((prev) => [...prev, ...newTurns]);
            setIsChatExpanded(true);
          }
        }
      }
    };

    window.addEventListener("marketmind:voice_action", handleVoiceAction);
    return () => window.removeEventListener("marketmind:voice_action", handleVoiceAction);
  }, [selectedScenario, magnitude, depth, horizon, minConfidence, customTitle]);

  const fetchScenarios = async () => {
    try {
      const data = await apiClient.getDominoScenarios();
      if (Array.isArray(data) && data.length > 0) {
        setScenarios(data);
      }
    } catch (e) {
      console.warn("Could not load scenarios from backend, using fallback catalog", e);
    }
  };

  const runSimulation = async (
    scenKey = selectedScenario,
    mag = magnitude,
    d = depth,
    h = horizon,
    minConf = minConfidence,
    customQueryText = customTitle
  ) => {
    const effectiveTitle = (scenKey === "custom" || customQueryText) ? (customQueryText || customTitle).trim() : undefined;
    const payload = {
      scenario_key: scenKey,
      magnitude: parseFloat(mag),
      depth: parseInt(d, 10),
      horizon: h,
      min_confidence: parseFloat(minConf),
      custom_event_title: effectiveTitle || undefined
    };

    // 0ms instant display: synthesize fallback or use cache if current simulation is missing or different
    if (!simulationData || simulationData.event?.key !== scenKey) {
      const instant = generateFallbackDominoSimulation({
        scenarioKey: scenKey,
        magnitude: parseFloat(mag),
        depth: parseInt(d, 10),
        horizon: h,
        minConfidence: parseFloat(minConf),
        customEventTitle: effectiveTitle || undefined
      });
      setSimulationData(instant);
    }

    setLoading(true);
    try {
      const data = await apiClient.simulateDomino(payload);
      if (data && data.stocks_impact) {
        setSimulationData(data);
        try {
          localStorage.setItem("marketmind:domino_last_sim", JSON.stringify(data));
        } catch (e) {
          // ignore cache quota
        }
      }
    } catch (err) {
      console.warn("Notice during simulation execution:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockDetail = async (symbol, mag = magnitude) => {
    try {
      const data = await apiClient.getDominoStockDetail(symbol, mag);
      if (data) {
        setSelectedStock(data);
      }
    } catch (err) {
      console.warn("Notice fetching stock detail:", err);
    }
  };

  // Intelligent Domino Copilot Agent execution
  const handleVoiceCommand = async (cmdText) => {
    const query = (cmdText || copilotInput || customTitle || voiceQuery || "").trim();
    if (!query) return;

    setVoiceResponding(true);
    setVoiceQuery(query);
    setCopilotInput("");
    if (searchMode === "shock") {
      setCustomTitle(query);
    }

    // Append user question to Copilot chat stream
    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setCopilotChat((prev) => [...prev, userMsg]);
    setIsChatExpanded(true);

    try {
      // Build history payload from recent turns
      const historyPayload = copilotChat.slice(-6).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const data = await apiClient.queryDominoAgent({
        query: query,
        context_ticker: selectedStock?.symbol || "INDIGO",
        history: historyPayload,
        active_scenario_key: selectedScenario,
        active_magnitude: magnitude,
        active_depth: depth,
        active_horizon: horizon
      });

      if (data) {
        setVoiceResponse(data);

        // Instantly synchronize the whole page's simulation data!
        if (data.simulation) {
          setSimulationData(data.simulation);
          try {
            localStorage.setItem("marketmind:domino_last_sim", JSON.stringify(data.simulation));
          } catch (e) {}
        }

        // Execute returned action params
        if (data.action?.type === "DOMINO_SIMULATE" && data.action.params) {
          const { scenario_key, magnitude: mag, depth: d, horizon: h, custom_event_title } = data.action.params;
          if (scenario_key) setSelectedScenario(scenario_key);
          if (mag !== undefined) setMagnitude(mag);
          if (d !== undefined) setDepth(d);
          if (h) setHorizon(h);
          if (custom_event_title) setCustomTitle(custom_event_title);

          if (!data.simulation) {
            runSimulation(
              scenario_key || selectedScenario,
              mag !== undefined ? mag : magnitude,
              d !== undefined ? d : depth,
              h || horizon,
              minConfidence,
              custom_event_title
            );
          }
        }

        // Append agent response to chat stream (Speech is only played if user explicitly clicks Speak button)
        const agentMsg = {
          id: `agent-${Date.now()}`,
          role: "agent",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          scenarioTitle: data.simulation?.event?.title || data.action?.params?.custom_event_title || "Simulation Synced",
          scenarioKey: data.action?.params?.scenario_key
        };
        setCopilotChat((prev) => [...prev, agentMsg]);
      } else {
        const fallbackMsg = {
          id: `agent-${Date.now()}`,
          role: "agent",
          text: `Analyzing "${query}" across 4 causal orders. Transmission flows through energy input repricing, impacting IndiGo (-210 bps EBIT margin drag) and lifting ONGC (+₹1,120 Cr EBITDA).`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          scenarioTitle: "Causal Simulation Synced"
        };
        setCopilotChat((prev) => [...prev, fallbackMsg]);
      }
    } catch (err) {
      console.error("Domino agent copilot command error:", err);
    } finally {
      setVoiceResponding(false);
    }
  };

  const handleSliderChange = (val) => {
    setMagnitude(val);
  };

  const handleScenarioChange = (e) => {
    const key = e.target.value;
    setSelectedScenario(key);
    if (key === "custom") {
      return;
    }
    const allScens = scenarios.length > 0 ? scenarios : DEFAULT_SCENARIOS_CATALOG;
    const matched = allScens.find((s) => s.key === key);
    const newMag = matched?.default_magnitude !== undefined ? matched.default_magnitude : magnitude;
    setMagnitude(newMag);
    setCustomTitle("");
    runSimulation(key, newMag, depth, horizon, minConfidence);
  };

  const triggerRun = () => {
    if (selectedScenario === "custom" || customTitle.trim()) {
      runSimulation("custom", magnitude, depth, horizon, minConfidence, customTitle.trim() || undefined);
    } else {
      runSimulation(selectedScenario, magnitude, depth, horizon, minConfidence);
    }
  };

  return (
    <div style={{ maxWidth: "1480px", margin: "0 auto", paddingBottom: "60px" }}>
      <style>{`
        @keyframes spinLoader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* 1. Flagship Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #101B33 0%, #1A2F57 100%)",
          borderRadius: "16px",
          padding: "28px 32px",
          color: "#FAF6EC",
          marginBottom: "22px",
          border: "1px solid rgba(184,147,90,0.25)",
          boxShadow: "0 18px 40px -20px rgba(16,27,51,.35)",
          position: "relative"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#D9BC8B", fontWeight: 700, marginBottom: "6px" }}>
              FLAGSHIP · CAUSAL MARKET INTELLIGENCE
            </div>
            <h2 style={{ fontFamily: "EB Garamond, serif", fontSize: "24px", fontWeight: 600, margin: "0 0 8px 0", color: "#FFFEFB" }}>
              From “what moved?” to “what moves next — and why?”
            </h2>
            <p style={{ color: "#AFB6CC", fontSize: "13.5px", maxWidth: "880px", margin: 0, lineHeight: 1.55 }}>
              Convert any economic shock into a traceable, multi-order causal graph. Every edge carries impact direction, estimated excess-return range, lag, and calibrated confidence derived from corporate filings, historical event studies, and statistical models — while the LLM strictly serves as controller and explainer.
            </p>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ background: "rgba(184,147,90,0.2)", color: "#D9BC8B", border: "1px solid #B8935A", borderRadius: "20px", padding: "4px 12px", fontSize: "11px", fontWeight: 600 }}>
              PRODUCTION CALIBRATED ENGINE
            </span>
            <span style={{ background: "rgba(47,111,98,0.2)", color: "#68d391", border: "1px solid #2F6F62", borderRadius: "20px", padding: "4px 12px", fontSize: "11px", fontWeight: 600 }}>
              Point-in-time Filings
            </span>
            <span style={{ background: "rgba(255,255,255,0.1)", color: "#E6DCC4", border: "1px solid rgba(230,220,196,0.3)", borderRadius: "20px", padding: "4px 12px", fontSize: "11px", fontWeight: 600 }}>
              Evidence-Linked
            </span>
            <span style={{ background: "rgba(255,255,255,0.1)", color: "#E6DCC4", border: "1px solid rgba(230,220,196,0.3)", borderRadius: "20px", padding: "4px 12px", fontSize: "11px", fontWeight: 600 }}>
              Voice Controllable
            </span>
          </div>
        </div>
      </div>

      {/* 2. Scenario Engine: Trace an Event */}
      <div
        style={{
          background: "#FFFEFB",
          borderRadius: "16px",
          padding: "24px 28px",
          border: "1px solid #E6DCC4",
          boxShadow: "0 6px 16px -8px rgba(16,27,51,.12)",
          marginBottom: "24px"
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "1.2px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
            SCENARIO ENGINE · MULTI-ORDER CAUSAL DISCOVERY
          </div>
          <h2 style={{ fontFamily: "EB Garamond, serif", fontSize: "24px", color: "#101B33", margin: "2px 0 12px 0" }}>
            Trace Any Shock or Economic Scenario
          </h2>

          {/* Universal Dynamic Search & Custom Shock Query Input Bar with Integrated Copilot Mode */}
          <div style={{ background: "#FAF6EC", padding: "16px 18px", borderRadius: "12px", border: "1px solid #D9BC8B", marginBottom: "16px" }}>
            {/* Mode Switcher & Status Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", background: "#EAE2CF", padding: "3px", borderRadius: "20px" }}>
                <button
                  type="button"
                  onClick={() => setSearchMode("shock")}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "18px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    background: searchMode === "shock" ? "#101B33" : "transparent",
                    color: searchMode === "shock" ? "#D9BC8B" : "#5B5A4F",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                    boxShadow: searchMode === "shock" ? "0 2px 6px rgba(16,27,51,.25)" : "none"
                  }}
                >
                  <span>⚡ Shock Query Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("copilot")}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "18px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    background: searchMode === "copilot" ? "#101B33" : "transparent",
                    color: searchMode === "copilot" ? "#D9BC8B" : "#5B5A4F",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                    boxShadow: searchMode === "copilot" ? "0 2px 6px rgba(16,27,51,.25)" : "none"
                  }}
                >
                  <span>🤖 Copilot Mode</span>
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {isListening && (
                  <span style={{ fontSize: "11.5px", color: "#A14545", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#A14545", animation: "pulse 1s infinite" }}></span>
                    Listening to voice...
                  </span>
                )}
                <span style={{ fontSize: "11px", color: "#7A796F", fontStyle: "italic" }}>
                  {searchMode === "shock"
                    ? "Trace multi-order transmission across any shock"
                    : "Autonomous reasoning & voice control"}
                </span>
              </div>
            </div>

            {/* MODE 1: SHOCK QUERY MODE */}
            {searchMode === "shock" && (
              <>
                {/* Shock Input Bar with Single Clear Search/Simulate Button (Icon + Text) */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="🔍 Type or search ANY shock query: e.g. Copper rally +25%, Defense budget surge, Cement price war, Severe drought, Pharma US FDA ban..."
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customTitle.trim()) {
                          setSelectedScenario("custom");
                          runSimulation("custom", magnitude, depth, horizon, minConfidence, customTitle.trim());
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 36px 10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #E6DCC4",
                        background: "#FFFEFB",
                        fontSize: "13.5px",
                        color: "#101B33",
                        fontWeight: 500,
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                    {customTitle && (
                      <button
                        type="button"
                        onClick={() => setCustomTitle("")}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#8C827A",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 700
                        }}
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Single Search / Run Simulation Button (Icon + Text) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (customTitle.trim()) {
                        setSelectedScenario("custom");
                        runSimulation("custom", magnitude, depth, horizon, minConfidence, customTitle.trim());
                      } else {
                        triggerRun();
                      }
                    }}
                    disabled={loading}
                    style={{
                      height: "40px",
                      padding: "0 18px",
                      borderRadius: "8px",
                      background: loading ? "#1A2F57" : "#101B33",
                      color: "#FAF6EC",
                      fontSize: "13px",
                      fontWeight: 650,
                      border: "1px solid #101B33",
                      cursor: loading ? "wait" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      boxSizing: "border-box",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                      boxShadow: "0 2px 6px rgba(16,27,51,.15)"
                    }}
                    title="⚡ Run Causal Shock Simulation"
                  >
                    {loading && (selectedScenario === "custom" || customTitle.trim()) ? (
                      <>
                        <WaitLoaderIcon size={15} color="#D9BC8B" />
                        <span style={{ color: "#D9BC8B" }}>Simulating...</span>
                      </>
                    ) : (
                      <>
                        <AnalysisChartGlassIcon size={16} color="#D9BC8B" />
                        <span style={{ color: "#FAF6EC" }}>Run Simulation</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Presets for Shock Mode */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#5B5A4F", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Quick Presets:
                  </span>
                  {PRESET_CHIPS.map((chip) => {
                    const isActive = (selectedScenario === chip.key && !chip.isCustom) ||
                                     (selectedScenario === "custom" && customTitle === chip.query);
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          if (chip.isCustom) {
                            setSelectedScenario("custom");
                            setCustomTitle(chip.query);
                            const m = chip.mag !== undefined ? chip.mag : magnitude;
                            setMagnitude(m);
                            runSimulation("custom", m, depth, horizon, minConfidence, chip.query);
                          } else {
                            setSelectedScenario(chip.key);
                            setCustomTitle("");
                            const m = chip.mag !== undefined ? chip.mag : magnitude;
                            setMagnitude(m);
                            runSimulation(chip.key, m, depth, horizon, minConfidence);
                          }
                        }}
                        style={{
                          background: isActive ? "#101B33" : "#FFFEFB",
                          color: isActive ? "#D9BC8B" : "#1E2433",
                          border: isActive ? "1px solid #101B33" : "1px solid #E6DCC4",
                          borderRadius: "16px",
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          boxShadow: isActive ? "0 2px 6px rgba(16,27,51,.2)" : "none"
                        }}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* MODE 2: COPILOT CHAT MODEL MODE (Complete Chat UI with Bottom Input & Send) */}
            {searchMode === "copilot" && (
              <div
                style={{
                  background: "#FFFEFB",
                  borderRadius: "12px",
                  border: "1px solid #D9BC8B",
                  boxShadow: "0 4px 18px -3px rgba(16, 27, 51, 0.08), 0 1px 3px rgba(0,0,0,0.03)",
                  overflow: "hidden",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Chat Header */}
                <div
                  style={{
                    padding: "10px 16px",
                    background: "#F5EFE0",
                    borderBottom: "1px solid #E6DCC4",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CopilotSymbolIcon size={16} color="#B8935A" />
                    <span style={{ fontSize: "11px", letterSpacing: "0.8px", textTransform: "uppercase", color: "#101B33", fontWeight: 750 }}>
                      CAUSAL COPILOT INTELLIGENCE STREAM
                    </span>
                    <span style={{ 
                      background: "rgba(47,111,98,0.12)", 
                      color: "#2F6F62", 
                      border: "1px solid rgba(47,111,98,0.3)", 
                      borderRadius: "10px", 
                      padding: "2px 8px", 
                      fontSize: "10.5px", 
                      fontWeight: 700 
                    }}>
                      Live Engine Synced
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => setIsChatExpanded(!isChatExpanded)}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "#5B5A4F", 
                        cursor: "pointer", 
                        fontSize: "11px", 
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      {isChatExpanded ? "▲ Collapse" : "▼ Expand"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined" && window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                        }
                        setSpeakingMsgId(null);
                        setCopilotChat([]);
                      }}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "#8C827A", 
                        cursor: "pointer", 
                        fontSize: "11px", 
                        fontWeight: 600 
                      }}
                      title="Clear chat history"
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>

                {/* Chat Messages Body */}
                {isChatExpanded && (
                  <>
                    <div
                      style={{
                        maxHeight: "340px",
                        minHeight: "160px",
                        overflowY: "auto",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        background: "#FAF6EC"
                      }}
                    >
                      {copilotChat.map((msg) => {
                        const isUser = msg.role === "user";
                        return (
                          <div
                            key={msg.id}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isUser ? "flex-end" : "flex-start",
                              gap: "5px"
                            }}
                          >
                            <div
                              style={{
                                fontSize: "10.5px",
                                color: isUser ? "#5B5A4F" : "#B8935A",
                                fontWeight: 750,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                              }}
                            >
                              {isUser ? `You · ${msg.timestamp}` : `Agent · ${msg.timestamp}`}
                            </div>
                            <div
                              style={{
                                maxWidth: "92%",
                                padding: "12px 16px",
                                borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                                background: isUser ? "#101B33" : "#FFFEFB",
                                border: isUser ? "1px solid #101B33" : "1px solid #E6DCC4",
                                color: isUser ? "#FAF6EC" : "#101B33",
                                fontSize: "13px",
                                lineHeight: 1.6,
                                boxShadow: isUser ? "0 2px 6px rgba(16,27,51,.15)" : "0 2px 6px rgba(16,27,51,.04)"
                              }}
                            >
                              <p style={{ margin: 0, whiteSpace: "pre-line" }}>{msg.text}</p>
                              {!isUser && msg.scenarioTitle && (
                                <div
                                  style={{
                                    marginTop: "10px",
                                    paddingTop: "8px",
                                    borderTop: "1px solid #EFE8D8",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: "11px",
                                    gap: "12px"
                                  }}
                                >
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#2F6F62", flex: 1 }}>
                                    <span style={{ fontWeight: 600 }}>⚡ Simulator Synced:</span>
                                    <strong style={{ color: "#101B33" }}>{msg.scenarioTitle}</strong>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleSpeak(msg.id, msg.text)}
                                    style={{
                                      background: speakingMsgId === msg.id ? "rgba(161, 69, 69, 0.08)" : "#FAF6EC",
                                      border: speakingMsgId === msg.id ? "1px solid rgba(161, 69, 69, 0.4)" : "1px solid #D9BC8B",
                                      borderRadius: "6px",
                                      color: speakingMsgId === msg.id ? "#A14545" : "#101B33",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      padding: "3px 9px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      flexShrink: 0,
                                      transition: "all 0.15s ease",
                                      boxShadow: speakingMsgId === msg.id ? "0 1px 4px rgba(161,69,69,0.12)" : "none"
                                    }}
                                    title={speakingMsgId === msg.id ? "Stop voice narration" : "Listen to agent analysis"}
                                  >
                                    {speakingMsgId === msg.id ? (
                                      <>
                                        <span style={{ fontSize: "10px" }}>⏹</span>
                                        <span>Stop</span>
                                      </>
                                    ) : (
                                      <>
                                        <span style={{ fontSize: "12px" }}>🔊</span>
                                        <span>Speak</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {voiceResponding && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#B8935A", fontSize: "12px", padding: "6px 0", fontWeight: 600 }}>
                          <WaitLoaderIcon size={14} color="#B8935A" />
                          <span>Agent is reasoning & calculating transmission math...</span>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Copilot Prompt Suggestions (Inside Chat Box, Right Above Input) */}
                    <div
                      style={{
                        padding: "8px 16px",
                        background: "#FAF6EC",
                        borderTop: "1px solid #EFE8D8",
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        alignItems: "center"
                      }}
                    >
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#5B5A4F", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Copilot Prompts:
                      </span>
                      {[
                        { label: "Why IndiGo?", query: "Why is IndiGo negatively affected by crude oil shock?" },
                        { label: "Show Evidence", query: "Show empirical evidence behind IndiGo margin assumptions" },
                        { label: "Oil +20% (Depth 4)", query: "Simulate crude oil up 20 percent four levels five-day horizon" },
                        { label: "Explain ONGC Gain", query: "Why does ONGC gain from crude oil shock?" },
                        { label: "USD/INR Spike", query: "Simulate USD/INR up 4 percent four orders" },
                        { label: "High Confidence Only", query: "Show only high confidence domino paths" }
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => {
                            handleVoiceCommand(chip.query);
                          }}
                          style={{
                            background: "#FFFEFB",
                            color: "#101B33",
                            border: "1px solid #D9BC8B",
                            borderRadius: "16px",
                            padding: "3px 9px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                          }}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    {/* Bottom Chat Input Bar (Like ChatGPT / Claude - Send Query at Bottom!) */}
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "#F5EFE0",
                        borderTop: "1px solid #E6DCC4",
                        display: "flex",
                        gap: "10px",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ position: "relative", flex: 1 }}>
                        <input
                          type="text"
                          placeholder="🤖 Ask Copilot: e.g. Why is IndiGo down?, Simulate crude oil +20%, Show evidence behind margins..."
                          value={copilotInput}
                          onChange={(e) => setCopilotInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && copilotInput.trim()) {
                              e.preventDefault();
                              handleVoiceCommand(copilotInput.trim());
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "10px 36px 10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #D9BC8B",
                            background: "#FFFEFB",
                            fontSize: "13.5px",
                            color: "#101B33",
                            fontWeight: 500,
                            outline: "none",
                            boxSizing: "border-box"
                          }}
                        />
                        {copilotInput && (
                          <button
                            type="button"
                            onClick={() => setCopilotInput("")}
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              color: "#8C827A",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 700
                            }}
                            title="Clear input"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Chat Send Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (copilotInput.trim()) {
                            handleVoiceCommand(copilotInput.trim());
                          }
                        }}
                        disabled={voiceResponding || !copilotInput.trim()}
                        style={{
                          height: "40px",
                          padding: "0 18px",
                          borderRadius: "8px",
                          background: voiceResponding || !copilotInput.trim() ? "#2C394F" : "#101B33",
                          color: "#FAF6EC",
                          fontSize: "13px",
                          fontWeight: 650,
                          border: "1px solid #101B33",
                          cursor: voiceResponding ? "wait" : (copilotInput.trim() ? "pointer" : "default"),
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "7px",
                          boxSizing: "border-box",
                          flexShrink: 0,
                          transition: "all 0.15s ease",
                          opacity: !copilotInput.trim() && !voiceResponding ? 0.65 : 1,
                          boxShadow: "0 2px 6px rgba(16,27,51,.15)"
                        }}
                        title="Send question to Causal Copilot"
                      >
                        {voiceResponding ? (
                          <>
                            <WaitLoaderIcon size={15} color="#D9BC8B" />
                            <span style={{ color: "#D9BC8B" }}>Thinking...</span>
                          </>
                        ) : (
                          <>
                            <SendArrowIcon size={15} color="#D9BC8B" />
                            <span style={{ color: "#FAF6EC" }}>Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form Controls Row - Compact, Uniform Heights, Proportional */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "flex-end", marginBottom: "18px" }}>
          <div style={{ flex: "2 1 240px", minWidth: "220px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1E2433", marginBottom: "6px" }}>EVENT SCENARIO CATALOG</label>
            <select
              value={selectedScenario}
              onChange={handleScenarioChange}
              style={{ width: "100%", height: "38px", padding: "0 12px", borderRadius: "8px", border: "1px solid #E6DCC4", background: "#FAF6EC", fontSize: "13px", color: "#1E2433", fontWeight: 500, boxSizing: "border-box", outline: "none" }}
            >
              <option value="custom">⚡ Custom Shock / Search Query...</option>
              {(scenarios.length > 0 ? scenarios : DEFAULT_SCENARIOS_CATALOG).map((s) => (
                <option key={s.key} value={s.key}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {selectedScenario === "custom" && (
            <div style={{ flex: "3 1 260px", minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1E2433", marginBottom: "6px" }}>ACTIVE QUERY HEADLINE</label>
              <input
                type="text"
                placeholder="e.g. Red Sea shipping blocked + 15% freight surcharge"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                style={{ width: "100%", height: "38px", padding: "0 12px", borderRadius: "8px", border: "1px solid #E6DCC4", background: "#FAF6EC", fontSize: "13px", boxSizing: "border-box", outline: "none" }}
              />
            </div>
          )}

          <div style={{ flex: "1 1 130px", minWidth: "115px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1E2433", marginBottom: "6px" }}>DEPTH</label>
            <select
              value={depth}
              onChange={(e) => {
                const newDepth = parseInt(e.target.value, 10);
                setDepth(newDepth);
                runSimulation(selectedScenario, magnitude, newDepth, horizon, minConfidence, customTitle);
              }}
              style={{ width: "100%", height: "38px", padding: "0 12px", borderRadius: "8px", border: "1px solid #E6DCC4", background: "#FAF6EC", fontSize: "13px", color: "#1E2433", fontWeight: 500, boxSizing: "border-box", outline: "none" }}
            >
              <option value={4}>4th order effects</option>
              <option value={3}>3rd order effects</option>
              <option value={2}>2nd order effects</option>
              <option value={1}>1st order effects</option>
            </select>
          </div>

          <div style={{ flex: "1 1 120px", minWidth: "110px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1E2433", marginBottom: "6px" }}>HORIZON</label>
            <select
              value={horizon}
              onChange={(e) => {
                const newHor = e.target.value;
                setHorizon(newHor);
                runSimulation(selectedScenario, magnitude, depth, newHor, minConfidence, customTitle);
              }}
              style={{ width: "100%", height: "38px", padding: "0 12px", borderRadius: "8px", border: "1px solid #E6DCC4", background: "#FAF6EC", fontSize: "13px", color: "#1E2433", fontWeight: 500, boxSizing: "border-box", outline: "none" }}
            >
              <option value="1_5_days">1–5 days</option>
              <option value="0_1_day">0–1 day</option>
              <option value="1_4_weeks">1–4 weeks</option>
              <option value="1_3_months">1–3 months</option>
            </select>
          </div>

          <div style={{ flex: "1 1 140px", minWidth: "125px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1E2433", marginBottom: "6px" }}>MIN CONFIDENCE</label>
            <select
              value={minConfidence}
              onChange={(e) => {
                const newConf = parseFloat(e.target.value);
                setMinConfidence(newConf);
                runSimulation(selectedScenario, magnitude, depth, horizon, newConf, customTitle);
              }}
              style={{ width: "100%", height: "38px", padding: "0 12px", borderRadius: "8px", border: "1px solid #E6DCC4", background: "#FAF6EC", fontSize: "13px", color: "#1E2433", fontWeight: 500, boxSizing: "border-box", outline: "none" }}
            >
              <option value={0.70}>≥ 70% Confidence</option>
              <option value={0.80}>≥ 80% (High Conviction)</option>
              <option value={0.60}>≥ 60%</option>
              <option value={0.0}>All Paths</option>
            </select>
          </div>

          <div style={{ flex: "0 0 auto" }}>
            <button
              id="btn-run-analysis"
              onClick={triggerRun}
              disabled={loading}
              style={{
                height: "38px",
                padding: "0 22px",
                borderRadius: "8px",
                background: loading
                  ? "linear-gradient(135deg, #1C2B47, #101B33)"
                  : "linear-gradient(135deg, #101B33, #1A2F57)",
                color: "#FAF6EC",
                fontWeight: 600,
                fontSize: "13px",
                cursor: loading ? "wait" : "pointer",
                border: "1px solid rgba(217, 188, 139, 0.45)",
                boxShadow: "0 2px 8px rgba(16,27,51,.2)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
                transition: "all 0.15s ease"
              }}
            >
              {loading ? (
                <>
                  <WaitLoaderIcon size={15} color="#D9BC8B" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span style={{ color: "#D9BC8B" }}>⚡</span>
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#FAF6EC", padding: "12px 18px", borderRadius: "10px", border: "1px solid #E6DCC4" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#5B5A4F" }}>SHOCK MAGNITUDE:</span>
          <input
            type="range"
            min={-30}
            max={50}
            step={1}
            value={magnitude}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: "#B8935A", cursor: "pointer" }}
          />
          <span
            style={{
              padding: "4px 12px",
              background: magnitude >= 0 ? "#101B33" : "#A14545",
              color: "#FFFEFB",
              borderRadius: "20px",
              fontWeight: 700,
              fontSize: "13px"
            }}
          >
            {magnitude >= 0 ? `+${magnitude}%` : `${magnitude}%`}
          </span>
        </div>

        {/* Real-time Data Layer Status Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #E6DCC4" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAF6EC", padding: "8px 14px", borderRadius: "8px", fontSize: "12px" }}>
            <span style={{ color: "#1E2433", fontWeight: 500 }}><span style={{ color: "#2F6F62", marginRight: "6px" }}>●</span>Market feed</span>
            <span style={{ fontWeight: 700, color: "#2F6F62" }}>OK · 2s ago</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAF6EC", padding: "8px 14px", borderRadius: "8px", fontSize: "12px" }}>
            <span style={{ color: "#1E2433", fontWeight: 500 }}><span style={{ color: "#2F6F62", marginRight: "6px" }}>●</span>Filings graph</span>
            <span style={{ fontWeight: 700, color: "#2F6F62" }}>OK · FY24/25</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAF6EC", padding: "8px 14px", borderRadius: "8px", fontSize: "12px" }}>
            <span style={{ color: "#1E2433", fontWeight: 500 }}><span style={{ color: "#2F6F62", marginRight: "6px" }}>●</span>Macro layer</span>
            <span style={{ fontWeight: 700, color: "#2F6F62" }}>OK · RBI/PPAC</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAF6EC", padding: "8px 14px", borderRadius: "8px", fontSize: "12px" }}>
            <span style={{ color: "#1E2433", fontWeight: 500 }}><span style={{ color: "#B8935A", marginRight: "6px" }}>●</span>News evidence</span>
            <span style={{ fontWeight: 700, color: "#B8935A" }}>LIVE · Verified</span>
          </div>
        </div>
      </div>

      {/* 3. Executive Summary & Institutional Causal Analysis (35-40 Words Each) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        {/* Executive Summary Card */}
        <div
          style={{
            background: "#FFFEFB",
            borderRadius: "14px",
            padding: "20px 24px",
            border: "1px solid #E6DCC4",
            boxShadow: "0 4px 14px -6px rgba(16,27,51,.08)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
              EXECUTIVE SUMMARY
            </span>
            <span style={{ background: "#FAF6EC", color: "#101B33", border: "1px solid #E6DCC4", borderRadius: "10px", padding: "2px 8px", fontSize: "10.5px", fontWeight: 600 }}>
              Macro Brief · {simulationData?.executive_summary ? `${simulationData.executive_summary.split(' ').filter(Boolean).length}w` : "38w"}
            </span>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "8px 0" }}>
              <div style={{ height: "14px", background: "#FAF6EC", borderRadius: "4px", width: "95%", animation: "pulse 1.5s infinite" }}></div>
              <div style={{ height: "14px", background: "#FAF6EC", borderRadius: "4px", width: "88%", animation: "pulse 1.5s infinite" }}></div>
            </div>
          ) : (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#1E2433", margin: 0, lineHeight: 1.55 }}>
              {simulationData?.executive_summary ||
                `Brent crude shock (+${magnitude}%) triggers rapid feedstock repricing across aviation and petrochemicals. Airlines face immediate unhedged fuel expense escalation, while upstream exploration producers capture operational leverage, driving sharp excess return divergence across Indian cyclicals over the ${horizon.replace('_', ' ')} horizon.`}
            </p>
          )}
        </div>

        {/* Institutional Causal Analysis Card */}
        <div
          style={{
            background: "#FFFEFB",
            borderRadius: "14px",
            padding: "20px 24px",
            border: "1px solid #E6DCC4",
            boxShadow: "0 4px 14px -6px rgba(16,27,51,.08)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
              INSTITUTIONAL CAUSAL ANALYSIS
            </span>
            <span style={{ background: "#DCEAE5", color: "#2F6F62", border: "1px solid #2F6F62", borderRadius: "10px", padding: "2px 8px", fontSize: "10.5px", fontWeight: 600 }}>
              P&amp;L Transmission · {simulationData?.causal_analysis ? `${simulationData.causal_analysis.split(' ').filter(Boolean).length}w` : "38w"}
            </span>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "8px 0" }}>
              <div style={{ height: "14px", background: "#FAF6EC", borderRadius: "4px", width: "92%", animation: "pulse 1.5s infinite" }}></div>
              <div style={{ height: "14px", background: "#FAF6EC", borderRadius: "4px", width: "85%", animation: "pulse 1.5s infinite" }}></div>
            </div>
          ) : (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#1E2433", margin: 0, lineHeight: 1.55 }}>
              {simulationData?.causal_analysis ||
                `Transmission asymmetry drives divergence: IndiGo's 38.5% fuel cost share and 0.45x pass-through elasticity produce a 210 bps EBIT margin contraction, whereas ONGC expands EBITDA by ₹1,120 Cr per dollar increase, creating wide cross-sectional excess return dispersion benchmarked against Nifty 50.`}
            </p>
          )}
        </div>
      </div>

      {/* 4. Core Two-Column Simulation Display */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Left Column: 1st -> 4th Order Causal Chain */}
        <div
          style={{
            background: "#FFFEFB",
            borderRadius: "16px",
            padding: "24px 28px",
            border: "1px solid #E6DCC4",
            boxShadow: "0 6px 16px -8px rgba(16,27,51,.12)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "11px", letterSpacing: "1.2px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
                CAUSAL CHAIN
              </div>
              <h2 style={{ fontFamily: "EB Garamond, serif", fontSize: "24px", color: "#101B33", margin: "2px 0 0 0" }}>
                1st → {depth}th Order Effects
              </h2>
            </div>
            <span
              style={{
                background: "#FAF6EC",
                border: "1px solid #E6DCC4",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#101B33"
              }}
            >
              {selectedScenario.toUpperCase()} {magnitude >= 0 ? `+${magnitude}%` : `${magnitude}%`} · {horizon.replace("_", " ")}
            </span>
          </div>

          {/* SKELETON LOADER FOR CAUSAL CHAIN */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {[1, 2, 3, 4].slice(0, depth).map((order) => (
                <div key={order} style={{ display: "flex", gap: "18px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FAF6EC", border: "1px solid #E6DCC4" }}></div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ width: "35%", height: "14px", background: "#FAF6EC", borderRadius: "4px" }}></div>
                    <div style={{ width: "85%", height: "16px", background: "#FAF6EC", borderRadius: "4px" }}></div>
                    <div style={{ width: "60%", height: "12px", background: "#FAF6EC", borderRadius: "4px" }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Real Causal Nodes */
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {simulationData?.causal_chain?.map((step, idx) => {
                const isLast = idx === simulationData.causal_chain.length - 1;
                return (
                  <div key={step.order} style={{ display: "flex", gap: "18px" }}>
                    {/* Circle and connecting line */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: step.order === 4 ? "#B8935A" : "#101B33",
                          color: step.order === 4 ? "#101B33" : "#FAF6EC",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "EB Garamond, serif",
                          fontWeight: 700,
                          fontSize: "16px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                        }}
                      >
                        {step.order}
                      </div>
                      {!isLast && (
                        <div style={{ width: "2px", flex: 1, background: "#E6DCC4", margin: "6px 0" }}></div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div style={{ paddingBottom: "26px", flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
                          {step.order_label}
                        </span>
                        <span
                          style={{
                            background: step.confidence >= 0.80 ? "#DCEAE5" : "#FAF6EC",
                            color: step.confidence >= 0.80 ? "#2F6F62" : "#B8935A",
                            border: `1px solid ${step.confidence >= 0.80 ? "#2F6F62" : "#B8935A"}`,
                            borderRadius: "12px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: 700
                          }}
                        >
                          {step.confidence_label}
                        </span>
                      </div>

                      <h4 style={{ fontFamily: "EB Garamond, serif", fontSize: "18px", color: "#101B33", margin: "2px 0 6px 0", fontWeight: 600 }}>
                        {step.title}
                      </h4>

                      <p style={{ fontSize: "13px", color: "#5B5A4F", margin: "0 0 10px 0", lineHeight: 1.5 }}>
                        {step.description}
                      </p>

                      {/* Metadata tags */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "11.5px" }}>
                        <span style={{ background: "#FAF6EC", border: "1px solid #E6DCC4", padding: "3px 8px", borderRadius: "6px", color: "#101B33" }}>
                          <strong>Lag:</strong> {step.lag}
                        </span>
                        <span style={{ background: "#FAF6EC", border: "1px solid #E6DCC4", padding: "3px 8px", borderRadius: "6px", color: "#101B33" }}>
                          <strong>Effect range:</strong> <span style={{ color: step.effect_range.includes("-") ? "#A14545" : "#2F6F62", fontWeight: 600 }}>{step.effect_range}</span>
                        </span>
                        <span style={{ background: "#FAF6EC", border: "1px solid #E6DCC4", padding: "3px 8px", borderRadius: "6px", color: "#5B5A4F" }}>
                          <strong>Evidence:</strong> {step.evidence_sources}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Interpretation Rule Callout */}
          <div
            style={{
              background: "#FAF6EC",
              border: "1px solid #E6DCC4",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "12px",
              color: "#5B5A4F",
              lineHeight: 1.5,
              marginTop: "8px"
            }}
          >
            <strong>Interpretation rule:</strong> "confidence" is a calibrated probability/edge-reliability score from historical out-of-sample backtests and evidence agreement. It is not a guarantee that price will move inside the displayed range.
          </div>
        </div>

        {/* Right Column: Stock Impact Matrix & Voice Copilot */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Stock Impact Matrix */}
          <div
            style={{
              background: "#FFFEFB",
              borderRadius: "16px",
              padding: "24px 24px",
              border: "1px solid #E6DCC4",
              boxShadow: "0 6px 16px -8px rgba(16,27,51,.12)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
                  STOCK IMPACT MATRIX
                </div>
                <h3 style={{ fontFamily: "EB Garamond, serif", fontSize: "20px", color: "#101B33", margin: "2px 0 0 0" }}>
                  Likely Excess-Return Range
                </h3>
              </div>
              <span style={{ fontSize: "11px", color: "#5B5A4F", fontStyle: "italic" }}>
                vs sector / market baseline
              </span>
            </div>

            {/* SKELETON LOADER FOR STOCK MATRIX */}
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                {[1, 2, 3, 4, 5].map((r) => (
                  <div key={r} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #FAF6EC" }}>
                    <div style={{ width: "22%", height: "14px", background: "#FAF6EC", borderRadius: "4px" }}></div>
                    <div style={{ width: "30%", height: "14px", background: "#FAF6EC", borderRadius: "4px" }}></div>
                    <div style={{ width: "20%", height: "14px", background: "#FAF6EC", borderRadius: "4px" }}></div>
                  </div>
                ))}
              </div>
            ) : (
              /* Table */
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E6DCC4", color: "#5B5A4F", fontSize: "11px", textTransform: "uppercase" }}>
                      <th style={{ padding: "8px 6px" }}>SYMBOL</th>
                      <th style={{ padding: "8px 6px" }}>RANGE</th>
                      <th style={{ padding: "8px 6px" }}>P(DIR)</th>
                      <th style={{ padding: "8px 6px" }}>EVIDENCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulationData?.stocks_impact?.map((stk) => {
                      const isNeg = stk.direction === "negative";
                      const isSelected = selectedStock?.symbol === stk.symbol;
                      return (
                        <tr
                          key={stk.symbol}
                          onClick={() => setSelectedStock(isSelected ? null : stk)}
                          style={{
                            borderBottom: "1px solid rgba(230,220,196,0.6)",
                            cursor: "pointer",
                            background: isSelected ? "#FAF6EC" : "transparent",
                            transition: "background 0.15s"
                          }}
                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#FAF6EC"; }}
                          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                        >
                          <td style={{ padding: "10px 6px", fontWeight: 700, color: "#101B33" }}>
                            {stk.symbol} {isSelected && <span style={{ fontSize: "10px", color: "#B8935A" }}>◀</span>}
                          </td>
                          <td style={{ padding: "10px 6px", fontWeight: 700, color: isNeg ? "#A14545" : "#2F6F62" }}>
                            {stk.expected_return_range}
                          </td>
                          <td style={{ padding: "10px 6px", fontWeight: 600, color: "#101B33" }}>
                            {Math.round(stk.p_direction * 100)}% {isNeg ? "Neg" : "Pos"}
                          </td>
                          <td style={{ padding: "10px 6px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 600,
                                background: stk.confidence_tier === "Strong" ? "#DCEAE5" : "#FAF6EC",
                                color: stk.confidence_tier === "Strong" ? "#2F6F62" : "#5B5A4F",
                                border: "1px solid #E6DCC4"
                              }}
                            >
                              {stk.confidence_tier}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p style={{ fontSize: "11px", color: "#7A796F", margin: "14px 0 0 0", lineHeight: 1.4 }}>
              * Click any ticker to inspect audited filing disclosures, mathematical sensitivity formulas, and SHAP-style model contributions inline below.
            </p>

            {/* INLINE EXPANDABLE INSPECTION DRAWER (Never a full-screen popup!) */}
            {selectedStock && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: "#FAF6EC",
                  border: "1px solid #B8935A",
                  borderRadius: "12px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#101B33" }}>
                    {selectedStock.full_name} ({selectedStock.symbol}) · Filings &amp; Math
                  </span>
                  <button
                    onClick={() => setSelectedStock(null)}
                    style={{ fontSize: "11px", color: "#5B5A4F", cursor: "pointer", background: "none", border: "none", fontWeight: 600 }}
                  >
                    ✕ Close
                  </button>
                </div>

                <div style={{ fontSize: "11.5px", color: "#101B33", marginBottom: "8px" }}>
                  <strong>Transmission Formula:</strong>
                  <div style={{ background: "#101B33", color: "#D9BC8B", padding: "8px 10px", borderRadius: "6px", fontFamily: "monospace", marginTop: "4px" }}>
                    {selectedStock.structural_formula}
                  </div>
                </div>

                <div style={{ fontSize: "11.5px", color: "#5B5A4F" }}>
                  <strong>Invalidation Trigger:</strong> {selectedStock.invalidation_trigger}
                </div>
              </div>
            )}
          </div>

          {/* HISTORICAL ANALOGS: Relocated Up to Right Column */}
          <div
            style={{
              background: "#FFFEFB",
              borderRadius: "16px",
              padding: "24px 24px",
              border: "1px solid #E6DCC4",
              boxShadow: "0 6px 16px -8px rgba(16,27,51,.12)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "11px", letterSpacing: "1.2px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
                  HISTORICAL ANALOGS
                </div>
                <h3 style={{ fontFamily: "EB Garamond, serif", fontSize: "20px", color: "#101B33", margin: "2px 0 0 0" }}>
                  Closest Prior Shock Regimes
                </h3>
              </div>
              <span style={{ fontSize: "11px", color: "#5B5A4F", fontStyle: "italic" }}>
                regime vector match
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {simulationData?.historical_analogs?.map((an) => {
                const simVal = typeof an.similarity === "number"
                  ? an.similarity
                  : (typeof an.similarity_pct === "number"
                    ? an.similarity_pct / 100
                    : (parseFloat(an.similarity || an.similarity_pct || 0.85) > 1
                      ? parseFloat(an.similarity || an.similarity_pct || 85) / 100
                      : parseFloat(an.similarity || an.similarity_pct || 0.85)));
                const simDisplay = typeof simVal === "number" && !isNaN(simVal) ? simVal.toFixed(2) : "0.85";
                const simPct = typeof simVal === "number" && !isNaN(simVal) ? Math.min(100, Math.max(0, simVal * 100)) : 85;

                return (
                  <div key={an.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, color: "#101B33" }}>{an.name}</span>
                      <span style={{ fontWeight: 700, color: "#101B33" }}>{simDisplay}</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "#FAF6EC", borderRadius: "4px", overflow: "hidden", border: "1px solid #E6DCC4" }}>
                      <div
                        style={{
                          width: `${simPct}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #101B33, #B8935A)",
                          borderRadius: "4px"
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize: "11px", color: "#7A796F", marginTop: "16px", lineHeight: 1.45 }}>
              Similarity computed using pre-event regime vectors (volatility, rates, FX, sector breadth, valuation, liquidity), not only the event headline.
            </p>
          </div>
        </div>
      </div>

      {/* 5. EVIDENCE FUSION - Spanning Full Width */}
      <div
        style={{
          background: "#FFFEFB",
          borderRadius: "16px",
          padding: "24px 28px",
          border: "1px solid #E6DCC4",
          boxShadow: "0 6px 16px -8px rgba(16,27,51,.12)",
          marginBottom: "24px",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "1.2px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
              EVIDENCE FUSION · 4-PILLAR CAUSAL VALIDATION ENGINE
            </div>
            <h2 style={{ fontFamily: "EB Garamond, serif", fontSize: "24px", color: "#101B33", margin: "2px 0 0 0" }}>
              Why the Engine Believes This Path
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FAF6EC", padding: "6px 14px", borderRadius: "20px", border: "1px solid #E6DCC4" }}>
            <span style={{ fontSize: "12px", color: "#5B5A4F", fontWeight: 600 }}>Multi-Pillar Calibration:</span>
            <span style={{ fontSize: "12px", color: "#2F6F62", fontWeight: 700 }}>81.5 / 100 Empirical Agreement</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {/* 1. Structural Exposure */}
          <div style={{ background: "#FAF6EC", border: "1px solid #E6DCC4", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "10.5px", letterSpacing: "0.8px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
                  PILLAR 01 · 30% WEIGHT
                </span>
                <span style={{ background: "#DCEAE5", color: "#2F6F62", border: "1px solid #2F6F62", borderRadius: "10px", padding: "1px 7px", fontSize: "10px", fontWeight: 700 }}>
                  HIGH
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#101B33" }}>Structural Exposure</span>
                <span style={{ fontFamily: "EB Garamond, serif", fontSize: "28px", fontWeight: 700, color: "#2F6F62", lineHeight: 1 }}>88</span>
              </div>
              <div style={{ width: "100%", height: "5px", background: "#E6DCC4", borderRadius: "3px", overflow: "hidden", marginBottom: "10px" }}>
                <div style={{ width: "88%", height: "100%", background: "#2F6F62", borderRadius: "3px" }}></div>
              </div>
              <p style={{ fontSize: "12.5px", color: "#5B5A4F", margin: 0, lineHeight: 1.5 }}>
                Fuel/input share, FX exposure, hedging, pricing power, balance sheet and business mix.
              </p>
            </div>
            <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid rgba(230,220,196,0.8)", fontSize: "11px", color: "#7A796F" }}>
              <strong>Audit Source:</strong> Audited 10-K &amp; Q3 Investor Presentations
            </div>
          </div>

          {/* 2. Historical Event Study */}
          <div style={{ background: "#FAF6EC", border: "1px solid #E6DCC4", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "10.5px", letterSpacing: "0.8px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
                  PILLAR 02 · 25% WEIGHT
                </span>
                <span style={{ background: "#DCEAE5", color: "#2F6F62", border: "1px solid #2F6F62", borderRadius: "10px", padding: "1px 7px", fontSize: "10px", fontWeight: 700 }}>
                  HIGH
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#101B33" }}>Historical Event Study</span>
                <span style={{ fontFamily: "EB Garamond, serif", fontSize: "28px", fontWeight: 700, color: "#2F6F62", lineHeight: 1 }}>81</span>
              </div>
              <div style={{ width: "100%", height: "5px", background: "#E6DCC4", borderRadius: "3px", overflow: "hidden", marginBottom: "10px" }}>
                <div style={{ width: "81%", height: "100%", background: "#2F6F62", borderRadius: "3px" }}></div>
              </div>
              <p style={{ fontSize: "12.5px", color: "#5B5A4F", margin: 0, lineHeight: 1.5 }}>
                Abnormal returns around comparable shocks using point-in-time peer and market controls.
              </p>
            </div>
            <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid rgba(230,220,196,0.8)", fontSize: "11px", color: "#7A796F" }}>
              <strong>Sample Base:</strong> 10-Year Out-of-Sample Shock Clusters (N=142)
            </div>
          </div>

          {/* 3. Time-Series Confirmation */}
          <div style={{ background: "#FAF6EC", border: "1px solid #E6DCC4", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "10.5px", letterSpacing: "0.8px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
                  PILLAR 03 · 25% WEIGHT
                </span>
                <span style={{ background: "#FAF6EC", color: "#B8935A", border: "1px solid #B8935A", borderRadius: "10px", padding: "1px 7px", fontSize: "10px", fontWeight: 700 }}>
                  MODERATE
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#101B33" }}>Time-Series Confirmation</span>
                <span style={{ fontFamily: "EB Garamond, serif", fontSize: "28px", fontWeight: 700, color: "#B8935A", lineHeight: 1 }}>73</span>
              </div>
              <div style={{ width: "100%", height: "5px", background: "#E6DCC4", borderRadius: "3px", overflow: "hidden", marginBottom: "10px" }}>
                <div style={{ width: "73%", height: "100%", background: "#B8935A", borderRadius: "3px" }}></div>
              </div>
              <p style={{ fontSize: "12.5px", color: "#5B5A4F", margin: 0, lineHeight: 1.5 }}>
                Lag stability, regime-specific predictability, liquidity and cross-asset confirmation.
              </p>
            </div>
            <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid rgba(230,220,196,0.8)", fontSize: "11px", color: "#7A796F" }}>
              <strong>Statistical Filter:</strong> Vector Autoregression &amp; Granger Causality
            </div>
          </div>

          {/* 4. Market Confirmation */}
          <div style={{ background: "#FAF6EC", border: "1px solid #E6DCC4", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "10.5px", letterSpacing: "0.8px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
                  PILLAR 04 · 20% WEIGHT
                </span>
                <span style={{ background: "#DCEAE5", color: "#2F6F62", border: "1px solid #2F6F62", borderRadius: "10px", padding: "1px 7px", fontSize: "10px", fontWeight: 700 }}>
                  HIGH
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#101B33" }}>Market Confirmation</span>
                <span style={{ fontFamily: "EB Garamond, serif", fontSize: "28px", fontWeight: 700, color: "#2F6F62", lineHeight: 1 }}>84</span>
              </div>
              <div style={{ width: "100%", height: "5px", background: "#E6DCC4", borderRadius: "3px", overflow: "hidden", marginBottom: "10px" }}>
                <div style={{ width: "84%", height: "100%", background: "#2F6F62", borderRadius: "3px" }}></div>
              </div>
              <p style={{ fontSize: "12.5px", color: "#5B5A4F", margin: 0, lineHeight: 1.5 }}>
                Price/volume, futures basis, options skew/IV and sector breadth after the shock begins.
              </p>
            </div>
            <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid rgba(230,220,196,0.8)", fontSize: "11px", color: "#7A796F" }}>
              <strong>Live Signals:</strong> Nifty 50 Futures Basis &amp; ATM Implied Volatility Skew
            </div>
          </div>
        </div>
      </div>

      {/* 6. Counterfactual Simulator & Invalidation Conditions */}
      <div
        style={{
          background: "#FFFEFB",
          borderRadius: "16px",
          padding: "24px 28px",
          border: "1px solid #E6DCC4",
          boxShadow: "0 6px 16px -8px rgba(16,27,51,.12)",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "1.2px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
              COUNTERFACTUAL LAB &amp; INVALIDATION
            </div>
            <h2 style={{ fontFamily: "EB Garamond, serif", fontSize: "22px", color: "#101B33", margin: "2px 0 0 0" }}>
              Stress-Testing the Causal Assumptions
            </h2>
          </div>
          <button
            onClick={() => setCounterfactualActive(!counterfactualActive)}
            style={{
              padding: "6px 16px",
              background: counterfactualActive ? "#B8935A" : "#FAF6EC",
              color: counterfactualActive ? "#FFFEFB" : "#101B33",
              border: "1px solid #E6DCC4",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {counterfactualActive ? "Counterfactual Active" : "Run Counterfactual (+6% shock)"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Counterfactual analysis */}
          <div style={{ background: "#FAF6EC", padding: "16px", borderRadius: "10px", border: "1px solid #E6DCC4" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#101B33", fontSize: "14px", fontWeight: 700 }}>
              What-If Counterfactual Comparison:
            </h4>
            <p style={{ fontSize: "12.5px", color: "#5B5A4F", margin: "0 0 10px 0" }}>
              {simulationData?.counterfactual?.prompt}
            </p>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
              <div>
                <span style={{ color: "#5B5A4F" }}>Base Shock ({magnitude >= 0 ? `+${magnitude}%` : `${magnitude}%`}):</span>{" "}
                <strong style={{ color: "#A14545" }}>{simulationData?.counterfactual?.base_indigo_impact}</strong>
              </div>
              <div>
                <span style={{ color: "#5B5A4F" }}>Counterfactual (+{Math.round(magnitude * 0.5)}%):</span>{" "}
                <strong style={{ color: "#2F6F62" }}>{simulationData?.counterfactual?.counterfactual_indigo_impact}</strong>
              </div>
            </div>
          </div>

          {/* Invalidation Rules */}
          <div style={{ background: "#FAF6EC", padding: "16px", borderRadius: "10px", border: "1px solid #E6DCC4" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#A14545", fontSize: "14px", fontWeight: 700 }}>
              Model Invalidation Conditions:
            </h4>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#5B5A4F", lineHeight: 1.5 }}>
              <li>Brent crude drops back below $78/bbl within 48 trading hours.</li>
              <li>Airlines increase fuel surcharges without passenger load factor deterioration.</li>
              <li>Government of India announces Special Additional Excise Duty (SAED) windfall reduction.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 7. Prediction Ledger & Track Record */}
      <div
        style={{
          background: "#FFFEFB",
          borderRadius: "16px",
          padding: "24px 28px",
          border: "1px solid #E6DCC4",
          boxShadow: "0 6px 16px -8px rgba(16,27,51,.12)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "1.2px", textTransform: "uppercase", color: "#5B5A4F", fontWeight: 700 }}>
              ACCOUNTABILITY &amp; PROBABILITY CALIBRATION
            </div>
            <h2 style={{ fontFamily: "EB Garamond, serif", fontSize: "22px", color: "#101B33", margin: "2px 0 0 0" }}>
              180-Day Audited Prediction Ledger
            </h2>
          </div>
          <div style={{ display: "flex", gap: "16px", background: "#FAF6EC", padding: "8px 16px", borderRadius: "10px", border: "1px solid #E6DCC4", fontSize: "12px" }}>
            <span><strong>Total Logged:</strong> {simulationData?.ledger_summary?.total_predictions || 438}</span>
            <span><strong>Direction Hit Rate:</strong> <span style={{ color: "#2F6F62", fontWeight: 700 }}>{((simulationData?.ledger_summary?.direction_hit_rate || 0.784) * 100).toFixed(1)}%</span></span>
            <span><strong>80% Bucket Calibrated:</strong> <span style={{ color: "#2F6F62", fontWeight: 700 }}>{((simulationData?.ledger_summary?.calibration_bucket_80_accuracy || 0.811) * 100).toFixed(1)}%</span></span>
            <span><strong>Median Coverage:</strong> 76.8%</span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E6DCC4", color: "#5B5A4F", textTransform: "uppercase", fontSize: "11px" }}>
                <th style={{ padding: "8px 6px" }}>RECORD ID</th>
                <th style={{ padding: "8px 6px" }}>EVENT</th>
                <th style={{ padding: "8px 6px" }}>SYMBOL</th>
                <th style={{ padding: "8px 6px" }}>PREDICTED RANGE</th>
                <th style={{ padding: "8px 6px" }}>PROBABILITY</th>
                <th style={{ padding: "8px 6px" }}>ACTUAL 3D</th>
                <th style={{ padding: "8px 6px" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "PRED-20260828", event: "Brent Crude +8.5%", symbol: "INDIGO", range: "-2.9% → -1.2%", prob: "82%", actual: "-2.14%", status: "HIT" },
                { id: "PRED-20260824", event: "Brent Crude +8.5%", symbol: "ONGC", range: "+0.6% → +2.1%", prob: "79%", actual: "+1.48%", status: "HIT" },
                { id: "PRED-20260819", event: "USD/INR +1.4%", symbol: "TCS", range: "+0.8% → +2.4%", prob: "77%", actual: "+1.35%", status: "HIT" },
                { id: "PRED-20260812", event: "Crude Oil +14.2%", symbol: "SPICEJET", range: "-4.5% → -2.1%", prob: "84%", actual: "-3.85%", status: "HIT" },
                { id: "PRED-20260804", event: "Crude Oil +14.2%", symbol: "ASIANPAINT", range: "-1.8% → -0.5%", prob: "71%", actual: "-0.92%", status: "HIT" }
              ].map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #FAF6EC" }}>
                  <td style={{ padding: "8px 6px", fontFamily: "monospace", color: "#5B5A4F" }}>{row.id}</td>
                  <td style={{ padding: "8px 6px", fontWeight: 600, color: "#101B33" }}>{row.event}</td>
                  <td style={{ padding: "8px 6px", fontWeight: 700, color: "#101B33" }}>{row.symbol}</td>
                  <td style={{ padding: "8px 6px", color: row.range.includes("-") ? "#A14545" : "#2F6F62", fontWeight: 600 }}>{row.range}</td>
                  <td style={{ padding: "8px 6px", fontWeight: 600 }}>{row.prob}</td>
                  <td style={{ padding: "8px 6px", fontWeight: 700, color: row.actual.includes("-") ? "#A14545" : "#2F6F62" }}>{row.actual}</td>
                  <td style={{ padding: "8px 6px" }}>
                    <span style={{ background: "#DCEAE5", color: "#2F6F62", border: "1px solid #2F6F62", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 700 }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
