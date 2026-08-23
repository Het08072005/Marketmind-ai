from fastapi import APIRouter, HTTPException
from services.stock_service import get_all_companies, get_company_by_symbol, get_sector_peers

router = APIRouter(prefix="/api/stocks", tags=["Stocks & Intelligence"])

@router.get("")
async def list_stocks():
    return get_all_companies()

@router.get("/{symbol}")
async def get_stock(symbol: str):
    comp = get_company_by_symbol(symbol)
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
    return comp

@router.get("/sector/{sector_name}")
async def get_sector(sector_name: str):
    return get_sector_peers(sector_name)
