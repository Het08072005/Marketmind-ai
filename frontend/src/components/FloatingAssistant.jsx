import React, { useState, useRef, useEffect } from "react";
import { useVoiceAgent } from "../hooks/useVoiceAgent";

export default function FloatingAssistant({ isOpen, setIsOpen }) {
  const [chatInput, setChatInput] = useState("");
  const [playingMsgId, setPlayingMsgId] = useState(null);
  const chatScrollRef = useRef(null);

  const {
    isListening,
    isProcessing,
    isPlayingAudio,
    language,
    setLanguage,
    liveTranscript,
    messages,
    startListening,
    stopListening,
    submitQuery,
    playMessageAudio,
  } = useVoiceAgent();

  // Auto-scroll on new message or live transcript
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing, liveTranscript]);

  const handleSendChat = (e) => {
    e?.preventDefault();
    const query = (liveTranscript || chatInput).trim();
    if (!query) return;
    submitQuery(query, false);
    setChatInput("");
  };

  const handlePromptClick = (text) => {
    submitQuery(text, false);
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handlePlayMessage = async (msg) => {
    setPlayingMsgId(msg.id);
    await playMessageAudio(msg);
    setTimeout(() => {
      setPlayingMsgId(null);
    }, 4000);
  };

  return (
    <>
      {/* Floating Action Button with Clean Microphone Logo */}
      <button
        className="fab"
        title="Open MarketPulse AI Terminal"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
          boxShadow: "0 8px 24px -4px rgba(184,147,90,.6)",
          cursor: "pointer",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: "24px", height: "24px", stroke: "var(--navy)" }}
        >
          <rect x="9" y="2" width="6" height="12" rx="3" fill="rgba(16,27,51,.15)" />
          <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
          <path d="M12 18v4M9 22h6" />
        </svg>
      </button>

      {/* Slide-Up Assistant Panel (MarketPulse AI) */}
      <div className={`assistant-panel ${isOpen ? "open" : ""}`} id="assistantPanel">
        {/* Header - Pixel-Perfect Spacious Single Row */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--navy), var(--navy-2))",
            color: "#EFE9D8",
            padding: "12px 14px",
            borderBottom: "1px solid rgba(217,188,139,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {/* Left: Brand Avatar & MarketPulse AI Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(216,188,139,.3), rgba(216,188,139,.1))",
                border: "1px solid rgba(216,188,139,.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,.3)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", stroke: "var(--gold-light)" }}>
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
                <path d="M12 18v4M9 22h6" />
              </svg>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "15px", fontWeight: 600, color: "#FBF4E4", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: "5px" }}>
                <span>MarketPulse</span>
                <span style={{ fontSize: "9.5px", background: "rgba(217,188,139,.22)", color: "var(--gold-light)", padding: "1px 5px", borderRadius: "4px", fontWeight: 600, letterSpacing: ".5px" }}>
                  AI
                </span>
              </div>
              <div style={{ fontSize: "10.5px", color: isListening ? "#E65C5C" : isPlayingAudio ? "#D9BC8B" : "#8FD1AE", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                <i style={{ width: "5px", height: "5px", borderRadius: "50%", background: isListening ? "#E65C5C" : isPlayingAudio ? "#D9BC8B" : "#8FD1AE", display: "inline-block", animation: "pulse-dot 1.5s infinite" }}></i>
                {isListening
                  ? "Listening to you..."
                  : isProcessing
                  ? "Analyzing signals..."
                  : isPlayingAudio
                  ? "MarketPulse Speaking..."
                  : "Real-Time Terminal"}
              </div>
            </div>
          </div>

          {/* Right: Clean English & Hindi Language Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                title="Change language"
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  background: "rgba(255,255,255,.09)",
                  border: "1px solid rgba(217,188,139,.35)",
                  borderRadius: "16px",
                  padding: "4px 22px 4px 10px",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#FBF4E4",
                  outline: "none",
                  cursor: "pointer",
                  lineHeight: 1.2,
                }}
              >
                <option value="english" style={{ color: "#101B33", background: "#FAF6EC" }}>🌐 English</option>
                <option value="hindi" style={{ color: "#101B33", background: "#FAF6EC" }}>🌐 हिंदी (Hindi)</option>
              </select>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--gold-light)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ position: "absolute", right: "7px", width: "10px", height: "10px", pointerEvents: "none" }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              title="Close Terminal"
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "rgba(255,255,255,.08)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background .15s ease",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" style={{ width: "12px", height: "12px", stroke: "#EDE6D3" }}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Message Stream Area */}
        <div className="assist-body" ref={chatScrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: "12px", background: "var(--cream)" }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`msg-wrapper ${msg.sender}`}>
              <div className={`msg ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <span className="tag-sm" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>MARKETPULSE AI</span>
                  </span>
                )}
                {msg.text}
              </div>

              {/* Message Meta & Action */}
              <div className="msg-footer">
                <span className="msg-time" style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  {msg.isVoice && <span>🎙️</span>}
                  {msg.time}
                </span>

                {msg.sender === "bot" && (
                  <button
                    className={`speaker-btn ${playingMsgId === msg.id || (isPlayingAudio && msg === messages[messages.length - 1]) ? "playing" : ""}`}
                    onClick={() => handlePlayMessage(msg)}
                    title="Listen to MarketPulse response"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                    {playingMsgId === msg.id || (isPlayingAudio && msg === messages[messages.length - 1]) ? "Speaking..." : "Speak"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Live speech preview bubble on right side while user speaks */}
          {isListening && liveTranscript && (
            <div className="msg-wrapper user" style={{ opacity: 0.85 }}>
              <div className="msg user" style={{ border: "1px dashed var(--gold-light)" }}>
                🎙️ "{liveTranscript}..."
              </div>
              <div className="msg-footer">
                <span className="msg-time">Speaking now...</span>
              </div>
            </div>
          )}

          {/* Thinking / Analyzing Indicator */}
          {isProcessing && (
            <div className="msg-wrapper bot">
              <div className="msg bot" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="tag-sm" style={{ margin: 0 }}>Thinking</span>
                <span style={{ fontSize: "12px", color: "var(--ink-soft)" }}>MarketPulse is analyzing live signals...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="suggest-chips-row">
          <span className="suggest-pill" onClick={() => handlePromptClick(language === "hindi" ? "रिलायंस की समरी और आरएसआई कैसा है?" : "What is the summary and RSI of Reliance?")}>
            {language === "hindi" ? "रिलायंस समरी" : "Reliance Summary"}
          </span>
          <span className="suggest-pill" onClick={() => handlePromptClick(language === "hindi" ? "क्रूड ऑयल 30% बढ़ने का डोमिनो इफेक्ट क्या होगा?" : "What is the domino effect if Crude Oil rises 30%?")}>
            {language === "hindi" ? "ऑयल डोमिनो इफेक्ट" : "Oil Domino Chain"}
          </span>
          <span className="suggest-pill" onClick={() => handlePromptClick(language === "hindi" ? "टाटा मोटर्स का मैनेजमेंट ट्रस्ट स्कोर क्या है?" : "What is Tata Motors Trust Score?")}>
            {language === "hindi" ? "टाटा मोटर्स ट्रस्ट" : "Tata Motors Trust"}
          </span>
          <span className="suggest-pill" onClick={() => handlePromptClick(language === "hindi" ? "आज का ओवरऑल मार्केट कंडीशन कैसा है?" : "What is the market condition today?")}>
            {language === "hindi" ? "मार्केट कंडीशन" : "Market Condition"}
          </span>
        </div>

        {/* WhatsApp-Style Input Bar */}
        <div className="assist-input-bar">
          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type="text"
              placeholder={isListening ? "🎙️ Speak now, MarketPulse is listening..." : `Ask MarketPulse in ${language === "hindi" ? "Hindi" : "English"}...`}
              value={isListening ? liveTranscript : chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              style={{
                width: "100%",
                background: isListening ? "rgba(161,69,69,.08)" : "var(--cream)",
                borderColor: isListening ? "var(--rose)" : "var(--line)",
              }}
            />
            {isListening && (
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  fontSize: "11px",
                  color: "var(--rose)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <i style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--rose)", animation: "pulse-dot 1s infinite" }}></i>
                REC
              </span>
            )}
          </div>

          {/* WhatsApp-style Mic Button on Right */}
          <button
            type="button"
            className={`assist-mic-btn ${isListening ? "active" : ""}`}
            title={isListening ? "Tap to send voice message" : "Tap to speak to MarketPulse"}
            onClick={handleToggleMic}
            style={{
              background: isListening ? "var(--rose)" : "linear-gradient(135deg, var(--gold), var(--gold-light))",
              boxShadow: isListening ? "0 0 16px rgba(161,69,69,.6)" : "0 2px 8px rgba(184,147,90,.3)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="12" rx="3" stroke={isListening ? "#fff" : "var(--navy)"} />
              <path d="M5 10v1a7 7 0 0 0 14 0v-1" stroke={isListening ? "#fff" : "var(--navy)"} />
              <path d="M12 18v4M9 22h6" stroke={isListening ? "#fff" : "var(--navy)"} />
            </svg>
          </button>

          {/* Send Button if text is typed manually */}
          {chatInput.trim() && !isListening && (
            <button
              className="assist-send-btn"
              onClick={handleSendChat}
              disabled={isProcessing}
              title="Send to MarketPulse"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
