import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
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
        audio_bytes = await file.read()
        content_type = file.content_type or "audio/webm"
        transcript = await transcribe_audio_bytes(audio_bytes, content_type=content_type, language=language)
        return {"transcript": transcript, "status": "success"}
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

        audio_b64 = None
        audio_bytes = await synthesize_speech_audio(
            reply_text,
            voice_gender=gender,
            language=lang
        )
        if audio_bytes:
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            
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
