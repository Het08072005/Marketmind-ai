import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "../api/client";
import NewsDetailView from "../components/NewsDetailView";

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
    id: "seed-sebi-cas-derivative",
    title: "SEBI to review Settlement Price methodology for Derivative Contracts in the light of CAS rollout",
    source: "Securities and Exchange Board of India",
    source_authority: "SEBI",
    authority_label: "SEBI Official Circular",
    trust_score: 78,
    time: "Mon, 7 Sep 2026, 10:32 AM IST",
    category: "Macro & Economy",
    sentiment: "Neutral",
    sentiment_score: 0.62,
    event_type: "Policy Review",
    novelty: "High",
    materiality: "Medium-High",
    market_direction: "Mixed",
    confidence: 78,
    market_session: "Pre-Market",
    official_quote: "SEBI will examine if the current settlement price mechanism adequately addresses volatility, platform differences and manipulation risks in the derivatives segment.",
    quote_author: "SEBI Press Release",
    tags: ["Regulatory", "Derivatives", "Market Structure", "CAS", "India Market"],
    what_changed: "SEBI to review existing derivative settlement price methodology, considering CAS rollout, with focus on volatility handling, cross-exchange divergence and manipulation risks.",
    why_market_cares: [
      "May lead to changes in expiry-day pricing, margining and position limits.",
      "Could impact trading volumes and strategies, especially in index and single-stock options.",
      "Increased compliance costs for brokers and clearing members.",
      "Improves long-term market stability and reduces systemic risk."
    ],
    our_view: {
      stance: "Neutral to Slightly Positive",
      commentary: "Greater transparency and robust settlement framework is positive, but near-term uncertainty may keep volatility elevated."
    },
    causal_chain: {
      regulatory_action: "SEBI reviews settlement price methodology (CAS rollout)",
      market_variable: "Higher focus on volatility control & fair pricing",
      sector_transmission: "Changes in expiry pricing, margins, trading behavior",
      directly_exposed: ["NSE", "BSE", "MCX"],
      indirectly_exposed: ["Angel One", "HDFC Bank", "ICICI Bank", "Kotak", "Zerodha"]
    },
    company_exposure_matrix: [
      { ticker: "NSE", company: "NSE Ltd", exposure: "Direct", direction: "Negative", magnitude: "High", confidence: 82 },
      { ticker: "BSE", company: "BSE Ltd", exposure: "Direct", direction: "Negative", magnitude: "High", confidence: 80 },
      { ticker: "MCX", company: "Multi Commodity Ex...", exposure: "Direct", direction: "Negative", magnitude: "Medium", confidence: 72 },
      { ticker: "ANGELONE", company: "Angel One Ltd", exposure: "Indirect", direction: "Negative", magnitude: "Medium", confidence: 66 },
      { ticker: "HDFCBANK", company: "HDFC Bank Ltd", exposure: "Indirect", direction: "Neutral", magnitude: "Low", confidence: 60 },
      { ticker: "ICICIBANK", company: "ICICI Bank Ltd", exposure: "Indirect", direction: "Neutral", magnitude: "Low", confidence: 58 }
    ],
    price_chart: {
      ticker: "NSE",
      company: "NSE Ltd",
      price: 2428.60,
      change_pct: -1.34,
      open: 2462.10,
      high: 2465.80,
      low: 2418.20,
      close: 2428.60,
      volume: "12.4M",
      vwap: 2452.30,
      pattern_name: "Bearish Engulfing (Confirmed)",
      r2: 2560,
      r1: 2500,
      s1: 2400,
      s2: 2340
    },
    historical_analogues: {
      items: [
        { date: "12 Jan 2023", event: "Derivative margin rev...", ar_1d: "-1.8%", ar_5d: "-3.2%", ar_20d: "+4.6%", hit_rate: "42%", max_dd: "-5.1%" },
        { date: "18 Aug 2021", event: "Expiry price consult...", ar_1d: "-2.4%", ar_5d: "-1.1%", ar_20d: "+3.8%", hit_rate: "45%", max_dd: "-6.3%" },
        { date: "26 Mar 2020", event: "Market structure up...", ar_1d: "-3.1%", ar_5d: "+2.6%", ar_20d: "+7.4%", hit_rate: "58%", max_dd: "-8.7%" },
        { date: "14 Nov 2018", event: "Position limit change", ar_1d: "-1.2%", ar_5d: "-0.5%", ar_20d: "+2.1%", hit_rate: "50%", max_dd: "-4.9%" }
      ],
      average: {
        ar_1d: "-1.9%",
        ar_5d: "-0.6%",
        ar_20d: "+4.5%",
        hit_rate: "49%",
        max_dd: "-6.3%"
      }
    },
    counter_thesis: [
      "Review may lead to a more robust and manipulation-resistant framework.",
      "Higher institutional participation due to improved confidence.",
      "Long-term positive for market integrity and derivatives volumes."
    ],
    invalidation_triggers: [
      "No material change in settlement methodology.",
      "Phased and non-disruptive implementation.",
      "Explicit assurance of minimal impact on current contracts.",
      "Lower than expected volatility in expiry sessions."
    ],
    evidence_sources: [
      { name: "SEBI Press Release", type: "Primary", time: "7 Sep 2026, 10:32 AM", url: "https://www.sebi.gov.in" },
      { name: "Economic Times", type: "Secondary", time: "7 Sep 2026, 11:05 AM", url: "https://economictimes.indiatimes.com" },
      { name: "Mint", type: "Secondary", time: "7 Sep 2026, 11:20 AM", url: "https://www.livemint.com" },
      { name: "Business Standard", type: "Secondary", time: "7 Sep 2026, 12:10 PM", url: "https://www.business-standard.com" }
    ],
    exposure_type: "Market Infrastructure & Compliance",
    horizon: "Medium-to-Long Term Structural",
    price_reaction: "Index derivative turnover steady (-1.5% churn)",
    what_happened: "SEBI published an official regulatory circular reviewing settlement price methodology for equity derivative contracts in light of CAS rollout.",
    why_affected: "Regulates exchange microstructure, trading safeguards, and settlement methodology, directly impacting BSE, MCX, retail F&O brokers (Angel One), and institutional clearing banks.",
    ai_verdict: "Structurally positive for Indian market integrity and FPI investor confidence. Eliminates last-hour settlement manipulation risks while moderating speculative volume churn.",
    invalidation: "Elevated procedural compliance burdens or transient volume contraction in index option contract turnover.",
    tickers: ["NSE", "BSE", "MCX", "ANGELONE", "HDFCBANK", "ICICIBANK"],
    points: [
      "May lead to changes in expiry-day pricing, margining and position limits.",
      "Could impact trading volumes and strategies, especially in index and single-stock options.",
      "Increased compliance costs for brokers and clearing members.",
      "Improves long-term market stability and reduces systemic risk."
    ],
    company_impacts: [
      {
        symbol: "BSE",
        name: "BSE Limited",
        direction: "Negative",
        impact_tag: "P&L Headwind (-2.4% PAT)",
        est_turnover_pnl: "-₹45 Cr to -₹75 Cr",
        est_turnover_pnl_label: "Annual Derivative Transaction Revenue",
        profit_loss_pct: "-2.4% Net Profit Impact",
        price_impact_range: "-1.4% to -2.8%",
        rationale: "CAS settlement price smoothing curbs expiry-day speculative volatility spikes, reducing peak options contract turnover and fee accruals."
      },
      {
        symbol: "ANGELONE",
        name: "Angel One Ltd",
        direction: "Negative",
        impact_tag: "Brokerage Turnover Impact (-3.1%)",
        est_turnover_pnl: "-₹25 Cr to -₹55 Cr",
        est_turnover_pnl_label: "Retail F&O Broking Revenue",
        profit_loss_pct: "-3.1% EBITDA Margin Compression",
        price_impact_range: "-2.0% to -3.5%",
        rationale: "Standardized settlement pricing tightens bid-ask slippage expectations, dampening speculative intraday turnover among active F&O traders."
      },
      {
        symbol: "MCX",
        name: "Multi Commodity Exchange of India",
        direction: "Neutral",
        impact_tag: "Procedural Compliance (-₹12 Cr)",
        est_turnover_pnl: "-₹10 Cr to -₹18 Cr",
        est_turnover_pnl_label: "IT Infrastructure & Settlement Audit",
        profit_loss_pct: "-0.8% Operating Margin Shift",
        price_impact_range: "±0.9% (Range-bound)",
        rationale: "Commodity contract settlement aligns with revised institutional clearing benchmarks without direct disruption to bullion contracts."
      },
      {
        symbol: "HDFCBANK",
        name: "HDFC Bank Ltd",
        direction: "Positive",
        impact_tag: "Custodial Float (+0.4% NIM)",
        est_turnover_pnl: "+₹35 Cr to +₹65 Cr",
        est_turnover_pnl_label: "PCM Clearing Margin Float Accruals",
        profit_loss_pct: "+0.4% Treasury Margin Optimization",
        price_impact_range: "+0.3% to +0.8%",
        rationale: "Professional Clearing Member (PCM) custodial collateral buffers expand under refined CAS settlement safeguards, enhancing treasury float yield."
      }
    ],
    summary: "Securities and Exchange Board of India (SEBI) has initiated a review of settlement price methodology for derivative contracts as part of Capital Adequacy Standards (CAS) rollout, after feedback from market participants and institutional investors."
  },
  {
    id: "seed-sbi-nse-ipo",
    title: "SBI, New India Assurance, IFCI, Bank of Baroda & GIC RE are in focus ahead of NSE IPO; here is why",
    source: "Upstox & NSE Disclosures",
    source_authority: "NSE",
    authority_label: "NSE Corporate Filing",
    trust_score: 78,
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
    tickers: ["SBIN", "BANKBARODA", "BSE"],
    points: [
      "NSE IPO Momentum: Advance preparations for the National Stock Exchange IPO have triggered buying interest in major institutional shareholders.",
      "Value Unlocking: SBIN and Bank of Baroda maintain strategic unlisted holdings in NSE; an IPO provides fair mark-to-market discovery.",
      "Market Expectation: Investors are monitoring potential stake monetization and special dividend distributions upon successful exchange listing."
    ],
    company_impacts: [
      {
        symbol: "SBIN",
        name: "State Bank of India",
        direction: "Positive",
        impact_tag: "Book Value Accretion (+1.2%)",
        est_turnover_pnl: "+₹45 Cr to +₹85 Cr",
        est_turnover_pnl_label: "Unlisted Stake Fair Value Discovery",
        profit_loss_pct: "+1.2% One-off PAT / Reserve Uplift",
        price_impact_range: "+1.2% to +2.5%",
        rationale: "SBI holds a strategic equity stake in NSE; public listing triggers fair value book accretion."
      },
      {
        symbol: "BANKBARODA",
        name: "Bank of Baroda",
        direction: "Positive",
        impact_tag: "Capital Gains Unlock (+0.9%)",
        est_turnover_pnl: "+₹25 Cr to +₹45 Cr",
        est_turnover_pnl_label: "Unlisted Equity Monetization",
        profit_loss_pct: "+0.9% Book Value Expansion",
        price_impact_range: "+0.8% to +1.8%",
        rationale: "Bank of Baroda's unlisted exchange stake monetization provides Tier-1 capital adequacy relief."
      },
      {
        symbol: "BSE",
        name: "BSE Limited",
        direction: "Neutral",
        impact_tag: "Peer Multiple Re-Rating (±1.1%)",
        est_turnover_pnl: "±₹15 Cr to ₹35 Cr",
        est_turnover_pnl_label: "Institutional Multiple Comparison",
        profit_loss_pct: "±0.8% Market Share Turnover Variance",
        price_impact_range: "±1.0% to -1.5%",
        rationale: "NSE listing establishes transparent peer valuation benchmark, sparking institutional portfolio rebalancing."
      }
    ],
    summary: "Advance preparations for the National Stock Exchange IPO have triggered buying interest in major institutional shareholders."
  },
  {
    id: "seed-rbi-money-market",
    title: "Money Market Operations as on September 02, 2026",
    source: "Reserve Bank of India",
    source_authority: "RBI",
    authority_label: "RBI Monetary Notice",
    trust_score: 80,
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
    ],
    company_impacts: [
      {
        symbol: "SBIN",
        name: "State Bank of India",
        direction: "Positive",
        impact_tag: "Treasury Float Yield (+0.8% PAT)",
        est_turnover_pnl: "+₹35 Cr to +₹65 Cr",
        est_turnover_pnl_label: "Annualized Overnight Treasury Yield",
        profit_loss_pct: "+0.8% Quarterly Treasury Profit",
        price_impact_range: "+0.6% to +1.2%",
        rationale: "High statutory liquidity surplus deployed at 4.71% weighted average overnight repo optimizes non-interest treasury income."
      },
      {
        symbol: "HDFCBANK",
        name: "HDFC Bank Ltd",
        direction: "Positive",
        impact_tag: "Wholesale Cost Containment (2 bps NIM)",
        est_turnover_pnl: "₹25 Cr – ₹45 Cr",
        est_turnover_pnl_label: "Short-Term CD Funding Cost Savings",
        profit_loss_pct: "+2 bps NIM Protection",
        price_impact_range: "+0.4% to +1.0%",
        rationale: "Anchored call money rates insulate certificate of deposit (CD) rollover costs, defending commercial banking NIM spreads."
      },
      {
        symbol: "ICICIBANK",
        name: "ICICI Bank Ltd",
        direction: "Neutral",
        impact_tag: "Duration Optimization (±0.4%)",
        est_turnover_pnl: "+₹18 Cr to +₹32 Cr",
        est_turnover_pnl_label: "Interbank Repo Clearing Yield",
        profit_loss_pct: "+0.4% Treasury Operating Spread",
        price_impact_range: "±0.4% (Steady)",
        rationale: "Active SDF liquidity management balances ALM mismatches while ensuring steady liquidity coverage ratio (LCR) buffers."
      }
    ],
    summary: "Total segment volume transacted ₹6.55 Lakh Cr at a weighted average rate of 4.71%."
  },
  {
    id: "seed-reliance-solar-capex",
    title: "Reliance Industries Accelerates Jamnagar Green Energy Capex by ₹15,000 Cr; 20GW Solar Cell Line",
    source: "The Economic Times & Company Filings",
    source_authority: "COMPANY_IR",
    authority_label: "Company Investor Relations",
    trust_score: 75,
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
    tickers: ["RELIANCE", "ONGC", "LT"],
    points: [
      "Jamnagar Capex Acceleration: Fast-tracking commercial commissioning of integrated solar cell and module production lines.",
      "Captive Power Cost Reduction: Lowers captive power procurement overhead by approximately 35% for refining complexes.",
      "Valuation Unlocking: Creates an independent green energy vertical to support long-term multiple expansion for RELIANCE."
    ],
    company_impacts: [
      {
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd",
        direction: "Positive",
        impact_tag: "EBITDA Margin Accretion (+4.2%)",
        est_turnover_pnl: "+₹2,400 Cr to +₹3,800 Cr",
        est_turnover_pnl_label: "Annual Captive Power Cost Savings",
        profit_loss_pct: "+4.2% Refining EBITDA Margin Uplift",
        price_impact_range: "+2.4% to +4.8%",
        rationale: "Integrated 20GW solar cell facility commissioning slashes external electricity tariffs for Jamnagar complex by ~35%."
      },
      {
        symbol: "LT",
        name: "Larsen & Toubro Ltd",
        direction: "Positive",
        impact_tag: "EPC Orderbook Accretion (+2.1%)",
        est_turnover_pnl: "+₹1,800 Cr to +₹3,200 Cr",
        est_turnover_pnl_label: "Balance of Plant (BOP) Contracts",
        profit_loss_pct: "+1.8% Infrastructure EBIT Accretion",
        price_impact_range: "+1.5% to +2.8%",
        rationale: "L&T wins downstream high-voltage transmission and electrolyser balance-of-plant EPC packages."
      },
      {
        symbol: "ONGC",
        name: "Oil & Natural Gas Corporation",
        direction: "Neutral",
        impact_tag: "Feedstock Allocation Shift",
        est_turnover_pnl: "±₹120 Cr to ₹250 Cr",
        est_turnover_pnl_label: "Domestic Gas Offtake Realization",
        profit_loss_pct: "±0.6% Net Realization Spread",
        price_impact_range: "±0.8%",
        rationale: "Transition to solar generation moderates captive gas requirement, redirecting domestic gas to city gas distribution."
      }
    ]
  }
];

const COMPANY_DIRECTORY = {
  "SBIN": "State Bank of India",
  "BANKBARODA": "Bank of Baroda",
  "HDFCBANK": "HDFC Bank Ltd",
  "ICICIBANK": "ICICI Bank Ltd",
  "AXISBANK": "Axis Bank Ltd",
  "KOTAKBANK": "Kotak Mahindra Bank",
  "BSE": "BSE Limited",
  "MCX": "Multi Commodity Exchange of India",
  "ANGELONE": "Angel One Ltd",
  "MOTILALOFS": "Motilal Oswal Financial Services",
  "RELIANCE": "Reliance Industries Ltd",
  "TATAMOTORS": "Tata Motors Ltd",
  "MARUTI": "Maruti Suzuki India",
  "BAJAJ-AUTO": "Bajaj Auto Ltd",
  "TCS": "Tata Consultancy Services",
  "INFY": "Infosys Ltd",
  "WIPRO": "Wipro Ltd",
  "TITAN": "Titan Company Ltd",
  "SUNPHARMA": "Sun Pharmaceutical Industries",
  "CIPLA": "Cipla Ltd",
  "ONGC": "Oil & Natural Gas Corporation",
  "ASIANPAINT": "Asian Paints Ltd",
  "ADANIENT": "Adani Enterprises Ltd",
  "LT": "Larsen & Toubro Ltd",
  "BHARTIARTL": "Bharti Airtel Ltd",
  "NIFTY50": "Nifty 50 Index Constituents"
};

function resolveNewsCompanyImpacts(item) {
  if (Array.isArray(item.company_impacts) && item.company_impacts.length > 0) {
    return item.company_impacts;
  }

  const isBull = item.sentiment === "Bullish";
  const isBear = item.sentiment === "Bearish";

  const targetTickers = (item.tickers && item.tickers.filter(t => t !== "NIFTY50").length > 0)
    ? item.tickers.filter(t => t !== "NIFTY50")
    : (item.tickers || ["NIFTY50"]);

  return targetTickers.slice(0, 4).map(sym => {
    const name = COMPANY_DIRECTORY[sym] || `${sym} Ltd`;
    const isMega = ["RELIANCE", "TCS", "HDFCBANK", "ICICIBANK", "SBIN", "BHARTIARTL", "LT"].includes(sym);
    const isLarge = ["TATAMOTORS", "MARUTI", "TITAN", "SUNPHARMA", "ONGC", "BAJAJ-AUTO", "NTPC", "TATASTEEL"].includes(sym);

    let estNum, estLabel, profitPct, priceRange, dir, rationale;
    if (isBull) {
      dir = "Positive";
      estNum = isMega ? "+₹35 Cr to +₹75 Cr" : isLarge ? "+₹15 Cr to +₹35 Cr" : "+₹5 Cr to +₹18 Cr";
      estLabel = isMega ? "Gross Operating Revenue Uplift" : "Orderbook & Volume Expansion";
      profitPct = isMega ? "+0.6% PAT Accretion" : isLarge ? "+0.9% EBITDA Uplift" : "+1.4% PAT Margin";
      priceRange = "+0.8% to +1.8%";
      rationale = `Operational traction and positive sector catalyst expand operating leverage and quarterly earnings conversion for ${name}.`;
    } else if (isBear) {
      dir = "Negative";
      estNum = isMega ? "-₹25 Cr to -₹60 Cr" : isLarge ? "-₹12 Cr to -₹30 Cr" : "-₹4 Cr to -₹15 Cr";
      estLabel = "Margin Contraction & Compliance";
      profitPct = isMega ? "-0.5% Net Margin" : isLarge ? "-0.8% EBITDA" : "-1.2% PAT Friction";
      priceRange = "-0.7% to -1.6%";
      rationale = `Short-term margin moderation and compliance absorption dampen near-term net earnings for ${name}.`;
    } else {
      dir = "Neutral";
      estNum = isMega ? "±₹15 Cr – ₹35 Cr" : isLarge ? "±₹8 Cr – ₹18 Cr" : "±₹3 Cr – ₹9 Cr";
      estLabel = "Balance Sheet Liquidity Absorption";
      profitPct = "±0.4% Operating Spread Variance";
      priceRange = "±0.5% (Consolidating)";
      rationale = `Routine operational realignment comfortably managed within existing capital reserves for ${name}.`;
    }

    return {
      symbol: sym,
      name: name,
      direction: dir,
      impact_tag: dir === "Positive" ? "Earnings Accretive" : dir === "Negative" ? "P&L Headwind" : "Operational Neutral",
      est_turnover_pnl: estNum,
      est_turnover_pnl_label: estLabel,
      profit_loss_pct: profitPct,
      price_impact_range: priceRange,
      rationale: rationale
    };
  });
}

function formatDateTime(item) {
  if (item.published_datetime) return item.published_datetime;
  if (item.published_date && item.published_time) return `${item.published_date} • ${item.published_time}`;
  if (item.published_ts) {
    try {
      const d = new Date(item.published_ts * 1000);
      const datePart = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      const timePart = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      return `${datePart} • ${timePart}`;
    } catch (e) { }
  }
  return item.time || "Today";
}

function getRelativeTime(item) {
  if (item.relative_time) return item.relative_time;
  if (item.published_ts) {
    const diffSec = Math.max(0, Math.floor(Date.now() / 1000 - item.published_ts));
    if (diffSec < 120) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  }
  return "Just now";
}

function getStoredNewsData() {
  try {
    const raw = localStorage.getItem("mm_news_feed_cache_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.articles &&
        parsed.articles.length >= 4 &&
        parsed.articles[0].why_affected &&
        parsed.articles[0].ai_verdict
      ) {
        // Strictly sort newest-first
        parsed.articles.sort((a, b) => (b.published_ts || 0) - (a.published_ts || 0));
        return parsed;
      }
    }
  } catch (e) { }
  return null;
}

function storeNewsData(data) {
  try {
    if (data && data.articles && data.articles.length > 0) {
      localStorage.setItem("mm_news_feed_cache_v2", JSON.stringify(data));
    }
  } catch (e) { }
}

export default function NewsPage({ goPage, searchQuery: parentSearchQuery = "" }) {
  const initialCached = getStoredNewsData();

  const [filter, setFilter] = useState("All");
  const [internalSearch, setInternalSearch] = useState("");
  const activeSearch = (parentSearchQuery || internalSearch || "").toLowerCase().trim();
  const [news, setNews] = useState(() => {
    const initial = initialCached?.articles || INITIAL_INSTITUTIONAL_SEED;
    return [...initial].sort((a, b) => (b.published_ts || 0) - (a.published_ts || 0));
  });
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => {
    return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  });
  const [newIncomingCount, setNewIncomingCount] = useState(0);
  const [executiveAnalysis, setExecutiveAnalysis] = useState(
    initialCached?.executive_analysis ||
    "Domestic institutional market telemetry reflects constructive headline flow led by private banking deposit accretion and industrial capex expansion. Energy transition capex and resilient auto orderbooks support corporate earnings visibility across Nifty components."
  );
  const [executiveOutcome, setExecutiveOutcome] = useState(
    initialCached?.executive_outcome ||
    "Headline momentum projects 75% bullish market continuation with sector capital actively rotating into banking, energy, and auto leaders. The constructive thesis invalidates upon unexpected crude supply shocks or hawkish central bank liquidity tightening."
  );
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [speakingNewsId, setSpeakingNewsId] = useState(null);
  const [expandedRippleId, setExpandedRippleId] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState(null);
  const [expandedDetailNewsId, setExpandedDetailNewsId] = useState(null);
  const [expandedNewsAnalysis, setExpandedNewsAnalysis] = useState({});
  const [newsAnalysisLoading, setNewsAnalysisLoading] = useState({});
  const [newsAnalysisData, setNewsAnalysisData] = useState({});

  const toggleNewsAnalysis = async (cardKey, article) => {
    // If already open, toggle closed
    if (expandedNewsAnalysis[cardKey]) {
      setExpandedNewsAnalysis((prev) => ({ ...prev, [cardKey]: false }));
      return;
    }

    // Open analysis container
    setExpandedNewsAnalysis((prev) => ({ ...prev, [cardKey]: true }));

    // If already analyzed & cached in state, reuse instantly without re-calling the API (strictly prevents quota waste!)
    if (newsAnalysisData[cardKey]) {
      return;
    }

    setNewsAnalysisLoading((prev) => ({ ...prev, [cardKey]: true }));

    try {
      const res = await apiClient.getNewsAnalysis(article, true);
      if (res) {
        setNewsAnalysisData((prev) => ({ ...prev, [cardKey]: res }));
      }
    } catch (err) {
      console.warn("On-demand news analysis API notice:", err);
      // High-quality instant fallback so UI is NEVER empty or stuck
      const fallbackImpacts = resolveNewsCompanyImpacts(article);
      setNewsAnalysisData((prev) => ({
        ...prev,
        [cardKey]: {
          why_affected: article.why_affected || article.analysis || `Direct operational and margin transmission across ${(article.tickers || []).slice(0, 3).join(", ") || "the sector"}.`,
          ai_verdict: article.ai_verdict || article.outcome || "Institutional order flow shows constructive absorption with disciplined risk parameters.",
          materiality: article.materiality || "Medium-High",
          exposure_type: article.exposure_type || "Operational",
          horizon: article.horizon || "1-3 Days",
          price_reaction: article.price_reaction || "+1.2% to +2.5%",
          invalidation: article.invalidation || "A breakdown below local benchmark support invalidates the catalyst.",
          company_impacts: fallbackImpacts,
          source: "institutional_model"
        }
      }));
    } finally {
      setNewsAnalysisLoading((prev) => ({ ...prev, [cardKey]: false }));
    }
  };
  const [expandedStoryIds, setExpandedStoryIds] = useState(() => new Set());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setIsScrolled(top > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const toggleStoryExpand = (id) => {
    setExpandedStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Pagination: 30 stories per page (< > controls at top)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  // Dynamic category switch handler with real-time sector telemetry update
  const handleCategoryChange = async (c) => {
    if (filter === c) return;
    setFilter(c);
    setCurrentPage(1);
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

  // Manual trigger to sync live feeds immediately and prepend top news
  const handleManualRefresh = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await apiClient.get(`/api/news?filter=${encodeURIComponent(filter)}`);
      if (res?.articles && res.articles.length > 0) {
        const sorted = [...res.articles].sort((a, b) => (b.published_ts || 0) - (a.published_ts || 0));
        setNews((prevNews) => {
          const prevIds = new Set(prevNews.map((x) => x.id || x.title));
          const newItems = sorted.filter((x) => !prevIds.has(x.id || x.title));
          if (newItems.length > 0) {
            setNewIncomingCount(newItems.length);
          }
          return sorted;
        });
        setLastUpdatedTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
        if (res.executive_analysis) setExecutiveAnalysis(res.executive_analysis);
        if (res.executive_outcome) setExecutiveOutcome(res.executive_outcome);
        storeNewsData(res);
      }
    } catch (err) {
      console.error("Manual refresh news error:", err);
    } finally {
      setIsSyncing(false);
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

  // Fetch news intelligence (automatic 25-second poll for live news ingestion)
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
          // Strictly sort newest-first (highest timestamp at top)
          const sorted = [...res.articles].sort((a, b) => (b.published_ts || 0) - (a.published_ts || 0));

          setNews((prevNews) => {
            if (!prevNews || prevNews.length === 0) return sorted;
            const prevIds = new Set(prevNews.map((x) => x.id || x.title));
            const newItems = sorted.filter((x) => !prevIds.has(x.id || x.title));
            if (newItems.length > 0) {
              setNewIncomingCount(newItems.length);
            }
            return sorted;
          });

          setLastUpdatedTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
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
    const interval = setInterval(fetchNews, 60000); // Poll once per minute (gentle background sync, no spam)
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

  // Listen for global stock change and voice search to filter news feed
  useEffect(() => {
    const handleStockChanged = (e) => {
      const sym = e.detail?.symbol;
      const name = e.detail?.name;
      if (sym || name) {
        setInternalSearch(name || sym);
      }
    };
    window.addEventListener("marketmind:stock_changed", handleStockChanged);
    return () => window.removeEventListener("marketmind:stock_changed", handleStockChanged);
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Filtered by Category / Authority, Search Query, and Strict Deduplication
  const displayedNews = (() => {
    const seenTitles = new Set();
    const seenTokenSets = [];
    const result = [];

    const filtered = news.filter((item) => {
      // 1. Strictly filter out personal tribunal appeals (e.g. Samar Imran, Appeal No. 7027)
      const tLower = (item.title || "").toLowerCase();
      if (
        tLower.includes("samar imran") ||
        /\bappeal\s+no\.?\s*\d+/i.test(tLower) ||
        /\bfiled\s+by\s+[a-z]+/i.test(tLower) ||
        /\badjudication\s+order\s+in\s+respect\s+of\b/i.test(tLower) ||
        /\bwrit\s+petition\s+no\b/i.test(tLower) ||
        /\bsat\s+appeal\b/i.test(tLower)
      ) {
        return false;
      }

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
    }).sort((a, b) => (b.published_ts || 0) - (a.published_ts || 0));

    // Deduplicate in frontend to ensure zero duplicate cards
    for (const item of filtered) {
      const title = (item.title || "").trim();
      const normKey = title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (seenTitles.has(normKey)) continue;

      const words = new Set(
        (title.toLowerCase().match(/\b[a-z0-9]{3,}\b/g) || [])
          .filter(w => !["the", "and", "for", "with", "that", "this", "from", "are", "was", "has", "have", "had", "will", "been", "official", "release", "notice", "circular", "disclosure"].includes(w))
      );
      let isDup = false;
      if (words.size >= 3) {
        for (const prev of seenTokenSets) {
          let inter = 0;
          for (const w of words) if (prev.has(w)) inter++;
          const union = new Set([...words, ...prev]).size;
          if (union > 0 && inter / union >= 0.58) {
            isDup = true;
            break;
          }
        }
      }
      if (isDup) continue;

      seenTitles.add(normKey);
      if (words.size >= 3) seenTokenSets.push(words);
      result.push(item);
    }

    return result;
  })();

  // Reset pagination to page 1 whenever category filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, activeSearch]);

  const totalPages = Math.max(1, Math.ceil(displayedNews.length / ITEMS_PER_PAGE));
  const currentSafePage = Math.min(currentPage, totalPages);
  const startIndex = (currentSafePage - 1) * ITEMS_PER_PAGE;
  const paginatedNews = displayedNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  // The page does not run a second browser STT engine. Voice questions are
  // handled exclusively by the Deepgram-backed Alex assistant.
  const handleToggleVoice = () => {
    window.dispatchEvent(new CustomEvent("marketmind:open_voice_assistant"));
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
      {/* Floating Top-Right Popup Widget when Scrolled (On Top + Page Switch) */}
      {isScrolled && displayedNews.length > 0 && (
        <div className="news-floating-scroll-popup" title={`Page ${currentSafePage} of ${totalPages}`}>
          {/* 1. On Top Button */}
          <button
            type="button"
            className="scroll-popup-top-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
            }}
            title="Scroll to Top of News Page"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
            <span>Top</span>
          </button>

          {/* 2. Vertical Divider */}
          <span className="scroll-popup-divider" />

          {/* 3. Page Switch (Email style 1-30 of 62 < >) */}
          <div className="scroll-popup-page-switch">
            <span className="scroll-popup-page-text">
              {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, displayedNews.length)} <span className="scroll-popup-of">of</span> {displayedNews.length}
            </span>
            <div className="scroll-popup-nav-btns">
              <button
                type="button"
                className="scroll-popup-nav-btn"
                disabled={currentSafePage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
                }}
                title="Previous page"
                aria-label="Previous page"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="scroll-popup-nav-btn"
                disabled={currentSafePage >= totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
                }}
                title="Next page"
                aria-label="Next page"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedNewsArticle ? (
        <div className="c12 news-detail-fullwidth-wrapper" style={{ gridColumn: "1 / -1", width: "100%" }}>
          <NewsDetailView
            article={selectedNewsArticle}
            onBack={() => setSelectedNewsArticle(null)}
            goPage={goPage}
            onOpenCopilot={handleOpenCopilotDrawer}
          />
        </div>
      ) : (
        <>
          {/* 1. Header & Search / Filter Controls */}
          <div className="page-banner news-banner-header">
            <div className="news-header-titles">
              <div className="news-header-top-row">
                <h2>Institutional Financial News &amp; Impact Engine</h2>
                {displayedNews.length > 0 && (
                  <div className="news-email-pagination" title={`Showing page ${currentSafePage} of ${totalPages}`}>
                    <span className="email-page-info">
                      {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, displayedNews.length)} of {displayedNews.length}
                    </span>
                    <div className="email-page-nav-btns">
                      <button
                        type="button"
                        className="email-nav-btn"
                        disabled={currentSafePage <= 1}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        title="Previous page"
                        aria-label="Previous page"
                      >
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="email-nav-btn"
                        disabled={currentSafePage >= totalPages}
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        title="Next page"
                        aria-label="Next page"
                      >
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <p>Real-time algorithmic ingestion from NSE Disclosures, BSE Announcements, SEBI Circulars, RBI Monetary Policy, Google News RSS, and Company IR pages.</p>
            </div>

            {/* Live Feed Auto-Sync Toolbar & Status */}
            <div className="news-live-sync-bar">
              <div className="news-sync-left">
                <span className="live-stream-badge">
                  <span className="live-pulse-dot" /> LIVE STREAM ACTIVE
                </span>
                <span className="news-sync-meta">
                  Auto-ingesting disclosures newest-first • Last updated at <b>{lastUpdatedTime || "Just now"}</b>
                </span>
              </div>
              <button
                type="button"
                className={`news-sync-btn ${isSyncing ? "is-spinning" : ""}`}
                onClick={handleManualRefresh}
                disabled={isSyncing}
                title="Fetch and place newest headlines at top"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                {isSyncing ? "Syncing..." : "Sync Live Feeds"}
              </button>
            </div>

            {/* New Incoming Headlines Alert Banner */}
            {newIncomingCount > 0 && (
              <div className="news-new-arrival-banner">
                <span>⚡ <b>{newIncomingCount} New Headline{newIncomingCount > 1 ? "s" : ""}</b> fetched and placed at the very top!</span>
                <button type="button" onClick={() => setNewIncomingCount(0)} title="Dismiss">✕</button>
              </div>
            )}

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


          {/* 4. Feed of News Articles (Exactly 30 per page) */}
          {paginatedNews.map((n, i) => {
            const isBullish = n.sentiment === "Bullish" || n.impact?.includes("+");
            const isBearish = n.sentiment === "Bearish" || n.impact?.includes("-");
            const sentimentClass = isBullish ? "benefit" : isBearish ? "loss" : "neutral";
            const isCurrentlySpeaking = speakingNewsId === n.id;
            const isRippleOpen = expandedRippleId === (n.id || i);
            const isCopilotActive = activeNewsForCopilot?.id === n.id;
            const cardKey = n.id || n.title || i;
            const isDetailOpen = expandedDetailNewsId === cardKey;
            const sourceUrl = n.link && n.link.startsWith("http")
              ? n.link
              : `https://news.google.com/search?q=${encodeURIComponent(n.title)}`;

            return (
              <div
                key={cardKey}
                className="card c12 news-feed-card"
                style={{
                  border: isCurrentlySpeaking ? "1.5px solid var(--gold)" : isDetailOpen ? "1.5px solid #2563EB" : isCopilotActive ? "1.5px solid #2563EB" : "1px solid var(--line)",
                  background: isCurrentlySpeaking ? "rgba(216,188,139,.04)" : isDetailOpen ? "#ffffff" : isCopilotActive ? "rgba(37,99,235,.015)" : "var(--paper)",
                  boxShadow: isDetailOpen ? "0 4px 24px rgba(37, 99, 235, 0.08)" : undefined
                }}
              >
                {/* Header: Source Badge + Publication + Exact Date & Time + Sentiment */}
                <div className="news-card-header">
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <div className="news-source-badge">
                      {(n.source || "ET").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <span>{n.source}</span>
                        <span className={`verified-feed-tag authority-${(n.source_authority || 'feed').toLowerCase()}`}>
                          {n.authority_label || `${n.source_authority || 'Verified'} Official`}
                        </span>
                        {n.trust_score && (
                          <span className="source-trust-tag">
                            🛡️ Trust {Math.min(82, Math.max(52, n.trust_score || 72))}%
                          </span>
                        )}
                        {i === 0 && filter === "All" && !activeSearch && (
                          <span className="latest-headline-badge">
                            ★ TOP STORY
                          </span>
                        )}
                      </div>

                      {/* Prominent Exact Date and Time Row */}
                      <div className="news-datetime-meta-strip">
                        <span className="news-meta-clock">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <strong>{formatDateTime(n)}</strong>
                        </span>
                        <span className="news-meta-relative-pill">
                          {getRelativeTime(n)}
                        </span>
                        {(n.is_fresh || i < 2) && (
                          <span className="news-live-pulse-pill">
                            <span className="live-pulse-dot" /> LIVE
                          </span>
                        )}
                        <span className="news-meta-sep">•</span>
                        <span className="news-meta-category">{n.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top-Right Direct Analysis & Source Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <button
                      type="button"
                      className={`news-top-analysis-btn ${expandedNewsAnalysis[cardKey] ? "active" : ""}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        background: expandedNewsAnalysis[cardKey] ? "#0E1526" : "var(--navy)",
                        color: expandedNewsAnalysis[cardKey] ? "#F3D59B" : "#FAF6EC",
                        border: expandedNewsAnalysis[cardKey] ? "1px solid rgba(184, 147, 90, 0.9)" : "1px solid var(--navy)",
                        boxShadow: expandedNewsAnalysis[cardKey] ? "0 2px 8px rgba(184, 147, 90, 0.25)" : "none",
                        transition: "all 0.18s ease"
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNewsAnalysis(cardKey, n);
                      }}
                      title={`Toggle AI Institutional Impact Analysis for this news`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={newsAnalysisLoading[cardKey] ? { animation: "spin 1s linear infinite" } : {}}
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      <span>{newsAnalysisLoading[cardKey] ? "Analyzing..." : expandedNewsAnalysis[cardKey] ? "Hide Analysis" : "Analysis"}</span>
                    </button>

                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-top-source-btn"
                      onClick={(e) => e.stopPropagation()}
                      title={`View original story on ${n.source || 'Verified Source'}`}
                    >
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <span>Source</span>
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Headline */}
                <h3
                  className="news-headline news-clickable-headline"
                  onClick={() => setExpandedDetailNewsId(isDetailOpen ? null : cardKey)}
                  title="Click to toggle full Institutional News Detail Analysis inside this box"
                >
                  {n.title}
                </h3>

                {/* Exact Actual News Story / Official Disclosure Content (3-4 lines default with Read More...) */}
                {(() => {
                  const rawStory = n.full_content || n.what_happened || n.summary || "";
                  // Strip PDF/regulatory page header/footer artifacts like "Page 1 of 2", "Page 2 of 2", "PR No.53/2026"
                  const storyText = rawStory
                    .replace(/\bPage\s+\d+\s+of\s+\d+\b/gi, "")
                    .replace(/\bPR\s+No\.?\s*[\w\d\.\-/]+/gi, "")
                    .replace(/\bPage\s+\d+\b/gi, "")
                    .replace(/\s{2,}/g, " ")
                    .trim();

                  const paragraphs = storyText
                    .split(/\n\n+|\r\n\r\n+/)
                    .map((p) => {
                      let cleaned = p.trim();
                      cleaned = cleaned.replace(/^\s*(?:and|also|moreover)\s+/i, "");
                      if (cleaned.length > 0) {
                        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
                      }
                      return cleaned;
                    })
                    .filter((p) => p.length > 0);
                  if (paragraphs.length === 0) return null;

                  const isStoryOpen = expandedStoryIds.has(cardKey);
                  const isLongStory = paragraphs.length > 1 || (paragraphs[0] && paragraphs[0].length > 200);

                  return (
                    <div className="news-exact-story-card">
                      <div className="exact-story-badge-row">
                        <span className="exact-story-badge">
                          News Article :
                        </span>
                        {paragraphs.length > 1 && (
                          <span className="exact-story-full-pill">
                            {isStoryOpen ? `Full Article (${paragraphs.length} paragraphs)` : `${paragraphs.length} paragraphs`}
                          </span>
                        )}
                      </div>

                      {!isStoryOpen ? (
                        <div className="exact-story-collapsed-wrap">
                          <div
                            className="exact-story-collapsed-text"
                            onClick={() => isLongStory && toggleStoryExpand(cardKey)}
                            title={isLongStory ? "Click to expand full article" : undefined}
                          >
                            <p className="exact-story-paragraph exact-story-clamped-3">
                              {paragraphs[0]}
                            </p>
                          </div>
                          {isLongStory && (
                            <button
                              type="button"
                              className="exact-story-read-more-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStoryExpand(cardKey);
                              }}
                              title="Read full article"
                            >
                              Read more...
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="exact-story-expanded-wrap">
                          <div className="exact-story-body">
                            {paragraphs.map((para, pIdx) => (
                              <p key={pIdx} className="exact-story-paragraph">
                                {para}
                              </p>
                            ))}
                          </div>
                          {isLongStory && (
                            <button
                              type="button"
                              className="exact-story-read-more-btn show-less-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStoryExpand(cardKey);
                              }}
                              title="Collapse article"
                            >
                              Show less ▲
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

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
                {(() => {
                  const companyImpacts = resolveNewsCompanyImpacts(n);
                  const impactSymbols = companyImpacts?.map(c => c.symbol).filter(Boolean) || [];
                  const rawTickers = (n.tickers || []).filter(t => t !== "NIFTY50");
                  const mergedTickers = Array.from(new Set([...impactSymbols, ...rawTickers]));
                  const displayTickers = mergedTickers.length > 0 ? mergedTickers : (n.tickers || ["NIFTY50"]);

                  return displayTickers && displayTickers.length > 0 && (
                    <div className="news-tickers-strip">
                      <span className="tickers-label">Impacted Tickers:</span>
                      {displayTickers.map((sym) => (
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
                  );
                })()}

                {/* Dedicated Company-Specific Quantified P&L & Exposure Breakdown + Institutional Impact Matrix - Only shown on Analysis */}
                {expandedNewsAnalysis[cardKey] && (
                  <div className="news-on-demand-analysis-wrap" style={{ animation: "fadeIn 0.22s ease" }}>
                    {newsAnalysisLoading[cardKey] ? (
                      <div className="news-analysis-skeleton" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="radar-skeleton-box" style={{ width: "110px", height: "18px", borderRadius: "4px" }} />
                          <div className="radar-skeleton-box" style={{ width: "160px", height: "18px", borderRadius: "4px" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "4px 0" }}>
                          <div className="radar-skeleton-box" style={{ width: "100%", height: "14px", borderRadius: "4px" }} />
                          <div className="radar-skeleton-box" style={{ width: "92%", height: "14px", borderRadius: "4px" }} />
                          <div className="radar-skeleton-box" style={{ width: "75%", height: "14px", borderRadius: "4px" }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "4px" }}>
                          <div className="radar-skeleton-box" style={{ height: "45px", borderRadius: "6px" }} />
                          <div className="radar-skeleton-box" style={{ height: "45px", borderRadius: "6px" }} />
                          <div className="radar-skeleton-box" style={{ height: "45px", borderRadius: "6px" }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Live AI Synthesis Badge if generated by Gemini */}
                        {newsAnalysisData[cardKey]?.source === "gemini_ai" && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", paddingLeft: "4px" }}>
                            <span style={{ fontSize: "10px", fontWeight: 750, padding: "2px 8px", borderRadius: "4px", background: "rgba(184, 147, 90, 0.18)", color: "#85581A", border: "1px solid rgba(184, 147, 90, 0.45)", letterSpacing: "0.04em" }}>
                              ⚡ LIVE AI SYNTHESIS
                            </span>
                          </div>
                        )}

                        {(() => {
                          const curAnalysis = newsAnalysisData[cardKey];
                          const companyImpacts = (curAnalysis?.company_impacts && curAnalysis.company_impacts.length > 0)
                            ? curAnalysis.company_impacts
                            : resolveNewsCompanyImpacts(n);
                          if (!companyImpacts || companyImpacts.length === 0) return null;
                          return (
                            <div className="news-quant-impact-section">
                              <div className="quant-impact-header">
                                <div className="quant-impact-title-wrap">
                                  <span className="quant-impact-badge">COMPANY IMPACT MODEL</span>
                                  <h4 className="quant-impact-heading">
                                    Quantified P&amp;L &amp; Balance Sheet Transmission
                                  </h4>
                                </div>
                                <span className="quant-impact-sub">
                                  Modeled financial effect: ₹ Crores and % Margin / PAT sensitivity
                                </span>
                              </div>

                              <div className="quant-unified-box">
                                <div className="quant-unified-lines">
                                  {companyImpacts.map((c, cIdx) => (
                                    <div key={cIdx} className={`quant-single-line-row border-${(c.direction || 'neutral').toLowerCase()}`}>
                                      {/* 1. Mini Ticker & Company Name */}
                                      <div className="quant-col-entity">
                                        <button
                                          type="button"
                                          className="quant-mini-ticker-chip"
                                          onClick={() => handleTickerClick(c.symbol)}
                                          title={`Analyze ${c.symbol} Chart & Technicals`}
                                        >
                                          {c.symbol} ↗
                                        </button>
                                        <strong className="quant-entity-name" title={c.name || c.symbol}>
                                          {c.name || c.symbol}
                                        </strong>
                                      </div>

                                      {/* 2. Rupee Impact */}
                                      <div className="quant-col-impact" title={c.est_turnover_pnl_label || 'Est. Financial Impact'}>
                                        <span className="quant-inline-label">EST. P&amp;L:</span>
                                        <strong className="quant-inline-val">{c.est_turnover_pnl}</strong>
                                      </div>

                                      {/* 3. Profit / Loss % Pill */}
                                      <div className="quant-col-pnl" title="Margin / PAT Sensitivity">
                                        <span className={`quant-inline-pnl-pill pnl-${(c.direction || 'neutral').toLowerCase()}`}>
                                          {c.profit_loss_pct}
                                        </span>
                                      </div>

                                      {/* 4. Projected Price Window */}
                                      <div className="quant-col-price" title="Projected Price Volatility Window">
                                        <span className="quant-inline-label">PRICE:</span>
                                        <span className="quant-inline-price-val">{c.price_impact_range}</span>
                                      </div>

                                      {/* 5. 1-Line Transmission Explanation */}
                                      <div className="quant-col-trans" title={`P&L Transmission: ${c.rationale}`}>
                                        <span className="quant-inline-bullet">•</span>
                                        <span className="quant-inline-trans-text">{c.rationale}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Story-Specific Institutional Impact Matrix */}
                        {(() => {
                          const curAnalysis = newsAnalysisData[cardKey] || {};
                          const whyAffected = curAnalysis.why_affected || n.why_affected || n.analysis;
                          const aiVerdict = curAnalysis.ai_verdict || n.ai_verdict || n.outcome;
                          const materiality = curAnalysis.materiality || n.materiality;
                          const exposureType = curAnalysis.exposure_type || n.exposure_type;
                          const horizon = curAnalysis.horizon || n.horizon;
                          const priceReaction = curAnalysis.price_reaction || n.price_reaction;
                          const invalidation = curAnalysis.invalidation || n.invalidation;

                          if (!whyAffected && !aiVerdict) return null;

                          return (
                            <div className="card-news-impact-matrix">
                              {/* Event Metadata Badges Row */}
                              <div className="matrix-meta-row">
                                {n.event_type && (
                                  <span className="matrix-pill event-type">
                                    📌 {n.event_type}
                                  </span>
                                )}
                                {materiality && (
                                  <span className={`matrix-pill materiality-${(materiality || 'medium').toLowerCase().replace(/[^a-z]/g, '')}`}>
                                    ⚡ {materiality} Materiality
                                  </span>
                                )}
                                {exposureType && (
                                  <span className="matrix-pill exposure">
                                    🎯 {exposureType}
                                  </span>
                                )}
                                {horizon && (
                                  <span className="matrix-pill horizon">
                                    ⏱️ {horizon}
                                  </span>
                                )}
                                {priceReaction && (
                                  <span className="matrix-pill reaction">
                                    📈 {priceReaction}
                                  </span>
                                )}
                              </div>

                              {/* Why Affected */}
                              {whyAffected && (
                                <div className="matrix-field why-affected">
                                  <span className="matrix-field-tag why">Why Affected :</span>
                                  <span className="matrix-field-text">{whyAffected}</span>
                                </div>
                              )}

                              {/* AI Strategic Verdict */}
                              {aiVerdict && (
                                <div className="matrix-field ai-verdict">
                                  <span className="matrix-field-tag verdict">AI Verdict :</span>
                                  <span className="matrix-field-text">{aiVerdict}</span>
                                </div>
                              )}

                              {/* Risk Invalidation */}
                              {invalidation && (
                                <div className="matrix-field matrix-invalidation-row">
                                  <span className="matrix-field-tag invalidation">Risk Invalidation :</span>
                                  <span className="matrix-field-text">{invalidation}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </>
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

                {/* Bottom Actions: Institutional Detail + Ripple Toggle + Copilot + Voice + Source */}
                <div className="news-card-footer">
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className={`news-footer-btn detail-view-btn ${isDetailOpen ? "active-intel-btn" : "highlight-intel-btn"}`}
                      onClick={() => setExpandedDetailNewsId(isDetailOpen ? null : cardKey)}
                      title={isDetailOpen ? "Collapse detailed intelligence" : "Expand full institutional intelligence inside this box"}
                    >
                      {isDetailOpen ? "▲ Collapse Intelligence" : "⚡ Institutional Intelligence ▼"}
                    </button>

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
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                      {isCurrentlySpeaking ? "Stop Voice Brief" : "Listen to AI Brief"}
                    </button>
                  </div>
                </div>

                {/* Inline Full-Width Institutional Intelligence Analysis inside this card box */}
                {isDetailOpen && (
                  <div className="card-inline-expanded-detail">
                    <NewsDetailView
                      article={n}
                      isInline={true}
                      onBack={() => setExpandedDetailNewsId(null)}
                      goPage={goPage}
                      onOpenCopilot={handleOpenCopilotDrawer}
                    />
                  </div>
                )}
              </div>
            );
          })}

        </>
      )}

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
                            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
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
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
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
