# 🔑 MarketMind AI — API Keys, Voice Engine & Top 20 Data Guide

Quick-reference cheatsheet for **API Keys**, **Voice Agent Setup (Deepgram + Google Gemini)**, and the **Top 20 Companies Data Strategy**.

---

## 1. 🔑 Required API Keys & Setup Links

| API Provider | Free Tier / Pricing | Setup URL | Purpose in MarketMind AI |
| :--- | :--- | :--- | :--- |
| **Google Gemini API** (`GEMINI_API_KEY`) | **Generous Free Tier** (15 RPM free on Flash) | [Google AI Studio](https://aistudio.google.com/) | Voice Brain, News classification, 1-click PDF Report Generation, Domino effect reasoning. |
| **Deepgram API** (`DEEPGRAM_API_KEY`) | **$200 Free Credit** on signup | [Deepgram Console](https://console.deepgram.com/) | Real-Time Speech-to-Text (`nova-2`) and Human-like Text-to-Speech (`aura`). |
| **Web Speech API** *(Browser Fallback)* | **100% Free / No API Key needed** | Built-in | Automatic offline fallback for mic input & audio output if no external key is present. |
| **Financial / News API** *(Optional)* | Free Tiers Available | [Finnhub.io](https://finnhub.io/) / [NewsAPI.org](https://newsapi.org/) | Live market feeds when transitioning from structured dummy data to live production. |

---

## 2. 🎙️ Voice Agent Engine: How It Works

```
                     ┌────────────────────────┐
                     │   Browser Microphone   │
                     └───────────┬────────────┘
                                 │ Audio Blob / PCM
                                 ▼
                     ┌────────────────────────┐
                     │ Deepgram Nova-2 (STT)  │ ──► Transcribes to text in ~120ms
                     └───────────┬────────────┘
                                 │ Text Question
                                 ▼
                     ┌────────────────────────┐
                     │ MarketMind AI Router   │ ──► Fetches live data for Ticker/Sector/News
                     └───────────┬────────────┘
                                 │ Enriched Context
                                 ▼
                     ┌────────────────────────┐
                     │ Google Gemini 1.5/2.0  │ ──► Generates spoken financial insight (~180ms)
                     └───────────┬────────────┘
                                 │ Response Text
                                 ▼
                     ┌────────────────────────┐
                     │ Deepgram Aura (TTS)    │ ──► Streams natural voice audio (~150ms)
                     └───────────┬────────────┘
                                 │ Audio Stream
                                 ▼
                     ┌────────────────────────┐
                     │  Browser Speaker Play  │
                     └────────────────────────┘
```

---

## 3. 🏢 Top 20 Companies Repository Plan

All mock data will be stored inside `backend/data/companies/` as structured JSON files:

```
backend/data/companies/
 ├── 1. reliance.json     (Energy & Conglomerate)
 ├── 2. tcs.json          (IT Services & Global Cloud)
 ├── 3. hdfcbank.json     (Banking & Credit)
 ├── 4. infy.json         (IT Services & Digital Core)
 ├── 5. icicibank.json    (Retail Banking)
 ├── 6. hul.json          (FMCG & Consumption)
 ├── 7. itc.json          (Conglomerate & Agri)
 ├── 8. sbi.json          (Public Sector Banking)
 ├── 9. airtel.json       (Telecom & 5G Infrastructure)
 ├── 10. lt.json          (Engineering & Mega Infrastructure)
 ├── 11. bajfinance.json  (Consumer Lending & NBFC)
 ├── 12. tatamotors.json  (Automotive, EV & Commercial)
 ├── 13. sunpharma.json   (Pharma & Healthcare)
 ├── 14. axisbank.json    (Banking & Wealth Management)
 ├── 15. ongc.json        (Oil & Gas Exploration)
 ├── 16. ntpc.json        (Power Generation & Green Energy)
 ├── 17. tatasteel.json   (Metals & Mining)
 ├── 18. maruti.json      (Passenger Vehicles)
 ├── 19. adanient.json    (Airports & Infrastructure)
 └── 20. spicejet.json    (Aviation & Collapse Case Study)
```

### 📦 Each Company JSON Structure:
```json
{
  "symbol": "RELIANCE",
  "name": "Reliance Industries Limited",
  "sector": "Energy & Conglomerate",
  "price": 2946.10,
  "change": "+1.8%",
  "market_cap": "₹19.9L Cr",
  "pe_ratio": 24.8,
  "roe": 11.6,
  "net_margin": 8.1,
  "debt_to_equity": 0.38,
  "rsi": 68.4,
  "esg": {
    "overall": 77,
    "environmental": 81,
    "social": 74,
    "governance": 76
  },
  "trust_meter": {
    "score": 78,
    "promises_kept": 14,
    "promises_delayed": 2,
    "promises_broken": 1,
    "timeline": [
      { "promise": "Commission 5G pan-India within 18 months", "made": "Q2 FY23", "status": "Kept" },
      { "promise": "Double retail footprint by FY25", "made": "Q4 FY23", "status": "Kept" }
    ]
  },
  "forensic": {
    "reported_profit_growth": "+14%",
    "cash_flow_growth": "+9%",
    "receivables_growth": "+11%",
    "divergence_score": "Fair (Low Risk)"
  },
  "domino_triggers": [
    { "event": "Crude Oil +30%", "direct_impact": "Refining margins expand +120bps", "ripple_order": 1 }
  ]
}
```

---

## 4. 🏆 Why This Project Wins Top Ranking:

1. **Not Just Another Stock Tracker**: We don't just display green and red numbers; we explain **cause and effect** across multiple industries.
2. **Accountability Focus**: The **Management Trust Meter** is a unique feature that checks CEO earnings call promises against audited financial records.
3. **Forensic Quality Scanning**: We look beneath reported net profit to examine cash flow divergence and receivables build-up before a collapse happens.
4. **Multilingual Ultra-Fast Voice Agent**: Natural speech interface powered by Deepgram + Google Gemini that speaks financial terminology with high precision.
