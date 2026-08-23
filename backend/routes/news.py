from fastapi import APIRouter, Query
from services.live_news_service import fetch_live_financial_news

router = APIRouter(prefix="/api/news", tags=["Financial News"])

@router.get("")
async def get_news_feed(filter: str = Query("All")):
    return fetch_live_financial_news(filter_category=filter)

@router.get("/live")
async def get_live_news(query: str = Query("")):
    return fetch_live_financial_news(filter_category=query or "All")
