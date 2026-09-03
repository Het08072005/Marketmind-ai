from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from services.portfolio_service import (
    get_portfolio_summary,
    execute_trade,
    reset_portfolio,
    simulate_investment,
    build_ai_portfolio_doctor
)

router = APIRouter(prefix="/api/portfolio", tags=["Virtual Portfolio"])

class TradeRequest(BaseModel):
    symbol: str
    shares: int
    side: Optional[str] = "BUY"

class SimulateRequest(BaseModel):
    symbol: Optional[str] = "ADANIENT"
    investment: Optional[float] = 100000.0
    start_date: Optional[str] = "2026-08-03"
    end_date: Optional[str] = "2026-09-03"
    investment_type: Optional[str] = "lumpsum"
    benchmark: Optional[str] = "NIFTY 50"
    reinvest_dividend: Optional[bool] = False

@router.get("")
async def get_portfolio():
    return get_portfolio_summary()

@router.post("/trade")
async def trade_stock(req: TradeRequest):
    res = execute_trade(symbol=req.symbol, shares=req.shares, side=req.side or "BUY")
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

@router.post("/reset")
async def reset_virtual_portfolio():
    return reset_portfolio()

@router.post("/simulate")
async def post_simulate_investment(req: SimulateRequest):
    return simulate_investment(
        symbol=req.symbol or "ADANIENT",
        investment=req.investment or 100000.0,
        start_date=req.start_date or "2026-08-03",
        end_date=req.end_date or "2026-09-03",
        investment_type=req.investment_type or "lumpsum",
        benchmark=req.benchmark or "NIFTY 50",
        reinvest_dividend=bool(req.reinvest_dividend)
    )

@router.get("/simulate")
async def get_simulate_investment(
    symbol: str = Query("ADANIENT"),
    investment: float = Query(100000.0),
    start_date: str = Query("2026-08-03"),
    end_date: str = Query("2026-09-03"),
    investment_type: str = Query("lumpsum"),
    benchmark: str = Query("NIFTY 50")
):
    return simulate_investment(
        symbol=symbol,
        investment=investment,
        start_date=start_date,
        end_date=end_date,
        investment_type=investment_type,
        benchmark=benchmark
    )

@router.get("/doctor")
async def get_portfolio_doctor(symbol: str = Query("ADANIENT")):
    sim = simulate_investment(symbol=symbol)
    return sim["portfolio_doctor"]


