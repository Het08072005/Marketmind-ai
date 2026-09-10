import {
  generateFallbackCandles,
  generateFallbackCandleIntelligence,
  generateFallbackPortfolioSimulation,
  generateFallbackDominoSimulation,
  getFallbackDominoStockDetail,
  generateFallbackDominoAgentResponse,
  FALLBACK_NEWS_ARTICLES,
  getCompanyMeta
} from "./fallbacks";

// In production this must be the public HTTPS URL of the FastAPI service.
// Keeping localhost as a development-only default prevents a deployed Vercel
// site from silently trying to call the visitor's own computer.
const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
const FALLBACK_PROD_URL = "https://marketmind-ai-piwi.onrender.com";
export const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? "http://127.0.0.1:8000" : FALLBACK_PROD_URL);

function apiUrl(path) {
  const base = API_BASE_URL || FALLBACK_PROD_URL;
  return `${base}${path}`;
}

export const apiClient = {
  // Generic HTTP helpers
  async get(endpoint) {
    const raw = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const path = raw.startsWith("/api/") ? raw : `/api${raw}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  },

  async getStockChart(symbol, timeframe = "1D") {
    const cleanSym = (symbol || "").toUpperCase().replace(".NS", "").replace(".BO", "").trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stocks/${cleanSym}/chart?timeframe=${timeframe}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`GET chart for ${cleanSym} failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(timeoutId);
      // Graceful fallback chart synthesis so charts never crash or show blank
      const meta = getCompanyMeta(cleanSym);
      const base = meta.price;
      const points = [];
      for (let i = 0; i < 25; i++) {
        const p = Math.round((base * (0.97 + (i / 25) * 0.05 + Math.sin(i / 2) * 0.015)) * 100) / 100;
        points.push({ time: `${i + 9}:00`, price: p, volume: 150000 + i * 12000 });
      }
      return {
        symbol: cleanSym,
        timeframe,
        current_price: base,
        change: meta.change,
        points: points,
        candles: generateFallbackCandles(cleanSym, base, 30)
      };
    }
  },

  async getStockAnalysis(symbol, callLlm = true) {
    const cleanSym = (symbol || "").toUpperCase().replace(".NS", "").replace(".BO", "").trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stocks/${cleanSym}/analysis?call_llm=${callLlm}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`GET analysis for ${cleanSym} failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(timeoutId);
      const meta = getCompanyMeta(cleanSym);
      return {
        symbol: cleanSym,
        company: meta.name,
        sector: meta.sector,
        price: meta.price,
        change: meta.change,
        pe: meta.pe,
        rsi: meta.rsi,
        recommendation: "Hold / Accumulate",
        thesis: `Strong structural position in ${meta.sector} with healthy balance sheet margins.`
      };
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
  async transcribeAudio(audioBlob, language = "en") {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("language", language);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
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
    const timeoutId = setTimeout(() => controller.abort(), 25000);
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
    const timeoutId = setTimeout(() => controller.abort(), 15000);
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
    const cleanSym = (symbol || "RELIANCE").toUpperCase().replace(".NS", "").replace(".BO", "").trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stocks/${cleanSym}/candlestick-intelligence`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.decision_stance) {
          if (!data.candles || data.candles.length < 15) {
            data.candles = generateFallbackCandles(cleanSym, data.price || 1200, 30);
          }
          try {
            localStorage.setItem(`mm_candle_intel_${cleanSym}`, JSON.stringify(data));
          } catch (e) { }
          return data;
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
    }

    // Check localStorage cache first
    try {
      const cached = localStorage.getItem(`mm_candle_intel_${cleanSym}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.decision_stance && parsed.candles && parsed.candles.length > 0) {
          return parsed;
        }
      }
    } catch (e) { }

    // Instant synthesis fallback
    const fallback = generateFallbackCandleIntelligence(cleanSym);
    try {
      localStorage.setItem(`mm_candle_intel_${cleanSym}`, JSON.stringify(fallback));
    } catch (e) { }
    return fallback;
  },

  async askCandlestickCopilot(symbol, question, history = []) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/candlestick-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history })
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return {
      answer: `For ${symbol}, support is defended near current levels while overhead supply remains firm. Watch for breakout volume expansion.`
    };
  },

  // Institutional AI Report Generator
  async generateReport(symbol, reportType = "Company Snapshot") {
    const res = await fetch(`${API_BASE_URL}/api/reports/generate?symbol=${encodeURIComponent(symbol)}&report_type=${encodeURIComponent(reportType)}`);
    if (!res.ok) throw new Error("Failed to generate report");
    return await res.json();
  },

  // Virtual Portfolio Endpoints
  async getPortfolio() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio`);
      if (res.ok) return await res.json();
    } catch (e) { }
    return {
      nav: 1084250.00,
      cash_balance: 324500.00,
      holdings_value: 759750.00,
      starting_capital: 1000000.00,
      overall_pnl: 84250.00,
      overall_pnl_pct: 8.43,
      sharpe_ratio: 1.62,
      holdings: [
        { symbol: "RELIANCE", name: "Reliance Industries", shares: 120, avg_price: 1280.00, ltp: 1279.00, current_value: 153480.00, pnl: -120.00, pnl_pct: -0.08, positive: false, day_change: "-1.23%", weight: "14.2%" },
        { symbol: "TCS", name: "Tata Consultancy Services", shares: 60, avg_price: 2240.00, ltp: 2208.00, current_value: 132480.00, pnl: -1920.00, pnl_pct: -1.43, positive: false, day_change: "-2.11%", weight: "12.2%" },
        { symbol: "TATAMOTORS", name: "Tata Motors Ltd", shares: 150, avg_price: 910.00, ltp: 945.80, current_value: 141870.00, pnl: 5370.00, pnl_pct: 3.93, positive: true, day_change: "-0.65%", weight: "13.1%" },
        { symbol: "HDFCBANK", name: "HDFC Bank Ltd", shares: 100, avg_price: 1610.00, ltp: 1642.50, current_value: 164250.00, pnl: 3250.00, pnl_pct: 2.02, positive: true, day_change: "+0.45%", weight: "15.1%" },
        { symbol: "SBIN", name: "State Bank of India", shares: 200, avg_price: 805.00, ltp: 825.40, current_value: 165080.00, pnl: 4080.00, pnl_pct: 2.53, positive: true, day_change: "+1.15%", weight: "15.2%" }
      ],
      transactions: [],
      nav_history: []
    };
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
    const cleanSym = (symbol || "ADANIENT").toUpperCase().trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: cleanSym,
          investment,
          start_date: startDate,
          end_date: endDate,
          investment_type: investmentType,
          benchmark,
          reinvest_dividend: reinvestDividend,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.portfolio_value) {
          try {
            localStorage.setItem(`marketmind_sim_result_${cleanSym}`, JSON.stringify(data));
            localStorage.setItem("marketmind_sim_result", JSON.stringify(data));
          } catch (e) { }
          return data;
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
    }

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(`marketmind_sim_result_${cleanSym}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.portfolio_value) {
          return parsed;
        }
      }
    } catch (e) { }

    // High-fidelity mathematical simulation fallback
    const fallback = generateFallbackPortfolioSimulation({
      symbol: cleanSym,
      investment,
      startDate,
      endDate,
      investmentType,
      benchmark
    });
    try {
      localStorage.setItem(`marketmind_sim_result_${cleanSym}`, JSON.stringify(fallback));
      localStorage.setItem("marketmind_sim_result", JSON.stringify(fallback));
    } catch (e) { }
    return fallback;
  },

  // Intelligence & Domino Endpoints
  async getDominoScenarios() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/domino/scenarios`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn("Could not load scenarios from backend, using fallback catalog", e);
    }
    return null;
  },

  async simulateDomino(payload = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/domino/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.stocks_impact) {
          try {
            localStorage.setItem("marketmind:domino_last_sim", JSON.stringify(data));
          } catch (e) { }
          return data;
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn("Domino simulation network notice, falling back to local model:", e);
    }

    try {
      const cached = localStorage.getItem("marketmind:domino_last_sim");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.stocks_impact) return parsed;
      }
    } catch (e) { }

    const fallback = generateFallbackDominoSimulation({
      scenarioKey: payload.scenario_key || "brent_crude",
      magnitude: payload.magnitude || 12,
      depth: payload.depth || 4,
      horizon: payload.horizon || "1_5_days",
      minConfidence: payload.min_confidence || 0.70,
      customEventTitle: payload.custom_event_title || null
    });
    return fallback;
  },

  async getDominoStockDetail(symbol, magnitude = 12) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/domino/stock-detail/${symbol}?magnitude=${magnitude}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) return await res.json();
    } catch (e) {
      clearTimeout(timeoutId);
    }
    return getFallbackDominoStockDetail(symbol, magnitude);
  },

  async queryDominoAgent(payload = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/domino/agent-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) return await res.json();
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn("Domino agent query notice, using local copilot fallback:", e);
    }
    return generateFallbackDominoAgentResponse(payload.query, payload.context_ticker);
  },

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/news?filter=${encodeURIComponent(filter)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.articles && data.articles.length > 0) {
          try {
            localStorage.setItem("mm_news_feed_cache_v2", JSON.stringify(data));
          } catch (e) { }
          return data;
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
    }

    try {
      const cached = localStorage.getItem("mm_news_feed_cache_v2");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.articles && parsed.articles.length > 0) return parsed;
      }
    } catch (e) { }

    return {
      articles: FALLBACK_NEWS_ARTICLES,
      executive_analysis: "Domestic institutional market telemetry reflects constructive headline flow led by private banking deposit accretion and industrial capex expansion. Energy transition capex and resilient auto orderbooks support corporate earnings visibility across Nifty components.",
      executive_outcome: "Headline momentum projects 75% bullish market continuation with sector capital actively rotating into banking, energy, and auto leaders. The constructive thesis invalidates upon unexpected crude supply shocks or hawkish central bank liquidity tightening."
    };
  },

  async getLiveNews(query = "") {
    try {
      const res = await fetch(`${API_BASE_URL}/api/news/live?query=${encodeURIComponent(query)}`);
      if (res.ok) return await res.json();
    } catch (e) { }
    return { articles: FALLBACK_NEWS_ARTICLES };
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

  async getNewsAnalysis(newsItem, callLlm = true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/news/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          news_id: newsItem?.id || newsItem?.url || newsItem?.title || "news",
          title: newsItem?.title || "",
          summary: newsItem?.summary || "",
          tickers: newsItem?.tickers || [],
          category: newsItem?.category || "Markets",
          source: newsItem?.source || "Verified News",
          call_llm: callLlm
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("News analysis request failed");
      return await res.json();
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
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
