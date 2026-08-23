import os
import json
from typing import List, Dict, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "companies")

def get_all_companies() -> List[Dict]:
    companies = []
    if not os.path.exists(DATA_DIR):
        return companies
    for filename in os.listdir(DATA_DIR):
        if filename.endswith(".json"):
            filepath = os.path.join(DATA_DIR, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    companies.append(json.load(f))
            except Exception as e:
                print(f"Error loading {filename}: {e}")
    # Sort by market cap ranking
    return sorted(companies, key=lambda x: x.get("symbol", ""))

def get_company_by_symbol(symbol: str) -> Optional[Dict]:
    symbol_clean = symbol.upper().replace(".NS", "").replace(".BO", "")
    filename = f"{symbol_clean.lower()}.json"
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    
    # Fallback search by partial match
    all_comps = get_all_companies()
    for comp in all_comps:
        if symbol_clean in comp.get("symbol", "") or symbol_clean in comp.get("name", "").upper():
            return comp
    return None

def get_sector_peers(sector: str) -> List[Dict]:
    all_comps = get_all_companies()
    return [c for c in all_comps if sector.lower() in c.get("sector", "").lower()]
