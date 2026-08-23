import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from pydantic import BaseModel
from typing import Optional
from services.voice_service import transcribe_audio_bytes, generate_agent_response, synthesize_speech_audio

router = APIRouter(prefix="/api/voice", tags=["Voice Agent"])

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "hinglish" # "hinglish", "hindi", "english"
    voice_gender: Optional[str] = "female" # "female", "male"
    ticker: Optional[str] = None

class ChatResponse(BaseModel):
    query: str
    reply: str
    language: str
    voice_gender: str
    audio_base64: Optional[str] = None

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
        reply_text = await generate_agent_response(
            user_query=request.message,
            language=request.language or "hinglish",
            context_ticker=request.ticker
        )
        
        audio_b64 = None
        audio_bytes = await synthesize_speech_audio(
            reply_text,
            voice_gender=request.voice_gender or "female",
            language=request.language or "hinglish"
        )
        if audio_bytes:
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            
        return ChatResponse(
            query=request.message,
            reply=reply_text,
            language=request.language or "hinglish",
            voice_gender=request.voice_gender or "female",
            audio_base64=audio_b64
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice agent chat failed: {str(e)}")
