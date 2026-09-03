from fastapi import APIRouter, Query, Body
from typing import Dict, Any, Optional, List
from services.live_news_service import get_news_intelligence, ask_news_copilot

router = APIRouter(prefix="/api/news", tags=["Financial News"])

@router.get("")
def get_news_feed(filter: str = Query("All")):
    """Returns unified institutional news feed with sentiment sentinel, executive analysis, and outcome."""
    return get_news_intelligence(filter_category=filter)

@router.get("/live")
def get_live_news(query: str = Query("")):
    return get_news_intelligence(filter_category=query or "All")

@router.post("/chat")
async def chat_news_copilot(payload: Dict[str, Any] = Body(...)):
    """In-page News Copilot Q&A endpoint supporting global or card-specific queries."""
    query = payload.get("query", "")
    news_id = payload.get("news_id")
    history = payload.get("history", [])
    answer = ask_news_copilot(query=query, news_id=news_id, history=history)
    return {"answer": answer, "query": query, "news_id": news_id}
