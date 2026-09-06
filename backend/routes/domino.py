from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from services.domino_service import (
    get_domino_scenarios,
    simulate_domino_event,
    process_domino_agent_query
)
from services.domino_structural_engine import calculate_company_structural_impact
from services.domino_ledger_service import get_prediction_ledger, record_live_prediction
from services.domino_event_study import compute_regime_analogs

router = APIRouter(prefix="/api/domino", tags=["Market Domino Predictor"])

class DominoAgentQueryRequest(BaseModel):
    query: str
    context_ticker: Optional[str] = "INDIGO"
    history: Optional[List[Dict[str, Any]]] = None
    active_scenario_key: Optional[str] = None
    active_magnitude: Optional[float] = None
    active_depth: Optional[int] = None
    active_horizon: Optional[str] = None

class SimulationRequest(BaseModel):
    scenario_key: str = Field(default="brent_crude", description="Key of the scenario from catalog or 'custom'")
    magnitude: float = Field(default=12.0, description="Magnitude of the shock in percentage")
    depth: int = Field(default=4, ge=1, le=4, description="Depth of causal ripple (1st to 4th order)")
    horizon: str = Field(default="1_5_days", description="Horizon window: 0_1_day, 1_5_days, 1_4_weeks, 1_3_months")
    min_confidence: float = Field(default=0.70, ge=0.0, le=1.0, description="Minimum confidence filter (0.0 to 1.0)")
    custom_event_title: Optional[str] = Field(default=None, description="Custom event headline if scenario_key is custom")

class SavePredictionRequest(BaseModel):
    event_title: str
    symbol: str
    predicted_range: List[float]
    probability: float
    confidence_tier: str = "High"

class LegacyTraceRequest(BaseModel):
    event: str

@router.get("/scenarios")
async def list_scenarios():
    """Returns available flagship scenario templates."""
    return get_domino_scenarios()

@router.get("/events")
async def list_events_legacy():
    """Backward compatibility endpoint for older frontend hooks."""
    return get_domino_scenarios()

@router.post("/simulate")
async def run_simulation(req: SimulationRequest):
    """Executes the full quantitative Causal Domino Simulation."""
    return simulate_domino_event(
        scenario_key=req.scenario_key,
        magnitude=req.magnitude,
        depth=req.depth,
        horizon=req.horizon,
        min_confidence=req.min_confidence,
        custom_event_title=req.custom_event_title
    )

@router.post("/trace")
async def trace_event_legacy(req: LegacyTraceRequest):
    """Backward compatibility endpoint."""
    # Attempt to extract magnitude if mentioned in string e.g. "Crude Oil +30%"
    mag = 12.0
    if "+30" in req.event or "30%" in req.event:
        mag = 30.0
    elif "+20" in req.event or "20%" in req.event:
        mag = 20.0
    
    scenario_key = "brent_crude" if "oil" in req.event.lower() or "crude" in req.event.lower() else "custom"
    return simulate_domino_event(
        scenario_key=scenario_key,
        magnitude=mag,
        depth=4,
        horizon="1_5_days",
        min_confidence=0.70,
        custom_event_title=req.event
    )

@router.get("/stock-detail/{symbol}")
async def get_stock_detail(
    symbol: str,
    asset: str = Query(default="BRENT"),
    magnitude: float = Query(default=12.0)
):
    """Returns detailed company filing exposures, structural formulas, and SHAP factor attribution."""
    return calculate_company_structural_impact(
        symbol=symbol,
        shock_asset=asset,
        magnitude_pct=magnitude
    )

@router.get("/ledger")
async def get_ledger():
    """Returns audited 180-day prediction ledger and walk-forward calibration stats."""
    return get_prediction_ledger()

@router.post("/save-prediction")
async def save_prediction(req: SavePredictionRequest):
    """Records a live simulated prediction into the audited ledger."""
    return record_live_prediction(
        event_title=req.event_title,
        symbol=req.symbol,
        predicted_range=req.predicted_range,
        probability=req.probability,
        confidence_tier=req.confidence_tier
    )

@router.get("/analogs")
async def get_historical_analogs(
    event_type: str = Query(default="oil_shock"),
    magnitude: float = Query(default=12.0)
):
    """Returns historical shock regime analogs."""
    return compute_regime_analogs(event_type=event_type, magnitude_pct=magnitude)

@router.post("/agent-query")
@router.post("/copilot-chat")
async def domino_agent_query(req: DominoAgentQueryRequest):
    """
    Intelligent Autonomous Domino Agent:
    Answers any conversational or analytical inquiry and executes live causal prediction updates.
    """
    return await process_domino_agent_query(
        user_query=req.query,
        context_ticker=req.context_ticker,
        history=req.history,
        active_scenario_key=req.active_scenario_key,
        active_magnitude=req.active_magnitude,
        active_depth=req.active_depth,
        active_horizon=req.active_horizon
    )
