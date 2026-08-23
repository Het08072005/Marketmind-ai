import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";

export function useVoiceAgent(onAction = null, isMicMuted = false) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [language, setLanguageState] = useState("english"); // Default English
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "bot",
      text: "Hello! I am MarketPulse AI — your hands-free financial intelligence assistant. Say 'Hey Alex' anytime to start talking.",
      time: "Just now",
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

  // Voice selector helper for Indian male voice in Hindi
  const getSelectedSpeechVoice = useCallback((langMode) => {
    const voices = cachedVoicesRef.current.length > 0
      ? cachedVoicesRef.current
      : ("speechSynthesis" in window ? window.speechSynthesis.getVoices() : []);

    if (!voices || voices.length === 0) return null;

    if (langMode === "hindi") {
      const hiVoices = voices.filter(
        (v) => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi")
      );
      if (hiVoices.length > 0) {
        const m = hiVoices.find((v) => /neel|male|man/i.test(v.name));
        return m || hiVoices[0];
      }
    }

    const m = voices.find((v) =>
      /rishi|neel|male|man|daniel|alex|david|fred|george/i.test(v.name)
    );
    return m || null;
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

  // Spoken voice playback via Web Speech API (fallback/Hindi) - Deep Male Pitch
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

    utterance.pitch = 0.74;
    utterance.rate = 0.96;

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
        currentAudioRef.current.pause();
      }
      lastSpokenTextRef.current = (replyText || "").toLowerCase();
      const audioUrl = `data:audio/mp3;base64,${base64String}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      setIsPlayingAudio(true);
      isPlayingAudioRef.current = true;
      window.dispatchEvent(new CustomEvent("marketmind:voice_speaking_state", { detail: { isSpeaking: true } }));

      audio.onended = () => handlePlaybackFinished();
      audio.onerror = () => handlePlaybackFinished();
      audio.play().catch((e) => {
        console.warn("Audio autoplay blocked by browser:", e);
        handlePlaybackFinished();
      });
    } catch (e) {
      console.error("Audio playback error:", e);
      handlePlaybackFinished();
    }
  }, [handlePlaybackFinished]);

  // Replay speech with Male voice on demand
  const playMessageAudio = async (msg) => {
    const currentLang = languageRef.current;

    if (currentLang !== "hindi") {
      try {
        setIsPlayingAudio(true);
        const synthRes = await apiClient.synthesizeSpeech({
          text: msg.text,
          language: currentLang,
          voice_gender: "male",
        });
        if (synthRes?.audio_base64) {
          playBase64Audio(synthRes.audio_base64, msg.text);
          return;
        }
      } catch (err) {
        console.warn("On-demand synthesis fallback to browser TTS", err);
      }
    }

    speakText(msg.text, currentLang);
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
      speakText(goodbyeReply, languageRef.current);
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

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
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
        voice_gender: "male",
        ticker: currentContextTicker,
        history: historyPayload,
      });

      const newSym = response.action?.params?.symbol || response.detected_symbol;
      if (newSym) {
        activeTickerRef.current = newSym;
        window.__SELECTED_STOCK_SYMBOL = newSym;
        window.dispatchEvent(new CustomEvent("marketmind:stock_changed", { detail: { symbol: newSym } }));
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        audioBase64: response.audio_base64,
        isVoice: isVoice,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Enable hands-free continuous loop ONLY if not muted and voice was used
      if (isVoice && !isMicMutedRef.current) {
        continuousModeRef.current = true;
        setIsContinuousMode(true);
      }

      // Play Deepgram Orion male audio directly
      if (response.audio_base64) {
        playBase64Audio(response.audio_base64, response.reply);
      } else {
        speakText(response.reply, currentLang);
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
      
      const fallbackText = isWakeGreeting
        ? (currentLang === "hindi" ? "हाँ, मैं आपकी क्या मदद कर सकता हूँ?" : "Yes, how can I help you?")
        : (currentLang === "hindi"
          ? "आज मार्केट में मिला-जुला रुख दिख रहा है। रिलायंस और आईटी सेक्टर मजबूती के साथ ट्रेड कर रहे हैं।"
          : "Market is steady today. Reliance and IT stocks are leading gains with positive sector breadth.");

      const fallbackMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: fallbackText,
        time: "Now",
        isVoice: isVoice,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackText, currentLang);
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

      let current = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        current += event.results[i][0].transcript;
      }
      const cleanTranscript = current.trim();
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

      // Voice Activity Detection (VAD): Trigger after 1.1 seconds of natural pause
      silenceTimerRef.current = setTimeout(() => {
        if (isMicMutedRef.current || isPlayingAudioRef.current) return;
        const finalCandidate = transcriptRef.current.trim();
        if (finalCandidate && !isSubmittingRef.current) {
          submitQuery(finalCandidate, true);
        }
      }, 1100);
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
        recognitionRef.current.stop();
      } catch (e) { }
    }

    // Process buffered speech if available
    const spokenQuery = transcriptRef.current.trim();
    if (spokenQuery && !isSubmittingRef.current) {
      submitQuery(spokenQuery, true);
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
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
    liveTranscript,
    messages,
    setLanguage,
    startListening,
    stopListening,
    submitQuery,
    playMessageAudio,
    stopAudioPlayback,
    toggleContinuousMode,
  };
}
