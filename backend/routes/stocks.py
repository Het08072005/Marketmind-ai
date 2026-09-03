from fastapi import APIRouter, HTTPException, Query
from services.market_data_service import get_all_live_companies, fetch_live_stock_data, get_stock_historical_candles
from services.stock_service import get_sector_peers

router = APIRouter(prefix="/api/stocks", tags=["Stocks & Intelligence"])

@router.get("/radar/recommendations")
async def get_market_radar_recommendations():
    from services.recommendations_service import get_ai_market_radar_recommendations
    return get_ai_market_radar_recommendations()

@router.get("")
def list_stocks():
    return get_all_live_companies()

@router.get("/{symbol}")
def get_stock(symbol: str):
    comp = fetch_live_stock_data(symbol)
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
    return comp

@router.get("/{symbol}/history")
def get_stock_history(symbol: str, period: str = Query("1mo", description="Historical duration like 1mo, 3mo, 1y")):
    history = get_stock_historical_candles(symbol, period=period)
    if not history:
        raise HTTPException(status_code=404, detail="Historical data not found")
    return history

@router.get("/sector/{sector_name}")
async def get_sector(sector_name: str):
    return get_sector_peers(sector_name)

@router.get("/{symbol}/sector-intelligence")
async def get_sector_intelligence(symbol: str):
    from services.sector_intelligence_service import get_sector_intelligence_data
    data = get_sector_intelligence_data(symbol)
    if not data:
        raise HTTPException(status_code=404, detail="Sector intelligence data not found")
    return data

@router.get("/{symbol}/smart-alert-intelligence")
async def get_smart_alert_intelligence_route(
    symbol: str,
    lookback: str = Query("3M", description="Lookback window: 1M, 3M, 6M, 1Y")
):
    from services.smart_alert_service import get_smart_alert_intelligence
    data = get_smart_alert_intelligence(symbol, lookback=lookback)
    if not data:
        raise HTTPException(status_code=404, detail="Smart alert intelligence not found")
    return data

@router.get("/{symbol}/candlestick-intelligence")
async def get_candlestick_intelligence_route(symbol: str):
    from services.candlestick_intelligence_service import get_candlestick_intelligence
    data = get_candlestick_intelligence(symbol)
    if not data:
        raise HTTPException(status_code=404, detail="Candlestick intelligence not found")
    return data

@router.post("/{symbol}/candlestick-chat")
async def post_candlestick_chat_route(symbol: str, body: dict):
    from services.candlestick_intelligence_service import ask_candlestick_copilot
    question = body.get("question", "")
    history = body.get("history", [])
    ans = ask_candlestick_copilot(symbol, question, history)
    return ans


