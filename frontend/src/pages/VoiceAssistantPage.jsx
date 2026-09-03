import React, { useState, useRef, useEffect } from "react";
import { useVoiceAgent } from "../hooks/useVoiceAgent";

export default function VoiceAssistantPage({ openAssistant }) {
  const {
    isListening,
    isProcessing,
    isPlayingAudio,
    isContinuousMode,
    language,
    setLanguage,
    voiceGender,
    setVoiceGender,
    autoPlayAudio,
    setAutoPlayAudio,
    liveTranscript,
    messages,
    clearMessages,
    startListening,
    stopListening,
    submitQuery,
    playMessageAudio,
    stopAudioPlayback,
    toggleContinuousMode,
  } = useVoiceAgent();

  const [inputQuery, setInputQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [activeTicker, setActiveTicker] = useState(window.__SELECTED_STOCK_SYMBOL || "RELIANCE");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync active ticker from app events
  useEffect(() => {
    const handleStockChanged = (e) => {
      if (e.detail?.symbol) {
        setActiveTicker(e.detail.symbol);
      }
    };
    window.addEventListener("marketmind:stock_changed", handleStockChanged);
    return () => window.removeEventListener("marketmind:stock_changed", handleStockChanged);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    const q = inputQuery.trim();
    if (!q || isProcessing) return;
    setInputQuery("");
    submitQuery(q, false);
  };

  const handleQuickPrompt = (promptText) => {
    submitQuery(promptText, false);
  };

  const handleCopy = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to format bot markdown text cleanly
  const renderFormattedMessage = (text) => {
    if (!text) return null;
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.map((line, idx) => {
      const isBullet = line.startsWith("•") || line.startsWith("*") || line.startsWith("-");
      const cleanLine = isBullet ? line.replace(/^[\s•\*\-]+/, "").trim() : line;
      const parts = cleanLine.split(/(\*\*.*?\*\*)/);

      const content = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} style={{ fontWeight: 700, color: "var(--navy)" }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "3px" }}>
            <span style={{ color: "var(--gold)", fontSize: "13px", lineHeight: "17px", flexShrink: 0 }}>•</span>
            <span style={{ flex: 1 }}>{content}</span>
          </div>
        );
      }

      return (
        <p key={idx} style={{ margin: "3px 0", lineHeight: 1.5 }}>
          {content}
        </p>
      );
    });
  };

  const PREM_CHIPS = [
    { label: "Reliance Risk Check", query: "What is the 20-day VWAP, 95% VaR, and Order Book Imbalance of Reliance?" },
    { label: "Compare vs NIFTY 50", query: "Compare Reliance performance, alpha, and beta against the benchmark NIFTY 50." },
    { label: "Explain Today's Move", query: "Explain why Reliance and the broader NIFTY index are moving today with institutional drivers." },
    { label: "Forensic Cash Flow", query: "Does Reliance show any forensic cash flow divergence or earnings red flags?" },
    { label: "Valuation Snapshot", query: "What is the P/E ratio, ROCE, and fair value intrinsic valuation for Reliance?" },
  ];

  const STARTER_ACTION_CARDS = [
    {
      title: "Reliance 20D VWAP & 95% Daily VaR",
      desc: "Analyze institutional order book imbalance, support pivot & quantitative daily risk.",
      query: "What is the 20-day VWAP, 95% VaR, and Order Book Imbalance of Reliance?",
      icon: "⚡",
    },
    {
      title: "Tata Motors Tactical Buy/Sell Verdict",
      desc: "Tactical accumulation zone, target resistance & Risk-to-Reward ratio.",
      query: "Should I buy or sell Tata Motors at current levels and what is the risk-reward ratio?",
      icon: "📊",
    },
    {
      title: "Crude Oil +30% Domino Contagion",
      desc: "Supply chain margin ripple on Asian Paints & Aviation ATF costs.",
      query: "Crude oil 30% surge hone par Paint aur Aviation sectors par kya ripple effect hoga?",
      icon: "🛢️",
    },
    {
      title: "Forensic Cash Flow Divergence Audit",
      desc: "Reported PAT growth vs Operating Cash Flow audit & earnings red flags.",
      query: "Does Reliance show any forensic cash flow divergence or earnings red flags?",
      icon: "🚩",
    },
  ];

  return (
    <div className="prem-voice-container">
      {/* Sleek Non-Redundant Top Bar (No duplicate 02 / Voice Stock Assistant) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexShrink: 0 }}>
        <div style={{ fontSize: "13px", color: "var(--ink-soft)", fontWeight: 500 }}>
          Conversational equity research, valuation, risk and portfolio intelligence.
        </div>
        <div className="prem-status-badge">
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4cd964", display: "inline-block" }}></span>
          AI Engine Online · 43 ms
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="prem-voice-grid">
        {/* ================================================================= */}
        {/* LEFT COLUMN: MarketMind Copilot Card                              */}
        {/* ================================================================= */}
        <div className="prem-copilot-card">
          {/* Header */}
          <div className="prem-copilot-header">
            <div className="prem-copilot-title-group">
              <div className="prem-copilot-avatar">M</div>
              <div>
                <div className="prem-copilot-name">MarketMind Copilot</div>
                <div className="prem-copilot-meta">Indian Equities Intelligence · Live Market Context</div>
              </div>
            </div>

            <div className="prem-copilot-controls">
              <button
                type="button"
                className={`prem-pill-btn ${autoPlayAudio ? "active" : ""}`}
                onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                title={autoPlayAudio ? "Voice read-aloud active (Click to mute)" : "Voice read-aloud muted (Click to enable)"}
              >
                {autoPlayAudio ? "Voice ON" : "Voice OFF"}
              </button>

              <button
                type="button"
                className="prem-pill-btn"
                onClick={clearMessages}
                title="Reset conversation"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="prem-chat-stream">
            <div className="prem-session-tag">Live research session</div>

            {/* If no messages yet, show High-Level Copilot Launch Screen */}
            {messages.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Official Greeting Bubble */}
                <div className="prem-bot-bubble">
                  <div className="prem-msg-tag">MARKETMIND INTELLIGENCE</div>
                  <div className="prem-bot-body">
                    Hello. Ask me about any Indian stock, valuation, earnings, risk, sector comparison or portfolio impact.
                  </div>
                  <div className="prem-inner-lens">
                    Active context: {activeTicker} · NSE · market + fundamentals enabled.
                  </div>
                </div>

                {/* Interactive Real Quick-Action Prompts */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "4px" }}>
                  {STARTER_ACTION_CARDS.map((card, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleQuickPrompt(card.query)}
                      style={{
                        background: "#FAF6EC",
                        border: "1px solid #E6DCC4",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--gold)";
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#E6DCC4";
                        e.currentTarget.style.background = "#FAF6EC";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{card.icon}</span>
                        <span>{card.title}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--ink-soft)", lineHeight: 1.35 }}>
                        {card.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Real Live Conversation Stream */
              messages.map((msg) => (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  {msg.sender === "bot" ? (
                    <div className="prem-bot-bubble">
                      <div className="prem-msg-tag">{msg.tag || "MARKETMIND ANALYSIS"}</div>
                      <div className="prem-bot-body">{renderFormattedMessage(msg.text)}</div>

                      {/* Decision lens callout */}
                      <div className="prem-inner-lens">
                        {msg.contextLens || "Decision lens: Moderate Risk · Trend Positive · Entry should be judged against valuation, earnings growth and expected upside."}
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
                        <button
                          type="button"
                          className="prem-pill-btn"
                          style={{ fontSize: "10.5px", padding: "2px 8px" }}
                          onClick={() => playMessageAudio(msg)}
                        >
                          🔊 Listen
                        </button>
                        <button
                          type="button"
                          className="prem-pill-btn"
                          style={{ fontSize: "10.5px", padding: "2px 8px" }}
                          onClick={() => handleCopy(msg.id, msg.text)}
                        >
                          {copiedId === msg.id ? "✓ Copied!" : "📋 Copy"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="prem-user-bubble">
                      <div className="prem-user-tag">{msg.tag || (msg.isVoice ? "YOU · VOICE" : "YOU · TYPED")}</div>
                      <div className="prem-user-body">{msg.text}</div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Live Processing Indicator */}
            {isProcessing && (
              <div className="prem-bot-bubble" style={{ background: "rgba(184, 147, 90, 0.08)", borderColor: "rgba(184, 147, 90, 0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--gold)", fontSize: "12.5px", fontWeight: 600 }}>
                  <span className="sim-radial-spinner" style={{ width: "15px", height: "15px" }}></span>
                  Analyzing {activeTicker} live order book, technical indicators &amp; financial thesis...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips Strip */}
          <div className="prem-chips-strip">
            {PREM_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="prem-chip"
                onClick={() => handleQuickPrompt(chip.query)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Bottom Input Command Bar */}
          <form className="prem-input-container" onSubmit={handleSend}>
            <div className="prem-input-bar">
              <input
                ref={inputRef}
                type="text"
                className="prem-text-input"
                placeholder="Ask about stocks, valuation, risk, news or portfolio impact..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isProcessing}
              />
              <button
                type="button"
                className={`prem-mic-btn ${isListening ? "listening" : ""}`}
                onClick={handleToggleMic}
                title={isListening ? "Stop listening" : "Click to speak via Deepgram Nova-2"}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
                  <path d="M12 18v4M9 22h6" />
                </svg>
              </button>
              <button
                type="submit"
                className="prem-send-btn"
                disabled={!inputQuery.trim() || isProcessing}
                title="Send query"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: Hands-Free Analyst (Deep Navy Card)                 */}
        {/* ================================================================= */}
        <div className="prem-analyst-card">
          {/* Header */}
          <div className="prem-analyst-header">
            <div className="prem-analyst-eyebrow">VOICE INTELLIGENCE</div>
            <h2 className="prem-analyst-title">Hands-Free Analyst</h2>
            <p className="prem-analyst-subtitle">Speak naturally. MarketMind keeps your active stock context.</p>
          </div>

          {/* Center Orb & Button */}
          <div className="prem-orb-container">
            <div
              className={`prem-gold-orb ${isListening ? "active" : ""}`}
              onClick={handleToggleMic}
              title={isListening ? "Click to stop recording" : "Click to speak"}
            >
              {/* Vintage Studio Microphone SVG */}
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#0f1c34" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="9" y1="5" x2="15" y2="5" />
                <line x1="9" y1="8" x2="15" y2="8" />
              </svg>
            </div>

            <button
              type="button"
              className={`prem-speak-btn ${isListening ? "active" : ""}`}
              onClick={handleToggleMic}
            >
              {isListening ? "Stop Speaking" : "Start Speaking"}
            </button>

            <div
              className="prem-continuous-text"
              onClick={toggleContinuousMode}
              title="Click to toggle continuous conversation mode"
            >
              Continuous conversation · {isContinuousMode ? "ON" : "OFF"}
            </div>
          </div>

          {/* Active Market Focus Card */}
          <div className="prem-focus-card">
            <div className="prem-focus-top">
              <div>
                <div className="prem-focus-label">ACTIVE MARKET FOCUS</div>
                <div className="prem-focus-symbol">{activeTicker} · NSE</div>
              </div>
              <div className="prem-focus-price-group">
                <span className="prem-focus-price">₹1,418.80</span>
                <span className="prem-focus-change">+0.23%</span>
              </div>
            </div>

            <div className="prem-focus-badges">
              <div className="prem-badge-box">
                <div className="prem-badge-lbl">RISK</div>
                <div className="prem-badge-val">Moderate</div>
              </div>
              <div className="prem-badge-box">
                <div className="prem-badge-lbl">TREND</div>
                <div className="prem-badge-val" style={{ color: "#4cd964" }}>Positive</div>
              </div>
              <div className="prem-badge-box">
                <div className="prem-badge-lbl">CONTEXT</div>
                <div className="prem-badge-val" style={{ color: "#64b5f6" }}>Live</div>
              </div>
            </div>
          </div>

          {/* Voice Preferences */}
          <div>
            <div className="prem-pref-header">VOICE PREFERENCES</div>
            <div className="prem-pref-grid">
              <div className="prem-pref-field">
                <label className="prem-pref-label">Assistant Voice</label>
                <select
                  className="prem-pref-select"
                  value={voiceGender}
                  onChange={(e) => setVoiceGender(e.target.value)}
                >
                  <option value="female">Aura Asteria</option>
                  <option value="male">Aura Orion</option>
                </select>
              </div>

              <div className="prem-pref-field">
                <label className="prem-pref-label">Reply Language</label>
                <select
                  className="prem-pref-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="english">English</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="prem-analyst-footer">
            <span>Latency 43 ms</span>
            <span className="prem-telemetry-live">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4cd964", display: "inline-block" }}></span>
              Live Telemetry
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
