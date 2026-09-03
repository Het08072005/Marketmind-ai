import React, { useState, useEffect, useMemo, useRef } from "react";
import { apiClient } from "../api/client";

const AVAILABLE_STOCKS = [
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd" },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ Ltd" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd" },
  { symbol: "ATGL", name: "Adani Total Gas Ltd" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd" },
  { symbol: "CIPLA", name: "Cipla Ltd" },
  { symbol: "COALINDIA", name: "Coal India Ltd" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories Ltd" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd" },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd" },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd" },
  { symbol: "INFY", name: "Infosys Ltd" },
  { symbol: "ITC", name: "ITC Ltd" },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd" },
  { symbol: "LT", name: "Larsen & Toubro Ltd" },
  { symbol: "M&M", name: "Mahindra & Mahindra Ltd" },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd" },
  { symbol: "NESTLEIND", name: "Nestle India Ltd" },
  { symbol: "NTPC", name: "NTPC Ltd" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp" },
  { symbol: "POWERGRID", name: "Power Grid Corp of India" },
  { symbol: "RELIANCE", name: "Reliance Industries Ltd" },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "SPICEJET", name: "SpiceJet Ltd" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd" },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd" },
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "TECHM", name: "Tech Mahindra Ltd" },
  { symbol: "TITAN", name: "Titan Company Ltd" },
  { symbol: "WIPRO", name: "Wipro Ltd" },
];

function RadialSpinner({ size = 16, color = "#ffffff" }) {
  const opacities = [1.0, 0.88, 0.77, 0.66, 0.55, 0.45, 0.36, 0.28, 0.21, 0.15, 0.1, 0.06];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="sim-radial-spinner"
    >
      {opacities.map((op, i) => (
        <line
          key={i}
          x1="12"
          y1="2.4"
          x2="12"
          y2="6.6"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          transform={`rotate(${i * 30} 12 12)`}
          opacity={op}
        />
      ))}
    </svg>
  );
}

function SimulationSkeleton({ symbol = "Asset" }) {
  return (
    <div className="c12 sim-skeleton-wrapper" style={{ marginTop: "16px" }}>
      {/* 6 Skeleton KPI Cards */}
      <div className="sim-kpis-grid" style={{ marginBottom: "16px" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="sim-kpi-card sim-skeleton-card">
            <div className="sim-skeleton-line" style={{ width: "42%", height: "12px", marginBottom: "10px" }} />
            <div className="sim-skeleton-line" style={{ width: "72%", height: "26px", marginBottom: "8px" }} />
            <div className="sim-skeleton-line" style={{ width: "55%", height: "10px" }} />
          </div>
        ))}
      </div>

      {/* Skeleton AI Executive Summary Banner */}
      <div className="sim-skeleton-box" style={{ padding: "22px 24px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div className="sim-skeleton-line" style={{ width: "90px", height: "14px" }} />
          <div className="sim-skeleton-line" style={{ width: "160px", height: "14px" }} />
        </div>
        <div className="sim-skeleton-line" style={{ width: "96%", height: "14px", marginBottom: "12px" }} />
        <div className="sim-skeleton-line" style={{ width: "91%", height: "14px", marginBottom: "12px" }} />
        <div className="sim-skeleton-line" style={{ width: "88%", height: "14px", marginBottom: "12px" }} />
        <div className="sim-skeleton-line" style={{ width: "94%", height: "14px", marginBottom: "12px" }} />
        <div className="sim-skeleton-line" style={{ width: "82%", height: "14px", marginBottom: "12px" }} />
        <div className="sim-skeleton-line" style={{ width: "75%", height: "14px" }} />
      </div>

      {/* Skeleton Chart & Breakdown Grid */}
      <div className="grid" style={{ marginBottom: "16px" }}>
        <div className="c8 sim-skeleton-box" style={{ height: "360px", padding: "20px" }}>
          <div className="sim-skeleton-line" style={{ width: "180px", height: "16px", marginBottom: "20px" }} />
          <div className="sim-skeleton-line" style={{ width: "100%", height: "260px" }} />
        </div>
        <div className="c4 sim-skeleton-box" style={{ height: "360px", padding: "20px" }}>
          <div className="sim-skeleton-line" style={{ width: "140px", height: "16px", marginBottom: "20px" }} />
          <div className="sim-skeleton-line" style={{ width: "100%", height: "42px", marginBottom: "14px" }} />
          <div className="sim-skeleton-line" style={{ width: "100%", height: "42px", marginBottom: "14px" }} />
          <div className="sim-skeleton-line" style={{ width: "100%", height: "42px", marginBottom: "14px" }} />
          <div className="sim-skeleton-line" style={{ width: "100%", height: "42px" }} />
        </div>
      </div>

      {/* Skeleton Portfolio Doctor */}
      <div className="sim-skeleton-box" style={{ padding: "22px", marginBottom: "16px" }}>
        <div className="sim-skeleton-line" style={{ width: "220px", height: "16px", marginBottom: "16px" }} />
        <div className="grid">
          <div className="c4 sim-skeleton-line" style={{ height: "140px" }} />
          <div className="c8" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="sim-skeleton-line" style={{ height: "24px" }} />
            <div className="sim-skeleton-line" style={{ height: "24px" }} />
            <div className="sim-skeleton-line" style={{ height: "24px" }} />
            <div className="sim-skeleton-line" style={{ height: "24px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  // Navigation Tabs: "simulator" or "sandbox"
  const [activeTab, setActiveTab] = useState("simulator");

  // ==========================================
  // ==========================================
  // 1. PORTFOLIO SIMULATOR STATE WITH PERSISTENCE
  // ==========================================
  const DEFAULT_BASELINE_SIMULATION = {
    company: "Adani Enterprises Ltd",
    symbol: "ADANIENT",
    initial_investment: 100000,
    start_date: "2026-08-03",
    end_date: "2026-09-03",
    start_date_formatted: "03 Aug 2026",
    end_date_formatted: "03 Sep 2026",
    total_days: 31,
    investment_type: "lumpsum",
    buy_price: 3068.0,
    avg_cost: 3068.0,
    current_price: 2906.5,
    shares: 32,
    cash_remaining: 1824.0,
    stock_value: 93008.0,
    portfolio_value: 94832.0,
    profit_loss: -5168.0,
    return_pct: -5.17,
    benchmark: "NIFTY 50",
    benchmark_return: -3.06,
    alpha: -2.11,
    investment_snapshot: {
      buy_price: 3068.0,
      buy_date: "03 Aug 2026",
      current_price: 2906.5,
      shares_purchased: 32,
      cash_remaining: 1824.0,
      position_52w: "Trading ~9.5% below 52-week high (₹3,212.00)",
      high_52w: 3212.0,
      low_52w: 2680.0,
    },
    risk_metrics: {
      max_drawdown: -6.4,
      volatility: 31.2,
      beta: 1.34,
      sharpe_ratio: -2.66,
      best_day: 0.5,
      worst_day: -1.4,
      cagr: -47.2,
    },
    corporate_actions: [
      {
        type: "Capital Structure",
        detail: "No split or rights record dates occurred during 03 Aug – 03 Sep 2026. Core capital structure intact.",
        date: "03 Sep 2026",
      },
      {
        type: "Dividend Schedule",
        detail: "Next quarterly dividend review scheduled in accordance with board meeting calendar for Adani Enterprises Ltd.",
        date: "Upcoming",
      },
    ],
    growth_series: [
      { date: "03 Aug", portfolio_value: 100000, benchmark_value: 100000 },
      { date: "08 Aug", portfolio_value: 98400, benchmark_value: 99170 },
      { date: "15 Aug", portfolio_value: 97800, benchmark_value: 98600 },
      { date: "22 Aug", portfolio_value: 96100, benchmark_value: 98120 },
      { date: "28 Aug", portfolio_value: 96150, benchmark_value: 97280 },
      { date: "03 Sep", portfolio_value: 94832, benchmark_value: 96940 },
    ],
    what_if: {
      bear: { scenario: "Bear Case", pct: -20.0, value: 75865.6, label: "₹75.9K" },
      base: { scenario: "Base Case", pct: 8.0, value: 102418.5, label: "₹102.4K" },
      bull: { scenario: "Bull Case", pct: 25.0, value: 118540.0, label: "₹118.5K" },
    },
    decision_signals: {
      investment_signal: { label: "CAUTION", icon: "🟠", color: "orange" },
      risk_level: { label: "HIGH", icon: "🔴", color: "rose" },
      market_performance: { label: "WEAK", icon: "🔴", color: "rose" },
      vs_benchmark: { label: "UNDERPERFORMING", icon: "🔴", color: "rose" },
      entry_view: { label: "WAIT / WATCH", icon: "🟠", color: "orange" },
      overall_assessment: { label: "CAUTIOUS", icon: "🟠", color: "orange" },
    },
    ai_verdict: [
      "* **Investment Signal — CAUTION:** Current simulation me stock ne **-5.17% return** diya aur NIFTY 50 ko **2.11% underperform** kiya. Fresh investment se pehle further evaluation warranted hai.",
      "* **Risk Level — HIGH:** **31.2% volatility** aur meaningful drawdown indicate karta hai ki short-term price swings comparatively high ho sakte hain.",
      "* **Market Performance — WEAK:** Same period me NIFTY 50 **-3.06%** tha, while ADANIENT **-5.17%** raha—stock broader market se weaker perform hua.",
      "* **Portfolio Exposure — VERY HIGH:** Single-stock simulation me **100% capital ADANIENT** me hai. Isliye company-specific negative event directly poore portfolio ko impact karega.",
      "* **Entry Assessment — WAIT / WATCH:** Current performance aur risk profile ko dekhte hue immediate aggressive entry ke bajay price trend, fundamentals aur upcoming company events monitor karna better signal hai.",
      "* **Overall View — CAUTIOUS:** **Risk: High | Performance: Weak | Benchmark: Underperforming.** Simulator ke basis par concentrated investment attractive nahi dikhta; diversification ya staged allocation comparatively lower-risk approach ho sakti hai."
    ],
    marketmind_intelligence: {
      stock_autopsy: {
        title: "Stock Autopsy Breakdown",
        pnl_drivers: [
          { factor: "Valuation Multiple Adjustment (P/E Re-rating)", impact: "-2.8%", type: "NEGATIVE" },
          { factor: "Systematic Benchmark Macro Correlation", impact: "-1.8%", type: "NEGATIVE" },
          { factor: "Operational Cash Flow Yield Component", impact: "+1.2%", type: "POSITIVE" }
        ],
        verdict: "The price trajectory in ADANIENT reflects an annualized volatility of 31.2% with a systematic beta sensitivity of 1.34."
      },
      red_flag_dna: {
        title: "Red Flag DNA Audit",
        governance_score: "72/100",
        promoter_pledge: "Low (Under 3.5%)",
        debt_coverage: "2.4x EBITDA (Adequate)",
        accounting_risk: "Clean unqualified auditor reports"
      },
      thesis_breaker: {
        title: "Thesis Breaker Stress-Test",
        original_thesis: "Capital growth in ADANIENT through infrastructure leadership, green hydrogen incubation, and airport concession assets.",
        stress_factor: "Macro tightening and liquidity compression impacting valuation multiples.",
        status: "Active Monitoring"
      },
      domino_contagion: {
        title: "Domino Contagion Matrix",
        interconnected_nodes: ["State Bank of India (Banking Credit)", "Larsen & Toubro (Capex Execution)", "NIFTY Index Heavyweights"],
        systemic_spillover_risk: "Low to Moderate"
      }
    },
    disclaimer: "Simulation-based assessment, not investment advice."
  };

  const [simStock, setSimStock] = useState(() => {
    return localStorage.getItem("marketmind_sim_stock") || "ADANIENT";
  });
  const [simAmount, setSimAmount] = useState(() => {
    const s = localStorage.getItem("marketmind_sim_amount");
    return s ? Number(s) : 100000;
  });
  const [simStartDate, setSimStartDate] = useState(() => {
    return localStorage.getItem("marketmind_sim_start_date") || "2026-08-03";
  });
  const [simEndDate, setSimEndDate] = useState(() => {
    return localStorage.getItem("marketmind_sim_end_date") || "2026-09-03";
  });
  const [simType, setSimType] = useState(() => {
    return localStorage.getItem("marketmind_sim_type") || "lumpsum";
  });
  const [simBenchmark, setSimBenchmark] = useState(() => {
    return localStorage.getItem("marketmind_sim_benchmark") || "NIFTY 50";
  });
  const [simLoading, setSimLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const resultsAnchorRef = useRef(null);

  // Loaded from localStorage if available, so user never loses simulation data on reload
  const [simResult, setSimResult] = useState(() => {
    try {
      const saved = localStorage.getItem("marketmind_sim_result");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.portfolio_value) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load saved simulation from localStorage", e);
    }
    return DEFAULT_BASELINE_SIMULATION;
  });

  // Persist simulation state to localStorage so it stays intact across reloads
  useEffect(() => {
    if (simResult && simResult.portfolio_value) {
      try {
        localStorage.setItem("marketmind_sim_result", JSON.stringify(simResult));
        localStorage.setItem("marketmind_sim_stock", simStock);
        localStorage.setItem("marketmind_sim_amount", String(simAmount));
        localStorage.setItem("marketmind_sim_start_date", simStartDate);
        localStorage.setItem("marketmind_sim_end_date", simEndDate);
        localStorage.setItem("marketmind_sim_type", simType);
        localStorage.setItem("marketmind_sim_benchmark", simBenchmark);
      } catch (err) {
        console.warn("localStorage persistence error", err);
      }
    }
  }, [simResult, simStock, simAmount, simStartDate, simEndDate, simType, simBenchmark]);

  const handleSimulate = async (
    customSymbol = null,
    customAmount = null,
    customStartDate = null,
    customEndDate = null,
    customType = null,
    customBenchmark = null
  ) => {
    setSimLoading(true);

    // Smoothly scroll down to results section so user sees the progress and outcome
    setTimeout(() => {
      resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);

    const sym = (customSymbol || simStock).toUpperCase();
    const amt = customAmount !== null ? customAmount : simAmount;
    const sDate = customStartDate || simStartDate;
    const eDate = customEndDate || simEndDate;
    const invType = customType || simType;
    const bench = customBenchmark || simBenchmark;

    try {
      const data = await apiClient.simulatePortfolio({
        symbol: sym,
        investment: amt,
        startDate: sDate,
        endDate: eDate,
        investmentType: invType,
        benchmark: bench,
      });
      if (data && data.portfolio_value) {
        setSimResult(data);
      }
    } catch (err) {
      console.warn("Simulation call error", err);
    } finally {
      setSimLoading(false);
    }
  };

  // ==========================================
  // 2. VIRTUAL SANDBOX & TRADING STATE
  // ==========================================
  const [orderType, setOrderType] = useState("Buy");
  const [sandboxSymbol, setSandboxSymbol] = useState("ATGL");
  const [quantity, setQuantity] = useState("20");
  const [orderExecutionType, setOrderExecutionType] = useState("Market");
  const [orderStatus, setOrderStatus] = useState(null);
  const [tradingLoading, setTradingLoading] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [stockHistory, setStockHistory] = useState(null);

  const fetchPortfolioData = async () => {
    try {
      const data = await apiClient.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.warn("Using local portfolio state", err);
    }
  };

  const fetchStockHistory = async (sym) => {
    try {
      const data = await apiClient.getStockHistory(sym, "1mo");
      setStockHistory(data);
    } catch (err) {
      console.warn("Error fetching historical prices for", sym, err);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 15000);

    // Dynamic Voice Agent Listener for Hands-Free Execution
    const handleVoiceEvent = (e) => {
      const action = e.detail;
      if (!action) return;

      if (
        action.target_page === "portfolio" ||
        action.command === "RUN_PORTFOLIO_SIMULATION" ||
        action.command === "CREATE_PORTFOLIO_SIMULATION"
      ) {
        setActiveTab("simulator");

        if (action.params?.simulation) {
          setSimResult(action.params.simulation);
          if (action.params.simulation.symbol) {
            setSimStock(action.params.simulation.symbol);
          }
          if (action.params.simulation.initial_investment) {
            setSimAmount(action.params.simulation.initial_investment);
          }
        } else if (action.params?.symbol) {
          const sym = action.params.symbol;
          setSimStock(sym);
          handleSimulate(sym, action.params?.amount);
        }

        if (action.params?.view_mode === "sandbox") {
          setActiveTab("sandbox");
        }

        if (action.params?.shares) {
          setQuantity(action.params.shares.toString());
        }

        if (action.params?.trade_result?.message) {
          setOrderStatus({
            success: true,
            message: action.params.trade_result.message,
          });
          setTimeout(() => setOrderStatus(null), 5000);
        }

        fetchPortfolioData();
      }
    };

    // Listen for simulate_stock event triggered from Dashboard
    const handleSimulateStockEvent = (e) => {
      const sym = e.detail?.symbol || window.__SELECTED_STOCK_SYMBOL;
      if (sym) {
        setSimStock(sym);
        setSandboxSymbol(sym);
        localStorage.setItem("marketmind_sim_stock", sym);
        handleSimulate(sym);
      }
    };

    window.addEventListener("marketmind:simulate_stock", handleSimulateStockEvent);

    // Also check if initialTarget exists on mount
    const initialTargetSym = window.__SELECTED_STOCK_SYMBOL;
    if (initialTargetSym) {
      setSimStock(initialTargetSym);
      setSandboxSymbol(initialTargetSym);
      localStorage.setItem("marketmind_sim_stock", initialTargetSym);
      handleSimulate(initialTargetSym);
      window.__SELECTED_STOCK_SYMBOL = null;
    }

    window.addEventListener("marketmind:voice_action", handleVoiceEvent);
    return () => {
      clearInterval(interval);
      window.removeEventListener("marketmind:voice_action", handleVoiceEvent);
      window.removeEventListener("marketmind:simulate_stock", handleSimulateStockEvent);
    };
  }, []);

  const handlePlaceOrder = async () => {
    if (!sandboxSymbol || !quantity || parseInt(quantity) <= 0) return;
    setTradingLoading(true);
    try {
      const res = await apiClient.executeTrade({
        symbol: sandboxSymbol.toUpperCase(),
        shares: parseInt(quantity),
        side: orderType.toUpperCase(),
      });
      setOrderStatus({
        success: true,
        message: res.message || `✓ ${orderType} ${quantity} ${sandboxSymbol} Executed!`,
      });
      await fetchPortfolioData();
      await fetchStockHistory(sandboxSymbol);
    } catch (err) {
      setOrderStatus({ success: false, message: err.message || "Trade execution failed" });
    } finally {
      setTradingLoading(false);
      setTimeout(() => setOrderStatus(null), 4000);
    }
  };

  // ==========================================
  // DYNAMIC CHART SVG GENERATOR (Stock vs Benchmark)
  // ==========================================
  const chartCoordinates = useMemo(() => {
    const series = simResult?.growth_series || [];
    if (series.length < 2) return { stockPts: "", benchPts: "", areaPts: "", points: [] };

    const stockVals = series.map((s) => s.portfolio_value);
    const benchVals = series.map((s) => s.benchmark_value);
    const allVals = [...stockVals, ...benchVals];

    const minVal = Math.min(...allVals) * 0.985;
    const maxVal = Math.max(...allVals) * 1.015;
    const range = Math.max(maxVal - minVal, 100);

    const width = 640;
    const height = 180;
    const padding = 20;

    const sCoords = series.map((item, idx) => {
      const x = Math.round(padding + (idx / (series.length - 1)) * (width - 2 * padding));
      const y = Math.round(height - padding - ((item.portfolio_value - minVal) / range) * (height - 2 * padding));
      return { x, y, val: item.portfolio_value, date: item.date };
    });

    const bCoords = series.map((item, idx) => {
      const x = Math.round(padding + (idx / (series.length - 1)) * (width - 2 * padding));
      const y = Math.round(height - padding - ((item.benchmark_value - minVal) / range) * (height - 2 * padding));
      return { x, y, val: item.benchmark_value, date: item.date };
    });

    const stockPts = sCoords.map((p) => `${p.x},${p.y}`).join(" ");
    const benchPts = bCoords.map((p) => `${p.x},${p.y}`).join(" ");
    const areaPts = `${stockPts} ${sCoords[sCoords.length - 1].x},${height} ${sCoords[0].x},${height}`;

    return { stockPts, benchPts, areaPts, sCoords, bCoords };
  }, [simResult]);

  // Sandbox data helpers
  const nav = portfolio?.nav || 1102459;
  const cash = portfolio?.cash_balance || 324500;
  const pnl = portfolio?.overall_pnl || 102459;
  const pnlPct = portfolio?.overall_pnl_pct || 10.25;
  const rawHoldings = portfolio?.holdings || [];

  return (
    <div className="grid">
      {/* Top Banner with Mode Switcher */}
      <div className="page-banner">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2>Portfolio Simulator</h2>
            <span
              className="tag live"
              style={{
                background: "rgba(184,147,90,.15)",
                color: "var(--gold)",
                border: "1px solid rgba(184,147,90,.3)",
                fontWeight: 700,
              }}
            >
              ● {(simLoading ? simStock : (simResult?.symbol || simStock))} · HISTORICAL BACKTEST &amp; WHAT-IF ENGINE
            </span>
          </div>
          <p>
            Virtually replay past investments with real historical prices, benchmark comparisons, corporate action adjustments, and probabilistic scenario testing.
          </p>
        </div>
      </div>

      {activeTab === "simulator" ? (
        <>
          {/* Controls Panel */}
          <div className="card c12 sim-controls-panel">
            <div className="sim-controls-grid">
              <div className="sim-field">
                <label>Stock / Equity</label>
                <select
                  value={simStock}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSimStock(val);
                    handleSimulate(val, simAmount, simStartDate, simEndDate, simType, simBenchmark);
                  }}
                >
                  {AVAILABLE_STOCKS.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} · {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sim-field">
                <label>Investment (₹)</label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={simAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSimAmount(val);
                    handleSimulate(simStock, val, simStartDate, simEndDate, simType, simBenchmark);
                  }}
                />
              </div>

              <div className="sim-field">
                <label>Start Date</label>
                <input
                  type="date"
                  value={simStartDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSimStartDate(val);
                    handleSimulate(simStock, simAmount, val, simEndDate, simType, simBenchmark);
                  }}
                />
              </div>

              <div className="sim-field">
                <label>End Date</label>
                <input
                  type="date"
                  value={simEndDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSimEndDate(val);
                    handleSimulate(simStock, simAmount, simStartDate, val, simType, simBenchmark);
                  }}
                />
              </div>

              <div className="sim-field">
                <label>Benchmark</label>
                <select
                  value={simBenchmark}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSimBenchmark(val);
                    handleSimulate(simStock, simAmount, simStartDate, simEndDate, simType, val);
                  }}
                >
                  <option value="NIFTY 50">NIFTY 50 Index</option>
                  <option value="NIFTY 500">NIFTY 500 Index</option>
                </select>
              </div>

              <button
                className="sim-btn-primary"
                onClick={() => handleSimulate()}
                disabled={simLoading}
              >
                {simLoading ? (
                  <>
                    <RadialSpinner size={15} color="#ffffff" />
                    <span style={{ marginLeft: "7px" }}>Simulating...</span>
                  </>
                ) : (
                  "Simulate"
                )}
              </button>
            </div>
          </div>

          {/* Scroll Target Anchor for Smooth Scroll */}
          <div ref={resultsAnchorRef} id="sim-results-anchor" style={{ scrollMarginTop: "24px" }} />

          {/* Professional Loading Banner */}
          {simLoading && (
            <div className="sim-loading-banner c12">
              <RadialSpinner size={26} color="var(--gold)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--navy)" }}>
                  Simulating Strategy &amp; Computing Risk Decomposition...
                </div>
                <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "2px" }}>
                  Calculating real-time CAPM attribution, Sharpe efficiency, and peer comparison for {simStock}
                </div>
              </div>
            </div>
          )}

          {/* Simulation Results or Pulsing Skeleton Loading State */}
          {simLoading ? (
            <SimulationSkeleton symbol={simStock} />
          ) : (
            <>
              {/* Top 6 Institutional KPI Cards */}
              <div className="c12 sim-kpis-grid">
            <div className="sim-kpi-card">
              <div className="sim-kpi-title">Invested</div>
              <div className="sim-kpi-value">
                ₹{simResult.initial_investment.toLocaleString("en-IN")}
              </div>
              <div className="sim-kpi-sub">
                {simType === "sip" ? "3 SIP installments" : "Lump sum capital"}
              </div>
            </div>

            <div className="sim-kpi-card">
              <div className="sim-kpi-title">Current Value</div>
              <div className="sim-kpi-value">
                ₹{Math.round(simResult.portfolio_value).toLocaleString("en-IN")}
              </div>
              <div className="sim-kpi-sub">
                {simResult.shares} shares + ₹{Math.round(simResult.cash_remaining).toLocaleString("en-IN")} cash
              </div>
            </div>

            <div className="sim-kpi-card">
              <div className="sim-kpi-title">Total P&amp;L</div>
              <div className={`sim-kpi-value ${simResult.profit_loss >= 0 ? "sim-gain" : "sim-loss"}`}>
                {simResult.profit_loss >= 0
                  ? `+₹${Math.round(simResult.profit_loss).toLocaleString("en-IN")}`
                  : `−₹${Math.round(Math.abs(simResult.profit_loss)).toLocaleString("en-IN")}`}
              </div>
              <div className="sim-kpi-sub">Unrealised mark-to-market</div>
            </div>

            <div className="sim-kpi-card">
              <div className="sim-kpi-title">Return</div>
              <div className={`sim-kpi-value ${simResult.return_pct >= 0 ? "sim-gain" : "sim-loss"}`}>
                {simResult.return_pct >= 0 ? `+${simResult.return_pct}%` : `${simResult.return_pct}%`}
              </div>
              <div className="sim-kpi-sub">Absolute strategy return</div>
            </div>

            <div className="sim-kpi-card">
              <div className="sim-kpi-title">{simResult.benchmark}</div>
              <div className={`sim-kpi-value ${simResult.benchmark_return >= 0 ? "sim-gain" : "sim-loss"}`}>
                {simResult.benchmark_return >= 0 ? `+${simResult.benchmark_return}%` : `${simResult.benchmark_return}%`}
              </div>
              <div className="sim-kpi-sub">Benchmark index return</div>
            </div>

            <div className="sim-kpi-card">
              <div className="sim-kpi-title">Alpha</div>
              <div className={`sim-kpi-value ${simResult.alpha >= 0 ? "sim-gain" : "sim-loss"}`}>
                {simResult.alpha >= 0 ? `+${simResult.alpha}%` : `${simResult.alpha}%`}
              </div>
              <div className="sim-kpi-sub">Excess over NIFTY</div>
            </div>
          </div>

          {/* Decision-Oriented Executive Summary Banner */}
          {simResult.ai_verdict && (
            <div
              className="c12"
              style={{
                background: "linear-gradient(135deg, rgba(184, 147, 90, 0.12) 0%, rgba(16, 27, 51, 0.05) 100%)",
                border: "1px solid rgba(184, 147, 90, 0.35)",
                borderRadius: "14px",
                padding: "16px 22px",
                marginBottom: "4px",
                boxShadow: "0 4px 14px rgba(184, 147, 90, 0.08)",
                boxSizing: "border-box",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 700 }}>
                  Summary
                </span>
              </div>

              {/* 6 Structured Decision Points */}
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {(() => {
                  const raw = simResult.ai_verdict;
                  const points = Array.isArray(raw)
                    ? raw
                    : String(raw)
                        .split("\n")
                        .map((p) => p.trim())
                        .filter(Boolean);

                  return points.map((pt, idx) => {
                    let cleanPt = pt.replace(/^[\*\•\-]\s*/, "");
                    let boldPart = "";
                    let restPart = cleanPt;
                    const match = cleanPt.match(/^\*\*(.*?)\*\*:?\s*(.*)$/);
                    if (match) {
                      boldPart = match[1];
                      restPart = match[2];
                    }

                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          fontSize: "13.5px",
                          color: "var(--navy)",
                          lineHeight: 1.55,
                        }}
                      >
                        <span style={{ color: "var(--gold)", fontSize: "16px", lineHeight: "20px", flexShrink: 0 }}>
                          •
                        </span>
                        <div style={{ flex: 1 }}>
                          {boldPart ? (
                            <>
                              <strong style={{ color: "var(--navy)", fontWeight: 700 }}>{boldPart}: </strong>
                              <span style={{ fontWeight: 450 }}>
                                {restPart.split(/(\*\*.*?\*\*)/).map((chunk, cIdx) => {
                                  if (chunk.startsWith("**") && chunk.endsWith("**")) {
                                    return (
                                      <strong key={cIdx} style={{ color: "var(--navy)", fontWeight: 700 }}>
                                        {chunk.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return chunk;
                                })}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontWeight: 450 }}>
                              {cleanPt.split(/(\*\*.*?\*\*)/).map((chunk, cIdx) => {
                                if (chunk.startsWith("**") && chunk.endsWith("**")) {
                                  return (
                                    <strong key={cIdx} style={{ color: "var(--navy)", fontWeight: 700 }}>
                                      {chunk.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return chunk;
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Decision Signals List (1 Item per Line, Clean Typography, No Background Color Boxes) */}
              {simResult.decision_signals && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                    marginTop: "16px",
                    paddingTop: "14px",
                    borderTop: "1px solid rgba(184, 147, 90, 0.25)",
                  }}
                >
                  {simResult.decision_signals.investment_signal && (
                    <div style={{ fontSize: "14px", color: "var(--navy)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontWeight: 700 }}>Investment Signal:</strong>
                      <span>{simResult.decision_signals.investment_signal.icon} {simResult.decision_signals.investment_signal.label}</span>
                    </div>
                  )}
                  {simResult.decision_signals.risk_level && (
                    <div style={{ fontSize: "14px", color: "var(--navy)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontWeight: 700 }}>Risk Level:</strong>
                      <span>{simResult.decision_signals.risk_level.icon} {simResult.decision_signals.risk_level.label}</span>
                    </div>
                  )}
                  {simResult.decision_signals.market_performance && (
                    <div style={{ fontSize: "14px", color: "var(--navy)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontWeight: 700 }}>Performance:</strong>
                      <span>{simResult.decision_signals.market_performance.icon} {simResult.decision_signals.market_performance.label}</span>
                    </div>
                  )}
                  {simResult.decision_signals.vs_benchmark && (
                    <div style={{ fontSize: "14px", color: "var(--navy)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontWeight: 700 }}>vs {simResult.benchmark}:</strong>
                      <span>{simResult.decision_signals.vs_benchmark.icon} {simResult.decision_signals.vs_benchmark.label}</span>
                    </div>
                  )}
                  {simResult.decision_signals.entry_view && (
                    <div style={{ fontSize: "14px", color: "var(--navy)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontWeight: 700 }}>Entry View:</strong>
                      <span>{simResult.decision_signals.entry_view.icon} {simResult.decision_signals.entry_view.label}</span>
                    </div>
                  )}
                  {simResult.decision_signals.overall_assessment && (
                    <div style={{ fontSize: "14px", color: "var(--navy)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontWeight: 700 }}>Overall Assessment:</strong>
                      <span>{simResult.decision_signals.overall_assessment.icon} {simResult.decision_signals.overall_assessment.label}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="sim-decision-disclaimer">
                Simulation-based decision assessment, not investment advice.
              </div>
            </div>
          )}

          {/* Row 1: Chart (Left) & Investment Snapshot (Right) */}
          <div className="c12 sim-content-grid">
            {/* Growth Chart */}
            <div className="sim-chart-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3>Portfolio Growth vs Benchmark</h3>
                  <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "3px" }}>
                    Normalized equity curve from {simResult.start_date_formatted || simResult.start_date} to {simResult.end_date_formatted || simResult.end_date} ({simResult.total_days || 31} days backtest)
                  </div>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", fontWeight: 600 }}>
                  <span style={{ color: "var(--gold)", display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "12px", height: "3px", background: "var(--gold)", display: "inline-block", borderRadius: "2px" }}></span>
                    {simResult.symbol} Strategy
                  </span>
                  <span style={{ color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "12px", height: "2px", background: "#8392a8", display: "inline-block", borderStyle: "dashed" }}></span>
                    {simResult.benchmark}
                  </span>
                </div>
              </div>

              {/* Real Mathematical SVG Dual-Line Chart */}
              <div style={{ position: "relative", width: "100%", height: "200px" }}>
                <svg viewBox="0 0 640 180" width="100%" height="100%" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="simAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B8935A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#B8935A" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Reference Lines */}
                  <line x1="20" y1="45" x2="620" y2="45" stroke="var(--line)" strokeDasharray="3,3" />
                  <line x1="20" y1="90" x2="620" y2="90" stroke="var(--line)" strokeDasharray="3,3" />
                  <line x1="20" y1="135" x2="620" y2="135" stroke="var(--line)" strokeDasharray="3,3" />

                  {/* Area Fill */}
                  {chartCoordinates.areaPts && (
                    <polygon points={chartCoordinates.areaPts} fill="url(#simAreaGrad)" />
                  )}

                  {/* Benchmark Line (Dashed) */}
                  {chartCoordinates.benchPts && (
                    <polyline
                      points={chartCoordinates.benchPts}
                      fill="none"
                      stroke="#8392a8"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Stock Line (Solid Gold) */}
                  {chartCoordinates.stockPts && (
                    <polyline
                      points={chartCoordinates.stockPts}
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Interactive Points on Stock Curve */}
                  {chartCoordinates.sCoords?.map((p, idx) => (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredPoint === idx || selectedMilestone === idx ? 6 : 3.5}
                        fill={selectedMilestone === idx ? "var(--gold)" : "var(--paper)"}
                        stroke="var(--gold)"
                        strokeWidth="2.5"
                        style={{ cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={() => setSelectedMilestone(selectedMilestone === idx ? null : idx)}
                      />
                    </g>
                  ))}
                </svg>

                {/* Dynamic Tooltip on Hover */}
                {hoveredPoint !== null && chartCoordinates.sCoords[hoveredPoint] && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${(chartCoordinates.sCoords[hoveredPoint].x / 640) * 100}%`,
                      top: `${(chartCoordinates.sCoords[hoveredPoint].y / 180) * 100}%`,
                      transform: "translate(-50%, -125%)",
                      background: "var(--navy)",
                      color: "#fff",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "var(--gold)" }}>
                      {simResult.growth_series[hoveredPoint]?.date}
                    </div>
                    <div>Port: ₹{Math.round(simResult.growth_series[hoveredPoint]?.portfolio_value).toLocaleString("en-IN")}</div>
                    <div style={{ color: "#a0aec0" }}>
                      Bench: ₹{Math.round(simResult.growth_series[hoveredPoint]?.benchmark_value).toLocaleString("en-IN")}
                    </div>
                  </div>
                )}

                {/* X-Axis Date Milestone Labels */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 20px 0",
                    fontSize: "11px",
                    color: "var(--ink-soft)",
                    fontWeight: 600,
                  }}
                >
                  {simResult.growth_series?.map((item, idx) => (
                    <span key={idx}>{item.date}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Investment Snapshot */}
            <div className="sim-side-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3>Investment Snapshot</h3>
                <div className="sim-snapshot-actions">
                  <div className="sim-snapshot-action">
                    <b>Buy Price &amp; Date</b>
                    <p>
                      <strong style={{ fontFamily: "var(--serif)", fontSize: "17px", color: "var(--navy)", fontWeight: 600 }}>
                        ₹{simResult.investment_snapshot?.buy_price?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </strong>
                      {" "}· {simResult.investment_snapshot?.buy_date}
                    </p>
                  </div>
                  <div className="sim-snapshot-action">
                    <b>Current Market Price (LTP)</b>
                    <p>
                      <strong style={{ fontFamily: "var(--serif)", fontSize: "17px", color: "var(--navy)", fontWeight: 600 }}>
                        ₹{simResult.investment_snapshot?.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </strong>
                      {" "}· live market quote snapshot
                    </p>
                  </div>
                  <div className="sim-snapshot-action">
                    <b>Shares Purchased &amp; Cash</b>
                    <p>
                      <strong style={{ fontFamily: "var(--serif)", fontSize: "17px", color: "var(--navy)", fontWeight: 600 }}>
                        {simResult.investment_snapshot?.shares_purchased} whole shares
                      </strong>
                      {" "}· ₹{Math.round(simResult.investment_snapshot?.cash_remaining || 0).toLocaleString("en-IN")} cash remaining
                    </p>
                  </div>
                  <div className="sim-snapshot-action">
                    <b>52-Week Position</b>
                    <p>{simResult.investment_snapshot?.position_52w}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Full-Width Risk & Volatility Profile (All 6 metrics in 1 row across 100% width) */}
          <div className="sim-section-card c12">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 700 }}>
                    Quantitative Stress-Test
                  </span>
                  <span className="tag" style={{ background: "var(--cream)", border: "1px solid var(--line)", fontSize: "10px", padding: "1px 6px" }}>
                    Verified Math Engine
                  </span>
                </div>
                <h3>Historical Risk &amp; Performance Analytics</h3>
                <div style={{ fontSize: "13px", color: "var(--ink-soft)", marginTop: "4px" }}>
                  Core volatility, downside risk, and benchmark correlation metrics computed over the exact simulated timeframe.
                </div>
              </div>
            </div>

            <div className="sim-analytics-grid">
              <div className="sim-metric-box">
                <div className="m-label">Max Drawdown</div>
                <div className="m-value sim-loss">
                  {simResult.risk_metrics?.max_drawdown}%
                </div>
              </div>
              <div className="sim-metric-box">
                <div className="m-label">30-Day Volatility</div>
                <div className="m-value">
                  {simResult.risk_metrics?.volatility}%
                </div>
              </div>
              <div className="sim-metric-box">
                <div className="m-label">Beta vs {simResult.benchmark}</div>
                <div className="m-value">
                  {simResult.risk_metrics?.beta}
                </div>
              </div>
              <div className="sim-metric-box">
                <div className="m-label">Sharpe Ratio</div>
                <div className="m-value">
                  {simResult.risk_metrics?.sharpe_ratio}
                </div>
              </div>
              <div className="sim-metric-box">
                <div className="m-label">Best Trading Day</div>
                <div className="m-value sim-gain">
                  +{simResult.risk_metrics?.best_day}%
                </div>
              </div>
              <div className="sim-metric-box">
                <div className="m-label">Worst Trading Day</div>
                <div className="m-value sim-loss">
                  {simResult.risk_metrics?.worst_day}%
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: What If? Forward Scenarios (Left 50%) & Corporate Actions (Right 50%) */}
          <div className="c12 sim-two-col-grid">
            {/* What If? Forward Scenarios */}
            <div className="sim-side-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <h3>What If? Scenario Sensitivity</h3>
                  <span className="tag" style={{ fontSize: "10px" }}>Hypothetical Projection</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginBottom: "14px" }}>
                  Forward valuation scenarios based on annualized historical volatility and tail-risk bounds.
                </div>
                <div className="sim-whatif-grid">
                  <div className="sim-scenario-box">
                    <strong>{simResult.what_if?.bear?.scenario}</strong>
                    <span className="sim-loss">{simResult.what_if?.bear?.label}</span>
                    <div style={{ fontSize: "11px", color: "var(--rose)", marginTop: "4px" }}>
                      {simResult.what_if?.bear?.pct}%
                    </div>
                  </div>
                  <div className="sim-scenario-box">
                    <strong>{simResult.what_if?.base?.scenario}</strong>
                    <span>{simResult.what_if?.base?.label}</span>
                    <div style={{ fontSize: "11px", color: "var(--ink-soft)", marginTop: "4px" }}>
                      +{simResult.what_if?.base?.pct}%
                    </div>
                  </div>
                  <div className="sim-scenario-box">
                    <strong>{simResult.what_if?.bull?.scenario}</strong>
                    <span className="sim-gain">{simResult.what_if?.bull?.label}</span>
                    <div style={{ fontSize: "11px", color: "var(--teal)", marginTop: "4px" }}>
                      +{simResult.what_if?.bull?.pct}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="sim-footer-note">
                What-if values are hypothetical risk scenarios, not investment predictions or guaranteed returns.
              </div>
            </div>

            {/* Corporate Actions & Adjustments */}
            <div className="sim-side-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <h3>Corporate Actions &amp; Capital Events</h3>
                  <span className="tag" style={{ fontSize: "10px" }}>Verified Disclosures</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginBottom: "14px" }}>
                  Dividends, stock splits, bonuses, and rights adjustments within or adjacent to the backtest window.
                </div>
                <div className="sim-snapshot-actions">
                  {simResult.corporate_actions?.map((ca, idx) => (
                    <div key={idx} className="sim-snapshot-action">
                      <b style={{ color: "var(--gold)", fontFamily: "var(--serif)", fontSize: "16px", fontWeight: 600 }}>{ca.type}</b>
                      <p>{ca.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* KILLER FEATURE 1: WHY DID MY PORTFOLIO MOVE? (CAUSAL EVENT TIMELINE)      */}
          {/* ========================================================================= */}
          <div className="sim-section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 700 }}>
                    Causal Event Attribution
                  </span>
                  <span className="tag" style={{ background: "var(--cream)", border: "1px solid var(--line)", fontSize: "10px", padding: "1px 6px" }}>
                    CAPM Risk Decomposition
                  </span>
                </div>
                <h3>Why Did My Portfolio Move?</h3>
                <div style={{ fontSize: "13px", color: "var(--ink-soft)", marginTop: "4px" }}>
                  Chronological event timeline decomposing price action into <b>Stock-Specific Idiosyncratic Factors</b> vs <b>Broader Market ({simResult.benchmark}) Drift</b>. Click any milestone or chart point for deep explanation.
                </div>
              </div>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", fontSize: "12px", fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "12px", height: "8px", background: "var(--gold)", borderRadius: "2px", display: "inline-block" }}></span>
                  Stock-Specific Idiosyncratic
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "12px", height: "8px", background: "var(--navy)", borderRadius: "2px", display: "inline-block" }}></span>
                  Broader Market Systematic
                </span>
              </div>
            </div>

            {/* Focused Active Milestone Callout (if clicked) */}
            {selectedMilestone !== null && simResult.why_it_moved?.[selectedMilestone] && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(184, 147, 90, 0.15) 0%, rgba(16, 27, 51, 0.06) 100%)",
                  border: "1px solid var(--gold)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: "0 4px 16px rgba(184, 147, 90, 0.15)",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold)", fontWeight: 700 }}>
                    Selected Milestone · {simResult.why_it_moved[selectedMilestone].date}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy)", marginTop: "2px" }}>
                    {simResult.why_it_moved[selectedMilestone].headline}
                  </div>
                  <div style={{ fontSize: "13.5px", color: "var(--ink)", marginTop: "4px", lineHeight: 1.5 }}>
                    💡 <b>AI Deep Explanation:</b> {simResult.why_it_moved[selectedMilestone].why_text}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--paper)",
                    color: "var(--ink-soft)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  ✕ Close Focus
                </button>
              </div>
            )}

            {/* Chronological Milestone Nodes */}
            <div className="sim-why-timeline">
              {simResult.why_it_moved?.map((ev, idx) => (
                <div
                  key={idx}
                  className={`sim-event-node ${selectedMilestone === idx ? "active" : ""}`}
                  onClick={() => setSelectedMilestone(selectedMilestone === idx ? null : idx)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink-soft)" }}>
                      {ev.date_short}
                    </span>
                    <span
                      className={`tag ${ev.impact === "POSITIVE" ? "live" : (ev.impact === "NEGATIVE" ? "warn" : "")}`}
                      style={{ fontSize: "10px", padding: "1px 7px" }}
                    >
                      {ev.change_pct !== 0 ? `${ev.change_pct > 0 ? "+" : ""}${ev.change_pct}%` : "Initiation"}
                    </span>
                  </div>

                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)", marginBottom: "4px" }}>
                    {ev.label}
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--ink)", lineHeight: 1.45, minHeight: "36px" }}>
                    {ev.headline}
                  </div>

                  {/* Dual Risk Decomposition Progress Bar */}
                  <div className="sim-decomp-bar-wrapper">
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "var(--ink-soft)", marginBottom: "3px" }}>
                      <span>Stock: <b>{ev.decomposition?.stock_specific_pct}%</b></span>
                      <span>Market: <b>{ev.decomposition?.market_systematic_pct}%</b></span>
                    </div>
                    <div className="sim-decomp-bar">
                      <div
                        className="sim-decomp-stock"
                        style={{ width: `${ev.decomposition?.stock_specific_pct}%` }}
                        title={`Stock-Specific Risk: ${ev.decomposition?.stock_specific_pct}%`}
                      />
                      <div
                        className="sim-decomp-mkt"
                        style={{ width: `${ev.decomposition?.market_systematic_pct}%` }}
                        title={`Market Systematic Correlation: ${ev.decomposition?.market_systematic_pct}%`}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: "11px", color: "var(--ink-soft)", marginTop: "8px", borderTop: "1px solid var(--line)", paddingTop: "8px", fontStyle: "italic" }}>
                    "{ev.why_text}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* KILLER FEATURE 2: WHAT IF I CHOSE ANOTHER STOCK? (OPPORTUNITY COST)      */}
          {/* ========================================================================= */}
          <div className="sim-section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 700 }}>
                    Counterfactual Opportunity Engine
                  </span>
                  <span className="tag" style={{ background: "var(--cream)", border: "1px solid var(--line)", fontSize: "10px", padding: "1px 6px" }}>
                    Opportunity Cost Analysis
                  </span>
                </div>
                <h3>What If I Chose Another Stock?</h3>
                <div style={{ fontSize: "13px", color: "var(--ink-soft)", marginTop: "4px" }}>
                  Simultaneous simulation of peer large-caps and the benchmark with the exact same ₹{simAmount.toLocaleString("en-IN")} capital across {simResult.start_date_formatted || simResult.start_date} – {simResult.end_date_formatted || simResult.end_date}.
                </div>
              </div>
            </div>

            {/* AI Opportunity Cost Verdict Banner */}
            {simResult.peer_alternatives?.verdict && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(184, 147, 90, 0.12) 0%, rgba(16, 27, 51, 0.05) 100%)",
                  border: "1px solid rgba(184, 147, 90, 0.35)",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  marginTop: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <span style={{ fontSize: "22px" }}>⚖️</span>
                <div style={{ fontSize: "13.5px", color: "var(--navy)", fontWeight: 600, lineHeight: 1.5 }}>
                  <b>AI Opportunity Cost Verdict:</b> {simResult.peer_alternatives.verdict}
                </div>
              </div>
            )}

            {/* Peer Comparison Matrix Cards */}
            <div className="sim-peer-matrix">
              {simResult.peer_alternatives?.comparisons?.map((peer, idx) => (
                <div key={idx} className="sim-peer-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--navy)" }}>
                        {peer.symbol}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--ink-soft)", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                        {peer.name}
                      </div>
                    </div>
                    <span className={`tag ${peer.return_pct >= 0 ? "live" : "warn"}`} style={{ fontSize: "11px" }}>
                      {peer.return_pct >= 0 ? `+${peer.return_pct}%` : `${peer.return_pct}%`}
                    </span>
                  </div>

                  <div style={{ margin: "12px 0 8px" }}>
                    <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-soft)" }}>
                      Final Portfolio Value
                    </div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: "24px", fontWeight: 600, color: "var(--navy)", marginTop: "2px" }}>
                      ₹{Math.round(peer.portfolio_value).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: peer.status === "BETTER" ? "var(--teal)" : "var(--rose)",
                      background: peer.status === "BETTER" ? "rgba(85, 214, 190, 0.12)" : "rgba(217, 83, 79, 0.12)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      display: "inline-block",
                      marginBottom: "10px",
                    }}
                  >
                    {peer.difference_text}
                  </div>

                  {peer.symbol !== "NIFTY 50" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSimStock(peer.symbol);
                        handleSimulate(peer.symbol, simAmount, simStartDate, simEndDate, simType, simBenchmark);
                      }}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        border: "1px solid var(--line)",
                        background: "var(--paper)",
                        color: "var(--ink)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      ⚡ Switch to {peer.symbol}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* KILLER FEATURE 3: AI PORTFOLIO DOCTOR & HEALTH DIAGNOSTIC                */}
          {/* ========================================================================= */}
          <div className="sim-section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 700 }}>
                    Holistic Portfolio Diagnostics
                  </span>
                  <span className="tag" style={{ background: "var(--cream)", border: "1px solid var(--line)", fontSize: "10px", padding: "1px 6px" }}>
                    AI Portfolio Doctor
                  </span>
                </div>
                <h3>AI Portfolio Doctor &amp; Strategy Audit</h3>
                <div style={{ fontSize: "13px", color: "var(--ink-soft)", marginTop: "4px" }}>
                  Stress-testing strategy health across Concentration, Volatility, Drawdown resilience, Beta, and Sharpe efficiency.
                </div>
              </div>
            </div>

            <div className="sim-doctor-grid">
              {/* Left Column: Health Score Gauge */}
              <div className="sim-health-gauge">
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-soft)", fontWeight: 700 }}>
                  Portfolio Health Score
                </div>
                <div className="sim-health-score-number">
                  {simResult.portfolio_doctor?.health_score || 55}
                  <span style={{ fontSize: "20px", color: "var(--ink-soft)", fontWeight: 400 }}>/100</span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: (simResult.portfolio_doctor?.health_score || 55) >= 70 ? "var(--teal)" : "var(--rose)",
                    background: (simResult.portfolio_doctor?.health_score || 55) >= 70 ? "rgba(85, 214, 190, 0.15)" : "rgba(217, 83, 79, 0.12)",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    display: "inline-block",
                  }}
                >
                  {simResult.portfolio_doctor?.rating || "Moderate Risk — Rebalancing Recommended"}
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--ink-soft)", marginTop: "12px", lineHeight: 1.45 }}>
                  Algorithmically derived from single-holding concentration (HHI), annualized volatility, maximum drawdown, and Sharpe efficiency.
                </div>
              </div>

              {/* Right Column: 5 Health Pillars */}
              <div className="sim-pillars-list">
                {simResult.portfolio_doctor?.pillars?.map((p, idx) => (
                  <div key={idx} className="sim-pillar-item">
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 600 }}>
                      <span style={{ color: "var(--navy)" }}>{p.name}</span>
                      <span style={{ color: p.level === "HIGH" ? "var(--rose)" : (p.level === "MODERATE" ? "var(--gold)" : "var(--teal)") }}>
                        {p.score}/100 · {p.status}
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${p.score}%`,
                          background: p.level === "HIGH" ? "var(--rose)" : (p.level === "MODERATE" ? "var(--gold)" : "var(--teal)"),
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--ink-soft)", marginTop: "1px" }}>
                      {p.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Question Callout: WHAT IS HURTING MY PORTFOLIO THE MOST? */}
            {simResult.portfolio_doctor?.primary_culprit && (
              <div className="sim-culprit-card">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "20px" }}>🚨</span>
                  <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--rose)", fontWeight: 800 }}>
                    Direct Answer: {simResult.portfolio_doctor.primary_culprit.question}
                  </div>
                </div>
                <div style={{ fontSize: "14px", color: "var(--navy)", lineHeight: 1.55, fontWeight: 500 }}>
                  {simResult.portfolio_doctor.primary_culprit.verdict}
                </div>
                {simResult.portfolio_doctor.rebalancing_suggestions && (
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                    {simResult.portfolio_doctor.rebalancing_suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--paper)",
                          border: "1px solid var(--line)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontWeight: 800, color: sug.action === "Trim" ? "var(--rose)" : "var(--teal)" }}>
                          {sug.action.toUpperCase()}:
                        </span>
                        <span style={{ color: "var(--navy)", fontWeight: 600 }}>{sug.asset}</span>
                        <span style={{ color: "var(--ink-soft)" }}>({sug.current_wt} → {sug.target_wt})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* KILLER FEATURE 4: MARKETMIND CORE INTELLIGENCE MODULE INTEGRATION        */}
          {/* ========================================================================= */}
          <div className="sim-section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 700 }}>
                    Integrated MarketMind Intelligence Ecosystem
                  </span>
                  <span className="tag" style={{ background: "var(--cream)", border: "1px solid var(--line)", fontSize: "10px", padding: "1px 6px" }}>
                    Core Signals
                  </span>
                </div>
                <h3>Deep Intelligence Layer</h3>
                <div style={{ fontSize: "13px", color: "var(--ink-soft)", marginTop: "4px" }}>
                  Seamless cross-module telemetry from Stock Autopsy, Red Flag DNA, Thesis Breaker, and Domino Contagion.
                </div>
              </div>
            </div>

            <div className="sim-intel-grid">
              {/* Module 1: Stock Autopsy */}
              <div className="sim-intel-card">
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold)", fontWeight: 700, marginBottom: "4px" }}>
                  🔬 Stock Autopsy
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)", marginBottom: "8px" }}>
                  {simResult.marketmind_intelligence?.stock_autopsy?.title || "P&L Decomposition"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {simResult.marketmind_intelligence?.stock_autopsy?.pnl_drivers?.map((d, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
                      <span style={{ color: "var(--ink-soft)" }}>{d.factor}</span>
                      <b style={{ color: d.type === "POSITIVE" ? "var(--teal)" : "var(--rose)" }}>{d.impact}</b>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "11px", color: "var(--ink-soft)", marginTop: "10px", borderTop: "1px solid var(--line)", paddingTop: "8px", fontStyle: "italic" }}>
                  {simResult.marketmind_intelligence?.stock_autopsy?.verdict}
                </div>
              </div>

              {/* Module 2: Red Flag DNA */}
              <div className="sim-intel-card">
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold)", fontWeight: 700, marginBottom: "4px" }}>
                  🚩 Red Flag DNA Audit
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)", marginBottom: "8px" }}>
                  Governance &amp; Credit Check
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ink-soft)" }}>Governance Quality:</span>
                    <b style={{ color: "var(--teal)" }}>{simResult.marketmind_intelligence?.red_flag_dna?.governance_score}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ink-soft)" }}>Promoter Pledge:</span>
                    <b>{simResult.marketmind_intelligence?.red_flag_dna?.promoter_pledge}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ink-soft)" }}>Debt Coverage:</span>
                    <b>{simResult.marketmind_intelligence?.red_flag_dna?.debt_coverage}</b>
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: "var(--ink-soft)", marginTop: "10px", borderTop: "1px solid var(--line)", paddingTop: "8px" }}>
                  {simResult.marketmind_intelligence?.red_flag_dna?.accounting_risk}
                </div>
              </div>

              {/* Module 3: Thesis Breaker */}
              <div className="sim-intel-card">
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold)", fontWeight: 700, marginBottom: "4px" }}>
                  ⚡ Thesis Breaker
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)", marginBottom: "6px" }}>
                  Original Bull Thesis
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--ink)", lineHeight: 1.4 }}>
                  "{simResult.marketmind_intelligence?.thesis_breaker?.original_thesis || `Capital growth in ${simResult.symbol} through sector leadership, capacity expansion, and institutional earnings compounding.`}"
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--rose)", marginTop: "8px", borderTop: "1px solid var(--line)", paddingTop: "8px" }}>
                  <b>Stress Point:</b> {simResult.marketmind_intelligence?.thesis_breaker?.stress_factor}
                </div>
              </div>

              {/* Module 4: Domino Contagion */}
              <div className="sim-intel-card">
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold)", fontWeight: 700, marginBottom: "4px" }}>
                  🔗 Domino Contagion
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)", marginBottom: "6px" }}>
                  Spillover Exposure
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--ink-soft)", lineHeight: 1.4 }}>
                  Interconnected market nodes:
                </div>
                <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "11px", color: "var(--navy)" }}>
                  {simResult.marketmind_intelligence?.domino_contagion?.interconnected_nodes?.map((node, idx) => (
                    <li key={idx} style={{ marginBottom: "2px" }}>{node}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  ) : (
        /* Sandbox Paper Trading Mode */
        <>
          {/* Main Portfolio NAV Performance Card */}
          <div className="card c8">
            <div className="card-head">
              <div className="card-eyebrow">
                <div>
                  <span>Virtual Paper Trading Portfolio</span>
                  <h3>Combined Virtual NAV Performance</h3>
                </div>
              </div>
              <span className={`tag ${pnl >= 0 ? "live" : "warn"}`}>
                {pnlPct >= 0 ? `+${pnlPct}%` : `${pnlPct}%`} all-time
              </span>
            </div>

            <div className="metric-strip">
              <div className="metric">
                <div className="v">₹{nav.toLocaleString("en-IN")}</div>
                <div className="l">Net Asset Value</div>
              </div>
              <div className="metric">
                <div className="v" style={{ color: pnl >= 0 ? "var(--teal)" : "var(--rose)" }}>
                  {pnl >= 0 ? `+₹${pnl.toLocaleString("en-IN")}` : `−₹${Math.abs(pnl).toLocaleString("en-IN")}`}
                </div>
                <div className="l">Overall P&amp;L ({pnlPct >= 0 ? `+${pnlPct}%` : `${pnlPct}%`})</div>
              </div>
              <div className="metric">
                <div className="v">₹{cash.toLocaleString("en-IN")}</div>
                <div className="l">Buying Power (Cash)</div>
              </div>
              <div className="metric">
                <div className="v">{rawHoldings.length}</div>
                <div className="l">Open Positions</div>
              </div>
            </div>
          </div>

          {/* Live Order Ticket */}
          <div className="card c4">
            <div className="card-head">
              <div className="card-eyebrow">
                <div>
                  <span>Execution Desk</span>
                  <h3 style={{ fontSize: "18px" }}>Live Order Ticket</h3>
                </div>
              </div>
            </div>
            <div className="toggle-pair">
              <button
                type="button"
                className={`buy ${orderType === "Buy" ? "active" : ""}`}
                onClick={() => setOrderType("Buy")}
              >
                Buy
              </button>
              <button
                type="button"
                className={`sell ${orderType === "Sell" ? "active" : ""}`}
                onClick={() => setOrderType("Sell")}
              >
                Sell
              </button>
            </div>
            <div className="field">
              <label>Symbol (Stock Ticker)</label>
              <input
                type="text"
                value={sandboxSymbol}
                onChange={(e) => setSandboxSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. ATGL, RELIANCE, TCS"
              />
            </div>
            <div className="field">
              <label>Quantity (Shares)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Order Type</label>
              <select
                value={orderExecutionType}
                onChange={(e) => setOrderExecutionType(e.target.value)}
              >
                <option>Market (Instant Execution)</option>
                <option>Limit</option>
                <option>Stop-Loss</option>
              </select>
            </div>
            <button
              className="btn-block"
              type="button"
              onClick={handlePlaceOrder}
              disabled={tradingLoading}
            >
              {tradingLoading
                ? "Executing Trade..."
                : orderStatus
                ? orderStatus.success
                  ? "✓ Trade Executed"
                  : "✗ Error"
                : `Place Simulated ${orderType} Order`}
            </button>
            {orderStatus && (
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  color: orderStatus.success ? "var(--teal)" : "var(--rose)",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {orderStatus.message}
              </div>
            )}
          </div>

          {/* Live Portfolio Holdings Table */}
          <div className="section-title">
            <h2>Live Portfolio Holdings</h2>
            <div className="rule"></div>
          </div>
          <div className="card c12">
            <div className="table-scroll">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Qty</th>
                    <th>Avg. Price</th>
                    <th>Live LTP</th>
                    <th>P&amp;L (₹)</th>
                    <th>P&amp;L (%)</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {rawHoldings.map((h) => {
                    const isProfit = (h.pnl || 0) >= 0;
                    return (
                      <tr key={h.symbol}>
                        <td>
                          <strong>{h.symbol}</strong>
                          <div style={{ fontSize: "11px", color: "var(--ink-soft)" }}>{h.name}</div>
                        </td>
                        <td>{h.shares}</td>
                        <td>₹{h.avg_price?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td>₹{h.ltp?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td style={{ color: isProfit ? "var(--teal)" : "var(--rose)", fontWeight: 700 }}>
                          {isProfit ? `+₹${Math.round(h.pnl).toLocaleString("en-IN")}` : `−₹${Math.round(Math.abs(h.pnl)).toLocaleString("en-IN")}`}
                        </td>
                        <td style={{ color: isProfit ? "var(--teal)" : "var(--rose)", fontWeight: 700 }}>
                          {isProfit ? `+${h.pnl_pct}%` : `${h.pnl_pct}%`}
                        </td>
                        <td>{h.weight || "10%"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
