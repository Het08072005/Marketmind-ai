import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", 8000))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Primary and Pool Gemini API Keys (Circular Rotation for Zero-Downtime)
    _raw_pool_keys = [k.strip() for k in os.getenv("GEMINI_API_KEYS", "").split(",") if k.strip()]
    _individual_keys = [
        os.getenv(f"GEMINI_API_KEY_{i}", "").strip() for i in range(1, 10)
    ] + [
        os.getenv(f"API{i}", "").strip() for i in range(1, 10)
    ]
    _primary_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    # Deduplicate while preserving order
    GEMINI_API_KEYS: list = list(dict.fromkeys(
        [k for k in ([_primary_key] + _raw_pool_keys + _individual_keys) if k]
    ))
    GEMINI_API_KEY: str = GEMINI_API_KEYS[0] if GEMINI_API_KEYS else _primary_key

    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ] + [origin.strip().rstrip("/") for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
    DEFAULT_STT_MODEL: str = os.getenv("DEFAULT_STT_MODEL", "nova-2")
    DEFAULT_TTS_VOICE_FEMALE: str = os.getenv("DEFAULT_TTS_VOICE_FEMALE", "aura-asteria-en")
    DEFAULT_TTS_VOICE_MALE: str = os.getenv("DEFAULT_TTS_VOICE_MALE", "aura-orion-en")

settings = Settings()
