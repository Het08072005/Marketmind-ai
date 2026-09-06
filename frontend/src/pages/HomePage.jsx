import React, { useState, useEffect, useRef } from "react";
import logoImg from "../assets/marketmind-final-logo.png";
import "./HomePage.css";

const INTEL_DATA = {
  accounting: { chartType: "line", label: "Accounting Reality Checker", title: "Does reported profit behave like real cash?", desc: "Compares profit growth with operating cash flow, receivables, leverage, related-party disclosures and forensic accounting signals. It explains whether the numbers tell one coherent economic story.", why: "Fast profit growth is not automatically high-quality growth if cash conversion deteriorates at the same time.", stats: [["CFO / PAT", "1.12×"], ["Forensic state", "Clean"], ["Receivable signal", "Stable"], ["Confidence", "88%"]], axis: "5-year operating quality trend", path: "M0 205 C45 192 80 176 118 180 S185 145 220 148 S282 116 320 104 S345 92 360 88", dot: [360, 88] },
  dna: { chartType: "line", label: "Stock DNA Fingerprint", title: "Compare behavioural structure, not only valuation.", desc: "Normalizes growth, earnings quality, solvency, volatility, ownership, momentum and sentiment into a multi-dimensional fingerprint, then finds structural twins even across different sectors.", why: "Two stocks with different businesses can still behave similarly because their factor exposures and balance-sheet quality are alike.", stats: [["Top twin", "TCS 94%"], ["Earnings quality", "94/100"], ["Solvency", "96/100"], ["Momentum", "64/100"]], axis: "multi-factor similarity trajectory", path: "M0 190 C42 150 79 156 114 118 S187 135 220 102 S285 78 320 95 S346 76 360 64", dot: [360, 64] },
  news: { chartType: "line", label: "News Impact Intelligence", title: "Turn a headline into a portfolio-specific impact chain.", desc: "Scores relevance, direction, magnitude, confidence and time horizon; then maps the story to the companies and theses actually exposed instead of producing another undifferentiated news feed.", why: "A headline matters only when the system can explain which driver changed and who is exposed to that driver.", stats: [["Stories clustered", "18"], ["Holdings exposed", "3"], ["Highest impact", "−6.2%"], ["Confidence", "86%"]], axis: "news-to-price impact confidence", path: "M0 218 C44 212 74 190 106 194 S166 162 206 150 S270 102 313 110 S346 80 360 72", dot: [360, 72] },
  portfolio: { chartType: "line", label: "Portfolio Simulator & Macro Risk", title: "Stress the portfolio before the market does.", desc: "Runs historical and forward scenarios across asset weights, correlations, factor shocks and look-through dependencies to estimate drawdown, concentration and which positions dominate downside.", why: "Portfolio risk is not the average of individual stock risk when several holdings share the same hidden factor.", stats: [["Stress drawdown", "−6.42%"], ["99% 1D VaR", "₹1.48L"], ["Shared factor", "34%"], ["Resilience", "0.84"]], axis: "simulated portfolio path under stress", path: "M0 74 C50 80 78 88 112 100 S164 140 205 160 S255 192 292 178 S333 168 360 181", dot: [360, 181] },
  sector: { chartType: "line", label: "Sector Intelligence", title: "Model the margin transfer before consensus revisions.", desc: "Links raw materials, tariffs, demand variables and capital flows to sector economics, then estimates which companies receive or lose margin under a counterfactual scenario.", why: "Sector views become more useful when the system shows the operating mechanism rather than only relative price strength.", stats: [["Steel shock", "−10%"], ["Auto margin", "+180 bps"], ["PAT impact", "+₹1,420 Cr"], ["Confidence", "82%"]], axis: "counterfactual margin transfer", path: "M0 195 C50 190 80 174 110 168 S170 150 208 132 S269 112 310 90 S342 76 360 64", dot: [360, 64] },
  candles: { chartType: "candles", label: "Order-Flow Intelligence", title: "Professional price-structure analysis, not just candle names.", desc: "Maps each candle inside liquidity, VWAP, swing structure and absorption context. The goal is to explain whether buyers are reclaiming value, getting trapped into supply, or sweeping liquidity before continuation.", why: "Named candlestick patterns become more useful when combined with context such as reclaim, imbalance fill, wick rejection and closing strength.", stats: [["Pattern set", "Bullish engulfing"], ["VWAP gap", "+0.62%"], ["Liquidity sweep", "Completed"], ["Setup quality", "87/100"]], axis: "intraday structure · 5m candles", path: "M0 160 C24 160 40 92 62 130 S100 178 124 118 S160 80 184 144 S220 186 245 120 S289 90 315 118 S345 72 360 102", dot: [360, 102] },
  alerts: { chartType: "line", label: "Smart Alerts + Market Memory", title: "Alert only when several weak signals become one meaningful setup.", desc: "Combines current evidence with historical precedents, user theses and portfolio exposure. Alerts escalate when multiple independent signals converge rather than whenever one indicator flickers.", why: "The goal is fewer, deeper alerts with historical context — not more notifications.", stats: [["Analogue cycles", "5"], ["Pattern hit", "4 / 5"], ["60D edge", "+4.6%"], ["Priority", "High"]], axis: "historical precedent match strength", path: "M0 205 C40 180 74 188 110 152 S166 142 205 120 S260 130 302 92 S338 84 360 68", dot: [360, 68] },
  voice: { chartType: "line", label: "Voice Intelligence Assistant", title: "Ask the whole reasoning system one natural-language question.", desc: "The voice layer routes a spoken request to the appropriate capabilities, synthesizes their evidence and returns one consolidated answer instead of forcing the user to manually open separate tools.", why: "Voice becomes valuable when it can trigger real analysis, not when it merely reads a dashboard aloud.", stats: [["Capabilities routed", "4"], ["Evidence paths", "7"], ["Answer mode", "Sourced"], ["Demo latency", "1.2 s"]], axis: "query routing across intelligence capabilities", path: "M0 180 C42 160 74 168 110 122 S170 80 210 110 S270 140 310 90 S345 78 360 54", dot: [360, 54] },
  reports: { chartType: "line", label: "AI Reports + Learning Layer", title: "Turn the reasoning chain into a reviewable research dossier.", desc: "Generates a structured investment memo containing the thesis, supporting evidence, contradictions, sensitivities, red flags, dependency risks and the questions an investor should still answer.", why: "The report is assembled from the same live evidence graph, so it is a traceable synthesis rather than a generic text summary.", stats: [["Sections", "12"], ["Evidence links", "34"], ["Risk checks", "9"], ["Concept guides", "150+"]], axis: "evidence coverage across generated report", path: "M0 212 C44 200 80 176 116 160 S171 130 210 122 S262 96 303 78 S339 62 360 52", dot: [360, 52] },
};
const INTEL_KEYS = Object.keys(INTEL_DATA);

const STAGES = [
  { label: "Layer 01 · Observe", shortTitle: "Event Detected & Verified", title: "Event detected and cross-checked", text: "Brent crude rises 30% across the selected window. The event is cross-checked against price history, macro feeds and related news before being promoted into the reasoning layer.", m: [["Move significance", "2.9σ"], ["Sources matched", "42"], ["State", "Verified"]] },
  { label: "Layer 02 · Market Domino Predictor", shortTitle: "Causal Paths Expand", title: "Causal paths expand beyond the headline", text: "The system maps fuel cost, freight, petrochemical inputs, inflation, FX and sector pass-through. Aviation, paints and tyre makers become the first negative branches while refiners show a short-term inventory benefit.", m: [["Causal paths", "14"], ["Highest impact", "−6.2%"], ["Confidence", "89%"]] },
  { label: "Layer 04 · Portfolio mapping", shortTitle: "Portfolio Look-Through", title: "The event is matched to actual holdings", text: "Three of twelve positions sit inside affected paths. One airline holding has direct fuel sensitivity while two additional positions have secondary commodity or currency exposure.", m: [["Holdings checked", "12"], ["Directly exposed", "3"], ["Capital at risk", "21%"]] },
  { label: "Layer 02 · Hidden Dependency Graph", shortTitle: "Shared Factor Overlap", title: "A second risk channel appears", text: "Two of the affected holdings also share USD/INR sensitivity. The portfolio looked diversified by company name, but the same macro shock is now arriving through both commodity and currency channels.", m: [["Shared factor", "USD/INR"], ["Overlap", "34%"], ["Risk state", "Elevated"]] },
  { label: "Layer 02+03 · Thesis Integrity", shortTitle: "Thesis Integrity Re-Test", title: "The original investment thesis is re-tested", text: "The airline thesis assumed fuel cost normalization and stable FX. Both assumptions deteriorate simultaneously, moving thesis health from Intact to Watch before the next earnings report is published.", m: [["Health score", "68/100"], ["Assumptions hit", "2"], ["Status", "Watch"]] },
  { label: "Layer 05 · Delivery", shortTitle: "Evidence-Linked Alert", title: "One evidence-linked alert is generated", text: "Instead of six separate notifications, MarketMind synthesizes one alert: thesis risk is rising because fuel and currency pressures now reinforce each other. The report links back to every source and assumption.", m: [["Alerts merged", "6 → 1"], ["Evidence links", "34"], ["Action", "Review"]] },
];

const PROMISE_QUESTIONS = [
  {
    num: "01",
    question: "What happened?",
    answer: "MarketMind ingests streaming price action, filings, news feeds, and macro telemetry across global exchanges, isolating significant statistical anomalies and verifying event veracity before promoting the signal into the structured causal reasoning layer.",
  },
  {
    num: "02",
    question: "Why does it matter?",
    answer: "Raw price movements frequently mislead. We evaluate whether an event compresses gross margins, strains liquidity, or breaches debt covenants, separating transitory market sentiment from genuine structural impairment to long-term enterprise value.",
  },
  {
    num: "03",
    question: "What caused it?",
    answer: "Instead of accepting surface-level media narratives, our causal engine deconstructs commodity inputs, foreign exchange dynamics, supply disruptions, and policy shifts, building an auditable directed graph connecting underlying drivers to observed corporate performance.",
  },
  {
    num: "04",
    question: "Who is exposed?",
    answer: "Our look-through portfolio dependency engine traces direct equity holdings and indirect second-order counterparty linkages, identifying hidden concentrations in shared suppliers, imported commodities, or currency channels that conventional sector categorization completely ignores.",
  },
  {
    num: "05",
    question: "What could happen next?",
    answer: "Using historical failure analogies and multi-stage domino propagation models, the platform forecasts cascading margin transfers, earnings guidance revisions, and downstream credit risks, offering probabilistic scenario horizons rather than single-point lagging consensus estimates.",
  },
  {
    num: "06",
    question: "How confident are we?",
    answer: "Every generated insight carries a transparent epistemic confidence score synthesized from empirical sample density, source reliability, statistical significance, and historical analogue accuracy, empowering institutional allocators to calibrate position sizing with disciplined rigor.",
  },
  {
    num: "07",
    question: "What evidence supports it?",
    answer: "Every deduction links directly to primary sources: audited statutory financial filings, earnings conference call transcripts, customs trade ledgers, regulatory filings, and tick-by-tick order book data, guaranteeing strict forensic verifiability without generative hallucinations.",
  },
  {
    num: "08",
    question: "What would invalidate it?",
    answer: "Every thesis embeds explicit measurable invalidation thresholds such as unit economics decay or inventory divergence, alerting analysts immediately if real-world operating milestones contradict initial buy assumptions, preventing cognitive bias and costly holding drift.",
  },
];

const PAT = {
  engulfing: { name: "Bullish Engulfing", title: "Bullish Engulfing · VWAP reclaim", score: 87, bias: "Bullish", invalid: "₹2,910.50", volume: "1.42× avg", context: "VWAP reclaim", summary: "A lower-liquidity sweep is followed by a wide bullish body reclaiming VWAP. Volume expands into the close, so the pattern has stronger context than a standalone candle label.", interpretation: "Setup quality improves only if price holds above the reclaimed value area. A close back below ₹2,910.50 invalidates the bullish interpretation.", ohlc: [2940.4, 2954.8, 2937.1, 2948.3], hl: [12, 13], data: [[2928, 2934, 2923, 2931, 72], [2931, 2938, 2929, 2936, 65], [2936, 2942, 2933, 2939, 68], [2939, 2941, 2930, 2933, 81], [2933, 2938, 2928, 2935, 75], [2935, 2941, 2932, 2939, 70], [2939, 2944, 2936, 2942, 83], [2942, 2946, 2938, 2940, 76], [2940, 2943, 2934, 2936, 82], [2936, 2938, 2929, 2932, 92], [2932, 2935, 2925, 2928, 110], [2929, 2931, 2918, 2924, 138], [2923, 2952, 2921, 2948, 180], [2948, 2956, 2944, 2953, 148], [2953, 2959, 2948, 2956, 120], [2956, 2960, 2950, 2952, 104], [2952, 2958, 2947, 2955, 96], [2955, 2962, 2951, 2959, 112]] },
  hammer: { name: "Hammer", title: "Hammer · demand rejection at support", score: 82, bias: "Bullish", invalid: "₹2,902.20", volume: "1.31× avg", context: "Support rejection", summary: "Price sells below support, rejects the lower auction and closes back near the candle high. The long lower wick matters because it occurs after a controlled decline and on expanding volume.", interpretation: "The hammer is constructive only while the rejected low remains protected. Confirmation improves on a close above the next candle high.", ohlc: [2910.8, 2923.4, 2899.9, 2920.7], hl: [12, 12], data: [[2962, 2966, 2958, 2960, 74], [2960, 2961, 2954, 2956, 68], [2956, 2958, 2949, 2951, 71], [2951, 2954, 2945, 2948, 79], [2948, 2950, 2940, 2942, 83], [2942, 2946, 2937, 2940, 77], [2940, 2941, 2932, 2934, 88], [2934, 2937, 2928, 2930, 94], [2930, 2932, 2923, 2925, 102], [2925, 2928, 2918, 2920, 110], [2920, 2922, 2911, 2914, 126], [2914, 2917, 2905, 2910, 134], [2910, 2923, 2899, 2921, 174], [2921, 2928, 2918, 2926, 142], [2926, 2933, 2922, 2931, 119], [2931, 2937, 2928, 2935, 105], [2935, 2940, 2931, 2938, 99], [2938, 2944, 2934, 2942, 104]] },
  morning: { name: "Morning Star", title: "Morning Star · three-candle reversal", score: 84, bias: "Bullish", invalid: "₹2,887.80", volume: "1.36× avg", context: "3-candle reversal", summary: "A long bearish candle is followed by a small indecision candle and then a wide bullish reclaim. The third candle closes back through the first candle midpoint, improving reversal quality.", interpretation: "The reversal remains valid while price holds above the star low. A return below that low means the demand transition failed.", ohlc: [2908.3, 2932.6, 2902.4, 2928.9], hl: [10, 12], data: [[2965, 2968, 2959, 2962, 66], [2962, 2965, 2955, 2958, 68], [2958, 2960, 2950, 2952, 72], [2952, 2954, 2945, 2948, 78], [2948, 2950, 2939, 2942, 82], [2942, 2945, 2935, 2938, 84], [2938, 2940, 2929, 2932, 91], [2932, 2935, 2924, 2927, 98], [2927, 2930, 2917, 2920, 108], [2920, 2922, 2905, 2908, 136], [2908, 2911, 2895, 2899, 164], [2899, 2905, 2890, 2901, 132], [2902, 2933, 2900, 2929, 176], [2929, 2938, 2925, 2935, 138], [2935, 2942, 2930, 2939, 113], [2939, 2945, 2934, 2942, 102], [2942, 2948, 2937, 2946, 96], [2946, 2951, 2941, 2949, 91]] },
  doji: { name: "Doji", title: "Doji · indecision at resistance", score: 61, bias: "Neutral", invalid: "₹2,972.00", volume: "0.96× avg", context: "Resistance test", summary: "Open and close converge after a strong advance. This is not a reversal signal by itself; it marks balance at resistance and requires follow-through before direction can be inferred.", interpretation: "Wait for confirmation. A break above resistance with volume supports continuation; a close below the doji low shifts the setup toward rejection.", ohlc: [2964.2, 2974.8, 2955.7, 2964.8], hl: [12, 12], data: [[2918, 2926, 2915, 2924, 61], [2924, 2932, 2921, 2930, 67], [2930, 2938, 2927, 2935, 72], [2935, 2943, 2932, 2941, 74], [2941, 2948, 2938, 2946, 78], [2946, 2951, 2942, 2949, 76], [2949, 2957, 2947, 2955, 82], [2955, 2961, 2952, 2959, 88], [2959, 2968, 2957, 2965, 94], [2965, 2971, 2962, 2968, 99], [2968, 2975, 2964, 2972, 103], [2972, 2976, 2960, 2964, 118], [2964, 2975, 2956, 2965, 96], [2965, 2972, 2959, 2962, 92], [2962, 2969, 2958, 2967, 91], [2967, 2974, 2961, 2970, 93], [2970, 2976, 2965, 2972, 96], [2972, 2978, 2967, 2974, 99]] },
  bearish: { name: "Bearish Engulfing", title: "Bearish Engulfing · rejection from supply", score: 86, bias: "Bearish", invalid: "₹3,006.40", volume: "1.48× avg", context: "Supply rejection", summary: "A bullish candle into resistance is fully engulfed by a wider bearish body. The reversal has stronger context because it follows a liquidity grab above the prior swing high.", interpretation: "Bearish structure is valid below the engulfing high. Reclaiming ₹3,006.40 would invalidate the rejection thesis.", ohlc: [2999.4, 3005.8, 2978.6, 2982.2], hl: [11, 12], data: [[2922, 2930, 2919, 2928, 65], [2928, 2936, 2925, 2934, 69], [2934, 2942, 2931, 2940, 72], [2940, 2947, 2937, 2945, 76], [2945, 2953, 2942, 2951, 81], [2951, 2958, 2948, 2956, 82], [2956, 2964, 2953, 2962, 88], [2962, 2970, 2959, 2968, 91], [2968, 2978, 2965, 2976, 98], [2976, 2986, 2972, 2984, 105], [2984, 2994, 2981, 2992, 112], [2992, 3006, 2989, 3000, 128], [3001, 3005, 2978, 2982, 176], [2982, 2986, 2970, 2974, 141], [2974, 2978, 2964, 2968, 124], [2968, 2973, 2958, 2962, 117], [2962, 2968, 2953, 2957, 108], [2957, 2962, 2948, 2952, 103]] },
  shooting: { name: "Shooting Star", title: "Shooting Star · upper-wick rejection", score: 79, bias: "Bearish", invalid: "₹3,018.20", volume: "1.25× avg", context: "Upper liquidity sweep", summary: "Price sweeps above resistance but fails to hold the auction, leaving a long upper wick and weak close. The signal strengthens because volume rises during the rejection.", interpretation: "The rejection remains active below the wick high. A strong close above ₹3,018.20 cancels the bearish interpretation.", ohlc: [3004.4, 3018.2, 2997.6, 3000.1], hl: [12, 12], data: [[2930, 2937, 2927, 2935, 63], [2935, 2943, 2932, 2941, 68], [2941, 2949, 2938, 2947, 72], [2947, 2955, 2944, 2953, 76], [2953, 2961, 2950, 2959, 81], [2959, 2967, 2956, 2965, 84], [2965, 2973, 2962, 2971, 89], [2971, 2979, 2968, 2977, 93], [2977, 2987, 2974, 2985, 101], [2985, 2994, 2982, 2992, 108], [2992, 3002, 2989, 3000, 116], [3000, 3008, 2996, 3005, 121], [3005, 3018, 2997, 3000, 151], [3000, 3003, 2988, 2992, 137], [2992, 2997, 2982, 2986, 125], [2986, 2990, 2975, 2980, 116], [2980, 2985, 2969, 2974, 108], [2974, 2979, 2963, 2968, 101]] },
};

const VOICE_ANS = {
  "Check my HDFC thesis": "HDFC Bank thesis health is in Watch state in this demo because credit-to-deposit pressure is still above the preferred range, while asset quality remains stable. I would surface the LDR assumption first, then show the evidence and invalidation threshold.",
  "Show hidden dependencies": "The current demo portfolio has a 34% shared USD/INR dependency across several otherwise unrelated holdings. I would rank the overlap by centrality and show which positions create the concentration.",
  "Run accounting reality check": "The demo accounting check compares reported profit with cash conversion, receivables, leverage and forensic markers. The current sample reads as coherent, with CFO/PAT at 1.12× and no major receivable divergence.",
};

function AnimatedCounter({ target, decimals = 0, suffix = "", duration = 1200 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const animFrame = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        cancelAnimationFrame(animFrame.current);
        const t0 = performance.now();
        const tick = now => {
          const p = Math.min(1, (now - t0) / duration);
          setValue(parseFloat((target * (1 - Math.pow(1 - p, 3))).toFixed(decimals)));
          if (p < 1) animFrame.current = requestAnimationFrame(tick);
        };
        animFrame.current = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(animFrame.current);
        setValue(0);
      }
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => {
      cancelAnimationFrame(animFrame.current);
      obs.disconnect();
    };
  }, [target, decimals, duration]);

  return (
    <span ref={ref} className="anim-counter-val">
      <span className="anim-num">{value.toFixed(decimals)}</span>
      {suffix && <span className="pct-symbol">{suffix}</span>}
    </span>
  );
}

function TypeWriter({ text, speed = 11 }) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (timer.current) clearInterval(timer.current);
        let curr = 0;
        setDone(false);
        const burst = Math.max(2, Math.round(text.length / 90));
        timer.current = setInterval(() => {
          curr = Math.min(curr + burst, text.length);
          setOut(text.slice(0, curr));
          if (curr >= text.length) {
            clearInterval(timer.current);
            setDone(true);
          }
        }, speed);
      } else {
        if (timer.current) clearInterval(timer.current);
        setOut("");
        setDone(false);
      }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => {
      if (timer.current) clearInterval(timer.current);
      obs.disconnect();
    };
  }, [text, speed]);

  return <span ref={ref} className={"type-line" + (done ? "" : " type-caret")}>{out}</span>;
}

function Reveal({ children, dir = "", className = "" }) {
  const ref = useRef(null);
  const [iv, setIv] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setIv(entry.isIntersecting);
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cls = dir === "left" ? "rev-left" : dir === "right" ? "rev-right" : "rev-up";
  return (
    <div
      ref={ref}
      data-reveal={dir || "up"}
      className={`${cls}${iv ? " in-view" : ""}${className ? " " + className : ""}`}
    >
      {children}
    </div>
  );
}

function CandleChart({ patKey, currentPrice, isUp }) {
  const p = PAT[patKey]; if (!p) return null;
  const rawData = p.data;
  const data = rawData.map((d, i) => {
    if (i === rawData.length - 1 && currentPrice) {
      const o = d[0];
      const c = currentPrice;
      const h = Math.max(d[1], c, o);
      const l = Math.min(d[2], c, o);
      return [o, h, l, c, d[4]];
    }
    return d;
  });
  const low = Math.min(...data.map(d => d[2])) - 5; const high = Math.max(...data.map(d => d[1])) + 5;
  const L = 44, R = 760, T = 24, B = 372, VT = 388, VB = 446; const xStep = (R - L) / data.length; const bw = Math.max(7, xStep * 0.46);
  const yf = v => B - ((v - low) / (high - low)) * (B - T); const maxV = Math.max(...data.map(d => d[4])); const fmt = n => n.toFixed(1);
  const grid = [];
  for (let i = 0; i < 5; i++) { const yy = T + i * (B - T) / 4; const pr = high - (high - low) * i / 4; grid.push(<React.Fragment key={i}><line className="pattern-grid" x1={L} y1={yy} x2={R} y2={yy} /><text className="pattern-axis" x={R + 8} y={yy + 3}>{fmt(pr)}</text></React.Fragment>); }
  for (let i = 0; i <= 6; i++) { const xx = L + i * (R - L) / 6; grid.push(<line key={"vg" + i} className="pattern-grid" x1={xx} y1={T} x2={xx} y2={B} />); }
  const candles = [], vols = [], cpts = [];
  data.forEach(([o, h, l, c, v], i) => {
    const isLast = i === data.length - 1;
    const x = L + xStep * i + xStep / 2, up = c >= o; const yo = yf(o), yc = yf(c), yh = yf(h), yl = yf(l);
    candles.push(<React.Fragment key={i}><line className={"pattern-wick-" + (up ? "up" : "down") + (isLast ? " live-wick" : "")} x1={x} y1={yh} x2={x} y2={yl} /><rect className={"pattern-body-" + (up ? "up" : "down") + (isLast ? " live-candle-body" : "")} x={x - bw / 2} y={Math.min(yo, yc)} width={bw} height={Math.max(2, Math.abs(yc - yo))} rx="1.3" /></React.Fragment>);
    const vh = (v / maxV) * (VB - VT); vols.push(<rect key={i} className={"pattern-volume" + (i >= p.hl[0] && i <= p.hl[1] ? " hot" : "") + (isLast ? " live-vol" : "")} x={x - bw / 2} y={VB - vh} width={bw} height={vh} rx="1" />);
    cpts.push([x, yf(c)]);
  });
  const vwapD = cpts.map(([x], i) => { const s = Math.max(0, i - 4); const avg = data.slice(s, i + 1).reduce((a, d) => a + d[3], 0) / (i - s + 1); return (i ? "L" : "M") + x + " " + yf(avg); }).join(" ");
  const h1 = L + xStep * p.hl[0], h2 = L + xStep * (p.hl[1] + 1);
  const sup = yf(Math.min(...data.slice(Math.max(0, p.hl[0] - 2), p.hl[1] + 2).map(d => d[2])));
  const lc = data[data.length - 1][3], ly = yf(lc);
  const isLastUp = lc >= data[data.length - 1][0];
  const tagClass = isLastUp ? "up" : "down";
  return (
    <svg className="pattern-chart" viewBox="0 0 820 470">
      {grid}<rect className="pattern-highlight" x={h1} y={T + 4} width={h2 - h1} height={B - T - 8} rx="5" />
      <line className="pattern-support" x1={L} y1={sup} x2={R} y2={sup} /><path className="pattern-vwap" d={vwapD} />
      {candles}<line className="pattern-grid" x1={L} y1={VT - 5} x2={R} y2={VT - 5} />{vols}
      <line className={"pattern-price-line " + tagClass} x1={L} y1={ly} x2={R} y2={ly} />
      <circle className={"pattern-live-ripple " + tagClass} cx={R} cy={ly} />
      <circle className={"pattern-live-dot " + tagClass} cx={R} cy={ly} />
      <rect className={"pattern-price-tag " + tagClass} x={R + 4} y={ly - 9} width={50} height={18} rx="3" />
      <text className="pattern-price-tag-text" x={R + 10} y={ly + 3}>{fmt(lc)}</text>
      <rect className="pattern-label-bg" x={Math.max(L, h1 - 4)} y={T + 8} width={118} height={20} rx="10" />
      <text className="pattern-label" x={Math.max(L + 8, h1 + 5)} y={T + 21}>{p.name.toUpperCase()}</text>
      <text className="pattern-chart-note" x={L} y={466}>VWAP · volume · support/resistance · pattern window highlighted</text>
    </svg>
  );
}

function MiniLine({ path, dot, axis }) {
  const lr = useRef(null);
  useEffect(() => {
    const el = lr.current;
    if (!el) return;
    el.style.strokeDasharray = "550";
    el.style.strokeDashoffset = "550";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.transition = "stroke-dashoffset 1s ease";
        el.style.strokeDashoffset = "0";
      })
    );
  }, [path]);

  return (
    <svg viewBox="0 0 360 260" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="miniArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5BD6FF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#5BD6FF" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <g className="mini-grid">
        <line x1="0" y1="50" x2="360" y2="50" />
        <line x1="0" y1="105" x2="360" y2="105" />
        <line x1="0" y1="160" x2="360" y2="160" />
        <line x1="0" y1="215" x2="360" y2="215" />
      </g>
      <path className="mini-area" d={path + " L360 260 L0 260Z"} />
      <path ref={lr} className="mini-line" d={path} />
      <circle cx={dot[0]} cy={dot[1]} r="11" fill="none" stroke="#5BD6FF" strokeWidth="1.5" opacity="0.45" className="pulse-beacon" />
      <circle className="mini-dot" cx={dot[0]} cy={dot[1]} r="5" />
      <text className="mini-label" x="14" y="242">{axis ? axis.toUpperCase() : ""}</text>
    </svg>
  );
}
function MiniCandle() {
  const candles = [
    { x: 26, o: 154, c: 130, h: 122, l: 168, up: true },
    { x: 56, o: 144, c: 118, h: 110, l: 156, up: true },
    { x: 86, o: 136, c: 110, h: 102, l: 148, up: true },
    { x: 116, o: 112, c: 136, h: 106, l: 144, up: false }, // bear pullback
    { x: 150, o: 132, c: 104, h: 96, l: 140, up: true },
    { x: 184, o: 114, c: 84, h: 76, l: 122, up: true },
    { x: 218, o: 96, c: 68, h: 60, l: 106, up: true },
    { x: 252, o: 78, c: 50, h: 42, l: 88, up: true },
  ];

  return (
    <svg viewBox="0 0 360 260" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="bullCandleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id="bearCandleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <filter id="bullGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22C55E" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Grid Lines */}
      <line x1="0" y1="55" x2="360" y2="55" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <line x1="0" y1="105" x2="360" y2="105" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <line x1="0" y1="155" x2="360" y2="155" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <line x1="0" y1="205" x2="360" y2="205" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

      {/* VWAP Dynamic Line */}
      <path
        d="M 15 142 C 70 132, 130 116, 185 96 S 260 68, 335 56"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="1.8"
        strokeDasharray="4 4"
      />
      {/* VWAP Badge */}
      <rect x="275" y="44" width="46" height="18" rx="4" fill="rgba(56,189,248,0.16)" stroke="rgba(56,189,248,0.45)" strokeWidth="1" />
      <text x="298" y="56" textAnchor="middle" fill="#38BDF8" fontSize="8.5" fontWeight="700" fontFamily="var(--font-body)">VWAP</text>

      {/* Candlesticks */}
      {candles.map((c, i) => {
        const isUp = c.up;
        const color = isUp ? "#22C55E" : "#EF4444";
        const fill = isUp ? "url(#bullCandleGrad)" : "url(#bearCandleGrad)";
        const yTop = Math.min(c.o, c.c);
        const height = Math.max(4, Math.abs(c.c - c.o));
        const bw = 12;
        const isLast = i === candles.length - 1;

        return (
          <g key={i} filter={isLast ? "url(#bullGlow)" : "none"}>
            {/* Wick */}
            <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Body */}
            <rect
              x={c.x - bw / 2}
              y={yTop}
              width={bw}
              height={height}
              rx="2"
              fill={fill}
              stroke={color}
              strokeWidth="1"
            />
            {/* Volume Histogram Bar at Bottom */}
            <rect
              x={c.x - bw / 2}
              y={205 - (isUp ? (16 + i * 3.5) : 14)}
              width={bw}
              height={isUp ? (16 + i * 3.5) : 14}
              rx="1.5"
              fill={isUp ? "rgba(34, 197, 94, 0.45)" : "rgba(239, 68, 68, 0.45)"}
            />
          </g>
        );
      })}

      {/* Volume Baseline */}
      <line x1="15" y1="205" x2="345" y2="205" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      {/* Time Axis Labels */}
      <g fontFamily="var(--font-body)" fontSize="8.5" fontWeight="600" fill="#7E94BD">
        <text x="26" y="238">09:30</text>
        <text x="116" y="238">11:00</text>
        <text x="184" y="238">13:00</text>
        <text x="252" y="238">15:30</text>
      </g>
    </svg>
  );
}

export default function HomePage({ goPage, openAssistant }) {
  const [activeIntel, setActiveIntel] = useState("accounting");
  const [intelManual, setIntelManual] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [stageManual, setStageManual] = useState(false);
  const [activePat, setActivePat] = useState("engulfing");
  const [activeTf, setActiveTf] = useState("5m");
  const [scrollPct, setScrollPct] = useState(0);
  const [labPrice, setLabPrice] = useState(2948.30);
  const [labChange, setLabChange] = useState("+1.24%");
  const [labUp, setLabUp] = useState(true);
  const [labClock, setLabClock] = useState("LIVE FEED");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceAns, setVoiceAns] = useState("I would trace the crude shock through fuel, FX, sectors and your holdings, then re-test any affected investment thesis. Aviation is the first high-sensitivity path and three positions share related exposure.");
  const [watchIdx, setWatchIdx] = useState(0);
  const [navActive, setNavActive] = useState("top");
  const [openQs, setOpenQs] = useState({ 0: true });

  const toggleQ = (idx) => {
    setOpenQs(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const p = PAT[activePat]; const intel = INTEL_DATA[activeIntel]; const fmt1 = n => n.toFixed(1);

  const [watchlistData, setWatchlistData] = useState([
    { sym: "RELIANCE", name: "Reliance Industries", base: 2912.20, price: 2953.88, chg: 1.43, up: true, tickFlash: "" },
    { sym: "HDFCBANK", name: "HDFC Bank", base: 1619.70, price: 1612.40, chg: -0.45, up: false, tickFlash: "" },
    { sym: "TCS", name: "Tata Consultancy", base: 4146.50, price: 4180.50, chg: 0.82, up: true, tickFlash: "" },
    { sym: "INFY", name: "Infosys", base: 1855.90, price: 1892.10, chg: 1.95, up: true, tickFlash: "" },
    { sym: "INDIGO", name: "InterGlobe Aviation", base: 4479.60, price: 4426.75, chg: -1.18, up: false, tickFlash: "" },
  ]);

  useEffect(() => {
    const fn = () => {
      const root = document.documentElement; const max = root.scrollHeight - root.clientHeight;
      setScrollPct(max > 0 ? (root.scrollTop / max) * 100 : 0);
      let cur = "top"; document.querySelectorAll("[data-section]").forEach(s => { if (s.getBoundingClientRect().top <= 155) cur = s.dataset.section; }); setNavActive(cur);
    };
    window.addEventListener("scroll", fn, { passive: true }); fn(); return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { if (intelManual) return; const t = setInterval(() => setActiveIntel(k => INTEL_KEYS[(INTEL_KEYS.indexOf(k) + 1) % INTEL_KEYS.length]), 6500); return () => clearInterval(t); }, [intelManual]);
  useEffect(() => { if (stageManual) return; const t = setInterval(() => setActiveStage(i => (i + 1) % STAGES.length), 7000); return () => clearInterval(t); }, [stageManual]);
  useEffect(() => {
    let currentRelPrice = 2953.88;
    const base = 2912.20;
    const t = setInterval(() => {
      const relDelta = (Math.random() - 0.47) * 1.85;
      currentRelPrice = +(currentRelPrice + relDelta).toFixed(2);
      setLabPrice(currentRelPrice);
      const relPct = +(((currentRelPrice / base) - 1) * 100).toFixed(2);
      const isUp = relPct >= 0;
      setLabChange((isUp ? "+" : "") + relPct.toFixed(2) + "%");
      setLabUp(isUp);
      setLabClock("LIVE FEED · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

      setWatchlistData(prev => {
        const pickIdx = Math.floor(Math.random() * (prev.length - 1)) + 1;
        return prev.map((item, idx) => {
          if (idx === 0) {
            return {
              ...item,
              price: currentRelPrice,
              chg: relPct,
              up: isUp,
              tickFlash: relDelta >= 0 ? "tick-green" : "tick-red"
            };
          }
          if (idx === pickIdx) {
            const delta = (Math.random() - 0.48) * (item.price * 0.0012);
            const np = +(item.price + delta).toFixed(2);
            const nChg = +(((np / item.base) - 1) * 100).toFixed(2);
            return {
              ...item,
              price: np,
              chg: nChg,
              up: nChg >= 0,
              tickFlash: delta >= 0 ? "tick-green" : "tick-red"
            };
          }
          return { ...item, tickFlash: "" };
        });
      });
    }, 1350);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { const fn = e => { if (e.key === "Escape") setVoiceOpen(false); }; document.addEventListener("keydown", fn); return () => document.removeEventListener("keydown", fn); }, []);

  const scrollTo = id => { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 72, behavior: "smooth" }); };

  return (
    <div className="marketmind-home-root">
      <div id="scrollProgress" style={{ width: `${scrollPct}%` }} />
      <header className="site-nav"><div className="container nav-inner">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <img src={logoImg} alt="MarketMind AI" style={{ height: "36px", width: "auto" }} />
        </button>
        <nav className="nav-links">
          {[["Intelligence", "intelligence"], ["Architecture", "architecture"], ["Live Scenario", "scenario"], ["Candles", "candlestick-lab"], ["How it works", "how"]].map(([lbl, sec]) => (
            <button key={sec} onClick={() => scrollTo(sec)} className={navActive === sec ? "active" : ""}>{lbl}</button>
          ))}
        </nav>
      </div></header>

      <main id="top">
        <section className="hero" data-section="top"><div className="container hero-grid">
          <div className="hero-copy">
            <Reveal><h1>Markets give you data. <span className="hero-highlight">MarketMind explains the chain behind it.</span></h1></Reveal>
            <p className="hero-lead"><TypeWriter text="MarketMind AI connects market events, financial statements, management commentary, historical failures, hidden dependencies and your portfolio into one evidence-linked reasoning layer — so you can understand what moved, why it matters, what could move next, and what would invalidate the conclusion." /></p>
            <Reveal><div className="hero-actions">
              <button className="primary-btn" onClick={() => { if (goPage) goPage("dashboard"); else window.location.hash = "dashboard"; }}>Explore intelligence <span>→</span></button>
            </div></Reveal>
            <Reveal><div className="hero-proof">
              <div className="proof"><span className="proof-icon">01</span><span><b>Evidence-linked</b><br />Every conclusion shows why</span></div>
              <div className="proof"><span className="proof-icon">02</span><span><b>Portfolio-aware</b><br />Signals mapped to exposure</span></div>
              <div className="proof"><span className="proof-icon">03</span><span><b>Counter-thesis first</b><br />Looks for what can break</span></div>
            </div></Reveal>
          </div>
          <Reveal dir="right"><div className="reasoning-shell">
            <div className="reasoning-head"><div className="title"><span className="live-pulse" />MarketMind Intelligence Graph</div><span className="demo-badge">live telemetry</span></div>
            <div className="reasoning-visual">
              <svg viewBox="0 0 540 210" aria-label="MarketMind Causal Reasoning Graph">
                <path className="net-line hot" d="M65 95 C120 58 160 52 205 52" />
                <path className="net-line hot" d="M205 52 C255 52 295 52 340 52" />
                <path className="net-line hot" d="M340 52 C390 52 425 52 470 52" />
                <path className="net-line" d="M65 95 C115 130 155 152 215 152" />
                <path className="net-line" d="M215 152 C275 152 335 152 395 152" />
                <path className="net-line" d="M470 52 C485 105 450 135 395 152" />

                <g className="net-node" transform="translate(65,95)"><circle r="30" /><text textAnchor="middle" y="-3">EVENT</text><text className="value" textAnchor="middle" y="12">Crude +14%</text></g>
                <g className="net-node" transform="translate(205,52)"><circle r="27" /><text textAnchor="middle" y="-3">COST DRIVER</text><text className="value" textAnchor="middle" y="12">ATF ↑</text></g>
                <g className="net-node" transform="translate(340,52)"><circle r="28" /><text textAnchor="middle" y="-3">SECTOR</text><text className="value" textAnchor="middle" y="12">Aviation</text></g>
                <g className="net-node" transform="translate(470,52)"><circle r="29" /><text textAnchor="middle" y="-3">COMPANY</text><text className="value" textAnchor="middle" y="12">INDIGO</text></g>
                <g className="net-node" transform="translate(215,152)"><circle r="27" /><text textAnchor="middle" y="-3">FX CHANNEL</text><text className="value" textAnchor="middle" y="12">INR −0.8%</text></g>
                <g className="net-node" transform="translate(395,152)"><circle r="28" /><text textAnchor="middle" y="-3">PORTFOLIO</text><text className="value" textAnchor="middle" y="12">3 exposed</text></g>
              </svg>
            </div>
            <div className="reasoning-console">
              <div className="console-line"><span className="tag">OBSERVE</span><span>Brent move exceeds <b>2.4σ</b> of 60-day daily returns.</span></div>
              <div className="console-line"><span className="tag">CONNECT</span><span>Fuel + FX overlap raises airline input-cost sensitivity.</span></div>
              <div className="console-line"><span className="tag">REASON</span><TypeWriter text="Portfolio impact is concentrated in three holdings; thesis risk rises first in the airline exposure." speed={19} /></div>
            </div>
            <div className="reasoning-metrics">
              <div className="reasoning-metric">
                <small>Evidence sources</small>
                <div className="reasoning-metric-row">
                  <strong><AnimatedCounter target={42} /></strong>
                  <span className="metric-unit">data inputs</span>
                </div>
              </div>
              <div className="reasoning-metric">
                <small>Reasoning confidence</small>
                <div className="reasoning-metric-row">
                  <strong><AnimatedCounter target={91.6} decimals={1} suffix="%" /></strong>
                </div>
              </div>
              <div className="reasoning-metric">
                <small>Portfolio paths found</small>
                <div className="reasoning-metric-row">
                  <strong><AnimatedCounter target={7} /></strong>
                  <span className="metric-unit">causal links</span>
                </div>
              </div>
            </div>
          </div></Reveal>
        </div></section>

        {/* LIVE MARKET RIBBON (In Scroll Flow) */}
        <div className="market-ribbon"><div className="ribbon-track">
          {[0, 1].map(ri => (<React.Fragment key={ri}>
            <div className="ribbon-item"><span className="ribbon-dot" /><b>NIFTY 50</b><span className="up">+0.64%</span></div>
            <div className="ribbon-item"><b>RELIANCE</b><span className="up">₹2,948 · +1.24%</span></div>
            <div className="ribbon-item"><b>HDFCBANK</b><span className="down">₹1,612 · −0.45%</span></div>
            <div className="ribbon-item"><b>BRENT</b><span className="down">$82.4 · +2.10%</span></div>
            <div className="ribbon-item"><b>USD/INR</b><span className="flag-num">83.88</span></div>
            <div className="ribbon-item"><b>INFY</b><span className="up">₹1,892 · +1.95%</span></div>
            <div className="ribbon-item"><span className="ribbon-alert-badge">Pattern watch · cash-flow divergence detected</span></div>
          </React.Fragment>))}
        </div></div>

        {/* PROBLEM */}
        <section className="section problem-stage" data-section="intelligence"><div className="container problem-layout">
          <Reveal dir="left" className="problem-copy">
            <div className="kicker">The problem MarketMind is built to solve</div>
            <h2>Investors do not lack information. They lack <span style={{ color: "var(--blue)" }}>connected reasoning.</span></h2>
            <p className="problem-lead-text"><TypeWriter text="A chart knows the move. A news feed knows the headline. A filing knows the numbers. Your notes know why you bought. Existing tools usually keep those facts in separate screens. MarketMind connects them into one traceable decision context." speed={11} /></p>
            <div className="problem-questions">
              {[["01", "What actually caused the move?", "usually separate"], ["02", "Which portfolio holdings share the same hidden risk?", "often invisible"], ["03", "Is management keeping earlier commitments?", "manual memory"], ["04", "Is the investment thesis weakening before price reacts?", "rarely tracked"], ["05", "What evidence would prove the conclusion wrong?", "missing in feeds"]].map(([num, q, s]) => (
                <div className="question-row" key={num}><span className="qnum">{num}</span><span>{q}</span><span className="qstate">{s}</span></div>
              ))}
            </div>
          </Reveal>
          <div className="connection-map">
            <svg viewBox="0 0 620 520" preserveAspectRatio="none">
              <path className="causal-path" d="M95 95 C180 130 205 175 260 225" /><path className="causal-path" d="M410 72 C365 115 330 160 280 220" />
              <path className="causal-path focus" d="M270 230 C330 250 410 240 515 240" />
              <path className="causal-path" d="M115 365 C170 320 210 280 265 235" /><path className="causal-path" d="M425 370 C360 330 325 285 275 235" />
              <path className="causal-path focus" d="M515 240 C520 302 490 350 425 370" />
            </svg>
            <div className="map-node n1"><b>Market event</b>Crude +14% in 5 sessions</div>
            <div className="map-node n2"><b>Management commentary</b>Fuel hedge coverage 24%</div>
            <div className="map-node n3"><b>Reasoning layer</b>Causal + contradiction checks</div>
            <div className="map-node n4"><b>Financials</b>Fuel = 40% of opex</div>
            <div className="map-node n5"><b>Hidden dependency</b>USD/INR overlap</div>
            <div className="map-node n6"><b>Portfolio</b>3 positions affected</div>
            <div className="map-summary"><span>CONNECTED OUTPUT</span><strong>Airline thesis risk rising before earnings reset</strong><strong className="risk">Watch</strong></div>
          </div>
        </div></section>

        {/* CAPABILITIES */}
        <section className="section capabilities" id="intelligence" data-section="intelligence"><div className="container">
          <div className="section-head">
            <div><div className="kicker">Core intelligence capabilities</div><Reveal><h2>Six capabilities that turn disconnected signals into a reasoning chain.</h2></Reveal></div>
            <Reveal dir="right"><p className="side-note">Each capability answers a different investment question, but all write back into the same evidence layer. A signal in one capability can automatically trigger checks in the others.</p></Reveal>
          </div>

          <article className="capability" id="domino"><div className="capability-grid">
            <Reveal dir="left" className="cap-copy">
              <div className="cap-no">01 · Market Domino Predictor</div><h3>Trace the chain reaction, not just the headline.</h3>
              <p className="type-line"><TypeWriter text="Feed in one event and MarketMind maps first-, second-, third- and fourth-order effects across business drivers, sectors, companies and your own portfolio — with direction, magnitude, confidence and time horizon attached to every link." /></p>
              <div className="cap-diff"><strong>Different from a news impact score:</strong> it follows the event beyond the first obvious company through secondary and tertiary effects.</div>
              <div style={{ marginTop: "20px" }}><button className="primary-btn" onClick={() => goPage && goPage("domino")}>Open Domino Predictor <span>→</span></button></div>
            </Reveal>
            <Reveal dir="right" className="cap-visual">
              <div className="visual-top"><div className="title"><i />Crude-shock propagation graph</div><span className="demo">illustrative market data</span></div>
              <div className="domino-canvas"><div className="domino-bg" />
                <svg className="domino-svg" viewBox="0 0 620 360">
                  <path className="domino-edge active" d="M74 176 C145 82 190 80 245 110" /><path className="domino-edge active" d="M74 176 C150 250 195 248 260 238" />
                  <path className="domino-edge" d="M245 110 C330 96 350 112 410 126" /><path className="domino-edge active" d="M245 110 C300 145 330 160 385 188" />
                  <path className="domino-edge" d="M260 238 C330 250 365 240 428 224" /><path className="domino-edge active" d="M410 126 C500 122 520 110 570 92" />
                  <path className="domino-edge" d="M385 188 C485 184 515 210 560 242" />
                  <g className="dn hot" transform="translate(74,176)"><circle r="40" /><text textAnchor="middle" y="-8">EVENT</text><text className="impact neg" textAnchor="middle" y="8">Brent +14%</text><text className="sub" textAnchor="middle" y="23">T+0</text></g>
                  <g className="dn" transform="translate(245,110)"><circle r="38" /><text textAnchor="middle" y="-8">AVIATION FUEL</text><text className="impact neg" textAnchor="middle" y="8">+11.2%</text><text className="sub" textAnchor="middle" y="23">cost input</text></g>
                  <g className="dn" transform="translate(260,238)"><circle r="38" /><text textAnchor="middle" y="-8">REFINING</text><text className="impact pos" textAnchor="middle" y="8">+3.9%</text><text className="sub" textAnchor="middle" y="23">inventory</text></g>
                  <g className="dn" transform="translate(410,126)"><circle r="36" /><text textAnchor="middle" y="-7">INDIGO</text><text className="impact neg" textAnchor="middle" y="8">−6.2%</text><text className="sub" textAnchor="middle" y="23">T+0 to T+2</text></g>
                  <g className="dn" transform="translate(385,188)"><circle r="36" /><text textAnchor="middle" y="-7">PAINTS</text><text className="impact neg" textAnchor="middle" y="8">−4.8%</text><text className="sub" textAnchor="middle" y="23">T+1 to T+4</text></g>
                  <g className="dn" transform="translate(570,92)"><circle r="35" /><text textAnchor="middle" y="-7">TOURISM</text><text className="impact neg" textAnchor="middle" y="8">−1.7%</text><text className="sub" textAnchor="middle" y="23">secondary</text></g>
                  <g className="dn" transform="translate(560,242)"><circle r="35" /><text textAnchor="middle" y="-7">PORTFOLIO</text><text className="impact neg" textAnchor="middle" y="8">3 exposed</text><text className="sub" textAnchor="middle" y="23">2 overlapping</text></g>
                </svg>
                <div className="domino-footer"><span><b>Highest sensitivity:</b> aviation + paints</span><span><b>Confidence:</b> <span className="confidence"><AnimatedCounter target={89.4} decimals={1} suffix="%" /></span></span></div>
              </div>
            </Reveal>
          </div></article>

          <article className="capability reverse" id="thesis"><div className="capability-grid">
            <Reveal dir="right" className="cap-copy">
              <div className="cap-no">02 · Thesis Integrity Engine</div><h3>Monitor why you bought, not only the price.</h3>
              <p className="type-line"><TypeWriter text="MarketMind stores the actual investment thesis, converts it into measurable assumptions, and continuously checks whether revenue growth, margins, leverage, market share, regulation or management execution are strengthening or weakening that thesis." /></p>
              <div className="cap-facts"><div className="cap-fact"><b>Problem solved</b><span>Investors often remember the price target but forget the assumptions behind it.</span></div><div className="cap-fact"><b>What we build</b><span>A thesis ledger with measurable claims, thresholds and explicit invalidation conditions.</span></div><div className="cap-fact"><b>Output</b><span>Intact, Watch, Weakening or Broken — plus the exact assumption causing the change.</span></div></div>
              <div className="cap-diff"><strong>Different from a stop-loss:</strong> the alert can fire because the business thesis deteriorated even while the share price still looks healthy.</div>
            </Reveal>
            <Reveal dir="left" className="cap-visual">
              <div className="visual-top"><div className="title"><i />Thesis health · RELIANCE</div><span className="demo">auto re-evaluation</span></div>
              <div className="thesis-ui">
                <div className="thesis-header">
                  <div><div className="ticker-name">RELIANCE <span>Consumer + digital compounding thesis</span></div><div className="thesis-quote">“Jio ARPU expands while retail EBITDA margin sustains above the defined floor.”</div></div>
                  <div className="health-ring"><svg viewBox="0 0 100 100"><circle className="bg" cx="50" cy="50" r="40" /><circle className="fg" cx="50" cy="50" r="40" /></svg><div className="health-value"><strong><AnimatedCounter target={68} /></strong><span className="gauge-label">health</span></div></div>
                </div>
                <div className="thesis-market-grid">
                  <div className="thesis-price-chart">
                    <div className="chart-title-row"><span>Price vs thesis floor</span><b>₹2,948.30 <em>+1.24%</em></b></div>
                    <svg viewBox="0 0 420 180"><g className="t-grid"><line x1="0" y1="35" x2="420" y2="35" /><line x1="0" y1="80" x2="420" y2="80" /><line x1="0" y1="125" x2="420" y2="125" /></g><path className="t-area" d="M0 142 C38 136 62 122 96 125 S150 98 185 103 S236 72 274 82 S329 58 362 62 S397 42 420 48 L420 180 L0 180Z" /><path className="t-price" d="M0 142 C38 136 62 122 96 125 S150 98 185 103 S236 72 274 82 S329 58 362 62 S397 42 420 48" /><line className="t-floor" x1="0" y1="151" x2="420" y2="151" /><text className="t-label" x="8" y="166">THESIS FLOOR ₹2,810</text><circle className="t-point" cx="420" cy="48" r="4" /><text className="t-last" x="342" y="38">CURRENT</text></svg>
                  </div>
                  <div className="assumption-list">
                    <div className="assumption"><span>Jio ARPU remains above ₹205</span><strong className="ok">PASS · ₹211</strong></div>
                    <div className="assumption"><span>Retail EBITDA margin ≥ 8.0%</span><strong className="watch">WATCH · 7.8%</strong></div>
                    <div className="assumption"><span>Net debt / EBITDA below 1.85×</span><strong className="watch">1.72×</strong></div>
                    <div className="assumption"><span>O2C GRM does not stay below $7.5/bbl</span><strong className="ok">SAFE</strong></div>
                  </div>
                </div>
                <div className="invalidation"><span>PRICE-BASED FLOOR<b className="red">₹2,810</b></span><span>BUSINESS INVALIDATION<b>2 assumptions breach</b></span><span>CURRENT STATE<b style={{ color: "var(--amber)" }}>WATCH</b></span></div>
              </div>
            </Reveal>
          </div></article>

          <article className="capability" id="trust"><div className="capability-grid">
            <Reveal dir="left" className="cap-copy">
              <div className="cap-no">03 · Management Trust Ledger</div><h3>Give management commentary a memory.</h3>
              <p className="type-line"><TypeWriter text="Every measurable promise from earnings calls, investor presentations, annual reports and filings is captured as Promise → Date → Target → Deadline → Result → Status. A polished quarter can no longer erase years of missed guidance." /></p>
              <div className="cap-facts"><div className="cap-fact"><b>Problem solved</b><span>Management credibility is qualitative, scattered and difficult to remember over multiple years.</span></div><div className="cap-fact"><b>What we build</b><span>A structured commitment timeline with target extraction and outcome verification.</span></div><div className="cap-fact"><b>Output</b><span>Kept, delayed, revised and missed commitments with a transparent trust score.</span></div></div>
              <div className="cap-diff"><strong>Different from sentiment analysis:</strong> it scores whether management actually delivered what it previously promised.</div>
            </Reveal>
            <Reveal dir="right" className="cap-visual">
              <div className="visual-top"><div className="title"><i />Management commitment history</div><span className="demo">3-year memory</span></div>
              <div className="trust-ui">
                <div className="trust-score"><svg viewBox="0 0 160 160"><defs><linearGradient id="sG"><stop offset="0" stopColor="#2E63FF" /><stop offset="1" stopColor="#5BD6FF" /></linearGradient></defs><circle className="bg" cx="80" cy="80" r="68" /><circle className="fg" cx="80" cy="80" r="68" /></svg><div className="trust-center"><strong><AnimatedCounter target={72} /></strong><span className="gauge-label">trust score</span></div></div>
                <div className="promise-stream">
                  <div className="promise-row kept"><b>FY24 capex discipline</b>Target ≤ ₹95k Cr · delivered ₹92k Cr <span>KEPT</span></div>
                  <div className="promise-row kept"><b>Retail store expansion</b>Target 1,800 additions · achieved 1,867 <span>KEPT</span></div>
                  <div className="promise-row delayed"><b>New-energy commissioning</b>Target Q4 FY25 · moved to H1 FY26 <span>DELAYED</span></div>
                  <div className="promise-row missed"><b>O2C margin recovery</b>Target &gt; 12.0% · achieved 9.7% <span>MISSED</span></div>
                  <div className="promise-row kept"><b>Subscriber monetisation</b>ARPU target &gt; ₹200 · achieved ₹211 <span>KEPT</span></div>
                </div>
              </div>
            </Reveal>
          </div></article>

          <article className="capability reverse" id="autopsy"><div className="capability-grid">
            <Reveal dir="right" className="cap-copy">
              <div className="cap-no">04 · Stock Autopsy &amp; Red-Flag DNA</div><h3>Learn the sequence before the collapse repeats.</h3>
              <p className="type-line"><TypeWriter text="Historical failures are reconstructed as machine-readable timelines — cash-flow deterioration, receivable spikes, leverage, auditor warnings, governance signals and management behaviour — then compared with current companies to detect repeating combinations early." /></p>
              <div className="cap-facts"><div className="cap-fact"><b>Problem solved</b><span>Fraud and business failure signals usually appear separately long before the final collapse.</span></div><div className="cap-fact"><b>What we build</b><span>A failure-pattern library and similarity engine across accounting, governance and operating markers.</span></div><div className="cap-fact"><b>Output</b><span>Pattern similarity, matched markers, missing markers, severity and historical analogues.</span></div></div>
              <div className="cap-diff"><strong>Different from a red-flag checklist:</strong> it evaluates combinations and sequence, not only whether one ratio crossed a threshold.</div>
            </Reveal>
            <Reveal dir="left" className="cap-visual">
              <div className="visual-top"><div className="title"><i />Historical failure pattern reconstruction</div><span className="demo">illustrative case</span></div>
              <div className="autopsy-ui">
                <div className="autopsy-timeline">
                  <div className="autopsy-event"><small>T−12 months</small><b>Operating cash flow begins diverging from reported profit.</b></div>
                  <div className="autopsy-event"><small>T−9 months</small><b>Receivables accelerate faster than revenue growth.</b></div>
                  <div className="autopsy-event"><small>T−7 months</small><b>Leverage rises while related-party exposure expands.</b></div>
                  <div className="autopsy-event"><small>T−5 months</small><b>Management guidance misses become more frequent.</b></div>
                  <div className="autopsy-event alert"><small>T−3 months</small><b>Auditor / regulatory concern enters the evidence chain.</b></div>
                  <div className="autopsy-event alert"><small>Outcome</small><b>Market-value destruction after confidence breaks.</b></div>
                </div>
                <div className="similarity-panel">
                  <div className="sim-top"><small>Current-company match</small><strong className="match-pct-val"><AnimatedCounter target={73} suffix="%" /></strong><span>similarity to historical failure cluster</span></div>
                  <div className="sim-bars"><div className="sim-item">Cash-flow divergence<div className="sim-line"><i /></div></div><div className="sim-item">Receivable stress<div className="sim-line"><i /></div></div><div className="sim-item">Governance pattern<div className="sim-line"><i /></div></div></div>
                  <div className="sim-foot">Demo result · explanation required before alert severity increases.</div>
                </div>
              </div>
            </Reveal>
          </div></article>

          <article className="capability" id="dependency"><div className="capability-grid">
            <Reveal dir="left" className="cap-copy">
              <div className="cap-no">05 · Hidden Dependency Graph</div><h3>Ten stocks do not always mean ten different risks.</h3>
              <p className="type-line"><TypeWriter text="MarketMind traces holdings back to shared currencies, commodities, suppliers, geographies, customers and financing conditions — exposing economic concentration that sector labels and name-level diversification can hide." /></p>
              <div className="cap-facts"><div className="cap-fact"><b>Problem solved</b><span>Different companies can still depend on the same hidden macro or supply-chain variable.</span></div><div className="cap-fact"><b>What we build</b><span>A portfolio knowledge graph with dependency edges and concentration centrality scores.</span></div><div className="cap-fact"><b>Output</b><span>Shared-risk clusters, single points of failure and look-through portfolio exposure.</span></div></div>
              <div className="cap-diff"><strong>Different from sector allocation:</strong> it measures what companies economically depend on, not only the industry label assigned to them.</div>
            </Reveal>
            <Reveal dir="right" className="cap-visual">
              <div className="visual-top"><div className="title"><i />Portfolio dependency topology</div><span className="demo">network view</span></div>
              <div className="dependency-ui">
                <svg viewBox="0 0 620 440">
                  <line className="dep-line hot" x1="310" y1="220" x2="105" y2="90" /><line className="dep-line hot" x1="310" y1="220" x2="110" y2="335" />
                  <line className="dep-line" x1="310" y1="220" x2="305" y2="62" /><line className="dep-line hot" x1="310" y1="220" x2="505" y2="105" />
                  <line className="dep-line" x1="310" y1="220" x2="500" y2="334" /><line className="dep-line" x1="105" y1="90" x2="305" y2="62" />
                  <line className="dep-line" x1="500" y1="334" x2="505" y2="105" />
                  <g className="dep-node center" transform="translate(310,220)"><circle r="46" /><text textAnchor="middle" y="-4">USD/INR</text><text textAnchor="middle" y="13">shared driver</text></g>
                  <g className="dep-node" transform="translate(105,90)"><circle r="34" /><text textAnchor="middle" y="-3">TCS</text><text className="dep-value" textAnchor="middle" y="13">34% revenue</text></g>
                  <g className="dep-node" transform="translate(110,335)"><circle r="34" /><text textAnchor="middle" y="-3">INFY</text><text className="dep-value" textAnchor="middle" y="13">US exposure</text></g>
                  <g className="dep-node" transform="translate(305,62)"><circle r="34" /><text textAnchor="middle" y="-3">WIPRO</text><text className="dep-value" textAnchor="middle" y="13">FX benefit</text></g>
                  <g className="dep-node" transform="translate(505,105)"><circle r="38" /><text textAnchor="middle" y="-3">INDIGO</text><text className="dep-value" textAnchor="middle" y="13">lease + fuel</text></g>
                  <g className="dep-node" transform="translate(500,334)"><circle r="39" /><text textAnchor="middle" y="-3">TATA CONSUMER</text><text className="dep-value" textAnchor="middle" y="13">import basket</text></g>
                </svg>
                <div className="dependency-badge"><small>shared portfolio exposure</small><strong><AnimatedCounter target={34} suffix="%" /></strong></div>
              </div>
            </Reveal>
          </div></article>

          <article className="capability reverse" id="decision"><div className="capability-grid">
            <Reveal dir="right" className="cap-copy">
              <div className="cap-no">06 · Decision Intelligence</div><h3>Judge the decision process, not only the final return.</h3>
              <p className="type-line"><TypeWriter text="The Decision Time Machine hides hindsight and shows only what was knowable at a past date before you lock Buy, Hold or Sell. The Ghost Portfolio separately tracks ideas you rejected or exited, revealing behavioural patterns such as selling winners too early." /></p>
              <div className="cap-facts"><div className="cap-fact"><b>Problem solved</b><span>Outcome bias makes a lucky result look like a good process and a good process look bad after randomness.</span></div><div className="cap-fact"><b>What we build</b><span>A frozen-information decision replay plus a counterfactual portfolio of rejected or exited ideas.</span></div><div className="cap-fact"><b>Output</b><span>Decision-quality score, repeated bias patterns and opportunity-cost attribution.</span></div></div>
              <div className="cap-diff"><strong>Different from performance analytics:</strong> it evaluates the information and reasoning available when the decision was actually made.</div>
            </Reveal>
            <Reveal dir="left" className="cap-visual">
              <div className="visual-top"><div className="title"><i />Decision replay + ghost portfolio</div><span className="demo">bias audit</span></div>
              <div className="decision-ui">
                <div className="time-machine">
                  <div className="pane-label">Decision Time Machine</div><h4>Information frozen</h4><div className="decision-date">12 Jun 2024</div>
                  <div className="blind-data"><div className="blind-row"><span>Revenue growth</span><b>+13.8%</b></div><div className="blind-row"><span>FCF trend</span><b>Improving</b></div><div className="blind-row"><span>Valuation percentile</span><b>62nd</b></div><div className="blind-row"><span>Known red flags</span><b>1 moderate</b></div></div>
                  <div className="decision-lock"><span>SELL</span><span className="chosen">HOLD</span><span>BUY</span></div>
                  <div className="outcome-reveal">Outcome unlock: <strong>+21.4%</strong> over the next 180 days · process grade B+</div>
                </div>
                <div className="ghost-portfolio">
                  <div className="pane-label">Ghost Portfolio</div><h4>What happened after your exits?</h4>
                  <div className="ghost-stat"><AnimatedCounter target={18} suffix="%" /></div><div className="ghost-sub">average upside missed after early exits</div>
                  <div className="ghost-chart"><svg viewBox="0 0 250 110"><line className="ghost-base" x1="0" y1="82" x2="250" y2="82" /><path className="ghost-line" d="M5 84 C30 80 48 70 68 75 S112 55 135 60 S175 39 196 42 S225 20 245 24" /></svg></div>
                  <div className="ghost-note">Pattern: sold winners too early in <b style={{ color: "var(--red)" }}>6 of last 9</b> profitable exits.</div>
                </div>
              </div>
            </Reveal>
          </div></article>
        </div></section>

        {/* INTEL LAYER */}
        <section className="section intelligence-layer" id="layer" data-section="intelligence"><div className="container">
          <div className="dark-head">
            <div><div className="kicker" style={{ color: "#6F9CFF" }}>The intelligence layer beneath the flagship capabilities</div><Reveal><h2>Supporting analysis that continuously feeds the same reasoning graph.</h2></Reveal></div>
            <Reveal dir="right"><p>These capabilities operate as specialised lenses inside the same system and can be invoked by the portfolio, the voice assistant, a smart alert or another reasoning path.</p></Reveal>
          </div>
          <div className="intel-stage">
            <div className="intel-tabs">
              {INTEL_KEYS.map((k, i) => (
                <button
                  key={k}
                  className={"intel-tab" + (activeIntel === k ? " active" : "")}
                  onClick={() => { setActiveIntel(k); setIntelManual(true); }}
                >
                  <span className="intel-tab-title">{INTEL_DATA[k].label}</span>
                  <span className="intel-tab-num">{String(i + 1).padStart(2, "0")}</span>
                </button>
              ))}
            </div>
            <div className="intel-preview">
              <div className="intel-preview-head"><b>{intel.label}</b><span>MarketMind intelligence view · illustrative</span></div>
              <div className="intel-body">
                <div className="intel-copy">
                  <h3>{intel.title}</h3><p>{intel.desc}</p>
                  <div className="why"><b>Why it matters:</b> {intel.why}</div>
                  <div className="intel-stats">{intel.stats.map(([l, v]) => (<div className="intel-stat" key={l}><small>{l}</small><strong>{v}</strong></div>))}</div>
                </div>
                <div className="mini-chart">
                  <div className="mini-chart-top-bar">
                    <span className="mini-chart-pill"><span className="mini-pulse-dot" />Live analytical preview</span>
                  </div>
                  {intel.chartType === "candles" ? <MiniCandle /> : <MiniLine key={activeIntel} path={intel.path} dot={intel.dot} axis={intel.axis} />}
                </div>
              </div>
            </div>
          </div>
        </div></section>

        {/* CANDLE LAB */}
        <section className="section candle-lab" id="candlestick-lab" data-section="candlestick-lab"><div className="container">
          <div className="section-head candle-head">
            <div><div className="kicker">Candlestick &amp; order-flow intelligence</div><Reveal><h2>Read price action like a trading terminal — then explain the pattern in context.</h2></Reveal></div>
            <Reveal dir="right"><p className="side-note">The chart is an illustrative live simulation. MarketMind does not treat a candle name as a signal by itself; it checks trend structure, volume, VWAP, liquidity sweeps and invalidation before scoring a setup.</p></Reveal>
          </div>
          <Reveal><div className="trading-terminal">
            <div className="terminal-topbar">
              <div className="terminal-symbol"><span className="exchange-dot" /><div><strong>RELIANCE</strong><small>NSE · EQ · live feed</small></div></div>
              <div className="terminal-quote"><strong className={labUp ? "tick-green" : "tick-red"}>₹{labPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><span className={labUp ? "up" : "down"}>{labChange}</span><small>{labClock}</small></div>
              <div className="chart-actions">
                {["1m", "5m", "15m", "1H", "1D"].map(tf => (<button key={tf} className={"tf-btn" + (activeTf === tf ? " active" : "")} onClick={() => setActiveTf(tf)}>{tf}</button>))}
                <span /><button className="tool-btn">VWAP</button><button className="tool-btn">Volume</button><button className="tool-btn">Patterns</button>
              </div>
            </div>
            <div className="terminal-body">
              <aside className="terminal-watchlist">
                <div className="watch-head"><b>Watchlist</b><span>5 symbols · live feed</span></div>
                {watchlistData.map((w, i) => (
                  <button key={w.sym} className={"watch-row" + (watchIdx === i ? " active" : "") + (w.tickFlash ? " " + w.tickFlash : "")} onClick={() => setWatchIdx(i)}>
                    <span><b>{w.sym}</b><small>{w.name}</small></span>
                    <span>
                      <strong className={w.tickFlash}>₹{w.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      <em className={w.up ? "up" : "down"}>{(w.chg >= 0 ? "+" : "") + w.chg.toFixed(2) + "%"}</em>
                    </span>
                  </button>
                ))}
                <div className="watch-foot"><span>NIFTY 50</span><b className="up">24,850.20 (+0.64%)</b></div>
              </aside>
              <div className="terminal-chart-wrap">
                <div className="chart-meta-row">
                  <span>{p.title}</span>
                  <span>
                    O <b>{fmt1(p.ohlc[0])}</b> 
                    H <b>{fmt1(Math.max(p.ohlc[1], labPrice))}</b> 
                    L <b>{fmt1(Math.min(p.ohlc[2], labPrice))}</b> 
                    C <b className={labUp ? "up-text" : "down-text"}>{fmt1(labPrice)}</b>
                  </span>
                </div>
                <CandleChart patKey={activePat} currentPrice={labPrice} isUp={labUp} />
                <div className="pattern-strip">
                  {Object.entries(PAT).map(([key, pat]) => (<button key={key} className={"pattern-chip" + (activePat === key ? " active" : "")} onClick={() => setActivePat(key)}>
                    <i className={pat.bias === "Bullish" ? "bull" : pat.bias === "Bearish" ? "bear" : "neutral"} /><span>{pat.name}<small>{pat.context}</small></span>
                  </button>))}
                </div>
              </div>
              <aside className="terminal-insight">
                <div className="insight-head"><div><small>MARKETMIND READ</small><h3>{p.name}</h3></div><div className="setup-score"><strong>{p.score}</strong><span>/100</span></div></div>
                <p>{p.summary}</p>
                <div className="signal-grid">
                  <div><small>Bias</small><b className={p.bias === "Bullish" ? "up" : p.bias === "Bearish" ? "down" : ""}>{p.bias}</b></div>
                  <div><small>Invalidation</small><b>{p.invalid}</b></div>
                  <div><small>Volume</small><b>{p.volume}</b></div>
                  <div><small>Context</small><b>{p.context}</b></div>
                </div>
                <div className="evidence-checks">
                  <div><i className="ok" /><span>Liquidity sweep confirmed</span><b>YES</b></div>
                  <div><i className="ok" /><span>Close above VWAP</span><b>YES</b></div>
                  <div><i className="ok" /><span>Volume expansion</span><b>+42%</b></div>
                  <div><i className="warn" /><span>Higher-timeframe trend</span><b>NEUTRAL</b></div>
                </div>
                <div className="trade-thesis"><small>AI INTERPRETATION</small><p>{p.interpretation}</p></div>
                <div className="demo-warning">Live market intelligence telemetry · not investment advice</div>
              </aside>
            </div>
          </div></Reveal>
        </div></section>

        {/* ARCHITECTURE */}
        <section className="section architecture" id="architecture" data-section="architecture"><div className="container arch-grid">
          <div className="arch-copy">
            <div className="kicker">System architecture</div><h2>Five layers. One continuous evidence trail.</h2>
            <p>Data enters at the bottom, specialized intelligence transforms it, reasoning connects it, personalization maps it to the user, and delivery surfaces only the part that matters.</p>
            <div className="trace"><strong>Explainability rule:</strong> every conclusion must trace itself back to the underlying evidence, transformation and confidence path that produced it.</div>
          </div>
          <div className="arch-flow">
            <div className="arch-spine" /><div className="arch-packet" />
            {[
              { title: "Data ingestion", num: "LAYER 01", chips: ["Market prices", "Financial statements", "News + filings", "Earnings calls", "Portfolio + watchlist", "Historical failure archive"] },
              { title: "Specialized intelligence", num: "LAYER 02", chips: ["Domino reasoning", "Thesis integrity", "Trust ledger", "Autopsy + red-flag DNA", "Hidden dependency", "Accounting reality", "Stock DNA", "News impact", "Order flow"] },
              { title: "Reasoning & explainability", num: "LAYER 03", chips: ["Causal chain builder", "Confidence scoring", "Evidence linking", "Contradiction checks", "Counter-thesis search"] },
              { title: "Personalization", num: "LAYER 04", chips: ["Portfolio mapping", "Thesis store", "Ghost portfolio", "Watchlist memory", "User decision history"] },
              { title: "Delivery", num: "LAYER 05", chips: ["Web terminal", "Voice intelligence", "Smart alerts", "AI reports", "Learning mode"] },
            ].map(layer => (<Reveal key={layer.num} className="arch-layer"><div className="arch-layer-top"><h4>{layer.title}</h4><span className="num">{layer.num}</span></div><div className="arch-chips">{layer.chips.map(c => <span className="arch-chip" key={c}>{c}</span>)}</div></Reveal>))}
          </div>
        </div></section>

        {/* SCENARIO */}
        <section className="section example" id="scenario" data-section="scenario"><div className="container">
          <div className="section-head">
            <div><div className="kicker">End-to-end example</div><Reveal><h2>One market event, followed all the way to a portfolio decision.</h2></Reveal></div>
            <Reveal dir="right"><p className="side-note">The example is intentionally traceable: every stage shows what came in, which reasoning capability handled it, and what new information was created before the next stage.</p></Reveal>
          </div>
          <Reveal><div className="example-shell">
            <div className="example-header"><div><h3>Crude Oil Shock · +30%</h3><p>Traceable scenario walk-through</p></div><div className="scenario-trigger">TRIGGER · 2.9σ MOVE</div></div>
            <div className="example-body">
              <div className="stage-index">
                {STAGES.map((s, i) => (
                  <button
                    key={i}
                    className={"stage-btn" + (activeStage === i ? " active" : "")}
                    onClick={() => { setActiveStage(i); setStageManual(true); }}
                  >
                    <i className="stage-btn-num">{i + 1}</i>
                    <span className="stage-btn-title">{s.shortTitle || s.title}</span>
                  </button>
                ))}
              </div>
              <div className="stage-display"><div className="stage-content">
                <div className="stage-label">{STAGES[activeStage].label}</div>
                <div className="stage-title">{STAGES[activeStage].title}</div>
                <div className="stage-text"><TypeWriter key={"stg" + activeStage} text={STAGES[activeStage].text} /></div>
                <div className="stage-metrics">{STAGES[activeStage].m.map(([l, v]) => (<div className="stage-metric" key={l}><small>{l}</small><strong>{v}</strong></div>))}</div>
                <div className="stage-flow">
                  {(() => {
                    const activeMilestone = activeStage === 0 ? 0 : activeStage <= 2 ? 1 : activeStage <= 4 ? 2 : 3;
                    const milestones = [
                      { id: 0, x: 60, label: "01 · EVENT", sub: "2.9σ Brent move", stageIdx: 0 },
                      { id: 1, x: 250, label: "02 · REASONING", sub: "Cost pass-through", stageIdx: 1 },
                      { id: 2, x: 440, label: "03 · PORTFOLIO", sub: "3 holdings exposed", stageIdx: 3 },
                      { id: 3, x: 620, label: "04 · ACTION", sub: "Thesis watch alert", stageIdx: 5 },
                    ];
                    const progressX = milestones[activeMilestone].x;
                    return (
                      <svg viewBox="0 0 680 96" preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <linearGradient id="flowTrackGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#2F63E9" />
                            <stop offset="60%" stopColor="#38BDF8" />
                            <stop offset="100%" stopColor="#60A5FA" />
                          </linearGradient>
                          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2F63E9" floodOpacity="0.45" />
                          </filter>
                        </defs>
                        {/* Base Guide Rail */}
                        <line x1="60" y1="36" x2="620" y2="36" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                        {/* Dynamic Active Progress Track */}
                        <line
                          x1="60"
                          y1="36"
                          x2={progressX}
                          y2="36"
                          stroke="url(#flowTrackGrad)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          style={{ transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                        />
                        {/* Active Dash Flow */}
                        {activeMilestone > 0 && (
                          <line
                            x1="60"
                            y1="36"
                            x2={progressX}
                            y2="36"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            strokeDasharray="7 12"
                            strokeLinecap="round"
                            className="flow-pulse-line"
                          />
                        )}
                        {/* Milestone Nodes */}
                        {milestones.map(m => {
                          const isDone = m.id < activeMilestone;
                          const isCurrent = m.id === activeMilestone;
                          return (
                            <g
                              key={m.id}
                              className={"flow-milestone" + (isCurrent ? " current" : isDone ? " done" : "")}
                              onClick={() => { setActiveStage(m.stageIdx); setStageManual(true); }}
                              style={{ cursor: "pointer" }}
                              transform={`translate(${m.x}, 36)`}
                            >
                              {isCurrent && (
                                <circle cx="0" cy="0" r="16" fill="none" stroke="#2F63E9" strokeWidth="1.8" opacity="0.4" className="pulse-halo" />
                              )}
                              <circle
                                cx="0"
                                cy="0"
                                r={isCurrent ? "10" : "8"}
                                fill={isCurrent ? "#2F63E9" : isDone ? "#2F63E9" : "#FFFFFF"}
                                stroke={isCurrent ? "#FFFFFF" : isDone ? "#FFFFFF" : "#CBD5E1"}
                                strokeWidth={isCurrent ? "3" : isDone ? "2.5" : "2"}
                                filter={isCurrent ? "url(#nodeGlow)" : "none"}
                                style={{ transition: "all 0.4s ease" }}
                              />
                              <circle
                                cx="0"
                                cy="0"
                                r="3"
                                fill={isCurrent ? "#5BD6FF" : isDone ? "#FFFFFF" : "#94A3B8"}
                              />
                              <text
                                x="0"
                                y="27"
                                textAnchor="middle"
                                className={"flow-node-title" + (isCurrent ? " active" : isDone ? " done" : "")}
                              >
                                {m.label}
                              </text>
                              <text
                                x="0"
                                y="42"
                                textAnchor="middle"
                                className="flow-node-sub"
                              >
                                {m.sub}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div></div>
            </div>
          </div></Reveal>
        </div></section>

        {/* HOW */}
        <section className="section how" id="how" data-section="how"><div className="container">
          <div className="section-head">
            <div><div className="kicker">How MarketMind works</div><Reveal><h2>Observe. Connect. Detect. Reason. Personalize. Explain.</h2></Reveal></div>
            <Reveal dir="right"><p className="side-note">The goal is not to produce a magical buy/sell answer. The goal is to compress a large amount of evidence into an inspectable chain of reasoning that helps a human make a better-informed decision.</p></Reveal>
          </div>
          <div className="process-line">
            {[
              { num: "01 · OBSERVE", title: "Collect evidence", desc: "Financials, prices, news, filings, management commentary and portfolio data." },
              { num: "02 · CONNECT", title: "Map relationships", desc: "Companies, sectors, commodities, currencies, suppliers and historical analogues." },
              { num: "03 · DETECT", title: "Find divergence", desc: "Thesis decay, accounting conflict, hidden concentration and repeating risk patterns." },
              { num: "04 · REASON", title: "Build causal chains", desc: "Explainable paths with direction, magnitude, evidence and counter-thesis checks." },
              { num: "05 · PERSONALIZE", title: "Map to the investor", desc: "Portfolio, watchlist, original thesis, previous decisions and risk concentration." },
              { num: "06 · EXPLAIN", title: "Surface only what matters", desc: "Evidence-linked alerts, reports, visual reasoning and natural-language voice answers." },
            ].map(step => (<Reveal key={step.num} className="process-step"><i /><div className="num">{step.num}</div><h4>{step.title}</h4><p>{step.desc}</p></Reveal>))}
          </div>
        </div></section>

        {/* PROMISE */}
        <section className="promise" data-section="how"><div className="container promise-grid">
          <Reveal dir="left">
            <div className="kicker" style={{ color: "#6F9CFF" }}>The product promise</div>
            <h2>Not more market noise. <em>More context around the decision.</em></h2>
            <p>MarketMind is designed to show the relationships and reasoning that ordinary dashboards leave disconnected — without pretending uncertainty has disappeared.</p>
          </Reveal>
          <Reveal dir="right">
            <div className="question-matrix-accordion">
              <div className="qm-col">
                {PROMISE_QUESTIONS.filter((_, i) => i % 2 === 0).map((q) => {
                  const idx = PROMISE_QUESTIONS.indexOf(q);
                  const isOpen = !!openQs[idx];
                  return (
                    <div className={"qm-item" + (isOpen ? " is-open" : "")} key={q.num}>
                      <button
                        type="button"
                        className="qm-header"
                        onClick={() => toggleQ(idx)}
                        aria-expanded={isOpen}
                      >
                        <div className="qm-header-left">
                          <span className="qm-num">{q.num}</span>
                          <span className="qm-title">{q.question}</span>
                        </div>
                        <span className="qm-chevron" aria-hidden="true">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div className="qm-answer">
                          <p>{q.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="qm-col">
                {PROMISE_QUESTIONS.filter((_, i) => i % 2 === 1).map((q) => {
                  const idx = PROMISE_QUESTIONS.indexOf(q);
                  const isOpen = !!openQs[idx];
                  return (
                    <div className={"qm-item" + (isOpen ? " is-open" : "")} key={q.num}>
                      <button
                        type="button"
                        className="qm-header"
                        onClick={() => toggleQ(idx)}
                        aria-expanded={isOpen}
                      >
                        <div className="qm-header-left">
                          <span className="qm-num">{q.num}</span>
                          <span className="qm-title">{q.question}</span>
                        </div>
                        <span className="qm-chevron" aria-hidden="true">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div className="qm-answer">
                          <p>{q.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div></section>

        {/* CLOSING */}
        <section className="closing"><div className="container">
          <Reveal>
            <div className="closing-kicker-badge">
              <span className="closing-kicker-dot" />
              <span className="closing-brand">MarketMind AI</span>
              <span className="closing-divider">·</span>
              <span className="closing-tagline">Causal Intelligence Platform</span>
            </div>
          </Reveal>
          <Reveal><h2>See the connections the market does not show you.</h2></Reveal>
          <p className="type-line"><TypeWriter text="From a single headline to the final portfolio implication — MarketMind keeps the evidence, assumptions, dependencies and counter-thesis connected in one explainable system." /></p>
          <Reveal><div className="closing-actions">
            <button className="primary-btn" onClick={() => goPage && goPage("dashboard")}>Open Dashboard <span>→</span></button>
            <button className="secondary-btn" onClick={() => openAssistant && openAssistant()}>Try Voice Copilot</button>
          </div></Reveal>
        </div></section>
      </main>

      <footer className="marketmind-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand & Identity */}
            <div className="footer-col brand-col">
              <div className="footer-brand-wrap">
                <img src={logoImg} alt="MarketMind AI" className="footer-logo-img" />
              </div>
              <p className="footer-desc">
                Causal market intelligence, cross-asset domino predictor, and institutional order-flow analytics designed for modern research teams.
              </p>
            </div>

            {/* Column 2: Platform Capabilities */}
            <div className="footer-col">
              <h4>Intelligence Layers</h4>
              <ul className="footer-link-list">
                <li><button onClick={() => scrollTo("hero")}>Causal Domino Predictor</button></li>
                <li><button onClick={() => scrollTo("candlestick-lab")}>Order-Flow &amp; Candlestick Lab</button></li>
                <li><button onClick={() => scrollTo("dna")}>Stock DNA Fingerprint</button></li>
                <li><button onClick={() => scrollTo("dependency")}>Hidden Dependency Graph</button></li>
                <li><button onClick={() => scrollTo("autopsy")}>Stock Autopsy &amp; Failure DNA</button></li>
                <li><button onClick={() => scrollTo("layer")}>Forensic Accounting Reality</button></li>
              </ul>
            </div>

            {/* Column 3: Architecture & Security */}
            <div className="footer-col">
              <h4>System Architecture</h4>
              <ul className="footer-link-list">
                <li><button onClick={() => scrollTo("architecture")}>5-Layer Processing Trail</button></li>
                <li><button onClick={() => scrollTo("scenario")}>End-to-End Walkthrough</button></li>
                <li><button onClick={() => scrollTo("how")}>Explainability Rulebook</button></li>
                <li><button onClick={() => scrollTo("problem")}>Problem Statement</button></li>
                <li><button onClick={() => scrollTo("candlestick-lab")}>Verifiable Evidence Trail</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Disclaimer & Copyright */}
          <div className="footer-bottom-bar">
            <div className="footer-legal-copy">
              <p>
                <strong>Disclaimer:</strong> Illustrative product interface. Market values, simulation scenarios, probabilistic causal models, and portfolio stress tests displayed on this platform are for demonstration and informational analysis only and do not constitute financial, investment, or trading advice. Past market analogue patterns do not guarantee future equity performance.
              </p>
            </div>
            <div className="footer-sub-row">
              <span className="footer-copy">© {new Date().getFullYear()} MarketMind AI Inc. All rights reserved.</span>
              <div className="footer-meta-links">
                <span>Privacy Notice</span>
                <span>·</span>
                <span>Terms of Service</span>
                <span>·</span>
                <span>Security &amp; Data Provenance</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
