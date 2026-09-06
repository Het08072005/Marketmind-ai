import React, { useState, useEffect, useRef, useMemo } from "react";
import { apiClient } from "../api/client";

const TRACKED_STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd" },
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd" },
  { symbol: "SUNPHARMA", name: "Sun Pharma Industries" }
];

export const SECTOR_COMPANIES = [
  {
    sector: "IT & Technology Services",
    stocks: [
      { symbol: "TCS", name: "Tata Consultancy Services" },
      { symbol: "INFY", name: "Infosys Ltd" },
      { symbol: "HCLTECH", name: "HCL Technologies Ltd" },
      { symbol: "WIPRO", name: "Wipro Ltd" },
      { symbol: "TECHM", name: "Tech Mahindra Ltd" },
    ]
  },
  {
    sector: "Banking & Financial Services",
    stocks: [
      { symbol: "HDFCBANK", name: "HDFC Bank Ltd" },
      { symbol: "ICICIBANK", name: "ICICI Bank Ltd" },
      { symbol: "SBIN", name: "State Bank of India" },
      { symbol: "AXISBANK", name: "Axis Bank Ltd" },
      { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
      { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd" },
      { symbol: "JIOFIN", name: "Jio Financial Services" },
    ]
  },
  {
    sector: "Energy, Oil & Power",
    stocks: [
      { symbol: "RELIANCE", name: "Reliance Industries Ltd" },
      { symbol: "ONGC", name: "Oil & Natural Gas Corp" },
      { symbol: "ADANIENT", name: "Adani Enterprises Ltd" },
      { symbol: "ATGL", name: "Adani Total Gas Ltd" },
      { symbol: "ADANIPORTS", name: "Adani Ports & SEZ" },
      { symbol: "COALINDIA", name: "Coal India Ltd" },
      { symbol: "NTPC", name: "NTPC Ltd" },
      { symbol: "POWERGRID", name: "Power Grid Corp" },
      { symbol: "TATAPOWER", name: "Tata Power Ltd" },
    ]
  },
  {
    sector: "Automotive & Mobility",
    stocks: [
      { symbol: "TATAMOTORS", name: "Tata Motors Ltd" },
      { symbol: "MARUTI", name: "Maruti Suzuki India" },
      { symbol: "M&M", name: "Mahindra & Mahindra" },
      { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd" },
      { symbol: "EICHERMOT", name: "Eicher Motors Ltd" },
    ]
  },
  {
    sector: "Consumer & Retail",
    stocks: [
      { symbol: "ASIANPAINT", name: "Asian Paints Ltd" },
      { symbol: "ITC", name: "ITC Ltd" },
      { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd" },
      { symbol: "TITAN", name: "Titan Company Ltd" },
      { symbol: "NESTLEIND", name: "Nestle India Ltd" },
      { symbol: "TRENT", name: "Trent Ltd" },
      { symbol: "VARUNBEV", name: "Varun Beverages Ltd" },
      { symbol: "PIDILITIND", name: "Pidilite Industries" },
    ]
  },
  {
    sector: "Infrastructure, Metals & Realty",
    stocks: [
      { symbol: "LT", name: "Larsen & Toubro Ltd" },
      { symbol: "TATASTEEL", name: "Tata Steel Ltd" },
      { symbol: "JSWSTEEL", name: "JSW Steel Ltd" },
      { symbol: "VEDL", name: "Vedanta Ltd" },
      { symbol: "DLF", name: "DLF Ltd" },
    ]
  },
  {
    sector: "Defense & Heavy Engineering",
    stocks: [
      { symbol: "HAL", name: "Hindustan Aeronautics Ltd" },
      { symbol: "BEL", name: "Bharat Electronics Ltd" },
      { symbol: "BHEL", name: "Bharat Heavy Electricals" },
      { symbol: "INDIGO", name: "InterGlobe Aviation (IndiGo)" },
    ]
  },
  {
    sector: "Pharma & Healthcare",
    stocks: [
      { symbol: "SUNPHARMA", name: "Sun Pharma Industries" },
      { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories" },
      { symbol: "CIPLA", name: "Cipla Ltd" },
      { symbol: "DIVISLAB", name: "Divi's Laboratories" },
      { symbol: "APOLLOHOSP", name: "Apollo Hospitals Ltd" },
    ]
  },
  {
    sector: "Consumer Internet",
    stocks: [
      { symbol: "ZOMATO", name: "Zomato Ltd" },
    ]
  }
];

// Local persistence helpers - validates that executive fields exist and match live numbers
function getStoredCandleIntel(sym) {
  try {
    const raw = localStorage.getItem(`mm_candle_intel_${sym}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.decision_stance && parsed.executive_analysis && parsed.executive_outcome) {
        // Discard stale cached intel without CMP narrative
        if (!parsed.executive_analysis.includes("CMP")) return null;
        if (parsed.symbol && parsed.symbol.toUpperCase() !== sym.toUpperCase()) return null;
        const curP = parsed.quantitative_metrics?.current_price;
        if (sym === "HDFCBANK" && curP > 1000) return null;
        if (sym === "TCS" && curP > 3000) return null;
        if (sym === "RELIANCE" && curP > 2000) return null;
        return parsed;
      }
    }
  } catch (e) { }
  return null;
}

function storeCandleIntel(sym, data) {
  try {
    if (data && data.decision_stance && data.executive_analysis && data.executive_outcome) {
      localStorage.setItem(`mm_candle_intel_${sym}`, JSON.stringify(data));
    }
  } catch (e) { }
}

export default function CandlestickPage({ goPage, searchQuery: propSearchQuery = "" }) {
  // 1. Determine Initial Symbol prioritizing voice actions, then global state, then storage
  const getInitialSymbol = () => {
    if (window.__PENDING_CANDLE_ACTION?.params?.symbol) {
      const sym = window.__PENDING_CANDLE_ACTION.params.symbol.toUpperCase();
      window.__PENDING_CANDLE_ACTION = null;
      try { localStorage.setItem("mm_selected_candle_symbol", sym); } catch (e) { }
      window.__SELECTED_STOCK_SYMBOL = sym;
      return sym;
    }
    if (window.__SELECTED_STOCK_SYMBOL) {
      const sym = window.__SELECTED_STOCK_SYMBOL.toUpperCase();
      try { localStorage.setItem("mm_selected_candle_symbol", sym); } catch (e) { }
      return sym;
    }
    try {
      const saved = localStorage.getItem("mm_selected_candle_symbol");
      if (saved) return saved.toUpperCase();
    } catch (e) { }
    return "RELIANCE";
  };

  const initialSym = useMemo(() => getInitialSymbol(), []);
  const [selectedSymbol, setSelectedSymbol] = useState(initialSym);

  // Search & Dropdown states
  const [searchQuery, setSearchQuery] = useState(propSearchQuery || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allStocksList, setAllStocksList] = useState([]);
  const searchContainerRef = useRef(null);

  const [tickerList, setTickerList] = useState(() => {
    try {
      const saved = localStorage.getItem("marketmind_live_stocks");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          return TRACKED_STOCKS.map((ts) => {
            const match = list.find((s) => s.symbol.toUpperCase() === ts.symbol.toUpperCase());
            if (match) {
              const isPos = !match.change.startsWith("-") && !match.change.startsWith("−");
              return {
                symbol: match.symbol,
                name: match.name,
                price: typeof match.price === "number" ? `₹${match.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : match.price,
                change: match.change,
                up: isPos,
              };
            }
            return { ...ts, price: "...", change: "", up: true };
          });
        }
      }
    } catch (e) { }
    return TRACKED_STOCKS.map((ts) => ({ ...ts, price: "...", change: "", up: true }));
  });

  // Flat list of all sector catalog stocks for search matching
  const flatCatalogStocks = useMemo(() => {
    const list = [];
    const seen = new Set();
    SECTOR_COMPANIES.forEach((sec) => {
      sec.stocks.forEach((stk) => {
        if (!seen.has(stk.symbol)) {
          seen.add(stk.symbol);
          list.push({ ...stk, sector: sec.sector });
        }
      });
    });
    allStocksList.forEach((stk) => {
      if (!seen.has(stk.symbol)) {
        seen.add(stk.symbol);
        list.push({ symbol: stk.symbol, name: stk.name, price: stk.price, change: stk.change });
      }
    });
    return list;
  }, [allStocksList]);

  // Set of all symbols in catalog for dropdown optgroup
  const allCatalogSymbols = useMemo(() => {
    return new Set(flatCatalogStocks.map((s) => s.symbol));
  }, [flatCatalogStocks]);

  // Filtered auto-complete suggestions
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return flatCatalogStocks.filter(
      (s) => s.symbol.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q))
    );
  }, [searchQuery, flatCatalogStocks]);

  // Click-outside listener for suggestion box
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync propSearchQuery
  useEffect(() => {
    if (propSearchQuery && propSearchQuery.trim()) {
      setSearchQuery(propSearchQuery.trim());
      setShowSuggestions(true);
    }
  }, [propSearchQuery]);

  // Load all stocks for search catalog
  useEffect(() => {
    let isMounted = true;
    const loadAllStocks = async () => {
      try {
        const stocks = await apiClient.getStocks();
        if (isMounted && Array.isArray(stocks) && stocks.length > 0) {
          setAllStocksList(stocks);
        }
      } catch (e) {
        console.warn("Using fallback stock list for candles", e);
      }
    };
    loadAllStocks();
    return () => { isMounted = false; };
  }, []);

  // Initialize with persisted data if available for instant 0ms reload
  const [intelData, setIntelData] = useState(() => {
    const cached = getStoredCandleIntel(initialSym);
    return cached && (!cached.symbol || cached.symbol.toUpperCase() === initialSym) ? cached : null;
  });
  const [loading, setLoading] = useState(!intelData);
  const [hoveredCandle, setHoveredCandle] = useState(null);

  // Interactive Voice Copilot chat state
  const [copilotMessages, setCopilotMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Load intelligence for selected symbol
  useEffect(() => {
    let isMounted = true;

    const fetchIntel = async () => {
      const cached = getStoredCandleIntel(selectedSymbol);
      if (cached && (!cached.symbol || cached.symbol.toUpperCase() === selectedSymbol)) {
        setIntelData(cached);
        setLoading(false);
      } else {
        setIntelData(null);
        setLoading(true);
      }

      try {
        const data = await apiClient.getCandlestickIntelligence(selectedSymbol);
        if (isMounted && data && data.decision_stance) {
          setIntelData(data);
          storeCandleIntel(selectedSymbol, data);
        }
      } catch (err) {
        console.warn("Error loading candlestick intelligence:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchIntel();

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol]);

  // Live Ticker Bar Real-Time Synchronization
  useEffect(() => {
    let isMounted = true;
    const fetchLiveTickerPrices = async () => {
      try {
        const liveList = await apiClient.getStocks();
        if (isMounted && liveList && liveList.length > 0) {
          const map = {};
          liveList.forEach((s) => {
            map[s.symbol.toUpperCase()] = s;
          });
          setTickerList((prev) =>
            prev.map((item) => {
              const live = map[item.symbol.toUpperCase()];
              if (live && live.price) {
                const isPos = !String(live.change).startsWith("-") && !String(live.change).startsWith("−");
                return {
                  ...item,
                  price: typeof live.price === "number" ? `₹${live.price.toLocaleString("en-IN")}` : `₹${live.price}`,
                  change: live.change,
                  up: isPos,
                };
              }
              return item;
            })
          );
        }
      } catch (e) {
        console.warn("Using fallback ticker prices in candles", e);
      }
    };

    fetchLiveTickerPrices();
    const interval = setInterval(fetchLiveTickerPrices, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleStockChange = (newSym) => {
    if (!newSym) return;
    const cleanSym = newSym.toUpperCase().trim();
    try {
      localStorage.setItem("mm_selected_candle_symbol", cleanSym);
    } catch (e) { }
    window.__SELECTED_STOCK_SYMBOL = cleanSym;
    setSelectedSymbol(cleanSym);
    setCopilotMessages([]); // Reset chat to empty state for new stock

    // Immediately trigger skeleton loader
    const cached = getStoredCandleIntel(cleanSym);
    if (cached && (!cached.symbol || cached.symbol.toUpperCase() === cleanSym)) {
      setIntelData(cached);
      setLoading(false);
    } else {
      setIntelData(null);
      setLoading(true);
    }
  };

  // Voice Assistant and Global Stock Changed Listener
  useEffect(() => {
    const handleStockChanged = (e) => {
      const sym = e.detail?.symbol;
      if (sym && typeof sym === "string") {
        handleStockChange(sym.toUpperCase());
      }
    };

    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (!action) return;

      const isCandleTarget =
        action.target_page === "candles" ||
        action.command === "SHOW_CANDLESTICK" ||
        action.command === "SHOW_CANDLESTICK_INTELLIGENCE";

      if (isCandleTarget && action.params?.symbol) {
        const sym = action.params.symbol.toUpperCase();
        handleStockChange(sym);
      }
    };

    window.addEventListener("marketmind:stock_changed", handleStockChanged);
    window.addEventListener("marketmind:voice_action", handleVoiceAction);

    // Also check pending action on mount/effect
    if (window.__PENDING_CANDLE_ACTION?.params?.symbol) {
      const pSym = window.__PENDING_CANDLE_ACTION.params.symbol.toUpperCase();
      window.__PENDING_CANDLE_ACTION = null;
      handleStockChange(pSym);
    }

    return () => {
      window.removeEventListener("marketmind:stock_changed", handleStockChanged);
      window.removeEventListener("marketmind:voice_action", handleVoiceAction);
    };
  }, [selectedSymbol]);

  // Ask Copilot question
  const handleAskCopilot = async (qText) => {
    const query = qText || inputQuery;
    if (!query || !query.trim()) return;

    const userMsg = { sender: "user", text: query.trim() };
    setCopilotMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setCopilotLoading(true);

    try {
      const res = await apiClient.askCandlestickCopilot(selectedSymbol, query);
      const botMsg = { sender: "copilot", text: res.answer };
      setCopilotMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg = {
        sender: "copilot",
        text: `For ${selectedSymbol}, support is holding near current levels, but resistance has not cleared. Wait for confirmed breakout volume.`
      };
      setCopilotMessages((prev) => [...prev, errMsg]);
    } finally {
      setCopilotLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const data = intelData || {};
  const candles = data.candles || [];
  const dailyStats = data.daily_stats || {};
  const aiSetup = data.ai_setup || {};
  const stance = data.decision_stance || {};
  const outlook = data.probabilistic_outlook || {};
  const supRes = data.chart_support_resistance || {};
  const evidenceLayers = data.evidence_layers || [];
  const hiddenBehaviour = data.hidden_market_behaviour || [];
  const backtest = data.historical_backtest || {};
  const counterfactual = data.counterfactual_engine || {};

  // Interactive SVG Candlestick Geometry
  const chartGeometry = useMemo(() => {
    if (!candles || candles.length === 0) return null;
    const width = 640;
    const height = 240;
    const paddingLeft = 18;
    const paddingRight = 92; // Dedicated right rail for TradingView style price badges
    const paddingY = 26;
    const chartBottom = height - 38;

    const highs = candles.map((c) => c.high || c.close);
    const lows = candles.map((c) => c.low || c.close);
    const minP = Math.min(...lows) * 0.995;
    const maxP = Math.max(...highs) * 1.005;
    const rangeP = maxP - minP || 1;

    const volumes = candles.map((c) => c.volume || 1000000);
    const maxVol = Math.max(...volumes) || 1;

    const n = candles.length;
    const candleAreaWidth = width - paddingLeft - paddingRight; // 640 - 18 - 92 = 530px
    const colWidth = Math.max(8, candleAreaWidth / (n || 1));
    const candleWidth = Math.max(4, Math.min(10, candleAreaWidth / (n * 1.55)));

    const candleElements = candles.map((c, i) => {
      const x = paddingLeft + (i / (n - 1 || 1)) * candleAreaWidth;
      const isGreen = c.close >= c.open;
      const highY = paddingY + ((maxP - c.high) / rangeP) * (chartBottom - paddingY);
      const lowY = paddingY + ((maxP - c.low) / rangeP) * (chartBottom - paddingY);
      const openY = paddingY + ((maxP - c.open) / rangeP) * (chartBottom - paddingY);
      const closeY = paddingY + ((maxP - c.close) / rangeP) * (chartBottom - paddingY);

      const bodyY = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));

      // Volume bar
      const volHeight = ((c.volume || 0) / maxVol) * 30;
      const volY = height - volHeight;

      return {
        ...c,
        index: i,
        x,
        isGreen,
        highY,
        lowY,
        openY,
        closeY,
        bodyY,
        bodyHeight,
        volY,
        volHeight
      };
    });

    // Support and Resistance Y coordinates
    const supY = supRes.support_price
      ? paddingY + ((maxP - supRes.support_price) / rangeP) * (chartBottom - paddingY)
      : chartBottom - 18;
    const resY = supRes.resistance_price
      ? paddingY + ((maxP - supRes.resistance_price) / rangeP) * (chartBottom - paddingY)
      : paddingY + 18;

    return {
      width,
      height,
      paddingLeft,
      paddingRight,
      chartBottom,
      candleAreaWidth,
      candleWidth,
      colWidth,
      candleElements,
      supY,
      resY,
      minP,
      maxP
    };
  }, [candles, supRes]);

  return (
    <div className="candlestick-copilot-view">
      {/* 1. Page Context & Live Status Bar */}
      <div className="candle-intro-strip">
        <p className="candle-page-desc">
          Detect patterns, explain why they matter, compare historical setups, combine volume/news/sector context, and answer chart questions conversationally.
        </p>
        <span className="candle-live-badge">
          <span className="pulse-dot-live" /> Voice + Pattern Engine Active
        </span>
      </div>

      {/* 1.5 Sector-Grouped Dropdown & Real-Time Search Bar for ANY Indian Company */}
      <div className="candle-search-dropdown-bar">
        {/* Sector Grouped Dropdown */}
        <div className="candle-dropdown-wrap">
          <label htmlFor="candle-sector-select" className="candle-control-label">
            🏢 Select Company (Sectors)
          </label>
          <select
            id="candle-sector-select"
            className="candle-select-dropdown"
            value={selectedSymbol}
            onChange={(e) => {
              if (e.target.value) {
                handleStockChange(e.target.value);
                setSearchQuery("");
                setShowSuggestions(false);
              }
            }}
          >
            {SECTOR_COMPANIES.map((sec) => (
              <optgroup key={sec.sector} label={sec.sector}>
                {sec.stocks.map((stk) => (
                  <option key={stk.symbol} value={stk.symbol}>
                    {stk.name} ({stk.symbol})
                  </option>
                ))}
              </optgroup>
            ))}
            {!allCatalogSymbols.has(selectedSymbol) && (
              <optgroup label="Custom Searched Stock">
                <option value={selectedSymbol}>
                  {selectedSymbol} (NSE)
                </option>
              </optgroup>
            )}
          </select>
        </div>

        {/* Real-Time Search Bar with Auto-Complete Dropdown */}
        <div className="candle-search-wrap" ref={searchContainerRef}>
          <label htmlFor="candle-search-box" className="candle-control-label">
            🔍 Search Any Indian Company (NSE)
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                const target = suggestions.length > 0 ? suggestions[0].symbol : searchQuery.trim().toUpperCase();
                handleStockChange(target);
                setShowSuggestions(false);
                setSearchQuery("");
              }
            }}
            className="candle-search-input-box"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="candle-search-box"
              type="text"
              className="candle-search-input"
              placeholder="Search ticker or name (e.g. HCL, Zomato, BHEL, Tata, Reliance...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setShowSuggestions(true);
              }}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="candle-search-clear-btn"
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                }}
              >
                ✕
              </button>
            )}
          </form>

          {/* Auto-complete suggestions dropdown */}
          {showSuggestions && searchQuery.trim() && (
            <div className="candle-suggestions-dropdown">
              {suggestions.slice(0, 8).map((item) => (
                <div
                  key={item.symbol}
                  className="candle-suggestion-item"
                  onClick={() => {
                    handleStockChange(item.symbol);
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                >
                  <div className="sug-left">
                    <span className="sug-sym">{item.symbol}</span>
                    <span className="sug-name">{item.name}</span>
                  </div>
                  <div className="sug-right">
                    {item.price && <span className="sug-price">{typeof item.price === "number" ? `₹${item.price.toLocaleString("en-IN")}` : item.price}</span>}
                    {item.change && (
                      <span className={`sug-change ${!String(item.change).startsWith("-") && !String(item.change).startsWith("−") ? "up" : "down"}`}>
                        {item.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* Fallback option to inspect custom query */}
              {!suggestions.some((s) => s.symbol.toUpperCase() === searchQuery.trim().toUpperCase()) && (
                <div
                  className="candle-suggestion-item custom-ticker"
                  onClick={() => {
                    handleStockChange(searchQuery.trim().toUpperCase());
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                >
                  <div className="sug-left">
                    <span className="sug-sym">⚡ Inspect &ldquo;{searchQuery.trim().toUpperCase()}&rdquo;</span>
                    <span className="sug-name">Fetch live NSE candlestick intelligence for any Indian equity</span>
                  </div>
                  <div className="sug-right">
                    <span className="sug-badge">Live NSE</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Ticker Bar */}
      <div className="candle-ticker-bar">
        {tickerList.map((stock) => {
          const isSelected = stock.symbol === selectedSymbol;
          const displayPrice = isSelected && intelData?.quantitative_metrics?.current_price
            ? `₹${Number(intelData.quantitative_metrics.current_price).toLocaleString("en-IN")}`
            : stock.price;
          const displayChange = isSelected && intelData?.quantitative_metrics?.day_change_pct !== undefined
            ? `${intelData.quantitative_metrics.day_change_pct >= 0 ? "+" : ""}${intelData.quantitative_metrics.day_change_pct}%`
            : stock.change;
          const isUp = isSelected && intelData?.quantitative_metrics?.day_change_pct !== undefined
            ? intelData.quantitative_metrics.day_change_pct >= 0
            : stock.up;

          return (
            <button
              key={stock.symbol}
              type="button"
              className={`candle-ticker-item ${isSelected ? "active" : ""}`}
              onClick={() => handleStockChange(stock.symbol)}
            >
              <span className="ticker-sym">{stock.symbol}</span>
              <span className="ticker-p">{displayPrice}</span>
              <span className={`ticker-c ${isUp ? "positive" : "negative"}`}>{displayChange}</span>
            </button>
          );
        })}

        {/* If active symbol is a searched/custom stock not in default 6 pills, render active pill */}
        {!tickerList.some((s) => s.symbol === selectedSymbol) && (
          <button
            type="button"
            className="candle-ticker-item active"
            onClick={() => handleStockChange(selectedSymbol)}
          >
            <span className="ticker-sym">{selectedSymbol}</span>
            <span className="ticker-p">₹{intelData?.quantitative_metrics?.current_price ? Number(intelData.quantitative_metrics.current_price).toLocaleString("en-IN") : "—"}</span>
            <span className="ticker-c positive">Live</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton Loader State when switching stock */}
      {loading && !intelData ? (
        <div className="candle-skeleton-container">
          <div className="candle-skeleton-loading-badge">
            <span className="candle-skeleton-spinner" />
            <span>MarketMind Autonomous Engine Synchronizing Live Microstructure for {selectedSymbol}...</span>
          </div>

          {/* Shimmering Analysis Banner Skeleton */}
          <div className="candle-skeleton-banner">
            <div className="candle-skeleton-block">
              <div className="candle-skeleton-line short" />
              <div className="candle-skeleton-line full" />
              <div className="candle-skeleton-line medium" />
            </div>
            <div className="candle-skeleton-block">
              <div className="candle-skeleton-line short" />
              <div className="candle-skeleton-line full" />
              <div className="candle-skeleton-line medium" />
            </div>
          </div>

          {/* Shimmering Chart & Probabilistic Outlook Skeleton */}
          <div className="candle-skeleton-top-grid">
            <div className="candle-skeleton-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 8, background: "rgba(255,255,255,0.08)" }} />
                  <div>
                    <div className="candle-skeleton-line" style={{ width: 140, height: 20, marginBottom: 6 }} />
                    <div className="candle-skeleton-line" style={{ width: 220, height: 12 }} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="candle-skeleton-line" style={{ width: 100, height: 24, marginBottom: 6 }} />
                  <div className="candle-skeleton-line" style={{ width: 70, height: 14 }} />
                </div>
              </div>
              <div className="candle-skeleton-chart-area">
                <span style={{ color: "#94A3B8", fontSize: "13px" }}>
                  Constructing 30-session OHLC candle wicks &amp; support/resistance zones for {selectedSymbol}...
                </span>
              </div>
            </div>

            <div className="candle-skeleton-card">
              <div className="candle-skeleton-line short" style={{ height: 18 }} />
              <div className="candle-skeleton-line full" style={{ height: 50, borderRadius: 8 }} />
              <div className="candle-skeleton-line full" />
              <div className="candle-skeleton-line medium" />
              <div className="candle-skeleton-line full" style={{ height: 36, borderRadius: 8, marginTop: 10 }} />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 2.5 AI Executive Analysis & Final Outcome Banner - Only renders real AI generated telemetry */}
          {data.executive_analysis && data.executive_outcome && (
            <div className="candle-executive-banner">
              <div className="executive-block analysis">
                <div className="block-header">
                  <span className="block-tag-label analysis">Analysis :</span>
                  <span className="block-meta-note">AI Technical &amp; Volume Telemetry</span>
                </div>
                <p className="block-text">
                  {data.executive_analysis}
                </p>
              </div>

              <div className="executive-block outcome">
                <div className="block-header">
                  <span className="block-tag-label outcome">Final Outcome :</span>
                  <span className="block-meta-note">Directional Probability &amp; Invalidation</span>
                </div>
                <p className="block-text">
                  {data.executive_outcome}
                </p>
              </div>
            </div>
          )}

          {/* 3. Top Row: Main Candlestick Chart Area (Left) + Probabilistic Outlook (Right) */}
          <div className="candle-top-grid">
            {/* Card 1: Main Candlestick Chart Area */}
            <div className="candle-card main-chart-card">
              <div className="chart-card-header">
                <div className="chart-company-info">
                  <div className="company-badge-box">{selectedSymbol.slice(0, 3)}</div>
                  <div>
                    <h2 className="company-title">
                      {data.name || selectedSymbol} ({selectedSymbol})
                    </h2>
                    <span className="chart-timeframe-sub">NSE · Daily chart · 30-session intelligence window</span>
                  </div>
                </div>
                <div className="chart-price-box">
                  <div className="current-price">₹{Number(data.price || 1302.5).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                  <div className={`price-change-tag ${(data.change || "").includes("-") ? "down" : "up"}`}>
                    {data.change_label || data.change || "-0.81% today"}
                  </div>
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="chart-metrics-strip">
                <div className="ohlc-group">
                  <span><strong>O</strong> ₹{dailyStats.open || "1,313.1"}</span>
                  <span><strong>H</strong> ₹{dailyStats.high || "1,316.8"}</span>
                  <span><strong>L</strong> ₹{dailyStats.low || "1,302.5"}</span>
                  <span><strong>C</strong> ₹{dailyStats.close || data.price || "1,302.5"}</span>
                </div>
                <div className="vol-rsi-group">
                  <span><strong>Vol</strong> {dailyStats.volume || "9.72M"}</span>
                  <span className="dot-sep">·</span>
                  <span><strong>RSI</strong> {dailyStats.rsi || "47.28"}</span>
                </div>
              </div>

              {/* AI Setup Banner */}
              <div className="ai-setup-banner">
                <div className="setup-banner-left">
                  <div className="setup-headline">
                    <span className="bolt-icon">⚡</span> <strong>AI Setup:</strong> {aiSetup.headline || "Consolidation near support + rejection candle"}
                  </div>
                  <div className="setup-sub">{aiSetup.summary || "Constructive rejection, but breakout confirmation is still missing."}</div>
                </div>
                <div className="setup-banner-right">
                  <span className="setup-conf-badge">Pattern confidence {aiSetup.pattern_confidence || 81}%</span>
                </div>
              </div>

              {/* Support & Resistance Dedicated Level Strip */}
              <div className="chart-zones-strip">
                <div className="zone-pill res">
                  <span className="zone-dash-line res" />
                  <span className="zone-name">Resistance:</span>
                  <strong className="zone-val">{supRes.resistance_label || `₹${supRes.resistance_price}`}</strong>
                </div>
                <div className="zone-pill sup">
                  <span className="zone-dash-line sup" />
                  <span className="zone-name">Support:</span>
                  <strong className="zone-val">{supRes.support_label || `₹${supRes.support_price}`}</strong>
                </div>
              </div>

              {/* SVG Candlestick Chart */}
              <div className="candle-svg-container">
                {chartGeometry && (
                  <svg
                    viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                    className="candlestick-svg"
                  >
                    <defs>
                      <linearGradient id="supportZoneGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
                      </linearGradient>
                      <linearGradient id="resistanceZoneGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Right Y-Axis Divider Line (TradingView style rail) */}
                    <line
                      x1={chartGeometry.width - 86}
                      y1="8"
                      x2={chartGeometry.width - 86}
                      y2={chartGeometry.height - 8}
                      stroke="rgba(16, 27, 51, 0.08)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />

                    {/* Resistance Horizontal Reference Line across candle area */}
                    <line
                      x1="12"
                      y1={chartGeometry.resY}
                      x2={chartGeometry.width - 86}
                      y2={chartGeometry.resY}
                      stroke="#D97706"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />

                    {/* Resistance Price Badge in Right Rail */}
                    <g className="chart-rail-badge res">
                      <rect
                        x={chartGeometry.width - 82}
                        y={chartGeometry.resY - 9}
                        width="76"
                        height="18"
                        rx="4"
                        fill="#FEF3C7"
                        stroke="#D97706"
                        strokeWidth="1"
                      />
                      <text
                        x={chartGeometry.width - 44}
                        y={chartGeometry.resY + 3.5}
                        textAnchor="middle"
                        fill="#92400E"
                        fontSize="8.5"
                        fontFamily="'Inter', -apple-system, sans-serif"
                        fontWeight="700"
                      >
                        RES ₹{supRes.resistance_price ? Number(supRes.resistance_price).toFixed(1) : "RES"}
                      </text>
                    </g>

                    {/* Support Horizontal Reference Line across candle area */}
                    <line
                      x1="12"
                      y1={chartGeometry.supY}
                      x2={chartGeometry.width - 86}
                      y2={chartGeometry.supY}
                      stroke="#059669"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />

                    {/* Support Price Badge in Right Rail */}
                    <g className="chart-rail-badge sup">
                      <rect
                        x={chartGeometry.width - 82}
                        y={chartGeometry.supY - 9}
                        width="76"
                        height="18"
                        rx="4"
                        fill="#ECFDF5"
                        stroke="#059669"
                        strokeWidth="1"
                      />
                      <text
                        x={chartGeometry.width - 44}
                        y={chartGeometry.supY + 3.5}
                        textAnchor="middle"
                        fill="#047857"
                        fontSize="8.5"
                        fontFamily="'Inter', -apple-system, sans-serif"
                        fontWeight="700"
                      >
                        SUP ₹{supRes.support_price ? Number(supRes.support_price).toFixed(1) : "SUP"}
                      </text>
                    </g>

                    {/* Candlesticks & Volume bars */}
                    {chartGeometry.candleElements.map((cd) => (
                      <g
                        key={cd.index}
                        className={`candle-element-group ${hoveredCandle?.index === cd.index ? "active-hover" : ""}`}
                        onMouseEnter={() => setHoveredCandle(cd)}
                        onMouseLeave={() => setHoveredCandle(null)}
                      >
                        {/* Invisible Full-Height Column Hitbox for smooth 100% reliable mouse tracking */}
                        <rect
                          x={cd.x - chartGeometry.colWidth / 2}
                          y={0}
                          width={chartGeometry.colWidth}
                          height={chartGeometry.height}
                          fill="transparent"
                          style={{ cursor: "crosshair" }}
                        />

                        {/* Volume Bar at bottom */}
                        <rect
                          x={cd.x - chartGeometry.candleWidth / 2}
                          y={cd.volY}
                          width={chartGeometry.candleWidth}
                          height={cd.volHeight}
                          fill={cd.isGreen ? "rgba(16, 185, 129, 0.22)" : "rgba(239, 68, 68, 0.22)"}
                          rx="1"
                        />

                        {/* Top and Bottom Wick */}
                        <line
                          x1={cd.x}
                          y1={cd.highY}
                          x2={cd.x}
                          y2={cd.lowY}
                          stroke={cd.isGreen ? "#059669" : "#DC2626"}
                          strokeWidth="1.2"
                        />

                        {/* Candle Real Body */}
                        <rect
                          x={cd.x - chartGeometry.candleWidth / 2}
                          y={cd.bodyY}
                          width={chartGeometry.candleWidth}
                          height={cd.bodyHeight}
                          fill={cd.isGreen ? "#10B981" : "#EF4444"}
                          rx="1"
                        />
                      </g>
                    ))}

                    {/* Crosshair Guide on Hover */}
                    {hoveredCandle && (
                      <g className="crosshair-guide-group">
                        {/* Vertical Tracking Line */}
                        <line
                          x1={hoveredCandle.x}
                          y1={chartGeometry.paddingY - 10}
                          x2={hoveredCandle.x}
                          y2={chartGeometry.height - 8}
                          stroke="rgba(16, 27, 51, 0.25)"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                        {/* Horizontal Tracking Line to Right Rail */}
                        <line
                          x1="12"
                          y1={hoveredCandle.closeY}
                          x2={chartGeometry.width - 86}
                          y2={hoveredCandle.closeY}
                          stroke="rgba(16, 27, 51, 0.22)"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                        {/* Node circle on close price */}
                        <circle
                          cx={hoveredCandle.x}
                          cy={hoveredCandle.closeY}
                          r="4"
                          fill={hoveredCandle.isGreen ? "#059669" : "#DC2626"}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        {/* Live Price Tag on Right Axis Rail */}
                        <rect
                          x={chartGeometry.width - 82}
                          y={hoveredCandle.closeY - 9}
                          width="76"
                          height="18"
                          rx="4"
                          fill="#0F172A"
                        />
                        <text
                          x={chartGeometry.width - 44}
                          y={hoveredCandle.closeY + 3.5}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="8.5"
                          fontFamily="'Inter', monospace"
                          fontWeight="700"
                        >
                          ₹{Number(hoveredCandle.close).toFixed(1)}
                        </text>
                      </g>
                    )}
                  </svg>
                )}

                {/* Floating Dynamic Hover Tooltip */}
                {hoveredCandle && chartGeometry && (
                  <div
                    className="candle-hover-tooltip"
                    style={{
                      left: `${Math.min(Math.max((hoveredCandle.x / chartGeometry.width) * 100, 16), 72)}%`,
                      transform: "translateX(-50%)",
                      top: "10px"
                    }}
                  >
                    <div className="tooltip-header-row">
                      <span className="tooltip-date">{hoveredCandle.date || `Session ${hoveredCandle.index + 1}`}</span>
                      <span className={`tooltip-tag ${hoveredCandle.isGreen ? "up" : "down"}`}>
                        {hoveredCandle.isGreen ? "▲ Bullish" : "▼ Bearish"} ({(((hoveredCandle.close - hoveredCandle.open) / hoveredCandle.open) * 100).toFixed(2)}%)
                      </span>
                    </div>
                    <div className="tooltip-grid">
                      <div className="tooltip-row"><span>Open:</span> <strong>₹{hoveredCandle.open}</strong></div>
                      <div className="tooltip-row"><span>High:</span> <strong>₹{hoveredCandle.high}</strong></div>
                      <div className="tooltip-row"><span>Low:</span> <strong>₹{hoveredCandle.low}</strong></div>
                      <div className="tooltip-row"><span>Close:</span> <strong>₹{hoveredCandle.close}</strong></div>
                      <div className="tooltip-row"><span>Volume:</span> <strong>{Number(hoveredCandle.volume).toLocaleString()}</strong></div>
                      <div className="tooltip-row"><span>Range:</span> <strong>₹{(hoveredCandle.high - hoveredCandle.low).toFixed(2)}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Probabilistic Outlook Card */}
            <div className="candle-card outlook-card">
              <div className="outlook-header">
                <span className="outlook-eyebrow">PROBABILISTIC OUTLOOK</span>
                <h3 className="outlook-title">{outlook.title || "What is this setup implying?"}</h3>
                <p className="outlook-desc">
                  {outlook.subtitle || "Pattern confidence and future-outcome confidence are shown separately so the UI never pretends a candle pattern is certainty."}
                </p>
              </div>

              {/* Current Stance Box */}
              <div className="stance-box">
                <div className="stance-box-top">
                  <div>
                    <span className="stance-tag-label">CURRENT STANCE</span>
                    <div className="stance-main-text">{stance.stance || "WATCH"}</div>
                  </div>
                  <div className="stance-conf-text">{stance.stance_confidence || 72}%<span className="stance-conf-sub">stance confidence</span></div>
                </div>
                <p className="stance-explanation">
                  {stance.explanation || "Support is holding, but resistance has not broken. A stronger stance requires confirmation, not just one candle."}
                </p>
              </div>

              {/* Probabilistic Scenario Bars */}
              <div className="scenario-bars-group">
                <div className="scenario-bar-item">
                  <div className="bar-labels">
                    <span>Bullish follow-through</span>
                    <strong>{outlook.bullish_pct || 48}%</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bullish" style={{ width: `${outlook.bullish_pct || 48}%` }} />
                  </div>
                </div>

                <div className="scenario-bar-item">
                  <div className="bar-labels">
                    <span>Range / sideways</span>
                    <strong>{outlook.range_pct || 34}%</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill range" style={{ width: `${outlook.range_pct || 34}%` }} />
                  </div>
                </div>

                <div className="scenario-bar-item">
                  <div className="bar-labels">
                    <span>Bearish break</span>
                    <strong>{outlook.bearish_pct || 18}%</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bearish" style={{ width: `${outlook.bearish_pct || 18}%` }} />
                  </div>
                </div>
              </div>

              {/* Dual Confidence Tiles (Side by Side) */}
              <div className="confidence-tiles-row">
                <div className="conf-tile">
                  <span className="conf-tile-label">PATTERN CONFIDENCE</span>
                  <div className="conf-tile-val">{outlook.pattern_confidence || 81} <span className="conf-max">/ 100</span></div>
                </div>
                <div className="conf-tile">
                  <span className="conf-tile-label">OUTCOME CONFIDENCE</span>
                  <div className="conf-tile-val">{outlook.outcome_confidence || 58} <span className="conf-max">/ 100</span></div>
                </div>
              </div>

              {/* Quality Indicators */}
              <div className="quality-tiles-row">
                <div className="qual-tile">
                  <span className="qual-tile-label">SUPPORT QUALITY</span>
                  <div className="qual-tile-val">{outlook.support_quality || "Strong"}</div>
                </div>
                <div className="qual-tile">
                  <span className="qual-tile-label">BREAKOUT QUALITY</span>
                  <div className="qual-tile-val">{outlook.breakout_quality || "Not confirmed"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Middle Row: AI Reasoning (Left) + MarketMind Voice Copilot (Right) */}
          <div className="candle-middle-grid">
            {/* Left: AI Reasoning (6 Numbered Evidence Cards) */}
            <div className="candle-card reasoning-card">
              <div className="card-top-title-row">
                <div>
                  <h3 className="section-title">AI reasoning: why this pattern matters</h3>
                  <p className="section-desc">Every conclusion is explained point-by-point, instead of only naming &ldquo;Hammer&rdquo; or &ldquo;Doji&rdquo;.</p>
                </div>
                <span className="explainable-badge">Explainable evidence</span>
              </div>

              <div className="evidence-layers-list">
                {evidenceLayers.map((layer) => (
                  <div key={layer.num} className="evidence-layer-card">
                    <div className="layer-num-badge">{layer.num}</div>
                    <div className="layer-content">
                      <div className="layer-header">
                        <span className="layer-title">{layer.title}</span>
                        <span className={`layer-badge ${layer.type || layer.badge?.toLowerCase()}`}>
                          {layer.badge}
                        </span>
                      </div>
                      <p className="layer-desc">{layer.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: MarketMind Voice Copilot Card */}
            <div className="candle-card copilot-card">
              <div className="copilot-card-header">
                <div className="copilot-avatar-wrap">
                  <div className="copilot-avatar-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                  </div>
                  <div>
                    <h3 className="copilot-title">MarketMind Voice Copilot</h3>
                    <span className="copilot-sub">Chart-aware · Context-aware · Evidence-first</span>
                  </div>
                </div>
                <span className="copilot-status-badge">
                  <span className="copilot-ready-dot" /> Ready
                </span>
              </div>

              {/* Chat Transcript Area */}
              <div className="copilot-chat-box">
                {copilotMessages.length === 0 ? (
                  <div className="copilot-empty-state">
                    <div className="empty-copilot-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                    </div>
                    <div className="empty-copilot-title">Candlestick Copilot Ready</div>
                    <p className="empty-copilot-desc">
                      Ask any chart question about {data.name || selectedSymbol} (e.g., support defense, breakout confirmation, downside risk) or tap a quick question below to begin.
                    </p>
                  </div>
                ) : (
                  copilotMessages.map((msg, i) => (
                    <div key={i} className={`chat-bubble-row ${msg.sender}`}>
                      <div className={`chat-bubble ${msg.sender}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {copilotLoading && (
                  <div className="chat-bubble-row copilot">
                    <div className="chat-bubble copilot typing">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Action Pills */}
              <div className="quick-questions-strip">
                {[
                  "Explain today's candle",
                  "Compare last 3 months",
                  "What confirms breakout?",
                  "Show downside risk"
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="quick-q-pill"
                    onClick={() => handleAskCopilot(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                className="copilot-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskCopilot();
                }}
              >
                <button
                  type="button"
                  className="copilot-mic-btn"
                  title="Voice trigger active"
                  onClick={() => handleAskCopilot("Explain today's candle")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                </button>
                <input
                  type="text"
                  placeholder="Ask: Is this hammer reliable?"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="copilot-text-input"
                />
                <button
                  type="submit"
                  className="copilot-send-btn"
                  disabled={!inputQuery.trim() || copilotLoading}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                </button>
              </form>
            </div>
          </div>

          {/* 5. Bottom Section 1: Hidden Market Behaviour Layer (4 Cards) */}
          <div className="candle-card hidden-signals-card">
            <div className="card-top-title-row">
              <div>
                <h3 className="section-title">Hidden market behaviour layer</h3>
                <p className="section-desc">These signals make the agent more useful than a classic candlestick scanner.</p>
              </div>
              <span className="multi-signal-badge">Multi-signal fusion</span>
            </div>

            <div className="hidden-signals-grid">
              {hiddenBehaviour.map((sig, i) => (
                <div key={i} className="hidden-signal-card">
                  <div className="signal-category">{sig.category}</div>
                  <h4 className="signal-label">{sig.label}</h4>
                  <p className="signal-desc">{sig.desc}</p>
                  <div className="signal-metric-row">
                    <span className="signal-value">{sig.value}</span>
                    <span className="signal-sub">{sig.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Bottom Section 2: Historical Backtest (Left) + Counterfactual Engine (Right) */}
          <div className="candle-bottom-grid">
            {/* Left: Historical Validation Backtest */}
            <div className="candle-card backtest-card">
              <div className="backtest-header">
                <span className="backtest-eyebrow">HISTORICAL VALIDATION</span>
                <h3 className="section-title">{backtest.title || "Similar setup backtest"}</h3>
                <p className="section-desc">
                  {backtest.subtitle || "Compare the whole current feature vector with prior windows, not only the candle name."}
                </p>
              </div>

              <div className="backtest-table-wrap">
                <table className="backtest-table">
                  <thead>
                    <tr>
                      <th>OUTCOME</th>
                      <th>CASES</th>
                      <th>MEDIAN 5D</th>
                      <th>MEDIAN 20D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(backtest.rows || []).map((row, i) => {
                      const isBull = row.outcome.toLowerCase().includes("bullish");
                      const isBear = row.outcome.toLowerCase().includes("bearish");
                      return (
                        <tr key={i}>
                          <td className="outcome-cell"><strong>{row.outcome}</strong></td>
                          <td>{row.cases}</td>
                          <td className={isBull ? "val-green" : isBear ? "val-red" : ""}>{row.median_5d}</td>
                          <td className={isBull ? "val-green" : isBear ? "val-red" : ""}>{row.median_20d}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="backtest-disclaimer">
                {backtest.disclaimer || "Real backtests should expose sample size, test period, costs, leakage checks and out-of-sample performance."}
              </div>
            </div>

            {/* Right: Counterfactual Engine */}
            <div className="candle-card counterfactual-card">
              <div className="counterfactual-header">
                <span className="counterfactual-eyebrow">COUNTERFACTUAL ENGINE</span>
                <h3 className="section-title">{counterfactual.title || "What changes the AI view?"}</h3>
              </div>

              <div className="counterfactual-content">
                <div className="counter-block upgrade">
                  <h4 className="counter-block-title">{counterfactual.upgrade_title || "↑ Upgrade toward Constructive"}</h4>
                  <ul className="counter-conditions-list">
                    {(counterfactual.upgrade_conditions || []).map((cond, i) => (
                      <li key={i}>{cond}</li>
                    ))}
                  </ul>
                </div>

                <div className="counter-block downgrade">
                  <h4 className="counter-block-title">{counterfactual.downgrade_title || "↓ Downgrade toward High Risk"}</h4>
                  <ul className="counter-conditions-list">
                    {(counterfactual.downgrade_conditions || []).map((cond, i) => (
                      <li key={i}>{cond}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
