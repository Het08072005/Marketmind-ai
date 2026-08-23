from fastapi import APIRouter
from pydantic import BaseModel
from services.domino_service import get_domino_events, trace_event_causality

router = APIRouter(prefix="/api/domino", tags=["Market Domino Predictor"])

class TraceRequest(BaseModel):
    event: str

@router.get("/events")
async def list_events():
    return get_domino_events()

@router.post("/trace")
async def trace_event(req: TraceRequest):
    return trace_event_causality(req.event)
