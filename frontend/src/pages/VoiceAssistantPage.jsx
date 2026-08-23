import React from "react";
import { useVoiceAgent } from "../hooks/useVoiceAgent";

export default function VoiceAssistantPage({ openAssistant }) {
  const {
    isListening,
    isProcessing,
    isPlayingAudio,
    language,
    setLanguage,
    voiceGender,
    setVoiceGender,
    liveTranscript,
    messages,
    startListening,
    stopListening,
    submitQuery,
  } = useVoiceAgent();

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="grid">
      <div className="card hero-card c12" style={{ alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "14px 0 6px", width: "100%" }}>
          <div className="eyebrow" style={{ color: "var(--gold-light)" }}>02 · Autonomous Voice Stock Assistant</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "26px", color: "#FBF4E4", textAlign: "center" }}>
            Ask about any stock, out loud.
          </h2>

          <div
            className={`mic-big ${isListening ? "active" : ""}`}
            style={{
              width: "84px",
              height: "84px",
              cursor: "pointer",
              background: isListening ? "var(--gold)" : "var(--navy-2)",
              border: isListening ? "3px solid #FBF4E4" : "2px solid rgba(217,188,139,.3)",
              boxShadow: isListening ? "0 0 24px rgba(184,147,90,.6)" : "none",
            }}
            onClick={handleToggleMic}
            title={isListening ? "Click to stop recording" : "Click to speak"}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" style={{ width: "34px", height: "34px", stroke: "#FBF4E4" }}>
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
              <path d="M12 18v4M9 22h6" />
            </svg>
          </div>

          <div className="big-wave" style={{ opacity: isListening || isPlayingAudio ? 1 : 0.35 }}>
            <i style={{ animationDelay: "0s" }}></i>
            <i style={{ animationDelay: ".1s" }}></i>
            <i style={{ animationDelay: ".2s" }}></i>
            <i style={{ animationDelay: ".3s" }}></i>
            <i style={{ animationDelay: ".15s" }}></i>
            <i style={{ animationDelay: ".25s" }}></i>
            <i style={{ animationDelay: ".05s" }}></i>
          </div>

          <div style={{ minHeight: "32px", textAlign: "center" }}>
            {liveTranscript ? (
              <span style={{ color: "var(--gold-light)", fontSize: "14px", fontWeight: 500 }}>
                "{liveTranscript}"
              </span>
            ) : isProcessing ? (
              <span style={{ color: "#AFB6CC", fontSize: "13px" }}>
                🧠 Gemini 2.5 Flash is analyzing stock signals & news...
              </span>
            ) : isPlayingAudio ? (
              <span style={{ color: "var(--gold-light)", fontSize: "13px" }}>
                🔊 Speaking response via Deepgram Aura...
              </span>
            ) : (
              <p style={{ fontSize: "13px", color: "#AFB6CC", textAlign: "center", maxWidth: "460px", margin: 0 }}>
                Tap the mic to speak in <b>{language.toUpperCase()}</b> — MarketMind listens with Deepgram Nova-2 and speaks back instantly.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Session</span><h3>Live Conversation History</h3></div></div>
          <span className="tag live">Gemini Active</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`msg ${msg.sender}`}
              style={{
                maxWidth: msg.sender === "user" ? "80%" : "100%",
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.sender === "bot" && <span className="tag-sm">MarketMind AI</span>}
              {msg.text}
            </div>
          ))}
          {isProcessing && (
            <div className="msg bot">
              <span className="tag-sm">Thinking</span>
              Processing financial context...
            </div>
          )}
        </div>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Settings</span><h3 style={{ fontSize: "18px" }}>Voice &amp; AI Preferences</h3></div></div>
        </div>

        <div className="field">
          <label>Assistant Voice (Deepgram Aura)</label>
          <select value={voiceGender} onChange={(e) => setVoiceGender(e.target.value)}>
            <option value="female">Aura Asteria (Female Voice)</option>
            <option value="male">Aura Orion (Male Voice)</option>
          </select>
        </div>

        <div className="field">
          <label>Reply Language Mode</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="hinglish">Hinglish (Conversational)</option>
            <option value="english">English (Global Financial)</option>
            <option value="hindi">Hindi (हिंदी)</option>
          </select>
        </div>

        <div className="field">
          <label>Quick Test Prompts</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              className="pill-btn ghost"
              style={{ justifyContent: "flex-start", fontSize: "11.5px", padding: "6px 10px" }}
              onClick={() => submitQuery("Reliance ka P/E aur RSI kaisa hai?")}
            >
              • Reliance RSI &amp; Summary
            </button>
            <button
              className="pill-btn ghost"
              style={{ justifyContent: "flex-start", fontSize: "11.5px", padding: "6px 10px" }}
              onClick={() => submitQuery("Crude oil 20% surge hone par Indigo aur ONGC par kya asar hoga?")}
            >
              • Crude Oil Domino Chain
            </button>
            <button
              className="pill-btn ghost"
              style={{ justifyContent: "flex-start", fontSize: "11.5px", padding: "6px 10px" }}
              onClick={() => submitQuery("Tata Motors ka Management Trust Meter score batao")}
            >
              • Tata Motors Trust Score
            </button>
          </div>
        </div>

        <button
          className="pill-btn"
          style={{ alignSelf: "flex-start", marginTop: "6px" }}
          onClick={handleToggleMic}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
          </svg>
          {isListening ? "Stop Speaking" : "Start Talking Now"}
        </button>
      </div>
    </div>
  );
}
