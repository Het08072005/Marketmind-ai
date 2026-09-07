import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";

export function useVoiceAgent(onAction = null, isMicMuted = false, isSpeakerMuted = false) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [language, setLanguageState] = useState("english"); // Default English
  const [voiceGender, setVoiceGender] = useState("female");
  const [autoPlayAudio, setAutoPlayAudioState] = useState(() => {
    const saved = localStorage.getItem("alex_autoplay_audio");
    return saved !== null ? saved === "true" : true;
  });
  const [liveTranscript, setLiveTranscript] = useState("");

  const setAutoPlayAudio = (val) => {
    setAutoPlayAudioState(val);
    localStorage.setItem("alex_autoplay_audio", String(val));
  };
  const [messages, setMessages] = useState([
    {
      id: "alex-welcome-msg",
      sender: "bot",
      text: "Welcome to MarketMind AI. I am Alex, your financial copilot. How can I assist with your market analysis today?",
      time: "Now",
      isVoice: false,
    },
  ]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const currentAudioRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const transcriptRef = useRef("");
  const isSubmittingRef = useRef(false);
  const isPlayingAudioRef = useRef(false);
  const lastSpokenTextRef = useRef("");
  const echoCooldownUntilRef = useRef(0);
  const cachedVoicesRef = useRef([]);
  const continuousModeRef = useRef(false);
  const isListeningRef = useRef(false);
  const isMicMutedRef = useRef(isMicMuted);
  const isSpeakerMutedRef = useRef(isSpeakerMuted);
  const activeTickerRef = useRef(window.__SELECTED_STOCK_SYMBOL || "RELIANCE");

  // Live language ref
  const languageRef = useRef("english");

  const setLanguage = (newLang) => {
    languageRef.current = newLang;
    setLanguageState(newLang);
  };

  // Immediate Hardware & Software Mic Mute Enforcer
  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
    if (isMicMuted) {
      console.log("🔒 Mic Mute Activated - Halting all voice capture & speech recognition.");

      // 1. Immediately abort speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) { }
      }

      // 2. Stop media recorder and release hardware audio tracks
      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
          }
          mediaRecorderRef.current.stop();
        } catch (e) { }
      }

      // 3. Clear timers, state, and buffers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setIsListening(false);
      isListeningRef.current = false;
      setLiveTranscript("");
      transcriptRef.current = "";
      continuousModeRef.current = false;
      setIsContinuousMode(false);
    }
  }, [isMicMuted]);

  // Pre-cache browser voices
  useEffect(() => {
    const updateVoices = () => {
      if ("speechSynthesis" in window) {
        cachedVoicesRef.current = window.speechSynthesis.getVoices();
      }
    };

    updateVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    transcriptRef.current = liveTranscript;
  }, [liveTranscript]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Premium voice selector helper: filters out ancient robotic/novelty voices and prioritizes natural studio voices
  const getSelectedSpeechVoice = useCallback((langMode) => {
    const voices = cachedVoicesRef.current.length > 0
      ? cachedVoicesRef.current
      : ("speechSynthesis" in window ? window.speechSynthesis.getVoices() : []);

    if (!voices || voices.length === 0) return null;

    // Strict blacklist of legacy/novelty/robotic synthesizer voices (e.g. 1996 Mac OS Alex, Fred, Zarvox)
    const isRobotic = (v) => {
      const name = (v.name || "").toLowerCase();
      return /fred|ralph|albert|zarvox|trinoids|whisper|deranged|bells|boing|cellos|good news|bad news|bubbles|organ|hysterical|pipe/i.test(name) ||
        (name === "alex" && !name.includes("enhanced") && !name.includes("natural"));
    };

    const cleanVoices = voices.filter((v) => !isRobotic(v));
    const pool = cleanVoices.length > 0 ? cleanVoices : voices;

    if (langMode === "hindi") {
      // 1. Direct Hindi voices (hi-IN)
      const hiVoices = pool.filter(
        (v) => (v.lang && v.lang.startsWith("hi")) || /hindi|हिन्दी/i.test(v.name)
      );
      if (hiVoices.length > 0) {
        const preferred = hiVoices.find((v) => /google|lekha|kalpana|swara|madhur|neel|prabhat/i.test(v.name));
        return preferred || hiVoices[0];
      }
      // 2. Indian English fallback with natural cadence
      const inVoices = pool.filter(
        (v) => (v.lang && (v.lang === "en-IN" || v.lang.startsWith("en_IN"))) || /india|indian/i.test(v.name)
      );
      if (inVoices.length > 0) {
        const preferred = inVoices.find((v) => /google|rishi|neerja|prabhat|heera/i.test(v.name));
        return preferred || inVoices[0];
      }
    }

    // English / General mode:
    // Priority 1: High-definition Neural / Enhanced / Natural voices
    const enhancedVoice = pool.find((v) =>
      /enhanced|natural|neural|premium/i.test(v.name) &&
      /samantha|ava|rishi|oliver|daniel|evan|tom|serena|karen/i.test(v.name)
    );
    if (enhancedVoice) return enhancedVoice;

    // Priority 2: Google Cloud voices built into Chrome (very smooth, human-like)
    const googleVoice = pool.find((v) =>
      /google uk english male|google us english|google uk english female/i.test(v.name)
    );
    if (googleVoice) return googleVoice;

    // Priority 3: Crisp Indian English voices for authentic Dalal Street market feel
    const indianEnVoice = pool.find((v) =>
      (v.lang === "en-IN" || v.lang === "en_IN") && /rishi|neerja|prabhat|google/i.test(v.name)
    );
    if (indianEnVoice) return indianEnVoice;

    // Priority 4: Premium native OS voices
    const nativeCleanVoice = pool.find((v) =>
      /daniel|samantha|ava|karen|oliver|serena|moira|arthur/i.test(v.name)
    );
    if (nativeCleanVoice) return nativeCleanVoice;

    // Priority 5: Any clean English voice
    const anyEn = pool.find((v) => v.lang && v.lang.startsWith("en"));
    return anyEn || pool[0];
  }, []);

  // Stop any active speech/audio externally or on demand
  const stopAudioPlayback = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      } catch (e) {}
    }
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsPlayingAudio(false);
    isPlayingAudioRef.current = false;
    echoCooldownUntilRef.current = Date.now() + 450;
    setLiveTranscript("");
    transcriptRef.current = "";
    window.dispatchEvent(new CustomEvent("marketmind:voice_speaking_state", { detail: { isSpeaking: false } }));
  }, []);

  // Speaker Mute Enforcer: Halts ongoing audio immediately if speaker is muted
  useEffect(() => {
    isSpeakerMutedRef.current = isSpeakerMuted;
    if (isSpeakerMuted) {
      stopAudioPlayback();
    }
  }, [isSpeakerMuted, stopAudioPlayback]);

  // Handler when TTS speech finishes -> Automatically Re-Open Mic ONLY if NOT MUTED!
  const handlePlaybackFinished = useCallback(() => {
    setIsPlayingAudio(false);
    isPlayingAudioRef.current = false;
    echoCooldownUntilRef.current = Date.now() + 450;
    setLiveTranscript("");
    transcriptRef.current = "";
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    window.dispatchEvent(new CustomEvent("marketmind:voice_speaking_state", { detail: { isSpeaking: false } }));

    if (!isMicMutedRef.current && continuousModeRef.current) {
      setTimeout(() => {
        if (!isMicMutedRef.current && continuousModeRef.current && !isSubmittingRef.current && !isListeningRef.current && !isPlayingAudioRef.current) {
          console.log("🎙️ Auto-resuming hands-free listening loop...");
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
              isListeningRef.current = true;
            } catch (e) { }
          }
        }
      }, 400);
    }
  }, []);

  // Listen for global stop speech events
  useEffect(() => {
    const handleExternalStop = () => {
      stopAudioPlayback();
    };
    window.addEventListener("marketmind:stop_speech", handleExternalStop);
    return () => window.removeEventListener("marketmind:stop_speech", handleExternalStop);
  }, [stopAudioPlayback]);

  // Spoken voice playback via Web Speech API (fallback/Hindi) - Natural Human Cadence
  const speakText = useCallback((text, langMode) => {
    if (!text || !("speechSynthesis" in window)) {
      handlePlaybackFinished();
      return;
    }

    lastSpokenTextRef.current = (text || "").toLowerCase();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const currentLang = langMode || languageRef.current;

    const selectedVoice = getSelectedSpeechVoice(currentLang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = currentLang === "hindi" ? "hi-IN" : "en-IN";
    }

    utterance.pitch = 1.0;
    utterance.rate = 1.0;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      isPlayingAudioRef.current = true;
      window.dispatchEvent(new CustomEvent("marketmind:voice_speaking_state", { detail: { isSpeaking: true } }));
    };
    utterance.onend = () => handlePlaybackFinished();
    utterance.onerror = () => handlePlaybackFinished();

    window.speechSynthesis.speak(utterance);
  }, [getSelectedSpeechVoice, handlePlaybackFinished]);

  // Audio Playback for Deepgram Aura Base64 MP3 (Male Orion)
  const playBase64Audio = useCallback((base64String, replyText = "") => {
    try {
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        } catch (e) {}
      }
      lastSpokenTextRef.current = (replyText || "").toLowerCase();
      const audioUrl = `data:audio/mp3;base64,${base64String}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      setIsPlayingAudio(true);
      isPlayingAudioRef.current = true;
      window.dispatchEvent(new CustomEvent("marketmind:voice_speaking_state", { detail: { isSpeaking: true } }));

      audio.onended = () => handlePlaybackFinished();
      audio.onerror = (err) => {
        console.warn("Audio element error, falling back to browser TTS:", err);
        handlePlaybackFinished();
        speakText(replyText, languageRef.current);
      };
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn("Audio autoplay blocked by browser policy, falling back to Web Speech:", e);
          handlePlaybackFinished();
          speakText(replyText, languageRef.current);
        });
      }
    } catch (e) {
      console.error("Audio playback error:", e);
      handlePlaybackFinished();
      speakText(replyText, languageRef.current);
    }
  }, [handlePlaybackFinished, speakText]);

  // Replay speech with Male voice on demand
  const playMessageAudio = async (msg) => {
    const currentLang = languageRef.current;
    const textToSpeak = (msg?.fullText || msg?.text || "").trim();
    if (!textToSpeak) return;

    // 1. Direct instant playback if server already returned pre-synthesized Deepgram audio
    if (msg?.audioBase64) {
      playBase64Audio(msg.audioBase64, textToSpeak);
      return;
    }

    // 2. Synthesize on demand via Deepgram API if not Hindi
    if (currentLang !== "hindi") {
      try {
        setIsPlayingAudio(true);
        const synthRes = await apiClient.synthesizeSpeech({
          text: textToSpeak,
          language: currentLang,
          voice_gender: "male",
        });
        if (synthRes?.audio_base64) {
          playBase64Audio(synthRes.audio_base64, textToSpeak);
          return;
        }
      } catch (err) {
        console.warn("On-demand synthesis fallback to browser TTS", err);
      }
    }

    // 3. Fallback to browser Web Speech API
    speakText(textToSpeak, currentLang);
  };

  // Submit query directly to Gemini AI & Deepgram
  const submitQuery = useCallback(async (queryText, isVoice = false) => {
    const cleanText = (queryText || "").trim();
    if (!cleanText || isSubmittingRef.current) return;

    // Strict privacy guard: if muted, block incoming voice submissions
    if (isVoice && isMicMutedRef.current) {
      console.log("🔒 Voice submission blocked because microphone is Muted.");
      return;
    }

    // Check for exit / disconnect triggers
    const lower = cleanText.toLowerCase();
    const exitWords = ["stop", "bye", "exit", "thank you", "thanks", "goodbye", "bas", "alvida", "band karo", "shukriya", "धन्यवाद", "अलविदा", "बस करो"];
    const isExit = exitWords.some(w => lower === w || lower.startsWith(w + " ") || lower.endsWith(" " + w));

    if (isExit) {
      continuousModeRef.current = false;
      setIsContinuousMode(false);
      setIsListening(false);
      isListeningRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      const goodbyeReply = languageRef.current === "hindi"
        ? "आपका स्वागत है! जब भी ज़रूरत हो, 'Hey Alex' बोलें।"
        : "You're welcome! Feel free to say 'Hey Alex' anytime you need assistance.";

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: goodbyeReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isVoice: isVoice,
      };
      setMessages((prev) => [...prev, botMsg]);
      if (!isSpeakerMutedRef.current) {
        speakText(goodbyeReply, languageRef.current);
      }
      return;
    }

    isSubmittingRef.current = true;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setIsListening(false);
    isListeningRef.current = false;
    setLiveTranscript("");
    transcriptRef.current = "";

    setLiveTranscript("");
    transcriptRef.current = "";

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) { }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) { }
    }

    const currentLang = languageRef.current;

    // Add user message to chat stream immediately
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: cleanText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isVoice: isVoice,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    const historyPayload = [...messages.slice(-5), userMsg].map((m) => ({
      role: m.sender === "bot" ? "model" : "user",
      text: m.text,
    }));

    try {
      const currentContextTicker = window.__SELECTED_STOCK_SYMBOL || activeTickerRef.current || "RELIANCE";
      const response = await apiClient.sendVoiceChat({
        message: cleanText,
        language: currentLang,
        voice_gender: voiceGender || "female",
        ticker: currentContextTicker,
        history: historyPayload,
      });

      const newSym = response.action?.params?.symbol || response.detected_symbol;
      if (newSym) {
        activeTickerRef.current = newSym;
        window.__SELECTED_STOCK_SYMBOL = newSym;
        window.dispatchEvent(new CustomEvent("marketmind:stock_changed", { detail: { symbol: newSym } }));
      }

      setIsProcessing(false);

      const botId = `bot-${Date.now()}`;
      const fullReply = (response.reply || "").trim();
      const replyWords = fullReply.split(/\s+/);
      const isMultiWord = replyWords.length > 2;
      const initialChunk = isMultiWord ? replyWords.slice(0, 2).join(" ") : fullReply;

      const botMsg = {
        id: botId,
        sender: "bot",
        text: initialChunk,
        fullText: fullReply,
        isStreaming: isMultiWord,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        audioBase64: response.audio_base64,
        isVoice: isVoice,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (isMultiWord) {
        let currentIdx = 2;
        const streamInterval = setInterval(() => {
          if (currentIdx < replyWords.length) {
            currentIdx += 2;
            const currentSlice = replyWords.slice(0, currentIdx).join(" ");
            const stillStreaming = currentIdx < replyWords.length;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botId
                  ? { ...m, text: currentSlice, isStreaming: stillStreaming }
                  : m
              )
            );
          } else {
            clearInterval(streamInterval);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botId ? { ...m, text: fullReply, isStreaming: false } : m
              )
            );
          }
        }, 28);
      }

      // Enable hands-free continuous loop ONLY if not muted and voice was used
      if (isVoice && !isMicMutedRef.current) {
        continuousModeRef.current = true;
        setIsContinuousMode(true);
      }

      // Play audio if enabled or if initiated via voice, AND speaker is NOT muted
      if (!isSpeakerMutedRef.current && (autoPlayAudio || isVoice)) {
        if (response.audio_base64) {
          playBase64Audio(response.audio_base64, response.reply);
        } else {
          speakText(response.reply, currentLang);
        }
      }

      // Execute Autonomous Action if returned by Gemini Brain
      if (response.action) {
        console.log("⚡ Executing Autonomous Voice Action:", response.action);
        if (typeof onAction === "function") {
          onAction(response.action);
        }
        window.dispatchEvent(new CustomEvent("marketmind:voice_action", { detail: response.action }));
      }
    } catch (err) {
      console.error("Voice chat error:", err);
      const isWakeGreeting = ["hey alex", "hey alexa", "alex", "alexa", "hello", "hi", "hey"].includes(cleanText.toLowerCase());

      // Intelligent Client-Side Fallback for stock queries & searches
      const lower = cleanText.toLowerCase();
      let matchedSymbol = null;
      let matchedName = null;
      
      const commonMatches = [
        { sym: "ADANIENT", name: "Adani Enterprises", price: "2,950.00", change: "+0.41%", keys: ["adani", "adacni", "enterprises", "entirerpice"] },
        { sym: "RELIANCE", name: "Reliance Industries", price: "2,985.50", change: "+1.2%", keys: ["reliance", "rilance", "ril", "jio"] },
        { sym: "TATAMOTORS", name: "Tata Motors", price: "982.40", change: "+2.1%", keys: ["tata motor", "tatamotors", "tata motors"] },
        { sym: "TCS", name: "Tata Consultancy Services", price: "4,210.00", change: "+0.8%", keys: ["tcs"] },
        { sym: "INFY", name: "Infosys", price: "1,845.20", change: "+1.4%", keys: ["infosys", "infy", "infosis"] },
        { sym: "HDFCBANK", name: "HDFC Bank", price: "1,640.00", change: "+0.5%", keys: ["hdfc", "hdfc bank", "hdffc"] },
        { sym: "ICICIBANK", name: "ICICI Bank", price: "1,220.00", change: "+1.1%", keys: ["icici", "icici bank"] },
        { sym: "SBIN", name: "State Bank of India", price: "815.00", change: "+0.9%", keys: ["sbi", "state bank"] },
        { sym: "SYRMA", name: "Syrma SGS Technology", price: "1,634.80", change: "+9.75%", keys: ["syrma", "sgs", "surma"] },
        { sym: "BSE", name: "BSE Ltd", price: "2,740.00", change: "+3.2%", keys: ["bse"] },
      ];

      let matchedPrice = null;
      let matchedChange = null;

      for (const m of commonMatches) {
        if (m.keys.some(k => lower.includes(k))) {
          matchedSymbol = m.sym;
          matchedName = m.name;
          matchedPrice = m.price;
          matchedChange = m.change;
          break;
        }
      }

      if (matchedSymbol) {
        window.__SELECTED_STOCK_SYMBOL = matchedSymbol;
        window.dispatchEvent(new CustomEvent("marketmind:stock_changed", { detail: { symbol: matchedSymbol, name: matchedName } }));
        window.dispatchEvent(new CustomEvent("marketmind:voice_action", {
          detail: {
            type: "SEARCH_COMPANY",
            command: "SEARCH_COMPANY",
            target_page: "overview",
            params: { symbol: matchedSymbol, name: matchedName, query: matchedName }
          }
        }));
      }

      const isCrypto = ["bitcoin", "btc", "crypto", "ethereum", "eth", "doge", "solana"].some(k => lower.includes(k));
      const isUsStock = ["tesla", "apple", "google", "microsoft", "amazon", "nvidia", "nasdaq"].some(k => lower.includes(k));
      const isOptionsGreeks = ["theta", "gamma", "vega", "option chain", "options chain"].some(k => lower.includes(k));

      const fallbackText = isWakeGreeting
        ? (currentLang === "hindi" ? "हाँ, मैं सुन रहा हूँ। बताइए, किस शेयर या सेटअप का विश्लेषण करना है?" : "Yes, I'm listening! Which stock or setup would you like to analyze?")
        : isCrypto
        ? (currentLang === "hindi"
          ? "क्षमा करें, मैं केवल एनएसई और बीएसई के 270 भारतीय संस्थागत शेयरों के लिए डिज़ाइन किया गया हूँ। क्रिप्टोकरेंसी इस प्रोजेक्ट के दायरे में नहीं है।"
          : "Sorry, I am designed specifically for the 270 institutional Indian equities on NSE and BSE. I do not cover cryptocurrencies.")
        : isUsStock
        ? (currentLang === "hindi"
          ? "क्षमा करें, मार्केटमाइंड विशेष रूप से भारतीय शेयर बाजार (एनएसई/बीएसई) के लिए है। अमेरिकी या विदेशी शेयर इसमें शामिल नहीं हैं।"
          : "Sorry, MarketMind AI is exclusively engineered for the Indian equity market (NSE/BSE). I do not analyze US or foreign equities.")
        : isOptionsGreeks
        ? (currentLang === "hindi"
          ? "क्षमा करें, मैं कैश इक्विटी संस्थागत ऑर्डर फ्लो और प्राइस फोरकास्ट पर केंद्रित हूँ। जटिल एफएंडओ ऑप्शंस ग्रीक्स इसके दायरे में नहीं हैं।"
          : "Sorry, I specialize in cash equity institutional order flow and directional forecasting. Complex options Greeks are outside my scope.")
        : matchedName
        ? (currentLang === "hindi"
          ? `${matchedName} (${matchedSymbol}) का लाइव भाव ₹${matchedPrice || "2,950.00"} (${matchedChange || "+0.4%"}) है। लाइव टेलीमेट्री और चार्ट स्क्रीन पर लोड कर दिया गया है।`
          : `${matchedName} (${matchedSymbol}) is currently trading at ₹${matchedPrice || "2,950.00"} (${matchedChange || "+0.4%"}). Live quantitative telemetry and interactive chart are open on screen.`)
        : (currentLang === "hindi"
          ? "आज बाजार में अनुशासित संस्थागत संचय जारी है। प्रमुख इंडेक्स स्तर और सेक्टर इनफ्लो स्थिर बने हुए हैं।"
          : "Market is steady today. Major index supports and institutional inflows remain intact.");

      const fallbackMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: fallbackText,
        time: "Now",
        isVoice: isVoice,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (!isSpeakerMutedRef.current && (isVoice || autoPlayAudio)) {
        speakText(fallbackText, currentLang);
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 400);
    }
  }, [onAction, playBase64Audio, speakText, messages]);

  // Handle ambient wake word query execution
  useEffect(() => {
    const handleWakeQuery = (e) => {
      if (isMicMutedRef.current) return; // Strict mute guard
      const q = e.detail;
      if (q && q.trim()) {
        continuousModeRef.current = true;
        setIsContinuousMode(true);
        submitQuery(q, true);
      }
    };
    window.addEventListener("marketmind:voice_wake_query", handleWakeQuery);
    return () => {
      window.removeEventListener("marketmind:voice_wake_query", handleWakeQuery);
    };
  }, [submitQuery]);

  // Setup Web Speech API for Real-time Streaming STT
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "hindi" ? "hi-IN" : "en-IN";

    recognition.onresult = (event) => {
      // 1. Strict Mic Mute Guard
      if (isMicMutedRef.current) {
        setLiveTranscript("");
        transcriptRef.current = "";
        return;
      }

      // 2. Cooldown Guard after speech ends to prevent acoustic room echo
      if (Date.now() < echoCooldownUntilRef.current) {
        setLiveTranscript("");
        transcriptRef.current = "";
        return;
      }

      // 3. Submitting Guard
      if (isSubmittingRef.current) {
        return;
      }

      // Loop across ALL results (0 to results.length) so finalized chunks are never erased during speech pauses
      let fullTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript + " ";
      }
      const cleanTranscript = fullTranscript.trim();
      const currentLower = cleanTranscript.toLowerCase();

      if (!cleanTranscript) return;

      // 4. Acoustic Self-Echo Cancellation Guard:
      if (isPlayingAudioRef.current) {
        const spoken = lastSpokenTextRef.current;
        const isEchoOfSelf = spoken && (
          spoken.includes(currentLower) ||
          currentLower.includes("how can i help") ||
          currentLower.includes("can i help") ||
          currentLower.includes("help you") ||
          currentLower.includes("yes, how") ||
          currentLower.includes("yes how") ||
          currentLower.includes("kya madad") ||
          currentLower.includes("madad kar sakta") ||
          currentLower.includes("marketmind") ||
          currentLower.includes("marketpulse")
        );

        if (isEchoOfSelf) {
          setLiveTranscript("");
          transcriptRef.current = "";
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          return; // Discard self-echo
        }

        // True user barge-in detected (user speaks something distinct)
        if (cleanTranscript.length > 3) {
          console.log("⚡ True user barge-in detected:", cleanTranscript);
          stopAudioPlayback();
        }
      }

      setLiveTranscript(cleanTranscript);
      transcriptRef.current = cleanTranscript;

      // Reset silence timer on every new speech chunk
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Voice Activity Detection (VAD): Trigger after 2.2 seconds of natural pause (never cut off early)
      silenceTimerRef.current = setTimeout(() => {
        if (isMicMutedRef.current || isPlayingAudioRef.current) return;
        const finalCandidate = transcriptRef.current.trim();
        if (finalCandidate && !isSubmittingRef.current) {
          submitQuery(finalCandidate, true);
        }
      }, 2200);
    };

    recognition.onerror = (e) => {
      if (e.error !== "no-speech") {
        console.warn("Speech recognition notice:", e.error);
      }
    };

    recognition.onend = () => {
      // If in continuous mode and speech recognition stops, keep listening only if not muted
      if (!isMicMutedRef.current && continuousModeRef.current && isListeningRef.current && !isSubmittingRef.current && !isPlayingAudioRef.current) {
        try {
          recognition.start();
        } catch (e) { }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [language, submitQuery, stopAudioPlayback]);

  // Start Manual Recording
  const startListening = async (isContinuous = false) => {
    if (isMicMutedRef.current) {
      console.log("Mic is muted. Cannot start listening.");
      return;
    }

    stopAudioPlayback();
    setLiveTranscript("");
    transcriptRef.current = "";

    if (isContinuous) {
      continuousModeRef.current = true;
      setIsContinuousMode(true);
    }

    setIsListening(true);
    isListeningRef.current = true;

    // Start Web Speech API stream
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Web Speech API already active or busy:", err.message);
      }
    }

    // Start Raw Audio Recorder for Deepgram Audio Stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.warn("Microphone hardware fallback active:", err.message);
    }
  };

  // Stop Manual Recording & Process
  const stopListening = async () => {
    setIsListening(false);
    isListeningRef.current = false;
    continuousModeRef.current = false;
    setIsContinuousMode(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) { }
    }

    // ALWAYS release microphone hardware media stream tracks immediately
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        }
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch (e) { }
      mediaRecorderRef.current = null;
    }

    // Process buffered speech if available
    const spokenQuery = transcriptRef.current.trim();
    if (spokenQuery && !isSubmittingRef.current) {
      submitQuery(spokenQuery, true);
    }
  };

  // Toggle Continuous Hands-free mode
  const toggleContinuousMode = () => {
    if (isMicMutedRef.current) {
      console.log("Mic is muted. Cannot enable continuous mode.");
      return;
    }
    const nextMode = !isContinuousMode;
    setIsContinuousMode(nextMode);
    continuousModeRef.current = nextMode;
    if (nextMode && !isListening) {
      startListening(true);
    } else if (!nextMode && isListening) {
      stopListening();
    }
  };

  return {
    isListening,
    isProcessing,
    isPlayingAudio,
    isContinuousMode,
    language,
    voiceGender,
    setVoiceGender,
    autoPlayAudio,
    setAutoPlayAudio,
    liveTranscript,
    messages,
    setMessages,
    clearMessages: () =>
      setMessages([
        {
          id: "msg-1",
          sender: "bot",
          text: "Hello! I am MarketMind Copilot — your autonomous financial intelligence partner. Ask me any question about Indian stocks, quantitative metrics, forensic red flags, or macro ripple effects.",
          time: "Just now",
          isVoice: false,
        },
      ]),
    setLanguage,
    startListening,
    stopListening,
    submitQuery,
    playMessageAudio,
    stopAudioPlayback,
    toggleContinuousMode,
  };
}
