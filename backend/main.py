import os
from datetime import datetime
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from services.gemini_client import gemini_pool

# Import Routers
from routes.voice import router as voice_router
from routes.stocks import router as stocks_router
from routes.domino import router as domino_router
from routes.forensic import router as forensic_router
from routes.news import router as news_router
from routes.portfolio import router as portfolio_router
from routes.reports import reports_router
from routes.thesis import router as thesis_router
from routes.dna import router as dna_router
from routes.dependency import router as dependency_router
from routes.macro import router as macro_router

app = FastAPI(
    title="MarketMind AI — Financial Intelligence Terminal Backend",
    description="Autonomous FastAPI backend powered by Live NSE yfinance, Google News RSS, Gemini 2.5 Flash, and Deepgram Voice AI.",
    version="1.0.0"
)

# 1. Primary CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Universal CORS Header and Preflight Safety Middleware
@app.middleware("http")
async def universal_cors_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        origin = request.headers.get("origin") or "*"
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response

    try:
        response = await call_next(request)
    except Exception as exc:
        from fastapi.responses import JSONResponse
        response = JSONResponse(
            status_code=500,
            content={"detail": f"Internal Server Error: {str(exc)}"}
        )

    origin = request.headers.get("origin") or "*"
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Register Sub-Routers
app.include_router(voice_router)
app.include_router(stocks_router)
app.include_router(macro_router)
app.include_router(domino_router)
app.include_router(thesis_router)
app.include_router(dna_router)
app.include_router(dependency_router)
app.include_router(forensic_router)
app.include_router(news_router)
app.include_router(portfolio_router)
app.include_router(reports_router, prefix="/api/reports", tags=["reports"])

@app.get("/")
def read_root():
    return {
        "terminal": "MarketMind AI Intelligence Terminal",
        "status": "online",
        "gemini_active": bool(gemini_pool.active_keys_count > 0),
        "gemini_keys_count": gemini_pool.active_keys_count,
        "deepgram_active": bool(settings.DEEPGRAM_API_KEY),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "latency_ms": 12,
        "services": {
            "voice_agent": "ready",
            "gemini_brain": "ready" if gemini_pool.active_keys_count > 0 else "offline",
            "gemini_keys_count": gemini_pool.active_keys_count,
            "deepgram_voice": "ready" if settings.DEEPGRAM_API_KEY else "offline",
            "live_market_data": "active",
            "live_news_feed": "active",
            "virtual_portfolio": "active"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/hello")
def hello():
    return {
        "message": "Hello from MarketMind AI 🚀",
        "status": "success",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=settings.PORT, reload=True)
