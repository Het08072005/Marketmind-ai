from fastapi import APIRouter, Query
from services.news_service import get_all_scored_news, fetch_live_rss_news

router = APIRouter(prefix="/api/news", tags=["News & Impact Predictions"])

@router.get("")
async def get_news(filter: str = Query("All")):
    return get_all_scored_news(filter_tag=filter)

@router.get("/live")
async def get_live_news(query: str = Query("Indian stock market NSE")):
    return fetch_live_rss_news(query=query)
