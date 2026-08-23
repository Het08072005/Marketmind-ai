const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const apiClient = {
  // Voice Endpoints
  async transcribeAudio(audioBlob, language = "en") {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("language", language);

    const response = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Transcription failed");
    return await response.json();
  },

  async sendVoiceChat({ message, language = "en", voice_gender = "female", ticker = null }) {
    const response = await fetch(`${API_BASE_URL}/api/voice/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, language, voice_gender, ticker }),
    });
    if (!response.ok) throw new Error("Voice chat failed");
    return await response.json();
  },

  // Stock & Intelligence Endpoints
  async getStocks() {
    const res = await fetch(`${API_BASE_URL}/api/stocks`);
    return await res.json();
  },

  async getStock(symbol) {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}`);
    return await res.json();
  },

  async getDominoTrace(event) {
    const res = await fetch(`${API_BASE_URL}/api/domino/trace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    });
    return await res.json();
  },

  async getTrustAudit(symbol) {
    const res = await fetch(`${API_BASE_URL}/api/trust/${symbol}`);
    return await res.json();
  },

  async getNews(filter = "All") {
    const res = await fetch(`${API_BASE_URL}/api/news?filter=${filter}`);
    return await res.json();
  },

  async getLiveNews(query) {
    const res = await fetch(`${API_BASE_URL}/api/news/live?query=${encodeURIComponent(query)}`);
    return await res.json();
  },
};
