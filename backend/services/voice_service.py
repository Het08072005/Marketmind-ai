import os
import httpx
from typing import Dict, Optional
from google import genai
from config import settings
from services.stock_service import get_all_companies, get_company_by_symbol
from services.news_service import get_all_scored_news
from services.domino_service import get_domino_events

gemini_client = None
if settings.GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Error initializing Gemini client in voice_service: {e}")

SYSTEM_FINANCIAL_INSTRUCTION = """
You are MarketPulse AI, an elite real-time Indian financial intelligence terminal voice assistant.
Rules:
1. When language is English (Default):
   - Reply in crisp, professional, modern Indian market English.
   - Use direct numbers, % moves, and clear market terminology (e.g. 'Reliance is trading up 1.8% at ₹2,946 with strong RSI momentum at 68.').
2. When language is Hindi:
   - Reply 100% in natural, fluent Hindi (Devanagari script).
   - Write all company names in Hindi script (e.g., 'रिलायंस', 'टाटा मोटर्स', 'एचडीएफसी बैंक', 'अडानी एंटरप्राइजेज', 'भारती एयरटेल').
   - NEVER use English uppercase ticker codes like 'ADANIENT', 'HDFCBANK', 'RELIANCE'.
3. Keep your response CONCISE (25 to 35 words maximum) so spoken speech is fast, crisp, and direct.
"""

HINDI_ALIAS_MAP = {
    "रिलायंस": "RELIANCE",
    "टाटा मोटर्स": "TATAMOTORS",
    "टाटा": "TATAMOTORS",
    "एचडीएफसी": "HDFCBANK",
    "एचडीएफसी बैंक": "HDFCBANK",
    "अडानी": "ADANIENT",
    "अदानी": "ADANIENT",
    "भारती एयरटेल": "BHARTIARTL",
    "एयरटेल": "BHARTIARTL",
    "बजाज": "BAJFINANCE",
    "बजाज फाइनेंस": "BAJFINANCE",
    "टीसीएस": "TCS",
    "इन्फोसिस": "INFY",
    "इन्फी": "INFY",
    "आईसीआईसीआई": "ICICIBANK",
    "एसबीआई": "SBIN",
    "स्टेट बैंक": "SBIN",
    "ओएनजीसी": "ONGC",
    "एलएंडटी": "LT",
    "लार्सन": "LT",
    "मारुति": "MARUTI",
    "आईटीसी": "ITC",
    "क्रूड": "CRUDE",
    "तेल": "CRUDE",
}

async def transcribe_audio_bytes(audio_bytes: bytes, content_type: str = "audio/webm", language: str = "en") -> str:
    if not settings.DEEPGRAM_API_KEY:
        return ""
    
    url = f"https://api.deepgram.com/v1/listen?model={settings.DEFAULT_STT_MODEL}&smart_format=true&punctuate=true"
    headers = {
        "Authorization": f"Token {settings.DEEPGRAM_API_KEY}",
        "Content-Type": content_type
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, headers=headers, content=audio_bytes)
        if response.status_code == 200:
            data = response.json()
            try:
                transcript = data["results"]["channels"][0]["alternatives"][0]["transcript"]
                return transcript
            except (KeyError, IndexError):
                return ""
        else:
            print(f"Deepgram STT Error: {response.status_code} - {response.text}")
            return ""

async def generate_agent_response(user_query: str, language: str = "english", context_ticker: Optional[str] = None) -> str:
    if not gemini_client:
        return "MarketPulse AI backend is operating in offline mode. Please configure GEMINI_API_KEY."

    all_companies = get_all_companies()
    query_lower = user_query.lower()
    matched_companies = []

    # Check Hindi aliases
    for alias, symbol in HINDI_ALIAS_MAP.items():
        if alias in query_lower:
            comp = get_company_by_symbol(symbol)
            if comp and comp not in matched_companies:
                matched_companies.append(comp)

    # Check English symbols and names
    for c in all_companies:
        sym = c.get("symbol", "").lower()
        name = c.get("name", "").lower()
        short_name = name.replace("limited", "").replace("ltd", "").strip()
        if sym in query_lower or short_name in query_lower or any(word in query_lower for word in short_name.split() if len(word) > 3):
            if c not in matched_companies:
                matched_companies.append(c)

    context_lines = []
    if matched_companies:
        for c in matched_companies[:4]:
            context_lines.append(
                f"{c['name']} ({c['symbol']}): Price ₹{c['price']} ({c['change']}), P/E {c['pe_ratio']}, RSI {c['rsi']}, Trust Score {c.get('trust_meter', {}).get('score', 80)}/100."
            )
    else:
        for c in all_companies[:8]:
            context_lines.append(f"{c['name']} ({c['symbol']}): ₹{c['price']} ({c['change']})")

    extra_context = "\n".join(context_lines)

    lang_rule = ""
    if language.lower() in ["hindi", "hi"]:
        lang_rule = "Reply 100% in natural Hindi (Devanagari script). All company names MUST be written in Hindi (e.g. 'रिलायंस', 'टाटा मोटर्स', 'अडानी एंटरप्राइजेज'). Do NOT use English uppercase ticker codes."
    else:
        lang_rule = "Reply in crisp, professional English."

    prompt = f"""
    Context Data:
    {extra_context}

    Target Tone & Language:
    {lang_rule}

    User Question:
    "{user_query}"

    Spoken Response by MarketPulse AI (25-35 words):
    """

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "system_instruction": SYSTEM_FINANCIAL_INSTRUCTION,
                "temperature": 0.3,
            }
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini generation error: {e}")
        if language.lower() in ["hindi", "hi"]:
            return "आज मार्केट में मिला-जुला रुझान है। रिलायंस और टाटा मोटर्स में अच्छा मोमेंटम दिख रहा है।"
        return "Market is showing mixed momentum today. Reliance is up 1.8% while banking sector remains range-bound."

async def synthesize_speech_audio(text: str, voice_gender: str = "male", language: str = "english") -> Optional[bytes]:
    """
    Convert text response to spoken voice audio via Deepgram Aura TTS (Male Orion voice).
    """
    if language.lower() in ["hindi", "hi"]:
        return None

    if not settings.DEEPGRAM_API_KEY or not text:
        return None
    
    voice_model = "aura-orion-en"
    url = f"https://api.deepgram.com/v1/speak?model={voice_model}"
    headers = {
        "Authorization": f"Token {settings.DEEPGRAM_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"text": text}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                return response.content
            else:
                print(f"Deepgram TTS Error: {response.status_code} - {response.text}")
                return None
    except Exception as e:
        print(f"Deepgram audio synthesis error: {e}")
        return None
