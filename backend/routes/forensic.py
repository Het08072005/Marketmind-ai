from fastapi import APIRouter, HTTPException
from services.forensic_service import get_forensic_reality_check, get_historical_autopsy_cases

router = APIRouter(prefix="/api/forensic", tags=["Forensic Accounting & Autopsy"])

@router.get("/cases")
async def get_cases():
    return get_historical_autopsy_cases()

@router.get("/{symbol}")
async def get_forensic(symbol: str):
    res = get_forensic_reality_check(symbol)
    if not res:
        raise HTTPException(status_code=404, detail="Forensic data not found")
    return res
