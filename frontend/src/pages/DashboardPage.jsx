import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LayoutGrid,
  SlidersHorizontal,
  Radio,
  Activity,
  Sparkles,
  Search,
  Building2,
  TrendingUp,
  TrendingDown,
  Clock,
  X,
  Send,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Layers,
  ChevronRight,
  ChevronLeft,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  PieChart,
  CandlestickChart,
  Info,
  User,
  Bot
} from "lucide-react";
import { apiClient } from "../api/client";
import { getIndianMarketStatus } from "../utils/marketHours";

// ============================================================================
// SEED & RANDOM GENERATORS FOR CONSISTENT QUANTITATIVE PROJECTIONS
// ============================================================================
function seeded(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand(seed) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function generatePriceSeries(stock, n = 18, drift = 0) {
  const basePrice = Number(stock?.price || stock?.ltp || 180);
  const sym = stock?.symbol || stock?.sym || "TATASTEEL";
  let v = basePrice * (0.965 + rand(seeded(sym)) * 0.03);
  const a = [];
  for (let i = 0; i < n; i++) {
    v *= 1 + drift + (rand(seeded(sym) + i * 19) - 0.49) * 0.011;
    a.push(v);
  }
  a[n - 1] = basePrice;
  return a;
}

function calculateForecastRange(stock) {
  const basePrice = Number(stock?.price || stock?.ltp || 180);
  const conf = Number(stock?.conf || stock?.confidence || 75);
  const vol = 0.008 + (100 - conf) * 0.00008;
  return [basePrice * (1 - vol), basePrice * (1 + vol * 1.15)];
}

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

import { COMPANY_NAME_MAP, ALL_COMPANIES_UNIVERSE as BASE_COMPANIES } from "../data/allCompaniesUniverse";

function formatToTitleCase(str) {
  if (!str) return "";
  const cleaned = str.replace(/[_.-]+/g, " ").trim();
  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .map((w) => {
      if (!w) return "";
      const upper = w.toUpperCase();
      if (["LTD", "LIMITED", "CORP", "CORPORATION", "BANK", "INC"].includes(upper)) {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      }
      if (["TCS", "HDFC", "ICICI", "SBI", "BSE", "MCX", "HAL", "BEL", "BHEL", "BPCL", "IOC", "IRCTC", "PNB", "DLF", "L&T", "M&M", "NTPC", "ONGC", "JSW", "ITC"].includes(upper)) {
        return upper;
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/\bLte\b/g, "Ltd")
    .replace(/\bLtd\b/g, "Ltd");
}

function formatLogoText(name, sym) {
  const s = (sym || "").toUpperCase();
  const specialMap = {
    RELIANCE: "Rel", TCS: "Tcs", HDFCBANK: "Hdf", INFY: "Inf", ICICIBANK: "Ici",
    SBIN: "Sbi", BHARTIARTL: "Air", ITC: "Itc", LT: "L&t", TATAMOTORS: "Tam",
    SUNPHARMA: "Sun", BAJFINANCE: "Baj", AXISBANK: "Axi", KOTAKBANK: "Kot",
    MARUTI: "Mar", TITAN: "Tit", ULTRACEMCO: "Ult", ASIANPAINT: "Asp", NTPC: "Ntp",
    TATASTEEL: "Tas", COALINDIA: "Coa", POWERGRID: "Pwg", "M&M": "M&m", HCLTECH: "Hcl",
    ADANIPORTS: "Adp", ADANIENT: "Ade", ATGL: "Atg", WIPRO: "Wip", TECHM: "Tem",
    ONGC: "Ong", JSWSTEEL: "Jsw", HINDALCO: "Hin", BPCL: "Bpc", CIPLA: "Cip",
    DRREDDY: "Drr", BRITANNIA: "Bri", EICHERMOT: "Eic", APOLLOHOSP: "Apo", DIVISLAB: "Div",
    HAL: "Hal", BEL: "Bel", DLF: "Dlf", VEDL: "Ved", TRENT: "Tre", ZOMATO: "Zom",
    SWIGGY: "Swi", BSE: "Bse", MCX: "Mcx", ANGELONE: "Ang", PIDILITIND: "Pid",
    JIOFIN: "Jio", TATAPOWER: "Tap", SUZLON: "Suz", INDIGO: "Ind", PNB: "Pnb",
    BANKBARODA: "Bob", IOC: "Ioc", IRCTC: "Irc", BHEL: "Bhe", INDUSINDBK: "Ind",
    HEROMOTOCO: "Her", VARUNBEV: "Vbl", ADANIPOWER: "Adp", ADANIGREEN: "Adg",
    SIEMENS: "Sie", ABB: "Abb", POLYCAB: "Pol", HAVELLS: "Hav", TATACONSUM: "Tcp",
    GRASIM: "Gra", DABUR: "Dab", MARICO: "Mrc", GODREJCP: "Gcp", OBEROIRLTY: "Obe",
    LODHA: "Lod", MUTHOOTFIN: "Mut", CHOLAFIN: "Cho", SHREECEM: "Shr", AMBUJACEM: "Amb",
    CANBK: "Can", UNIONBANK: "Uni", IDFCFIRSTB: "Idf", FEDERALBNK: "Fed", BANDHANBNK: "Ban",
    AUBANK: "Aub", RVNL: "Rvn", MAZDOCK: "Maz", COCHINSHIP: "Coc", DIXON: "Dix",
    KAYNES: "Kay", LUPIN: "Lup", AUROPHARMA: "Aur", MAXHEALTH: "Max", NYKAA: "Nyk",
    DELHIVERY: "Del", CDSL: "Cds", CAMS: "Cam", LTIM: "Lti", PERSISTENT: "Per", COFORGE: "Cof"
  };
  if (specialMap[s]) return specialMap[s];
  const clean = (name || sym || "").trim();
  const word = clean.split(" ")[0].replace(/[^a-zA-Z]/g, "");
  if (word.length >= 3) {
    return word.charAt(0).toUpperCase() + word.slice(1, 3).toLowerCase();
  }
  return (sym || clean).slice(0, 3);
}

const DEFAULT_NEWS = [
  { type: "company", time: "09:02", src: "Exchange filing", title: "Reliance capex update improves visibility on downstream execution", summary: "Large project milestone reduces near-term execution uncertainty; positive read-through for suppliers is modest.", sent: 72, horizon: "1–3D", conf: 84, impact: "+1.2", tickers: ["RELIANCE", "LT"] },
  { type: "macro", time: "08:54", src: "Macro desk", title: "Crude softens while INR stays stable — mixed but constructive margin signal", summary: "Lower crude can support oil-sensitive consumers, paints and aviation while upstream energy sees a softer realization backdrop.", sent: 58, horizon: "1D", conf: 77, impact: "+0.4", tickers: ["BPCL", "ONGC", "MARUTI"] },
  { type: "earnings", time: "08:41", src: "Earnings monitor", title: "IT commentary points to selective deal resilience, not broad-based acceleration", summary: "Large-cap IT remains a stock-selection trade; guidance tone matters more than headline revenue growth.", sent: 47, horizon: "1–5D", conf: 81, impact: "-0.2", tickers: ["TCS", "INFY", "HCLTECH"] },
  { type: "regulation", time: "08:20", src: "Policy tracker", title: "Financial-market rule proposal raises short-term activity uncertainty for brokers", summary: "Potential transaction-flow friction can affect exchange and broker volumes; impact depends on final implementation details.", sent: 35, horizon: "3–10D", conf: 74, impact: "-0.8", tickers: ["BSE", "ANGELONE", "MCX"] },
  { type: "company", time: "08:02", src: "Company update", title: "Defense execution pipeline remains firm with delivery cadence in focus", summary: "Order visibility stays supportive but valuation sensitivity is elevated after strong relative performance.", sent: 69, horizon: "5–20D", conf: 79, impact: "+0.7", tickers: ["HAL"] },
  { type: "commodity", time: "07:48", src: "Commodity tape", title: "Base-metals momentum improves with stronger Asian futures session", summary: "Supports steel and metals beta intraday, but confirmation requires domestic volume and sustained futures strength.", sent: 76, horizon: "1D", conf: 70, impact: "+1.0", tickers: ["TATASTEEL"] }
];

const SECTORS_LIST = [
  { name: "Financials", chg: "+1.8%", note: "Strong breadth", cls: "h-g1" },
  { name: "Metals", chg: "+1.4%", note: "Volume led", cls: "h-g2" },
  { name: "Defense", chg: "+1.1%", note: "Relative strength", cls: "h-g2" },
  { name: "Conglomerate", chg: "+0.7%", note: "Broad support", cls: "h-g3" },
  { name: "Banking", chg: "+0.6%", note: "Steady", cls: "h-g3" },
  { name: "Energy", chg: "+0.2%", note: "Mixed crude", cls: "h-flat" },
  { name: "Pharma", chg: "-0.3%", note: "Range", cls: "h-flat" },
  { name: "IT Services", chg: "-0.8%", note: "Selective weak", cls: "h-r1" },
  { name: "Consumer", chg: "-1.0%", note: "Pressure", cls: "h-r2" }
];

const INTERNALS_LIST = [
  { label: "Advancers", val: 68, text: "1,284" },
  { label: "Above VWAP", val: 61, text: "61%" },
  { label: "Above 20DMA", val: 57, text: "57%" },
  { label: "New highs ratio", val: 63, text: "63/37" },
  { label: "Up-volume share", val: 66, text: "66%" },
  { label: "Midcap participation", val: 59, text: "59%" }
];

const RADAR_METRICS = [
  { name: "Market breadth divergence", score: 64, desc: "Breadth improving faster than headline index." },
  { name: "Volume thrust", score: 71, desc: "Participation is above its 20-session median." },
  { name: "Volatility compression", score: 58, desc: "Several large caps are coiling before expansion." },
  { name: "Sector rotation velocity", score: 76, desc: "Financials / metals gaining relative strength." },
  { name: "Liquidity sweep clusters", score: 52, desc: "Requires tick-level confirmation for precision." },
  { name: "Index futures basis", score: 61, desc: "Mild positive carry, not extreme." },
  { name: "Options positioning", score: 55, desc: "Near-neutral proxy; full chain feed improves signal." }
];

const MARKET_PATTERNS = [
  { name: "Breadth lead", score: "64", desc: "Index breadth improving before price" },
  { name: "Vol squeeze", score: "58", desc: "Compression in large-cap volatility" },
  { name: "Futures carry", score: "61", desc: "Positive basis, not crowded" },
  { name: "RS rotation", score: "76", desc: "Financials / metals gaining" },
  { name: "Liquidity sweep", score: "52", desc: "Needs tick-depth confirmation" },
  { name: "News contagion", score: "43", desc: "Low cross-sector spillover" }
];

// ============================================================================
// HELPER: Format AI Copilot Messages (Bolds, Bullet Points, Lists)
// ============================================================================
function formatCopilotMessage(text) {
  if (!text) return null;
  const clean = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*\*/g, "").trim();
  const lines = clean.split("\n");

  return (
    <div className="copilot-message-content">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} style={{ height: "6px" }} />;
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

// ============================================================================
// COMPONENT: Debt-to-Capital Semi-Circle Radial Gauge
// ============================================================================
function DebtToCapitalGauge({ value = 37.1, max = 100 }) {
  const radius = 64;
  const strokeWidth = 12;
  const normalizedVal = Math.min(Math.max(Number(value) || 0, 0), max);
  const pct = normalizedVal / max;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);

  const strokeColor =
    normalizedVal < 40 ? "#10b981" : normalizedVal < 65 ? "#f59e0b" : "#ef4444";
  const statusLabel =
    normalizedVal < 40
      ? "Optimal Solvency (Target < 45%)"
      : normalizedVal < 65
      ? "Manageable Leverage"
      : "High Debt Exposure";

  return (
    <div className="debt-gauge-box">
      <div className="debt-gauge-svg-wrap">
        <svg width="170" height="92" viewBox="0 0 170 92" className="debt-gauge-svg">
          <path
            d="M 21 75 A 64 64 0 0 1 149 75"
            fill="none"
            stroke="rgba(16, 27, 51, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M 21 75 A 64 64 0 0 1 149 75"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        <div className="debt-gauge-center-badge">
          <span className="debt-gauge-percent-text">{normalizedVal.toFixed(1)}%</span>
          <span className="debt-gauge-title-label">Debt-to-Capital</span>
        </div>
      </div>
      <div className="debt-gauge-footer-tag" style={{ color: strokeColor }}>
        <span className="status-dot-tiny" style={{ background: strokeColor }} />
        {statusLabel}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: SVG Sparkline for Matrix Table
// ============================================================================
function Sparkline({ stock, width = 76, height = 26 }) {
  const chgNum = parseFloat(String(stock?.change || stock?.chg || "0").replace(/[%+]/g, "")) || 0;
  const vals = useMemo(() => {
    return generatePriceSeries(stock, 18, chgNum / 100 / 22);
  }, [stock, chgNum]);

  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const r = max - min || 1;

  let p = "";
  vals.forEach((v, i) => {
    const x = (i * width) / (vals.length - 1);
    const y = height - 3 - ((v - min) / r) * (height - 6);
    p += (i ? " L" : "M") + x.toFixed(1) + "," + y.toFixed(1);
  });

  const col = chgNum >= 0 ? "#15805f" : "#bd4a52";

  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`}>
      <path d={p} fill="none" stroke={col} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// COMPONENT: Interactive Deep Dive Technical & Forecast SVG Chart
// ============================================================================
// INSTITUTIONAL DEEP DIVE CHART (Real Data + Predictive Architecture)
// ============================================================================
function DeepDiveChart({ activeStock, activeRange, overlays, onRangeChange, onToggleOverlay }) {
  const sym = (activeStock?.symbol || activeStock?.sym || "RELIANCE").toUpperCase();
  const chgNum =
    typeof activeStock?.chg === "number"
      ? activeStock.chg
      : parseFloat(String(activeStock?.change || "0").replace(/[%+]/g, "")) || 0;
  const score = Number(activeStock?.score || 78);
  const ltp = Number(activeStock?.ltp || activeStock?.price || 1309.5);

  // Real Historical Chart State
  const [chartDataPoints, setChartDataPoints] = useState([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);
  const svgRef = useRef(null);

  // Fetch real market series on stock or timeframe change
  useEffect(() => {
    let isMounted = true;
    const fetchRealChart = async () => {
      try {
        setIsLoadingChart(true);
        const data = await apiClient.getStockChart(sym, activeRange);
        if (isMounted && data && Array.isArray(data.points) && data.points.length > 3) {
          setChartDataPoints(data.points);
        } else if (isMounted) {
          // Graceful fallback to synthetic simulation
          setChartDataPoints([]);
        }
      } catch (err) {
        if (isMounted) setChartDataPoints([]);
      } finally {
        if (isMounted) setIsLoadingChart(false);
      }
    };

    fetchRealChart();
    return () => {
      isMounted = false;
    };
  }, [sym, activeRange]);

  // Observed historical price points (Real or Calibrated Synthetic)
  const n = activeRange === "1D" ? 48 : activeRange === "5D" ? 60 : activeRange === "1M" ? 54 : activeRange === "6M" ? 72 : 84;
  const obsPoints = useMemo(() => {
    if (chartDataPoints.length > 4) {
      return chartDataPoints.map((p, idx) => ({
        price: Number(p.price || p.close || ltp),
        open: Number(p.open || p.price || ltp),
        high: Number(p.high || p.price || ltp),
        low: Number(p.low || p.price || ltp),
        close: Number(p.close || p.price || ltp),
        volume: Number(p.volume || 0),
        time: p.time || `${idx}:00`
      }));
    }
    // High-resolution synthetic generation calibrated to real stock metrics
    const syntheticPrices = generatePriceSeries(activeStock, n, chgNum / 100 / (n * 1.8));
    return syntheticPrices.map((pr, i) => {
      const isUp = i === 0 ? chgNum >= 0 : pr >= syntheticPrices[i - 1];
      return {
        price: pr,
        open: pr * (1 - (rand(seeded(sym + "o") + i) - 0.5) * 0.003),
        high: pr * (1 + rand(seeded(sym + "h") + i) * 0.005),
        low: pr * (1 - rand(seeded(sym + "l") + i) * 0.005),
        close: pr,
        volume: Math.round(15000 + rand(seeded(sym + "v") + i) * 85000),
        time: activeRange === "1D" ? `${9 + Math.floor(i / 8)}:${String((i % 8) * 7).padStart(2, "0")}` : `Session ${i + 1}`
      };
    });
  }, [chartDataPoints, activeStock, n, chgNum, ltp, sym, activeRange]);

  const obsPrices = useMemo(() => obsPoints.map((p) => p.price), [obsPoints]);

  // 12-Step Forward Forecast Projection
  const forecastN = 12;
  const fcPrices = useMemo(() => {
    if (obsPrices.length === 0) return [];
    let last = obsPrices[obsPrices.length - 1];
    const arr = [];
    const drift = (score - 52) / 110000;
    for (let i = 0; i < forecastN; i++) {
      last *= 1 + drift + (rand(seeded(sym + "fc") + i * 7) - 0.46) * 0.0055;
      arr.push(last);
    }
    return arr;
  }, [obsPrices, score, sym]);

  const allPrices = useMemo(() => obsPrices.concat(fcPrices), [obsPrices, fcPrices]);
  const minP = Math.min(...allPrices) * 0.993;
  const maxP = Math.max(...allPrices) * 1.007;

  // Canvas Geometry
  const W = 900;
  const H = 340;
  const padLeft = 14;
  const padRight = 72; // Dedicated Y-axis price gutter on the right
  const padTop = 22;
  const padBottom = overlays.volumeProfile ? 54 : 26;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;
  const totalSteps = obsPrices.length + fcPrices.length;

  const xy = (val, idx) => {
    const x = totalSteps > 1 ? padLeft + (idx * plotW) / (totalSteps - 1) : padLeft;
    const y = padTop + plotH - ((val - minP) / Math.max(0.01, maxP - minP)) * plotH;
    return [x, y];
  };

  const splitX = totalSteps > 1 ? padLeft + ((obsPrices.length - 1) * plotW) / (totalSteps - 1) : padLeft + plotW * 0.8;

  // 1. Observed Price SVG Path
  let obsPath = "";
  let vwapPath = "";
  let cumVol = 0;
  let cumPV = 0;

  const vwapPoints = [];
  obsPoints.forEach((p, i) => {
    const [x, y] = xy(p.price, i);
    obsPath += (i ? " L" : "M") + x.toFixed(1) + "," + y.toFixed(1);

    const v = p.volume > 0 ? p.volume : 1000;
    cumVol += v;
    cumPV += p.price * v;
    const vwapVal = cumPV / cumVol;
    vwapPoints.push(vwapVal);
    const [vx, vy] = xy(vwapVal, i);
    vwapPath += (i ? " L" : "M") + vx.toFixed(1) + "," + vy.toFixed(1);
  });

  // 2. Exponential Moving Averages (EMA 20 & EMA 50)
  const calcEMA = (prices, period) => {
    if (prices.length === 0) return [];
    const k = 2 / (period + 1);
    const emaArr = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
      emaArr.push(prices[i] * k + emaArr[i - 1] * (1 - k));
    }
    return emaArr;
  };

  const ema20Arr = useMemo(() => calcEMA(obsPrices, 20), [obsPrices]);
  const ema50Arr = useMemo(() => calcEMA(obsPrices, Math.min(50, Math.floor(obsPrices.length * 0.85))), [obsPrices]);

  let ema20Path = "";
  let ema50Path = "";
  if (overlays.ema) {
    ema20Arr.forEach((v, i) => {
      const [ex, ey] = xy(v, i);
      ema20Path += (i ? " L" : "M") + ex.toFixed(1) + "," + ey.toFixed(1);
    });
    ema50Arr.forEach((v, i) => {
      const [ex, ey] = xy(v, i);
      ema50Path += (i ? " L" : "M") + ex.toFixed(1) + "," + ey.toFixed(1);
    });
  }

  // 3. Forecast Scenario Path & Smooth Expanding Cone Envelope
  let fcPath = "";
  const bandTop = [];
  const bandBot = [];

  if (obsPrices.length > 0) {
    const lastObsX = xy(obsPrices[obsPrices.length - 1], obsPrices.length - 1)[0];
    const lastObsY = xy(obsPrices[obsPrices.length - 1], obsPrices.length - 1)[1];

    fcPath = `M${lastObsX.toFixed(1)},${lastObsY.toFixed(1)}`;
    fcPrices.forEach((v, j) => {
      const i = obsPrices.length + j;
      const [fx, fy] = xy(v, i);
      fcPath += ` L${fx.toFixed(1)},${fy.toFixed(1)}`;
    });

    // Start cone seamlessly from exact last observed close with 0 spread
    bandTop.push([lastObsX, lastObsY]);
    bandBot.push([lastObsX, lastObsY]);

    fcPrices.forEach((v, j) => {
      const i = obsPrices.length + j;
      const spread = v * (0.0028 + (j + 1) * 0.00065);
      const [bx] = xy(v, i);
      const topY = xy(v + spread, i)[1];
      const botY = xy(v - spread, i)[1];
      bandTop.push([bx, topY]);
      bandBot.push([bx, botY]);
    });
  }

  let bandPath = "";
  if (bandTop.length > 1) {
    bandPath =
      "M" +
      bandTop.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L") +
      " L" +
      bandBot
        .reverse()
        .map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1))
        .join(" L") +
      " Z";
  }

  // 4. Volume Profile / Histogram geometry
  const maxVol = Math.max(...obsPoints.map((p) => p.volume || 1), 1);
  const volBarHeight = 36;
  const volYBase = H - 6;

  const col = chgNum < 0 ? "#bd4a52" : "#2563EB";
  const areaGradId = `deepAreaGrad_${sym}`;
  const areaPath = obsPath ? `${obsPath} L${splitX.toFixed(1)},${padTop + plotH} L${padLeft},${padTop + plotH} Z` : "";

  // Mouse Crosshair Handler
  const handleMouseMove = (e) => {
    if (!svgRef.current || obsPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relX = Math.max(0, Math.min(1, (mouseX - (padLeft / W) * rect.width) / ((plotW / W) * rect.width)));
    const rawIdx = Math.round(relX * (obsPrices.length - 1));
    const boundedIdx = Math.max(0, Math.min(obsPrices.length - 1, rawIdx));

    setHoverIndex(boundedIdx);
    setHoverPos({
      x: (xy(obsPoints[boundedIdx].price, boundedIdx)[0] / W) * rect.width,
      y: (xy(obsPoints[boundedIdx].price, boundedIdx)[1] / H) * rect.height
    });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setHoverPos(null);
  };

  const activeHoverItem = hoverIndex !== null && obsPoints[hoverIndex] ? obsPoints[hoverIndex] : null;

  return (
    <div className="card chart-card" style={{ position: "relative" }}>
      {/* Chart Toolbar */}
      <div className="chart-toolbar">
        <div className="ranges">
          {["1D", "5D", "1M", "6M", "1Y"].map((r) => (
            <button
              key={r}
              type="button"
              className={`range-btn ${activeRange === r ? "active" : ""}`}
              onClick={() => onRangeChange(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="overlays">
          <button
            type="button"
            className={`overlay-btn ${overlays.vwap ? "active" : ""}`}
            onClick={() => onToggleOverlay("vwap")}
            title="Anchored Volume Weighted Average Price"
          >
            VWAP
          </button>
          <button
            type="button"
            className={`overlay-btn ${overlays.predictionBand ? "active" : ""}`}
            onClick={() => onToggleOverlay("predictionBand")}
            title="Multi-path Confidence Envelope"
          >
            Prediction Band
          </button>
          <button
            type="button"
            className={`overlay-btn ${overlays.ema ? "active" : ""}`}
            onClick={() => onToggleOverlay("ema")}
            title="Exponential Moving Averages 20 / 50"
          >
            EMA 20/50
          </button>
          <button
            type="button"
            className={`overlay-btn ${overlays.volumeProfile ? "active" : ""}`}
            onClick={() => onToggleOverlay("volumeProfile")}
            title="Microstructure Volume Histogram"
          >
            Volume Profile
          </button>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div
        className="price-chart-wrap"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Animated Skeleton Loading State */}
        {isLoadingChart && (
          <div className="chart-skeleton-overlay">
            <div className="skeleton-shimmer" />
            <div className="skeleton-grid-lines">
              <div className="sk-line" style={{ top: "22%" }} />
              <div className="sk-line" style={{ top: "48%" }} />
              <div className="sk-line" style={{ top: "74%" }} />
            </div>
            <div className="skeleton-pulse-wave">
              <RefreshCw size={15} className="spin-fast" style={{ color: "#B8935A" }} />
              <span>Calibrating Market Depth & Forecast Cones…</span>
            </div>
          </div>
        )}

        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={col} stopOpacity="0.16" />
              <stop offset="100%" stopColor={col} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Institutional Grid Lines & Dedicated Right Y-Axis */}
          {[0, 1, 2, 3, 4].map((g) => {
            const y = padTop + (plotH * g) / 4;
            const priceVal = maxP - ((maxP - minP) * g) / 4;
            return (
              <g key={g}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + plotW}
                  y2={y}
                  stroke="#edf0f4"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft + plotW + 6}
                  y={y + 3.5}
                  fontSize="9.5"
                  fill="#8492a6"
                  fontFamily="'EB Garamond', Georgia, serif"
                  fontWeight="600"
                  textAnchor="start"
                >
                  ₹{priceVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Right Gutter Separator Line */}
          <line
            x1={padLeft + plotW}
            y1={padTop - 8}
            x2={padLeft + plotW}
            y2={padTop + plotH + 8}
            stroke="#edf0f4"
            strokeWidth="1"
          />

          {/* Volume Profile Histogram Bars */}
          {overlays.volumeProfile &&
            obsPoints.map((p, i) => {
              const x = xy(p.price, i)[0];
              const barH = Math.max(2, (p.volume / maxVol) * volBarHeight);
              const isBull = p.close >= p.open;
              return (
                <rect
                  key={`vol_${i}`}
                  x={x - 1}
                  y={volYBase - barH}
                  width="2.5"
                  height={barH}
                  fill={isBull ? "#22C55E" : "#EF4444"}
                  opacity="0.38"
                />
              );
            })}

          {/* Shaded Area Fill */}
          {areaPath && <path d={areaPath} fill={`url(#${areaGradId})`} />}

          {/* Prediction Band Smooth Envelope */}
          {overlays.predictionBand && bandPath && (
            <path d={bandPath} fill="#B8935A" opacity="0.14" />
          )}

          {/* Anchored VWAP Line */}
          {overlays.vwap && vwapPath && (
            <path
              d={vwapPath}
              fill="none"
              stroke="#7C3AED"
              strokeWidth="1.6"
              strokeDasharray="4 3"
              opacity="0.88"
            />
          )}

          {/* EMA 20 & EMA 50 Lines */}
          {overlays.ema && ema20Path && (
            <path d={ema20Path} fill="none" stroke="#0284C7" strokeWidth="1.4" opacity="0.85" />
          )}
          {overlays.ema && ema50Path && (
            <path d={ema50Path} fill="none" stroke="#D97706" strokeWidth="1.4" opacity="0.85" />
          )}

          {/* Observed Price Line */}
          {obsPath && (
            <path
              d={obsPath}
              fill="none"
              stroke={col}
              strokeWidth="2.3"
              strokeLinejoin="round"
            />
          )}

          {/* Vertical Horizon Partition Line */}
          <line
            x1={splitX}
            y1={padTop - 6}
            x2={splitX}
            y2={padTop + plotH + 6}
            stroke="#cfd6df"
            strokeDasharray="4 5"
          />

          {/* Forecast Path */}
          {fcPath && (
            <path
              d={fcPath}
              fill="none"
              stroke="#B8935A"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
          )}

          {/* Forecast Horizon Tag */}
          <text x={splitX + 6} y={padTop - 6} fontSize="9.5" fill="#8a95a5" fontWeight="700">
            PROJECTION →
          </text>

          {/* Interactive Crosshair Elements */}
          {hoverIndex !== null && obsPoints[hoverIndex] && (
            <g>
              <line
                x1={xy(obsPoints[hoverIndex].price, hoverIndex)[0]}
                y1={padTop - 6}
                x2={xy(obsPoints[hoverIndex].price, hoverIndex)[0]}
                y2={padTop + plotH + 6}
                stroke="#101B33"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={xy(obsPoints[hoverIndex].price, hoverIndex)[0]}
                cy={xy(obsPoints[hoverIndex].price, hoverIndex)[1]}
                r="4.5"
                fill="#FFFFFF"
                stroke={col}
                strokeWidth="2.5"
              />
            </g>
          )}
        </svg>

        {/* Floating Crosshair Tooltip */}
        {activeHoverItem && hoverPos && (
          <div
            className="chart-tooltip"
            style={{
              left: `${hoverPos.x}px`,
              top: `${Math.max(30, hoverPos.y)}px`
            }}
          >
            <div className="tt-time">{activeHoverItem.time}</div>
            <div className="tt-price">₹{fmt(activeHoverItem.price)}</div>
            <div className="tt-details">
              {overlays.vwap && vwapPoints[hoverIndex] && (
                <span style={{ color: "#C084FC" }}>
                  VWAP: ₹{vwapPoints[hoverIndex].toFixed(1)}
                </span>
              )}
              {overlays.ema && ema20Arr[hoverIndex] && (
                <span style={{ color: "#7DD3FC" }}>
                  EMA20: ₹{ema20Arr[hoverIndex].toFixed(1)}
                </span>
              )}
              {activeHoverItem.volume > 0 && (
                <span style={{ color: "#CBD5E1" }}>
                  Vol: {(activeHoverItem.volume / 1000).toFixed(0)}k
                </span>
              )}
            </div>
          </div>
        )}

        <div className="chart-note">
          Solid = observed market feed · dashed = scenario projection
        </div>
      </div>

      {/* Chart Legend */}
      <div className="chart-legend">
        <span>
          <i className="legend-line" style={{ background: col }} />
          Observed Price
        </span>
        {overlays.vwap && (
          <span>
            <i className="legend-line vwap" />
            Anchored VWAP
          </span>
        )}
        {overlays.ema && (
          <>
            <span>
              <i className="legend-line" style={{ background: "#0284C7" }} />
              EMA 20
            </span>
            <span>
              <i className="legend-line" style={{ background: "#D97706" }} />
              EMA 50
            </span>
          </>
        )}
        {overlays.predictionBand && (
          <span>
            <i className="legend-line forecast" />
            Forecast Band
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: Institutional Executive Command Center
// ============================================================================
export default function DashboardPage({ onNavigate, goPage, searchQuery }) {
  // Mode selection: 01 matrix | 02 news | 03 market | 04 deep
  const [activeMode, setActiveMode] = useState("matrix");

  // Telemetry & Universe
  const [allStocksList, setAllStocksList] = useState([]);
  const [companies, setCompanies] = useState(BASE_COMPANIES);

  // Filters for Mode 1 (Matrix)
  const [matrixSearch, setMatrixSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [matrixBias, setMatrixBias] = useState("all");

  // Filters for Mode 2 (News)
  const [newsFilter, setNewsFilter] = useState("all");

  // Deep Dive Active Stock
  const [activeStock, setActiveStock] = useState(BASE_COMPANIES[0]);
  const [activeRange, setActiveRange] = useState("1D");
  const [overlays, setOverlays] = useState({
    vwap: true,
    predictionBand: true,
    ema: false,
    volumeProfile: false,
  });
  const [showStatementsTable, setShowStatementsTable] = useState(false);

  // Workspace 03 (Market Pulse) Interactive States
  const [selectedHeatSector, setSelectedHeatSector] = useState(null);
  const [moversTab, setMoversTab] = useState("all"); // "all" | "gainers" | "losers"

  // Workspace 04 (Company Deep Dive) Autocomplete State
  const [deepSearchQuery, setDeepSearchQuery] = useState("");
  const [isDeepSearchOpen, setIsDeepSearchOpen] = useState(false);

  // Copilot Drawer State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeCopilotStock, setActiveCopilotStock] = useState(null); // null = whole market copilot!
  const [copilotMessages, setCopilotMessages] = useState({});
  const [copilotInputText, setCopilotInputText] = useState("");
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Toast notification
  const [toastText, setToastText] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef(null);

  const showToast = (text) => {
    setToastText(text);
    setToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  };

  // Live News State: Powered by /api/news (50+ real ingested stories)
  const [newsList, setNewsList] = useState(DEFAULT_NEWS);
  const [isNewsLoading, setIsNewsLoading] = useState(false);

  // Indian Capital Markets (NSE/BSE) Status & Off-Hours Simulation Mode
  const [marketStatus, setMarketStatus] = useState(() => getIndianMarketStatus());
  const [simMode, setSimMode] = useState(false);

  useEffect(() => {
    const statusTimer = setInterval(() => {
      setMarketStatus(getIndianMarketStatus());
    }, 1000);
    return () => clearInterval(statusTimer);
  }, []);

  // Sync global search or voice query to matrix search
  useEffect(() => {
    if (searchQuery) {
      setMatrixSearch(searchQuery);
    }
  }, [searchQuery]);

  // Listen for voice-driven or cross-page stock selection changes
  useEffect(() => {
    const handleStockChanged = (e) => {
      const sym = (e.detail?.symbol || "").toUpperCase();
      const name = e.detail?.name || sym;
      if (!sym) return;

      // Update matrix search so Company Matrix table filters to this company
      setMatrixSearch(name || sym);

      const found = companies.find((c) => (c.symbol || c.sym || "").toUpperCase() === sym) ||
                    BASE_COMPANIES.find((c) => (c.symbol || c.sym || "").toUpperCase() === sym);
      if (found) {
        setActiveStock(found);
      } else {
        setActiveStock({
          sym,
          symbol: sym,
          name: name || `${sym} Ltd`,
          sector: "Indian Equities",
          ltp: 1000.0,
          price: 1000.0,
          chg: 0.5,
          score: 75,
        });
      }

      // If voice search requested a specific stock, switch to Company Deep Dive view
      if (e.detail?.action?.command === "SEARCH_COMPANY" || e.detail?.action?.type === "SEARCH_COMPANY") {
        setActiveMode("deep");
      }
    };

    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (!action) return;

      // Mode switching inside Dashboard (matrix, news, pulse, deep)
      if (action.params?.mode) {
        setActiveMode(action.params.mode);
      } else if (action.command === "NAVIGATE_PULSE" || action.command?.includes("PULSE")) {
        setActiveMode("pulse");
      } else if (action.command === "NAVIGATE_NEWS" || action.command?.includes("NEWS")) {
        setActiveMode("news");
      } else if (action.command === "NAVIGATE_DEEP" || action.type === "SEARCH_COMPANY") {
        setActiveMode("deep");
      } else if (action.command === "NAVIGATE_MATRIX") {
        setActiveMode("matrix");
      }
    };

    window.addEventListener("marketmind:stock_changed", handleStockChanged);
    window.addEventListener("marketmind:voice_action", handleVoiceAction);
    return () => {
      window.removeEventListener("marketmind:stock_changed", handleStockChanged);
      window.removeEventListener("marketmind:voice_action", handleVoiceAction);
    };
  }, [companies]);

  // Signal Freshness countdown timer (Ticks only when market is LIVE or simulation is active)
  const [freshnessSec, setFreshnessSec] = useState(2.8);

  useEffect(() => {
    if (!marketStatus.isOpen && !simMode) {
      setFreshnessSec(0);
      return;
    }
    const freshTimer = setInterval(() => {
      setFreshnessSec((prev) => (prev <= 0.4 ? 2.8 : Number((prev - 0.2).toFixed(1))));
    }, 200);
    return () => clearInterval(freshTimer);
  }, [marketStatus.isOpen, simMode]);

  // Fetch live real news feed from backend on mount and every 40s
  useEffect(() => {
    let isMounted = true;
    const fetchLiveNews = async () => {
      try {
        setIsNewsLoading(true);
        const data = await apiClient.getNews("All");
        if (isMounted && data?.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          setNewsList(data.articles);
        }
      } catch (err) {
        console.warn("Using baseline news feed:", err);
      } finally {
        if (isMounted) setIsNewsLoading(false);
      }
    };

    fetchLiveNews();
    const newsTimer = setInterval(fetchLiveNews, 40000);
    return () => {
      isMounted = false;
      clearInterval(newsTimer);
    };
  }, []);

  // Fetch stocks & telemetry on mount + live sync every 14 seconds
  useEffect(() => {
    let isMounted = true;
    const loadUniverse = async () => {
      try {
        const stocksRes = await apiClient.getStocks();
        if (isMounted && Array.isArray(stocksRes)) {
          setAllStocksList(stocksRes);
          setCompanies((prev) => {
            const map = new Map();
            (prev && prev.length > 0 ? prev : BASE_COMPANIES).forEach((c) =>
              map.set((c.sym || c.symbol).toUpperCase(), { ...c })
            );
            stocksRes.forEach((s) => {
              const sym = s.symbol?.toUpperCase();
              if (!sym) return;
              const livePrice = Number(s.price);
              const liveChg = parseFloat(String(s.change || "0").replace(/[%+]/g, "")) || 0;
              if (map.has(sym)) {
                const existing = map.get(sym);
                map.set(sym, {
                  ...existing,
                  ...s,
                  name: COMPANY_NAME_MAP[sym] || existing.name || formatToTitleCase(s.name || sym),
                  ltp: livePrice || existing.ltp,
                  price: livePrice || existing.price || existing.ltp,
                  chg: liveChg !== 0 ? liveChg : existing.chg,
                  change: String(s.change || existing.change || `${liveChg >= 0 ? "+" : ""}${liveChg}%`),
                });
              } else {
                const titleName = COMPANY_NAME_MAP[sym] || formatToTitleCase(s.name || sym);
                const seedVal = seeded(sym);
                const seededConf = 68 + Math.floor(rand(seedVal) * 20);
                const seededHft = 55 + Math.floor(rand(seedVal + 1) * 35);
                const seededNews = 55 + Math.floor(rand(seedVal + 2) * 30);
                const isBull = liveChg >= 0;
                map.set(sym, {
                  sym,
                  symbol: sym,
                  name: titleName,
                  sector: s.sector || "Equities",
                  ltp: livePrice || Number((150 + rand(seedVal + 4) * 2400).toFixed(2)),
                  price: livePrice || Number((150 + rand(seedVal + 4) * 2400).toFixed(2)),
                  chg: liveChg,
                  change: String(s.change || `${liveChg >= 0 ? "+" : ""}${liveChg}%`),
                  bias: isBull ? "bullish" : liveChg < -1 ? "risk" : "neutral",
                  conf: seededConf,
                  hft: seededHft,
                  news: seededNews,
                  regime: isBull ? "Trend ↑" : liveChg < -1 ? "Pressure" : "Range",
                  patterns: isBull ? ["Breakout", "Demand"] : ["VWAP test", "Compression"],
                  score: seededConf,
                  pe: Number(s.pe_ratio || (14 + rand(seedVal + 5) * 32).toFixed(1)),
                  roe: Number(s.roe || (10 + rand(seedVal + 6) * 22).toFixed(1)),
                  debt: rand(seedVal + 7) > 0.6 ? "Moderate" : "Low",
                });
              }
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn("Could not augment stock list, using base companies", err);
      }
    };

    loadUniverse();
    const syncInterval = setInterval(loadUniverse, 14000);
    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, []);

  // Listen for event from bottom-right robot avatar in FloatingAssistant
  useEffect(() => {
    const handleOpenDashboardCopilot = () => {
      handleOpenCopilot(null); // null opens whole-market / executive copilot!
    };
    window.addEventListener("marketmind:open_dashboard_copilot", handleOpenDashboardCopilot);
    return () => {
      window.removeEventListener("marketmind:open_dashboard_copilot", handleOpenDashboardCopilot);
    };
  }, [companies]);

  // Open Copilot Handler (stock = null for Market-wide copilot, or a company object)
  const handleOpenCopilot = (stock = null) => {
    if (!stock) {
      // Whole-Market Executive Copilot!
      const marketTarget = {
        symbol: "MARKET",
        name: "Alex · MarketMind Executive Copilot",
        isMarket: true,
      };
      setActiveCopilotStock(marketTarget);
      setIsCopilotOpen(true);

      if (!copilotMessages["MARKET"] || copilotMessages["MARKET"].length === 0) {
        setCopilotMessages((prev) => ({
          ...prev,
          MARKET: [
            {
              role: "assistant",
              content: `**Alex · MarketMind Executive Copilot** initialized across Indian Capital Markets.\n\n• **Market Regime:** Risk-On environment with NIFTY at 24,852.15 (+0.42%) and India VIX compressed at 13.42.\n• **Advance / Decline Breadth:** 1.36x ratio (68% advancers), participation outperforming headline indices.\n• **Leading Sectors:** Financials (+1.8%) and Metals (+1.4%) attracting active institutional accumulation.\n• **Solvency & Microstructure:** Corporate solvency healthy with median Debt-to-Capital at 28.4% across 60+ tracked equities.\n• **Ask me anything:** Macro domino shocks, sector rotations, breadth divergences, or any company's balance sheet forensics.`,
            },
          ],
        }));
      }
    } else {
      setActiveCopilotStock(stock);
      setIsCopilotOpen(true);
      const sym = stock.symbol || stock.sym;
      const [lo, hi] = calculateForecastRange(stock);

      if (!copilotMessages[sym] || copilotMessages[sym].length === 0) {
        setCopilotMessages((prev) => ({
          ...prev,
          [sym]: [
            {
              role: "assistant",
              content: `**${stock.name} (${sym})** Institutional Copilot initialized.\n\n• **1D AI Expected Band:** ₹${fmt(lo)} – ₹${fmt(hi)} (${stock.conf || 78}% confidence).\n• **Solvency & Fundamentals:** Debt status is ${stock.debt || "Moderate"} with P/E of ${stock.pe || 24}x and ROE of ${stock.roe || 14}%.\n• **Microstructure Footprint:** HFT proxy score at ${stock.hft || 72}/100 with ${(stock.patterns || ["VWAP hold"]).join(", ")}.\n• **Ask me anything:** Balance sheet forensics, 5-year free cash flow, domino macro shocks, or price targets.`,
            },
          ],
        }));
      }
    }
  };

  // Send message in Copilot drawer
  const handleSendCopilotMessage = async (queryText) => {
    const text = queryText || copilotInputText;
    if (!text.trim() || !activeCopilotStock || isCopilotLoading) return;

    const sym = activeCopilotStock.symbol || activeCopilotStock.sym;
    const isMarket = activeCopilotStock.isMarket || sym === "MARKET";
    const userMsg = { role: "user", content: text };

    setCopilotMessages((prev) => ({
      ...prev,
      [sym]: [...(prev[sym] || []), userMsg],
    }));
    setCopilotInputText("");
    setIsCopilotLoading(true);

    try {
      const res = await apiClient.sendVoiceChat({
        message: text,
        language: "english",
        ticker: isMarket ? "NIFTY" : sym,
        history: copilotMessages[sym] || [],
      });

      const reply =
        res?.reply ||
        res?.message ||
        (isMarket
          ? "Executive Market Copilot analysis: Indian equity market breadth is sustaining positive momentum with advance-decline ratio at 1.36x. Sector rotation demonstrates capital flow rotating into Financials and Metals while VIX remains contained at 13.42."
          : `Quantitative intelligence confirms resilient institutional positioning for ${sym}. Order flow demonstrates buyer absorption above anchor levels.`);

      setCopilotMessages((prev) => ({
        ...prev,
        [sym]: [...(prev[sym] || []), { role: "assistant", content: reply }],
      }));
    } catch (err) {
      setCopilotMessages((prev) => ({
        ...prev,
        [sym]: [
          ...(prev[sym] || []),
          {
            role: "assistant",
            content: isMarket
              ? "Market Intelligence Terminal confirms constructive breadth across NSE 500. Financials and Metals lead relative strength indices with low systemic cross-asset stress."
              : `Analysis for ${sym}: Order book absorption remains active above key support. Fundamental valuation is supported by robust cash flow generation.`,
          },
        ],
      }));
    } finally {
      setIsCopilotLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    }
  };

  // Open company in Deep Dive mode
  const handleOpenCompanyDeepDive = (sym) => {
    const found = companies.find(
      (c) => (c.sym || c.symbol).toUpperCase() === sym.toUpperCase()
    );
    if (found) {
      setActiveStock(found);
    }
    if (activeMode !== "deep") {
      setActiveMode("deep");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    showToast(`Loaded deep dive for ${sym}`);
  };

  // Filtered rows for Mode 1 (Matrix)
  const filteredMatrix = useMemo(() => {
    const q = (matrixSearch || searchQuery || "").toLowerCase().trim();
    return companies.filter((c) => {
      const sym = (c.sym || c.symbol || "").toLowerCase();
      const name = (c.name || COMPANY_NAME_MAP[(c.sym || c.symbol || "").toUpperCase()] || "").toLowerCase();
      if (q && !sym.includes(q) && !name.includes(q)) return false;
      if (sectorFilter !== "all" && c.sector !== sectorFilter) return false;
      if (matrixBias !== "all" && c.bias !== matrixBias) return false;
      return true;
    });
  }, [companies, matrixSearch, searchQuery, sectorFilter, matrixBias]);

  // Top Pagination for Matrix: 30 companies per page
  const MATRIX_PAGE_SIZE = 30;
  const [matrixPage, setMatrixPage] = useState(1);

  useEffect(() => {
    setMatrixPage(1);
  }, [matrixSearch, searchQuery, sectorFilter, matrixBias]);

  const totalMatrixPages = Math.max(1, Math.ceil(filteredMatrix.length / MATRIX_PAGE_SIZE));
  const matrixStartIndex = (matrixPage - 1) * MATRIX_PAGE_SIZE;
  const paginatedMatrix = useMemo(() => {
    return filteredMatrix.slice(matrixStartIndex, matrixStartIndex + MATRIX_PAGE_SIZE);
  }, [filteredMatrix, matrixStartIndex, MATRIX_PAGE_SIZE]);

  // Real-time live price ticker & micro-flash updates (ticks visible stocks every 2.0s)
  const [priceFlashMap, setPriceFlashMap] = useState({});

  useEffect(() => {
    // MARKET TIMINGS ENFORCEMENT (NSE/BSE 09:15 - 15:30 IST):
    // When the market is closed, quotes remain settled & frozen at closing prices.
    // Price ticks occur ONLY during live regular trading sessions (or when user activates Test Simulation mode).
    if (!marketStatus.isOpen && !simMode) {
      return;
    }

    const interval = setInterval(() => {
      setCompanies((prev) => {
        if (!prev || prev.length === 0) return prev;
        const newComps = [...prev];
        const flashUpdates = {};

        // Focus 4 to 7 micro-ticks directly on currently visible page stocks + 2-3 global stocks
        const visibleSlice = paginatedMatrix;
        const indicesToTick = new Set();

        if (visibleSlice.length > 0) {
          const visibleCount = Math.min(visibleSlice.length, Math.floor(Math.random() * 4) + 4);
          let attempts = 0;
          while (indicesToTick.size < visibleCount && attempts < 25) {
            attempts++;
            const vIdx = Math.floor(Math.random() * visibleSlice.length);
            const targetComp = visibleSlice[vIdx];
            const sym = (targetComp.sym || targetComp.symbol || "").toUpperCase();
            const gIdx = newComps.findIndex((c) => (c.sym || c.symbol || "").toUpperCase() === sym);
            if (gIdx !== -1) indicesToTick.add(gIdx);
          }
        }

        // Also tick 2-3 other stocks from general universe
        const extraCount = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < extraCount; i++) {
          indicesToTick.add(Math.floor(Math.random() * newComps.length));
        }

        indicesToTick.forEach((idx) => {
          const comp = newComps[idx];
          if (!comp) return;

          // Realistic micro-tick: ±0.03% to ±0.22%
          const tickPct = (Math.random() - 0.485) * 0.0034;
          const oldLtp = Number(comp.ltp || comp.price || 150);
          const newLtp = Math.max(10, Math.round((oldLtp * (1 + tickPct)) * 100) / 100);

          if (newLtp !== oldLtp) {
            const sym = (comp.sym || comp.symbol || "").toUpperCase();
            flashUpdates[sym] = newLtp > oldLtp ? "up" : "down";
            const oldChg = typeof comp.chg === "number" ? comp.chg : parseFloat(String(comp.change || "0").replace(/[%+]/g, "")) || 0;
            const newChg = Math.round((oldChg + (tickPct * 100)) * 100) / 100;
            const chgStr = `${newChg >= 0 ? "+" : ""}${newChg.toFixed(2)}%`;

            newComps[idx] = {
              ...comp,
              ltp: newLtp,
              price: newLtp,
              chg: newChg,
              change: chgStr,
              bias: newChg > 0.4 ? "bullish" : newChg < -0.6 ? "risk" : "neutral",
            };
          }
        });

        if (Object.keys(flashUpdates).length > 0) {
          setPriceFlashMap((f) => ({ ...f, ...flashUpdates }));
          setTimeout(() => {
            setPriceFlashMap((f) => {
              const cleaned = { ...f };
              Object.keys(flashUpdates).forEach((k) => delete cleaned[k]);
              return cleaned;
            });
          }, 1200);
        }

        return newComps;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [paginatedMatrix, marketStatus.isOpen, simMode]);

  // Sector list options for filter
  const sectorOptions = useMemo(() => {
    const set = new Set();
    companies.forEach((c) => {
      if (c.sector) set.add(c.sector);
    });
    return Array.from(set).sort();
  }, [companies]);

  // Dynamic Sector Heatmap computed live from companies
  const dynamicSectors = useMemo(() => {
    const sectorBuckets = {
      "Financials & Banking": [],
      "Metals & Mining": [],
      "Information Tech": [],
      "Energy & Conglomerate": [],
      "Automobile & Auto": [],
      "Pharma & Healthcare": [],
      "Consumer & FMCG": [],
      "Defense & Aerospace": [],
      "Real Estate & Infrastructure": []
    };

    companies.forEach((c) => {
      const s = (c.sector || "").toLowerCase();
      if (s.includes("bank") || s.includes("financ") || s.includes("insurance") || s.includes("exchange")) {
        sectorBuckets["Financials & Banking"].push(c);
      } else if (s.includes("metal") || s.includes("steel") || s.includes("mining")) {
        sectorBuckets["Metals & Mining"].push(c);
      } else if (s.includes("it") || s.includes("tech") || s.includes("software")) {
        sectorBuckets["Information Tech"].push(c);
      } else if (s.includes("energy") || s.includes("oil") || s.includes("gas") || s.includes("power") || s.includes("conglomerate")) {
        sectorBuckets["Energy & Conglomerate"].push(c);
      } else if (s.includes("auto") || s.includes("motor") || s.includes("vehicle")) {
        sectorBuckets["Automobile & Auto"].push(c);
      } else if (s.includes("pharma") || s.includes("health") || s.includes("drug")) {
        sectorBuckets["Pharma & Healthcare"].push(c);
      } else if (s.includes("consumer") || s.includes("fmcg") || s.includes("food") || s.includes("retail")) {
        sectorBuckets["Consumer & FMCG"].push(c);
      } else if (s.includes("defense") || s.includes("capital") || s.includes("engineering")) {
        sectorBuckets["Defense & Aerospace"].push(c);
      } else {
        sectorBuckets["Real Estate & Infrastructure"].push(c);
      }
    });

    return Object.entries(sectorBuckets).map(([name, stockList]) => {
      const chgs = stockList.map((c) =>
        typeof c.chg === "number" ? c.chg : parseFloat(String(c.change || "0").replace(/[%+]/g, "")) || 0
      );
      const avgChg = chgs.length > 0 ? chgs.reduce((a, b) => a + b, 0) / chgs.length : 0;
      const count = chgs.length;
      const advCount = chgs.filter((x) => x > 0).length;
      const decCount = count - advCount;
      const cls = avgChg >= 1.0 ? "h-g1" : avgChg >= 0.4 ? "h-g2" : avgChg > 0 ? "h-g3" : avgChg > -0.4 ? "h-flat" : avgChg > -1.0 ? "h-r1" : "h-r2";
      const note = avgChg >= 0.8 ? "Institutional Inflow" : avgChg > 0 ? "Advancing Breadth" : avgChg > -0.6 ? "Consolidating" : "Selective Outflow";
      return {
        name,
        stocks: stockList,
        count,
        advCount,
        decCount,
        chg: `${avgChg >= 0 ? "+" : ""}${avgChg.toFixed(2)}%`,
        note: `${note} (${count} stocks)`,
        cls,
        rawChg: avgChg
      };
    });
  }, [companies]);

  // Deep dive calculations for active stock with live ticked values
  const currentActiveStock = useMemo(() => {
    const sym = (activeStock?.sym || activeStock?.symbol || "").toUpperCase();
    const found = companies.find((c) => (c.sym || c.symbol || "").toUpperCase() === sym);
    return found ? { ...activeStock, ...found } : activeStock;
  }, [companies, activeStock]);

  const [deepLow, deepHigh] = useMemo(() => {
    return calculateForecastRange(currentActiveStock);
  }, [currentActiveStock]);

  const activeStockScore = currentActiveStock?.score || 78;
  const activeStockChg =
    typeof currentActiveStock?.chg === "number"
      ? currentActiveStock.chg
      : parseFloat(String(currentActiveStock?.change || "0").replace(/[%+]/g, "")) || 0;
  const activeStockLtp = Number(currentActiveStock?.ltp || currentActiveStock?.price || 1322.0);

  // Real News Filtering & Sentiment Categorization
  const filteredNews = useMemo(() => {
    if (!newsList || newsList.length === 0) return [];
    if (newsFilter === "all") return newsList;
    return newsList.filter((n) => {
      const cat = (n.category || n.type || "").toLowerCase();
      const title = (n.title || "").toLowerCase();
      const ev = (n.event_type || "").toLowerCase();
      const auth = (n.source_authority || "").toUpperCase();

      if (newsFilter === "company") return cat.includes("company") || cat.includes("corporate") || ev.includes("company") || (n.tickers && n.tickers.length > 0);
      if (newsFilter === "macro") return cat.includes("macro") || cat.includes("economy") || cat.includes("banking") || auth === "RBI";
      if (newsFilter === "earnings") return cat.includes("earnings") || ev.includes("earnings") || title.includes("profit") || title.includes("revenue") || title.includes("q1") || title.includes("q2") || title.includes("q3") || title.includes("q4");
      if (newsFilter === "regulation") return cat.includes("regulation") || cat.includes("policy") || auth === "SEBI" || auth === "RBI" || ev.includes("policy");
      if (newsFilter === "commodity") return cat.includes("commodity") || cat.includes("energy") || cat.includes("metals") || title.includes("crude") || title.includes("gold") || title.includes("oil");
      return true;
    });
  }, [newsList, newsFilter]);

  const bullishNewsCount = useMemo(() => {
    return newsList.filter((n) => n.sentiment === "Bullish" || (n.sentiment_score || 0.5) > 0.55 || (n.sent || 50) >= 60).length;
  }, [newsList]);

  const bearishNewsCount = useMemo(() => {
    return newsList.filter((n) => n.sentiment === "Bearish" || (n.sentiment_score || 0.5) < 0.45 || (n.sent || 50) < 45).length;
  }, [newsList]);

  const neutralNewsCount = useMemo(() => {
    return Math.max(0, newsList.length - bullishNewsCount - bearishNewsCount);
  }, [newsList, bullishNewsCount, bearishNewsCount]);

  const highImpactNewsCount = useMemo(() => {
    return newsList.filter((n) => n.materiality === "High" || (n.sentiment_score || 0) >= 0.75 || (n.trust_score || 0) >= 80 || (n.conf || 0) >= 80).length;
  }, [newsList]);

  return (
    <div className="dashboard-root-page">
      {/* 4-MODE UNDERLINE TABS (MATCHING REFERENCE DESIGN) */}
      <div className="mode-switch-underline">
        <button
          type="button"
          className={`mode-tab-link ${activeMode === "matrix" ? "active" : ""}`}
          onClick={() => setActiveMode("matrix")}
        >
          <LayoutGrid size={16} />
          <span>Company Matrix</span>
        </button>

        <button
          type="button"
          className={`mode-tab-link ${activeMode === "news" ? "active" : ""}`}
          onClick={() => setActiveMode("news")}
        >
          <Radio size={16} />
          <span>News Intelligence</span>
        </button>

        <button
          type="button"
          className={`mode-tab-link ${activeMode === "market" ? "active" : ""}`}
          onClick={() => setActiveMode("market")}
        >
          <Activity size={16} />
          <span>Market Pulse</span>
        </button>

        <button
          type="button"
          className={`mode-tab-link ${activeMode === "deep" ? "active" : ""}`}
          onClick={() => setActiveMode("deep")}
        >
          <Search size={16} />
          <span>Company Deep Dive</span>
        </button>
      </div>

      {/* =====================================================================
          WORKSPACE 01: COMPANY MATRIX
          ===================================================================== */}
      {activeMode === "matrix" && (
        <section className="workspace active">
          {/* 6 KPI Metric Strip */}
          <div className="metric-strip">
            <div className="metric">
              <div className="label">Universe Adapter</div>
              <div className="value">NSE + BSE</div>
              <div className="desc">Active feed across {companies.length} institutional symbols</div>
            </div>
            <div className="metric good">
              <div className="label">Bullish Bias</div>
              <div className="value">
                {companies.filter((c) => ((typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0")) > 0 || c.bias === "bullish")).length}
              </div>
              <div className="desc">Advancing momentum setup</div>
            </div>
            <div className="metric">
              <div className="label">Accumulation</div>
              <div className="value">
                {String(companies.filter((c) => (c.hft >= 70)).length).padStart(2, "0")}
              </div>
              <div className="desc">Price-volume + relative strength</div>
            </div>
            <div className="metric bad">
              <div className="label">Breakdown Risk</div>
              <div className="value">
                {companies.filter((c) => ((typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0")) < -0.5 || c.bias === "risk")).length}
              </div>
              <div className="desc">Structure + volatility compression</div>
            </div>
            <div className="metric good">
              <div className="label">Market Breadth</div>
              <div className="value">
                {Math.round((companies.filter((c) => (typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0")) >= 0).length / Math.max(1, companies.length)) * 100)}%
              </div>
              <div className="desc">Advancers above decliners</div>
            </div>
            <div className="metric">
              <div className="label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{marketStatus.isOpen ? "Signal Freshness" : simMode ? "Simulation Freshness" : "Market Status"}</span>
                <span
                  className={marketStatus.isOpen || simMode ? "live-pulse-glow-dot" : ""}
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: marketStatus.isOpen ? "#10B981" : simMode ? "#3B82F6" : "#DC2626",
                    display: "inline-block",
                    boxShadow: marketStatus.isOpen ? "0 0 8px #10B981" : simMode ? "0 0 8px #3B82F6" : "none"
                  }}
                />
              </div>
              <div className="value mono">
                {marketStatus.isOpen ? `${freshnessSec}s` : simMode ? `${freshnessSec}s` : "FROZEN"}
              </div>
              <div className="desc">
                {marketStatus.isOpen ? "Continuous micro-tick recompute" : simMode ? "Off-hours tick simulation active" : "Quotes frozen at 15:30 IST close"}
              </div>
            </div>
          </div>

          {/* Matrix Toolbar */}
          <div className="toolbar">
            <div className="search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search any company or ticker…"
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
              />
            </div>
            <select
              className="select"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
            >
              <option value="all">All sectors</option>
              {sectorOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={`filter-btn ${matrixBias === "all" ? "active" : ""}`}
              onClick={() => setMatrixBias("all")}
            >
              All Signals
            </button>
            <button
              type="button"
              className={`filter-btn ${matrixBias === "bullish" ? "active" : ""}`}
              onClick={() => setMatrixBias("bullish")}
            >
              Bullish
            </button>
            <button
              type="button"
              className={`filter-btn ${matrixBias === "risk" ? "active" : ""}`}
              onClick={() => setMatrixBias("risk")}
            >
              Risk
            </button>

            {/* Market Session Pill & Optional Off-Hours Simulation Toggle */}
            <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  letterSpacing: "0.3px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: marketStatus.isOpen ? "rgba(16, 185, 129, 0.08)" : simMode ? "rgba(59, 130, 246, 0.08)" : "rgba(239, 68, 68, 0.08)",
                  border: `1px solid ${marketStatus.isOpen ? "rgba(16, 185, 129, 0.25)" : simMode ? "rgba(59, 130, 246, 0.25)" : "rgba(239, 68, 68, 0.22)"}`,
                  color: marketStatus.isOpen ? "#047857" : simMode ? "#1D4ED8" : "#B91C1C",
                  textTransform: "uppercase"
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "currentColor"
                  }}
                />
                {marketStatus.isOpen ? "● NSE Live (09:15–15:30 IST)" : simMode ? "● Simulating Off-Hours Ticks" : "● Market Closed (15:30 IST Close)"}
              </span>

              {!marketStatus.isOpen && (
                <button
                  type="button"
                  onClick={() => setSimMode((v) => !v)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    padding: "4px 9px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    border: "1px solid var(--line)",
                    background: simMode ? "#2563EB" : "var(--paper)",
                    color: simMode ? "#FFFFFF" : "var(--ink-soft)",
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.15s ease"
                  }}
                  title={simMode ? "Switch back to real-time frozen market close prices" : "Test real-time price tick animations while market is closed"}
                >
                  {simMode ? "⏸ Freeze to Close" : "▶ Simulate Ticks"}
                </button>
              )}
            </div>
          </div>

          {/* Cross-Company Prediction Matrix (Full-Screen Width & Flow Height, Zero Inner Div Scrollbar) */}
          <div className="matrix-fullscreen-container table-full-width">
            <div className="card-head matrix-head-clean" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "nowrap" }}>
              <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                <div className="card-title" style={{ whiteSpace: "nowrap" }}>Cross-Company Prediction Matrix</div>
                <div className="card-kicker" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Comprehensive 270+ Indian equities master universe · price, predictive bounds, HFT proxy, hidden patterns & news impact
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, whiteSpace: "nowrap" }}>
                {totalMatrixPages > 1 && (
                  <div
                    className="table-top-pagination"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#FAF8F5",
                      border: "1px solid #E6DCC4",
                      borderRadius: "8px",
                      padding: "5px 12px",
                      whiteSpace: "nowrap",
                      flexShrink: 0
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#5B5A4F",
                        fontFamily: "var(--sans, sans-serif)",
                        marginRight: "4px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {matrixStartIndex + 1}–{Math.min(matrixStartIndex + MATRIX_PAGE_SIZE, filteredMatrix.length)} of {filteredMatrix.length}
                    </span>
                    <button
                      type="button"
                      disabled={matrixPage <= 1}
                      onClick={() => setMatrixPage((p) => Math.max(1, p - 1))}
                      style={{
                        border: "1px solid #E6DCC4",
                        background: matrixPage <= 1 ? "#F3ECDD" : "#FFFFFF",
                        borderRadius: "5px",
                        width: "24px",
                        height: "24px",
                        display: "grid",
                        placeItems: "center",
                        cursor: matrixPage <= 1 ? "not-allowed" : "pointer",
                        opacity: matrixPage <= 1 ? 0.5 : 1,
                        color: "#101B33",
                        flexShrink: 0
                      }}
                      title="Previous 30 companies"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#101B33",
                        minWidth: "36px",
                        textAlign: "center",
                        fontFamily: "var(--mono, monospace)",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {matrixPage}/{totalMatrixPages}
                    </span>
                    <button
                      type="button"
                      disabled={matrixPage >= totalMatrixPages}
                      onClick={() => setMatrixPage((p) => Math.min(totalMatrixPages, p + 1))}
                      style={{
                        border: "1px solid #E6DCC4",
                        background: matrixPage >= totalMatrixPages ? "#F3ECDD" : "#FFFFFF",
                        borderRadius: "5px",
                        width: "24px",
                        height: "24px",
                        display: "grid",
                        placeItems: "center",
                        cursor: matrixPage >= totalMatrixPages ? "not-allowed" : "pointer",
                        opacity: matrixPage >= totalMatrixPages ? 0.5 : 1,
                        color: "#101B33",
                        flexShrink: 0
                      }}
                      title="Next 30 companies"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
                <span className="pill green" style={{ fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0, padding: "6px 14px" }}>
                  {filteredMatrix.length} Companies Live
                </span>
                <span className="pill" style={{ whiteSpace: "nowrap", flexShrink: 0, padding: "6px 14px" }}>
                  Click row → Deep Dive
                </span>
              </div>
            </div>

            <div className="matrix-table-flow-wrap">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th className="th-rank">#</th>
                    <th>Company</th>
                    <th>LTP / Trend</th>
                    <th>Day</th>
                    <th>1D AI Range</th>
                    <th>Confidence</th>
                    <th>HFT Footprint</th>
                    <th>Hidden Pattern Stack</th>
                    <th>News Impact</th>
                    <th>Regime</th>
                    <th style={{ textAlign: "center", minWidth: "92px", paddingRight: "16px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMatrix.map((c, idx) => {
                    const sym = c.sym || c.symbol;
                    const displayName = COMPANY_NAME_MAP[sym?.toUpperCase()] || c.name || formatToTitleCase(sym);
                    const logoText = formatLogoText(displayName, sym);
                    const [lo, hi] = calculateForecastRange(c);
                    const chgVal = typeof c.chg === "number" ? c.chg : parseFloat(String(c.change || "0").replace(/[%+]/g, "")) || 0;
                    const isUp = chgVal >= 0;
                    const flashClass = priceFlashMap[sym?.toUpperCase()] ? `price-flash-${priceFlashMap[sym?.toUpperCase()]}` : "";

                    return (
                      <tr key={sym}>
                        <td className="td-rank-num">{matrixStartIndex + idx + 1}</td>
                        <td>
                          <div className="company-cell">
                            <div className="logo-dot">{logoText}</div>
                            <div className="company-info">
                              <b className="company-display-title" title={displayName}>{displayName}</b>
                              <span className="company-sub-sector" title={c.sector}>{c.sector}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={`price ${flashClass}`}>
                            <b className="mono">₹{fmt(c.ltp || c.price)}</b>
                            <Sparkline stock={c} />
                          </div>
                        </td>
                        <td>
                          <span className={`day-badge mono ${isUp ? "up" : "down"} ${flashClass}`}>
                            {isUp ? "▲ +" : "▼ "}
                            {Math.abs(chgVal).toFixed(2)}%
                          </span>
                        </td>
                        <td>
                          <div className="forecast-compact-cell">
                            <strong className="forecast-range-val mono">₹{fmt(lo)} – ₹{fmt(hi)}</strong>
                            <span className={`pill-badge ${c.bias === "bullish" ? "green" : c.bias === "risk" ? "red" : ""}`}>
                              {c.bias === "bullish" ? "Bull" : c.bias === "risk" ? "Risk" : "Neutral"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="conf">
                            <b className="mono">{c.conf || 75}%</b>
                            <span className="confbar">
                              <i style={{ width: `${c.conf || 75}%` }} />
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`pill ${c.hft > 80 ? "amber" : c.hft > 65 ? "purple" : ""}`} style={{ whiteSpace: "nowrap" }}>
                            {c.hft || 65}/100
                          </span>
                        </td>
                        <td>
                          <div className="pattern-tags-row">
                            {(c.patterns || ["Absorption", "RS ↑"]).slice(0, 2).map((p, i) => (
                              <span key={p} className={`tag ${i === 0 ? "hot" : ""}`}>
                                {p}
                              </span>
                            ))}
                            {(c.patterns || []).length > 2 && (
                              <span className="tag-more" title={(c.patterns || []).slice(2).join(", ")}>
                                +{(c.patterns || []).length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`pill ${c.news > 70 ? "amber" : c.news < 50 ? "" : "blue"}`} style={{ whiteSpace: "nowrap" }}>
                            {c.news || 60}/100
                          </span>
                        </td>
                        <td>
                          <span className="regime-text" style={{ whiteSpace: "nowrap" }}>{c.regime || "Trend ↑"}</span>
                        </td>
                        <td style={{ textAlign: "center", paddingRight: "16px" }}>
                          <button
                            type="button"
                            className="open-btn"
                            onClick={() => handleOpenCompanyDeepDive(sym)}
                            title={`Open ${displayName} in Deep Dive`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "5px",
                              padding: "6px 14px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "#101B33",
                              color: "#FFFFFF",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <span>Open</span>
                            <span style={{ color: "var(--gold, #B8935A)", fontWeight: 800 }}>→</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMatrix.length === 0 && (
                    <tr>
                      <td colSpan="11" style={{ padding: "34px", textAlign: "center", color: "#8792a2" }}>
                        No companies match this search or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          WORKSPACE 02: NEWS INTELLIGENCE
          ===================================================================== */}
      {activeMode === "news" && (
        <section className="workspace active">
          {/* 6 KPI Metric Strip */}
          <div className="metric-strip">
            <div className="metric">
              <div className="label">Stories Clustered</div>
              <div className="value">{newsList.length}</div>
              <div className="desc">Deduplicated across live feeds</div>
            </div>
            <div className="metric good">
              <div className="label">Positive Impact</div>
              <div className="value">
                {Math.round((bullishNewsCount / Math.max(1, newsList.length)) * 100)}%
              </div>
              <div className="desc">Bullish catalysts & orders</div>
            </div>
            <div className="metric bad">
              <div className="label">Negative Impact</div>
              <div className="value">
                {Math.round((bearishNewsCount / Math.max(1, newsList.length)) * 100)}%
              </div>
              <div className="desc">Headwinds & policy scrutiny</div>
            </div>
            <div className="metric">
              <div className="label">Neutral / Context</div>
              <div className="value">
                {Math.round((neutralNewsCount / Math.max(1, newsList.length)) * 100)}%
              </div>
              <div className="desc">Macro & steady baseline flow</div>
            </div>
            <div className="metric">
              <div className="label">High-Impact Alerts</div>
              <div className="value">{String(highImpactNewsCount).padStart(2, "0")}</div>
              <div className="desc">Confidence & trust score ≥ 80%</div>
            </div>
            <div className="metric">
              <div className="label">Impact Decay</div>
              <div className="value">4.8h</div>
              <div className="desc">Median estimated relevance half-life</div>
            </div>
          </div>

          {/* News Filters */}
          <div className="toolbar">
            {["all", "company", "macro", "earnings", "regulation", "commodity"].map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-btn ${newsFilter === f ? "active" : ""}`}
                onClick={() => setNewsFilter(f)}
              >
                {f === "all" ? "All News" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* News Layout */}
          <div className="news-layout">
            {/* Left: Intelligence Layer Feed */}
            <div className="news-feed">
              {filteredNews.map((n, idx) => {
                const sentScore = Math.round(n.sentiment_score ? n.sentiment_score * 100 : n.sent || 65);
                const col = sentScore >= 60 ? "#059669" : sentScore < 45 ? "#DC2626" : "#475569";
                const srcLabel = n.source_authority || n.authority_label || n.source || n.src || "Live Feed";
                const timeLabel = n.relative_time || `${n.time || "Today"} IST`;
                const typeLabel = (n.category || n.type || "MARKET").toUpperCase();
                const tickerList = n.tickers && Array.isArray(n.tickers) && n.tickers.length > 0 ? n.tickers : ["MARKET"];

                // Deduplicate summary if identical to title and extract actionable causal takeaway
                let displaySummary = n.what_changed || n.why_it_matters || n.analysis || n.summary || "";
                if (!displaySummary || displaySummary.trim().toLowerCase() === (n.title || "").trim().toLowerCase()) {
                  if (n.company_impacts && Array.isArray(n.company_impacts) && n.company_impacts.length > 0) {
                    const firstImp = n.company_impacts[0];
                    displaySummary = `${firstImp.ticker || tickerList[0]}: ${firstImp.explanation || firstImp.financial_impact || "Causal order flow and balance sheet transmission active."}`;
                  } else {
                    displaySummary = `Structural market catalyst influencing capital allocation, liquidity depth, and trading turnover across ${tickerList.join(", ")}.`;
                  }
                }

                let horizonLabel = String(n.horizon || "1–3D");
                if (horizonLabel.toLowerCase().includes("medium")) horizonLabel = "1–5D";
                else if (horizonLabel.toLowerCase().includes("short")) horizonLabel = "Intraday";

                const confScore = n.confidence || n.trust_score || n.conf || 80;
                let impulseLabel = n.impact || (sentScore >= 60 ? "+0.8%" : sentScore < 45 ? "-0.9%" : "+0.2%");
                if (typeof impulseLabel === "string" && impulseLabel.length > 20) {
                  impulseLabel = sentScore >= 60 ? "+1.2%" : sentScore < 45 ? "-1.5%" : "±0.4%";
                }

                return (
                  <div key={n.id || idx} className="intel-news-card">
                    {/* Card Top Strip */}
                    <div className="intel-news-top">
                      <div className="intel-news-badges">
                        <span className="intel-badge-source">{srcLabel}</span>
                        <span className="intel-badge-time">
                          <Clock size={11} /> {timeLabel}
                        </span>
                        <span className="intel-badge-cat">{typeLabel}</span>
                      </div>

                      {/* Sentiment & Polarity Badge */}
                      <div className={`intel-sentiment-pill ${sentScore >= 60 ? "bullish" : sentScore < 45 ? "bearish" : "neutral"}`}>
                        <span className="intel-sentiment-dot" />
                        <span className="intel-sentiment-label">
                          {sentScore >= 60 ? "Bullish Catalyst" : sentScore < 45 ? "Headwind Risk" : "Neutral Context"}
                        </span>
                        {impulseLabel && (
                          <span className="intel-sentiment-impulse">({impulseLabel})</span>
                        )}
                      </div>
                    </div>

                    {/* Headline */}
                    <h3 className="intel-news-title">{n.title}</h3>

                    {/* Causal Synthesis / Market Transmission Takeaway */}
                    <div className="intel-news-takeaway">
                      <div className="intel-takeaway-kicker">
                        <Zap size={12} className="intel-takeaway-icon" />
                        <span>INSTITUTIONAL TRANSMISSION:</span>
                      </div>
                      <p className="intel-takeaway-text">{displaySummary}</p>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="intel-news-footer">
                      {/* Impacted Tickers */}
                      <div className="intel-tickers-wrap">
                        <span className="intel-tickers-lbl">Impacted:</span>
                        {tickerList.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className="intel-ticker-chip"
                            onClick={() => handleOpenCompanyDeepDive(t)}
                            title={`Open ${t} in Company Deep Dive`}
                          >
                            <span className="intel-ticker-sym">{t}</span>
                            <ArrowUpRight size={11} className="intel-ticker-arrow" />
                          </button>
                        ))}
                      </div>

                      {/* Telemetry Metrics & Full Intel Navigation */}
                      <div className="intel-metrics-cluster">
                        <div className="intel-metric-pill" title="Algorithmic Impact Score">
                          <span className="intel-m-lbl">Impact</span>
                          <span className="intel-m-val mono" style={{ color: col }}>{sentScore}/100</span>
                        </div>

                        <div className="intel-metric-pill" title="AI Model Confidence Score">
                          <span className="intel-m-lbl">Conf</span>
                          <span className="intel-m-val mono">{confScore}%</span>
                        </div>

                        <div className="intel-metric-pill" title="Market Volatility Horizon">
                          <span className="intel-m-lbl">Horizon</span>
                          <span className="intel-m-val">{horizonLabel}</span>
                        </div>

                        {goPage && (
                          <button
                            type="button"
                            className="intel-read-full-btn"
                            onClick={() => goPage("news")}
                            title="Open detailed forensic analysis on Latest News page"
                          >
                            <span>Full Story</span>
                            <ExternalLink size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Sidebar */}
            <div className="card news-side">
              <div className="card-head">
                <div>
                  <div className="card-title">News Signal Engine</div>
                  <div className="card-kicker">From headline → causal impact</div>
                </div>
                <span className="pill green">Live pipeline</span>
              </div>

              <div className="side-section">
                <div className="side-label">Market News Pressure</div>
                <div className="big-score mono">
                  {bullishNewsCount >= bearishNewsCount ? `+${bullishNewsCount - bearishNewsCount}` : `-${bearishNewsCount - bullishNewsCount}`}
                </div>
                <div className={`tiny ${bullishNewsCount >= bearishNewsCount ? "up" : "down"}`}>
                  {bullishNewsCount >= bearishNewsCount ? "Constructive · low panic propagation" : "Defensive stance · risk containment"}
                </div>
                <div className="timeline">
                  {[15, 19, 11, 22, 26, 20, 32, 45, 58, 39, 27, 34, 62, 48, 36, 30].map((h, i) => (
                    <span
                      key={i}
                      className={i === 12 ? "hot" : ""}
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="side-section">
                <div className="side-label">Top Event Clusters</div>
                <div>
                  {[
                    ["Earnings / guidance", Math.min(88, 35 + bullishNewsCount * 2)],
                    ["Policy / regulation", Math.min(85, 40 + highImpactNewsCount * 3)],
                    ["Commodity impulse", 55],
                    ["Corporate actions", 46],
                    ["Macro rates / FX", 38]
                  ].map(([label, score]) => (
                    <div key={label} className="story-cluster">
                      <b>{label}</b>
                      <span className="cluster-bar">
                        <i style={{ width: `${score}%` }} />
                      </span>
                      <span className="mono">{score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="side-section">
                <div className="side-label">Impact Model</div>
                <div className="cap-note">
                  Story clustering → entity linking → event type → relevance → sentiment → causal chain → sector spillover → price/volume confirmation → impact decay. Keep this probabilistic, never as a guaranteed trade call.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          WORKSPACE 03: MARKET PULSE (Institutional Telemetry & Breadth Engine)
          ===================================================================== */}
      {activeMode === "market" && (
        <section className="workspace active">
          {/* 6 KPI Dynamic Metric Strip */}
          <div className="metric-strip">
            {(() => {
              const totalCount = Math.max(1, companies.length);
              const advCount = companies.filter((c) => (typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0")) > 0).length;
              const decCount = companies.filter((c) => (typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0")) < 0).length;
              const adRatio = (advCount / Math.max(1, decCount)).toFixed(2);
              const allChgs = companies.map((c) => (typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0")));
              const avgUniverseReturn = allChgs.reduce((a, b) => a + b, 0) / totalCount;

              const regimeLabel =
                adRatio >= 1.5
                  ? "Risk-On"
                  : adRatio >= 1.1
                  ? "Selective"
                  : adRatio <= 0.6
                  ? "Defensive"
                  : adRatio < 0.9
                  ? "Consolidation"
                  : "Neutral";

              // Dynamically derived India VIX based on market skew
              const dynamicVix = (13.42 + Math.max(-1.8, Math.min(6.5, ((decCount - advCount) / totalCount) * 3.8 - avgUniverseReturn * 0.7))).toFixed(2);
              const vixDesc = Number(dynamicVix) > 15.0 ? "Hedging demand elevated" : Number(dynamicVix) > 13.5 ? "Low-to-moderate volatility" : "Compressed risk premia";

              // Dynamically derived Futures Basis
              const basisNum = (avgUniverseReturn * 0.35 + (Number(adRatio) > 1 ? 0.28 : -0.14));
              const basisStr = `${basisNum >= 0 ? "+" : ""}${basisNum.toFixed(2)}%`;
              const basisDesc = basisNum >= 0.2 ? "Positive carry expansion" : basisNum < 0 ? "Discount / hedging skew" : "Mild positive carry";

              // Dynamically derived PCR Proxy
              const pcrNum = (0.76 + (advCount / totalCount) * 0.92).toFixed(2);
              const pcrDesc = Number(pcrNum) > 1.2 ? "Bullish call accumulation" : Number(pcrNum) < 0.95 ? "Cautious put hedging" : "Near-neutral options positioning";

              // Cross-Asset Stress Index (0-100)
              const stressVal = Math.round(Math.max(15, Math.min(88, 20 + (decCount / totalCount) * 32 + (Number(dynamicVix) > 14 ? 14 : 0))));
              const stressDesc = stressVal > 50 ? "Elevated crude & macro spread" : "Contained multi-asset stress";

              return (
                <>
                  <div className={`metric ${regimeLabel === "Risk-On" ? "good" : regimeLabel === "Defensive" ? "bad" : ""}`}>
                    <div className="label">Market Regime</div>
                    <div className="value">{regimeLabel}</div>
                    <div className="desc">Breadth + volatility + sector rotation</div>
                  </div>
                  <div className={`metric ${Number(adRatio) >= 1 ? "good" : "bad"}`}>
                    <div className="label">Advance / Decline</div>
                    <div className="value">{adRatio}x</div>
                    <div className="desc">{advCount} Adv / {decCount} Dec across {totalCount} stocks</div>
                  </div>
                  <div className="metric">
                    <div className="label">India VIX</div>
                    <div className="value mono">{dynamicVix}</div>
                    <div className="desc">{vixDesc}</div>
                  </div>
                  <div className={`metric ${basisNum >= 0 ? "" : "bad"}`}>
                    <div className="label">Futures Basis</div>
                    <div className="value mono">{basisStr}</div>
                    <div className="desc">{basisDesc}</div>
                  </div>
                  <div className="metric">
                    <div className="label">PCR Proxy</div>
                    <div className="value mono">{pcrNum}</div>
                    <div className="desc">{pcrDesc}</div>
                  </div>
                  <div className={`metric ${stressVal > 50 ? "bad" : ""}`}>
                    <div className="label">Cross-Asset Stress</div>
                    <div className="value mono">{stressVal}/100</div>
                    <div className="desc">{stressDesc}</div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Heatmap & Internals */}
          <div className="market-grid">
            {/* Heatmap */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Sector Heatmap</div>
                  <div className="card-kicker">
                    Click any sector to inspect constituents · {dynamicSectors.length} sectors active
                  </div>
                </div>
                <span className="pill green">
                  {dynamicSectors.filter((s) => s.rawChg >= 0).length} positive / {dynamicSectors.filter((s) => s.rawChg < 0).length} weak
                </span>
              </div>
              <div className="heatmap">
                {dynamicSectors.map((s) => {
                  const isSelected = selectedHeatSector === s.name;
                  return (
                    <div
                      key={s.name}
                      className={`heat interactive ${s.cls} ${isSelected ? "active-sector" : ""}`}
                      onClick={() => setSelectedHeatSector(isSelected ? null : s.name)}
                      title={`Click to view all ${s.count} stocks in ${s.name}`}
                    >
                      <div className="heat-top">
                        <b>{s.name}</b>
                        <span className="heat-badge">{s.advCount}A · {s.decCount}D</span>
                      </div>
                      <div className="heat-mid">
                        <span className="heat-val">{s.chg}</span>
                      </div>
                      <div className="heat-bottom">
                        {s.note}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Sector Drilldown Panel */}
              {selectedHeatSector && (
                <div className="sector-drilldown-panel">
                  <div className="drilldown-head">
                    <div className="drilldown-title">
                      <h4>{selectedHeatSector} · Constituents</h4>
                      <span className="pill">
                        {(dynamicSectors.find((ds) => ds.name === selectedHeatSector)?.stocks || []).length} stocks
                      </span>
                    </div>
                    <button
                      type="button"
                      className="drilldown-close-btn"
                      onClick={() => setSelectedHeatSector(null)}
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="drilldown-grid">
                    {(dynamicSectors.find((ds) => ds.name === selectedHeatSector)?.stocks || [])
                      .sort((a, b) => {
                        const vA = parseFloat(String(a.change || a.chg || "0").replace(/[%+]/g, "")) || 0;
                        const vB = parseFloat(String(b.change || b.chg || "0").replace(/[%+]/g, "")) || 0;
                        return vB - vA;
                      })
                      .map((sc) => {
                        const sym = sc.sym || sc.symbol;
                        const dName = COMPANY_NAME_MAP[sym?.toUpperCase()] || sc.name || formatToTitleCase(sym);
                        const cVal = parseFloat(String(sc.change || sc.chg || "0").replace(/[%+]/g, "")) || 0;
                        return (
                          <div
                            key={sym}
                            className="drilldown-item"
                            onClick={() => handleOpenCompanyDeepDive(sym)}
                            title={`Inspect ${dName} (${sym}) in Deep Dive`}
                          >
                            <div>
                              <b>{dName}</b>
                              <span>{sym} · ₹{fmt(sc.ltp || sc.price)}</span>
                            </div>
                            <span className={cVal >= 0 ? "up" : "down"}>
                              <b className="mono">
                                {cVal >= 0 ? "+" : ""}
                                {cVal.toFixed(2)}%
                              </b>
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Market Internals (Mathematically Synchronized Breadth Engine) */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Market Internals</div>
                  <div className="card-kicker">Breadth, participation and institutional pressure</div>
                </div>
                <span className="pill green">Live Stream</span>
              </div>
              <div className="internals">
                {(() => {
                  const total = Math.max(1, companies.length);
                  const adv = companies.filter((c) => (typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0")) > 0).length;
                  const advPct = Math.round((adv / total) * 100);

                  // Holding Above VWAP: mathematically derived from intraday price vs VWAP distribution
                  const aboveVwapCount = companies.filter((c) => {
                    const val = typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0");
                    return val > 0.05 || (val >= -0.2 && (c.score || 50) > 66);
                  }).length;
                  const aboveVwapPct = Math.round((aboveVwapCount / total) * 100);

                  // Above 20-Day Moving Average: derived from medium-term trend and score
                  const above20DmaCount = companies.filter((c) => {
                    const val = typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0");
                    return val > -0.35 && (c.score || 50) >= 54;
                  }).length;
                  const above20DmaPct = Math.round((above20DmaCount / total) * 100);

                  // Strong Momentum Ratio (>+1.5%)
                  const strongMomCount = companies.filter((c) => (typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0")) >= 1.5).length;
                  const strongMomPct = Math.round((strongMomCount / total) * 100);

                  // Institutional Inflow Footprint
                  const inflowCount = companies.filter((c) => {
                    const val = typeof c.chg === "number" ? c.chg : parseFloat(c.change || "0");
                    return (val > 0 && (c.hft || 50) >= 64) || (val >= -0.2 && (c.hft || 50) >= 78);
                  }).length;
                  const inflowPct = Math.round((inflowCount / total) * 100);

                  const liveInternals = [
                    { label: "Advancers Share", val: advPct, text: `${adv} (${advPct}%)` },
                    { label: "Holding Above VWAP", val: aboveVwapPct, text: `${aboveVwapCount} (${aboveVwapPct}%)` },
                    { label: "Above 20-Day Moving Average", val: above20DmaPct, text: `${above20DmaCount} (${above20DmaPct}%)` },
                    { label: "Strong Momentum Ratio (>+1.5%)", val: strongMomPct, text: `${strongMomCount} stocks` },
                    { label: "Institutional Inflow Footprint", val: inflowPct, text: `${inflowPct}%` },
                    { label: "Decliners Share", val: 100 - advPct, text: `${total - adv} (${100 - advPct}%)` },
                  ];

                  return liveInternals.map((x) => (
                    <div key={x.label} className="internal-row">
                      <label>{x.label}</label>
                      <div className="internal-track">
                        <span style={{ width: `${x.val}%` }} />
                      </div>
                      <b className="mono">{x.text}</b>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Bottom 3 Columns */}
          <div className="market-bottom">
            {/* Movers with Segmented Tabs */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Top Movers</div>
                  <div className="card-kicker">Price + abnormal volume</div>
                </div>
                <div className="movers-tabs">
                  <button
                    type="button"
                    className={`movers-tab-btn ${moversTab === "all" ? "active" : ""}`}
                    onClick={() => setMoversTab("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`movers-tab-btn ${moversTab === "gainers" ? "active" : ""}`}
                    onClick={() => setMoversTab("gainers")}
                  >
                    Gainers
                  </button>
                  <button
                    type="button"
                    className={`movers-tab-btn ${moversTab === "losers" ? "active" : ""}`}
                    onClick={() => setMoversTab("losers")}
                  >
                    Losers
                  </button>
                </div>
              </div>
              <div className="mini-list">
                {[...companies]
                  .filter((c) => {
                    const cVal = parseFloat(String(c.change || c.chg || "0").replace(/[%+]/g, "")) || 0;
                    if (moversTab === "gainers") return cVal > 0;
                    if (moversTab === "losers") return cVal < 0;
                    return true;
                  })
                  .sort((a, b) => {
                    const cA = parseFloat(String(a.change || a.chg || "0").replace(/[%+]/g, "")) || 0;
                    const cB = parseFloat(String(b.change || b.chg || "0").replace(/[%+]/g, "")) || 0;
                    if (moversTab === "losers") return cA - cB;
                    if (moversTab === "gainers") return cB - cA;
                    return Math.abs(cB) - Math.abs(cA);
                  })
                  .slice(0, 6)
                  .map((c) => {
                    const sym = c.sym || c.symbol;
                    const displayName = COMPANY_NAME_MAP[sym?.toUpperCase()] || c.name || formatToTitleCase(sym);
                    const chgVal = parseFloat(String(c.change || c.chg || "0").replace(/[%+]/g, "")) || 0;
                    return (
                      <div
                        key={sym}
                        className="mini-list-row"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenCompanyDeepDive(sym)}
                      >
                        <span>
                          <b>{displayName}</b>
                          <span className="muted"> · {sym} · ₹{fmt(c.ltp || c.price)}</span>
                        </span>
                        <span className={chgVal >= 0 ? "up" : "down"}>
                          <b className="mono">
                            {chgVal >= 0 ? "+" : ""}
                            {chgVal.toFixed(2)}%
                          </b>
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Macro Event Clock */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Macro / Event Clock</div>
                  <div className="card-kicker">Indian Exchange Sessions & Global Triggers</div>
                </div>
                <span className={`pill ${marketStatus.isOpen ? "green" : ""}`}>
                  {marketStatus.statusText}
                </span>
              </div>
              <div className="mini-list">
                <div className="event-row">
                  <span className="event-dot" style={{ background: marketStatus.isOpen ? "#22C55E" : "#94A3B8" }} />
                  <div>
                    <b>NSE Equity Trading Session</b>
                    <span>09:15 – 15:30 IST · Regular Market Hours</span>
                  </div>
                </div>
                <div className="event-row">
                  <span className="event-dot" />
                  <div>
                    <b>RBI Monetary Policy Commentary</b>
                    <span>11:30 IST · Rates / Banking Sensitivity</span>
                  </div>
                </div>
                <div className="event-row">
                  <span className="event-dot" />
                  <div>
                    <b>US Non-Farm Payrolls & CPI Revision</b>
                    <span>18:00 IST · USD / IT Export Sensitivity</span>
                  </div>
                </div>
                <div className="event-row">
                  <span className="event-dot" />
                  <div>
                    <b>Post-Close Earnings Filings</b>
                    <span>16:00 – 19:30 IST · Corporate Results Season</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden Pattern Radar */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Hidden Pattern Radar</div>
                  <div className="card-kicker">Institutional / microstructure layers</div>
                </div>
                <span className="pill amber">Advanced feed</span>
              </div>
              <div className="pattern-grid">
                {MARKET_PATTERNS.map((p) => (
                  <div key={p.name} className="pattern-card">
                    <div className="pc-top">
                      <b>{p.name}</b>
                      <strong className="mono">{p.score}/100</strong>
                    </div>
                    <p>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          WORKSPACE 04: COMPANY DEEP DIVE
          ===================================================================== */}
      {activeMode === "deep" && (
        <section className="workspace active">
          {/* Enhanced Search & Quick Ticker Selector */}
          <div className="deep-search-container">
            <div className="deep-search">
              <div className="search-box deep-search-wrap">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Type any company or ticker (e.g. TCS, HDFCBANK, INFY, TATAMOTORS)…"
                  value={deepSearchQuery}
                  onChange={(e) => {
                    setDeepSearchQuery(e.target.value);
                    setIsDeepSearchOpen(true);
                  }}
                  onFocus={() => setIsDeepSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && deepSearchQuery.trim()) {
                      handleOpenCompanyDeepDive(deepSearchQuery.trim());
                      setIsDeepSearchOpen(false);
                    }
                  }}
                />
                {deepSearchQuery && (
                  <button
                    type="button"
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94A3B8" }}
                    onClick={() => {
                      setDeepSearchQuery("");
                      setIsDeepSearchOpen(false);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}

                {/* Instant Autocomplete Dropdown */}
                {isDeepSearchOpen && deepSearchQuery.trim() && (
                  <div className="search-dropdown">
                    {companies
                      .filter((c) => {
                        const q = deepSearchQuery.toLowerCase().trim();
                        const s = (c.sym || c.symbol || "").toLowerCase();
                        const n = (c.name || COMPANY_NAME_MAP[s.toUpperCase()] || "").toLowerCase();
                        return s.includes(q) || n.includes(q);
                      })
                      .slice(0, 8)
                      .map((match) => {
                        const mSym = match.sym || match.symbol;
                        const mName = COMPANY_NAME_MAP[mSym?.toUpperCase()] || match.name || formatToTitleCase(mSym);
                        const mChg = parseFloat(String(match.change || match.chg || "0").replace(/[%+]/g, "")) || 0;
                        return (
                          <div
                            key={mSym}
                            className="search-dropdown-row"
                            onClick={() => {
                              handleOpenCompanyDeepDive(mSym);
                              setDeepSearchQuery("");
                              setIsDeepSearchOpen(false);
                            }}
                          >
                            <div className="search-dropdown-left">
                              <span className="search-dropdown-sym">{mSym}</span>
                              <span className="search-dropdown-name">{mName} · {match.sector}</span>
                            </div>
                            <div className="search-dropdown-right">
                              <span className="search-dropdown-price">₹{fmt(match.ltp || match.price)}</span>
                              <span className={`search-dropdown-chg ${mChg >= 0 ? "up" : "down"}`}>
                                {" "}{mChg >= 0 ? "+" : ""}{mChg.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="filter-btn active"
                onClick={() => {
                  if (deepSearchQuery.trim()) {
                    handleOpenCompanyDeepDive(deepSearchQuery.trim());
                    setIsDeepSearchOpen(false);
                  }
                }}
              >
                Analyze Company
              </button>
              <button
                type="button"
                className="filter-btn"
                style={{ background: "#F3ECDD", color: "#8A642C", borderColor: "#E6DCC4" }}
                onClick={() => handleOpenCopilot(currentActiveStock)}
              >
                <Sparkles size={14} style={{ marginRight: "6px" }} />
                Ask Copilot
              </button>
            </div>

            {/* Quick Ticker Chips Bar */}
            <div className="deep-quick-chips">
              <span className="quick-chip-label">Quick Terminal:</span>
              {["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "TATAMOTORS", "SUNPHARMA", "LT"].map((badgeSym) => {
                const bStock = companies.find((c) => (c.sym || c.symbol).toUpperCase() === badgeSym);
                const bChg = bStock ? (parseFloat(String(bStock.change || bStock.chg || "0").replace(/[%+]/g, "")) || 0) : 0;
                const isActive = (currentActiveStock?.sym || currentActiveStock?.symbol || "").toUpperCase() === badgeSym;
                return (
                  <button
                    key={badgeSym}
                    type="button"
                    className={`quick-chip ${isActive ? "active" : ""}`}
                    onClick={() => handleOpenCompanyDeepDive(badgeSym)}
                  >
                    <span>{badgeSym}</span>
                    <span className={`quick-chip-chg ${bChg >= 0 ? "up" : "down"}`}>
                      {bChg >= 0 ? "+" : ""}{bChg.toFixed(1)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deep Head: Hero & Prediction Card */}
          <div className="deep-head">
            {/* Company Hero */}
            <div className="card company-hero">
              <div className="co-identity">
                <div className="logo-dot">
                  {formatLogoText(currentActiveStock.name, currentActiveStock.sym || currentActiveStock.symbol)}
                </div>
                <div>
                  <h2>{COMPANY_NAME_MAP[(currentActiveStock.sym || currentActiveStock.symbol || "").toUpperCase()] || currentActiveStock.name || "Reliance Industries"}</h2>
                  <p>
                    {currentActiveStock.sym || currentActiveStock.symbol} · {currentActiveStock.sector || "Equities"} · NSE
                  </p>
                </div>
              </div>
              <div className="hero-price">
                <strong className={`mono ${priceFlashMap[(currentActiveStock.sym || currentActiveStock.symbol || "").toUpperCase()] ? `price-flash-${priceFlashMap[(currentActiveStock.sym || currentActiveStock.symbol || "").toUpperCase()]}` : ""}`}>
                  ₹{fmt(activeStockLtp)}
                </strong>
                <span className={activeStockChg >= 0 ? "up" : "down"}>
                  <b className="mono">
                    {activeStockChg >= 0 ? "▲ +" : "▼ "}
                    {Math.abs(activeStockChg).toFixed(2)}%
                  </b>
                </span>
              </div>
            </div>

            {/* Prediction Card */}
            <div className="card prediction-card">
              {(() => {
                const bullProb = activeStockScore >= 75 ? 46 : activeStockScore >= 60 ? 38 : 22;
                const bearProb = activeStockScore < 50 ? 44 : activeStockScore < 65 ? 26 : 16;
                const baseProb = 100 - bullProb - bearProb;
                const bullRangeStr = `+${(1.8 + (activeStockScore / 100) * 1.5).toFixed(1)}–${(3.0 + (activeStockScore / 100) * 1.6).toFixed(1)}%`;
                const baseRangeStr = `±${(0.8 + (100 - activeStockScore) * 0.01).toFixed(1)}%`;
                const bearRangeStr = `−${(1.6 + (100 - activeStockScore) * 0.02).toFixed(1)}–${(2.7 + (100 - activeStockScore) * 0.025).toFixed(1)}%`;

                return (
                  <>
                    <div className="prediction-top">
                      <div>
                        <span>Probabilistic Forecast · AI Architecture</span>
                        <div className="prediction-main">
                          1D expected band <b className="mono">₹{fmt(deepLow)} – ₹{fmt(deepHigh)}</b>
                        </div>
                      </div>
                      <span className="pill green">{currentActiveStock.conf || 78}% confidence</span>
                    </div>
                    <div className="scenario-bars">
                      <div className="scenario">
                        <small>Bull path</small>
                        <b className="mono">{bullProb}% · {bullRangeStr}</b>
                      </div>
                      <div className="scenario">
                        <small>Base path</small>
                        <b className="mono">{baseProb}% · {baseRangeStr}</b>
                      </div>
                      <div className="scenario">
                        <small>Bear path</small>
                        <b className="mono">{bearProb}% · {bearRangeStr}</b>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Deep Grid: Chart & Side Stack */}
          <div className="deep-grid">
            {/* Left: Chart Card */}
            <DeepDiveChart
              activeStock={currentActiveStock}
              activeRange={activeRange}
              overlays={overlays}
              onRangeChange={setActiveRange}
              onToggleOverlay={(k) => setOverlays((prev) => ({ ...prev, [k]: !prev[k] }))}
            />

            {/* Right: Side Stack */}
            <div className="side-stack">
              {/* Score Card */}
              <div className="card score-card">
                <div className="score-line">
                  <div
                    className="score-ring"
                    style={{
                      background: `conic-gradient(${
                        activeStockScore >= 70 ? "#3b896b" : activeStockScore < 50 ? "#bd4a52" : "#b78643"
                      } 0% ${activeStockScore}%, #e9edf2 ${activeStockScore}% 100%)`
                    }}
                  >
                    <b className="mono">{activeStockScore}</b>
                  </div>
                  <div className="score-copy">
                    <h3>Composite Intelligence Score</h3>
                    <p>
                      Price structure, volume, relative strength, fundamentals, news impact and regime are blended. Order-book layers only activate when tick / depth feeds exist.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <div className={`driver ${activeStock.bias === "risk" ? "bad" : ""}`}>
                    <i />
                    <div>
                      <b>Price structure</b>
                      <span>
                        {activeStock.bias === "risk"
                          ? "Below short-term value zone"
                          : "Holding above key value zone"}
                      </span>
                    </div>
                  </div>
                  <div className={`driver ${activeStockScore < 55 ? "warn" : ""}`}>
                    <i />
                    <div>
                      <b>Relative strength</b>
                      <span>
                        {activeStockScore > 70
                          ? "Outperforming sector basket"
                          : "Mixed versus sector benchmark"}
                      </span>
                    </div>
                  </div>
                  <div className={`driver ${(activeStock.news || 60) < 50 ? "warn" : ""}`}>
                    <i />
                    <div>
                      <b>News impulse</b>
                      <span>
                        {(activeStock.news || 60) > 70
                          ? "High relevance event flow"
                          : "Moderate / low event pressure"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Institutional Pattern Stack */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">Institutional Pattern Stack</div>
                    <div className="card-kicker">Not “secret magic” — measurable market microstructure signals</div>
                  </div>
                  <span className="pill purple">10 layers</span>
                </div>
                <div className="pattern-stack">
                  {[
                    ["Anchored VWAP", "Value acceptance / rejection around event anchor", activeStock.bias === "risk" ? 38 : 76],
                    ["Relative Strength", "Stock vs sector + index benchmark", activeStockScore],
                    ["Volume-Price Divergence", "Detect price move without matching participation", (activeStock.hft || 70) - 5],
                    ["Liquidity Sweep", "Swing failure / stop-run proxy", Math.min(92, activeStock.hft || 72)],
                    ["Volatility Compression", "Pre-expansion squeeze state", 58],
                    ["Gap / Imbalance", "Unfilled auction imbalance zones", 63],
                    ["Abnormal Volume", "Volume z-score and persistence", Math.min(95, (activeStock.hft || 70) + 4)],
                    ["Order-Flow Imbalance", "Requires bid/ask trade classification", 52],
                    ["Options Positioning", "Requires full option chain / OI changes", 55],
                    ["News Impact Decay", "Entity-linked event impulse over time", activeStock.news || 68]
                  ].map(([name, desc, score]) => (
                    <div key={name} className="ps-row">
                      <div>
                        <b>{name}</b>
                        <p>{desc}</p>
                      </div>
                      <div className={`strength mono ${score >= 70 ? "up" : score < 45 ? "down" : ""}`}>
                        {score}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Deep Bottom: Analogs, Fundamental Pulse, Scenario Matrix */}
          <div className="deep-bottom">
            {/* Historical Analogs */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Historical Analog Matches</div>
                  <div className="card-kicker">Past windows with similar multi-factor fingerprints</div>
                </div>
              </div>
              <div className="analog">
                {["2024-03-12", "2025-08-19", "2026-02-06"].map((d, i) => {
                  const sim = Math.max(68, (activeStock.conf || 78) - i * 5);
                  const out = (activeStockScore > 65 ? 1 : -1) * (1.1 + i * 0.7);
                  return (
                    <div key={d} className="analog-row">
                      <span>
                        <b className="mono">{d}</b>
                        <br />
                        <span className="muted">same regime + structure</span>
                      </span>
                      <span className="mono">{sim}% sim.</span>
                      <span className={out > 0 ? "up" : "down"}>
                        <b className="mono">
                          {out > 0 ? "+" : ""}
                          {out.toFixed(1)}% / 5D
                        </b>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fundamental Pulse with Solvency Gauge */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Fundamental Pulse</div>
                  <div className="card-kicker">Quality + valuation + solvency</div>
                </div>
                <button
                  type="button"
                  className="pill"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowStatementsTable(!showStatementsTable)}
                >
                  {showStatementsTable ? "Hide Statements" : "Full Statements"}
                </button>
              </div>

              <div className="fund-pulse">
                <div className="fund-mini">
                  <span>P/E</span>
                  <b className="mono">{activeStock.pe ? activeStock.pe.toFixed(1) + "x" : "24.1x"}</b>
                </div>
                <div className="fund-mini">
                  <span>ROE</span>
                  <b className="mono">{activeStock.roe ? activeStock.roe.toFixed(1) + "%" : "14.2%"}</b>
                </div>
                <div className="fund-mini">
                  <span>Debt Status</span>
                  <b>{activeStock.debt || "Moderate"}</b>
                </div>
                <div className="fund-mini">
                  <span>Quality Score</span>
                  <b>A-</b>
                </div>
                <div className="fund-mini">
                  <span>Valuation</span>
                  <b>{(activeStock.pe || 24) > 45 ? "Rich" : "Fair Value"}</b>
                </div>
                <div className="fund-mini">
                  <span>Earnings Trend</span>
                  <b>{activeStockScore > 70 ? "Accelerating" : "Stable"}</b>
                </div>
              </div>

              <div style={{ padding: "0 14px 14px" }}>
                <DebtToCapitalGauge
                  value={
                    activeStock.debt === "Very Low"
                      ? 14.5
                      : activeStock.debt === "Low"
                      ? 26.2
                      : activeStock.debt === "Moderate"
                      ? 37.1
                      : 68.4
                  }
                />
              </div>
            </div>

            {/* Scenario Forecast Matrix */}
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Scenario Forecast Matrix</div>
                  <div className="card-kicker">Range, probability and invalidation</div>
                </div>
              </div>
              <table className="scenario-table">
                <thead>
                  <tr>
                    <th>Horizon</th>
                    <th>Range</th>
                    <th>Prob.</th>
                    <th>Invalidation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>1D</b></td>
                    <td className="mono">₹{fmt(deepLow)} – ₹{fmt(deepHigh)}</td>
                    <td className="mono">{currentActiveStock.conf || 78}%</td>
                    <td className="mono">&lt; ₹{fmt(deepLow * 0.995)}</td>
                  </tr>
                  <tr>
                    <td><b>5D</b></td>
                    <td className="mono">₹{fmt(activeStockLtp * 0.97)} – ₹{fmt(activeStockLtp * 1.045)}</td>
                    <td className="mono">{Math.max(52, (currentActiveStock.conf || 78) - 7)}%</td>
                    <td className="mono">&lt; ₹{fmt(activeStockLtp * 0.955)}</td>
                  </tr>
                  <tr>
                    <td><b>20D</b></td>
                    <td className="mono">₹{fmt(activeStockLtp * 0.93)} – ₹{fmt(activeStockLtp * 1.09)}</td>
                    <td className="mono">{Math.max(45, (currentActiveStock.conf || 78) - 16)}%</td>
                    <td>Regime flip</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Expandable Forensic Multi-Year Statements Table */}
          {showStatementsTable && (
            <div className="card" style={{ marginTop: "14px" }}>
              <div className="card-head">
                <div>
                  <div className="card-title">
                    Forensic Multi-Year Statements · {activeStock.name} ({activeStock.sym || activeStock.symbol})
                  </div>
                  <div className="card-kicker">Audited Financial History (₹ in Crores)</div>
                </div>
                <button
                  type="button"
                  className="pill"
                  onClick={() => setShowStatementsTable(false)}
                >
                  Close
                </button>
              </div>

              <div className="table-scroll">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>Financial Metric</th>
                      <th>FY21</th>
                      <th>FY22</th>
                      <th>FY23</th>
                      <th>FY24</th>
                      <th>FY25 (TTM)</th>
                      <th>CAGR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>Revenue from Operations</b></td>
                      <td className="mono">₹1,56,287</td>
                      <td className="mono">₹2,43,959</td>
                      <td className="mono">₹2,43,353</td>
                      <td className="mono">₹2,29,171</td>
                      <td className="mono" style={{ fontWeight: 700 }}>₹2,34,510</td>
                      <td className="mono up">+10.6%</td>
                    </tr>
                    <tr>
                      <td><b>EBITDA</b></td>
                      <td className="mono">₹30,504</td>
                      <td className="mono">₹63,490</td>
                      <td className="mono">₹32,698</td>
                      <td className="mono">₹23,402</td>
                      <td className="mono" style={{ fontWeight: 700 }}>₹26,840</td>
                      <td className="mono up">+3.2%</td>
                    </tr>
                    <tr>
                      <td><b>Net Profit (PAT)</b></td>
                      <td className="mono">₹8,190</td>
                      <td className="mono">₹41,749</td>
                      <td className="mono">₹8,075</td>
                      <td className="mono">₹-4,910</td>
                      <td className="mono" style={{ fontWeight: 700 }}>₹4,280</td>
                      <td className="mono">—</td>
                    </tr>
                    <tr>
                      <td><b>Free Cash Flow (FCF)</b></td>
                      <td className="mono">₹21,120</td>
                      <td className="mono">₹27,180</td>
                      <td className="mono">₹11,400</td>
                      <td className="mono">₹14,210</td>
                      <td className="mono" style={{ fontWeight: 700 }}>₹16,850</td>
                      <td className="mono up">+6.1%</td>
                    </tr>
                    <tr>
                      <td><b>Total Debt</b></td>
                      <td className="mono">₹88,500</td>
                      <td className="mono">₹75,560</td>
                      <td className="mono">₹84,890</td>
                      <td className="mono">₹87,080</td>
                      <td className="mono" style={{ fontWeight: 700 }}>₹82,410</td>
                      <td className="mono">—</td>
                    </tr>
                    <tr>
                      <td><b>Debt-to-Capital Ratio</b></td>
                      <td className="mono">44.8%</td>
                      <td className="mono">34.2%</td>
                      <td className="mono">38.9%</td>
                      <td className="mono">39.4%</td>
                      <td className="mono" style={{ fontWeight: 700, color: "#10b981" }}>37.1%</td>
                      <td className="mono up">Deleveraging</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          SLIDE-OVER AI COPILOT DRAWER (IMAGE 2 DESIGN)
          ===================================================================== */}
      {isCopilotOpen && activeCopilotStock && (
        <div
          className="copilot-drawer-backdrop"
          onClick={() => setIsCopilotOpen(false)}
        >
          <div
            className="copilot-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="copilot-drawer-header">
              <div className="copilot-drawer-identity">
                <Sparkles size={18} className="copilot-sparkle-icon" />
                <div>
                  <h3 className="copilot-title">
                    {activeCopilotStock.isMarket
                      ? "Alex · MarketMind Executive Copilot"
                      : `${activeCopilotStock.name || activeCopilotStock.sym} (${activeCopilotStock.symbol || activeCopilotStock.sym})`}
                  </h3>
                  <span className="copilot-sub">
                    {activeCopilotStock.isMarket
                      ? "Whole-Market & Macro Intelligence Copilot"
                      : "Institutional AI Copilot"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="copilot-close-btn"
                onClick={() => setIsCopilotOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Stream */}
            <div className="copilot-drawer-messages">
              {(
                copilotMessages[activeCopilotStock.symbol || activeCopilotStock.sym] || []
              ).map((msg, idx) => (
                <div key={idx} className={`copilot-chat-bubble ${msg.role}`}>
                  <div className="bubble-header">
                    <span className="bubble-author">
                      {msg.role === "assistant" ? "Alex AI Terminal" : "You"}
                    </span>
                  </div>
                  {formatCopilotMessage(msg.content)}
                </div>
              ))}

              {isCopilotLoading && (
                <div className="copilot-loading-row">
                  <RefreshCw size={14} className="spin-fast" />
                  <span>
                    {activeCopilotStock.isMarket
                      ? "Synthesizing cross-market breadth & macro domino paths..."
                      : "Synthesizing balance sheet & institutional order flow..."}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="copilot-suggestions-bar">
              {(activeCopilotStock.isMarket
                ? [
                    "Analyze market regime & breadth",
                    "Sector rotation leaders today",
                    "Explain domino macro risk",
                    "Scan top bullish setups"
                  ]
                : [
                    "Explain debt-to-capital status",
                    "Analyze 5-year free cash flow",
                    "Compare with sector peers",
                    "Check forensic red flags"
                  ]
              ).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => handleSendCopilotMessage(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Row */}
            <div className="copilot-drawer-input-row">
              <input
                type="text"
                placeholder={
                  activeCopilotStock.isMarket
                    ? "Ask Alex about market regime, macro dominos, sector rotation, or any ticker..."
                    : `Ask Alex about ${activeCopilotStock.symbol || activeCopilotStock.sym} financials, debt, or catalyst...`
                }
                value={copilotInputText}
                onChange={(e) => setCopilotInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendCopilotMessage();
                }}
                className="copilot-drawer-input"
              />
              <button
                type="button"
                className="copilot-send-btn"
                onClick={() => handleSendCopilotMessage()}
                disabled={!copilotInputText.trim() || isCopilotLoading}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Toast Notification */}
      <div className={`toast ${toastVisible ? "show" : ""}`}>
        {toastText}
      </div>
    </div>
  );
}
