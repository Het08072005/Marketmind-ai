from fastapi import APIRouter, Query
from typing import Optional
from services.report_service import generate_institutional_equity_report

reports_router = APIRouter()

@reports_router.get("/generate")
def get_institutional_report(symbol: str = Query(..., description="Stock Ticker Symbol"), report_type: Optional[str] = "Company Snapshot"):
    """
    Generate deep institutional equity research report with real live valuation, technicals, and forensics.
    """
    return generate_institutional_equity_report(symbol, report_type)
