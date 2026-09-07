// In production this must be the public HTTPS URL of the FastAPI service.
// Keeping localhost as a development-only default prevents a deployed Vercel
// site from silently trying to call the visitor's own computer.
const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

function apiUrl(path) {
  if (!API_BASE_URL) {
    throw new Error("Voice service is not configured. Set VITE_API_URL in Vercel to your public backend URL.");
  }
  return `${API_BASE_URL}${path}`;
}

export const apiClient = {
  // Generic HTTP helpers
  async get(endpoint) {
    const raw = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const path = raw.startsWith("/api/") ? raw : `/api${raw}`;
    const res = await fetch(`${API_BASE_URL}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return await res.json();
  },

  async getStockChart(symbol, timeframe = "1D") {
    const cleanSym = (symbol || "").toUpperCase().replace(".NS", "").replace(".BO", "").trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stocks/${cleanSym}/chart?timeframe=${timeframe}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`GET chart for ${cleanSym} failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(apiUrl("/api/voice/transcribe"), {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Deepgram transcription failed (${response.status})`);
    return await response.json();
  },

  async sendVoiceChat({ message, language = "english", voice_gender = "male", ticker = null, history = [] }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(apiUrl("/api/voice/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language, voice_gender, ticker, history }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Voice chat failed");
      return await response.json();
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  },

  async synthesizeSpeech({ text, language = "english", voice_gender = "male" }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(apiUrl("/api/voice/synthesize"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language, voice_gender }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Speech synthesis failed");
      return await response.json();
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  },

  // Live Stock Quotes & 30-Day Historical Candles
  async getMarketRadarRecommendations() {
    const res = await fetch(`${API_BASE_URL}/api/stocks/radar/recommendations`);
    if (!res.ok) throw new Error("Failed to fetch market radar");
    return await res.json();
  },

  async searchStocks(query) {
    const res = await fetch(`${API_BASE_URL}/api/stocks/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search failed");
    return await res.json();
  },

  async getStockInstitutionalPrediction(symbol) {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/institutional-prediction`);
    if (!res.ok) throw new Error("Failed to fetch institutional prediction");
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

  // Thesis Intelligence Engine Endpoints
  async getThesis(symbol) {
    const res = await fetch(`${API_BASE_URL}/api/thesis/${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error(`Failed to fetch thesis for ${symbol}`);
    return await res.json();
  },

  async analyzeThesis(payload) {
    const res = await fetch(`${API_BASE_URL}/api/thesis/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to analyze thesis");
    return await res.json();
  },

  async recheckThesis(symbol) {
    const res = await fetch(`${API_BASE_URL}/api/thesis/recheck/${encodeURIComponent(symbol)}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`Failed to recheck thesis for ${symbol}`);
    return await res.json();
  },

  async queryThesisCopilot(payload) {
    const res = await fetch(`${API_BASE_URL}/api/thesis/copilot-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to query thesis copilot");
    return await res.json();
  },

  // DNA Fingerprint AI Endpoints
  async getDnaAnalysis(symbol1, symbol2) {
    const res = await fetch(`${API_BASE_URL}/api/dna/analyze?symbol1=${encodeURIComponent(symbol1)}&symbol2=${encodeURIComponent(symbol2)}`);
    if (!res.ok) throw new Error("Failed to fetch DNA analysis");
    return await res.json();
  },

  async getDnaTwin(symbol) {
    const res = await fetch(`${API_BASE_URL}/api/dna/twin/${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error(`Failed to find twin for ${symbol}`);
    return await res.json();
  },

  async rescanDnaPatterns(symbol1, symbol2) {
    const res = await fetch(`${API_BASE_URL}/api/dna/rescan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol1, symbol2 }),
    });
    if (!res.ok) throw new Error("Failed to rescan DNA patterns");
    return await res.json();
  },

  // Portfolio Hidden Dependency Endpoints
  async getDependencyMap(factor = "USDINR", symbol = null) {
    let url = `${API_BASE_URL}/api/dependency/map?factor=${encodeURIComponent(factor)}`;
    if (symbol) {
      url += `&symbol=${encodeURIComponent(symbol)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch dependency map");
    return await res.json();
  },

  async simulateDependencyShock(factor, shock_pct, symbol = null) {
    const res = await fetch(`${API_BASE_URL}/api/dependency/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ factor, shock_pct, symbol }),
    });
    if (!res.ok) throw new Error("Failed to simulate dependency shock");
    return await res.json();
  },

  async getDependencyCompanies() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dependency/companies`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },
};
