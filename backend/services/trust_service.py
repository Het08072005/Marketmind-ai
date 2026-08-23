import os
from typing import Dict, Optional
from services.stock_service import get_company_by_symbol

def get_company_trust_audit(symbol: str) -> Optional[Dict]:
    company = get_company_by_symbol(symbol)
    if not company:
        return None
    return {
        "symbol": company.get("symbol"),
        "name": company.get("name"),
        "sector": company.get("sector"),
        "trust_meter": company.get("trust_meter", {}),
    }
