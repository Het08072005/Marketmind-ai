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

  async sendVoiceChat({ message, language = "english", voice_gender = "male", ticker = null, history = [] }) {
    const response = await fetch(`${API_BASE_URL}/api/voice/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, language, voice_gender, ticker, history }),
    });
    if (!response.ok) throw new Error("Voice chat failed");
    return await response.json();
  },

  async synthesizeSpeech({ text, language = "english", voice_gender = "male" }) {
    const response = await fetch(`${API_BASE_URL}/api/voice/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, voice_gender }),
    });
    if (!response.ok) throw new Error("Speech synthesis failed");
    return await response.json();
  },

  // Live Stock Quotes & 30-Day Historical Candles
  async getStocks() {
    const res = await fetch(`${API_BASE_URL}/api/stocks`);
    return await res.json();
  },

  async getStock(symbol) {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}`);
    return await res.json();
  },

  async getStockHistory(symbol, period = "1mo") {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/history?period=${period}`);
    return await res.json();
  },

  // Institutional AI Report Generator
  async generateReport(symbol, reportType = "Company Snapshot") {
    const res = await fetch(`${API_BASE_URL}/api/reports/generate?symbol=${encodeURIComponent(symbol)}&report_type=${encodeURIComponent(reportType)}`);
    if (!res.ok) throw new Error("Failed to generate report");
    return await res.json();
  },

  // Virtual Portfolio Endpoints
  async getPortfolio() {
    const res = await fetch(`${API_BASE_URL}/api/portfolio`);
    return await res.json();
  },

  async executeTrade({ symbol, shares, side = "BUY" }) {
    const res = await fetch(`${API_BASE_URL}/api/portfolio/trade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, shares, side }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Trade failed");
    }
    return await res.json();
  },

  async resetPortfolio() {
    const res = await fetch(`${API_BASE_URL}/api/portfolio/reset`, {
      method: "POST",
    });
    return await res.json();
  },

  // Intelligence & Domino Endpoints
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

  async getForensicAudit(symbol) {
    const res = await fetch(`${API_BASE_URL}/api/forensic/${symbol}`);
    return await res.json();
  },

  // Live News Feeds
  async getNews(filter = "All") {
    const res = await fetch(`${API_BASE_URL}/api/news?filter=${encodeURIComponent(filter)}`);
    return await res.json();
  },

  async getLiveNews(query = "") {
    const res = await fetch(`${API_BASE_URL}/api/news/live?query=${encodeURIComponent(query)}`);
    return await res.json();
  },
};
