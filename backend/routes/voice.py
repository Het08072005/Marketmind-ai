import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from config import settings
from services.voice_service import transcribe_audio_bytes, generate_autonomous_agent_response, synthesize_speech_audio

router = APIRouter(prefix="/api/voice", tags=["Voice Agent"])

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "english"
    voice_gender: Optional[str] = "male"
    ticker: Optional[str] = None
    history: Optional[list] = None

class ChatResponse(BaseModel):
    query: str
    reply: str
    language: str
    voice_gender: str
    audio_base64: Optional[str] = None
    action: Optional[Dict[str, Any]] = None

class SynthesizeRequest(BaseModel):
    text: str
    voice_gender: Optional[str] = "male"
    language: Optional[str] = "english"

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form("en")
):
    try:
        if not settings.DEEPGRAM_API_KEY:
            raise HTTPException(status_code=503, detail="Deepgram STT is not configured on this backend")
        audio_bytes = await file.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="No audio was received")
        content_type = file.content_type or "audio/webm"
        transcript = await transcribe_audio_bytes(audio_bytes, content_type=content_type, language=language)
        return {"transcript": transcript, "status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
async def voice_chat(request: ChatRequest):
    try:
        gender = (request.voice_gender or "male").lower()
        lang = (request.language or "english").lower()

        agent_result = await generate_autonomous_agent_response(
            user_query=request.message,
            language=lang,
            context_ticker=request.ticker,
            history=request.history
        )
        
        reply_text = agent_result["reply"]
        action_payload = agent_result.get("action")

        # Synthesize Deepgram studio-grade audio for natural human speech if available
        # with a 2.0s fast timeout so chat response is returned immediately without waiting
        audio_b64 = None
        if lang not in ["hindi", "hi"]:
            try:
                import asyncio
                audio_bytes = await asyncio.wait_for(
                    synthesize_speech_audio(reply_text, voice_gender=gender, language=lang),
                    timeout=2.0
                )
                if audio_bytes:
                    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            except Exception as e:
                print(f"Direct voice chat audio synthesis notice: {e}")

        return ChatResponse(
            query=request.message,
            reply=reply_text,
            language=lang,
            voice_gender=gender,
            audio_base64=audio_b64,
            action=action_payload
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice agent chat failed: {str(e)}")

@router.post("/synthesize")
async def synthesize_voice(request: SynthesizeRequest):
    try:
        gender = (request.voice_gender or "male").lower()
        lang = (request.language or "english").lower()

        audio_bytes = await synthesize_speech_audio(
            request.text,
            voice_gender=gender,
            language=lang
        )
        if audio_bytes:
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            return {"audio_base64": audio_b64, "status": "success"}
        return {"audio_base64": None, "status": "fallback"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")

class AutonomousCopilotRequest(BaseModel):
    query: str
    language: Optional[str] = "english"
    context_ticker: Optional[str] = "INDIGO"
    history: Optional[list] = None

@router.post("/autonomous-copilot")
async def autonomous_copilot_endpoint(req: AutonomousCopilotRequest):
    try:
        from services.domino_service import process_domino_agent_query
        return await process_domino_agent_query(
            user_query=req.query,
            context_ticker=req.context_ticker,
            history=req.history
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Autonomous copilot error: {str(e)}")
