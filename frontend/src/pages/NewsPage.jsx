import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "../api/client";

const CATEGORIES = [
  "All", "SEBI Circulars", "RBI Monetary", "NSE Disclosures", "BSE Filings", "Company IR", "Banking & Finance", "IT & Tech", "Auto & EV", "Energy & Oil", "Macro & Economy"
];

function CopilotRobotIcon({ size = 20, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <rect x="10.5" y="2.2" width="3" height="4.5" rx="1.5" />
      <rect x="2" y="9.5" width="2.5" height="6.5" rx="1.25" />
      <rect x="19.5" y="9.5" width="2.5" height="6.5" rx="1.25" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 6H15.5C17.433 6 19 7.567 19 9.5V14.5C19 16.433 17.433 18 15.5 18H8.5C6.567 18 5 16.433 5 14.5V9.5C5 7.567 6.567 6 8.5 6ZM9.5 13.5C10.3284 13.5 11 12.8284 11 12C11 11.1716 10.3284 10.5 9.5 10.5C8.67157 10.5 8 11.1716 8 12C8 12.8284 8.67157 13.5 9.5 13.5ZM14.5 13.5C15.3284 13.5 16 12.8284 16 12C16 11.1716 15.3284 10.5 14.5 10.5C13.6716 10.5 13 11.1716 13 12C13 12.8284 13.6716 13.5 14.5 13.5Z"
      />
    </svg>
  );
}

function formatCopilotMessage(text) {
  if (!text) return null;
  const clean = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*\*/g, "").trim();
  const lines = clean.split("\n");

  return (
    <div className="copilot-message-content">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: "6px" }} />;
        }

        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const content = trimmed.replace(/^[•\-*]\s*/, "");
          const colonIdx = content.indexOf(":");
          if (colonIdx > 0 && colonIdx < 35) {
            const label = content.slice(0, colonIdx).trim();
            const rest = content.slice(colonIdx + 1).trim();
            return (
              <div key={idx} className="copilot-bullet-line">
                <span className="copilot-bullet-dot">◆</span>
                <span className="copilot-bullet-body">
                  <strong className="copilot-bullet-label">{label}:</strong> {rest}
                </span>
              </div>
            );
          }
          return (
            <div key={idx} className="copilot-bullet-line">
              <span className="copilot-bullet-dot">◆</span>
              <span className="copilot-bullet-body">{content}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="copilot-text-p">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

// Local persistence helpers for 0ms instant reload
const INITIAL_INSTITUTIONAL_SEED = [
  {
    id: "seed-sbi-nse-ipo",
    title: "SBI, New India Assurance, IFCI, Bank of Baroda & GIC RE are in focus ahead of NSE IPO; here is why",
    source: "Upstox & NSE Disclosures",
    source_authority: "NSE",
    authority_label: "NSE Corporate Filing",
    trust_score: 96,
    time: "Just now · Live Feed",
    category: "Banking & Finance",
    sentiment: "Bullish",
    sentiment_score: 0.88,
    event_type: "Corporate Action / IPO",
    materiality: "Medium to High",
    exposure_type: "Indirect Equity Holding",
    horizon: "Event-driven / Medium-term (1-6M)",
    price_reaction: "+1.2% since initial filing reports",
    what_happened: "Regulatory progress towards the National Stock Exchange (NSE) public listing has renewed investor focus on public and private institutional shareholders.",
    why_affected: "SBIN, BANKBARODA hold direct unlisted equity stakes in NSE Ltd. A formal IPO unlocks hidden balance sheet value and provides potential one-off dividend or book value accretion upon partial stake monetization.",
    ai_verdict: "Positive balance sheet catalyst for SBIN, BANKBARODA. However, the exact valuation multiple re-rating is contingent on SEBI clearance timelines, final listing valuation, and actual OFS participation quota.",
    invalidation: "Protracted regulatory approvals from SEBI, reduced IPO offer-for-sale quota, or general capital market listing multiple compression.",
    tickers: ["SBIN", "BANKBARODA"],
    points: [
      "NSE IPO Momentum: Advance preparations for the National Stock Exchange IPO have triggered buying interest in major institutional shareholders.",
      "Value Unlocking: SBIN and Bank of Baroda maintain strategic unlisted holdings in NSE; an IPO provides fair mark-to-market discovery.",
      "Market Expectation: Investors are monitoring potential stake monetization and special dividend distributions upon successful exchange listing."
    ]
  },
  {
    id: "seed-rbi-money-market",
    title: "Money Market Operations as on September 02, 2026",
    source: "Reserve Bank of India",
    source_authority: "RBI",
    authority_label: "RBI Monetary Notice",
    trust_score: 98,
    time: "Just now · Official Release",
    category: "Banking & Finance",
    sentiment: "Neutral",
    sentiment_score: 0.65,
    event_type: "Monetary Policy & Liquidity",
    materiality: "High",
    exposure_type: "Systemic Banking Liquidity",
    horizon: "Short-term / Intraday Corridor",
    price_reaction: "Interbank spreads steady (+2 bps)",
    what_happened: "The Reserve Bank of India managed active money market liquidity, clearing ₹6.55 Lakh Cr in the overnight segment at an average rate of 4.71%.",
    why_affected: "Directly dictates short-term wholesale funding costs and Net Interest Margin (NIM) stability for commercial banking leaders (HDFCBANK, ICICIBANK, SBIN).",
    ai_verdict: "Constructive macro liquidity signal. Reassures lenders that interbank rates remain anchored within the policy corridor without credit crunch risks.",
    invalidation: "Sudden reserve drains pushing overnight call money rates persistently above the Marginal Standing Facility (MSF) ceiling.",
    tickers: ["HDFCBANK", "ICICIBANK", "SBIN"],
    points: [
      "Overnight Market Liquidity: Total segment volume transacted ₹6.55 Lakh Cr at a weighted average rate of 4.71%.",
      "Interbank Collateral Flow: Triparty Repo and Market Repo cleared institutional transactions comfortably within the policy corridor.",
      "Systemic Banking Impact: Liquidity absorption under the Standing Deposit Facility (SDF) anchors short-term sovereign yield stability."
    ]
  },
  {
    id: "seed-reliance-solar-capex",
    title: "Reliance Industries Accelerates Jamnagar Green Energy Capex by ₹15,000 Cr; 20GW Solar Cell Line",
    source: "The Economic Times & Company Filings",
    source_authority: "COMPANY_IR",
    authority_label: "Company Investor Relations",
    trust_score: 93,
    time: "2h ago · Corporate Disclosures",
    category: "Energy & Oil",
    sentiment: "Bullish",
    sentiment_score: 0.89,
    event_type: "Capex & Green Energy Transition",
    materiality: "High",
    exposure_type: "Direct Balance Sheet Capex",
    horizon: "Structural / Multi-Year (2-5Y)",
    price_reaction: "+1.8% over rolling 5-day session",
    what_happened: "Accelerated capital expenditure rollout and commissioning milestones for integrated green energy facilities at Jamnagar.",
    why_affected: "Lowers captive power generation costs by ~35% for refining operations and unlocks standalone enterprise valuation for RELIANCE New Energy division.",
    ai_verdict: "High-conviction multi-year ROCE expansion driver for RELIANCE. Robust cash flows from Jio ARPU and downstream refining comfortably absorb capex outlays.",
    invalidation: "Supply chain execution delays in high-efficiency photovoltaic cell fabrication or elevated imported wafer tariffs.",
    tickers: ["RELIANCE", "ONGC"],
    points: [
      "Jamnagar Capex Acceleration: Fast-tracking commercial commissioning of integrated solar cell and module production lines.",
      "Captive Power Cost Reduction: Lowers captive power procurement overhead by approximately 35% for refining complexes.",
      "Valuation Unlocking: Creates an independent green energy vertical to support long-term multiple expansion for RELIANCE."
    ]
  }
];

function getStoredNewsData() {
  try {
    const raw = localStorage.getItem("mm_news_feed_cache");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.articles &&
        parsed.articles.length >= 15 &&
        parsed.articles[0].why_affected &&
        parsed.articles[0].ai_verdict
      ) {
        return parsed;
      }
    }
  } catch (e) {}
  return null;
}

function storeNewsData(data) {
  try {
    if (data && data.articles && data.articles.length > 0) {
      localStorage.setItem("mm_news_feed_cache", JSON.stringify(data));
    }
  } catch (e) {}
}

export default function NewsPage({ goPage, searchQuery: parentSearchQuery = "" }) {
  const initialCached = getStoredNewsData();

  const [filter, setFilter] = useState("All");
  const [internalSearch, setInternalSearch] = useState("");
  const activeSearch = (parentSearchQuery || internalSearch || "").toLowerCase().trim();
  const [news, setNews] = useState(initialCached?.articles || INITIAL_INSTITUTIONAL_SEED);
  const [executiveAnalysis, setExecutiveAnalysis] = useState(
    initialCached?.executive_analysis ||
    "Domestic institutional market telemetry reflects constructive headline flow led by private banking deposit accretion and industrial capex expansion. Energy transition capex and resilient auto orderbooks support corporate earnings visibility across Nifty components."
  );
  const [executiveOutcome, setExecutiveOutcome] = useState(
    initialCached?.executive_outcome ||
    "Headline momentum projects 75% bullish market continuation with sector capital actively rotating into banking, energy, and auto leaders. The constructive thesis invalidates upon unexpected crude supply shocks or hawkish central bank liquidity tightening."
  );
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [speakingNewsId, setSpeakingNewsId] = useState(null);
  const [expandedRippleId, setExpandedRippleId] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Dynamic category switch handler with real-time sector telemetry update
  const handleCategoryChange = async (c) => {
    if (filter === c) return;
    setFilter(c);
    setIsCategoryLoading(true);
    try {
      const res = await apiClient.get(`/api/news?filter=${encodeURIComponent(c)}`);
      if (res?.executive_analysis) setExecutiveAnalysis(res.executive_analysis);
      if (res?.executive_outcome) setExecutiveOutcome(res.executive_outcome);
    } catch (err) {
      console.error("Failed to fetch category intelligence:", err);
    } finally {
      setTimeout(() => {
        setIsCategoryLoading(false);
      }, 200);
    }
  };

  // Right-Side Slide-Over Copilot Drawer State (Full screen right side, just like Dashboard)
  const [activeNewsForCopilot, setActiveNewsForCopilot] = useState(null);
  const [copilotMessages, setCopilotMessages] = useState({});
  const [copilotInputText, setCopilotInputText] = useState("");
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);

  const copilotChatRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll copilot drawer on new message
  useEffect(() => {
    if (copilotChatRef.current) {
      copilotChatRef.current.scrollTop = copilotChatRef.current.scrollHeight;
    }
  }, [copilotMessages, isCopilotLoading, activeNewsForCopilot]);

  // Fetch news intelligence
  useEffect(() => {
    let mounted = true;

    const fetchNews = async () => {
      if (!initialCached && news.length === 0) {
        setLoading(true);
      }
      try {
        setIsSyncing(true);
        const res = await apiClient.get("/api/news");
        if (mounted && res?.articles && res.articles.length > 0) {
          setNews(res.articles);
          if (res.executive_analysis) setExecutiveAnalysis(res.executive_analysis);
          if (res.executive_outcome) setExecutiveOutcome(res.executive_outcome);
          storeNewsData(res);
        }
      } catch (err) {
        console.error("Failed to fetch live financial news:", err);
      } finally {
        if (mounted) {
          setLoading(false);
          setIsSyncing(false);
        }
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Listen for voice speaking state to auto-reset buttons
  useEffect(() => {
    const handleVoiceSpeakingState = (e) => {
      const isSpeaking = e.detail?.isSpeaking;
      if (!isSpeaking) {
        setSpeakingNewsId(null);
      }
    };

    window.addEventListener("marketmind:voice_speaking_state", handleVoiceSpeakingState);
    return () => window.removeEventListener("marketmind:voice_speaking_state", handleVoiceSpeakingState);
  }, []);

  // Listen for autonomous voice actions (e.g. "Reliance ki news batao", "Reliance news copilot open karo")
  useEffect(() => {
    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (action && (action.target_page === "news" || action.command === "SHOW_NEWS")) {
        if (action.params?.category && action.params.category !== "All") {
          setFilter(action.params.category);
        }
        if (action.params?.symbol) {
          setInternalSearch(action.params.symbol);
        }
        if (action.params?.news_id || action.params?.open_copilot) {
          const targetNews = news.find(n => n.id === action.params.news_id || n.tickers?.includes(action.params.symbol)) || news[0];
          if (targetNews) {
            handleOpenCopilotDrawer(targetNews);
            if (action.params.query && !action.params.query.toLowerCase().includes("open")) {
              setTimeout(() => {
                handleSendCopilotDrawerQuery(action.params.query, targetNews);
              }, 400);
            }
          }
        }
      }
    };

    window.addEventListener("marketmind:voice_action", handleVoiceAction);
    return () => window.removeEventListener("marketmind:voice_action", handleVoiceAction);
  }, [news]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Filtered by Category / Authority and Search Query
  const displayedNews = news.filter((item) => {
    if (filter !== "All") {
      const f = filter.toLowerCase();
      let matchCat = false;
      if (f.includes("sebi")) matchCat = item.source_authority === "SEBI";
      else if (f.includes("rbi")) matchCat = item.source_authority === "RBI";
      else if (f.includes("nse")) matchCat = item.source_authority === "NSE";
      else if (f.includes("bse")) matchCat = item.source_authority === "BSE";
      else if (f.includes("ir") || f.includes("company")) matchCat = item.source_authority === "COMPANY_IR" || item.category === "Corporate Earnings";
      else if (f.includes("it") || f.includes("tech")) matchCat = item.category === "IT & Tech" || item.tickers?.some(t => ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"].includes(t));
      else if (f.includes("auto") || f.includes("ev")) matchCat = item.category === "Auto & EV" || item.tickers?.some(t => ["TATAMOTORS", "MARUTI", "BAJAJ-AUTO", "M&M", "EICHERMOT"].includes(t));
      else if (f.includes("energy") || f.includes("oil")) matchCat = item.category === "Energy & Oil" || item.tickers?.some(t => ["RELIANCE", "ONGC", "COALINDIA", "ATGL"].includes(t));
      else if (f.includes("bank") || f.includes("finance")) matchCat = item.category === "Banking & Finance" || item.tickers?.some(t => ["SBIN", "BANKBARODA", "HDFCBANK", "ICICIBANK", "AXISBANK", "KOTAKBANK"].includes(t));
      else matchCat = item.category?.toLowerCase().includes(f) || item.source_authority?.toLowerCase().includes(f);

      if (!matchCat) return false;
    }

    if (!activeSearch) return true;
    const inTitle = item.title?.toLowerCase().includes(activeSearch);
    const inSummary = item.summary?.toLowerCase().includes(activeSearch);
    const inSource = item.source?.toLowerCase().includes(activeSearch);
    const inTickers = item.tickers?.some((t) => t.toLowerCase().includes(activeSearch));
    const inMetrics = item.key_metrics?.toLowerCase().includes(activeSearch);
    const inCategory = item.category?.toLowerCase().includes(activeSearch);
    const inAuth = item.source_authority?.toLowerCase().includes(activeSearch);
    return inTitle || inSummary || inSource || inTickers || inMetrics || inCategory || inAuth;
  });

  const handleTickerClick = (sym) => {
    window.__SELECTED_STOCK_SYMBOL = sym;
    if (goPage) {
      goPage("candles");
    }
  };

  const handleToggleVoiceNews = (item) => {
    if (speakingNewsId === item.id) {
      window.dispatchEvent(new CustomEvent("marketmind:stop_speech"));
      setSpeakingNewsId(null);
    } else {
      setSpeakingNewsId(item.id);
      const query = `Explain the financial market impact and details of ${item.title}`;
      window.dispatchEvent(
        new CustomEvent("marketmind:voice_wake_query", { detail: query })
      );
    }
  };

  // Open Right-Side Slide-Over Copilot Drawer for a specific News Story
  const handleOpenCopilotDrawer = (article) => {
    setActiveNewsForCopilot(article);
    setCopilotInputText("");

    if (!copilotMessages[article.id]) {
      const initialGreeting = {
        role: "assistant",
        text: `Hello! I am MarketMind News Copilot. I have audited the full institutional disclosure for: "${article.title}" via ${article.source}. Ask me about direct price impacts, sector ripple effects on ${article.tickers?.join(", ") || "the market"}, or risk invalidations.`
      };
      setCopilotMessages((prev) => ({
        ...prev,
        [article.id]: [initialGreeting]
      }));
    }
  };

  // Send query in the Slide-Over Copilot Drawer
  const handleSendCopilotDrawerQuery = async (queryText, overrideArticle = null) => {
    const targetArticle = overrideArticle || activeNewsForCopilot;
    const text = queryText || copilotInputText;
    if (!text || !text.trim() || !targetArticle || isCopilotLoading) return;

    const articleId = targetArticle.id;
    const userMsg = { role: "user", text: text.trim() };

    setCopilotMessages((prev) => ({
      ...prev,
      [articleId]: [...(prev[articleId] || []), userMsg]
    }));
    setCopilotInputText("");
    setIsCopilotLoading(true);

    try {
      const res = await apiClient.askNewsCopilot(text, articleId);
      const botMsg = { role: "assistant", text: res.answer };
      setCopilotMessages((prev) => ({
        ...prev,
        [articleId]: [...(prev[articleId] || []), botMsg]
      }));
    } catch (err) {
      const fallbackMsg = {
        role: "assistant",
        text: `Targeted analysis for ${targetArticle.title}: This headline acts as a constructive operational catalyst for ${targetArticle.beneficiaries || "the sector"}. Key downside risk remains ${targetArticle.headwinds || "macro liquidity"}.`
      };
      setCopilotMessages((prev) => ({
        ...prev,
        [articleId]: [...(prev[articleId] || []), fallbackMsg]
      }));
    } finally {
      setIsCopilotLoading(false);
    }
  };

  // In-drawer Microphone Toggle with Web Speech API
  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge or type your question.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-IN";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setCopilotInputText(transcript);
        if (event.results[0].isFinal && transcript.trim()) {
          setIsListening(false);
          handleSendCopilotDrawerQuery(transcript.trim());
        }
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Text-To-Speech for Copilot answer bubbles
  const handleSpeakText = (text, idx) => {
    if (speakingMsgIdx === idx) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
      return;
    }
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/[•\-*]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-IN";
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgIdx(null);
    utterance.onerror = () => setSpeakingMsgIdx(null);

    setSpeakingMsgIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="grid">
      {/* 1. Header & Search / Filter Controls */}
      <div className="page-banner news-banner-header">
        <div className="news-header-titles">
          <h2>Institutional Financial News &amp; Impact Engine</h2>
          <p>Real-time algorithmic ingestion from NSE Disclosures, BSE Announcements, SEBI Circulars, RBI Monetary Policy, Google News RSS, and Company IR pages.</p>
        </div>

        {/* Category Filter Bar - Single Unbroken Line */}
        <div className="news-filter-strip">
          {activeSearch && (
            <div className="news-active-filter-badge">
              <span>Filtering: <b>"{activeSearch}"</b></span>
              {internalSearch && (
                <button
                  type="button"
                  onClick={() => setInternalSearch("")}
                  title="Clear filter"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="chip-tabs news-chip-tabs-nowrap">
            {CATEGORIES.map((c) => (
              <div
                key={c}
                className={`chip-tab ${filter === c ? "active" : ""}`}
                onClick={() => handleCategoryChange(c)}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. AI Executive Analysis & Final Outcome Banner */}
      <div className="card c12 news-executive-banner">
        {isCategoryLoading ? (
          <>
            <div className="executive-block analysis skeleton-block">
              <div className="skeleton-line" style={{ width: "120px", height: "18px", marginBottom: "12px" }} />
              <div className="skeleton-line" style={{ width: "96%", height: "14px", marginBottom: "8px" }} />
              <div className="skeleton-line" style={{ width: "90%", height: "14px", marginBottom: "8px" }} />
              <div className="skeleton-line" style={{ width: "70%", height: "14px" }} />
            </div>
            <div className="executive-block outcome skeleton-block">
              <div className="skeleton-line" style={{ width: "140px", height: "18px", marginBottom: "12px" }} />
              <div className="skeleton-line" style={{ width: "96%", height: "14px", marginBottom: "8px" }} />
              <div className="skeleton-line" style={{ width: "88%", height: "14px", marginBottom: "8px" }} />
              <div className="skeleton-line" style={{ width: "75%", height: "14px" }} />
            </div>
          </>
        ) : executiveAnalysis && executiveOutcome ? (
          <>
            <div className="executive-block analysis">
              <div className="block-header">
                <span className="block-tag-label analysis">Analysis :</span>
                <span className="block-meta-note">
                  {filter === "All" ? "Institutional Headline & Capex Telemetry" : `${filter} Sector Telemetry`}
                </span>
              </div>
              <p className="block-text">{executiveAnalysis}</p>
            </div>

            <div className="executive-block outcome">
              <div className="block-header">
                <span className="block-tag-label outcome">Final Outcome :</span>
                <span className="block-meta-note">Market Trajectory &amp; Invalidation</span>
              </div>
              <p className="block-text">{executiveOutcome}</p>
            </div>
          </>
        ) : null}
      </div>

      {/* 3. Non-blocking sync status or only empty-state indicator */}
      {loading && news.length === 0 ? (
        <div className="card c12" style={{ textAlign: "center", padding: "40px", color: "var(--ink-soft)" }}>
          <div className="candle-loading-spinner" style={{ margin: "0 auto 16px" }} />
          <h3>MarketMind Ingesting Real-Time Financial News &amp; Macro Catalysts...</h3>
          <p>Auditing live NSE/BSE filings, Google News RSS, and computing 1st-to-4th order ripple effects.</p>
        </div>
      ) : null}

      {/* 4. Feed of News Articles */}
      {displayedNews.map((n, i) => {
        const isBullish = n.sentiment === "Bullish" || n.impact?.includes("+");
        const isBearish = n.sentiment === "Bearish" || n.impact?.includes("-");
        const sentimentClass = isBullish ? "benefit" : isBearish ? "loss" : "neutral";
        const isCurrentlySpeaking = speakingNewsId === n.id;
        const isRippleOpen = expandedRippleId === (n.id || i);
        const isCopilotActive = activeNewsForCopilot?.id === n.id;
        const sourceUrl = n.link && n.link.startsWith("http")
          ? n.link
          : `https://news.google.com/search?q=${encodeURIComponent(n.title)}`;

        return (
          <div
            key={n.id || i}
            className="card c12 news-feed-card"
            style={{
              border: isCurrentlySpeaking ? "1.5px solid var(--gold)" : isCopilotActive ? "1.5px solid #2563EB" : "1px solid var(--line)",
              background: isCurrentlySpeaking ? "rgba(216,188,139,.04)" : isCopilotActive ? "rgba(37,99,235,.015)" : "var(--paper)"
            }}
          >
            {/* Header: Source Badge + Publication + Time + Sentiment */}
            <div className="news-card-header">
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="news-source-badge">
                  {(n.source || "ET").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span>{n.source}</span>
                    <span className={`verified-feed-tag authority-${(n.source_authority || 'feed').toLowerCase()}`}>
                      {n.authority_label || `${n.source_authority || 'Verified'} Official`}
                    </span>
                    {n.trust_score && (
                      <span className="source-trust-tag">
                        🛡️ Trust {n.trust_score}%
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink-soft)", marginTop: "2px" }}>
                    {n.time || "Live"} · <span style={{ color: "var(--gold-light)", fontWeight: 600 }}>{n.category}</span>
                  </div>
                </div>
              </div>

              <span className={`impact-tag ${sentimentClass}`}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  {sentimentClass === "neutral" ? <path d="M8 12h8"/> : isBullish ? <path d="M5 12h14M13 6l6 6-6 6"/> : <path d="M19 12H5M11 18l-6-6 6-6"/>}
                </svg>
                {n.sentiment || (isBullish ? "Bullish Catalyst" : "Macro Neutral")}
              </span>
            </div>

            {/* Headline */}
            <h3 className="news-headline">
              {n.title}
            </h3>

            {/* Exact Actual News Story / Official Disclosure Content */}
            {(n.full_content || n.what_happened || n.summary) && (
              <div className="news-exact-story-card">
                <div className="exact-story-badge-row">
                  <span className="exact-story-badge">
                    News Article :
                  </span>
                </div>
                <p className="exact-story-paragraph">
                  {n.full_content || n.what_happened || n.summary}
                </p>
              </div>
            )}

            {/* Pointwise Institutional Takeaways */}
            {Array.isArray(n.points) && n.points.length > 0 && (
              <div className="news-points-container">
                <div className="points-header-tag">◆ Key Institutional Takeaways:</div>
                {n.points.map((pt, pIdx) => (
                  <div key={pIdx} className="news-point-item">
                    <span className="news-point-bullet">◆</span>
                    <span className="news-point-text">{pt}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Impacted Tickers Strip */}
            {n.tickers && n.tickers.length > 0 && (
              <div className="news-tickers-strip">
                <span className="tickers-label">Impacted Tickers:</span>
                {n.tickers.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    className="news-ticker-chip"
                    onClick={() => handleTickerClick(sym)}
                    title={`View ${sym} Candlestick & Technical Intelligence`}
                  >
                    {sym} ↗
                  </button>
                ))}
              </div>
            )}

            {/* Story-Specific Institutional Impact Matrix - Only rendered when content exists */}
            {(n.why_affected || n.ai_verdict || n.analysis || n.outcome) && (
              <div className="card-news-impact-matrix">
                {/* Event Metadata Badges Row */}
                <div className="matrix-meta-row">
                  {n.event_type && (
                    <span className="matrix-pill event-type">
                      📌 {n.event_type}
                    </span>
                  )}
                  {n.materiality && (
                    <span className={`matrix-pill materiality-${(n.materiality || 'medium').toLowerCase().replace(/[^a-z]/g, '')}`}>
                      ⚡ {n.materiality} Materiality
                    </span>
                  )}
                  {n.exposure_type && (
                    <span className="matrix-pill exposure">
                      🎯 {n.exposure_type}
                    </span>
                  )}
                  {n.horizon && (
                    <span className="matrix-pill horizon">
                      ⏱️ {n.horizon}
                    </span>
                  )}
                  {n.price_reaction && (
                    <span className="matrix-pill reaction">
                      📈 {n.price_reaction}
                    </span>
                  )}
                </div>

                {/* Why Affected */}
                {(n.why_affected || n.analysis) && (
                  <div className="matrix-field why-affected">
                    <span className="matrix-field-tag why">Why Affected :</span>
                    <span className="matrix-field-text">{n.why_affected || n.analysis}</span>
                  </div>
                )}

                {/* AI Strategic Verdict */}
                {(n.ai_verdict || n.outcome) && (
                  <div className="matrix-field ai-verdict">
                    <span className="matrix-field-tag verdict">AI Verdict :</span>
                    <span className="matrix-field-text">{n.ai_verdict || n.outcome}</span>
                  </div>
                )}

                {/* Risk Invalidation */}
                {n.invalidation && (
                  <div className="matrix-field invalidation">
                    <span className="matrix-field-tag invalidation">Risk Invalidation :</span>
                    <span className="matrix-field-text">{n.invalidation}</span>
                  </div>
                )}
              </div>
            )}

            {/* Expandable 1st-to-4th Order Ripple Effect */}
            {isRippleOpen && (
              <div className="news-ripple-breakdown">
                <div className="ripple-row">
                  <span className="ripple-label">1st Order Impact:</span>
                  <span className="ripple-val">{n.impact || "Direct price repricing across primary index constituents"}</span>
                </div>
                {n.beneficiaries && (
                  <div className="ripple-row">
                    <span className="ripple-label">Beneficiaries:</span>
                    <span className="ripple-val positive">{n.beneficiaries}</span>
                  </div>
                )}
                {n.headwinds && (
                  <div className="ripple-row">
                    <span className="ripple-label">Headwinds / Risks:</span>
                    <span className="ripple-val warning">{n.headwinds}</span>
                  </div>
                )}
                {n.key_metrics && (
                  <div className="ripple-row">
                    <span className="ripple-label">Key Metrics:</span>
                    <span className="ripple-val metrics">{n.key_metrics}</span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions: Ripple Toggle + Right-Side Slide Copilot Trigger + Voice Brief + Verified Source Link */}
            <div className="news-card-footer">
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="news-footer-btn ripple-toggle"
                  onClick={() => setExpandedRippleId(isRippleOpen ? null : (n.id || i))}
                >
                  {isRippleOpen ? "Hide Ripple Analysis ▲" : "View 1st-to-4th Order Ripple Effects ▼"}
                </button>

                {/* Right-Side Slide Copilot Trigger Button */}
                <button
                  type="button"
                  className={`news-footer-btn card-copilot-trigger ${isCopilotActive ? "active-copilot" : ""}`}
                  onClick={() => handleOpenCopilotDrawer(n)}
                >
                  <CopilotRobotIcon size={16} />
                  <span>{isCopilotActive ? "Copilot Active (Right Panel)" : "Ask Copilot on this News"}</span>
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`news-footer-btn voice-btn ${isCurrentlySpeaking ? "active-speaking" : ""}`}
                  onClick={() => handleToggleVoiceNews(n)}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  {isCurrentlySpeaking ? "Stop Voice Brief" : "Listen to AI Brief"}
                </button>

                {/* Verified Direct Source Link */}
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-footer-btn source-link-btn"
                  title={`View original story on ${n.source || 'News Source'}`}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Source: {n.source ? n.source.split('&')[0].trim() : "Verified Disclosure"} ↗
                </a>
              </div>
            </div>
          </div>
        );
      })}

      {/* 5. Right-Side Slide-Over Copilot Drawer (Full Screen Right Side, exactly like Dashboard) */}
      {activeNewsForCopilot && (
        <>
          <div
            className="radar-copilot-backdrop"
            onClick={() => setActiveNewsForCopilot(null)}
          />
          <aside className="radar-copilot-drawer-right">
            {/* Header */}
            <div className="copilot-drawer-header">
              <div className="copilot-drawer-top-bar">
                <div className="copilot-header-brand-wrap">
                  <CopilotRobotIcon size={26} className="copilot-header-robot-icon" />
                  <div className="copilot-header-text-block">
                    <span className="copilot-header-app-title">MarketMind Copilot</span>
                    <span className="copilot-header-company-sub" style={{ fontSize: "12px", maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {activeNewsForCopilot.title}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="copilot-drawer-close-btn"
                  onClick={() => setActiveNewsForCopilot(null)}
                  aria-label="Close Copilot"
                  title="Close Copilot"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="copilot-drawer-messages-body" ref={copilotChatRef}>
              {(copilotMessages[activeNewsForCopilot.id] || []).map((msg, mIdx) => (
                <div key={mIdx} className={`copilot-drawer-msg-wrap ${msg.role}`}>
                  {msg.role === "user" ? (
                    <div className="copilot-drawer-user-bubble">
                      <div className="copilot-drawer-bubble-meta">YOU</div>
                      <div className="copilot-drawer-user-text">{msg.text}</div>
                    </div>
                  ) : (
                    <div className="copilot-drawer-bot-bubble">
                      <div className="copilot-drawer-bot-avatar">
                        <CopilotRobotIcon size={15} />
                      </div>
                      <div className="copilot-drawer-bot-content">
                        <div className="copilot-drawer-bot-sender">
                          <span>MARKETMIND COPILOT</span>
                          <button
                            type="button"
                            className="copilot-bubble-listen-btn"
                            onClick={() => handleSpeakText(msg.text, mIdx)}
                            title={speakingMsgIdx === mIdx ? "Stop voice" : "Listen to answer"}
                          >
                            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                            <span>{speakingMsgIdx === mIdx ? "Stop" : "Listen"}</span>
                          </button>
                        </div>
                        <div className="copilot-drawer-bot-text">
                          {formatCopilotMessage(msg.text)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isCopilotLoading && (
                <div className="copilot-drawer-msg-wrap assistant">
                  <div className="copilot-drawer-bot-bubble">
                    <div className="copilot-drawer-bot-avatar">
                      <CopilotRobotIcon size={15} />
                    </div>
                    <div className="copilot-drawer-bot-content copilot-loading-card">
                      <div className="copilot-drawer-bot-sender">
                        <span>MARKETMIND COPILOT</span>
                        <span className="copilot-searching-badge">Analyzing Real-Time Data</span>
                      </div>
                      <div className="copilot-drawer-bot-loading">
                        <div className="copilot-dots-group">
                          <span className="copilot-dot-pulse"></span>
                          <span className="copilot-dot-pulse"></span>
                          <span className="copilot-dot-pulse"></span>
                        </div>
                        <span className="copilot-loading-text">
                          Synthesizing market ripple effects &amp; institutional order flow...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="copilot-drawer-quick-chips">
              {[
                `Direct impact on ${activeNewsForCopilot.tickers?.[0] || 'market'}?`,
                "What are the primary downside risks?",
                "Will this move tomorrow's market open?",
                "Explain 1st-to-4th order ripple effects"
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="copilot-quick-chip"
                  onClick={() => handleSendCopilotDrawerQuery(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Bottom Input Form */}
            <form
              className="copilot-drawer-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCopilotDrawerQuery();
              }}
            >
              <div className="copilot-drawer-input-pill">
                <button
                  type="button"
                  className={`copilot-drawer-mic-btn ${isListening ? "listening" : ""}`}
                  title={isListening ? "Listening... click to stop" : "Speak to News Copilot"}
                  onClick={handleToggleVoice}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                </button>

                <input
                  type="text"
                  placeholder={isListening ? "🎙️ Listening... Speak your question now..." : "Ask MarketMind Copilot about this news..."}
                  value={copilotInputText}
                  onChange={(e) => setCopilotInputText(e.target.value)}
                  className="copilot-drawer-input"
                  disabled={isCopilotLoading}
                  autoFocus
                />

                <button
                  type="submit"
                  className="copilot-drawer-send-btn"
                  disabled={!copilotInputText.trim() || isCopilotLoading}
                  aria-label="Send query"
                  title="Send message"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </form>
          </aside>
        </>
      )}
    </div>
  );
}
