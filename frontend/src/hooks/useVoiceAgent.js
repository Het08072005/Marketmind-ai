import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";

export function useVoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [language, setLanguageState] = useState("english"); // Default English
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "bot",
      text: "Hello! I am MarketPulse AI — your real-time financial intelligence terminal. Ask me about Reliance, Tata Motors, Crude Oil Domino effects, or market conditions.",
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
  const cachedVoicesRef = useRef([]);

  // Live language ref
  const languageRef = useRef("english");

  const setLanguage = (newLang) => {
    languageRef.current = newLang;
    setLanguageState(newLang);
  };

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

  // Spoken voice playback via Web Speech API (fallback/Hindi) - Deep Male Pitch
  const speakText = useCallback((text, langMode) => {
    if (!text || !("speechSynthesis" in window)) return;

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

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  }, [getSelectedSpeechVoice]);

  // Audio Playback for Deepgram Aura Base64 MP3 (Male Orion)
  const playBase64Audio = (base64String) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      const audioUrl = `data:audio/mp3;base64,${base64String}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play().catch((e) => {
        console.warn("Audio autoplay blocked by browser:", e);
        setIsPlayingAudio(false);
      });
    } catch (e) {
      console.error("Audio playback error:", e);
      setIsPlayingAudio(false);
    }
  };

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
          playBase64Audio(synthRes.audio_base64);
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

    isSubmittingRef.current = true;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setIsListening(false);
    setLiveTranscript("");
    transcriptRef.current = "";

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    const currentLang = languageRef.current;

    // Add user message on the RIGHT
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: cleanText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isVoice: isVoice,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await apiClient.sendVoiceChat({
        message: cleanText,
        language: currentLang,
        voice_gender: "male",
      });

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        audioBase64: response.audio_base64,
        isVoice: isVoice,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Play Deepgram Orion male audio directly
      if (response.audio_base64) {
        playBase64Audio(response.audio_base64);
      } else {
        speakText(response.reply, currentLang);
      }
    } catch (err) {
      console.error("Voice chat error:", err);
      const fallbackText =
        currentLang === "hindi"
          ? "आज मार्केट में मिला-जुला रुख दिख रहा है। रिलायंस और आईटी सेक्टर मजबूती के साथ ट्रेड कर रहे हैं।"
          : "Market is steady today. Reliance and IT stocks are leading gains with positive sector breadth.";

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
  }, [speakText]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === "hindi" ? "hi-IN" : "en-IN";

      recognition.onresult = (event) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }

        const trimmed = fullTranscript.trim();
        if (trimmed && !isSubmittingRef.current) {
          setLiveTranscript(trimmed);
          transcriptRef.current = trimmed;

          // Auto-submit after 1.5s silence
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            if (
              !isSubmittingRef.current &&
              transcriptRef.current &&
              transcriptRef.current.trim().length > 2
            ) {
              const textToSend = transcriptRef.current.trim();
              submitQuery(textToSend, true);
            }
          }, 1500);
        }
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [language, submitQuery]);

  // Start Mic Recording
  const startListening = async () => {
    if (isSubmittingRef.current) return;

    try {
      setLiveTranscript("");
      transcriptRef.current = "";
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        if (!isSubmittingRef.current) {
          const currentText = transcriptRef.current.trim();
          if (currentText) {
            submitQuery(currentText, true);
          } else if (audioBlob.size > 1000) {
            try {
              setIsProcessing(true);
              const sttResult = await apiClient.transcribeAudio(audioBlob, languageRef.current);
              if (sttResult?.transcript?.trim()) {
                submitQuery(sttResult.transcript.trim(), true);
              } else {
                setIsProcessing(false);
              }
            } catch (e) {
              console.warn("STT error:", e);
              setIsProcessing(false);
            }
          }
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsListening(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn("Recognition already active", err);
        }
      }
    } catch (err) {
      console.error("Mic access failed:", err);
      setIsListening(false);
    }
  };

  // Stop Mic Recording
  const stopListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    const currentText = transcriptRef.current.trim();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      setIsListening(false);
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    } else {
      setIsListening(false);
      if (currentText && !isSubmittingRef.current) {
        submitQuery(currentText, true);
      }
    }
  };

  return {
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
    speakText,
    playBase64Audio,
    playMessageAudio,
  };
}
