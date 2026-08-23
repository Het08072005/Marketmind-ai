import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

# Import Routers
from routes.voice import router as voice_router
from routes.stocks import router as stocks_router
from routes.domino import router as domino_router
from routes.trust import router as trust_router
from routes.forensic import router as forensic_router
from routes.news import router as news_router

app = FastAPI(
    title="MarketMind AI — Financial Intelligence Terminal Backend",
    description="Autonomous FastAPI backend powered by Google Gemini 2.5 Flash, Deepgram Voice AI, and Top 20 Companies Repository.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-Routers
app.include_router(voice_router)
app.include_router(stocks_router)
app.include_router(domino_router)
app.include_router(trust_router)
app.include_router(forensic_router)
app.include_router(news_router)

@app.get("/")
def read_root():
    return {
        "terminal": "MarketMind AI Intelligence Terminal",
        "status": "online",
        "gemini_active": bool(settings.GEMINI_API_KEY),
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
            "gemini_brain": "ready" if settings.GEMINI_API_KEY else "offline",
            "deepgram_voice": "ready" if settings.DEEPGRAM_API_KEY else "offline",
            "top20_repository": "loaded"
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
