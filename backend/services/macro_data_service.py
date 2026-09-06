import time
import math
import yfinance as yf
from typing import Dict, Any, List, Optional

# Major Global Macro, Commodity & FX Instruments impacting Indian Equities
MACRO_TICKERS = {
    "BRENT": {
        "ticker": "BZ=F",
        "name": "Brent Crude Oil",
        "category": "Energy",
        "unit": "USD/bbl",
        "default_price": 82.40,
        "impact": "Crucial for Oil Marketing Companies (BPCL, IOC), Paints (Asian Paints), Airlines (IndiGo)"
    },
    "WTI": {
        "ticker": "CL=F",
        "name": "WTI Light Sweet Crude",
        "category": "Energy",
        "unit": "USD/bbl",
        "default_price": 78.50,
        "impact": "Benchmark US energy pricing driving global refining spreads"
    },
    "NATURAL_GAS": {
        "ticker": "NG=F",
        "name": "Natural Gas (Henry Hub)",
        "category": "Energy",
        "unit": "USD/mmbtu",
        "default_price": 2.85,
        "impact": "Direct input cost for City Gas Distribution (ATGL, IGL, MGL) & Fertilizers"
    },
    "GOLD": {
        "ticker": "GC=F",
        "name": "Gold Comex Spot",
        "category": "Precious Metals",
        "unit": "USD/oz",
        "default_price": 2490.00,
        "impact": "Directly impacts Jewellery retailers (Titan, Kalyan Jewellers) & Gold Loan NBFCs"
    },
    "SILVER": {
        "ticker": "SI=F",
        "name": "Silver Comex Spot",
        "category": "Precious Metals",
        "unit": "USD/oz",
        "default_price": 31.50,
        "impact": "Industrial electronics, solar cell manufacturing & discretionary consumer demand"
    },
    "COPPER": {
        "ticker": "HG=F",
        "name": "Copper COMEX Futures",
        "category": "Industrial Metals",
        "unit": "USD/lb",
        "default_price": 4.25,
        "impact": "Dr. Copper - bellwether for global capital expenditure, power cables & auto wiring"
    },
    "USD_INR": {
        "ticker": "INR=X",
        "name": "USD / INR Exchange Rate",
        "category": "Currency / Forex",
        "unit": "INR",
        "default_price": 88.40,
        "impact": "Rupee depreciation boosts IT Services (TCS, INFY) & Pharma exports; hurts importers"
    },
    "US_10Y": {
        "ticker": "^TNX",
        "name": "US 10-Year Treasury Yield",
        "category": "Sovereign Debt",
        "unit": "%",
        "default_price": 4.15,
        "impact": "Risk-free rate benchmark dictating foreign institutional flows (FIIs) into Emerging Markets"
    }
}

_MACRO_CACHE: Dict[str, Any] = {}
_MACRO_CACHE_TS: float = 0
MACRO_CACHE_TTL = 60  # 60 seconds freshness

def _sanitize_val(val, default=0.0):
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return default
        return round(f, 2)
    except (TypeError, ValueError):
        return default

def fetch_single_macro_rate(key: str, meta: Dict[str, Any]) -> Dict[str, Any]:
    ticker_sym = meta["ticker"]
    default_p = meta["default_price"]
    
    try:
        t = yf.Ticker(ticker_sym)
        hist = t.history(period="5d", interval="1d")
        if not hist.empty and len(hist) >= 2:
            last_row = hist.iloc[-1]
            prev_row = hist.iloc[-2]
            live_price = _sanitize_val(last_row["Close"], default_p)
            prev_close = _sanitize_val(prev_row["Close"], live_price)
            change = _sanitize_val(live_price - prev_close, 0.0)
            change_pct = _sanitize_val((change / prev_close) * 100 if prev_close != 0 else 0.0, 0.0)
            
            return {
                "key": key,
                "name": meta["name"],
                "ticker": ticker_sym,
                "category": meta["category"],
                "unit": meta["unit"],
                "price": live_price,
                "prev_close": prev_close,
                "change": change,
                "change_pct": change_pct,
                "change_str": f"{'+' if change_pct >= 0 else ''}{change_pct:.2f}%",
                "high_24h": _sanitize_val(last_row["High"], live_price),
                "low_24h": _sanitize_val(last_row["Low"], live_price),
                "impact": meta["impact"],
                "is_live": True,
                "status": "up" if change_pct > 0 else "down" if change_pct < 0 else "neutral"
            }
    except Exception as e:
        print(f"Error fetching macro rate for {ticker_sym}: {e}")

    # Fallback to defaults
    return {
        "key": key,
        "name": meta["name"],
        "ticker": ticker_sym,
        "category": meta["category"],
        "unit": meta["unit"],
        "price": default_p,
        "prev_close": default_p,
        "change": 0.0,
        "change_pct": 0.0,
        "change_str": "+0.00%",
        "high_24h": default_p,
        "low_24h": default_p,
        "impact": meta["impact"],
        "is_live": False,
        "status": "neutral"
    }

def get_live_macro_rates() -> Dict[str, Any]:
    """
    Fetches real-time market rates for commodities, currencies, and sovereign yields.
    Refreshed every 60 seconds with multithreaded non-blocking ingestion.
    """
    global _MACRO_CACHE, _MACRO_CACHE_TS
    now = time.time()
    
    if _MACRO_CACHE and (now - _MACRO_CACHE_TS < MACRO_CACHE_TTL):
        return _MACRO_CACHE

    from concurrent.futures import ThreadPoolExecutor
    rates_list = []
    
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(fetch_single_macro_rate, k, meta) for k, meta in MACRO_TICKERS.items()]
        for f in futures:
            try:
                rates_list.append(f.result())
            except Exception:
                pass

    rates_map = {r["key"]: r for r in rates_list}
    
    result = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S IST"),
        "total_instruments": len(rates_list),
        "rates": rates_list,
        "rates_map": rates_map,
        "summary": {
            "brent_crude": rates_map.get("BRENT", {}).get("price", 82.40),
            "brent_change_pct": rates_map.get("BRENT", {}).get("change_pct", 0.0),
            "gold_spot": rates_map.get("GOLD", {}).get("price", 2490.00),
            "gold_change_pct": rates_map.get("GOLD", {}).get("change_pct", 0.0),
            "usdinr": rates_map.get("USD_INR", {}).get("price", 88.40),
            "usdinr_change_pct": rates_map.get("USD_INR", {}).get("change_pct", 0.0),
            "us_10y_yield": rates_map.get("US_10Y", {}).get("price", 4.15)
        }
    }
    
    _MACRO_CACHE = result
    _MACRO_CACHE_TS = now
    return result

def get_commodity_live_price(commodity_key: str) -> float:
    """Helper for Domino & Structural Engines to get the latest live spot price."""
    rates = get_live_macro_rates()
    rates_map = rates.get("rates_map", {})
    key_upper = commodity_key.upper().strip()
    
    if key_upper in rates_map:
        return float(rates_map[key_upper].get("price", 82.40))
    if "BRENT" in key_upper or "OIL" in key_upper or "CRUDE" in key_upper:
        return float(rates_map.get("BRENT", {}).get("price", 82.40))
    if "GAS" in key_upper:
        return float(rates_map.get("NATURAL_GAS", {}).get("price", 2.85))
    if "GOLD" in key_upper:
        return float(rates_map.get("GOLD", {}).get("price", 2490.00))
    if "INR" in key_upper or "USD" in key_upper:
        return float(rates_map.get("USD_INR", {}).get("price", 88.40))
        
    return 100.0
