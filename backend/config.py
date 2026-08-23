import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", 8000))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    DEFAULT_STT_MODEL: str = os.getenv("DEFAULT_STT_MODEL", "nova-2")
    DEFAULT_TTS_VOICE_FEMALE: str = os.getenv("DEFAULT_TTS_VOICE_FEMALE", "aura-asteria-en")
    DEFAULT_TTS_VOICE_MALE: str = os.getenv("DEFAULT_TTS_VOICE_MALE", "aura-orion-en")

settings = Settings()
