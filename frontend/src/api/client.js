const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const apiClient = {
  // Generic HTTP helpers
  async get(endpoint) {
    const res = await fetch(`${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`);
    if (!res.ok) throw new Error(`GET ${endpoint} failed`);
    return await res.json();
  },

  async post(endpoint, data = {}) {
    const res = await fetch(`${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed`);
    return await res.json();
  },
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
  async getMarketRadarRecommendations() {
    const res = await fetch(`${API_BASE_URL}/api/stocks/radar/recommendations`);
    if (!res.ok) throw new Error("Failed to fetch market radar");
    return await res.json();
  },

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

  async getSectorIntelligence(symbol) {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/sector-intelligence`);
    if (!res.ok) throw new Error("Failed to fetch sector intelligence");
    return await res.json();
  },

  async getSmartAlertIntelligence(symbol, lookback = "3M") {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/smart-alert-intelligence?lookback=${encodeURIComponent(lookback)}`);
    if (!res.ok) throw new Error("Failed to fetch smart alert intelligence");
    return await res.json();
  },

  async getCandlestickIntelligence(symbol) {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/candlestick-intelligence`);
    if (!res.ok) throw new Error("Failed to fetch candlestick intelligence");
    return await res.json();
  },

  async askCandlestickCopilot(symbol, question, history = []) {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/candlestick-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history })
    });
    if (!res.ok) throw new Error("Failed to query candlestick copilot");
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

  async simulatePortfolio({
    symbol = "ADANIENT",
    investment = 100000,
    startDate = "2026-08-03",
    endDate = "2026-09-03",
    investmentType = "lumpsum",
    benchmark = "NIFTY 50",
    reinvestDividend = false,
  } = {}) {
    const res = await fetch(`${API_BASE_URL}/api/portfolio/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol,
        investment,
        start_date: startDate,
        end_date: endDate,
        investment_type: investmentType,
        benchmark,
        reinvest_dividend: reinvestDividend,
      }),
    });
    if (!res.ok) throw new Error("Simulation failed");
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

  async askNewsCopilot(query, newsId = null, history = []) {
    const res = await fetch(`${API_BASE_URL}/api/news/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, news_id: newsId, history }),
    });
    if (!res.ok) throw new Error("Failed to query news copilot");
    return await res.json();
  },
};
