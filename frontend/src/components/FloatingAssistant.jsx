import React, { useState, useRef, useEffect } from "react";
import { useVoiceAgent } from "../hooks/useVoiceAgent";
import alexLogoImg from "../assets/alex-copilot-logo.png";

// Exact 3D Robot Logo from image.png with background removed
const CopilotBotIcon = ({
  size = 22,
  className = "",
  style = {},
}) => (
  <img
    src={alexLogoImg}
    alt="Alex Copilot"
    className={className}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${Math.max(3, Math.round(size * 0.24))}px`,
      objectFit: "contain",
      display: "inline-block",
      verticalAlign: "middle",
      flexShrink: 0,
      userSelect: "none",
      ...style,
    }}
  />
);

// High-Definition Glossy 3D Robot Avatar from user's image.png (background cleanly removed)
const AlexHeaderRobotAvatar = ({ size = 36, style = {} }) => (
  <img
    src={alexLogoImg}
    alt="Alex Copilot"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${Math.round(size * 0.26)}px`,
      objectFit: "contain",
      display: "block",
      flexShrink: 0,
      filter: "drop-shadow(0 2px 8px rgba(59, 130, 246, 0.35))",
      userSelect: "none",
      ...style,
    }}
  />
);

// Crisp Institutional SVG Audio & Voice Icons
const MicIcon = ({ size = 18, color = "currentColor", fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="9"
      y="2"
      width="6"
      height="11"
      rx="3"
      fill={fill !== "none" ? fill : color}
      stroke={color}
      strokeWidth="1.2"
    />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" stroke={color} strokeWidth="2.2" />
    <line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="2.2" />
    <line x1="8" y1="22" x2="16" y2="22" stroke={color} strokeWidth="2.2" />
  </svg>
);

const MicOffIcon = ({ size = 18, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="2" y1="2" x2="22" y2="22" />
    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
    <path d="M5 10v2a7 7 0 0 0 12 5" />
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const SpeakerOnIcon = ({ size = 15, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.2" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const SpeakerOffIcon = ({ size = 15, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.2" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export default function FloatingAssistant({
  isOpen,
  setIsOpen,
  isMicMuted = false,
  setIsMicMuted = () => { },
  initialTab,
  onFabClick,
}) {
  const [chatInput, setChatInput] = useState("");
  const [playingMsgId, setPlayingMsgId] = useState(null);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  useEffect(() => {
    // Ensure clean state: voice sound is enabled by default
    localStorage.removeItem("alex_speaker_muted");
  }, []);

  // Flexible Resizing: width, height and drag mode ('left' | 'top' | 'corner' | null)
  const [dimensions, setDimensions] = useState(() => {
    try {
      const saved = localStorage.getItem("alex_copilot_dimensions_v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.width && parsed.height) {
          return {
            width: Math.min(Math.max(320, parsed.width), 850),
            height: Math.min(Math.max(380, parsed.height), 820),
          };
        }
      }
    } catch (e) { }
    return { width: 410, height: 510 };
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [dragType, setDragType] = useState(null); // 'left' | 'top' | 'corner' | null
  const dragStartRef = useRef({ startX: 0, startY: 0, startW: 0, startH: 0 });
  const chatScrollRef = useRef(null);
  const panelRef = useRef(null);

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
    stopAudioPlayback,
  } = useVoiceAgent(null, isMicMuted, isSpeakerMuted);

  // Auto-scroll on new message or live transcript
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing, liveTranscript]);

  // Reset playingMsgId when audio ends
  useEffect(() => {
    if (!isPlayingAudio) {
      setPlayingMsgId(null);
    }
  }, [isPlayingAudio]);

  // When assistant panel closes, immediately stop speech recognition & audio to completely release microphone
  useEffect(() => {
    if (!isOpen) {
      if (typeof stopListening === "function") stopListening();
      if (typeof stopAudioPlayback === "function") stopAudioPlayback();
    }
  }, [isOpen, stopListening, stopAudioPlayback]);

  // Close assistant when clicking outside of panel
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      // Do not close if user is currently resizing via drag handles
      if (dragType) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick, { passive: true });
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen, dragType, setIsOpen]);

  // Handle Drag-to-Resize on Left Border, Top Border, or Corner
  const handleStartResize = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragType(type);
    setIsExpanded(false); // Switch to manual custom sizing mode
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: isExpanded ? Math.min(740, window.innerWidth - 30) : dimensions.width,
      startH: isExpanded ? Math.min(800, window.innerHeight - 30) : dimensions.height,
    };
  };

  useEffect(() => {
    if (!dragType) return;

    const handleMouseMove = (e) => {
      // Element is anchored at bottom-right:
      // Dragging left (lower X) increases width
      // Dragging up (lower Y) increases height
      const deltaX = dragStartRef.current.startX - e.clientX;
      const deltaY = dragStartRef.current.startY - e.clientY;

      const maxAllowedW = Math.min(850, window.innerWidth - 20);
      const maxAllowedH = Math.min(850, window.innerHeight - 16);

      let nextW = dimensions.width;
      let nextH = dimensions.height;

      if (dragType === "left" || dragType === "corner") {
        nextW = Math.min(Math.max(320, dragStartRef.current.startW + deltaX), maxAllowedW);
      }
      if (dragType === "top" || dragType === "corner") {
        nextH = Math.min(Math.max(380, dragStartRef.current.startH + deltaY), maxAllowedH);
      }

      setDimensions({ width: nextW, height: nextH });
    };

    const handleMouseUp = () => {
      setDragType(null);
      try {
        localStorage.setItem("alex_copilot_dimensions_v4", JSON.stringify(dimensions));
      } catch (e) { }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragType, dimensions]);

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

  const handleToggleSpeaker = () => {
    if (isPlayingAudio) {
      stopAudioPlayback();
    }
    const nextState = !isSpeakerMuted;
    setIsSpeakerMuted(nextState);
    localStorage.setItem("alex_speaker_muted", String(nextState));
  };

  const handlePlayMessage = async (msg) => {
    if (isPlayingAudio || playingMsgId === msg.id) {
      stopAudioPlayback();
      setPlayingMsgId(null);
      return;
    }
    if (isSpeakerMuted) {
      setIsSpeakerMuted(false);
      localStorage.setItem("alex_speaker_muted", "false");
    }
    setPlayingMsgId(msg.id);
    await playMessageAudio(msg);
    setPlayingMsgId(null);
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Compute active panel dimensions (responsively bounded to screen, perfect for mobile/tablet/desktop)
  const isMobileScreen = typeof window !== "undefined" && window.innerWidth < 480;
  const activeWidth = Math.min(
    isExpanded ? Math.min(740, window.innerWidth - 20) : (isMobileScreen ? window.innerWidth - 16 : dimensions.width),
    window.innerWidth - 16
  );
  const activeHeight = Math.min(
    isExpanded ? Math.min(800, window.innerHeight - 30) : (isMobileScreen ? Math.min(540, window.innerHeight - 30) : dimensions.height),
    window.innerHeight - 16
  );

  return (
    <>
      {/* External Floating Action Button (FAB) - ONLY visible when terminal is CLOSED */}
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: isMobileScreen ? "16px" : "24px",
            right: isMobileScreen ? "16px" : "24px",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            animation: "alex-fab-appear 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <button
            className="fab alex-copilot-fab"
            title="Open Alex Copilot"
            onClick={() => {
              try {
                if ("speechSynthesis" in window) {
                  window.speechSynthesis.resume();
                }
              } catch (e) {}
              setIsSpeakerMuted(false);
              if (onFabClick) {
                onFabClick();
              } else {
                setIsOpen(true);
              }
              // This user gesture is the browser-safe point to request microphone
              // permission. Deepgram/STT then detects the spoken voice phrase.
              if (!isMicMuted) startListening(true);
            }}
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              boxShadow: "0 10px 28px -4px rgba(16,27,51,0.5)",
            }}
          >
            <AlexHeaderRobotAvatar size={52} />
          </button>
        </div>
      )}

      {/* Slide-Up Alex Copilot Terminal Panel */}
      <div
        ref={panelRef}
        className={`assistant-panel ${isOpen ? "open" : ""} ${activeWidth < 370 ? "is-narrow" : ""} ${activeWidth < 330 ? "is-ultra-narrow" : ""}`}
        id="assistantPanel"
        style={{
          width: `${activeWidth}px`,
          height: `${activeHeight}px`,
          transition: dragType
            ? "none"
            : "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        {/* Full Left Border Click & Drag Resize Handle */}
        <div
          className={`alex-border-resize-left ${dragType === "left" ? "active" : ""}`}
          onMouseDown={(e) => handleStartResize("left", e)}
        />

        {/* Full Top Border Click & Drag Resize Handle */}
        <div
          className={`alex-border-resize-top ${dragType === "top" ? "active" : ""}`}
          onMouseDown={(e) => handleStartResize("top", e)}
        />

        {/* Top-Left Corner Diagonal Resize Handle */}
        <div
          className={`alex-border-resize-corner ${dragType === "corner" ? "active" : ""}`}
          onMouseDown={(e) => handleStartResize("corner", e)}
        />

        {/* Top-Left Visual Corner Resize Grip Icon (2 columns of 3 subtle dots matching Image 1) */}
        <div
          className="alex-resize-grip"
          onMouseDown={(e) => handleStartResize("corner", e)}
          title="Drag to resize"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <circle cx="2" cy="2" r="1.1" fill="rgba(255,255,255,0.4)" />
            <circle cx="6" cy="2" r="1.1" fill="rgba(255,255,255,0.4)" />
            <circle cx="2" cy="7" r="1.1" fill="rgba(255,255,255,0.4)" />
            <circle cx="6" cy="7" r="1.1" fill="rgba(255,255,255,0.4)" />
            <circle cx="2" cy="12" r="1.1" fill="rgba(255,255,255,0.4)" />
            <circle cx="6" cy="12" r="1.1" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>

        {/* Header - 2-Tier Executive Layout matching Reference Image */}
        <div className="alex-header-container">
          {/* Tier 1: Dark Executive Bar */}
          <div className="alex-header-tier-top">
            {/* Left: 3D-Style Robot Avatar + Alex Title in Serif + Sparkling COPILOT Badge + Ready Status */}
            <div className="alex-brand-block">
              <AlexHeaderRobotAvatar size={36} />

              <div className="alex-brand-meta">
                <div className="alex-brand-title-row">
                  <span className="alex-brand-title">Alex</span>
                  <div className="alex-copilot-badge">
                    <div className="alex-copilot-badge-icon">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#93C5FD">
                        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                      </svg>
                    </div>
                    <span className="alex-copilot-badge-text">COPILOT</span>
                  </div>
                </div>

                <div className="alex-ready-status">
                  <span className="alex-ready-dot" />
                  <span className="alex-ready-text">Ready to help</span>
                </div>
              </div>
            </div>

            {/* Right: Expand Button, Divider, Globe Language Selector Pill, and Close Button */}
            <div className="alex-header-controls">
              {/* Maximize / Restore Toggle Button */}
              <button
                type="button"
                onClick={toggleExpand}
                title={isExpanded ? "Restore standard size" : "Expand to widescreen terminal"}
                className="alex-expand-btn"
              >
                {isExpanded ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                )}
              </button>

              {/* Subtle Vertical Divider */}
              <div className="alex-ctrl-divider" />

              {/* Language Selector Capsule (Globe + EN + Chevron) */}
              <div className="alex-lang-capsule" title="Change Language">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>

                <span className="alex-lang-text">
                  {language === "hindi" ? "HI" : language === "hinglish" ? "HG" : "EN"}
                </span>

                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <option value="english">English (EN)</option>
                  <option value="hindi">हिंदी (HI)</option>
                  <option value="hinglish">Hinglish (HG)</option>
                </select>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Alex Copilot"
                className="alex-close-btn"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tier 2: White Status & Audio Control Bar */}
          <div className="alex-header-tier-bottom">
            {/* Left: Green Dot + Alex is online | Listening... + Soundwave */}
            <div className="alex-live-state-wrap">
              <span className="alex-online-dot" />
              <span className="alex-online-text">
                {activeWidth < 340 ? "Online" : "Alex is online"}
              </span>

              {activeWidth >= 360 && (
                <>
                  <div className="alex-status-vsep" />
                  <span className="alex-listening-text">
                    {isListening
                      ? "Listening..."
                      : isProcessing
                        ? "Analyzing..."
                        : isPlayingAudio
                          ? "Speaking..."
                          : "Listening..."}
                  </span>
                </>
              )}

              {/* Voice Waveform Bars */}
              <div className={`alex-wave-bars ${isListening || isPlayingAudio || isProcessing ? "active" : ""}`}>
                <span className="alex-wave-bar bar-1" />
                <span className="alex-wave-bar bar-2" />
                <span className="alex-wave-bar bar-3" />
                <span className="alex-wave-bar bar-4" />
                <span className="alex-wave-bar bar-5" />
              </div>
            </div>

            {/* Right: Mic Active/Muted Pill + Mute/Audio Pill */}
            <div className="alex-tier2-pills">
              {/* Mic Pill Button */}
              <button
                type="button"
                onClick={() => {
                  const nextMute = !isMicMuted;
                  setIsMicMuted(nextMute);
                  if (nextMute && isListening) stopListening();
                }}
                className={`alex-pill-btn ${isMicMuted ? "mic-muted" : "mic-active"}`}
                title={isMicMuted ? "Microphone is MUTED. Click to activate." : "Microphone is ACTIVE. Click to mute."}
              >
                {isMicMuted ? (
                  <MicOffIcon size={14} color="#DC2626" />
                ) : (
                  <MicIcon size={14} color="#1D4ED8" fill="#2563EB" />
                )}
                <span>
                  {activeWidth < 360
                    ? isMicMuted
                      ? "Muted"
                      : "Mic"
                    : isMicMuted
                      ? "Mic Muted"
                      : "Mic Active"}
                </span>
              </button>

              {/* Speaker / Mute Pill Button */}
              <button
                type="button"
                onClick={handleToggleSpeaker}
                className={`alex-pill-btn ${isPlayingAudio
                    ? "audio-playing"
                    : isSpeakerMuted
                      ? "audio-muted"
                      : "audio-active"
                  }`}
                title={
                  isPlayingAudio
                    ? "Voice is currently speaking. Click to stop."
                    : isSpeakerMuted
                      ? "Voice is MUTED. Click to turn voice sound ON."
                      : "Voice is ACTIVE. Click to mute voice."
                }
              >
                {isPlayingAudio ? (
                  <>
                    <SpeakerOffIcon size={14} color="#2563EB" />
                    <span>Stop</span>
                  </>
                ) : isSpeakerMuted ? (
                  <>
                    <SpeakerOffIcon size={14} color="#DC2626" />
                    <span>Muted</span>
                  </>
                ) : (
                  <>
                    <SpeakerOnIcon size={14} color="#15803D" />
                    <span>Voice On</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Message Stream Area */}
        <div
          className="assist-body"
          ref={chatScrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "var(--cream, #F7F5EE)",
          }}
        >
          {/* If no messages yet, show elegant, spacious Welcome Card */}
          {messages.length === 0 && (
            <div className="alex-welcome-card">
              <div className="alex-welcome-icon-glow">
                <CopilotBotIcon
                  size={32}
                  color="var(--navy, #101B33)"
                  eyeColor="#FAF6EC"
                />
              </div>
              <h3 className="alex-welcome-title">Alex Quantitative Copilot</h3>
              <p className="alex-welcome-desc">
                Institutional equity research, microstructure order flow analysis, forensic red flag audits & macro domino cascades.
              </p>
              <div className="alex-welcome-chips">
                <div
                  className="alex-starter-chip"
                  onClick={() =>
                    handlePromptClick(
                      language === "hindi"
                        ? "रिलायंस का 20-दिन वीडब्ल्यूपी, वीएआर और ऑर्डर बुक इम्बैलेंस कैसा है?"
                        : "What is the VWAP, 95% VaR, and Order Book Imbalance for Reliance?"
                    )
                  }
                >
                  <span className="chip-icon">⚡</span>
                  <span>{language === "hindi" ? "रिलायंस क्वांट & माइक्रोस्ट्रक्चर" : "Reliance Quant & Microstructure"}</span>
                </div>
                <div
                  className="alex-starter-chip"
                  onClick={() =>
                    handlePromptClick(
                      language === "hindi"
                        ? "क्रूड ऑयल 30% बढ़ने का पेंट और एविएशन सेक्टर पर क्या डोमिनो इफेक्ट होगा?"
                        : "What is the domino ripple effect on Paint and Aviation if Crude Oil surges 30%?"
                    )
                  }
                >
                  <span className="chip-icon">🌊</span>
                  <span>{language === "hindi" ? "क्रूड +30% डोमिनो रिपल इफ़ेक्ट" : "Crude Oil +30% Domino Cascades"}</span>
                </div>
                <div
                  className="alex-starter-chip"
                  onClick={() =>
                    handlePromptClick(
                      language === "hindi"
                        ? "क्या किसी कंपनी में कैश फ्लो डाइवर्जेंस या फॉरेंसिक रेड फ्लैग है?"
                        : "Does Reliance or Adani show any forensic cash flow divergence or red flags?"
                    )
                  }
                >
                  <span className="chip-icon">🔍</span>
                  <span>{language === "hindi" ? "फॉरेंसिक कैश फ्लो ऑडिट & रेड फ्लैग्स" : "Forensic Audit & Accounting Red Flags"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Render Active Conversation Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`msg-wrapper ${msg.sender}`}>
              <div className={`msg ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <span className="tag-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CopilotBotIcon
                      size={13}
                      color="var(--gold, #B8935A)"
                      eyeColor="#101B33"
                    />
                    <span>ALEX COPILOT</span>
                  </span>
                )}
                {msg.text}
                {msg.isStreaming && <span className="alex-streaming-cursor" />}
              </div>

              {/* Message Meta & Action */}
              <div className="msg-footer">
                <span className="msg-time" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {msg.isVoice && <MicIcon size={11} color="var(--gold)" />}
                  {msg.time}
                </span>

                {msg.sender === "bot" && (
                  <button
                    className={`speaker-btn ${playingMsgId === msg.id ||
                        (isPlayingAudio && msg === messages[messages.length - 1])
                        ? "playing"
                        : ""
                      }`}
                    onClick={() => handlePlayMessage(msg)}
                    title={
                      playingMsgId === msg.id ||
                        (isPlayingAudio && msg === messages[messages.length - 1])
                        ? "Stop speaking"
                        : "Listen to Alex response"
                    }
                  >
                    {playingMsgId === msg.id ||
                      (isPlayingAudio && msg === messages[messages.length - 1]) ? (
                      <>
                        <SpeakerOffIcon size={12} color="currentColor" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <SpeakerOnIcon size={12} color="currentColor" />
                        <span>Speak</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Live speech preview bubble while user speaks */}
          {isListening && liveTranscript && (
            <div className="msg-wrapper user" style={{ opacity: 0.85 }}>
              <div
                className="msg user"
                style={{
                  border: "1px dashed var(--gold-light)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <MicIcon size={14} color="var(--gold-light)" />
                <span>"{liveTranscript}..."</span>
              </div>
              <div className="msg-footer">
                <span className="msg-time">Speaking now...</span>
              </div>
            </div>
          )}

          {/* Animated Analysis State ("Alex is thinking...") */}
          {isProcessing && (
            <div className="msg-wrapper bot alex-analyzing-wrapper">
              <div className="msg bot alex-analyzing-card" style={{ padding: "11px 14px" }}>
                <div className="alex-analyzing-header" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="alex-spark-ring">
                    <CopilotBotIcon
                      size={13}
                      color="var(--gold-light, #E8C88B)"
                      eyeColor="#101B33"
                    />
                  </div>
                  <div className="alex-analyzing-text-wrap" style={{ flex: 1 }}>
                    <span className="alex-analyzing-title">Alex is analyzing...</span>
                    <span className="alex-analyzing-sub">
                      Querying live quant telemetry & order flows
                    </span>
                  </div>
                  <div className="alex-typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="suggest-chips-row">
          <span
            className="suggest-pill"
            onClick={() =>
              handlePromptClick(
                language === "hindi"
                  ? "रिलायंस का 20-दिन वीडब्ल्यूपी, वीएआर और ऑर्डर बुक इम्बैलेंस कैसा है?"
                  : "What is the VWAP, 95% VaR, and Order Book Imbalance for Reliance?"
              )
            }
          >
            {language === "hindi" ? "रिलायंस क्वांट & VWAP" : "Reliance Quant & VWAP"}
          </span>
          <span
            className="suggest-pill"
            onClick={() =>
              handlePromptClick(
                language === "hindi"
                  ? "क्या टाटा मोटर्स को मौजूदा स्तर पर खरीदना चाहिए और रिस्क-रिवॉर्ड कैसा है?"
                  : "Should I buy or sell Tata Motors at current levels and what is the risk-reward ratio?"
              )
            }
          >
            {language === "hindi" ? "टाटा मोटर्स Buy/Sell फैसला" : "Tata Motors Buy/Sell Verdict"}
          </span>
          <span
            className="suggest-pill"
            onClick={() =>
              handlePromptClick(
                language === "hindi"
                  ? "क्रूड ऑयल 30% बढ़ने का पेंट और एविएशन सेक्टर पर क्या डोमिनो इफेक्ट होगा?"
                  : "What is the domino ripple effect on Paint and Aviation if Crude Oil surges 30%?"
              )
            }
          >
            {language === "hindi" ? "क्रूड 30% डोमिनो रिपल" : "Crude 30% Domino Ripple"}
          </span>
          <span
            className="suggest-pill"
            onClick={() =>
              handlePromptClick(
                language === "hindi"
                  ? "क्या किसी कंपनी में कैश फ्लो डाइवर्जेंस या फॉरेंसिक रेड फ्लैग है?"
                  : "Does Reliance or Adani show any forensic cash flow divergence or red flags?"
              )
            }
          >
            {language === "hindi" ? "फॉरेंसिक रेड फ्लैग ऑडिट" : "Forensic Audit & Red Flags"}
          </span>
        </div>

        {/* WhatsApp-Style Input Bar */}
        <div className="assist-input-bar">
          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type="text"
              placeholder={
                isMicMuted
                  ? "🔒 Mic is muted. Type question here..."
                  : isListening
                    ? "Listening... Speak your question now..."
                    : isProcessing
                      ? "Alex is analyzing..."
                      : `Ask Alex in ${language === "hindi" ? "Hindi" : "English"}...`
              }
              value={isListening ? liveTranscript : chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              disabled={isProcessing}
              style={{
                width: "100%",
                background: isMicMuted
                  ? "rgba(16,27,51,.04)"
                  : isListening
                    ? "rgba(161,69,69,.08)"
                    : "var(--cream, #FAF8F2)",
                borderColor: isMicMuted
                  ? "var(--line)"
                  : isListening
                    ? "var(--rose)"
                    : "var(--line)",
              }}
            />
            {isListening && !isMicMuted && (
              <span className="alex-rec-indicator">
                <i className="rec-dot"></i>
                REC
              </span>
            )}
          </div>

          {/* WhatsApp-style Mic Button on Right with sleek SVG */}
          <button
            type="button"
            className={`assist-mic-btn ${isListening && !isMicMuted ? "active" : ""}`}
            title={
              isMicMuted
                ? "Microphone is muted. Click to unmute and speak."
                : isListening
                  ? "Tap to pause voice"
                  : "Tap to speak to Alex"
            }
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
              <MicOffIcon size={16} color="#fff" />
            ) : (
              <MicIcon
                size={16}
                color={isListening ? "#fff" : "var(--navy)"}
                fill={isListening ? "#fff" : "rgba(16,27,51,0.2)"}
              />
            )}
          </button>

          {/* Send Button if text is typed manually */}
          {chatInput.trim() && !isListening && (
            <button
              className="assist-send-btn"
              onClick={handleSendChat}
              disabled={isProcessing}
              title="Send to Alex"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
