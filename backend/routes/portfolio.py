from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.portfolio_service import get_portfolio_summary, execute_trade, reset_portfolio

router = APIRouter(prefix="/api/portfolio", tags=["Virtual Portfolio"])

class TradeRequest(BaseModel):
    symbol: str
    shares: int
    side: Optional[str] = "BUY"

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
