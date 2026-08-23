import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { newsArticles as fallbackNews } from "../data/mockData";

const CATEGORIES = [
  "All", "Banking & Finance", "IT & Tech", "Auto & EV", "Energy & Oil", "Macro & Economy"
];

export default function NewsPage({ goPage }) {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [speakingNewsId, setSpeakingNewsId] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getNews(filter === "All" ? "" : filter);
        if (data && data.length > 0) {
          setNews(data);
        } else {
          setNews(fallbackNews);
        }
      } catch (err) {
        console.warn("Using fallback news articles", err);
        setNews(fallbackNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, [filter]);

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

  // Filtered by Search Query & Category
  const displayedNews = news.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const inTitle = item.title?.toLowerCase().includes(q);
    const inSummary = item.summary?.toLowerCase().includes(q);
    const inSource = item.source?.toLowerCase().includes(q);
    const inTickers = item.tickers?.some(t => t.toLowerCase().includes(q));
    const inMetrics = item.key_metrics?.toLowerCase().includes(q);
    return inTitle || inSummary || inSource || inTickers || inMetrics;
  });

  const bullishCount = news.filter(n => n.sentiment === "Bullish").length;
  const totalCount = news.length || 1;
  const bullishPct = Math.round((bullishCount / totalCount) * 100);

  const handleTickerClick = (sym) => {
    window.__SELECTED_STOCK_SYMBOL = sym;
    if (goPage) {
      goPage("candles");
    }
  };

  const handleToggleVoiceNews = (item) => {
    if (speakingNewsId === item.id) {
      // User requested to STOP speech
      window.dispatchEvent(new CustomEvent("marketmind:stop_speech"));
      setSpeakingNewsId(null);
    } else {
      // User requested to START voice explanation
      setSpeakingNewsId(item.id);
      const query = `Explain the financial market impact and details of ${item.title}`;
      window.dispatchEvent(
        new CustomEvent("marketmind:voice_wake_query", { detail: query })
      );
    }
  };

  return (
    <div className="grid">
      {/* Top Header & Institutional Controls */}
      <div className="page-banner">
        <div>
          <h2>Institutional Financial News &amp; Impact Engine</h2>
          <p>Real-time algorithmic ingestion from NSE/BSE filings, Google News RSS, and economic disclosures — quantified with 1st-to-4th order sector ripple effects.</p>
        </div>
        
        {/* Search & Category Filter Bar */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: "240px" }}>
            <input
              type="text"
              placeholder="Search by stock or keyword (e.g. Gold, Tata, Jamnagar, HDFC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 34px",
                borderRadius: "10px",
                border: "1px solid var(--line)",
                background: "var(--paper)",
                fontSize: "12.5px",
                fontWeight: 500,
                boxShadow: "0 2px 6px rgba(16,27,51,.04)"
              }}
            />
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: "11px", top: "10px" }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>

          <div className="chip-tabs">
            {CATEGORIES.map((c) => (
              <div
                key={c}
                className={`chip-tab ${filter === c ? "active" : ""}`}
                onClick={() => setFilter(c)}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Market Sentinel Overview Strip */}
      <div className="card c12" style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", background: "linear-gradient(135deg, var(--paper), var(--cream))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="live-pulse" style={{ width: "8px", height: "8px" }}></span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", letterSpacing: "0.5px" }}>
            MARKET SENTIMENT SENTINEL:
          </span>
          <span style={{ fontSize: "13px", color: "#2F6F62", fontWeight: 700 }}>
            {bullishPct}% Bullish Dominance
          </span>
        </div>

        <div style={{ display: "flex", gap: "18px", fontSize: "12.5px", color: "var(--ink-soft)" }}>
          <span>🟢 <b>{bullishCount}</b> Positive Catalysts</span>
          <span>⚖️ <b>{news.length - bullishCount}</b> Macro Watch</span>
          <span>⚡ Live Feeds Syncing every 30s</span>
        </div>
      </div>

      {loading && news.length === 0 && (
        <div className="card c12" style={{ textAlign: "center", padding: "40px", color: "var(--ink-soft)" }}>
          Ingesting live financial news feeds from Indian exchanges...
        </div>
      )}

      {displayedNews.map((n, i) => {
        const isBullish = n.sentiment === "Bullish" || n.impact?.includes("+");
        const isBearish = n.sentiment === "Bearish" || n.impact?.includes("-");
        const sentimentClass = isBullish ? "benefit" : isBearish ? "loss" : "neutral";
        const score = Math.round(Math.abs(n.sentiment_score || 0.82) * 100);
        const isCurrentlySpeaking = speakingNewsId === n.id;

        return (
          <div key={n.id || i} className="card c12" style={{ padding: "22px 26px", marginBottom: "14px", border: isCurrentlySpeaking ? "1.5px solid var(--gold)" : "1px solid var(--line)", background: isCurrentlySpeaking ? "rgba(216,188,139,.04)" : "var(--paper)" }}>
            {/* Header: Source Badge + Publication + Time + Sentiment */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", marginBottom: "10px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, var(--navy), var(--navy-2))", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0, boxShadow: "0 3px 8px rgba(16,27,51,.15)" }}>
                  {(n.source || "ET").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{n.source}</span>
                    <span style={{ fontSize: "10px", color: "#2F6F62", background: "rgba(47,111,98,.12)", padding: "1px 6px", borderRadius: "4px" }}>Verified Feed</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink-soft)", marginTop: "2px" }}>
                    {n.time || "Live"} · <span style={{ color: "var(--gold-light)", fontWeight: 600 }}>{n.category}</span>
                  </div>
                </div>
              </div>

              <span className={`impact-tag ${sentimentClass}`} style={{ fontSize: "11.5px", padding: "4px 12px", borderRadius: "14px" }}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  {sentimentClass === "neutral" ? <path d="M8 12h8"/> : isBullish ? <path d="M5 12h14M13 6l6 6-6 6"/> : <path d="M19 12H5M11 18l-6-6 6-6"/>}
                </svg>
                {n.sentiment || (isBullish ? "Bullish Catalyst" : "Macro Neutral")}
              </span>
            </div>

            {/* Headline */}
            <h3 style={{ fontSize: "18px", fontFamily: "var(--serif)", color: "var(--navy)", lineHeight: "1.4", margin: "8px 0 10px 0" }}>
              {n.title}
            </h3>

            {/* Executive Synopsis */}
            <p style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: "1.65", marginBottom: "14px" }}>
              {n.summary || n.title}
            </p>

            {/* Key Metrics Strip if available */}
            {n.key_metrics && (
              <div style={{ background: "rgba(216,188,139,.12)", border: "1px solid rgba(216,188,139,.3)", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", color: "var(--navy)", fontWeight: 600, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📊</span> <span>{n.key_metrics}</span>
              </div>
            )}

            {/* Institutional Impact Matrix (Beneficiaries & Headwinds) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", background: "var(--cream)", padding: "14px 18px", borderRadius: "10px", border: "1px solid var(--line)", marginBottom: "16px", fontSize: "12.5px" }}>
              <div>
                <span style={{ color: "#2F6F62", fontWeight: 700 }}>🟢 Beneficiaries / Tailwinds: </span>
                <span style={{ color: "var(--ink-soft)", fontWeight: 500 }}>{n.beneficiaries || "Direct margin expansion for sector leaders."}</span>
              </div>
              <div>
                <span style={{ color: "#A14545", fontWeight: 700 }}>🔴 Headwinds / Pressure: </span>
                <span style={{ color: "var(--ink-soft)", fontWeight: 500 }}>{n.headwinds || "Short-term input price fluctuations or valuation re-rating."}</span>
              </div>
            </div>

            {/* Footer Action Bar: Relevant Stocks + Pixel-Perfect Impact Meter + Toggle Voice & Domino */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
              {/* Relevant Stock Chips */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" }}>Impacted Stocks:</span>
                {(n.tickers || ["NIFTY50"]).map((t, idx) => (
                  <span
                    key={idx}
                    className="ticker-chip"
                    onClick={() => handleTickerClick(t)}
                    title={`View ${t} technical chart`}
                    style={{ cursor: "pointer", background: "rgba(216,188,139,.2)", color: "var(--navy)", fontWeight: 700, fontSize: "11.5px", padding: "4px 10px", borderRadius: "6px" }}
                  >
                    {t} ↗
                  </span>
                ))}
              </div>

              {/* Actions & Pixel-Perfect Circular Impact Gauge */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                {/* Pixel-Perfect Centered Impact Gauge */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ position: "relative", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="38" height="38" viewBox="0 0 38 38" style={{ transform: "rotate(-90deg)", display: "block" }}>
                      <circle cx="19" cy="19" r="15" fill="none" stroke="#F0E9D8" strokeWidth="4" />
                      <circle
                        cx="19"
                        cy="19"
                        r="15"
                        fill="none"
                        stroke={isBullish ? "#2F6F62" : isBearish ? "#A14545" : "#B8935A"}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="94.2"
                        strokeDashoffset={94.2 - (94.2 * score) / 100}
                        style={{ transition: "stroke-dashoffset 0.6s ease" }}
                      />
                    </svg>
                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: 700, color: "var(--navy)", fontFamily: "var(--mono, monospace)", lineHeight: 1 }}>
                      {score}
                    </span>
                  </div>
                  <div style={{ fontSize: "10px", lineHeight: "1.2", color: "var(--ink-soft)", fontWeight: 600 }}>
                    Impact<br/>Score
                  </div>
                </div>

                {/* Dynamic Toggle Voice Button (Ask Voice AI / Stop Speaking) */}
                <button
                  className="pill-btn ghost"
                  onClick={() => handleToggleVoiceNews(n)}
                  title={isCurrentlySpeaking ? "Click to stop MarketPulse voice explanation" : "Click to hear MarketPulse voice explanation"}
                  style={{
                    fontSize: "11.5px",
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: isCurrentlySpeaking ? "rgba(161,69,69,.12)" : "rgba(216,188,139,.15)",
                    borderColor: isCurrentlySpeaking ? "#A14545" : "var(--gold-light)",
                    color: isCurrentlySpeaking ? "#A14545" : "var(--navy)",
                    fontWeight: 700
                  }}
                >
                  {isCurrentlySpeaking ? (
                    <>
                      <span className="live-pulse" style={{ width: "7px", height: "7px", background: "#A14545" }}></span>
                      <span>⏹️ Stop Speaking</span>
                    </>
                  ) : (
                    <>
                      <span>🎙️ Ask Voice AI</span>
                    </>
                  )}
                </button>

                {/* Domino Trigger Link */}
                <button
                  className="pill-btn ghost"
                  onClick={() => goPage && goPage("domino")}
                  style={{ fontSize: "11.5px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span>Trace Ripple</span>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
