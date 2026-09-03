import React, { useState, useRef, useEffect } from "react";
import { useVoiceAgent } from "../hooks/useVoiceAgent";

export default function FloatingAssistant({ isOpen, setIsOpen, isMicMuted = false, setIsMicMuted = () => {} }) {
  const [chatInput, setChatInput] = useState("");
  const [playingMsgId, setPlayingMsgId] = useState(null);
  const chatScrollRef = useRef(null);

  const {
    isListening,
    isProcessing,
    isPlayingAudio,
    isContinuousMode,
    language,
    setLanguage,
    liveTranscript,
    messages,
    startListening,
    stopListening,
    submitQuery,
    playMessageAudio,
  } = useVoiceAgent(null, isMicMuted);

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
    if (isMicMuted) {
      setIsMicMuted(false);
      startListening();
      return;
    }
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
      {/* Floating Action Controls with Mute/Privacy Switch */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", alignItems: "center", gap: "10px", zIndex: 999 }}>
        {/* Quick Mic Mute / Privacy Pill */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const nextState = !isMicMuted;
            setIsMicMuted(nextState);
            if (nextState && isListening) {
              stopListening();
            }
          }}
          title={isMicMuted ? "Microphone is MUTED (Privacy Active). Click to Unmute." : "Microphone is ACTIVE. Click to MUTE."}
          style={{
            height: "38px",
            padding: "0 12px",
            borderRadius: "20px",
            background: isMicMuted ? "rgba(161,69,69,.92)" : "rgba(16,27,51,.85)",
            backdropFilter: "blur(8px)",
            color: "#FFF",
            border: isMicMuted ? "1px solid #E65C5C" : "1px solid rgba(216,188,139,.35)",
            boxShadow: isMicMuted ? "0 4px 14px rgba(161,69,69,.45)" : "0 4px 14px rgba(0,0,0,.25)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            fontSize: "11.5px",
            fontWeight: 600,
            transition: "all .2s ease",
          }}
        >
          {isMicMuted ? (
            <>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <line x1="1" y1="1" x2="23" y2="23" stroke="#fff" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <span>Mic Muted</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--gold-light)" strokeWidth="2.2" strokeLinecap="round">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
                <path d="M12 18v4M9 22h6" />
              </svg>
              <span>Mic Active</span>
            </>
          )}
        </button>

        {/* Floating Action Button (FAB) */}
        <button
          className="fab"
          title="Open MarketPulse AI Terminal"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "static",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isMicMuted 
              ? "linear-gradient(135deg, #4A5568, #2D3748)"
              : "linear-gradient(135deg, var(--gold-light), var(--gold))",
            boxShadow: isMicMuted
              ? "0 8px 24px -4px rgba(0,0,0,.5)"
              : "0 8px 24px -4px rgba(184,147,90,.6)",
            cursor: "pointer",
          }}
        >
          {isMicMuted ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#E2E8F0" strokeWidth="2.2" strokeLinecap="round">
              <line x1="2" y1="2" x2="22" y2="22" />
              <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
              <path d="M5 10v2a7 7 0 0 0 12 5" />
              <path d="M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          ) : (
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
          )}
        </button>
      </div>

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
              <div style={{ fontFamily: "var(--serif)", fontSize: "15px", fontWeight: 600, color: "#FBF4E4", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>MarketPulse</span>
                <span style={{ fontSize: "9.5px", background: "rgba(217,188,139,.22)", color: "var(--gold-light)", padding: "1px 5px", borderRadius: "4px", fontWeight: 600, letterSpacing: ".5px" }}>
                  AI
                </span>
                {isContinuousMode && (
                  <span style={{ fontSize: "9px", background: "rgba(47,111,98,.35)", color: "#80D4C5", padding: "1px 6px", borderRadius: "10px", border: "1px solid rgba(47,111,98,.5)", fontWeight: 600 }}>
                    🟢 Hands-Free Loop
                  </span>
                )}
              </div>
              <div style={{ fontSize: "10.5px", color: isListening ? "#E65C5C" : isPlayingAudio ? "#D9BC8B" : "#8FD1AE", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                <i style={{ width: "5px", height: "5px", borderRadius: "50%", background: isListening ? "#E65C5C" : isPlayingAudio ? "#D9BC8B" : "#8FD1AE", display: "inline-block", animation: "pulse-dot 1.5s infinite" }}></i>
                {isListening
                  ? "Listening... (Speak naturally)"
                  : isProcessing
                  ? "Analyzing signals..."
                  : isPlayingAudio
                  ? "MarketPulse Speaking..."
                  : isContinuousMode
                  ? "Hands-Free Active"
                  : "Real-Time Terminal"}
              </div>
            </div>
          </div>

          {/* Right: Mute Privacy Pill + Language Dropdown + Close */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
            {/* Direct Mute / Privacy Switch */}
            <button
              type="button"
              onClick={() => {
                const nextMute = !isMicMuted;
                setIsMicMuted(nextMute);
                if (nextMute && isListening) stopListening();
              }}
              title={isMicMuted ? "Unmute Microphone (Enable Voice)" : "Mute Microphone (Privacy On)"}
              style={{
                background: isMicMuted ? "rgba(161,69,69,.45)" : "rgba(255,255,255,.09)",
                border: isMicMuted ? "1px solid #E65C5C" : "1px solid rgba(217,188,139,.35)",
                borderRadius: "16px",
                padding: "4px 9px",
                fontSize: "11px",
                fontWeight: 600,
                color: isMicMuted ? "#FFA4A4" : "#FBF4E4",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                lineHeight: 1.2
              }}
            >
              {isMicMuted ? "🔇 Muted" : "🎙️ On"}
            </button>

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
            <div className="msg-wrapper bot" style={{ opacity: 0.7 }}>
              <div className="msg bot" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="live-pulse" style={{ width: "8px", height: "8px" }}></span>
                <span style={{ fontSize: "12px", color: "var(--ink-soft)" }}>MarketPulse is analyzing live signals...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="suggest-chips-row">
          <span className="suggest-pill" onClick={() => handlePromptClick(language === "hindi" ? "रिलायंस का 20-दिन वीडब्ल्यूपी, वीएआर और ऑर्डर बुक इम्बैलेंस कैसा है?" : "What is the VWAP, 95% VaR, and Order Book Imbalance for Reliance?")}>
            {language === "hindi" ? "रिलायंस क्वांट रिस्क & VWAP" : "Reliance Quant & VWAP"}
          </span>
          <span className="suggest-pill" onClick={() => handlePromptClick(language === "hindi" ? "क्या टाटा मोटर्स को मौजूदा स्तर पर खरीदना चाहिए और रिस्क-रिवॉर्ड कैसा है?" : "Should I buy or sell Tata Motors at current levels and what is the risk-reward ratio?")}>
            {language === "hindi" ? "टाटा मोटर्स Buy/Sell फैसला" : "Tata Motors Buy/Sell Verdict"}
          </span>
          <span className="suggest-pill" onClick={() => handlePromptClick(language === "hindi" ? "क्रूड ऑयल 30% बढ़ने का पेंट और एविएशन सेक्टर पर क्या डोमिनो इफेक्ट होगा?" : "What is the domino ripple effect on Paint and Aviation if Crude Oil surges 30%?")}>
            {language === "hindi" ? "क्रूड 30% डोमिनो रिपल" : "Crude 30% Domino Ripple"}
          </span>
          <span className="suggest-pill" onClick={() => handlePromptClick(language === "hindi" ? "क्या किसी कंपनी में कैश फ्लो डाइवर्जेंस या फॉरेंसिक रेड फ्लैग है?" : "Does Reliance or Adani show any forensic cash flow divergence or red flags?")}>
            {language === "hindi" ? "फॉरेंसिक रेड फ्लैग ऑडिट" : "Forensic Audit & Red Flags"}
          </span>
        </div>

        {/* WhatsApp-Style Input Bar */}
        <div className="assist-input-bar">
          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type="text"
              placeholder={isMicMuted ? "🔒 Mic is muted (Privacy Active). Type here..." : isListening ? "🎙️ Speak now, MarketPulse is listening..." : `Ask MarketPulse in ${language === "hindi" ? "Hindi" : "English"}...`}
              value={isListening ? liveTranscript : chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              style={{
                width: "100%",
                background: isMicMuted ? "rgba(16,27,51,.04)" : isListening ? "rgba(161,69,69,.08)" : "var(--cream)",
                borderColor: isMicMuted ? "var(--line)" : isListening ? "var(--rose)" : "var(--line)",
              }}
            />
            {isListening && !isMicMuted && (
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
            className={`assist-mic-btn ${isListening && !isMicMuted ? "active" : ""}`}
            title={isMicMuted ? "Microphone is muted. Click to unmute and speak." : isListening ? "Tap to pause voice" : "Tap to speak to MarketPulse"}
            onClick={handleToggleMic}
            style={{
              background: isMicMuted
                ? "linear-gradient(135deg, #718096, #4A5568)"
                : isListening
                ? "var(--rose)"
                : "linear-gradient(135deg, var(--gold), var(--gold-light))",
              boxShadow: isMicMuted
                ? "0 2px 8px rgba(0,0,0,.2)"
                : isListening
                ? "0 0 16px rgba(161,69,69,.6)"
                : "0 2px 8px rgba(184,147,90,.3)",
            }}
          >
            {isMicMuted ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <line x1="2" y1="2" x2="22" y2="22" />
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                <path d="M5 10v2a7 7 0 0 0 12 5" />
                <path d="M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round">
                <rect x="9" y="2" width="6" height="12" rx="3" stroke={isListening ? "#fff" : "var(--navy)"} />
                <path d="M5 10v1a7 7 0 0 0 14 0v-1" stroke={isListening ? "#fff" : "var(--navy)"} />
                <path d="M12 18v4M9 22h6" stroke={isListening ? "#fff" : "var(--navy)"} />
              </svg>
            )}
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
