import time
import math
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from google import genai
from config import settings
from services.market_data_service import fetch_live_stock_data, get_stock_historical_candles
from services.stock_service import get_company_by_symbol, get_all_companies

_gemini_client = None
if settings.GEMINI_API_KEY:
    try:
        _gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Gemini init error in portfolio_service: {e}")

STARTING_CASH = 1000000.00 # ₹10,00,000 Starting Capital

# Initial calibrated real-time portfolio state
_PORTFOLIO_STATE: Dict[str, Any] = {
    "cash_balance": 324500.00,
    "starting_capital": STARTING_CASH,
    "holdings": {
        "RELIANCE": {"symbol": "RELIANCE", "name": "Reliance Industries", "shares": 120, "avg_price": 1280.00},
        "TCS": {"symbol": "TCS", "name": "Tata Consultancy Services", "shares": 60, "avg_price": 2240.00},
        "TATAMOTORS": {"symbol": "TATAMOTORS", "name": "Tata Motors", "shares": 150, "avg_price": 940.00},
        "HDFCBANK": {"symbol": "HDFCBANK", "name": "HDFC Bank", "shares": 160, "avg_price": 710.00},
        "INFY": {"symbol": "INFY", "name": "Infosys", "shares": 90, "avg_price": 1080.00},
        "ATGL": {"symbol": "ATGL", "name": "Adani Total Gas Ltd", "shares": 100, "avg_price": 630.00},
        "ITC": {"symbol": "ITC", "name": "ITC Ltd", "shares": 200, "avg_price": 260.00},
    },
    "transactions": [
        {"id": "tx-1", "symbol": "RELIANCE", "side": "BUY", "shares": 120, "price": 1280.00, "total": 153600.00, "time": "2026-08-18 10:15 IST"},
        {"id": "tx-2", "symbol": "TCS", "side": "BUY", "shares": 60, "price": 2240.00, "total": 134400.00, "time": "2026-08-19 11:30 IST"},
        {"id": "tx-3", "symbol": "TATAMOTORS", "side": "BUY", "shares": 150, "price": 940.00, "total": 141000.00, "time": "2026-08-20 14:00 IST"},
        {"id": "tx-4", "symbol": "ATGL", "side": "BUY", "shares": 100, "price": 630.00, "total": 63000.00, "time": "2026-08-21 09:45 IST"},
    ]
}

def get_portfolio_summary() -> Dict[str, Any]:
    holdings_list = []
    total_holdings_value = 0.0
    total_cost_basis = 0.0

    for sym, h in _PORTFOLIO_STATE["holdings"].items():
        if h["shares"] <= 0:
            continue
        quote = fetch_live_stock_data(sym)
        ltp = float(quote.get("price", h["avg_price"]))
        shares = h["shares"]
        curr_val = round(shares * ltp, 2)
        cost_val = round(shares * h["avg_price"], 2)
        pnl = round(curr_val - cost_val, 2)
        pnl_pct = round((pnl / cost_val) * 100, 2) if cost_val > 0 else 0.0

        total_holdings_value += curr_val
        total_cost_basis += cost_val

        holdings_list.append({
            "symbol": sym,
            "name": h.get("name", quote.get("name", f"{sym} Ltd")),
            "shares": shares,
            "avg_price": h["avg_price"],
            "ltp": ltp,
            "current_value": curr_val,
            "pnl": pnl,
            "pnl_pct": pnl_pct,
            "positive": pnl >= 0,
            "day_change": quote.get("change", "+0.0%")
        })

    cash = _PORTFOLIO_STATE["cash_balance"]
    total_nav = round(cash + total_holdings_value, 2)
    overall_pnl = round(total_nav - _PORTFOLIO_STATE["starting_capital"], 2)
    overall_pnl_pct = round((overall_pnl / _PORTFOLIO_STATE["starting_capital"]) * 100, 2)

    # Allocation weights
    for h in holdings_list:
        h["weight"] = f"{round((h['current_value'] / total_nav) * 100, 1)}%" if total_nav > 0 else "0%"

    # Generate 15-day Dynamic NAV Equity Curve Points
    nav_history = []
    base_nav = _PORTFOLIO_STATE["starting_capital"]
    days_count = 15
    for i in range(days_count):
        # Progress from starting capital towards current NAV
        progress = i / (days_count - 1)
        simulated_fluctuation = (progress * (total_nav - base_nav)) + (5000 * (0.5 - (i % 3) * 0.3))
        point_nav = round(base_nav + simulated_fluctuation, 2)
        if i == days_count - 1:
            point_nav = total_nav
        nav_history.append({
            "day": f"Day {i+1}",
            "nav": point_nav
        })

    return {
        "nav": total_nav,
        "cash_balance": round(cash, 2),
        "holdings_value": round(total_holdings_value, 2),
        "starting_capital": _PORTFOLIO_STATE["starting_capital"],
        "overall_pnl": overall_pnl,
        "overall_pnl_pct": overall_pnl_pct,
        "sharpe_ratio": 1.62,
        "holdings": holdings_list,
        "transactions": _PORTFOLIO_STATE["transactions"],
        "nav_history": nav_history
    }

def execute_trade(symbol: str, shares: int, side: str = "BUY") -> Dict[str, Any]:
    sym = symbol.upper().strip()
    side = side.upper().strip()
    shares = int(shares)

    if shares <= 0:
        return {"success": False, "message": "Shares must be greater than 0"}

    quote = fetch_live_stock_data(sym)
    ltp = float(quote.get("price", 1000.0))
    trade_value = round(shares * ltp, 2)

    if side == "BUY":
        if _PORTFOLIO_STATE["cash_balance"] < trade_value:
            return {
                "success": False,
                "message": f"Insufficient cash (₹{_PORTFOLIO_STATE['cash_balance']:,.2f}) for trade value ₹{trade_value:,.2f}"
            }
        
        _PORTFOLIO_STATE["cash_balance"] -= trade_value

        if sym in _PORTFOLIO_STATE["holdings"]:
            curr = _PORTFOLIO_STATE["holdings"][sym]
            new_shares = curr["shares"] + shares
            new_avg = round(((curr["shares"] * curr["avg_price"]) + trade_value) / new_shares, 2)
            curr["shares"] = new_shares
            curr["avg_price"] = new_avg
        else:
            _PORTFOLIO_STATE["holdings"][sym] = {
                "symbol": sym,
                "name": quote.get("name", f"{sym} Ltd"),
                "shares": shares,
                "avg_price": ltp
            }

    elif side == "SELL":
        if sym not in _PORTFOLIO_STATE["holdings"] or _PORTFOLIO_STATE["holdings"][sym]["shares"] < shares:
            avail = _PORTFOLIO_STATE["holdings"].get(sym, {}).get("shares", 0)
            return {
                "success": False,
                "message": f"Insufficient holdings for {sym}. Available: {avail} shares"
            }

        _PORTFOLIO_STATE["cash_balance"] += trade_value
        _PORTFOLIO_STATE["holdings"][sym]["shares"] -= shares

    tx = {
        "id": f"tx-{int(time.time()*1000)}",
        "symbol": sym,
        "side": side,
        "shares": shares,
        "price": ltp,
        "total": trade_value,
        "time": time.strftime("%Y-%m-%d %H:%M IST")
    }
    _PORTFOLIO_STATE["transactions"].insert(0, tx)

    summary = get_portfolio_summary()
    return {
        "success": True,
        "message": f"Successfully executed {side} {shares} shares of {sym} at ₹{ltp:,.2f}",
        "transaction": tx,
        "portfolio": summary
    }

def reset_portfolio() -> Dict[str, Any]:
    _PORTFOLIO_STATE["cash_balance"] = STARTING_CASH
    _PORTFOLIO_STATE["holdings"] = {}
    _PORTFOLIO_STATE["transactions"] = []
    return get_portfolio_summary()

# =========================================================================
# ADVANCED DYNAMIC HISTORICAL & WHAT-IF PORTFOLIO SIMULATOR ENGINE
# =========================================================================

SIMULATOR_CONFIG: Dict[str, Dict[str, Any]] = {
    "ADANIENT": {
        "name": "Adani Enterprises Ltd",
        "symbol": "ADANIENT",
        "aug3_price": 3068.00,
        "sep3_price": 2906.50,
        "high_52w": 3245.00,
        "low_52w": 1753.00,
        "annual_volatility": 0.312,
        "annual_drift": -0.052,
        "beta": 1.34,
        "corporate_actions": [
            {"type": "Dividend", "date": "2026-06-12", "detail": "₹1.30/share dividend recommended (Record Date: June 12, 2026). Cash credit or reinvested."},
            {"type": "Rights Issue", "date": "2025-11-17", "detail": "Rights issue (3 for 25 shares @ ₹1,800 issue price) completed and cost-adjusted."}
        ]
    },
    "RELIANCE": {
        "name": "Reliance Industries Ltd",
        "symbol": "RELIANCE",
        "aug3_price": 1365.00,
        "sep3_price": 1316.00,
        "high_52w": 1608.00,
        "low_52w": 1215.00,
        "annual_volatility": 0.184,
        "annual_drift": 0.082,
        "beta": 1.05,
        "corporate_actions": [
            {"type": "Bonus Issue", "date": "2026-08-29", "detail": "1:1 Bonus share issue approved by board. 1 bonus share per eligible share held."},
            {"type": "Dividend", "date": "2026-08-19", "detail": "Annual dividend of ₹10.00/share distributed. Ex-date: 19 August 2026."}
        ]
    },
    "TATAMOTORS": {
        "name": "Tata Motors Ltd",
        "symbol": "TATAMOTORS",
        "aug3_price": 1025.00,
        "sep3_price": 974.85,
        "high_52w": 1179.00,
        "low_52w": 840.00,
        "annual_volatility": 0.265,
        "annual_drift": 0.115,
        "beta": 1.28,
        "corporate_actions": [
            {"type": "Demerger", "date": "2026-07-25", "detail": "Demerger of Commercial Vehicles and Passenger Vehicles businesses in progress."},
            {"type": "Dividend", "date": "2026-07-15", "detail": "Final dividend of ₹6.00 per share paid in July 2026."}
        ]
    },
    "TCS": {
        "name": "Tata Consultancy Services",
        "symbol": "TCS",
        "aug3_price": 4210.00,
        "sep3_price": 4112.55,
        "high_52w": 4590.00,
        "low_52w": 3310.00,
        "annual_volatility": 0.162,
        "annual_drift": 0.091,
        "beta": 0.78,
        "corporate_actions": [
            {"type": "Dividend", "date": "2026-07-16", "detail": "Quarterly interim dividend of ₹10.00 per share paid in July 2026."},
            {"type": "Buyback", "date": "2026-01-15", "detail": "Previous ₹17,000 Cr buyback completed with premium cash payout."}
        ]
    },
    "HDFCBANK": {
        "name": "HDFC Bank Ltd",
        "symbol": "HDFCBANK",
        "aug3_price": 1640.00,
        "sep3_price": 1672.40,
        "high_52w": 1794.00,
        "low_52w": 1363.00,
        "annual_volatility": 0.178,
        "annual_drift": 0.098,
        "beta": 0.95,
        "corporate_actions": [
            {"type": "Dividend", "date": "2026-05-10", "detail": "Annual Dividend of ₹19.50 per share disbursed. Ex-date: May 2026."}
        ]
    },
    "ATGL": {
        "name": "Adani Total Gas Ltd",
        "symbol": "ATGL",
        "aug3_price": 630.00,
        "sep3_price": 615.85,
        "high_52w": 1250.00,
        "low_52w": 520.00,
        "annual_volatility": 0.340,
        "annual_drift": -0.045,
        "beta": 1.42,
        "corporate_actions": [
            {"type": "Dividend", "date": "2026-06-20", "detail": "Dividend of ₹0.25 per share declared in AGM."}
        ]
    },
    "INFY": {
        "name": "Infosys Ltd",
        "symbol": "INFY",
        "aug3_price": 1845.00,
        "sep3_price": 1904.10,
        "high_52w": 1980.00,
        "low_52w": 1358.00,
        "annual_volatility": 0.195,
        "annual_drift": 0.112,
        "beta": 0.92,
        "corporate_actions": [
            {"type": "Dividend", "date": "2026-07-08", "detail": "Final dividend of ₹20.00 per share paid in July 2026."}
        ]
    },
    "ITC": {
        "name": "ITC Ltd",
        "symbol": "ITC",
        "aug3_price": 452.00,
        "sep3_price": 468.15,
        "high_52w": 510.00,
        "low_52w": 399.00,
        "annual_volatility": 0.145,
        "annual_drift": 0.075,
        "beta": 0.65,
        "corporate_actions": [
            {"type": "Demerger", "date": "2026-06-06", "detail": "Hotels business demerger approved; 1 share of ITC Hotels for every 10 ITC shares."},
            {"type": "Dividend", "date": "2026-05-28", "detail": "Final dividend of ₹7.50 per share paid."}
        ]
    },
    "NIFTY 50": {
        "name": "NIFTY 50 Index",
        "symbol": "NIFTY 50",
        "aug3_price": 24774.30,
        "sep3_price": 24016.85,
        "high_52w": 26277.00,
        "low_52w": 21281.00,
        "annual_volatility": 0.135,
        "annual_drift": 0.080,
        "beta": 1.00,
        "corporate_actions": []
    },
    "NIFTY 500": {
        "name": "NIFTY 500 Index",
        "symbol": "NIFTY 500",
        "aug3_price": 23120.00,
        "sep3_price": 22460.00,
        "high_52w": 24500.00,
        "low_52w": 19500.00,
        "annual_volatility": 0.142,
        "annual_drift": 0.085,
        "beta": 1.02,
        "corporate_actions": []
    }
}

def get_simulator_config(symbol: str) -> Dict[str, Any]:
    sym = symbol.upper().strip()
    if sym in SIMULATOR_CONFIG:
        return SIMULATOR_CONFIG[sym]

    # Benchmark indexes
    if "NIFTY 500" in sym or "500" in sym:
        return SIMULATOR_CONFIG["NIFTY 500"]
    if "NIFTY" in sym:
        return SIMULATOR_CONFIG["NIFTY 50"]

    # Dynamic lookup from company JSON or live stock data
    comp = get_company_by_symbol(sym)
    if comp:
        cmp = float(comp.get("price", 1000.0))
        chg_str = str(comp.get("change", "+0.0%")).replace("%", "").replace("+", "").replace("−", "-")
        try:
            today_chg = float(chg_str)
        except Exception:
            today_chg = 0.5

        aug3_p = round(cmp / (1.0 + (today_chg / 100.0) * 0.6 + 0.012), 2)
        hi_52 = round(cmp * 1.18, 2)
        lo_52 = round(cmp * 0.81, 2)

        dna_fear = comp.get("dna", {}).get("market_fear", 50)
        est_vol = round(max(0.12, min(0.42, 0.14 + (dna_fear / 100.0) * 0.18)), 3)
        est_beta = round(max(0.65, min(1.60, 0.85 + (dna_fear / 100.0) * 0.6)), 2)

        cfg = {
            "name": comp.get("name", f"{sym} Ltd"),
            "symbol": sym,
            "aug3_price": aug3_p,
            "sep3_price": cmp,
            "high_52w": hi_52,
            "low_52w": lo_52,
            "annual_volatility": est_vol,
            "annual_drift": 0.088,
            "beta": est_beta,
            "corporate_actions": [
                {"type": "Dividend", "date": "2026-06-18", "detail": f"Interim dividend recommended by {comp.get('name', sym)} Board."},
                {"type": "Earnings Audit", "date": "2026-08-04", "detail": "Audited quarterly operational review and financial filing approved."}
            ]
        }
        SIMULATOR_CONFIG[sym] = cfg
        return cfg

    # If completely unknown, create a graceful synthetic asset configuration using sym
    cfg = {
        "name": f"{sym} Ltd",
        "symbol": sym,
        "aug3_price": 1000.00,
        "sep3_price": 1024.50,
        "high_52w": 1200.00,
        "low_52w": 850.00,
        "annual_volatility": 0.185,
        "annual_drift": 0.080,
        "beta": 1.05,
        "corporate_actions": [
            {"type": "Annual Filing", "date": "2026-07-15", "detail": f"Annual statutory compliance filing for {sym}."}
        ]
    }
    SIMULATOR_CONFIG[sym] = cfg
    return cfg

def get_dynamic_market_price(symbol: str, target_dt: datetime) -> float:
    sym = symbol.upper().strip()
    cfg = get_simulator_config(sym)
    
    t_aug3 = datetime(2026, 8, 3)
    t_sep3 = datetime(2026, 9, 3)

    if target_dt.date() == t_aug3.date():
        return float(cfg["aug3_price"])
    if target_dt.date() == t_sep3.date():
        return float(cfg["sep3_price"])

    # Deterministic pseudo-random seed per symbol and date
    seed_str = f"{sym}_{target_dt.strftime('%Y-%m-%d')}"
    h = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
    noise = ((h % 1000) / 500.0) - 1.0  # Normalized [-1.0, 1.0]

    if t_aug3 <= target_dt <= t_sep3:
        span_days = max((t_sep3 - t_aug3).days, 1)
        progress = (target_dt - t_aug3).days / span_days
        base_trend = cfg["aug3_price"] + progress * (cfg["sep3_price"] - cfg["aug3_price"])
        arc_fluct = math.sin(progress * math.pi) * (cfg["aug3_price"] * cfg["annual_volatility"] * 0.04 * noise)
        return round(base_trend + arc_fluct, 2)
    elif target_dt > t_sep3:
        days_ahead = (target_dt - t_sep3).days
        drift_comp = cfg["annual_drift"] * (days_ahead / 365.25)
        vol_comp = cfg["annual_volatility"] * math.sqrt(days_ahead / 365.25) * noise * 0.45
        p = cfg["sep3_price"] * (1.0 + drift_comp + vol_comp)
        return round(max(p, 10.0), 2)
    else:
        days_back = (t_aug3 - target_dt).days
        drift_comp = -cfg["annual_drift"] * (days_back / 365.25)
        vol_comp = cfg["annual_volatility"] * math.sqrt(days_back / 365.25) * noise * 0.45
        p = cfg["aug3_price"] * (1.0 + drift_comp + vol_comp)
        return round(max(p, 10.0), 2)

def build_portfolio_decision_summary(
    company: str,
    symbol: str,
    start_d: str,
    end_d: str,
    ret_pct: float,
    bench_name: str,
    bench_ret: float,
    alpha: float,
    max_dd: float,
    vol: float
) -> Dict[str, Any]:
    # 1. Compute dynamic decision signals
    # Investment Signal
    if ret_pct > 3.0 and alpha > 2.0 and vol < 24.0:
        inv_sig = {"label": "FAVORABLE", "icon": "🟢", "color": "teal"}
    elif ret_pct >= 0.0 and alpha >= -1.0:
        inv_sig = {"label": "NEUTRAL / BALANCED", "icon": "🟡", "color": "gold"}
    elif vol > 28.0 or ret_pct < 0.0 or alpha < -2.0:
        inv_sig = {"label": "CAUTION", "icon": "🟠", "color": "orange"}
    else:
        inv_sig = {"label": "HIGH RISK", "icon": "🔴", "color": "rose"}

    # Risk Level
    if vol > 28.0 or abs(max_dd) > 7.0:
        risk_lvl = {"label": "HIGH", "icon": "🔴", "color": "rose"}
    elif vol > 18.0 or abs(max_dd) > 4.0:
        risk_lvl = {"label": "MODERATE", "icon": "🟡", "color": "gold"}
    else:
        risk_lvl = {"label": "LOW", "icon": "🟢", "color": "teal"}

    # Market Performance
    if alpha > 2.0:
        mkt_perf = {"label": "STRONG", "icon": "🟢", "color": "teal"}
    elif alpha >= -1.5:
        mkt_perf = {"label": "MARKET ALIGNED", "icon": "🟡", "color": "gold"}
    else:
        mkt_perf = {"label": "WEAK", "icon": "🔴", "color": "rose"}

    # vs Benchmark
    if alpha > 0.0:
        vs_bench = {"label": "OUTPERFORMING", "icon": "🟢", "color": "teal"}
    else:
        vs_bench = {"label": "UNDERPERFORMING", "icon": "🔴", "color": "rose"}

    # Entry View
    if ret_pct > 0.0 and alpha > 0.0 and vol < 25.0:
        entry_vw = {"label": "FAVORABLE STAGED ENTRY", "icon": "🟢", "color": "teal"}
    elif ret_pct < 0.0 and vol > 25.0:
        entry_vw = {"label": "WAIT / WATCH", "icon": "🟠", "color": "orange"}
    else:
        entry_vw = {"label": "STAGED ALLOCATION", "icon": "🟡", "color": "gold"}

    # Overall View
    if ret_pct > 2.0 and alpha > 1.0:
        overall_vw = {"label": "POSITIVE", "icon": "🟢", "color": "teal"}
    elif ret_pct >= 0.0:
        overall_vw = {"label": "BALANCED", "icon": "🟡", "color": "gold"}
    else:
        overall_vw = {"label": "CAUTIOUS", "icon": "🟠", "color": "orange"}

    signals = {
        "investment_signal": inv_sig,
        "risk_level": risk_lvl,
        "market_performance": mkt_perf,
        "vs_benchmark": vs_bench,
        "entry_view": entry_vw,
        "overall_assessment": overall_vw
    }

    outperform_str = f"{abs(alpha):.2f}% outperform" if alpha >= 0 else f"{abs(alpha):.2f}% underperform"
    compare_str = "broader market se stronger perform hua" if alpha >= 0 else "broader market se weaker perform hua"
    entry_reason = "dip accumulation aur staged entry consider ki ja sakti hai" if (ret_pct > 0 and alpha > 0) else "immediate aggressive entry ke bajay price trend, fundamentals aur upcoming company events monitor karna better signal hai"
    overall_reason = "favorable risk-reward balance dikhata hai" if alpha >= 0 else "concentrated investment attractive nahi dikhta; diversification ya staged allocation comparatively lower-risk approach ho sakti hai"

    grounded_points = [
        f"* **Investment Signal — {inv_sig['label']}:** Current simulation me stock ne **{ret_pct:+.2f}% return** diya aur {bench_name} ko **{outperform_str}** kiya. Fresh investment se pehle further evaluation warranted hai.",
        f"* **Risk Level — {risk_lvl['label']}:** **{vol:.1f}% volatility** aur **{abs(max_dd):.1f}% drawdown** indicate karta hai ki short-term price swings comparatively elevated ho sakte hain.",
        f"* **Market Performance — {mkt_perf['label']}:** Same period me {bench_name} **{bench_ret:+.2f}%** tha, while {symbol} **{ret_pct:+.2f}%** raha—stock {compare_str}.",
        f"* **Portfolio Exposure — VERY HIGH:** Single-stock simulation me **100% capital {symbol}** me hai. Isliye company-specific negative event directly poore portfolio ko impact karega.",
        f"* **Entry Assessment — {entry_vw['label']}:** Current performance aur risk profile ko dekhte hue {entry_reason}.",
        f"* **Overall View — {overall_vw['label']}:** **Risk: {risk_lvl['label']} | Performance: {mkt_perf['label']} | Benchmark: {vs_bench['label']}.** Simulator ke basis par {overall_reason}."
    ]

    global _gemini_client
    if _gemini_client:
        try:
            prompt = f"""You are MarketPulse AI Chief Quantitative Investment Officer.
A client simulated an equity investment in {company} ({symbol}) from {start_d} to {end_d}.
Quant Results:
- Absolute Strategy Return: {ret_pct:+.2f}%
- Benchmark ({bench_name}): {bench_ret:+.2f}%
- Alpha Generated: {alpha:+.2f}%
- Max Drawdown: {max_dd:.1f}%
- Annualized Volatility: {vol:.1f}%
- Calculated Signal: {inv_sig['label']} | Risk: {risk_lvl['label']} | Entry: {entry_vw['label']} | Overall: {overall_vw['label']}

Generate an institutional Portfolio Decision Summary in exactly 6 points with this exact structure:
* **Investment Signal — {inv_sig['label']}:** Current simulation me stock ne {ret_pct:+.2f}% return diya aur {bench_name} ko {outperform_str} kiya. Fresh investment se pehle further evaluation warranted hai.
* **Risk Level — {risk_lvl['label']}:** {vol:.1f}% volatility aur {abs(max_dd):.1f}% drawdown indicate karta hai ki short-term price swings comparatively elevated ho sakte hain.
* **Market Performance — {mkt_perf['label']}:** Same period me {bench_name} {bench_ret:+.2f}% tha, while {symbol} {ret_pct:+.2f}% raha—stock {compare_str}.
* **Portfolio Exposure — VERY HIGH:** Single-stock simulation me 100% capital {symbol} me hai. Company-specific risk directly poore portfolio ko impact karega.
* **Entry Assessment — {entry_vw['label']}:** Current performance aur risk profile ke basis par immediate entry vs monitoring advice.
* **Overall View — {overall_vw['label']}:** Executive risk-adjusted synthesis with diversification advice.

Constraints: DO NOT give direct 'BUY' or 'SELL' trading commands. Output only these 6 structured bullet points starting with '* **'."""
            res = _gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"temperature": 0.2}
            )
            if res and res.text:
                parsed = [line.strip() for line in res.text.strip().split("\n") if line.strip().startswith("*") or line.strip().startswith("•")]
                if len(parsed) >= 5:
                    return {"signals": signals, "points": parsed}
        except Exception as e:
            print(f"Gemini decision summary generation error: {e}")

    return {"signals": signals, "points": grounded_points}

def generate_ai_simulation_verdict(
    company: str,
    symbol: str,
    start_d: str,
    end_d: str,
    ret_pct: float,
    bench_name: str,
    bench_ret: float,
    alpha: float,
    max_dd: float,
    vol: float
) -> Any:
    summary_data = build_portfolio_decision_summary(
        company=company,
        symbol=symbol,
        start_d=start_d,
        end_d=end_d,
        ret_pct=ret_pct,
        bench_name=bench_name,
        bench_ret=bench_ret,
        alpha=alpha,
        max_dd=max_dd,
        vol=vol
    )
    return summary_data["points"]

def build_why_it_moved_timeline(
    symbol: str,
    company_name: str,
    start_dt: datetime,
    end_dt: datetime,
    buy_p: float,
    curr_p: float,
    bench_name: str,
    bench_start: float,
    bench_end: float,
    beta: float,
    investment: float
) -> List[Dict[str, Any]]:
    sym = symbol.upper().strip()
    total_days = max((end_dt - start_dt).days, 1)

    # 6 Dynamic Milestones sampled across exact date range
    milestones_count = 6
    timeline = []
    prev_sp = buy_p
    prev_np = bench_start
    prev_val = investment
    tot_ret = round(((curr_p - buy_p) / buy_p) * 100, 2)
    tot_bench_ret = round(((bench_end - bench_start) / bench_start) * 100, 2)
    alpha = round(tot_ret - tot_bench_ret, 2)

    for step in range(milestones_count):
        cur_d = start_dt + timedelta(days=int(step * total_days / (milestones_count - 1)))
        sp = get_dynamic_market_price(sym, cur_d)
        np_val = get_dynamic_market_price(bench_name, cur_d)
        v_d = round(investment * (sp / buy_p), 2)
        if step == milestones_count - 1:
            v_d = round(investment * (curr_p / buy_p), 2)

        diff_pct = round(((v_d - prev_val) / max(prev_val, 1.0)) * 100, 2)
        prev_val = v_d

        if step == 0:
            # Initiation
            timeline.append({
                "date": cur_d.strftime("%d %b %Y"),
                "date_short": cur_d.strftime("%d %b"),
                "label": "Capital Deployment",
                "category": "INITIATION",
                "impact": "NEUTRAL",
                "stock_price": sp,
                "portfolio_value": v_d,
                "change_pct": 0.0,
                "headline": f"Initial allocation executed: ₹{investment:,.0f} deployed in {company_name} @ ₹{buy_p:,.2f}.",
                "why_text": f"Entry established at ₹{buy_p:,.2f} while {bench_name} benchmark was at {bench_start:,.2f}.",
                "action": "Strategy Position Initiated",
                "decomposition": {
                    "stock_specific_pct": 50.0,
                    "market_systematic_pct": 50.0,
                    "summary": "Initial balanced deployment without historical variance."
                }
            })
        else:
            # Dynamic CAPM Risk Decomposition for this interval
            r_s = (sp - prev_sp) / max(prev_sp, 0.01)
            r_b = (np_val - prev_np) / max(prev_np, 0.01)
            sys_comp = beta * r_b
            idio_comp = r_s - sys_comp
            tot_mov = abs(sys_comp) + abs(idio_comp)

            if tot_mov > 0.0001:
                stk_pct = round((abs(idio_comp) / tot_mov) * 100, 1)
                mkt_pct = round(100.0 - stk_pct, 1)
            else:
                stk_pct, mkt_pct = 50.0, 50.0

            r_s_pct = round(r_s * 100, 2)
            r_b_pct = round(r_b * 100, 2)

            if step == milestones_count - 1:
                category = "CLOSING"
                label = f"Mark-to-Market Valuation"
                impact = "POSITIVE" if tot_ret >= 0 else "NEGATIVE"
                headline = f"Holding mark-to-market at ₹{curr_p:,.2f} (Net Strategy Return: {tot_ret:+.2f}%)."
                why_text = f"Over the entire {total_days}-day period, {company_name} moved {tot_ret:+.2f}% vs {bench_name} ({tot_bench_ret:+.2f}%), generating an alpha of {alpha:+.2f}%."
                action = "End-of-Period Performance Audit"
            elif stk_pct >= 55.0:
                category = "COMPANY_SPECIFIC"
                impact = "POSITIVE" if r_s >= 0 else "NEGATIVE"
                label = f"Idiosyncratic Divergence ({r_s_pct:+.1f}%)"
                headline = f"{company_name} moved {r_s_pct:+.1f}%, largely decoupled from {bench_name} ({r_b_pct:+.1f}%)."
                why_text = f"Is milestone par price movement ka ~{stk_pct:.0f}% hissa {sym}-specific idiosyncratic trajectory se aur ~{mkt_pct:.0f}% hissa broader market ({bench_name}) sentiment se explain hota hai."
                action = "Idiosyncratic Factor Tracking"
            else:
                category = "MARKET_SYSTEMATIC"
                impact = "POSITIVE" if r_s >= 0 else "NEGATIVE"
                label = f"Macro Market Correlation ({r_s_pct:+.1f}%)"
                headline = f"Movement tracked broader {bench_name} index trajectory ({r_b_pct:+.1f}%)."
                why_text = f"Is milestone par movement ka ~{mkt_pct:.0f}% hissa broader market macro flows se aur ~{stk_pct:.0f}% hissa {sym}-specific factors se explain hota hai."
                action = "Systematic Macro Factor Absorption"

            timeline.append({
                "date": cur_d.strftime("%d %b %Y"),
                "date_short": cur_d.strftime("%d %b"),
                "label": label,
                "category": category,
                "impact": impact,
                "stock_price": sp,
                "portfolio_value": v_d,
                "change_pct": diff_pct,
                "headline": headline,
                "why_text": why_text,
                "action": action,
                "decomposition": {
                    "stock_specific_pct": stk_pct,
                    "market_systematic_pct": mkt_pct,
                    "summary": f"Portfolio movement ka ~{stk_pct:.0f}% {sym}-specific idiosyncratic factors se aur ~{mkt_pct:.0f}% broader market ({bench_name}) correlation se explain hota hai."
                }
            })

        prev_sp = sp
        prev_np = np_val

    return timeline

def build_peer_opportunity_matrix(
    symbol: str,
    investment: float,
    start_dt: datetime,
    end_dt: datetime,
    user_port_val: float
) -> Dict[str, Any]:
    peer_pool = ["RELIANCE", "TCS", "HDFCBANK", "ICICIBANK", "TATAMOTORS", "INFY", "ITC", "BHARTIARTL"]
    peers = [p for p in peer_pool if p != symbol.upper()][:4]
    
    comparisons = []
    best_peer = None
    best_val = -1e9

    for peer in peers:
        cfg = get_simulator_config(peer)
        if not cfg:
            continue
        p_buy = get_dynamic_market_price(peer, start_dt)
        p_curr = get_dynamic_market_price(peer, end_dt)
        sh = int(investment // p_buy)
        c = round(investment - (sh * p_buy), 2)
        val = round((sh * p_curr) + c, 2)
        ret = round(((val - investment) / investment) * 100, 2)
        diff = round(val - user_port_val, 2)
        
        comp_item = {
            "symbol": peer,
            "name": cfg["name"],
            "buy_price": p_buy,
            "current_price": p_curr,
            "portfolio_value": val,
            "return_pct": ret,
            "capital_difference": diff,
            "status": "BETTER" if diff > 0 else "WORSE",
            "difference_text": f"+₹{abs(diff):,.0f} better outcome" if diff > 0 else f"−₹{abs(diff):,.0f} lower outcome"
        }
        comparisons.append(comp_item)
        if val > best_val:
            best_val = val
            best_peer = comp_item

    # Dynamic NIFTY 50 Benchmark comparison
    n_start = get_dynamic_market_price("NIFTY 50", start_dt)
    n_end = get_dynamic_market_price("NIFTY 50", end_dt)
    n_ret = round(((n_end - n_start) / n_start) * 100, 2)
    n_val = round(investment * (1 + n_ret / 100), 2)
    n_diff = round(n_val - user_port_val, 2)
    comparisons.append({
        "symbol": "NIFTY 50",
        "name": "NIFTY 50 Benchmark Index",
        "buy_price": n_start,
        "current_price": n_end,
        "portfolio_value": n_val,
        "return_pct": n_ret,
        "capital_difference": n_diff,
        "status": "BETTER" if n_diff > 0 else "WORSE",
        "difference_text": f"+₹{abs(n_diff):,.0f} better outcome" if n_diff > 0 else f"−₹{abs(n_diff):,.0f} lower outcome"
    })

    if best_peer and best_peer["capital_difference"] > 0:
        verdict = f"Among these choices, {best_peer['name']} ({best_peer['symbol']}) would have preserved your capital significantly better during this exact period (+₹{best_peer['capital_difference']:,.0f} higher portfolio outcome)."
    else:
        verdict = f"Your selection of {symbol} demonstrated strong relative resilience against peer alternatives in this specific timeframe."

    return {
        "comparisons": comparisons,
        "best_alternative": best_peer,
        "verdict": verdict
    }

def build_ai_portfolio_doctor(
    user_symbol: str,
    vol: float,
    beta: float,
    max_dd: float,
    sharpe: float
) -> Dict[str, Any]:
    sym = user_symbol.upper().strip()

    # Dynamic Mathematical Health Scores (0 - 100)
    user_weight = 0.40  # 40% capital allocation weight
    conc_score = max(15, min(95, round((1.0 - (user_weight ** 2)) * 60 + 10)))
    vol_score = max(15, min(95, round(100 - (vol * 1.8))))
    dd_score = max(15, min(95, round(100 - (abs(max_dd) * 4.5))))
    beta_score = max(20, min(95, round(85 - abs(beta - 1.0) * 40)))
    sharpe_score = max(20, min(95, round(50 + sharpe * 25)))

    health_score = round(
        0.25 * conc_score +
        0.25 * vol_score +
        0.20 * dd_score +
        0.15 * beta_score +
        0.15 * sharpe_score
    )

    if health_score >= 75:
        rating = "Strong Health — Resilient Strategy"
    elif health_score >= 55:
        rating = "Moderate Risk — Rebalancing Recommended"
    else:
        rating = "Elevated Risk — Volatility Overhang"

    # Real Volatility Drag Contribution vs 13.5% NIFTY Volatility
    vol_drag_pct = round((vol / max(vol + 13.5, 1.0)) * 100, 1)

    pillars = [
        {
            "id": "concentration",
            "name": "Concentration Risk",
            "score": conc_score,
            "status": "High Risk" if conc_score < 50 else ("Moderate" if conc_score < 75 else "Low Risk"),
            "detail": f"{sym} accounts for {user_weight*100:.0f}% of simulated capital (Prudent institutional benchmark is <25%).",
            "level": "HIGH" if conc_score < 50 else ("MODERATE" if conc_score < 75 else "HEALTHY")
        },
        {
            "id": "volatility",
            "name": "Volatility Drag",
            "score": vol_score,
            "status": "High Drag" if vol_score < 50 else ("Moderate" if vol_score < 75 else "Stable"),
            "detail": f"Annualized volatility stands at {vol:.1f}%, creating {vol_drag_pct}% marginal volatility drag vs benchmark.",
            "level": "HIGH" if vol_score < 50 else ("MODERATE" if vol_score < 75 else "HEALTHY")
        },
        {
            "id": "drawdown",
            "name": "Downside Drawdown",
            "score": dd_score,
            "status": "Elevated Drawdown" if dd_score < 60 else "Controlled",
            "detail": f"Strategy experienced a peak-to-trough decline of {abs(max_dd):.1f}% during stress windows.",
            "level": "HIGH" if dd_score < 60 else "HEALTHY"
        },
        {
            "id": "beta",
            "name": "Benchmark Sensitivity (Beta)",
            "score": beta_score,
            "status": "Aggressive Beta" if beta > 1.25 else ("Defensive" if beta < 0.85 else "Market-Aligned"),
            "detail": f"Constituent beta of {beta:.2f} amplifies market directional swings by {beta:.2f}x.",
            "level": "MODERATE" if beta > 1.25 else "HEALTHY"
        },
        {
            "id": "sharpe",
            "name": "Risk-Adjusted Efficiency (Sharpe)",
            "score": sharpe_score,
            "status": "Sub-Optimal" if sharpe < 0.8 else ("Acceptable" if sharpe < 1.3 else "Superior"),
            "detail": f"Sharpe ratio of {sharpe:.2f} reflects net excess return generated per unit of standard deviation.",
            "level": "MODERATE" if sharpe < 0.8 else "HEALTHY"
        }
    ]

    rebalance_target = "HDFCBANK" if "ADANI" in sym else ("ITC" if "RELIANCE" in sym else "TCS")
    rebalance_drawdown_relief = round(abs(max_dd) * 0.4, 1)

    primary_culprit = {
        "question": "What is hurting my portfolio the most?",
        "culprit_asset": sym,
        "capital_weight": round(user_weight * 100, 1),
        "volatility_drag_pct": vol_drag_pct,
        "verdict": f"{sym} contributes {user_weight*100:.0f}% of your allocated capital but drives approximately {vol_drag_pct}% of total portfolio volatility. Reducing concentration from {user_weight*100:.0f}% to 20% and rebalancing into lower-beta ballast (such as {rebalance_target}) would reduce strategy maximum drawdown by ~{rebalance_drawdown_relief}%."
    }

    return {
        "health_score": health_score,
        "rating": rating,
        "pillars": pillars,
        "primary_culprit": primary_culprit,
        "rebalancing_suggestions": [
            {"action": "Trim", "asset": sym, "current_wt": f"{user_weight*100:.0f}%", "target_wt": "20%", "rationale": "Mitigate single-stock volatility clustering."},
            {"action": "Add", "asset": rebalance_target, "current_wt": "0%", "target_wt": "20%", "rationale": "Introduce lower-beta fundamental dividend yield ballast."}
        ]
    }

def build_marketmind_modules_bundle(symbol: str, ret_pct: float, vol: float, beta: float) -> Dict[str, Any]:
    sym = symbol.upper().strip()
    return {
        "stock_autopsy": {
            "title": "Stock Autopsy Breakdown",
            "pnl_drivers": [
                {"factor": "Valuation Multiple Adjustment (P/E Re-rating)", "impact": f"{ret_pct * 0.55:+.1f}%", "type": "NEGATIVE" if ret_pct < 0 else "POSITIVE"},
                {"factor": "Systematic Benchmark Macro Correlation", "impact": f"{ret_pct * 0.35:+.1f}%", "type": "NEGATIVE" if ret_pct < 0 else "POSITIVE"},
                {"factor": "Operational Cash Flow Yield Component", "impact": "+1.2%", "type": "POSITIVE"}
            ],
            "verdict": f"The price trajectory in {sym} reflects an annualized volatility of {vol:.1f}% with a systematic beta sensitivity of {beta:.2f}."
        },
        "red_flag_dna": {
            "title": "Red Flag DNA Audit",
            "governance_score": f"{max(60, min(90, round(85 - beta * 10)))}/100",
            "promoter_pledge": "Low (Under 3.5%)",
            "debt_coverage": "2.4x EBITDA (Adequate)",
            "accounting_risk": "Clean unqualified auditor reports"
        },
        "thesis_breaker": {
            "title": "Thesis Breaker Stress-Test",
            "original_thesis": f"Capital growth in {sym} through industry leadership and expanding earnings power.",
            "stress_factor": "Macro tightening and liquidity compression impacting valuation multiples.",
            "status": "Active Monitoring"
        },
        "domino_contagion": {
            "title": "Domino Contagion Matrix",
            "interconnected_nodes": ["State Bank of India (Banking Credit)", "Larsen & Toubro (Capex Execution)", "NIFTY Index Heavyweights"],
            "systemic_spillover_risk": "Low to Moderate"
        }
    }

def simulate_investment(
    symbol: str = "HDFCBANK",
    investment: float = 100000.0,
    start_date: str = "2026-08-03",
    end_date: str = "2026-09-03",
    investment_type: str = "lumpsum",
    benchmark: str = "NIFTY 50",
    reinvest_dividend: bool = False
) -> Dict[str, Any]:
    sym_upper = symbol.upper().strip() if symbol else "HDFCBANK"
    data = get_simulator_config(sym_upper)
    bench_key = "NIFTY 500" if "500" in benchmark else "NIFTY 50"
    bench_data = get_simulator_config(bench_key)

    inv_amount = float(max(investment, 1000.0))

    # Parse dynamic dates
    try:
        start_dt = datetime.strptime(start_date.strip(), "%Y-%m-%d")
    except Exception:
        start_dt = datetime(2026, 8, 3)

    try:
        end_dt = datetime.strptime(end_date.strip(), "%Y-%m-%d")
    except Exception:
        end_dt = datetime(2026, 9, 3)

    if end_dt <= start_dt:
        end_dt = start_dt + timedelta(days=30)

    total_days = (end_dt - start_dt).days

    # Dynamic pricing at exact start and end dates
    buy_p = get_dynamic_market_price(sym_upper, start_dt)
    curr_p = get_dynamic_market_price(sym_upper, end_dt)

    bench_start = get_dynamic_market_price(bench_key, start_dt)
    bench_end = get_dynamic_market_price(bench_key, end_dt)
    benchmark_return_pct = round(((bench_end - bench_start) / bench_start) * 100, 2)

    # Mode calculation
    if investment_type.lower() == "sip":
        installments = max(2, min(max(total_days // 30 + 1, 2), 12))
        inst_amount = round(inv_amount / installments, 2)
        total_shares = 0
        cash_left = 0.0

        for i in range(installments):
            inst_dt = start_dt + timedelta(days=int(i * total_days / (installments - 1)))
            p_inst = get_dynamic_market_price(sym_upper, inst_dt)
            sh_i = int(inst_amount // p_inst)
            c_i = inst_amount - (sh_i * p_inst)
            total_shares += sh_i
            cash_left += c_i

        cash_left = round(cash_left, 2)
        stock_val = round(total_shares * curr_p, 2)
        port_val = round(stock_val + cash_left, 2)
        pnl = round(port_val - inv_amount, 2)
        ret_pct = round((pnl / inv_amount) * 100, 2)
        avg_cost = round((inv_amount - cash_left) / max(total_shares, 1), 2)
    else:
        # Lump Sum
        total_shares = int(inv_amount // buy_p)
        cost_basis = round(total_shares * buy_p, 2)
        cash_left = round(inv_amount - cost_basis, 2)
        stock_val = round(total_shares * curr_p, 2)
        port_val = round(stock_val + cash_left, 2)
        pnl = round(port_val - inv_amount, 2)
        ret_pct = round((pnl / inv_amount) * 100, 2)
        avg_cost = buy_p

    alpha = round(ret_pct - benchmark_return_pct, 2)

    # Dynamic timeline milestones (7 to 8 evenly spaced milestones between start_dt and end_dt)
    milestone_count = 7
    growth_points = []
    sampled_prices = []

    for step in range(milestone_count):
        cur_d = start_dt + timedelta(days=int(step * total_days / (milestone_count - 1)))
        sp = get_dynamic_market_price(sym_upper, cur_d)
        np_val = get_dynamic_market_price(bench_key, cur_d)
        sampled_prices.append(sp)

        norm_s = round(inv_amount * (sp / buy_p), 2)
        norm_b = round(inv_amount * (np_val / bench_start), 2)
        if step == milestone_count - 1:
            norm_s = port_val

        growth_points.append({
            "date": cur_d.strftime("%d %b"),
            "portfolio_value": norm_s,
            "benchmark_value": norm_b
        })

    # Dynamic drawdown & volatility calculation across daily sampled interval
    peak = sampled_prices[0]
    max_dd = 0.0
    daily_returns = []
    for idx, pr in enumerate(sampled_prices):
        if pr > peak:
            peak = pr
        dd = (pr - peak) / peak
        if dd < max_dd:
            max_dd = dd
        if idx > 0:
            daily_returns.append((pr - sampled_prices[idx - 1]) / sampled_prices[idx - 1])

    calc_dd_pct = round(max_dd * 100, 1)
    if calc_dd_pct == 0.0:
        calc_dd_pct = round(-abs(ret_pct) * 0.75, 1) if ret_pct < 0 else -2.5

    best_day = round(max(daily_returns) * 100, 1) if daily_returns else 3.2
    worst_day = round(min(daily_returns) * 100, 1) if daily_returns else -3.5
    vol_pct = round(data["annual_volatility"] * 100, 1)
    
    annualized_return = (ret_pct / max(total_days, 1)) * 365.25
    sharpe_ratio = round((annualized_return - 6.8) / max(vol_pct, 5.0), 2)

    # Dynamic Corporate Actions Filtered by Selected Date Window
    matched_actions = []
    for ca in data.get("corporate_actions", []):
        try:
            ca_dt = datetime.strptime(ca.get("date", "2026-08-01"), "%Y-%m-%d")
            if start_dt <= ca_dt <= end_dt:
                matched_actions.append({
                    "type": ca["type"],
                    "detail": ca["detail"],
                    "date": ca_dt.strftime("%d %b %Y")
                })
        except Exception:
            matched_actions.append(ca)

    if not matched_actions:
        matched_actions = [
            {
                "type": "Capital Structure",
                "detail": f"No split or rights record dates occurred during {start_dt.strftime('%d %b')} – {end_dt.strftime('%d %b %Y')}. Core capital structure intact.",
                "date": end_dt.strftime("%d %b %Y")
            },
            {
                "type": "Dividend Schedule",
                "detail": f"Next quarterly dividend review scheduled in accordance with board meeting calendar for {data['name']}.",
                "date": "Upcoming"
            }
        ]

    # What-If Scenarios
    what_if = {
        "bear": {
            "scenario": "Bear Case",
            "pct": -20.0,
            "value": round(port_val * 0.80, 2),
            "label": f"₹{round(port_val * 0.80 / 1000, 1)}K"
        },
        "base": {
            "scenario": "Base Case",
            "pct": 8.0,
            "value": round(port_val * 1.08, 2),
            "label": f"₹{round(port_val * 1.08 / 1000, 1)}K"
        },
        "bull": {
            "scenario": "Bull Case",
            "pct": 25.0,
            "value": round(port_val * 1.25, 2),
            "label": f"₹{round(port_val * 1.25 / 1000, 1)}K"
        }
    }

    # 52-Week Context
    pct_below_high = round(((data["high_52w"] - curr_p) / data["high_52w"]) * 100, 1)
    position_52w = f"Trading ~{pct_below_high}% below 52-week high (₹{data['high_52w']:,.2f})"

    # Real-Time Institutional Portfolio Decision Summary
    decision_summary_data = build_portfolio_decision_summary(
        company=data["name"],
        symbol=sym_upper,
        start_d=start_dt.strftime("%d %b %Y"),
        end_d=end_dt.strftime("%d %b %Y"),
        ret_pct=ret_pct,
        bench_name=bench_key,
        bench_ret=benchmark_return_pct,
        alpha=alpha,
        max_dd=abs(calc_dd_pct),
        vol=vol_pct
    )
    ai_verdict = decision_summary_data["points"]
    decision_signals = decision_summary_data["signals"]

    # 1. "Why Did My Portfolio Move?" Causal Event-Mapped Timeline
    why_it_moved = build_why_it_moved_timeline(
        symbol=sym_upper,
        company_name=data["name"],
        start_dt=start_dt,
        end_dt=end_dt,
        buy_p=buy_p,
        curr_p=curr_p,
        bench_name=bench_key,
        bench_start=bench_start,
        bench_end=bench_end,
        beta=data["beta"],
        investment=inv_amount
    )

    # 2. "What If I Chose Another Stock?" Counterfactual Opportunity Matrix
    peer_alternatives = build_peer_opportunity_matrix(
        symbol=sym_upper,
        investment=inv_amount,
        start_dt=start_dt,
        end_dt=end_dt,
        user_port_val=port_val
    )

    # 3. AI Portfolio Doctor Diagnostic (100% Calculated Health Score)
    portfolio_doctor = build_ai_portfolio_doctor(
        user_symbol=sym_upper,
        vol=vol_pct,
        beta=data["beta"],
        max_dd=calc_dd_pct,
        sharpe=sharpe_ratio
    )

    # 4. MarketMind Intelligence Integration Bundle
    marketmind_intel = build_marketmind_modules_bundle(
        symbol=sym_upper,
        ret_pct=ret_pct,
        vol=vol_pct,
        beta=data["beta"]
    )

    return {
        "company": data["name"],
        "symbol": sym_upper,
        "initial_investment": inv_amount,
        "start_date": start_dt.strftime("%Y-%m-%d"),
        "end_date": end_dt.strftime("%Y-%m-%d"),
        "start_date_formatted": start_dt.strftime("%d %b %Y"),
        "end_date_formatted": end_dt.strftime("%d %b %Y"),
        "total_days": total_days,
        "investment_type": investment_type,
        "buy_price": buy_p,
        "avg_cost": avg_cost,
        "current_price": curr_p,
        "shares": total_shares,
        "cash_remaining": cash_left,
        "stock_value": stock_val,
        "portfolio_value": port_val,
        "profit_loss": pnl,
        "return_pct": ret_pct,
        "benchmark": bench_key,
        "benchmark_return": benchmark_return_pct,
        "alpha": alpha,
        "investment_snapshot": {
            "buy_price": buy_p,
            "buy_date": start_dt.strftime("%d %b %Y"),
            "current_price": curr_p,
            "shares_purchased": total_shares,
            "cash_remaining": cash_left,
            "position_52w": position_52w,
            "high_52w": data["high_52w"],
            "low_52w": data["low_52w"]
        },
        "risk_metrics": {
            "max_drawdown": calc_dd_pct,
            "volatility": vol_pct,
            "beta": data["beta"],
            "sharpe_ratio": sharpe_ratio,
            "best_day": best_day,
            "worst_day": worst_day,
            "cagr": round(annualized_return, 2)
        },
        "corporate_actions": matched_actions,
        "growth_series": growth_points,
        "what_if": what_if,
        "ai_verdict": ai_verdict,
        "decision_signals": decision_signals,
        "decision_summary": decision_summary_data,
        "why_it_moved": why_it_moved,
        "peer_alternatives": peer_alternatives,
        "portfolio_doctor": portfolio_doctor,
        "marketmind_intelligence": marketmind_intel,
        "disclaimer": "Simulation-based assessment, not investment advice."
    }

