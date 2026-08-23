import time
import math
import numpy as np
import pandas as pd
import yfinance as yf
from typing import Dict, List, Optional, Any
from services.stock_service import get_all_companies, get_company_by_symbol

# Symbol mapping: Internal symbol -> NSE Yahoo Ticker
SYMBOL_TO_YAHOO = {
    # IT Services & Tech
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "WIPRO": "WIPRO.NS",
    "HCLTECH": "HCLTECH.NS",
    "TECHM": "TECHM.NS",

    # Banking & Financial Services
    "HDFCBANK": "HDFCBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "SBIN": "SBIN.NS",
    "AXISBANK": "AXISBANK.NS",
    "KOTAKBANK": "KOTAKBANK.NS",
    "BAJFINANCE": "BAJFINANCE.NS",

    # Energy, Oil & Conglomerates
    "RELIANCE": "RELIANCE.NS",
    "ONGC": "ONGC.NS",
    "ADANIENT": "ADANIENT.NS",
    "ATGL": "ATGL.NS",
    "ADANIPORTS": "ADANIPORTS.NS",
    "COALINDIA": "COALINDIA.NS",

    # Automotive & Mobility
    "TATAMOTORS": "TATAMOTORS.NS",
    "MARUTI": "MARUTI.NS",
    "M&M": "M&M.NS",
    "BAJAJ-AUTO": "BAJAJ-AUTO.NS",
    "EICHERMOT": "EICHERMOT.NS",

    # Consumer & FMCG
    "ITC": "ITC.NS",
    "HINDUNILVR": "HINDUNILVR.NS",
    "TITAN": "TITAN.NS",
    "NESTLEIND": "NESTLEIND.NS",
    "ASIANPAINT": "ASIANPAINT.NS",

    # Infrastructure, Power & Metals
    "LT": "LT.NS",
    "TATASTEEL": "TATASTEEL.NS",
    "JSWSTEEL": "JSWSTEEL.NS",
    "NTPC": "NTPC.NS",
    "POWERGRID": "POWERGRID.NS",

    # Pharma & Healthcare
    "SUNPHARMA": "SUNPHARMA.NS",
    "DRREDDY": "DRREDDY.NS",
    "CIPLA": "CIPLA.NS",
    "DIVISLAB": "DIVISLAB.NS",

    # Airlines
    "SPICEJET": "SPICEJET.BO",
}

# In-memory high speed cache (TTL 60s)
_QUOTE_CACHE: Dict[str, Dict[str, Any]] = {}
_HISTORY_CACHE: Dict[str, Dict[str, Any]] = {}
_CACHE_TIMESTAMP = 0
CACHE_TTL = 60 # seconds

def calculate_rsi(prices: pd.Series, period: int = 14) -> float:
    if len(prices) < period + 1:
        return 50.0
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss.replace(0, 0.001)
    rsi_series = 100 - (100 / (1 + rs))
    last_val = rsi_series.iloc[-1]
    return float(round(last_val, 2)) if not pd.isna(last_val) else 50.0

def detect_candlestick_patterns(df: pd.DataFrame) -> List[Dict[str, Any]]:
    patterns = []
    if len(df) < 3:
        return patterns

    # Get last 3 candles
    last = df.iloc[-1]
    prev = df.iloc[-2]
    prev2 = df.iloc[-3]

    o, h, l, c = last["Open"], last["High"], last["Low"], last["Close"]
    body = abs(c - o)
    candle_range = max(h - l, 0.01)
    upper_shadow = h - max(o, c)
    lower_shadow = min(o, c) - l

    # 1. Doji (indecision)
    if body / candle_range < 0.1:
        patterns.append({
            "name": "Doji",
            "type": "Neutral / Indecision",
            "reliability": "Medium",
            "bias": "neutral",
            "desc": "Opening and closing prices are virtually equal, signaling market equilibrium."
        })

    # 2. Hammer (Bullish Reversal)
    if (lower_shadow > 2 * body) and (upper_shadow < 0.2 * body) and (c > o):
        patterns.append({
            "name": "Bullish Hammer",
            "type": "Bullish Reversal",
            "reliability": "High",
            "bias": "bullish",
            "desc": "Buyers rejected lower prices, driving price back up near the high."
        })

    # 3. Shooting Star (Bearish Reversal)
    if (upper_shadow > 2 * body) and (lower_shadow < 0.2 * body) and (o > c):
        patterns.append({
            "name": "Shooting Star",
            "type": "Bearish Reversal",
            "reliability": "High",
            "bias": "bearish",
            "desc": "Sellers pushed back after a test of higher prices."
        })

    # 4. Bullish Engulfing
    if (prev["Close"] < prev["Open"]) and (c > o) and (c > prev["Open"]) and (o < prev["Close"]):
        patterns.append({
            "name": "Bullish Engulfing",
            "type": "Strong Bullish Reversal",
            "reliability": "Very High",
            "bias": "bullish",
            "desc": "Green candle completely engulfs the prior red candle body."
        })

    # Default fallback pattern if nothing triggered
    if not patterns:
        if c > o:
            patterns.append({
                "name": "Bullish Momentum Candle",
                "type": "Continuation",
                "reliability": "Medium",
                "bias": "bullish",
                "desc": "Consistent buying volume driving close above open."
            })
        else:
            patterns.append({
                "name": "Consolidation Range",
                "type": "Neutral",
                "reliability": "Medium",
                "bias": "neutral",
                "desc": "Price is testing current support band."
            })

    return patterns

def fetch_live_stock_data(symbol: str) -> Dict[str, Any]:
    global _QUOTE_CACHE, _CACHE_TIMESTAMP
    sym_upper = symbol.upper().strip()
    fallback_comp = get_company_by_symbol(sym_upper) or {
        "symbol": sym_upper,
        "name": f"{sym_upper} India",
        "price": 1500.0,
        "change": "+0.5%",
        "pe_ratio": 24.5,
        "rsi": 55.0,
        "sector": "Diversified"
    }

    now = time.time()
    if sym_upper in _QUOTE_CACHE and (now - _QUOTE_CACHE[sym_upper]["_ts"]) < CACHE_TTL:
        return _QUOTE_CACHE[sym_upper]["data"]

    yahoo_sym = SYMBOL_TO_YAHOO.get(sym_upper, f"{sym_upper}.NS")
    try:
        ticker = yf.Ticker(yahoo_sym)
        hist = ticker.history(period="1mo", interval="1d")
        
        if not hist.empty and len(hist) >= 5:
            last_row = hist.iloc[-1]
            prev_row = hist.iloc[-2]
            
            live_price = float(round(last_row["Close"], 2))
            prev_close = float(round(prev_row["Close"], 2))
            day_change = float(round(live_price - prev_close, 2))
            day_change_pct = float(round((day_change / prev_close) * 100, 2))
            
            rsi = calculate_rsi(hist["Close"], 14)
            sma_20 = float(round(hist["Close"].tail(20).mean(), 2))
            
            formatted_change = f"{'+' if day_change_pct >= 0 else ''}{day_change_pct}%"
            
            result = {
                **fallback_comp,
                "symbol": sym_upper,
                "price": live_price,
                "change": formatted_change,
                "change_raw": day_change,
                "change_pct_raw": day_change_pct,
                "rsi": rsi,
                "sma_20": sma_20,
                "volume": int(last_row["Volume"]),
                "day_high": float(round(last_row["High"], 2)),
                "day_low": float(round(last_row["Low"], 2)),
                "is_live": True,
                "last_updated": time.strftime("%H:%M:%S IST")
            }
            
            _QUOTE_CACHE[sym_upper] = {"data": result, "_ts": now}
            return result
    except Exception as e:
        print(f"yfinance fetch error for {sym_upper}: {e}")

    # Fallback response
    return {
        **fallback_comp,
        "is_live": False,
        "last_updated": "Cached / Simulated"
    }

def get_all_live_companies() -> List[Dict[str, Any]]:
    static_comps = get_all_companies()
    results = []
    for c in static_comps:
        sym = c.get("symbol")
        try:
            live_data = fetch_live_stock_data(sym)
            results.append(live_data)
        except Exception:
            results.append(c)
    return results

def get_stock_historical_candles(symbol: str, period: str = "1mo") -> Dict[str, Any]:
    global _HISTORY_CACHE
    sym_upper = symbol.upper().strip()
    now = time.time()

    cache_key = f"{sym_upper}_{period}"
    if cache_key in _HISTORY_CACHE and (now - _HISTORY_CACHE[cache_key]["_ts"]) < CACHE_TTL:
        return _HISTORY_CACHE[cache_key]["data"]

    yahoo_sym = SYMBOL_TO_YAHOO.get(sym_upper, f"{sym_upper}.NS")
    candles = []
    patterns = []
    
    try:
        ticker = yf.Ticker(yahoo_sym)
        df = ticker.history(period=period, interval="1d")
        
        if not df.empty:
            for idx, row in df.iterrows():
                candles.append({
                    "date": idx.strftime("%d %b"),
                    "open": float(round(row["Open"], 2)),
                    "high": float(round(row["High"], 2)),
                    "low": float(round(row["Low"], 2)),
                    "close": float(round(row["Close"], 2)),
                    "volume": int(row["Volume"]),
                })
            
            patterns = detect_candlestick_patterns(df)
            
            summary = {
                "symbol": sym_upper,
                "period": period,
                "candles_count": len(candles),
                "candles": candles,
                "patterns": patterns,
                "support_level": float(round(df["Low"].min(), 2)),
                "resistance_level": float(round(df["High"].max(), 2)),
                "rsi": calculate_rsi(df["Close"], 14),
                "is_live": True
            }
            
            _HISTORY_CACHE[cache_key] = {"data": summary, "_ts": now}
            return summary
    except Exception as e:
        print(f"Historical candles error for {sym_upper}: {e}")

    # Fallback deterministic 30-day candles if offline
    base_price = 1500.0
    comp = get_company_by_symbol(sym_upper)
    if comp:
        base_price = float(comp.get("price", 1500.0))

    sim_candles = []
    current = base_price * 0.92
    for i in range(30):
        change = (np.sin(i / 3.0) * 0.02 + np.random.uniform(-0.015, 0.018)) * current
        c = current + change
        o = current
        h = max(o, c) + abs(np.random.uniform(2, 15))
        l = min(o, c) - abs(np.random.uniform(2, 15))
        vol = int(np.random.uniform(1500000, 8000000))
        sim_candles.append({
            "date": f"Day {i+1}",
            "open": round(o, 2),
            "high": round(h, 2),
            "low": round(l, 2),
            "close": round(c, 2),
            "volume": vol
        })
        current = c

    sim_summary = {
        "symbol": sym_upper,
        "period": period,
        "candles_count": 30,
        "candles": sim_candles,
        "patterns": [
            {
                "name": "Bullish Continuation",
                "type": "Trend Momentum",
                "reliability": "High",
                "bias": "bullish",
                "desc": "Moving averages sloping upward with positive volume support."
            }
        ],
        "support_level": round(min(c["low"] for c in sim_candles), 2),
        "resistance_level": round(max(c["high"] for c in sim_candles), 2),
        "rsi": 58.4,
        "is_live": False
    }
    return sim_summary
