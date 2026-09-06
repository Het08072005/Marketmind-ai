from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.dependency_service import (
    get_portfolio_dependency_map,
    simulate_portfolio_macro_shock,
    find_multi_hop_connection,
    scan_portfolio_hidden_risks,
    compute_true_diversification_clusters,
    optimize_factor_risk_rebalance,
    get_dynamic_portfolio_holdings,
    FACTORS
)
from services.stock_service import get_all_companies

router = APIRouter(prefix="/api/dependency", tags=["Portfolio Hidden Dependency Map"])

class DependencyShockRequest(BaseModel):
    factor: str
    shock_pct: float
    symbol: Optional[str] = None

@router.get("/map")
async def get_dependency_map(
    factor: str = Query("USDINR", description="Active macro factor key: USDINR, BRENT, RATES, ITSPEND, MONSOON, CREDIT"),
    symbol: Optional[str] = Query(None, description="Optional focus company symbol to dynamically include in the systemic network (e.g. ADANIENT, RELIANCE, TATASTEEL)")
):
    """
    Returns the systemic risk graph, concentration audit, systemic metrics,
    contagion trace, latent factor discovery, and rebalance intelligence.
    Supports ANY dynamically requested focus company.
    """
    try:
        data = get_portfolio_dependency_map(factor, focus_symbol=symbol)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dependency Map generation failed: {str(e)}")

@router.post("/simulate")
async def simulate_shock(req: DependencyShockRequest):
    """
    Executes a real-time counterfactual shock stress test on the portfolio,
    including any active focus company.
    """
    try:
        data = simulate_portfolio_macro_shock(req.factor, req.shock_pct, focus_symbol=req.symbol)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Macro shock simulation failed: {str(e)}")

@router.get("/connection")
async def get_multi_hop_connection(
    sym_a: Optional[str] = Query(None),
    sym_b: Optional[str] = Query(None),
    symbol1: Optional[str] = Query(None),
    symbol2: Optional[str] = Query(None)
):
    """
    Computes graph pathfinding between any two stocks to discover their multi-hop
    causal transmission connection and stress correlation jump.
    """
    s1 = (sym_a or symbol1 or "RELIANCE").upper().strip()
    s2 = (sym_b or symbol2 or "HDFCBANK").upper().strip()
    try:
        data = find_multi_hop_connection(s1, s2)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection pathfinding failed: {str(e)}")

@router.get("/scan-hidden-risks")
async def scan_hidden_risks(
    symbol: Optional[str] = Query(None, description="Focus stock symbol")
):
    """
    Scans the portfolio and focus asset to discover Top 3 unexpected multi-hop vulnerabilities.
    """
    try:
        data = scan_portfolio_hidden_risks(focus_symbol=symbol)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hidden risk scan failed: {str(e)}")

@router.get("/diversification")
async def get_true_diversification():
    """
    Computes effective independent risk groups (N_eff) via participation ratio.
    """
    try:
        holdings = get_dynamic_portfolio_holdings()
        data = compute_true_diversification_clusters(holdings)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diversification analysis failed: {str(e)}")

@router.get("/rebalance")
async def get_risk_rebalance(
    factor: str = Query("USDINR", description="Factor to de-risk")
):
    """
    Computes factor risk reduction rebalance recommendations.
    """
    try:
        holdings = get_dynamic_portfolio_holdings()
        data = optimize_factor_risk_rebalance(factor, holdings)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rebalance calculation failed: {str(e)}")

@router.get("/factors")
async def list_macro_factors():
    """Returns all 6 supported institutional macro factors and their metadata."""
    return FACTORS

@router.get("/companies")
async def list_dependency_companies():
    """Returns all available Indian market companies for dynamic dependency selection."""
    try:
        comps = get_all_companies()
        return [
            {
                "symbol": c.get("symbol", "").upper(),
                "name": c.get("name", ""),
                "sector": c.get("sector", ""),
                "price": c.get("price", 0.0)
            }
            for c in comps
            if c.get("symbol")
        ]
    except Exception as e:
        return []
