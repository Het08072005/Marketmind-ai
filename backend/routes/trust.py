from fastapi import APIRouter, HTTPException
from services.trust_service import get_company_trust_audit

router = APIRouter(prefix="/api/trust", tags=["Management Trust Meter"])

@router.get("/{symbol}")
async def get_trust(symbol: str):
    audit = get_company_trust_audit(symbol)
    if not audit:
        raise HTTPException(status_code=404, detail="Company audit data not found")
    return audit
