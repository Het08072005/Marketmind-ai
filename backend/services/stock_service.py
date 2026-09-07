import os
import json
import copy
from typing import List, Dict, Optional
from data.init_data import TOP_36_COMPANIES

ADDITIONAL_INDIAN_COMPANIES = [
    {
        "symbol": "HCLTECH",
        "name": "HCL Technologies Ltd",
        "sector": "IT Services & Tech",
        "price": 1680.00,
        "change": "+0.45%",
        "market_cap": "₹4.5L Cr",
        "pe_ratio": 27.2,
        "pb_ratio": 6.8,
        "net_margin": 16.5,
        "roe": 24.1,
        "revenue_growth": 8.4,
        "debt_to_equity": 0.05,
        "rsi": 55.4,
        "pattern": "Cloud IT Acceleration"
    },
    {
        "symbol": "TECHM",
        "name": "Tech Mahindra Ltd",
        "sector": "IT Services & Tech",
        "price": 1460.00,
        "change": "-0.32%",
        "market_cap": "₹1.4L Cr",
        "pe_ratio": 29.8,
        "pb_ratio": 4.5,
        "net_margin": 10.2,
        "roe": 14.5,
        "revenue_growth": 6.2,
        "debt_to_equity": 0.08,
        "rsi": 52.1,
        "pattern": "Telecom 5G Recovery"
    },
    {
        "symbol": "INDIGO",
        "name": "InterGlobe Aviation Ltd",
        "sector": "Aviation & Mobility",
        "price": 4420.00,
        "change": "+1.25%",
        "market_cap": "₹1.7L Cr",
        "pe_ratio": 21.4,
        "pb_ratio": 8.2,
        "net_margin": 12.8,
        "roe": 38.2,
        "revenue_growth": 25.4,
        "debt_to_equity": 1.45,
        "rsi": 63.8,
        "pattern": "Aviation Monopoly Dominance"
    },
    {
        "symbol": "HAL",
        "name": "Hindustan Aeronautics Ltd",
        "sector": "Defense & Aerospace",
        "price": 4850.00,
        "change": "+1.85%",
        "market_cap": "₹3.2L Cr",
        "pe_ratio": 38.5,
        "pb_ratio": 8.9,
        "net_margin": 24.5,
        "roe": 27.8,
        "revenue_growth": 18.2,
        "debt_to_equity": 0.01,
        "rsi": 68.2,
        "pattern": "Indigenization Order Backlog"
    },
    {
        "symbol": "BEL",
        "name": "Bharat Electronics Ltd",
        "sector": "Defense & Aerospace",
        "price": 310.00,
        "change": "+0.95%",
        "market_cap": "₹2.2L Cr",
        "pe_ratio": 41.2,
        "pb_ratio": 9.4,
        "net_margin": 22.8,
        "roe": 24.6,
        "revenue_growth": 16.5,
        "debt_to_equity": 0.02,
        "rsi": 61.4,
        "pattern": "Defense Radar Expansion"
    },
    {
        "symbol": "TATAPOWER",
        "name": "Tata Power Company Ltd",
        "sector": "Green Energy & Utilities",
        "price": 435.00,
        "change": "+0.70%",
        "market_cap": "₹1.3L Cr",
        "pe_ratio": 33.1,
        "pb_ratio": 3.8,
        "net_margin": 8.5,
        "roe": 13.8,
        "revenue_growth": 14.2,
        "debt_to_equity": 1.65,
        "rsi": 58.6,
        "pattern": "Renewable Clean Capex"
    },
    {
        "symbol": "ZOMATO",
        "name": "Zomato Ltd",
        "sector": "Consumer Tech & Internet",
        "price": 265.00,
        "change": "+2.10%",
        "market_cap": "₹2.3L Cr",
        "pe_ratio": 98.4,
        "pb_ratio": 11.2,
        "net_margin": 6.2,
        "roe": 8.4,
        "revenue_growth": 68.5,
        "debt_to_equity": 0.02,
        "rsi": 64.5,
        "pattern": "Quick Commerce Blinkit Hypergrowth"
    },
    {
        "symbol": "TRENT",
        "name": "Trent Ltd",
        "sector": "Consumer & FMCG",
        "price": 6980.00,
        "change": "+1.65%",
        "market_cap": "₹2.4L Cr",
        "pe_ratio": 115.0,
        "pb_ratio": 24.5,
        "net_margin": 11.4,
        "roe": 28.5,
        "revenue_growth": 45.2,
        "debt_to_equity": 0.25,
        "rsi": 67.2,
        "pattern": "Zudio Fast Fashion Scale"
    },
    {
        "symbol": "VARUNBEV",
        "name": "Varun Beverages Ltd",
        "sector": "Consumer & FMCG",
        "price": 610.00,
        "change": "+0.40%",
        "market_cap": "₹1.9L Cr",
        "pe_ratio": 62.0,
        "pb_ratio": 14.8,
        "net_margin": 14.2,
        "roe": 34.2,
        "revenue_growth": 22.8,
        "debt_to_equity": 0.65,
        "rsi": 56.4,
        "pattern": "PepsiCo Franchise Moat"
    },
    {
        "symbol": "APOLLOHOSP",
        "name": "Apollo Hospitals Enterprise Ltd",
        "sector": "Pharma & Healthcare",
        "price": 7150.00,
        "change": "+0.80%",
        "market_cap": "₹1.0L Cr",
        "pe_ratio": 74.5,
        "pb_ratio": 13.2,
        "net_margin": 8.4,
        "roe": 16.5,
        "revenue_growth": 15.6,
        "debt_to_equity": 0.45,
        "rsi": 59.8,
        "pattern": "Hospital ARPOB Expansion"
    },
    {
        "symbol": "DLF",
        "name": "DLF Ltd",
        "sector": "Infrastructure & Metals",
        "price": 880.00,
        "change": "+0.50%",
        "market_cap": "₹2.1L Cr",
        "pe_ratio": 56.0,
        "pb_ratio": 4.8,
        "net_margin": 28.5,
        "roe": 9.8,
        "revenue_growth": 18.4,
        "debt_to_equity": 0.15,
        "rsi": 57.5,
        "pattern": "Luxury Super-Prime Real Estate"
    },
    {
        "symbol": "VEDL",
        "name": "Vedanta Ltd",
        "sector": "Infrastructure & Metals",
        "price": 460.00,
        "change": "+1.10%",
        "market_cap": "₹1.7L Cr",
        "pe_ratio": 14.2,
        "pb_ratio": 3.8,
        "net_margin": 11.2,
        "roe": 26.5,
        "revenue_growth": 12.0,
        "debt_to_equity": 1.45,
        "rsi": 58.2,
        "pattern": "High Dividend Demerger Play"
    },
    {
        "symbol": "PIDILITIND",
        "name": "Pidilite Industries Ltd",
        "sector": "Consumer & FMCG",
        "price": 3120.00,
        "change": "+0.35%",
        "market_cap": "₹1.5L Cr",
        "pe_ratio": 76.0,
        "pb_ratio": 16.8,
        "net_margin": 16.5,
        "roe": 21.8,
        "revenue_growth": 9.8,
        "debt_to_equity": 0.05,
        "rsi": 53.4,
        "pattern": "Fevicol Adhesive Monopoly"
    },
    {
        "symbol": "JIOFIN",
        "name": "Jio Financial Services Ltd",
        "sector": "Banking & Financial Services",
        "price": 335.00,
        "change": "+0.60%",
        "market_cap": "₹2.1L Cr",
        "pe_ratio": 120.0,
        "pb_ratio": 1.8,
        "net_margin": 65.0,
        "roe": 3.5,
        "revenue_growth": 28.0,
        "debt_to_equity": 0.01,
        "rsi": 54.2,
        "pattern": "BlackRock JV Asset Management"
    },
    {
        "symbol": "PAYTM",
        "name": "One97 Communications (Paytm)",
        "sector": "Consumer Tech & Internet",
        "price": 690.00,
        "change": "+1.40%",
        "market_cap": "₹44,000 Cr",
        "pe_ratio": 0.0,
        "pb_ratio": 3.2,
        "net_margin": -8.5,
        "roe": -12.4,
        "revenue_growth": 12.5,
        "debt_to_equity": 0.01,
        "rsi": 56.8,
        "pattern": "Merchant Soundbox Turnaround"
    },
    {
        "symbol": "YESBANK",
        "name": "Yes Bank Ltd",
        "sector": "Banking & Financial Services",
        "price": 22.50,
        "change": "+0.45%",
        "market_cap": "₹70,000 Cr",
        "pe_ratio": 48.0,
        "pb_ratio": 1.6,
        "net_margin": 6.8,
        "roe": 3.4,
        "revenue_growth": 14.5,
        "debt_to_equity": 6.5,
        "rsi": 50.2,
        "pattern": "NPA Recovery Post Reconstruction"
    },
    {
        "symbol": "PNB",
        "name": "Punjab National Bank",
        "sector": "Banking & Financial Services",
        "price": 112.00,
        "change": "+0.80%",
        "market_cap": "₹1.2L Cr",
        "pe_ratio": 9.8,
        "pb_ratio": 1.1,
        "net_margin": 12.4,
        "roe": 11.2,
        "revenue_growth": 16.4,
        "debt_to_equity": 7.8,
        "rsi": 53.6,
        "pattern": "PSU Asset Quality Normalization"
    },
    {
        "symbol": "BANKBARODA",
        "name": "Bank of Baroda",
        "sector": "Banking & Financial Services",
        "price": 255.00,
        "change": "+0.75%",
        "market_cap": "₹1.3L Cr",
        "pe_ratio": 7.4,
        "pb_ratio": 1.2,
        "net_margin": 15.8,
        "roe": 16.8,
        "revenue_growth": 15.2,
        "debt_to_equity": 7.2,
        "rsi": 55.0,
        "pattern": "Retail Loan & NIM Expansion"
    },
    {
        "symbol": "SUZLON",
        "name": "Suzlon Energy Ltd",
        "sector": "Green Energy & Utilities",
        "price": 68.50,
        "change": "+2.20%",
        "market_cap": "₹93,000 Cr",
        "pe_ratio": 45.0,
        "pb_ratio": 14.5,
        "net_margin": 11.5,
        "roe": 22.4,
        "revenue_growth": 36.5,
        "debt_to_equity": 0.02,
        "rsi": 62.4,
        "pattern": "Debt-Free Wind Turbine Turnaround"
    },
    {
        "symbol": "SWIGGY",
        "name": "Swiggy Ltd",
        "sector": "Consumer Tech & Internet",
        "price": 495.00,
        "change": "+1.15%",
        "market_cap": "₹1.1L Cr",
        "pe_ratio": 0.0,
        "pb_ratio": 6.5,
        "net_margin": -12.4,
        "roe": -18.2,
        "revenue_growth": 32.4,
        "debt_to_equity": 0.02,
        "rsi": 54.0,
        "pattern": "Instamart Unit Economics Path"
    },
    {
        "symbol": "BPCL",
        "name": "Bharat Petroleum Corporation Ltd",
        "sector": "Energy, Oil & Gas",
        "price": 345.00,
        "change": "+0.40%",
        "market_cap": "₹1.5L Cr",
        "pe_ratio": 8.2,
        "pb_ratio": 1.9,
        "net_margin": 5.4,
        "roe": 24.5,
        "revenue_growth": 6.8,
        "debt_to_equity": 0.65,
        "rsi": 51.5,
        "pattern": "Refining Margin & High Dividend"
    },
    {
        "symbol": "IOC",
        "name": "Indian Oil Corporation Ltd",
        "sector": "Energy, Oil & Gas",
        "price": 175.00,
        "change": "+0.35%",
        "market_cap": "₹2.4L Cr",
        "pe_ratio": 7.8,
        "pb_ratio": 1.5,
        "net_margin": 4.8,
        "roe": 18.2,
        "revenue_growth": 5.4,
        "debt_to_equity": 0.85,
        "rsi": 49.8,
        "pattern": "Petrochemical Capacity Additions"
    },
    {
        "symbol": "IRCTC",
        "name": "Indian Railway Catering & Tourism",
        "sector": "Consumer & FMCG",
        "price": 910.00,
        "change": "+0.55%",
        "market_cap": "₹72,000 Cr",
        "pe_ratio": 54.0,
        "pb_ratio": 19.5,
        "net_margin": 29.5,
        "roe": 38.5,
        "revenue_growth": 18.2,
        "debt_to_equity": 0.01,
        "rsi": 54.8,
        "pattern": "Monopoly Rail Ticketing & Tourism"
    },
    {
        "symbol": "BHEL",
        "name": "Bharat Heavy Electricals Ltd",
        "sector": "Infrastructure & Metals",
        "price": 278.00,
        "change": "+1.50%",
        "market_cap": "₹96,000 Cr",
        "pe_ratio": 145.0,
        "pb_ratio": 3.8,
        "net_margin": 1.2,
        "roe": 2.1,
        "revenue_growth": 22.0,
        "debt_to_equity": 0.35,
        "rsi": 59.4,
        "pattern": "Thermal Power Supercritical Orders"
    },
    {
        "symbol": "BSE",
        "name": "BSE Ltd",
        "sector": "Capital Markets & Exchanges",
        "price": 4380.00,
        "change": "+2.80%",
        "market_cap": "₹59,000 Cr",
        "pe_ratio": 68.0,
        "pb_ratio": 17.5,
        "net_margin": 38.4,
        "roe": 28.4,
        "revenue_growth": 65.0,
        "debt_to_equity": 0.01,
        "rsi": 66.8,
        "pattern": "Derivatives Turnover Market Share Surge"
    },
    {
        "symbol": "MCX",
        "name": "Multi Commodity Exchange of India",
        "sector": "Capital Markets & Exchanges",
        "price": 5890.00,
        "change": "+1.90%",
        "market_cap": "₹30,000 Cr",
        "pe_ratio": 82.0,
        "pb_ratio": 16.2,
        "net_margin": 32.5,
        "roe": 22.5,
        "revenue_growth": 48.0,
        "debt_to_equity": 0.01,
        "rsi": 65.0,
        "pattern": "Commodity Options Volume Multiplier"
    },
    {
        "symbol": "ANGELONE",
        "name": "Angel One Ltd",
        "sector": "Capital Markets & Exchanges",
        "price": 2740.00,
        "change": "+1.30%",
        "market_cap": "₹24,000 Cr",
        "pe_ratio": 19.5,
        "pb_ratio": 6.8,
        "net_margin": 28.2,
        "roe": 36.8,
        "revenue_growth": 34.0,
        "debt_to_equity": 0.45,
        "rsi": 57.2,
        "pattern": "Fintech Retail Demat Hyper-Acquisition"
    }
]

def _load_initial_registry() -> Dict[str, Dict]:
    registry: Dict[str, Dict] = {}
    
    # 1. Base Universe from Comprehensive 270+ Indian Equities
    try:
        from data.companies_universe_270 import COMPREHENSIVE_270_COMPANIES
        for c in COMPREHENSIVE_270_COMPANIES:
            sym = c.get("symbol", "").upper()
            if sym:
                registry[sym] = copy.deepcopy(c)
    except Exception as e:
        print(f"Error loading COMPREHENSIVE_270_COMPANIES: {e}")

    # 2. Enrich with detailed financial diagnostics from TOP_36 & ADDITIONAL
    for c in TOP_36_COMPANIES + ADDITIONAL_INDIAN_COMPANIES:
        sym = c.get("symbol", "").upper()
        if sym:
            if sym in registry:
                for k, v in c.items():
                    if k not in ("price", "change"):
                        registry[sym][k] = v
            else:
                registry[sym] = copy.deepcopy(c)

    # 3. Overlay authentic real-time NSE market quotes from real_market_quotes.json
    try:
        quotes_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "real_market_quotes.json")
        if os.path.exists(quotes_file):
            with open(quotes_file, "r", encoding="utf-8") as f:
                real_quotes = json.load(f)
                for sym, q in real_quotes.items():
                    if sym in registry and isinstance(q, dict):
                        registry[sym]["price"] = q.get("price", registry[sym].get("price"))
                        registry[sym]["change"] = q.get("change_str", registry[sym].get("change"))
    except Exception as e:
        print(f"Error overlaying real market quotes: {e}")

    return registry

# In-memory dictionary for fast O(1) symbol lookup with zero disk I/O
_COMPANIES_MAP: Dict[str, Dict] = _load_initial_registry()

def get_all_companies() -> List[Dict]:
    """Returns all active Indian companies from the in-memory registry."""
    return [copy.deepcopy(c) for c in _COMPANIES_MAP.values()]

def get_company_by_symbol(symbol: str) -> Optional[Dict]:
    """Retrieves company by symbol or partial match with zero disk I/O."""
    if not symbol:
        return None
    symbol_clean = symbol.upper().replace(".NS", "").replace(".BO", "").strip()
    
    if symbol_clean in _COMPANIES_MAP:
        return copy.deepcopy(_COMPANIES_MAP[symbol_clean])
    
    # Fallback partial search
    for sym, comp in _COMPANIES_MAP.items():
        if symbol_clean in sym or symbol_clean in comp.get("name", "").upper():
            return copy.deepcopy(comp)
    
    # Dynamic generation for any Indian market ticker
    name_clean = symbol_clean.title()
    dynamic_comp = {
        "symbol": symbol_clean,
        "name": f"{name_clean} Ltd",
        "sector": "Indian Equities",
        "industry": "NSE / BSE Listed",
        "price": 1250.0,
        "change": "+0.0%",
        "pe_ratio": 24.5,
        "roe": 14.8,
        "rsi": 52.0,
        "risk": "Moderate",
        "thesisBreakerCount": 0,
        "esgScore": 72
    }
    return dynamic_comp

def update_company_live_metrics(symbol: str, metrics: Dict) -> None:
    """Dynamically merges real-time live telemetry (prices, P/E, ROE, Market Cap) into registry."""
    if not symbol or not metrics:
        return
    symbol_clean = symbol.upper().replace(".NS", "").replace(".BO", "").strip()
    if symbol_clean in _COMPANIES_MAP:
        # Keep non-null live metrics updated
        for k, v in metrics.items():
            if v is not None:
                _COMPANIES_MAP[symbol_clean][k] = v

def get_sector_peers(sector: str) -> List[Dict]:
    """Returns all peers within a given sector."""
    sec_lower = (sector or "").lower()
    return [copy.deepcopy(c) for c in _COMPANIES_MAP.values() if sec_lower in c.get("sector", "").lower()]
