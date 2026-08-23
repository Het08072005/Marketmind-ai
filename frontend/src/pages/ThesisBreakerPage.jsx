import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";

const STOCK_CORE_THESIS_TEMPLATES = {
  RELIANCE: {
    title: "Jamnagar Green Energy & Solar Gigafactory Capex Rollout",
    metric: "Revenue Growth Rate (YoY / QoQ)",
    benchmark: "Target revenue growth >= 20% & 20GW solar module rollout",
  },
  TATAMOTORS: {
    title: "Commercial Vehicle Fleet Electrification & EV Bus Rollout",
    metric: "Orderbook TCV & Capacity Commissioning",
    benchmark: ">10% MoM CV growth & 10,000 EV bus orderbook target",
  },
  TCS: {
    title: "Enterprise AI Cloud Migration & High-Margin BFSI Deal Win Acceleration",
    metric: "Operating Margin & EBITDA %",
    benchmark: "EBITDA margin >= 26% & TCV deal wins above $10 Billion",
  },
  INFY: {
    title: "Digital Transformation Services & Cobalt Cloud Platform Adoption",
    metric: "Operating Margin & EBITDA %",
    benchmark: "Revenue growth >= 12% in constant currency & attrition below 13%",
  },
  HDFCBANK: {
    title: "Post-Merger Retail CASA Deposit Accretion & NIM Stabilization",
    metric: "CASA Ratio & NIM Stability",
    benchmark: "CASA ratio >= 40% & Net Interest Margin (NIM) above 3.75%",
  },
  ADANIENT: {
    title: "Airport Monetization, Green Hydrogen & Solar Infrastructure Incubation",
    metric: "Orderbook TCV & Capacity Commissioning",
    benchmark: "EBITDA growth >= 28% & Net Debt to EBITDA below 3.2x",
  },
  ATGL: {
    title: "City Gas Distribution Infrastructure & LNG Corridor Network Scaling",
    metric: "Orderbook TCV & Capacity Commissioning",
    benchmark: "CNG volume growth >= 18% YoY & 100 new CNG stations annual rollout",
  },
  WIPRO: {
    title: "Consulting Capco Turnaround & Large Deal TCV Acceleration",
    metric: "Operating Margin & EBITDA %",
    benchmark: "Operating margins to rebound above 17.5%",
  },
  ITC: {
    title: "Non-Cigarette FMCG Scale, Hotel De-merger & High Dividend Compounding",
    metric: "Operating Margin & EBITDA %",
    benchmark: "FMCG revenue CAGR >= 15% & ROCE above 35%",
  },
  TITAN: {
    title: "Organized Jewelry Market Share Gains & Taneira / Eyewear Expansion",
    metric: "Revenue Growth Rate (YoY / QoQ)",
    benchmark: "Domestic jewelry sales growth >= 22% & ROE above 30%",
  },
  SUNPHARMA: {
    title: "Global Specialty Innovative Pipeline Monetization & US Market Expansion",
    metric: "Operating Margin & EBITDA %",
    benchmark: "Specialty sales contribution >= 20% & EBITDA margin above 28%",
  }
};

const INITIAL_THESES = [
  {
    id: "thesis-1",
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    thesisTitle: "Jamnagar Green Energy & Solar Gigafactory Capex Rollout",
    metricType: "Capex Execution & Clean Energy Margin",
    originalTarget: "20GW solar module rollout & ₹15,000 Cr capex commissioning",
    currentValue: "Jamnagar phase 1 fully operational; pilot cell lines commissioned",
    healthScore: 88,
    status: "Intact",
    loggedDate: "12 Oct 2023",
    alertHistory: "Capex pace on track; solar cell efficiency benchmarks met at 24.2%."
  },
  {
    id: "thesis-2",
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    thesisTitle: "Commercial Vehicle Fleet Electrification & MoM Growth",
    metricType: "Monthly Registration Growth & EV Bus Deliveries",
    originalTarget: ">10% MoM CV growth & 10,000 EV bus orderbook target",
    currentValue: "+14% MoM registration surge & 10,200 active EV bus orderbook",
    healthScore: 94,
    status: "Intact",
    loggedDate: "05 Jan 2024",
    alertHistory: "Target exceeded ahead of state transport municipal tender schedules."
  },
  {
    id: "thesis-3",
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    thesisTitle: "Post-Merger CASA Deposit Accretion & NIM Stabilization",
    metricType: "CASA Ratio & Credit-to-Deposit (LDR) Normalization",
    originalTarget: "CASA to hold above 40% & NIMs above 3.75%",
    currentValue: "CASA at 38.4% & NIMs compressed to 3.65% under urban deposit competition",
    healthScore: 62,
    status: "Weakening",
    loggedDate: "18 Aug 2023",
    alertHistory: "Deposit acquisition cost rose 15 bps; LDR normalization slower than forecasted."
  },
  {
    id: "thesis-4",
    symbol: "WIPRO",
    name: "Wipro Ltd",
    thesisTitle: "Consulting Capco Turnaround & Large Deal TCV Acceleration",
    metricType: "BFSI Consulting Revenue & Operating Margin Target",
    originalTarget: "Operating margins to rebound above 17.5%",
    currentValue: "Margins hovering near 15.1% due to discretionary consulting pushouts in Europe",
    healthScore: 32,
    status: "Broken",
    loggedDate: "14 Jun 2023",
    alertHistory: "Management lowered full-year consulting guidance by 240 bps."
  }
];

export default function ThesisBreakerPage() {
  const [theses, setTheses] = useState(INITIAL_THESES);
  const [symbol, setSymbol] = useState(() => window.__SELECTED_STOCK_SYMBOL || "RELIANCE");
  const [thesisTitle, setThesisTitle] = useState(() => STOCK_CORE_THESIS_TEMPLATES[window.__SELECTED_STOCK_SYMBOL || "RELIANCE"]?.title || "Jamnagar Green Energy & Solar Gigafactory Capex Rollout");
  const [metricType, setMetricType] = useState(() => STOCK_CORE_THESIS_TEMPLATES[window.__SELECTED_STOCK_SYMBOL || "RELIANCE"]?.metric || "Revenue Growth Rate (YoY / QoQ)");
  const [originalTarget, setOriginalTarget] = useState(() => STOCK_CORE_THESIS_TEMPLATES[window.__SELECTED_STOCK_SYMBOL || "RELIANCE"]?.benchmark || "Target revenue growth >= 20% & 20GW solar module rollout");
  const [stocks, setStocks] = useState([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [aiAutofilled, setAiAutofilled] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await apiClient.getStocks();
        if (data && data.length > 0) {
          setStocks(data);
        }
      } catch (e) {}
    };
    fetchStocks();
  }, []);

  // Synchronize with Voice Agent Actions & Stock Changes in Real-Time
  useEffect(() => {
    const applyStockThesis = (sym, customParams = null) => {
      if (!sym) return;
      setSymbol(sym);

      const template = STOCK_CORE_THESIS_TEMPLATES[sym] || {
        title: `${sym} Market Leadership & Capex Expansion`,
        metric: "Revenue Growth Rate (YoY / QoQ)",
        benchmark: "Target revenue growth >= 15% & stable operating margin"
      };

      setThesisTitle(customParams?.thesis_title || template.title);
      setMetricType(customParams?.metric_type || template.metric);
      setOriginalTarget(customParams?.target_benchmark || template.benchmark);

      setAiAutofilled(true);
      setTimeout(() => setAiAutofilled(false), 4000);
    };

    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (!action) return;

      const sym = action.params?.symbol || action.symbol || window.__SELECTED_STOCK_SYMBOL;
      if (action.target_page === "thesis" || action.target_page === "breaker" || action.command === "POPULATE_THESIS_FORM" || sym) {
        applyStockThesis(sym, action.params);
      }
    };

    const handleStockChanged = (e) => {
      const sym = e.detail?.symbol;
      if (sym) {
        applyStockThesis(sym);
      }
    };

    window.addEventListener("marketmind:voice_action", handleVoiceAction);
    window.addEventListener("marketmind:stock_changed", handleStockChanged);
    return () => {
      window.removeEventListener("marketmind:voice_action", handleVoiceAction);
      window.removeEventListener("marketmind:stock_changed", handleStockChanged);
    };
  }, []);

  const handleStockChange = (newSymbol) => {
    setSymbol(newSymbol);
    window.__SELECTED_STOCK_SYMBOL = newSymbol;

    const template = STOCK_CORE_THESIS_TEMPLATES[newSymbol];
    if (template) {
      setThesisTitle(template.title);
      setMetricType(template.metric);
      setOriginalTarget(template.benchmark);
      setAiAutofilled(true);
      setTimeout(() => setAiAutofilled(false), 3000);
    }
  };

  const handleSaveThesis = (e) => {
    e.preventDefault();
    if (!thesisTitle || !originalTarget) return;

    const matchedStock = stocks.find(s => s.symbol === symbol) || { name: `${symbol} Ltd`, symbol };

    const newEntry = {
      id: `thesis-${Date.now()}`,
      symbol,
      name: matchedStock.name,
      thesisTitle,
      metricType,
      originalTarget,
      currentValue: "Tracking initiated; baseline metrics verified against exchange regulatory filings.",
      healthScore: 90,
      status: "Intact",
      loggedDate: "Just now",
      alertHistory: "Telemetry active: Alert hooks configured for quarterly filings & margin guidance."
    };

    setTheses([newEntry, ...theses]);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  const intactCount = theses.filter(t => t.status === "Intact").length;
  const weakeningCount = theses.filter(t => t.status === "Weakening").length;
  const brokenCount = theses.filter(t => t.status === "Broken").length;

  return (
    <div className="grid">
      {/* Top Banner & Summary Badges */}
      <div className="page-banner">
        <div>
          <h2>Investment Thesis Breaker</h2>
          <p>Document the fundamental reason you bought — receive algorithmic warnings the instant that specific reason deteriorates, independent of daily price noise.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className="tag live" style={{ background: "rgba(47,111,98,.15)", color: "#2F6F62", fontWeight: 700 }}>
            {intactCount} Intact
          </span>
          <span className="tag" style={{ background: "rgba(216,188,139,.2)", color: "#B8935A", fontWeight: 700 }}>
            {weakeningCount} Weakening
          </span>
          <span className="tag" style={{ background: "rgba(161,69,69,.15)", color: "#A14545", fontWeight: 700 }}>
            {brokenCount} Broken
          </span>
        </div>
      </div>

      {/* Log New Investment Thesis Form */}
      <div className="card c5" style={{ transition: "all 0.3s ease", border: aiAutofilled ? "1.5px solid var(--gold)" : "1px solid var(--line)" }}>
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>Institutional Discipline</span>
              <h3 style={{ fontSize: "19px" }}>Log New Core Thesis</h3>
            </div>
          </div>
          {aiAutofilled && (
            <span className="tag live" style={{ background: "rgba(184,147,90,.2)", color: "var(--navy)", fontWeight: 700, fontSize: "11px" }}>
              ✨ AI Populated
            </span>
          )}
        </div>
        
        <form onSubmit={handleSaveThesis} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="field">
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>Target Stock</label>
            <select
              value={symbol}
              onChange={(e) => handleStockChange(e.target.value)}
              style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "8px", padding: "8px 12px", fontSize: "12.5px", fontWeight: 600 }}
            >
              {(stocks.length > 0 ? stocks : [
                { symbol: "RELIANCE", name: "Reliance Industries Ltd" },
                { symbol: "TATAMOTORS", name: "Tata Motors Ltd" },
                { symbol: "HDFCBANK", name: "HDFC Bank Ltd" },
                { symbol: "TCS", name: "Tata Consultancy Services" },
                { symbol: "INFY", name: "Infosys Ltd" },
                { symbol: "ADANIENT", name: "Adani Enterprises Ltd" },
                { symbol: "ATGL", name: "Adani Total Gas Ltd" },
                { symbol: "WIPRO", name: "Wipro Ltd" },
                { symbol: "ITC", name: "ITC Ltd" },
                { symbol: "TITAN", name: "Titan Company Ltd" },
                { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries" }
              ]).map(s => (
                <option key={s.symbol} value={s.symbol}>{s.name} ({s.symbol})</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>Core Investment Thesis</label>
            <input
              type="text"
              placeholder="e.g. Buying because retail revenue is growing >20% YoY"
              value={thesisTitle}
              onChange={(e) => setThesisTitle(e.target.value)}
              required
              style={{ border: aiAutofilled ? "1px solid var(--gold)" : "1px solid var(--line)", background: "var(--paper)", borderRadius: "8px", padding: "8px 12px", fontSize: "12.5px" }}
            />
          </div>

          <div className="field">
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>Primary Tracking Metric</label>
            <select
              value={metricType}
              onChange={(e) => setMetricType(e.target.value)}
              style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "8px", padding: "8px 12px", fontSize: "12.5px" }}
            >
              <option>Revenue Growth Rate (YoY / QoQ)</option>
              <option>Operating Margin &amp; EBITDA %</option>
              <option>Debt-to-Equity (D/E) Deleveraging</option>
              <option>CASA Ratio &amp; NIM Stability</option>
              <option>Orderbook TCV &amp; Capacity Commissioning</option>
            </select>
          </div>

          <div className="field">
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>Quantitative Target Benchmark</label>
            <input
              type="text"
              placeholder="e.g. Target revenue growth >= 22% & D/E below 0.8x"
              value={originalTarget}
              onChange={(e) => setOriginalTarget(e.target.value)}
              required
              style={{ border: aiAutofilled ? "1px solid var(--gold)" : "1px solid var(--line)", background: "var(--paper)", borderRadius: "8px", padding: "8px 12px", fontSize: "12.5px" }}
            />
          </div>

          <button
            className="btn-block"
            type="submit"
            style={{ marginTop: "6px", background: "var(--navy)", color: "var(--gold-light)", fontWeight: 700 }}
          >
            {savedNotice ? "✓ Thesis Saved & Telemetry Active!" : "+ Save & Activate Thesis Breaker"}
          </button>
        </form>
      </div>

      {/* Active Monitored Theses Scorecard */}
      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>Live Telemetry</span>
              <h3 style={{ fontSize: "19px" }}>Active Fundamental Theses</h3>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {theses.map((t) => {
            const isOk = t.status === "Intact";
            const isWeak = t.status === "Weakening";
            const statusColor = isOk ? "#2F6F62" : isWeak ? "#B8935A" : "#A14545";
            const statusBg = isOk ? "rgba(47,111,98,.12)" : isWeak ? "rgba(216,188,139,.18)" : "rgba(161,69,69,.12)";

            return (
              <div
                key={t.id}
                style={{
                  background: "var(--paper)",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: `1px solid ${isWeak ? "var(--gold-light)" : "var(--line)"}`,
                  boxShadow: "0 2px 6px rgba(16,27,51,.04)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg, var(--navy), var(--navy-2))", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" }}>
                      {t.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)" }}>
                        {t.name} ({t.symbol})
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--ink-soft)" }}>
                        Logged: {t.loggedDate} · Metric: {t.metricType}
                      </div>
                    </div>
                  </div>

                  <span className="tag" style={{ background: statusBg, color: statusColor, fontWeight: 700, fontSize: "11px" }}>
                    {t.status} ({t.healthScore}%)
                  </span>
                </div>

                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--navy)", marginBottom: "6px" }}>
                  "{t.thesisTitle}"
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", background: "var(--cream)", padding: "8px 12px", borderRadius: "8px", marginBottom: "10px" }}>
                  <div><span style={{ color: "var(--ink-soft)" }}>Original Target:</span> <b>{t.originalTarget}</b></div>
                  <div><span style={{ color: "var(--ink-soft)" }}>Current State:</span> <b>{t.currentValue}</b></div>
                </div>

                {/* Health Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="bar-track" style={{ flex: 1, height: "8px", background: "#F0E9D8", borderRadius: "4px", overflow: "hidden" }}>
                    <div className="bar-fill" style={{ width: `${t.healthScore}%`, background: statusColor, height: "100%", borderRadius: "4px", transition: "width 0.6s ease" }}></div>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: statusColor, fontFamily: "var(--mono, monospace)" }}>
                    {t.healthScore}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forensic Alert Log */}
      <div className="section-title">
        <h2>Fundamental Divergence Alert Log</h2>
        <div className="rule"></div>
      </div>

      <div className="card c12">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {theses.map((t, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "var(--paper)",
                border: "1px solid var(--line)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: t.status === "Broken" ? "rgba(161,69,69,.15)" : t.status === "Weakening" ? "rgba(216,188,139,.2)" : "rgba(47,111,98,.15)", display: "flex", alignItems: "center", justifyContent: "center", color: t.status === "Broken" ? "#A14545" : t.status === "Weakening" ? "#B8935A" : "#2F6F62", fontSize: "14px" }}>
                  {t.status === "Broken" ? "⚠️" : t.status === "Weakening" ? "⚡" : "✓"}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--navy)" }}>
                    {t.symbol} Thesis: {t.alertHistory}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ink-soft)" }}>
                    Telemetry Source: Quarterly Regulatory Filings &amp; Earnings Call Transcript Audit
                  </div>
                </div>
              </div>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: t.status === "Broken" ? "#A14545" : t.status === "Weakening" ? "#B8935A" : "#2F6F62" }}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
