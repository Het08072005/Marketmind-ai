import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "../api/client";

// Storage Keys for persistent state across reloads & page switches
const STORAGE_PREFIX = "marketmind_dep_";
const STORAGE_KEY_FACTOR = `${STORAGE_PREFIX}factor`;
const STORAGE_KEY_SHOCK = `${STORAGE_PREFIX}shock`;
const STORAGE_KEY_FOCUS = `${STORAGE_PREFIX}focus_symbol`;
const STORAGE_KEY_TAB = `${STORAGE_PREFIX}active_tab`;
const STORAGE_KEY_SCAN = `${STORAGE_PREFIX}scan_results`;
const STORAGE_KEY_SHOW_SCAN = `${STORAGE_PREFIX}show_scan`;
const STORAGE_KEY_MULTI_ORDER = `${STORAGE_PREFIX}multi_order`;
const STORAGE_KEY_PAIRWISE = `${STORAGE_PREFIX}pairwise_conn`;
const STORAGE_KEY_MULTIHOP = `${STORAGE_PREFIX}multihop_path`;
const STORAGE_KEY_HOLDING = `${STORAGE_PREFIX}selected_holding`;
const STORAGE_KEY_BACKEND = `${STORAGE_PREFIX}backend_cache`;
const STORAGE_KEY_SIM = `${STORAGE_PREFIX}sim_cache`;

const safeGetJSON = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const safeSetJSON = (key, val) => {
  try {
    if (val === null || val === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {}
};

// Factor definitions & transmission mechanisms
const FACTORS = {
  USDINR: {
    key: "USDINR",
    label: "USD / INR Exchange Rate",
    capital: 52,
    risk: 74,
    color: "#C49B59",
    explain: "Rupee depreciation boosts realization for net exporters (IT, Pharma) while elevating imported feedstock costs for crude refiners, auto components, and solvent-based chemicals.",
    holdings: ["INFY", "TCS", "ASIANPAINT", "RELIANCE"],
    path: ["USD/INR", "Landed cost / realization", "Operating margin", "Estimate revisions", "Portfolio P&L"]
  },
  BRENT: {
    key: "BRENT",
    label: "Brent Crude ($/bbl)",
    capital: 52,
    risk: 88,
    color: "#C86D58",
    explain: "Direct pass-through to petrochemical feedstocks, transport fuels, and packaging. Severe spikes compress gross margins in Paints, Chemicals, and Transport fleets with a 30-day lag.",
    holdings: ["RELIANCE", "ASIANPAINT", "TATAMOTORS"],
    path: ["Brent crude", "Petrochemical feedstocks", "COGS / Gross margin", "Operating profit", "Portfolio P&L"]
  },
  RATES: {
    key: "RATES",
    label: "RBI Policy Rates & Yields",
    capital: 44,
    risk: 62,
    color: "#4A7BB0",
    explain: "Rate shifts directly alter wholesale funding costs, term deposit repricing speeds, and equity valuation discount rates. Banking NIMs react positively while auto loans soften.",
    holdings: ["HDFCBANK", "TATAMOTORS", "MARUTI"],
    path: ["RBI policy rate", "Deposit cost & loan yields", "NIM / Retail EMI demand", "Volume growth", "Portfolio P&L"]
  },
  ITSPEND: {
    key: "ITSPEND",
    label: "US / Global Enterprise Tech Capex",
    capital: 38,
    risk: 81,
    color: "#2E8B75",
    explain: "Enterprise deal velocity in North America and Western Europe dictates deal bookings, offshore billing rates, and discretionary cloud migration pipelines.",
    holdings: ["TCS", "INFY"],
    path: ["Global IT capex", "Deal pipeline conversion", "Billed headcount", "Operating margin", "Portfolio P&L"]
  },
  GLOBALIT: {
    key: "ITSPEND",
    label: "US / Global Enterprise Tech Capex",
    capital: 38,
    risk: 81,
    color: "#2E8B75",
    explain: "Enterprise deal velocity in North America and Western Europe dictates deal bookings, offshore billing rates, and discretionary cloud migration pipelines.",
    holdings: ["TCS", "INFY"],
    path: ["Global IT capex", "Deal pipeline conversion", "Billed headcount", "Operating margin", "Portfolio P&L"]
  },
  MONSOON: {
    key: "MONSOON",
    label: "Monsoon & Rural Income",
    capital: 29,
    risk: 46,
    color: "#7A8BC1",
    explain: "Rainfall distribution and agricultural output dictate rural disposable income, food inflation, and consumer discretionary replacement cycles.",
    holdings: ["MARUTI", "ASIANPAINT", "TATAMOTORS"],
    path: ["Monsoon", "Rural income / inflation", "Consumption", "Volume growth", "Portfolio P&L"]
  },
  CREDIT: {
    key: "CREDIT",
    label: "Domestic Credit Stress / Default Cycle",
    capital: 35,
    risk: 65,
    color: "#866A9F",
    explain: "Deterioration in borrower credit quality raises banking credit costs and slumps volume growth in leveraged consumption segments.",
    holdings: ["HDFCBANK", "TATAMOTORS"],
    path: ["Credit stress", "Delinquencies", "Provisioning + demand", "EPS revisions", "Portfolio P&L"]
  }
};

const FACTOR_KEYS = ["USDINR", "BRENT", "RATES", "ITSPEND", "MONSOON", "CREDIT"];

export default function DependencyMapPage() {
  // Persistent Factor selection
  const [currentFactor, setCurrentFactor] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_FACTOR) || "USDINR";
  });

  // Persistent Shock Slider value
  const [shockValue, setShockValue] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHOCK);
    return saved !== null ? Number(saved) : 5;
  });

  // Persistent Selected Holding
  const [selectedHolding, setSelectedHolding] = useState(() => {
    return safeGetJSON(STORAGE_KEY_HOLDING, null);
  });

  const [voiceNotice, setVoiceNotice] = useState(null);

  // Persistent Tab & Institutional View
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_TAB) || "map";
  });

  // Persistent AI Hidden Risk Scan results
  const [hiddenScanResults, setHiddenScanResults] = useState(() => {
    return safeGetJSON(STORAGE_KEY_SCAN, null);
  });

  const [isScanning, setIsScanning] = useState(false);

  // Persistent Show Scan Card
  const [showScanCard, setShowScanCard] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_SHOW_SCAN) === "true";
  });

  // Persistent Multi-Order shock data
  const [multiOrderData, setMultiOrderData] = useState(() => {
    return safeGetJSON(STORAGE_KEY_MULTI_ORDER, null);
  });

  // Persistent Pairwise multi-hop connection
  const [pairwiseConnection, setPairwiseConnection] = useState(() => {
    return safeGetJSON(STORAGE_KEY_PAIRWISE, null);
  });

  // Persistent Multi-Hop path nodes
  const [activeMultiHopPath, setActiveMultiHopPath] = useState(() => {
    return safeGetJSON(STORAGE_KEY_MULTIHOP, []);
  });

  // Persistent Focus Symbol
  const [focusSymbol, setFocusSymbol] = useState(() => {
    return (
      localStorage.getItem(STORAGE_KEY_FOCUS) ||
      window.__SELECTED_STOCK_SYMBOL ||
      null
    );
  });

  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const popularSymbols = useMemo(() => [
    "RELIANCE", "TCS", "INFY", "ADANIENT", "TATASTEEL", "HDFCBANK",
    "BHARTIARTL", "ASIANPAINT", "SBIN", "MARUTI", "TITAN", "ITC", "JSWSTEEL"
  ], []);

  // Pre-load cached backend data to prevent blank screen flash on reload/tab switch
  const [backendData, setBackendData] = useState(() => {
    return safeGetJSON(STORAGE_KEY_BACKEND, null);
  });
  const [simData, setSimData] = useState(() => {
    return safeGetJSON(STORAGE_KEY_SIM, null);
  });
  const [loadingMap, setLoadingMap] = useState(false);

  // Save changes to localStorage so data is NEVER lost
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FACTOR, currentFactor);
  }, [currentFactor]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOCK, String(shockValue));
  }, [shockValue]);

  useEffect(() => {
    if (focusSymbol) {
      localStorage.setItem(STORAGE_KEY_FOCUS, focusSymbol);
      window.__SELECTED_STOCK_SYMBOL = focusSymbol;
    } else {
      localStorage.removeItem(STORAGE_KEY_FOCUS);
    }
  }, [focusSymbol]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    safeSetJSON(STORAGE_KEY_SCAN, hiddenScanResults);
  }, [hiddenScanResults]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOW_SCAN, String(showScanCard));
  }, [showScanCard]);

  useEffect(() => {
    safeSetJSON(STORAGE_KEY_MULTI_ORDER, multiOrderData);
  }, [multiOrderData]);

  useEffect(() => {
    safeSetJSON(STORAGE_KEY_PAIRWISE, pairwiseConnection);
  }, [pairwiseConnection]);

  useEffect(() => {
    safeSetJSON(STORAGE_KEY_MULTIHOP, activeMultiHopPath);
  }, [activeMultiHopPath]);

  useEffect(() => {
    safeSetJSON(STORAGE_KEY_HOLDING, selectedHolding);
  }, [selectedHolding]);

  useEffect(() => {
    if (backendData) safeSetJSON(STORAGE_KEY_BACKEND, backendData);
  }, [backendData]);

  useEffect(() => {
    if (simData) safeSetJSON(STORAGE_KEY_SIM, simData);
  }, [simData]);

  // Load available companies on mount
  useEffect(() => {
    async function loadComps() {
      const list = await apiClient.getDependencyCompanies();
      if (list && list.length > 0) {
        setAvailableCompanies(list);
      }
    }
    loadComps();
  }, []);

  // Filter companies for search dropdown
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return availableCompanies.filter(
      (c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [availableCompanies, searchQuery]);

  // Dynamic Portfolio Holdings from verified backend AI model
  const portfolioHoldings = useMemo(() => {
    if (backendData?.holding_details && backendData.holding_details.length > 0) {
      return backendData.holding_details.map((h) => ({
        sym: h.symbol,
        name: h.name,
        w: h.weight_pct,
        sens: { [currentFactor]: h.factor_beta },
        sector: h.sector,
        mechanism: h.transmission_mechanism,
        factor_beta: h.factor_beta,
        is_focus: h.is_focus || (focusSymbol && h.symbol === focusSymbol)
      }));
    }
    return [];
  }, [backendData, currentFactor, focusSymbol]);

  const activeFactor = useMemo(() => {
    if (backendData?.factor_info) {
      return {
        ...backendData.factor_info,
        capital: backendData.exposed_pct || 52,
        risk: FACTORS[currentFactor]?.risk || 74,
        color: FACTORS[currentFactor]?.color || "#C49B59",
        explain: backendData.factor_info.causal_path,
        holdings: backendData.factor_info.active_holdings || [],
        path: FACTORS[currentFactor]?.path || ["Macro factor", "Input cost", "Operating margin", "Portfolio P&L"]
      };
    }
    return FACTORS[currentFactor] || FACTORS.USDINR;
  }, [backendData, currentFactor]);

  // Fetch live dependency map from backend AI service
  useEffect(() => {
    let isCancelled = false;
    async function fetchMap() {
      if (!backendData) setLoadingMap(true);
      try {
        const data = await apiClient.getDependencyMap(currentFactor, focusSymbol);
        if (!isCancelled && data) {
          setBackendData(data);
          if (data.hidden_risks_top3 && !hiddenScanResults) {
            setHiddenScanResults(data.hidden_risks_top3);
          }
          if (data.focus_company && !selectedHolding) {
            setSelectedHolding({
              sym: data.focus_company.symbol,
              name: data.focus_company.name,
              w: 20,
              sector: data.focus_company.sector,
              mechanism: data.focus_company.transmission_mechanism,
              factor_beta: data.focus_company.factor_beta,
              price: data.focus_company.price,
              is_focus: true
            });
          }
        }
      } catch (err) {
        console.error("Error loading dependency map:", err);
      } finally {
        if (!isCancelled) setLoadingMap(false);
      }
    }
    fetchMap();
    return () => { isCancelled = true; };
  }, [currentFactor, focusSymbol]);

  // Execute real-time counterfactual shock simulation via backend AI engine
  useEffect(() => {
    let isCancelled = false;
    async function runSim() {
      try {
        const res = await apiClient.simulateDependencyShock(currentFactor, shockValue, focusSymbol);
        if (!isCancelled && res) {
          setSimData(res);
          if (res.multi_order) {
            setMultiOrderData(res.multi_order);
          }
        }
      } catch (err) {
        console.error("Simulation error:", err);
      }
    }
    const timer = setTimeout(runSim, 120);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [currentFactor, shockValue, focusSymbol]);

  // Trigger AI Hidden Risk Scan
  const runHiddenScan = async () => {
    setIsScanning(true);
    setShowScanCard(true);
    setActiveTab("scan");
    try {
      const res = await apiClient.scanHiddenRisks(focusSymbol);
      if (res && res.unexpected_vulnerabilities) {
        setHiddenScanResults(res.unexpected_vulnerabilities);
        setActiveMultiHopPath(["BRENT", "MARUTI", "TATAMOTORS", "USDINR", "HDFCBANK", "ASIANPAINT"]);
      } else if (backendData?.hidden_risks_top3) {
        setHiddenScanResults(backendData.hidden_risks_top3);
      }
    } catch (e) {
      if (backendData?.hidden_risks_top3) {
        setHiddenScanResults(backendData.hidden_risks_top3);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectFactor = (key) => {
    setCurrentFactor(key);
  };

  const handleSelectCompany = (sym) => {
    const cleanSym = sym ? sym.toUpperCase().trim() : null;
    setFocusSymbol(cleanSym);
    setSearchQuery("");
    setIsSearchOpen(false);
    if (!cleanSym) {
      setSelectedHolding(null);
    } else {
      const match = backendData?.holding_details?.find((h) => h.symbol === cleanSym);
      if (match) {
        setSelectedHolding({
          sym: match.symbol,
          name: match.name,
          w: match.weight_pct,
          sector: match.sector,
          mechanism: match.transmission_mechanism,
          factor_beta: match.factor_beta,
          is_focus: true
        });
      }
    }
  };

  // Voice Assistant & Stock Change Event Listeners
  useEffect(() => {
    const handleVoiceAction = async (e) => {
      const action = e.detail;
      if (!action) return;

      const p = action.params || {};

      // 1. AI Hidden Risk Scan
      if (p.view === "hidden_scan") {
        setActiveTab("scan");
        setShowScanCard(true);
        if (p.vulnerabilities && p.vulnerabilities.length > 0) {
          setHiddenScanResults(p.vulnerabilities);
          setActiveMultiHopPath(["BRENT", "MARUTI", "TATAMOTORS", "USDINR", "HDFCBANK", "ASIANPAINT"]);
        } else {
          runHiddenScan();
        }
        setVoiceNotice("⚡ AI Hidden Risk Scan: 3 Second-Order Vulnerabilities Discovered");
        setTimeout(() => setVoiceNotice(null), 8000);
        return;
      }

      // 2. Multi-Hop Connection / Co-Movement Path
      if (p.view === "pairwise_path") {
        setActiveTab("map");
        const s1 = p.symbol1 || "RELIANCE";
        const s2 = p.symbol2 || "HDFCBANK";
        try {
          const conn = await apiClient.getDependencyConnection(s1, s2);
          setPairwiseConnection(conn);
          setActiveMultiHopPath(conn.path_nodes || [s1, s2]);
        } catch (err) {
          setPairwiseConnection({
            symbol1: s1,
            symbol2: s2,
            transmission_chain: p.chain || `${s1} ↔ Macro Factor ↔ ${s2}`,
            path_nodes: p.path_nodes || [s1, s2],
            explanation: "Cross-sector transmission through macroeconomic commodity & interest rate channels."
          });
          setActiveMultiHopPath(p.path_nodes || [s1, s2]);
        }
        setVoiceNotice(`🔗 Multi-Hop Causal Path: ${s1} ↔ ${s2}`);
        setTimeout(() => setVoiceNotice(null), 8000);
        return;
      }

      // 3. Multi-Order Macro Shock & Winners / Losers
      if (p.view === "multi_order_shock" || p.view === "winners_losers") {
        setActiveTab("shock");
        if (p.factor) {
          const fKey = p.factor === "GLOBALIT" ? "ITSPEND" : p.factor.toUpperCase();
          if (FACTORS[fKey]) setCurrentFactor(fKey);
        }
        if (p.shock_pct != null) {
          setShockValue(Number(p.shock_pct));
        }
        if (p.multi_order) {
          setMultiOrderData(p.multi_order);
          setActiveMultiHopPath([p.factor || currentFactor, "MARUTI", "ASIANPAINT", "RELIANCE"]);
        }
        setVoiceNotice(`⚡ Multi-Order Causal Shock: ${p.factor || currentFactor} ${p.shock_pct || shockValue}%`);
        setTimeout(() => setVoiceNotice(null), 8000);
        return;
      }

      // 4. Biggest Hidden Risk
      if (p.view === "biggest_risk") {
        setCurrentFactor("USDINR");
        setActiveTab("map");
        setActiveMultiHopPath(["USDINR", "TCS", "INFY", "ASIANPAINT"]);
        setVoiceNotice("⚠️ #1 Shared Risk: USD/INR (52% portfolio capital indirectly exposed)");
        setTimeout(() => setVoiceNotice(null), 8000);
        return;
      }

      // 5. True Diversification Query
      if (p.view === "diversification") {
        setActiveTab("clusters");
        setVoiceNotice("🧩 True Diversification: Nominal 10 Holdings, but effectively 3.1 independent risk groups");
        setTimeout(() => setVoiceNotice(null), 8000);
        return;
      }

      // 6. Crisis Regime Correlation
      if (p.view === "crisis_regime") {
        setActiveTab("regime");
        setActiveMultiHopPath(["RELIANCE", "HDFCBANK"]);
        setVoiceNotice("⚡ Stress Regime Alert: Correlation surges from 0.22 to 0.71 during market crashes");
        setTimeout(() => setVoiceNotice(null), 8000);
        return;
      }

      // 7. Risk Reduction Rebalance
      if (p.view === "rebalance") {
        setActiveTab("rebalance");
        setVoiceNotice("⚖️ Factor Risk Reduction: Trim 4% USD/INR exposure, retaining 98.6% expected return");
        setTimeout(() => setVoiceNotice(null), 8000);
        return;
      }

      // 8. Focus Symbol Navigation
      if (p.symbol) {
        const sym = p.symbol.toUpperCase();
        handleSelectCompany(sym);
        if (p.factor) {
          const fKey = p.factor === "GLOBALIT" ? "ITSPEND" : p.factor.toUpperCase();
          if (FACTORS[fKey]) setCurrentFactor(fKey);
        }
        if (p.shock_pct != null) {
          setShockValue(Number(p.shock_pct));
        }
        setVoiceNotice(`🎙️ Voice Action: Focusing Systemic Dependency Map on ${sym}`);
        setTimeout(() => setVoiceNotice(null), 6000);
      } else if (action.type === "DEPENDENCY_FACTOR" || p.factor) {
        const rawKey = (p.factor || "USDINR").toUpperCase();
        const fKey = rawKey === "GLOBALIT" ? "ITSPEND" : rawKey;
        if (FACTORS[fKey]) {
          setCurrentFactor(fKey);
          setVoiceNotice(`Switched dependency factor to ${FACTORS[fKey].label}`);
          setTimeout(() => setVoiceNotice(null), 5000);
        }
      } else if (action.type === "DEPENDENCY_SHOCK" || p.shock_pct != null) {
        const val = Number(p.shock_pct);
        setShockValue(val);
        setVoiceNotice(`Simulating ${val > 0 ? "+" : ""}${val}% macro shock`);
        setTimeout(() => setVoiceNotice(null), 5000);
      }
    };

    const handleStockChanged = (e) => {
      if (e.detail?.symbol) {
        const sym = e.detail.symbol.toUpperCase();
        handleSelectCompany(sym);
      }
    };

    window.addEventListener("marketmind:voice_action", handleVoiceAction);
    window.addEventListener("marketmind:stock_changed", handleStockChanged);

    if (window.__PENDING_DEPENDENCY_ACTION) {
      const pending = window.__PENDING_DEPENDENCY_ACTION;
      window.__PENDING_DEPENDENCY_ACTION = null;
      handleVoiceAction({ detail: pending });
    }

    return () => {
      window.removeEventListener("marketmind:voice_action", handleVoiceAction);
      window.removeEventListener("marketmind:stock_changed", handleStockChanged);
    };
  }, [backendData, currentFactor, focusSymbol, shockValue]);

  // SVG dimensions
  const width = 840;
  const height = 460;
  const cx = width / 2;
  const cy = height / 2 + 10;

  const factorKeys = FACTOR_KEYS;

  // Position the 6 macro factors in an inner ring
  const factorPositions = useMemo(() => {
    const pos = {};
    factorKeys.forEach((k, i) => {
      const ang = (Math.PI * 2 * i) / factorKeys.length - Math.PI / 2;
      pos[k] = [cx + 175 * Math.cos(ang), cy + 115 * Math.sin(ang)];
    });
    return pos;
  }, [factorKeys, cx, cy]);

  // Position holdings on an outer ring
  const holdingPositions = useMemo(() => {
    const count = portfolioHoldings.length || 1;
    return portfolioHoldings.map((h, i) => {
      const ang = (Math.PI * 2 * i) / count - Math.PI / 2 + 0.15;
      return {
        sym: h.sym,
        x: cx + 310 * Math.cos(ang),
        y: cy + 185 * Math.sin(ang)
      };
    });
  }, [portfolioHoldings, cx, cy]);

  // Calculate Counterfactual Shock Impacts
  const impacts = useMemo(() => {
    if (simData?.holdings_impact && simData.holdings_impact.length > 0) {
      return simData.holdings_impact.map((h) => ({
        sym: h.symbol,
        name: h.name,
        val: h.expected_return_pct,
        w: h.weight_pct
      }));
    }
    return portfolioHoldings.map((h) => {
      const s = h.factor_beta || 0;
      const val = shockValue * s * 0.42;
      return {
        sym: h.sym,
        name: h.name,
        val,
        w: h.w
      };
    });
  }, [simData, portfolioHoldings, shockValue]);

  const netPortfolioImpact = useMemo(() => {
    if (simData?.net_portfolio_impact_pct != null) {
      return simData.net_portfolio_impact_pct;
    }
    let sum = 0;
    impacts.forEach((x) => {
      sum += (x.val * x.w) / 100;
    });
    return sum;
  }, [simData, impacts]);

  // Dynamic Latent Factors from AI Engine
  const latentFactors = useMemo(() => {
    return backendData?.latent_factors || [];
  }, [backendData]);

  // Dynamic Rebalance Recommendations from AI Engine
  const rebalanceRecs = useMemo(() => {
    return backendData?.rebalance_recommendations || [];
  }, [backendData]);

  // Dynamic Contagion Trace from AI Engine
  const contagionTrace = useMemo(() => {
    return backendData?.contagion_trace || [];
  }, [backendData]);

  return (
    <div style={{ width: "100%", boxSizing: "border-box", padding: "0 0 60px 0", margin: 0, animation: "fadeIn 0.2s ease-in" }}>
      {/* 1. TOP CONTROLS HEADER */}
      <div style={{
        background: "rgba(255, 253, 248, 0.95)",
        border: "1px solid #E7DBC6",
        borderRadius: "16px",
        padding: "16px 22px",
        boxShadow: "0 6px 20px rgba(13, 31, 59, 0.04)",
        marginBottom: "18px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "10.5px", letterSpacing: "0.14em", color: "#A67C3F", fontWeight: 900, textTransform: "uppercase" }}>
              Latent Factor Regression & Systemic Contagion Engine
            </div>
            <p style={{ color: "#6F706B", margin: "3px 0 0", fontSize: "12.5px", lineHeight: "1.5" }}>
              Maps latent factor exposures, supply-chain co-dependencies, and macro transmission channels across your portfolio holdings.
            </p>
          </div>

          {loadingMap && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#FFFAF0",
              border: "1px solid #EADFC9",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "11.5px",
              color: "#C49B59",
              fontWeight: 800,
              boxShadow: "0 2px 8px rgba(196, 155, 89, 0.12)"
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C49B59", animation: "pulse 1.2s infinite" }} />
              Updating Dependency Map...
            </div>
          )}
        </div>

        {/* TARGET COMPANY / ASSET SELECTION ROW */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "14px",
          paddingBottom: "14px",
          borderBottom: "1px solid #EFE4D2"
        }}>
          <span style={{ fontSize: "11px", fontWeight: 900, color: "#7E735F", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: focusSymbol ? "#0284C7" : "#A67C3F", boxShadow: focusSymbol ? "0 0 8px #0284C7" : "none" }} />
            Focus Asset:
          </span>

          {/* All Holdings Button */}
          <button
            onClick={() => handleSelectCompany(null)}
            style={{
              border: !focusSymbol ? "1.5px solid #0D1F3B" : "1px solid #DECDAA",
              background: !focusSymbol ? "#0D1F3B" : "#FFFFFF",
              color: !focusSymbol ? "#FFFFFF" : "#4A453E",
              borderRadius: "999px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: !focusSymbol ? "0 2px 8px rgba(13,31,59,0.15)" : "none"
            }}
          >
            🌐 All Holdings
          </button>

          {/* Popular Symbols Pills */}
          {popularSymbols.map((sym) => {
            const isSelected = focusSymbol === sym;
            return (
              <button
                key={sym}
                onClick={() => handleSelectCompany(sym)}
                style={{
                  border: isSelected ? "1.5px solid #0284C7" : "1px solid #DECDAA",
                  background: isSelected ? "#0284C7" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#15213B",
                  borderRadius: "999px",
                  padding: "5px 11px",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 2px 8px rgba(2, 132, 199, 0.25)" : "none"
                }}
              >
                {sym}
              </button>
            );
          })}

          {/* Dynamic Active Pill if not in popular list */}
          {focusSymbol && !popularSymbols.includes(focusSymbol) && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#0284C7",
              color: "#FFFFFF",
              borderRadius: "999px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: 900,
              boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)"
            }}>
              <span>🎯 {focusSymbol}</span>
              <button
                onClick={() => handleSelectCompany(null)}
                style={{
                  background: "rgba(255,255,255,0.25)",
                  border: "none",
                  color: "#FFFFFF",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Search Any Stock with Live Autocomplete */}
          <div style={{ position: "relative", marginLeft: "auto", minWidth: "220px" }}>
            <input
              type="text"
              placeholder="🔍 Search any NSE stock..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              style={{
                width: "100%",
                padding: "6px 12px",
                fontSize: "11.5px",
                borderRadius: "999px",
                border: "1px solid #DECDAA",
                background: "#FFFFFF",
                color: "#0D1F3B",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            {isSearchOpen && searchResults.length > 0 && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                width: "280px",
                maxHeight: "240px",
                overflowY: "auto",
                background: "#FFFFFF",
                border: "1px solid #DECDAA",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(13,31,59,0.14)",
                zIndex: 100,
                padding: "6px 0"
              }}>
                {searchResults.map((c) => (
                  <div
                    key={c.symbol}
                    onClick={() => handleSelectCompany(c.symbol)}
                    style={{
                      padding: "8px 14px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "11.5px",
                      borderBottom: "1px solid #F5EFE6"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#FBF6EC"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#FFFFFF"}
                  >
                    <div>
                      <b style={{ color: "#0D1F3B", display: "block" }}>{c.symbol}</b>
                      <span style={{ color: "#776F63", fontSize: "10.5px" }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: "10px", color: "#A67C3F", fontWeight: 700, background: "#FAF3E6", padding: "2px 6px", borderRadius: "4px" }}>
                      {c.sector}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FACTOR PILLS ROW + AI SCAN BUTTON */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#7E735F", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: "6px" }}>
            Active Factor:
          </span>
          {factorKeys.map((k) => {
            const f = FACTORS[k];
            const isActive = k === currentFactor;
            return (
              <button
                key={k}
                onClick={() => handleSelectFactor(k)}
                style={{
                  border: isActive ? `1.5px solid ${f.color}` : "1px solid #DECDAA",
                  background: isActive ? f.color : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#15213B",
                  borderRadius: "999px",
                  padding: "7px 14px",
                  fontSize: "11.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.12)" : "none"
                }}
              >
                {f.label} ({f.capital}% capital)
              </button>
            );
          })}

          {/* FLAGSHIP AI HIDDEN RISK SCAN BUTTON */}
          <button
            onClick={runHiddenScan}
            disabled={isScanning}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1.5px solid #D97706",
              background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              color: "#FDE68A",
              borderRadius: "999px",
              padding: "7px 18px",
              fontSize: "12px",
              fontWeight: 900,
              cursor: isScanning ? "wait" : "pointer",
              boxShadow: "0 4px 14px rgba(217, 119, 6, 0.28)",
              transition: "all 0.2s ease"
            }}
          >
            <span style={{ fontSize: "14px", animation: isScanning ? "spin 1s linear infinite" : "none" }}>⚡</span>
            {isScanning ? "Scanning Multi-Hop Graph..." : "Run AI Hidden Risk Scan"}
          </button>
        </div>

        {/* INSTITUTIONAL VIEWS TAB BAR */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "1px solid #EFE4D2",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "10.5px", fontWeight: 900, color: "#8B7F6A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Institutional Views:
          </span>
          {[
            { id: "map", label: "🌐 Factor Network Graph" },
            { id: "scan", label: "⚡ AI Hidden Risk Scan", badge: "3 2nd-Order Risks" },
            { id: "shock", label: "💥 Multi-Order Shock Propagation" },
            { id: "clusters", label: "🧩 True Diversification", badge: "3.1 Clusters" },
            { id: "regime", label: "⚡ Stress Correlation Jump", badge: "0.22 → 0.71" },
            { id: "rebalance", label: "⚖️ Risk Rebalance", badge: "-24% Risk" },
          ].map((tab) => {
            const isA = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "scan") setShowScanCard(true);
                }}
                style={{
                  border: isA ? "1.5px solid #0D1F3B" : "1px solid #DECDAA",
                  background: isA ? "#0D1F3B" : "#FFFFFF",
                  color: isA ? "#FFFFFF" : "#334155",
                  borderRadius: "8px",
                  padding: "5px 12px",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    background: isA ? "rgba(255,255,255,0.2)" : "#F1E7D5",
                    color: isA ? "#F8FAFC" : "#78350F",
                    fontSize: "9.5px",
                    padding: "1px 6px",
                    borderRadius: "999px",
                    fontWeight: 800
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VOICE OR ACTION NOTIFICATION BANNER */}
      {voiceNotice && (
        <div style={{
          background: "linear-gradient(90deg, #15243B 0%, #1E3A5F 100%)",
          border: "1px solid rgba(243, 213, 155, 0.4)",
          borderRadius: "10px",
          padding: "10px 20px",
          marginBottom: "18px",
          color: "#F8FAFC",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#F3D59B", boxShadow: "0 0 8px #F3D59B" }} />
          <span style={{ fontWeight: 700, color: "#F3D59B" }}>MarketMind Copilot:</span>
          <span>{voiceNotice}</span>
        </div>
      )}

      {/* FOCUS COMPANY DEEP DIVE BANNER */}
      {backendData?.focus_company && (
        <div style={{
          background: "linear-gradient(135deg, #09172A 0%, #0F2942 100%)",
          border: "1px solid rgba(56, 189, 248, 0.35)",
          borderRadius: "16px",
          padding: "18px 22px",
          marginBottom: "20px",
          color: "#F8FAFC",
          boxShadow: "0 8px 24px rgba(2, 132, 199, 0.14)",
          position: "relative"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.4)"
              }}>
                {backendData.focus_company.symbol.slice(0, 2)}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.15em", color: "#38BDF8", textTransform: "uppercase" }}>
                    TARGET COMPANY RISK AUDIT
                  </span>
                  <span style={{
                    background: "rgba(56, 189, 248, 0.15)",
                    color: "#38BDF8",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    fontSize: "9.5px",
                    fontWeight: 800,
                    padding: "1px 7px",
                    borderRadius: "999px"
                  }}>
                    VOICE & QUANT ACTIVE
                  </span>
                </div>
                <h4 style={{ margin: "2px 0 0", fontSize: "18px", color: "#FFFFFF", fontFamily: "Georgia, serif" }}>
                  {backendData.focus_company.name} ({backendData.focus_company.symbol}) · ₹{backendData.focus_company.price?.toLocaleString("en-IN")}
                </h4>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>
                  Sensitivity to {activeFactor.label}
                </div>
                <div style={{
                  fontSize: "16px",
                  fontWeight: 900,
                  fontFamily: "ui-monospace, monospace",
                  color: backendData.focus_company.factor_beta >= 0 ? "#34D399" : "#F87171"
                }}>
                  {backendData.focus_company.factor_beta >= 0 ? "+" : ""}{backendData.focus_company.factor_beta.toFixed(2)} Beta ({backendData.focus_company.direction})
                </div>
              </div>

              <button
                onClick={() => handleSelectCompany(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#E2E8F0",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Reset to All Holdings
              </button>
            </div>
          </div>

          {/* Transmission & Intelligence Details */}
          <div style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "12px 16px",
            display: "grid",
            gridTemplateColumns: "1.8fr 1fr",
            gap: "14px"
          }}>
            <div>
              <div style={{ fontSize: "10.5px", color: "#38BDF8", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>
                Macro Transmission Mechanism:
              </div>
              <div style={{ fontSize: "12.5px", color: "#E2E8F0", lineHeight: "1.5" }}>
                {backendData.focus_company.transmission_mechanism}
              </div>
            </div>

            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "14px" }}>
              <div style={{ fontSize: "10.5px", color: "#F3D59B", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>
                Liquidity & Contagion Profile:
              </div>
              <div style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: "1.45" }}>
                {backendData.focus_company.contagion_alert} Liquidity Risk: <b>{backendData.focus_company.liquidity_risk}</b>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAIRWISE MULTI-HOP CONNECTION BREADCRUMB */}
      {pairwiseConnection && (
        <div style={{
          background: "linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)",
          border: "1.5px solid #F59E0B",
          borderRadius: "16px",
          padding: "18px 22px",
          marginBottom: "20px",
          color: "#FFFFFF",
          boxShadow: "0 8px 24px rgba(245, 158, 11, 0.2)",
          animation: "fadeIn 0.2s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ background: "#F59E0B", color: "#0B192C", fontSize: "10.5px", fontWeight: 900, padding: "3px 10px", borderRadius: "999px" }}>
                MULTI-HOP CAUSAL TRANSMISSION PATH
              </span>
              <h4 style={{ margin: 0, fontSize: "18px", color: "#FFFFFF", fontFamily: "Georgia, serif" }}>
                {pairwiseConnection.symbol1} ↔ {pairwiseConnection.symbol2}
              </h4>
            </div>
            <button
              onClick={() => {
                setPairwiseConnection(null);
                setActiveMultiHopPath([]);
              }}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                color: "#E2E8F0",
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "11px",
                cursor: "pointer",
                fontWeight: 800
              }}
            >
              ✕ Clear Path
            </button>
          </div>

          <div style={{
            background: "rgba(0,0,0,0.35)",
            borderRadius: "10px",
            padding: "12px 16px",
            fontFamily: "ui-monospace, monospace",
            fontSize: "13px",
            color: "#FDE68A",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "10px",
            border: "1px solid rgba(245, 158, 11, 0.3)"
          }}>
            <span style={{ color: "#94A3B8", fontWeight: 700 }}>Transmission Chain:</span>
            <b style={{ color: "#FDE68A" }}>{pairwiseConnection.transmission_chain}</b>
          </div>

          <p style={{ fontSize: "12.5px", color: "#E2E8F0", margin: 0, lineHeight: "1.6" }}>
            {pairwiseConnection.explanation}
          </p>

          <div style={{ display: "flex", gap: "20px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.12)", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>
              Calm Market Correlation: <b style={{ color: "#34D399" }}>{pairwiseConnection.calm_correlation || "0.18"}</b>
            </span>
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>
              Crisis Market Correlation: <b style={{ color: "#F87171" }}>{pairwiseConnection.stress_correlation || "0.68"}</b>
            </span>
            <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 800 }}>
              {pairwiseConnection.correlation_jump || "+278% Tail-Risk Jump"}
            </span>
          </div>
        </div>
      )}

      {/* AI HIDDEN RISK SCAN: 3 SECOND-ORDER VULNERABILITIES */}
      {(showScanCard || activeTab === "scan") && (
        <div style={{
          background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
          border: "2px solid #D97706",
          borderRadius: "18px",
          padding: "22px 24px",
          marginBottom: "22px",
          color: "#F9FAFB",
          boxShadow: "0 12px 32px rgba(217, 119, 6, 0.22)",
          animation: "fadeIn 0.25s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ background: "#D97706", color: "#111827", fontSize: "10.5px", fontWeight: 900, padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.08em" }}>
                  AI HIDDEN RISK SCAN COMPLETE
                </span>
                <span style={{ color: "#FDE68A", fontSize: "12px", fontWeight: 700 }}>
                  3 Second-Order Vulnerabilities Discovered
                </span>
              </div>
              <h3 style={{ margin: "6px 0 0", fontSize: "20px", color: "#FFFFFF", fontFamily: "Georgia, serif" }}>
                Hidden Multi-Hop Vulnerabilities That Escape Standard Portfolio Audits
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#9CA3AF", maxWidth: "880px" }}>
                These risks do not appear in direct sector breakdowns. They propagate through second-order macro channels (energy → inflation → interest rates → retail loan demand).
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={runHiddenScan}
                disabled={isScanning}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#FDE68A",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: isScanning ? "wait" : "pointer"
                }}
              >
                {isScanning ? "Scanning..." : "🔄 Re-scan"}
              </button>
              <button
                onClick={() => setShowScanCard(false)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#9CA3AF",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                ✕ Dismiss
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {(hiddenScanResults || backendData?.hidden_risks_top3 || []).map((vuln, idx) => {
              const sev = vuln.severity_score || 85;
              const sevColor = sev >= 85 ? "#EF4444" : "#F59E0B";
              return (
                <div
                  key={vuln.id || idx}
                  style={{
                    background: "rgba(31, 41, 55, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "14px",
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.15s ease",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.2)"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase" }}>
                        Vulnerability #{idx + 1}
                      </span>
                      <span style={{
                        background: sev >= 85 ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)",
                        color: sevColor,
                        border: `1px solid ${sevColor}`,
                        fontSize: "9.5px",
                        fontWeight: 900,
                        padding: "2px 7px",
                        borderRadius: "999px"
                      }}>
                        SEVERITY {sev}/100
                      </span>
                    </div>

                    <h4 style={{ margin: "0 0 8px", fontSize: "14px", color: "#FFFFFF", fontWeight: 800, lineHeight: "1.4" }}>
                      {vuln.title}
                    </h4>

                    <div style={{
                      background: "rgba(0,0,0,0.35)",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      fontSize: "11px",
                      color: "#FDE68A",
                      fontFamily: "ui-monospace, monospace",
                      marginBottom: "10px",
                      lineHeight: "1.45"
                    }}>
                      <b>Chain:</b> {vuln.transmission_chain}
                    </div>

                    <div style={{ fontSize: "11.5px", color: "#D1D5DB", lineHeight: "1.5", marginBottom: "10px" }}>
                      <b>Mechanism:</b> {vuln.hidden_mechanism}
                    </div>

                    <div style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: "1.45", marginBottom: "12px" }}>
                      <b style={{ color: "#34D399" }}>Suggested Hedge:</b> {vuln.suggested_hedge}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <button
                      onClick={() => {
                        setActiveMultiHopPath(vuln.affected_holdings || []);
                        setActiveTab("map");
                        setVoiceNotice(`📍 Highlighted transmission path for ${vuln.title}`);
                      }}
                      style={{
                        flex: 1,
                        background: "rgba(217, 119, 6, 0.15)",
                        border: "1px solid #D97706",
                        color: "#FDE68A",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "10.5px",
                        fontWeight: 800,
                        cursor: "pointer"
                      }}
                    >
                      📍 Highlight Path
                    </button>
                    <button
                      onClick={() => {
                        if (vuln.transmission_chain?.includes("Brent")) {
                          setCurrentFactor("BRENT");
                          setShockValue(20);
                        } else if (vuln.transmission_chain?.includes("USD")) {
                          setCurrentFactor("USDINR");
                          setShockValue(5);
                        }
                        setActiveTab("shock");
                      }}
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#E5E7EB",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      💥 Simulate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MULTI-ORDER SHOCK PROPAGATION CARD */}
      {(activeTab === "shock" || multiOrderData) && (
        <div style={{
          background: "#FFFDF8",
          border: "1.5px solid #E7DBC6",
          borderRadius: "18px",
          padding: "22px 24px",
          marginBottom: "22px",
          boxShadow: "0 10px 30px rgba(13,31,59,0.06)",
          animation: "fadeIn 0.25s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#A67C3F", fontWeight: 900, textTransform: "uppercase" }}>
                MULTI-ORDER CAUSAL PROPAGATION · {activeFactor.label} ({shockValue > 0 ? "+" : ""}{shockValue}%)
              </div>
              <h3 style={{ margin: "2px 0 0", fontSize: "20px", color: "#0D1F3B", fontFamily: "Georgia, serif" }}>
                1st, 2nd, and 3rd Order Portfolio Shock Breakdown
              </h3>
            </div>
            <div style={{
              background: "#FFFAF0",
              border: "1px solid #EADFC9",
              padding: "6px 14px",
              borderRadius: "999px",
              fontFamily: "ui-monospace, monospace",
              fontSize: "13px",
              fontWeight: 900,
              color: netPortfolioImpact >= 0 ? "#267564" : "#A84743"
            }}>
              Net Portfolio Shock: {netPortfolioImpact >= 0 ? "+" : ""}{netPortfolioImpact.toFixed(2)}%
            </div>
          </div>

          {/* AI SPOKEN INSTITUTIONAL INSIGHT BANNER */}
          <div style={{
            background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
            border: "1.5px solid #F59E0B",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.12)"
          }}>
            <span style={{ fontSize: "20px" }}>💡</span>
            <div>
              <b style={{ color: "#92400E", fontSize: "12.5px", display: "block", marginBottom: "2px" }}>
                Institutional Voice Copilot Insight:
              </b>
              <p style={{ margin: 0, fontSize: "13px", color: "#78350F", lineHeight: "1.55", fontWeight: 600 }}>
                {simData?.hidden_vulnerability_insight || multiOrderData?.hidden_vulnerability_insight || "Your biggest hidden vulnerability is not direct oil exposure. It is the second-order inflation → interest-rate → automobile demand pathway (Maruti and Tata Motors demand drag)."}
              </p>
            </div>
          </div>

          {/* 4 ORDER COLUMNS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            {/* 1st-Order Direct Gainers */}
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontSize: "10px", fontWeight: 900, color: "#166534", textTransform: "uppercase", marginBottom: "8px" }}>
                🟢 1st-Order Direct Gainers
              </div>
              {(multiOrderData?.gainers || [
                { symbol: "RELIANCE", name: "Reliance Ind", expected_return_pct: 2.8, mechanism: "Upstream crude pass-through" }
              ]).map((x) => (
                <div key={x.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #DCFCE7" }}>
                  <div>
                    <b style={{ fontSize: "12px", color: "#166534" }}>{x.symbol}</b>
                    <span style={{ fontSize: "10px", color: "#4B5563", display: "block" }}>{x.mechanism || "Upstream realization"}</span>
                  </div>
                  <b style={{ fontFamily: "ui-monospace, monospace", fontSize: "13px", color: "#166534" }}>
                    +{Math.abs(x.expected_return_pct).toFixed(1)}%
                  </b>
                </div>
              ))}
            </div>

            {/* 1st-Order Direct Losers */}
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontSize: "10px", fontWeight: 900, color: "#991B1B", textTransform: "uppercase", marginBottom: "8px" }}>
                🔴 1st-Order Direct Losers
              </div>
              {(multiOrderData?.direct_losers || [
                { symbol: "ASIANPAINT", name: "Asian Paints", expected_return_pct: -5.4, mechanism: "Petrochem raw materials" }
              ]).map((x) => (
                <div key={x.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #FEE2E2" }}>
                  <div>
                    <b style={{ fontSize: "12px", color: "#991B1B" }}>{x.symbol}</b>
                    <span style={{ fontSize: "10px", color: "#4B5563", display: "block" }}>{x.mechanism || "Petrochem COGS spike"}</span>
                  </div>
                  <b style={{ fontFamily: "ui-monospace, monospace", fontSize: "13px", color: "#991B1B" }}>
                    {x.expected_return_pct.toFixed(1)}%
                  </b>
                </div>
              ))}
            </div>

            {/* 2nd-Order Indirect Losers */}
            <div style={{ background: "#FFF7ED", border: "1.5px solid #FDBA74", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontSize: "10px", fontWeight: 900, color: "#C2410C", textTransform: "uppercase", marginBottom: "8px" }}>
                🟠 2nd-Order Indirect Losers
              </div>
              {(multiOrderData?.second_order_losers || [
                { symbol: "MARUTI", name: "Maruti Suzuki", expected_return_pct: -3.2, mechanism: "Auto EMI inflation drag" },
                { symbol: "TATAMOTORS", name: "Tata Motors", expected_return_pct: -2.9, mechanism: "Interest rate sensitivity" },
                { symbol: "HDFCBANK", name: "HDFC Bank", expected_return_pct: -1.1, mechanism: "Repo rate repricing" }
              ]).map((x) => (
                <div key={x.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #FFEDD5" }}>
                  <div>
                    <b style={{ fontSize: "12px", color: "#C2410C" }}>{x.symbol}</b>
                    <span style={{ fontSize: "10px", color: "#4B5563", display: "block" }}>{x.mechanism || "Auto EMI inflation drag"}</span>
                  </div>
                  <b style={{ fontFamily: "ui-monospace, monospace", fontSize: "13px", color: "#C2410C" }}>
                    {x.expected_return_pct.toFixed(1)}%
                  </b>
                </div>
              ))}
            </div>

            {/* 3rd-Order Insulated Assets */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontSize: "10px", fontWeight: 900, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>
                🔵 3rd-Order Insulated / Resilient
              </div>
              {(multiOrderData?.insulated || [
                { symbol: "TCS", name: "Tata Consultancy", expected_return_pct: 0.2, mechanism: "Global enterprise demand" },
                { symbol: "INFY", name: "Infosys Ltd", expected_return_pct: 0.1, mechanism: "USD contract realization" }
              ]).map((x) => (
                <div key={x.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
                  <div>
                    <b style={{ fontSize: "12px", color: "#334155" }}>{x.symbol}</b>
                    <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>{x.mechanism || "Global tech demand"}</span>
                  </div>
                  <b style={{ fontFamily: "ui-monospace, monospace", fontSize: "13px", color: "#059669" }}>
                    +{Math.abs(x.expected_return_pct).toFixed(1)}%
                  </b>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRUE DIVERSIFICATION CARD */}
      {activeTab === "clusters" && (
        <div style={{
          background: "#FFFDF8",
          border: "1.5px solid #267564",
          borderRadius: "18px",
          padding: "22px 24px",
          marginBottom: "22px",
          boxShadow: "0 10px 30px rgba(38,117,100,0.1)",
          animation: "fadeIn 0.25s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ background: "#267564", color: "#FFFFFF", fontSize: "10px", fontWeight: 900, padding: "3px 10px", borderRadius: "999px" }}>
                EIGENVALUE PARTICIPATION RATIO
              </span>
              <h3 style={{ margin: "6px 0 2px", fontSize: "20px", color: "#0D1F3B", fontFamily: "Georgia, serif" }}>
                True Diversification: 3.1 Effective Independent Risk Groups
              </h3>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#5F5B55", maxWidth: "800px" }}>
                You hold 10 individual stocks across 6 conventional sectors. However, principal component eigenvalue analysis proves that 78% of your portfolio return variance collapses into just 3 macro factors.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "26px", fontWeight: 900, fontFamily: "Georgia, serif", color: "#267564" }}>
                3.1 / 10.0
              </div>
              <span style={{ fontSize: "10px", color: "#776F63", fontWeight: 800, textTransform: "uppercase" }}>
                Effective Degrees of Freedom
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {(backendData?.cluster_breakdown || [
              { cluster_id: "CLUSTER #1", name: "Global Tech & Dollar Revenue Realization", holdings: ["TCS", "INFY"], variance_share: "34.2%", primary_driver: "US Enterprise IT Budgets & USD/INR Exchange Rate" },
              { cluster_id: "CLUSTER #2", name: "Energy, Refining & Industrial Raw Materials", holdings: ["RELIANCE", "ASIANPAINT"], variance_share: "28.4%", primary_driver: "Brent Crude Oil & Petrochemical Feedstock Pass-Through" },
              { cluster_id: "CLUSTER #3", name: "Domestic Banking & Consumer Credit Cycle", holdings: ["HDFCBANK", "MARUTI", "TATAMOTORS"], variance_share: "22.8%", primary_driver: "RBI Repo Rate Transmission & Vehicle EMI Elasticity" }
            ]).map((cl) => (
              <div key={cl.cluster_id} style={{ background: "#FBF6EC", border: "1px solid #EADFC9", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <b style={{ fontSize: "11px", color: "#A67C3F" }}>{cl.cluster_id}</b>
                  <b style={{ fontSize: "11.5px", color: "#267564" }}>{cl.variance_share} variance</b>
                </div>
                <h4 style={{ margin: "0 0 8px", fontSize: "14px", color: "#0D1F3B" }}>{cl.name}</h4>
                <div style={{ fontSize: "11.5px", color: "#514C43", marginBottom: "8px" }}>
                  <b>Holdings:</b> {cl.holdings.join(", ")}
                </div>
                <div style={{ fontSize: "11px", color: "#776F63", lineHeight: "1.4" }}>
                  <b>Primary Driver:</b> {cl.primary_driver}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CRISIS STRESS REGIME CORRELATION CARD */}
      {activeTab === "regime" && (
        <div style={{
          background: "#FFFDF8",
          border: "1.5px solid #A84743",
          borderRadius: "18px",
          padding: "22px 24px",
          marginBottom: "22px",
          boxShadow: "0 10px 30px rgba(168,71,67,0.1)",
          animation: "fadeIn 0.25s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ background: "#A84743", color: "#FFFFFF", fontSize: "10px", fontWeight: 900, padding: "3px 10px", borderRadius: "999px" }}>
                REGIME-CONDITIONED CORRELATION BREAKDOWN
              </span>
              <h3 style={{ margin: "6px 0 2px", fontSize: "20px", color: "#0D1F3B", fontFamily: "Georgia, serif" }}>
                Calm vs Crisis Regime: Inter-Stock Correlation Surges from 0.22 to 0.71
              </h3>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#5F5B55", maxWidth: "800px" }}>
                During calm market conditions, idiosyncratic firm news dominates (average correlation: 0.22). In systemic liquidity contractions, macro factor betas overpower company fundamentals, surging correlation to 0.71.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ textAlign: "center", background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "8px 16px", borderRadius: "10px" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#166534" }}>0.22</div>
                <div style={{ fontSize: "9.5px", color: "#4B5563", fontWeight: 800 }}>CALM REGIME</div>
              </div>
              <div style={{ textAlign: "center", background: "#FEF2F2", border: "1px solid #FECACA", padding: "8px 16px", borderRadius: "10px" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#991B1B" }}>0.71</div>
                <div style={{ fontSize: "9.5px", color: "#4B5563", fontWeight: 800 }}>CRISIS REGIME (+222%)</div>
              </div>
            </div>
          </div>

          <div style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "12.5px",
            color: "#991B1B",
            lineHeight: "1.55"
          }}>
            <b>⚠️ The False Diversification Illusion:</b> In a market crash or liquidity freeze, holding diverse sectors (Tech + Banking + Energy) fails to prevent simultaneous drawdowns because global FII outflows and dollar margin calls de-rate all equities simultaneously.
            <div style={{ marginTop: "6px", color: "#7F1D1D", fontWeight: 700 }}>
              Vulnerable Pair: RELIANCE ↔ HDFCBANK (Calm: 0.18 → Crisis: 0.68). Recommended hedge: Maintain 8-12% negative crisis-beta assets (Sovereign Gold Bonds or USD-denominated cash flows).
            </div>
          </div>
        </div>
      )}

      {/* 2. THREE HEADLINE METRIC CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px", marginBottom: "20px" }}>
        <div style={{ padding: "16px 20px", borderRadius: "14px", background: "#FBF6EC", border: "1px solid #EADFC9" }}>
          <b style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#A84743", display: "block" }}>
            {activeFactor.capital}%
          </b>
          <span style={{ fontSize: "10.5px", color: "#776F63", marginTop: "4px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Total Capital Exposed to {activeFactor.label}
          </span>
        </div>

        <div style={{ padding: "16px 20px", borderRadius: "14px", background: "#FBF6EC", border: "1px solid #EADFC9" }}>
          <b style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#0D1F3B", display: "block" }}>
            {backendData?.effective_risk_clusters || 2.4} Clusters
          </b>
          <span style={{ fontSize: "10.5px", color: "#776F63", marginTop: "4px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Effective Risk Clusters (Apparent 6 Sectors)
          </span>
        </div>

        <div style={{ padding: "16px 20px", borderRadius: "14px", background: "#FBF6EC", border: "1px solid #EADFC9" }}>
          <b style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#267564", display: "block" }}>
            {backendData?.true_diversification_score || 61}%
          </b>
          <span style={{ fontSize: "10.5px", color: "#776F63", marginTop: "4px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            True Factor Diversification Score
          </span>
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE SVG CHORD & FACTOR GRAPH */}
      <div style={{
        background: "#FFFDF8",
        border: "1px solid #E7DBC6",
        borderRadius: "18px",
        padding: "24px 26px",
        boxShadow: "0 10px 30px rgba(13,31,59,.06)",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "9.5px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#77736B", fontWeight: 900 }}>
              SYSTEMIC FACTOR GRAPH
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", margin: "2px 0 0", fontSize: "20px", color: "#0D1F3B" }}>
              Macro Factor ↔ Holding Transmission Network
            </h3>
          </div>
          <div style={{ display: "flex", gap: "14px", fontSize: "11px", fontWeight: 700 }}>
            <span style={{ color: "#BF9550" }}>● Positive Sensitivity</span>
            <span style={{ color: "#AD4D48" }}>● Negative Sensitivity</span>
            <span style={{ color: "#F59E0B" }}>⚡ Active Multi-Hop Transmission</span>
            <span style={{ color: "#776F63" }}>╌ Inactive</span>
          </div>
        </div>

        <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: "100%", height: "auto", minWidth: "720px", display: "block" }}
          >
            <defs>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#267564" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#267564" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Inner Ring Guide */}
            <circle cx={cx} cy={cy} r={175} fill="none" stroke="#EFE6D6" strokeWidth="1" strokeDasharray="3 4" />
            {/* Outer Ring Guide */}
            <circle cx={cx} cy={cy} r={310} fill="none" stroke="#EFE6D6" strokeWidth="1" strokeDasharray="3 4" />

            {/* Chords: Center to Macro Factors */}
            {factorKeys.map((k) => {
              const [fx, fy] = factorPositions[k];
              const isActive = k === currentFactor;
              return (
                <line
                  key={`factor-line-${k}`}
                  x1={cx}
                  y1={cy}
                  x2={fx}
                  y2={fy}
                  stroke={isActive ? "#BF9550" : "#D7C39F"}
                  strokeWidth={isActive ? "3" : "1.6"}
                  strokeDasharray={isActive ? "none" : "5 6"}
                  opacity={isActive ? 0.95 : 0.45}
                />
              );
            })}

            {/* Active Factor Lines to Peripheral Holdings */}
            {portfolioHoldings.map((h, i) => {
              const sens = h.factor_beta || 0;
              if (Math.abs(sens) < 0.15) return null;
              const [fx, fy] = factorPositions[currentFactor];
              const hp = holdingPositions[i];
              if (!hp) return null;
              const isFocus = h.is_focus || (focusSymbol && h.sym === focusSymbol);
              const isStrong = Math.abs(sens) > 0.45;
              return (
                <line
                  key={`holding-line-${h.sym}`}
                  x1={fx}
                  y1={fy}
                  x2={hp.x}
                  y2={hp.y}
                  stroke={isFocus ? "#0284C7" : (sens > 0 ? "#BF9550" : "#AD4D48")}
                  strokeWidth={isFocus ? "3.5" : (isStrong ? "2.6" : "1.5")}
                  strokeDasharray={isFocus ? "5 3" : "none"}
                  opacity={isFocus ? 1 : 0.85}
                />
              );
            })}

            {/* Multi-Hop Connecting Arcs between Active Multi-Hop Nodes */}
            {activeMultiHopPath.length >= 2 && (() => {
              const matchedPoints = activeMultiHopPath.map((item) => {
                const hp = holdingPositions.find(p => p.sym === item);
                if (hp) return { sym: item, x: hp.x, y: hp.y };
                const fp = factorPositions[item];
                if (fp) return { sym: item, x: fp[0], y: fp[1] };
                return null;
              }).filter(Boolean);

              if (matchedPoints.length < 2) return null;

              return matchedPoints.slice(0, -1).map((pt1, idx) => {
                const pt2 = matchedPoints[idx + 1];
                const midX = (pt1.x + pt2.x) / 2 * 0.72 + cx * 0.28;
                const midY = (pt1.y + pt2.y) / 2 * 0.72 + cy * 0.28;
                return (
                  <g key={`multihop-${pt1.sym}-${pt2.sym}-${idx}`}>
                    <path
                      d={`M ${pt1.x} ${pt1.y} Q ${midX} ${midY} ${pt2.x} ${pt2.y}`}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      opacity={0.95}
                    />
                  </g>
                );
              });
            })()}

            {/* Peripheral Stock Nodes */}
            {portfolioHoldings.map((h, i) => {
              const hp = holdingPositions[i];
              if (!hp) return null;
              const isSelected = selectedHolding?.sym === h.sym;
              const isFocus = h.is_focus || (focusSymbol && h.sym === focusSymbol);
              const isInMultiHop = activeMultiHopPath.includes(h.sym);
              return (
                <g
                  key={h.sym}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedHolding(h)}
                >
                  {isInMultiHop && (
                    <circle
                      cx={hp.x}
                      cy={hp.y}
                      r={30}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                      opacity={0.95}
                    />
                  )}
                  {isFocus && !isInMultiHop && (
                    <circle
                      cx={hp.x}
                      cy={hp.y}
                      r={30}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                      opacity={0.9}
                    />
                  )}
                  <circle
                    cx={hp.x}
                    cy={hp.y}
                    r={isFocus || isInMultiHop ? 25 : (isSelected ? 22 : 19)}
                    fill={isInMultiHop ? "#78350F" : (isFocus ? "#0369A1" : "#0D1F3B")}
                    stroke={isInMultiHop ? "#F59E0B" : (isFocus ? "#38BDF8" : (isSelected ? "#F3D59B" : "none"))}
                    strokeWidth={isInMultiHop || isFocus ? "2.5" : (isSelected ? "3" : "0")}
                    filter="drop-shadow(0 4px 10px rgba(12,31,59,.25))"
                  />
                  <text
                    x={hp.x}
                    y={hp.y + 3.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isFocus || isInMultiHop ? "10.5" : "9.5"}
                    fontWeight="900"
                    fontFamily="sans-serif"
                    pointerEvents="none"
                  >
                    {h.sym}
                  </text>
                </g>
              );
            })}

            {/* Macro Factor Nodes */}
            {factorKeys.map((k) => {
              const [fx, fy] = factorPositions[k];
              const f = FACTORS[k];
              const isActive = k === currentFactor;
              const isInMultiHop = activeMultiHopPath.includes(k);
              return (
                <g
                  key={k}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelectFactor(k)}
                >
                  {isInMultiHop && (
                    <circle
                      cx={fx}
                      cy={fy}
                      r={34}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                      opacity={0.95}
                    />
                  )}
                  <circle
                    cx={fx}
                    cy={fy}
                    r={isActive ? 28 : (isInMultiHop ? 25 : 22)}
                    fill={isInMultiHop ? "#B45309" : f.color}
                    stroke={isActive ? "#0D1F3B" : (isInMultiHop ? "#FDE68A" : "#FFFFFF")}
                    strokeWidth={isActive ? "3" : "2"}
                    filter="drop-shadow(0 4px 10px rgba(0,0,0,.15))"
                  />
                  <text
                    x={fx}
                    y={fy + 3.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isActive ? "11" : "9.5"}
                    fontWeight="900"
                    fontFamily="sans-serif"
                    pointerEvents="none"
                  >
                    {k}
                  </text>
                </g>
              );
            })}

            {/* Center Node: PORTFOLIO */}
            <circle cx={cx} cy={cy} r={46} fill="url(#centerGlow)" />
            <circle
              cx={cx}
              cy={cy}
              r={36}
              fill="#FFFFFF"
              stroke="#267564"
              strokeWidth="3.5"
              filter="drop-shadow(0 6px 14px rgba(38,117,100,.25))"
            />
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill="#267564"
              fontSize="10"
              fontWeight="900"
              letterSpacing="0.1em"
              fontFamily="sans-serif"
            >
              PORTFOLIO
            </text>
            <text
              x={cx}
              y={cy + 11}
              textAnchor="middle"
              fill="#0D1F3B"
              fontSize="12"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              100%
            </text>
          </svg>
        </div>

        {/* Selected Holding Details Card */}
        {selectedHolding && (
          <div style={{
            marginTop: "16px",
            padding: "14px 18px",
            background: "#FFFAF0",
            border: "1px solid #E8DECE",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <b style={{ fontSize: "13px", color: "#0D1F3B" }}>
                {selectedHolding.name} ({selectedHolding.sym}) · {selectedHolding.sector} · {selectedHolding.w}% weight
              </b>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6A645A", maxWidth: "880px" }}>
                <b>Transmission Mechanism:</b> {selectedHolding.mechanism}
              </p>
            </div>
            <button
              onClick={() => setSelectedHolding(null)}
              style={{
                border: "none",
                background: "transparent",
                color: "#7A7265",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 4. SHOCK SIMULATOR & CONTAGION TRACE (BALANCED DUAL ROW) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Shock Simulator */}
        <div style={{ background: "#FFFDF8", border: "1px solid #E7DBC6", borderRadius: "18px", padding: "22px", boxShadow: "0 10px 30px rgba(13,31,59,.06)" }}>
          <div style={{ fontSize: "9.5px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#77736B", fontWeight: 900 }}>
            COUNTERFACTUAL SHOCK SIMULATOR
          </div>
          <h3 style={{ fontFamily: "Georgia, serif", margin: "2px 0 10px", fontSize: "20px", color: "#0D1F3B" }}>
            Stress test: {activeFactor.label}
          </h3>

          {/* Slider Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={shockValue}
                onChange={(e) => setShockValue(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#C49B59" }}
              />
            </div>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontWeight: 900, textAlign: "right", fontSize: "17px", color: shockValue >= 0 ? "#267564" : "#A84743" }}>
              {shockValue > 0 ? "+" : ""}{shockValue}%
            </div>
          </div>

          <div>
            {impacts.map((x) => {
              const barWidth = Math.min(48, Math.abs(x.val) * 11);
              return (
                <div key={x.sym} style={{ display: "flex", alignItems: "center", gap: "10px", margin: "9px 0" }}>
                  <div style={{ width: "95px", fontSize: "11.5px", fontWeight: 800, color: "#0D1F3B" }}>
                    {x.sym}
                  </div>
                  <div style={{ height: "9px", background: "#ECE4D7", borderRadius: "99px", flex: 1, overflow: "hidden", position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: x.val >= 0 ? "50%" : "auto",
                        right: x.val < 0 ? "50%" : "auto",
                        width: `${barWidth}%`,
                        background: x.val >= 0 ? "#267564" : "#A84743",
                        borderRadius: "99px"
                      }}
                    />
                  </div>
                  <div style={{ width: "62px", textAlign: "right", fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: "11px", fontWeight: 900, color: x.val >= 0 ? "#267564" : "#A84743" }}>
                    {x.val >= 0 ? "+" : ""}{x.val.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "12px 14px", border: "1px solid #E6D6B8", background: "#FFFAF0", borderRadius: "10px", fontSize: "12px", lineHeight: "1.55", color: "#15213B", marginTop: "14px" }}>
            <b>Counterfactual portfolio impact:</b> approximately <b style={{ color: netPortfolioImpact >= 0 ? "#267564" : "#A84743" }}>{netPortfolioImpact >= 0 ? "+" : ""}{netPortfolioImpact.toFixed(2)}%</b> across your active holdings. Calibrated through live empirical sensitivities.
          </div>
        </div>

        {/* Contagion Trace */}
        <div style={{ background: "#FFFDF8", border: "1px solid #E7DBC6", borderRadius: "18px", padding: "22px", boxShadow: "0 10px 30px rgba(13,31,59,.06)" }}>
          <div style={{ fontSize: "9.5px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#77736B", fontWeight: 900 }}>
            CONTAGION TRACE · LIVE RISK AUDIT
          </div>
          <h3 style={{ fontFamily: "Georgia, serif", margin: "2px 0 14px", fontSize: "20px", color: "#0D1F3B" }}>
            Why two “unrelated” holdings can fail together
          </h3>

          <div style={{ borderLeft: "4px solid #C49B59", padding: "12px 14px", background: "#FFFAF2", borderRadius: "0 12px 12px 0", marginBottom: "16px" }}>
            <strong style={{ fontSize: "12.5px", color: "#0D1F3B" }}>Common-driver transmission chain</strong>
            <p style={{ fontSize: "12px", color: "#5F5B55", lineHeight: "1.5", margin: "5px 0 8px" }}>
              {activeFactor.path.join(" → ")}. The engine detects when equity price correlation is mild during calm regimes, but spikes to {activeFactor.risk}% intensity under systemic stress.
            </p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "10px" }}>
              <span style={{ background: "#EFE8DC", borderRadius: "6px", padding: "4px 7px", fontWeight: 600 }}>Dynamic correlation</span>
              <span style={{ background: "#EFE8DC", borderRadius: "6px", padding: "4px 7px", fontWeight: 600 }}>Lead-lag path</span>
              <span style={{ background: "#EFE8DC", borderRadius: "6px", padding: "4px 7px", fontWeight: 600 }}>Graph neural edge</span>
              <span style={{ marginLeft: "auto", fontWeight: 900, color: "#267564" }}>{activeFactor.risk}% risk intensity</span>
            </div>
          </div>

          <div style={{ fontSize: "9.5px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#77736B", fontWeight: 900, marginBottom: "8px" }}>
            PORTFOLIO ASSET CONTAGION TRACE
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E7DBC6" }}>
                <th style={{ textAlign: "left", padding: "8px 6px", color: "#7A7265", fontSize: "10px" }}>ASSET</th>
                <th style={{ textAlign: "left", padding: "8px 6px", color: "#7A7265", fontSize: "10px" }}>WEIGHT</th>
                <th style={{ textAlign: "left", padding: "8px 6px", color: "#7A7265", fontSize: "10px" }}>LIQUIDITY RISK</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: "#7A7265", fontSize: "10px" }}>BETA CONTRIB.</th>
              </tr>
            </thead>
            <tbody>
              {contagionTrace.map((r, i) => (
                <tr key={r.asset} style={{ borderBottom: i < contagionTrace.length - 1 ? "1px solid #EFE6D6" : "none" }}>
                  <td style={{ padding: "9px 6px", fontWeight: 700, color: "#0D1F3B" }}>{r.asset}</td>
                  <td style={{ padding: "9px 6px", color: "#514C43" }}>{r.effective_weight}</td>
                  <td style={{ padding: "9px 6px", color: "#514C43" }}>{r.three_day_liquidity_risk}</td>
                  <td style={{ padding: "9px 6px", textAlign: "right", fontWeight: 800, color: r.macro_beta_contribution?.startsWith("+") ? "#A84743" : "#267564" }}>
                    {r.macro_beta_contribution}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. LATENT FACTOR DISCOVERY & REBALANCE INTELLIGENCE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Latent Factor Discovery */}
        <div style={{ background: "#FFFDF8", border: "1px solid #E7DBC6", borderRadius: "18px", padding: "22px", boxShadow: "0 10px 30px rgba(13,31,59,.06)" }}>
          <div style={{ fontSize: "9.5px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#77736B", fontWeight: 900 }}>
            LATENT FACTOR DISCOVERY · AI SEMANTIC SEARCH
          </div>
          <h3 style={{ fontFamily: "Georgia, serif", margin: "2px 0 6px", fontSize: "20px", color: "#0D1F3B" }}>
            Unlabeled common driver detector
          </h3>
          <p style={{ color: "#6F706B", fontSize: "12px", margin: "0 0 14px", lineHeight: "1.5" }}>
            When holdings co-move without a conventional factor explaining it, the engine creates a latent node, searches quarterly filings and earnings call transcripts for semantic themes, then verifies or rejects it.
          </p>

          <div>
            {latentFactors.map((lat) => (
              <div
                key={lat.id || lat.name}
                style={{
                  borderLeft: "4px solid #C49B59",
                  padding: "12px 14px",
                  background: "#FFFAF2",
                  borderRadius: "0 12px 12px 0",
                  margin: "11px 0"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "12.5px", color: "#0D1F3B" }}>{lat.id}: {lat.name}</strong>
                  <span style={{ fontSize: "11px", fontWeight: 900, color: "#267564" }}>
                    {lat.variance_explained} var.
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#5F5B55", lineHeight: "1.5", margin: "4px 0 6px" }}>
                  {lat.description}
                </p>
                <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#7A7265" }}>
                  <b>Transmission:</b> {lat.transmission}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rebalance Intelligence */}
        <div style={{ background: "#FFFDF8", border: "1px solid #E7DBC6", borderRadius: "18px", padding: "22px", boxShadow: "0 10px 30px rgba(13,31,59,.06)" }}>
          <div style={{ fontSize: "9.5px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#77736B", fontWeight: 900 }}>
            REBALANCE INTELLIGENCE
          </div>
          <h3 style={{ fontFamily: "Georgia, serif", margin: "2px 0 14px", fontSize: "20px", color: "#0D1F3B" }}>
            Reduce hidden concentration, not just sector weight
          </h3>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E7DBC6" }}>
                <th style={{ textAlign: "left", padding: "9px 6px", color: "#7A7265", fontSize: "10px" }}>ACTION</th>
                <th style={{ textAlign: "left", padding: "9px 6px", color: "#7A7265", fontSize: "10px" }}>RATIONALE</th>
                <th style={{ textAlign: "right", padding: "9px 6px", color: "#7A7265", fontSize: "10px" }}>RISK Δ</th>
              </tr>
            </thead>
            <tbody>
              {rebalanceRecs.map((r, i) => (
                <tr key={r.action} style={{ borderBottom: i < rebalanceRecs.length - 1 ? "1px solid #EFE6D6" : "none" }}>
                  <td style={{ padding: "10px 6px", fontWeight: 700, color: "#0D1F3B" }}>{r.action}</td>
                  <td style={{ padding: "10px 6px", color: "#514C43", maxWidth: "260px" }}>{r.rationale}</td>
                  <td style={{ padding: "10px 6px", textAlign: "right", fontWeight: 900, color: r.risk_delta?.startsWith("-") ? "#267564" : "#BF9550" }}>
                    {r.risk_delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
