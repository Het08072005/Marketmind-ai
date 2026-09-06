from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.dna_service import (
    get_complete_dna_analysis,
    find_behavioral_twin_across_universe,
    derive_dna_profile,
    calculate_genetic_affinity,
    generate_ai_dna_intelligence
)
from services.market_data_service import fetch_live_stock_data
from services.stock_service import get_company_by_symbol

router = APIRouter(prefix="/api/dna", tags=["Stock DNA Fingerprint Engine"])

class DnaAnalyzeRequest(BaseModel):
    symbol1: str
    symbol2: Optional[str] = "TATAMOTORS"

class DnaRescanRequest(BaseModel):
    symbol1: str
    symbol2: Optional[str] = "TATAMOTORS"

@router.get("/analyze")
async def analyze_dna_query(
    symbol1: str = Query("TITAN", description="Primary company symbol"),
    symbol2: str = Query("TATAMOTORS", description="Benchmark comparison symbol")
):
    """
    Returns end-to-end 8-strand DNA Fingerprint analysis, genetic affinity matching,
    event response fingerprints, regime DNA, historical analogs, and anti-hallucination ledger.
    """
    try:
        data = await get_complete_dna_analysis(symbol1, symbol2)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DNA Analysis failed: {str(e)}")

@router.post("/analyze")
async def analyze_dna_post(req: DnaAnalyzeRequest):
    """POST endpoint to analyze 8-strand DNA for two stocks."""
    try:
        data = await get_complete_dna_analysis(req.symbol1, req.symbol2)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DNA Analysis failed: {str(e)}")

@router.get("/twin/{symbol}")
async def get_behavioral_twin(symbol: str):
    """
    Scans the entire 38-stock universe and returns the highest-affinity behavioral twin
    for the specified company.
    """
    try:
        clean = (symbol or "TITAN").upper().strip().replace(".NS", "")
        result = find_behavioral_twin_across_universe(clean)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Twin discovery failed: {str(e)}")

@router.post("/rescan")
async def rescan_patterns(req: DnaRescanRequest):
    """
    Executes a fresh AI re-scan of hidden anomaly patterns and genetic intelligence using Gemini.
    """
    try:
        clean1 = (req.symbol1 or "TITAN").upper().strip().replace(".NS", "")
        clean2 = (req.symbol2 or "TATAMOTORS").upper().strip().replace(".NS", "")
        comp1 = fetch_live_stock_data(clean1) or get_company_by_symbol(clean1) or {"symbol": clean1, "name": f"{clean1} Ltd"}
        comp2 = fetch_live_stock_data(clean2) or get_company_by_symbol(clean2) or {"symbol": clean2, "name": f"{clean2} Ltd"}
        
        dna1 = derive_dna_profile(comp1)
        dna2 = derive_dna_profile(comp2)
        affinity = calculate_genetic_affinity(dna1, dna2)
        
        ai_intel = await generate_ai_dna_intelligence(dna1, dna2, affinity)
        return {
            "patterns": ai_intel.get("patterns", []),
            "ai_verdict": ai_intel.get("verdict", ""),
            "playbook_rules": ai_intel.get("playbook_rules", []),
            "status": "success",
            "symbol1": clean1,
            "symbol2": clean2
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pattern rescan failed: {str(e)}")
