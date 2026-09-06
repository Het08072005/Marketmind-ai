from fastapi import APIRouter
from services.macro_data_service import get_live_macro_rates, get_commodity_live_price

router = APIRouter(prefix="/api/macro", tags=["Macro & Commodities"])

@router.get("/live-rates")
def read_live_macro_rates():
    """
    Returns real-time prices and 24h percentage movements for global commodities,
    currencies, and yields affecting Indian equities (Crude, Gold, USD/INR, Natural Gas).
    """
    return get_live_macro_rates()

@router.get("/spot/{commodity}")
def read_commodity_spot_price(commodity: str):
    """
    Returns live spot price for a specific commodity (e.g. BRENT, GOLD, USD_INR).
    """
    price = get_commodity_live_price(commodity)
    return {"commodity": commodity.upper(), "live_spot_price": price}
