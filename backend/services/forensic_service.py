import os
import json
from typing import Dict, List, Optional
from services.stock_service import get_company_by_symbol

FAILURES_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "failures", "historical_cases.json")

def get_forensic_reality_check(symbol: str) -> Optional[Dict]:
    company = get_company_by_symbol(symbol)
    if not company:
        return None
    return {
        "symbol": company.get("symbol"),
        "name": company.get("name"),
        "forensic": company.get("forensic", {}),
        "dna": company.get("dna", {}),
    }

def get_historical_autopsy_cases() -> List[Dict]:
    if os.path.exists(FAILURES_FILE):
        with open(FAILURES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []
