import time
from typing import Dict, List, Any
from services.market_data_service import fetch_live_stock_data, get_stock_historical_candles

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
