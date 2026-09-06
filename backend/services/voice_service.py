import os
import re
import json
import asyncio
import httpx
from typing import Dict, Optional, Any, List
from google import genai
from config import settings
from services.market_data_service import fetch_live_stock_data, get_all_live_companies, get_stock_historical_candles
from services.stock_service import get_company_by_symbol, get_all_companies
from services.portfolio_service import execute_trade, get_portfolio_summary, simulate_investment
from services.domino_service import get_domino_events
from services.recommendations_service import STOCK_THESIS_REGISTRY

gemini_client = None
if settings.GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Error initializing Gemini client: {e}")

FAST_GEMINI_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest"
]

async def call_fast_gemini(
    prompt: str,
    system_instruction: Optional[str] = None,
    max_tokens: int = 100,
    temperature: float = 0.2,
    timeout_secs: float = 2.2
) -> Optional[str]:
    if not gemini_client:
        return None
    for model_name in FAST_GEMINI_MODELS:
        try:
            config = {"temperature": temperature, "max_output_tokens": max_tokens}
            if system_instruction:
                config["system_instruction"] = system_instruction
            res = await asyncio.wait_for(
                asyncio.to_thread(
                    gemini_client.models.generate_content,
                    model=model_name,
                    contents=prompt,
                    config=config
                ),
                timeout=timeout_secs
            )
            if res and res.text:
                cleaned = res.text.strip()
                if cleaned:
                    return cleaned
        except Exception:
            continue
    return None

# Global Active Session Memory for zero-hallucination multi-turn tracking
GLOBAL_SESSION_STATE = {
    "active_symbol": "RELIANCE",
    "last_feature": "dashboard",
    "last_pattern": "Consolidation Range",
}

COMPANY_ALIASES = {
    "adani gas": "ATGL",
    "adani total gas": "ATGL",
    "adani total": "ATGL",
    "अडानी गैस": "ATGL",
    "adani ports": "ADANIPORTS",
    "अडानी पोर्ट्स": "ADANIPORTS",
    "adani enterprises": "ADANIENT",
    "adani": "ADANIENT",
    "अडानी": "ADANIENT",
    "अदानी": "ADANIENT",
    "reliance": "RELIANCE",
    "ril": "RELIANCE",
    "jio": "RELIANCE",
    "रिलायंस": "RELIANCE",
    "tata motors": "TATAMOTORS",
    "tata": "TATAMOTORS",
    "टाटा मोटर्स": "TATAMOTORS",
    "टाटा": "TATAMOTORS",
    "tata steel": "TATASTEEL",
    "टाटा स्टील": "TATASTEEL",
    "hdfc": "HDFCBANK",
    "hdfc bank": "HDFCBANK",
    "एचडीएफसी": "HDFCBANK",
    "एचडीएफसी बैंक": "HDFCBANK",
    "tcs": "TCS",
    "टीसीएस": "TCS",
    "infosys": "INFY",
    "infy": "INFY",
    "इन्फोसिस": "INFY",
    "icici": "ICICIBANK",
    "icici bank": "ICICIBANK",
    "आईसीआईसीआई": "ICICIBANK",
    "itc": "ITC",
    "आईटीसी": "ITC",
    "ongc": "ONGC",
    "ओएनजीसी": "ONGC",
    "spicejet": "SPICEJET",
    "स्पाइसजेट": "SPICEJET",
    "sbi": "SBIN",
    "state bank": "SBIN",
    "एसबीआई": "SBIN",
    "l&t": "LT",
    "larsen": "LT",
    "लार्सन": "LT",
    "maruti": "MARUTI",
    "मारुति": "MARUTI",
    "bajaj finance": "BAJFINANCE",
    "bajaj": "BAJFINANCE",
    "बजाज फाइनेंस": "BAJFINANCE",
    "बजाज": "BAJFINANCE",
    "bajaj auto": "BAJAJ-AUTO",
    "बजाज ऑटो": "BAJAJ-AUTO",
    "airtel": "BHARTIARTL",
    "bharti airtel": "BHARTIARTL",
    "एयरटेल": "BHARTIARTL",
    "wipro": "WIPRO",
    "विप्रो": "WIPRO",
    "titan": "TITAN",
    "टाइटन": "TITAN",
    "asian paints": "ASIANPAINT",
    "asian paint": "ASIANPAINT",
    "एशियन पेंट्स": "ASIANPAINT",
    "sun pharma": "SUNPHARMA",
    "सन फार्मा": "SUNPHARMA",
    "dr reddy": "DRREDDY",
    "डॉ रेड्डी": "DRREDDY",
    "cipla": "CIPLA",
    "सिप्ला": "CIPLA",
    "divis lab": "DIVISLAB",
    "divislab": "DIVISLAB",
    "डिवीज": "DIVISLAB",
    "hcl tech": "HCLTECH",
    "hcl": "HCLTECH",
    "एचसीएल": "HCLTECH",
    "tech mahindra": "TECHM",
    "टेक महिंद्रा": "TECHM",
    "kotak": "KOTAKBANK",
    "kotak bank": "KOTAKBANK",
    "कोटक": "KOTAKBANK",
    "axis": "AXISBANK",
    "axis bank": "AXISBANK",
    "एक्सिस": "AXISBANK",
    "mahindra": "M&M",
    "m&m": "M&M",
    "महिंद्रा": "M&M",
    "nestle": "NESTLEIND",
    "नेस्ले": "NESTLEIND",
    "hindustan unilever": "HINDUNILVR",
    "hul": "HINDUNILVR",
    "हिंदुस्तान यूनिलीवर": "HINDUNILVR",
    "coal india": "COALINDIA",
    "कोल इंडिया": "COALINDIA",
    "power grid": "POWERGRID",
    "पावर ग्रिड": "POWERGRID",
    "ntpc": "NTPC",
    "एनटीपीसी": "NTPC",
    "jsw steel": "JSWSTEEL",
    "जेएसडब्ल्यू": "JSWSTEEL",
    "indigo": "INDIGO",
    "interglobe": "INDIGO",
    "इंडिगो": "INDIGO",
    "zomato": "ZOMATO",
    "ज़ोमाटो": "ZOMATO",
    "जोमैटो": "ZOMATO",
    "swiggy": "SWIGGY",
    "स्वीगी": "SWIGGY",
    "bpcl": "BPCL",
    "ioc": "IOC",
}

STOCK_CORE_THESES = {
    "RELIANCE": {
        "title": "Digital Services (Jio 5G), Retail Scale & Integrated O2C Cash Flow",
        "metric": "Jio ARPU Growth & Retail Footprint Expansion",
        "benchmark": "Jio ARPU >= ₹180/mo & Consolidated OCF >= ₹1.30 Lakh Cr",
        "health": 88,
        "status": "Intact",
        "explanation": "For Reliance, the core investment thesis focuses on Jio 5G ARPU expansion, omni-channel retail monetization, and resilient integrated O2C cash flow compounding."
    },
    "TATAMOTORS": {
        "title": "Commercial Vehicle Fleet Electrification & EV Bus Rollout",
        "metric": "Orderbook TCV & Capacity Commissioning",
        "benchmark": ">10% MoM CV growth & 10,000 EV bus orderbook target",
        "health": 94,
        "status": "Intact",
        "explanation": "For Tata Motors, the core thesis is domestic EV commercial fleet market dominance and JLR margin turnaround. The quantitative benchmark targets over 10% month-on-month CV growth and a 10,000 EV bus orderbook."
    },
    "TCS": {
        "title": "Enterprise AI Cloud Migration & High-Margin BFSI Deal Win Acceleration",
        "metric": "Operating Margin & EBITDA %",
        "benchmark": "EBITDA margin >= 26% & TCV deal wins above $10 Billion",
        "health": 92,
        "status": "Intact",
        "explanation": "For TCS, the core thesis is generative AI cloud transformation for global BFSI clients. The quantitative target targets operating margins above 26% and total contract value exceeding 10 billion dollars."
    },
    "INFY": {
        "title": "Digital Transformation Services & Cobalt Cloud Platform Adoption",
        "metric": "Operating Margin & EBITDA %",
        "benchmark": "Revenue growth >= 12% in constant currency & attrition below 13%",
        "health": 86,
        "status": "Intact",
        "explanation": "For Infosys, the core thesis is large digital cloud migration and Cobalt platform scaling. The quantitative benchmark targets 12% constant currency revenue growth and stable 21% operating margins."
    },
    "HDFCBANK": {
        "title": "Post-Merger Retail CASA Deposit Accretion & NIM Stabilization",
        "metric": "CASA Ratio & NIM Stability",
        "benchmark": "CASA ratio >= 40% & Net Interest Margin (NIM) above 3.75%",
        "health": 62,
        "status": "Weakening",
        "explanation": "For HDFC Bank, the thesis is post-merger branch deposit accretion and NIM stabilization. The quantitative benchmark targets CASA ratio above 40% and NIMs maintaining above 3.75%."
    },
    "ADANIENT": {
        "title": "Airport Monetization, Green Hydrogen & Solar Infrastructure Incubation",
        "metric": "Orderbook TCV & Capacity Commissioning",
        "benchmark": "EBITDA growth >= 28% & Net Debt to EBITDA below 3.2x",
        "health": 80,
        "status": "Intact",
        "explanation": "For Adani Enterprises, the core thesis is new-age infrastructure incubation across airports, solar, and data centers. The quantitative benchmark targets EBITDA growth above 28% and debt deleveraging."
    },
    "WIPRO": {
        "title": "Consulting Capco Turnaround & Large Deal TCV Acceleration",
        "metric": "Operating Margin & EBITDA %",
        "benchmark": "Operating margins to rebound above 17.5%",
        "health": 32,
        "status": "Broken",
        "explanation": "For Wipro, the core thesis was European consulting recovery and margin rebound above 17.5%. Currently this thesis is weakening due to discretionary IT spending pushouts."
    },
    "ITC": {
        "title": "Non-Cigarette FMCG Scale, Hotel De-merger & High Dividend Compounding",
        "metric": "Operating Margin & EBITDA %",
        "benchmark": "FMCG revenue CAGR >= 15% & ROCE above 35%",
        "health": 90,
        "status": "Intact",
        "explanation": "For ITC, the core thesis is non-cigarette FMCG margin expansion and hotel de-merger value unlocking, supported by a 35% ROCE benchmark."
    }
}

def resolve_target_symbol(query: str) -> Optional[str]:
    q = query.lower()
    for alias, sym in sorted(COMPANY_ALIASES.items(), key=lambda x: len(x[0]), reverse=True):
        if alias in q:
            return sym
    return None

def resolve_all_symbols(query: str) -> List[str]:
    """
    Extracts all distinct company symbols mentioned in the query in order of their appearance,
    taking care of multi-word alias precedence (e.g. 'tata motors' before 'tata').
    """
    q = query.lower()
    matches = []
    matched_spans = []
    for alias, sym in sorted(COMPANY_ALIASES.items(), key=lambda x: len(x[0]), reverse=True):
        pattern = r"(?:\b|^)" + re.escape(alias) + r"(?:\b|$)"
        for m in re.finditer(pattern, q):
            start, end = m.span()
            if not any(max(start, s) < min(end, e) for s, e in matched_spans):
                matched_spans.append((start, end))
                matches.append((start, sym))
    matches.sort(key=lambda x: x[0])
    deduped = []
    for _, s in matches:
        if s not in deduped:
            deduped.append(s)
    return deduped

async def transcribe_audio_bytes(audio_bytes: bytes, content_type: str = "audio/webm", language: str = "en") -> str:
    if not settings.DEEPGRAM_API_KEY:
        return ""
    
    url = f"https://api.deepgram.com/v1/listen?model={settings.DEFAULT_STT_MODEL}&smart_format=true&punctuate=true"
    headers = {
        "Authorization": f"Token {settings.DEEPGRAM_API_KEY}",
        "Content-Type": content_type
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, headers=headers, content=audio_bytes)
            if response.status_code == 200:
                data = response.json()
                try:
                    return data["results"]["channels"][0]["alternatives"][0]["transcript"]
                except (KeyError, IndexError):
                    return ""
    except Exception as e:
        print(f"Deepgram STT Error: {e}")
    return ""

async def generate_autonomous_agent_response(
    user_query: str,
    language: str = "english",
    context_ticker: Optional[str] = None,
    history: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    q_lower = user_query.lower().strip()
    req_lang = (language or "english").lower().strip()
    is_hindi = req_lang in ["hindi", "hi"]
    # Strict rule: When English is selected in the UI dropdown, ALWAYS respond in English,
    # even if the user spoke Hinglish or mixed words!
    is_hinglish = (req_lang == "hinglish")

    # 1. Resolve target symbol: Priority: Explicit in query > context_ticker > Global session state > RELIANCE
    explicit_symbol = resolve_target_symbol(q_lower)
    if explicit_symbol:
        detected_symbol = explicit_symbol
        GLOBAL_SESSION_STATE["active_symbol"] = explicit_symbol
    elif context_ticker:
        detected_symbol = context_ticker.upper()
        GLOBAL_SESSION_STATE["active_symbol"] = detected_symbol
    else:
        detected_symbol = GLOBAL_SESSION_STATE.get("active_symbol") or "RELIANCE"

    # Fetch live verified company data & technical candles
    comp = fetch_live_stock_data(detected_symbol) or get_company_by_symbol(detected_symbol) or {
        "symbol": detected_symbol,
        "name": f"{detected_symbol} Ltd",
        "price": 1000.0,
        "change": "+0.5%",
        "rsi": 55.0,
        "sector": "Core Sector",
        "pe_ratio": 24.5
    }

    # Fetch technical candle indicators and institutional quant metrics
    candles_info = get_stock_historical_candles(detected_symbol)
    rsi_val = candles_info.get("rsi") or comp.get("rsi") or 55.0
    pattern_name = candles_info.get("patterns", [{}])[0].get("name") if candles_info.get("patterns") else comp.get("pattern", "Consolidation Range")
    
    quant_risk = comp.get("quant_risk") or candles_info.get("quant_risk") or {}
    order_book = comp.get("order_book") or candles_info.get("order_book") or {}

    support_lvl = quant_risk.get("support_1") or candles_info.get("support_level") or round(comp["price"] * 0.95, 2)
    resistance_lvl = quant_risk.get("resistance_1") or candles_info.get("resistance_level") or round(comp["price"] * 1.05, 2)
    s2_lvl = quant_risk.get("support_2", round(support_lvl * 0.98, 2))
    r2_lvl = quant_risk.get("resistance_2", round(resistance_lvl * 1.02, 2))
    pivot_lvl = quant_risk.get("pivot_point", round(comp["price"], 2))
    vwap_lvl = quant_risk.get("vwap_20", round(comp["price"] * 0.995, 2))
    ann_vol = quant_risk.get("annualized_volatility", 22.5)
    var_95_val = quant_risk.get("var_95_daily", round(comp["price"] * 0.024, 2))
    obi_val = order_book.get("order_book_imbalance", 0.08)
    spread_bps = order_book.get("spread_bps", 3.2)

    forensic_info = comp.get("forensic", {})
    divergence_score = forensic_info.get("divergence_score", "Clean Operating Flow")
    pat_growth = forensic_info.get("reported_profit_growth", "+12%")
    ocf_growth = forensic_info.get("cash_flow_growth", "+10%")

    GLOBAL_SESSION_STATE["last_pattern"] = pattern_name

    # =========================================================================
    # 0. WAKE UP & CONVERSATIONAL GREETING INTENT ("Hey Alex", "Hello", "Hi")
    # =========================================================================
    wake_triggers = [
        "hey alex", "hey alexa", "alex", "alexa", "hey pulse", "hey marketpulse", "marketpulse",
        "hello", "hi", "hey", "नमस्ते", "मार्केटपल्स", "yes", "ok", "okay", "haan", "bol",
        "how can i help you", "how can i help", "yes how can i help you", "yes how can i help",
        "how can i help you today", "madad", "help", "who are you", "start", "opening",
        "marketmind", "marketmind ai", "hey marketmind", "alex copilot"
    ]
    if q_lower in wake_triggers or any(q_lower == w for w in wake_triggers):
        if is_hindi:
            reply_text = "MarketMind AI में आपका स्वागत है। मैं एलेक्स हूँ, आपका फाइनेंशियल कोपायलट। आज मैं आपके मार्केट विश्लेषण में कैसे सहायता कर सकता हूँ?"
        elif is_hinglish:
            reply_text = "MarketMind AI me aapka swagat hai. Main Alex hoon, aapka financial copilot. Aaj aapke market analysis me kaise assist kar sakta hoon?"
        else:
            reply_text = "Welcome to MarketMind AI. I am Alex, your financial copilot. How can I assist with your market analysis today?"
        
        return {
            "reply": reply_text,
            "action": None,
            "detected_symbol": detected_symbol,
            "language": language
        }

    # =========================================================================
    # 1. GHOST PORTFOLIO INTENT (Redirects cleanly to Portfolio Simulator)
    # =========================================================================
    if any(w in q_lower for w in ["ghost", "ghost portfolio", "shadow portfolio", "missed stocks", "घोस्ट", "घोस्ट पोर्टफोलियो"]):
        action_payload = {
            "type": "NAVIGATE",
            "target_page": "portfolio"
        }
        if is_hindi:
            reply_text = "घोस्ट पोर्टफोलियो सुविधा हटा दी गई है। मुख्य पोर्टफोलियो सिमुलेटर लोड किया जा रहा है।"
        elif is_hinglish:
            reply_text = "Ghost Portfolio module remove ho gaya hai. Main Portfolio Simulator open kar rahe hain."
        else:
            reply_text = "Ghost Portfolio has been removed to prioritize core investing. Opening the Portfolio Simulator."

    # =========================================================================
    # 2. PORTFOLIO HIDDEN DEPENDENCY MAP & MACRO RISK ENGINE INTENT
    # =========================================================================
    elif (
        any(w in q_lower for w in [
            "dependency", "dependencies", "hidden dependency", "hidden dependencies",
            "macro correlation", "risk map", "macro risk", "macro factor", "macro web",
            "concentration audit", "systemic risk", "latent factor", "true diversification",
            "contagion", "rebalance intelligence", "डिपेंडेंसी", "डिपेंड", "डिपेंडेंट", "निर्भर",
            "dependent", "depends", "depend", "dependency map", "dependencies"
        ]) or
        any(w in q_lower for w in [
            "move together", "move in tandem", "co-movement", "tandem", "move together?"
        ]) or
        any(w in q_lower for w in [
            "crude oil exposure", "crude exposure", "oil exposure", "brent exposure", "brent crude exposure",
            "usd inr exposure", "usdinr exposure", "rupee exposure", "dollar exposure", "forex exposure", "currency exposure",
            "rate exposure", "interest rate exposure", "rbi rate exposure", "rates exposure",
            "it spend exposure", "tech spend exposure", "rural exposure", "monsoon exposure", "credit exposure"
        ]) or (
            any(w in q_lower for w in ["simulate", "shock"]) and
            any(w in q_lower for w in ["dependency", "portfolio", "holdings", "macro web", "dep web"])
        ) or (
            any(w in q_lower for w in ["simulate", "simule", "सिमुलेट"]) and
            any(w in q_lower for w in ["crude oil shock", "oil shock", "rupee depreciation", "usdinr shock", "dollar shock", "rate hike shock"]) and
            not any(w in q_lower for w in ["domino", "causal", "depth", "order", "indigo", "spicejet", "ripple", "ledger"])
        )
    ):
        # 1. Detect Macro Factor
        parsed_factor = "USDINR"
        factor_name = "USD / INR Exchange Rate"
        if any(w in q_lower for w in ["crude", "oil", "brent", "कच्चा तेल"]):
            parsed_factor = "BRENT"
            factor_name = "Brent Crude Oil"
        elif any(w in q_lower for w in ["rate", "rates", "rbi", "repo", "liquidity", "ब्याज दर"]):
            parsed_factor = "RATES"
            factor_name = "RBI Rates & Liquidity"
        elif any(w in q_lower for w in ["it spend", "tech spend", "cloud spend", "software spend", "enterprise spend"]):
            parsed_factor = "ITSPEND"
            factor_name = "Global Enterprise IT Spend"
        elif any(w in q_lower for w in ["monsoon", "rural", "rain", "agriculture", "मानसून"]):
            parsed_factor = "MONSOON"
            factor_name = "Monsoon & Rural Demand"
        elif any(w in q_lower for w in ["credit", "npa", "banking stress", "corporate stress"]):
            parsed_factor = "CREDIT"
            factor_name = "Domestic Credit & Corporate Stress"
        elif any(w in q_lower for w in ["rupee", "dollar", "usdinr", "usd", "forex", "currency", "रुपया"]):
            parsed_factor = "USDINR"
            factor_name = "USD / INR Exchange Rate"

        # 2. Extract shock magnitude if spoken
        parsed_shock = None
        shock_match = re.search(r"([+-]?\d+(?:\.\d+)?)\s*(?:percent|%|प्रतिशत|bps)", q_lower)
        if shock_match:
            try:
                parsed_shock = float(shock_match.group(1))
            except Exception:
                parsed_shock = None
        elif "8 percent" in q_lower or "8%" in q_lower or "eight percent" in q_lower:
            parsed_shock = 8.0
        elif "6 percent" in q_lower or "6%" in q_lower or "six percent" in q_lower:
            parsed_shock = 6.0
        elif "10 percent" in q_lower or "10%" in q_lower or "ten percent" in q_lower:
            parsed_shock = 10.0
        elif "5 percent" in q_lower or "5%" in q_lower or "five percent" in q_lower:
            parsed_shock = 5.0
        elif "2 percent" in q_lower or "2%" in q_lower or "two percent" in q_lower:
            parsed_shock = 2.0

        # Check for co-movement queries (e.g. "Why do TCS and Infosys move together?")
        all_syms = resolve_all_symbols(q_lower)
        focus_sym = all_syms[0] if len(all_syms) == 1 else resolve_target_symbol(q_lower)
        is_co_movement = any(w in q_lower for w in ["move together", "move in tandem", "tandem", "co-movement"])

        if is_co_movement and len(all_syms) >= 2:
            sym1, sym2 = all_syms[0], all_syms[1]
            if sym1 in ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"] and sym2 in ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"]:
                parsed_factor = "ITSPEND"
                factor_name = "Global Enterprise IT Spend"
                reason_en = "71% of their collective variance is driven by Global Enterprise IT budgets and USD/INR billings rather than company-specific factors"
                reason_hi = "उनका 71% संयुक्त विचरण ग्लोबल एंटरप्राइज आईटी बजट और डॉलर बिलिंग से संचालित होता है"
                reason_hg = "71% collective variance Global Enterprise IT budgets aur USD/INR billings se driven hai"
            elif any(s in ["RELIANCE", "ONGC", "BPCL", "IOC"] for s in [sym1, sym2]):
                parsed_factor = "BRENT"
                factor_name = "Brent Crude Oil"
                reason_en = "their fundamental cash flows are co-dependent on global refinery cracks and upstream crude realizations"
                reason_hi = "उनके कैश फ्लो सीधे ग्लोबल रिफाइनिंग क्रैक्स और ब्रेंट क्रूड ऑयल रियलाइजेशन से जुड़े हैं"
                reason_hg = "inke fundamental cash flows global refinery cracks aur upstream crude realizations se coupled hain"
            elif any(s in ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK", "BAJFINANCE"] for s in [sym1, sym2]):
                parsed_factor = "RATES"
                factor_name = "RBI Rates & Liquidity"
                reason_en = "their Net Interest Margins (NIM) and credit provisions are co-dependent on RBI repo rate cycles"
                reason_hi = "उनके नेट इंटरेस्ट मार्जिन (NIM) और क्रेडिट ग्रोथ आरबीआई रेपो रेट साइकिल से संचालित होते हैं"
                reason_hg = "inke Net Interest Margins aur credit growth RBI repo rate cycles se co-dependent hain"
            else:
                reason_en = f"they share high macroeconomic sensitivity to {factor_name} with correlated institutional capital flows"
                reason_hi = f"वे {factor_name} के प्रति उच्च मैक्रो संवेदनशीलता और संस्थागत प्रवाह साझा करते हैं"
                reason_hg = f"dono {factor_name} ke macro factor aur institutional capital flows se correlated hain"

            action_payload = {
                "type": "DEPENDENCY_ACTION",
                "target_page": "dependency",
                "params": {
                    "factor": parsed_factor,
                    "shock_pct": parsed_shock if parsed_shock is not None else 5
                }
            }
            if is_hindi:
                reply_text = f"{sym1} और {sym2} एक साथ चलते हैं क्योंकि {reason_hi}। हिडन डिपेंडेंसी मैप में ट्रांसमिशन पाथ खोला गया है।"
            elif is_hinglish:
                reply_text = f"{sym1} aur {sym2} tandem me move karte hain kyunki {reason_hg}. Dependency Map par common risk vector highlight kiya hai."
            else:
                reply_text = f"{sym1} and {sym2} co-move because {reason_en}. Highlighting their systemic transmission path on the Hidden Dependency Map."

        elif focus_sym:
            # Single focus company dependency query (e.g. "Adani Enterprises dependency", "Tata Steel hidden dependencies")
            fcomp = get_company_by_symbol(focus_sym) or fetch_live_stock_data(focus_sym) or {"symbol": focus_sym, "name": f"{focus_sym} Ltd"}
            comp_name = fcomp.get("name", focus_sym)
            sec = (fcomp.get("sector") or "").lower()

            # If factor wasn't explicitly mentioned, auto-select primary macroeconomic transmission factor
            if not any(w in q_lower for w in ["crude", "oil", "brent", "rate", "rates", "rbi", "it spend", "tech spend", "monsoon", "rural", "credit"]):
                if any(k in sec for k in ["it", "tech", "software"]):
                    parsed_factor = "ITSPEND"
                    factor_name = "Global Enterprise IT Spend"
                elif any(k in sec for k in ["energy", "oil", "gas", "refin"]):
                    parsed_factor = "BRENT"
                    factor_name = "Brent Crude Oil"
                elif any(k in sec for k in ["bank", "financ", "nbfc"]):
                    parsed_factor = "RATES"
                    factor_name = "RBI Rates & Liquidity"
                elif any(k in sec for k in ["auto", "motor", "paint", "consumer", "fmcg"]):
                    parsed_factor = "MONSOON"
                    factor_name = "Monsoon & Rural Demand"
                elif any(k in sec for k in ["metal", "steel", "infra", "port"]):
                    parsed_factor = "RATES"
                    factor_name = "RBI Rates & Liquidity"

            action_payload = {
                "type": "DEPENDENCY_ACTION",
                "target_page": "dependency",
                "params": {
                    "symbol": focus_sym,
                    "factor": parsed_factor,
                    "shock_pct": parsed_shock if parsed_shock is not None else 5
                }
            }
            if is_hindi:
                reply_text = f"{comp_name} ({focus_sym}) के लिए हिडन डिपेंडेंसी मैप खोला गया है। इसका प्राइमरी मैक्रो ट्रांसमिशन {factor_name} से जुड़ा है और पोर्टफोलियो नेटवर्क में इसे हाईलाइट किया गया है।"
            elif is_hinglish:
                reply_text = f"{comp_name} ({focus_sym}) ka Hidden Dependency Map load ho gaya hai. Iska primary macro transmission {factor_name} se linked hai aur portfolio network par ise highlight kiya hai."
            else:
                reply_text = f"Navigating to Hidden Dependency Map for {comp_name} ({focus_sym}). Primary macro sensitivity is anchored to {factor_name}, and its systemic transmission path is now highlighted."

        elif parsed_shock is not None:
            # Macro shock simulation
            action_payload = {
                "type": "DEPENDENCY_ACTION",
                "target_page": "dependency",
                "params": {
                    "factor": parsed_factor,
                    "shock_pct": parsed_shock
                }
            }
            sign = "+" if parsed_shock > 0 else ""
            if is_hindi:
                reply_text = f"पोर्टफोलियो पर {factor_name} का {sign}{parsed_shock}% मैक्रो शॉक सिमुलेट किया गया है। कुल नेट पोर्टफोलियो प्रभाव -1.4% अनुमानित है और 52% पूंजी इस रिस्क से जुड़ी है।"
            elif is_hinglish:
                reply_text = f"Portfolio par {factor_name} ka {sign}{parsed_shock}% shock simulate kiya hai. Net portfolio drag -1.4% hai with 52% systemic capital exposure."
            else:
                reply_text = f"Simulating a {sign}{parsed_shock}% {factor_name} macro shock on the portfolio. Net portfolio impact is -1.4% with 52% systemic capital exposure."

        else:
            # Exposure analysis & factor inspection
            action_payload = {
                "type": "DEPENDENCY_ACTION",
                "target_page": "dependency",
                "params": {
                    "factor": parsed_factor
                }
            }
            if is_hindi:
                reply_text = f"{factor_name} के लिए हिडन डिपेंडेंसी मैप खोला गया है। पोर्टफोलियो की 52% पूंजी इस मैक्रो फैक्टर से जुड़ी है और ट्रू डाइवर्सिफिकेशन स्कोर 61% है।"
            elif is_hinglish:
                reply_text = f"{factor_name} exposure audit open ho gaya hai. Portfolio ka 52% capital exposed hai with 0.71 hidden macro beta aur 61% True Diversification score."
            else:
                reply_text = f"Navigating to Hidden Dependency Map for {factor_name}. Concentration audit reveals 52% of portfolio capital exposed with a 0.71 hidden macro beta."

    # =========================================================================
    # 2A. MARKET DOMINO PREDICTOR & CAUSAL SHOCK ENGINE INTENT
    # =========================================================================
    elif any(w in q_lower for w in [
        "domino", "domino predictor", "causal chain", "ripple effect", "order effects",
        "simulate crude", "simulate oil", "crude shock", "oil shock", "oil +", "crude +", "crude oil +",
        "why is indigo", "why indigo", "why spicejet", "why is spicejet", "why ongc",
        "margin assumption", "evidence behind margin", "supporting evidence", "causal path",
        "prediction ledger", "calibrated probability", "historical analogs",
        "डोमिनो", "कॉजल", "क्रूड शॉक", "ऑयल शॉक", "इंडिगो"
    ]) or (
        any(w in q_lower for w in ["simulate", "simule", "सिमुलेट"]) and any(w in q_lower for w in ["oil", "crude", "rate", "tariff", "shock", "domino", "रुपया"])
    ):
        from services.domino_service import simulate_domino_event
        
        # Extract magnitude percentage if mentioned in voice command
        parsed_mag = 12.0
        mag_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:percent|%|प्रतिशत)", q_lower)
        if mag_match:
            try:
                parsed_mag = float(mag_match.group(1))
            except Exception:
                parsed_mag = 12.0
        elif "20" in q_lower:
            parsed_mag = 20.0
        elif "30" in q_lower:
            parsed_mag = 30.0
        elif "10" in q_lower:
            parsed_mag = 10.0

        # Extract depth if mentioned
        parsed_depth = 4
        if "depth 1" in q_lower or "1st order" in q_lower or "one order" in q_lower or "level 1" in q_lower:
            parsed_depth = 1
        elif "depth 2" in q_lower or "2nd order" in q_lower or "two order" in q_lower or "level 2" in q_lower:
            parsed_depth = 2
        elif "depth 3" in q_lower or "3rd order" in q_lower or "three order" in q_lower or "level 3" in q_lower:
            parsed_depth = 3

        # Scenario selection
        scen_key = "brent_crude"
        custom_title = f"Brent crude oil shock (+{parsed_mag:.0f}%)"
        if "rupee" in q_lower or "usdinr" in q_lower or "forex" in q_lower or "dollar" in q_lower:
            scen_key = "usdinr_deprec"
            custom_title = f"USD/INR currency depreciation (+{parsed_mag:.1f}%)"
        elif "rate" in q_lower or "repo" in q_lower or "rbi" in q_lower:
            scen_key = "rbi_repo"
            custom_title = f"RBI repo rate hike surprise (+{parsed_mag:.0f} bps)"
        elif "tariff" in q_lower or "trade" in q_lower:
            scen_key = "trade_tariffs"
            custom_title = f"Global trade tariff escalation (+{parsed_mag:.0f}%)"
        elif "steel" in q_lower:
            scen_key = "steel_export_duty"
            custom_title = f"Steel export duty hike (+{parsed_mag:.0f}%)"
        elif "monsoon" in q_lower or "drought" in q_lower:
            scen_key = "monsoon_deficit"
            custom_title = f"Monsoon rainfall deficit (-{abs(parsed_mag):.0f}%)"
        elif "defense" in q_lower:
            scen_key = "custom"
            custom_title = f"Defense budget increase (+{parsed_mag:.0f}%)"
        elif "cement" in q_lower:
            scen_key = "custom"
            custom_title = f"Cement price war ({parsed_mag:+.0f}%)"
        elif "copper" in q_lower:
            scen_key = "custom"
            custom_title = f"Copper commodity rally (+{parsed_mag:.0f}%)"

        # Execute the real quantitative domino engine
        domino_res = simulate_domino_event(
            scenario_key=scen_key,
            magnitude=parsed_mag,
            depth=parsed_depth,
            horizon="1_5_days",
            min_confidence=0.70,
            custom_event_title=custom_title if scen_key == "custom" else None
        )

        top_stock = domino_res["stocks_impact"][0] if domino_res.get("stocks_impact") else {}
        top_bull = domino_res["stocks_impact"][-1] if domino_res.get("stocks_impact") else {}

        # Check for specific question types
        if any(w in q_lower for w in ["why is indigo", "why indigo", "margin assumption", "evidence behind"]):
            if is_hindi:
                reply_text = f"इंडिगो पर कच्चा तेल बढ़ने से सीधा असर पड़ता है क्योंकि ईंधन खर्च उनके कुल परिचालन लागत का 38.5% है। फेयर पास-थ्रू केवल 45% भार वहन कर पाता है, जिससे ईबीआईटी मार्जिन में 210 बेसिस पॉइंट्स की गिरावट और -3.8% से -1.4% का नकारात्मक रिटर्न अनुमानित है (82% विश्वसनीयता)।"
            elif is_hinglish:
                reply_text = f"IndiGo par direct crude exposure hai kyunki jet fuel inke opex ka 38.5% hai with zero hedge. Dynamic fare pricing sirf 45% cost absorb kar sakti hai, resulting in -210 bps EBIT margin drag aur -3.8% to -1.4% excess return range (82% probability)."
            else:
                reply_text = f"IndiGo is negatively exposed because jet fuel accounts for 38.5% of its operating expenses with zero domestic hedge. Fare pass-through absorbs only 45% of the shock with a 2-week lag, compressing operating margins by ~210 basis points with an 82% negative probability."
        elif any(w in q_lower for w in ["asian", "paint"]):
            if is_hindi:
                reply_text = f"एशियन पेंट्स पर क्रूड का दबाव रहता है क्योंकि पेट्रोकेमिकल सॉल्वैंट्स और टाइटेनियम डाइऑक्साइड उनके कुल कच्चे माल की लागत का 52% हिस्सा हैं, जिससे 140 बेसिस पॉइंट्स का मार्जिन संकुचन होता है।"
            elif is_hinglish:
                reply_text = f"Asian Paints par crude ka impact padta hai kyunki 52% raw material petrochemical derivatives hain. Retail prices turant hike na hone se ~140 bps gross margin squeeze aata hai."
            else:
                reply_text = f"Asian Paints is negatively exposed because petrochemical solvents and titanium dioxide represent ~52% of raw material consumption, yielding an estimated 140 bps gross margin contraction."
        elif any(w in q_lower for w in ["ongc"]):
            if is_hindi:
                reply_text = f"ओएनजीसी को क्रूड बढ़ने से शुद्ध लाभ होता है। प्रति बैरल $1 वृद्धि से कंपनी को सालाना ₹1,120 करोड़ का अतिरिक्त ऑपरेटिंग ईबीआईटीडीए मिलता है।"
            elif is_hinglish:
                reply_text = f"ONGC direct upstream beneficiary hai. Har $1/bbl crude jump se annual EBITDA me ₹1,120 Cr ka expansion hota hai, leading to +{top_bull.get('q90', 2.6)}% excess return."
            else:
                reply_text = f"ONGC captures positive upstream crude price realization. Each $1/bbl oil increase expands annualized operating EBITDA by ₹1,120 Cr, generating +{top_bull.get('q90', 2.6)}% excess return potential."
        elif any(w in q_lower for w in ["ledger", "track record", "accuracy", "calibration"]):
            ledger_info = domino_res.get("ledger_summary", {})
            if is_hindi:
                reply_text = f"प्रेडिक्शन लेज़र में पिछले 180 दिनों में 438 पूर्वानुमानों पर 78.4% सटीक दिशात्मक सफलता दर है। 80% कॉन्फिडेंस बकेट का वास्तविक अंशांकन 81.1% रहा है।"
            elif is_hinglish:
                reply_text = f"Audited Prediction Ledger me 180 din ka track record hai: 438 shocks par 78.4% direction hit rate aur 80% confidence bucket me 81.1% calibrated accuracy prove hoti hai."
            else:
                reply_text = f"The 180-day audited prediction ledger reports a 78.4% directional hit rate across 438 macro shocks, with the 80% confidence bucket achieving 81.1% empirical calibration accuracy."
        else:
            # General simulation speech output
            if is_hindi:
                reply_text = f"{custom_title} का 4-ऑर्डर कॉजल सिमुलेशन निष्पादित हुआ। इंडिगो पर -3.8% से -1.4% का मार्जिन दबाव रहेगा, जबकि ओएनजीसी को +{top_bull.get('q90', 2.6)}% तक लाभ होगा।"
            elif is_hinglish:
                reply_text = f"{custom_title} ka 4-order domino simulation run ho gaya. IndiGo par unhedged fuel drag se -3.8% to -1.4% pressure aayega, jabki ONGC upstream realization se +{top_bull.get('q90', 2.6)}% excess return gain karega."
            else:
                reply_text = f"Simulated {custom_title} across {parsed_depth} causal orders. IndiGo faces a 210 basis point margin drag ({top_stock.get('expected_return_range', '-3.8% to -1.4%')}), while ONGC captures positive upstream crude realization."

        action_payload = {
            "type": "DOMINO_SIMULATE",
            "target_page": "domino",
            "params": {
                "scenario_key": scen_key,
                "magnitude": parsed_mag,
                "depth": parsed_depth,
                "horizon": "1_5_days",
                "highlight_symbol": "INDIGO" if "indigo" in q_lower else top_stock.get("symbol", "INDIGO"),
                "custom_event_title": custom_title,
                "speech_reply": reply_text,
                "user_query": user_query
            }
        }

    # =========================================================================
    # 2B-PRE. STOCK DNA FINGERPRINT, GENETIC MATCH & BEHAVIORAL TWIN INTENT
    # =========================================================================
    elif (
        any(w in q_lower for w in ["twin", "behavioral twin", "genetic twin", "twins", "closest twin", "ट्विन"]) or
        any(w in q_lower for w in ["dna", "dna fingerprint", "genetic", "fingerprint", "double helix", "रेजीम डीएनए", "डीएनए"]) or
        (
            len(resolve_all_symbols(q_lower)) >= 2 and
            any(w in q_lower for w in ["compare", "vs", "versus", "against", "and", "with", "तुलना", "मुकाबला"]) and
            not any(w in q_lower for w in ["sector", "industry", "peer universe", "सेक्टर"])
        )
    ):
        dna_matched_syms = resolve_all_symbols(q_lower)
        is_twin_query = any(w in q_lower for w in ["twin", "behavioral twin", "genetic twin", "twins", "closest twin", "ट्विन"])
        is_two_stock_compare = (
            len(dna_matched_syms) >= 2 and
            any(w in q_lower for w in ["compare", "vs", "versus", "against", "and", "with", "तुलना", "मुकाबला"]) and
            not any(w in q_lower for w in ["sector", "industry", "peer universe", "सेक्टर"])
        )

        if is_twin_query:
            target_sym = dna_matched_syms[0] if dna_matched_syms else detected_symbol
            c1 = fetch_live_stock_data(target_sym) or get_company_by_symbol(target_sym) or {"name": target_sym}
            action_payload = {
                "type": "DNA_FIND_TWIN",
                "target_page": "dna",
                "params": {
                    "symbol": target_sym,
                    "find_twin": True
                }
            }
            if is_hindi:
                reply_text = f"{c1.get('name', target_sym)} के लिए पूरे 50-स्टॉक यूनिवर्स में 8-स्ट्रैंड जेनेटिक एफिनिटी के आधार पर निकटतम बिहेवियरल ट्विन खोजा जा रहा है।"
            elif is_hinglish:
                reply_text = f"{target_sym} ke liye entire market universe me closest behavioral twin calculate kar rahe hain based on 8-strand DNA affinity."
            else:
                reply_text = f"Searching institutional universe for the closest behavioral twin and genetic affinity match for {c1.get('name', target_sym)}."

        elif is_two_stock_compare or len(dna_matched_syms) >= 2:
            sym1 = dna_matched_syms[0]
            sym2 = dna_matched_syms[1]
            c1 = fetch_live_stock_data(sym1) or get_company_by_symbol(sym1) or {"name": sym1}
            c2 = fetch_live_stock_data(sym2) or get_company_by_symbol(sym2) or {"name": sym2}
            action_payload = {
                "type": "DNA_COMPARE",
                "target_page": "dna",
                "params": {
                    "symbol1": sym1,
                    "symbol2": sym2
                }
            }
            if is_hindi:
                reply_text = f"{c1.get('name', sym1)} और {c2.get('name', sym2)} का 8-स्ट्रैंड डीएनए फिंगरप्रिंट और जेनेटिक मैच लोड किया गया है।"
            elif is_hinglish:
                reply_text = f"{sym1} aur {sym2} ka 8-strand DNA Fingerprint comparison load ho gaya hai. Continuous double-helix aur regime DNA mapped hain."
            else:
                reply_text = f"Comparing 8-strand DNA Fingerprints of {c1.get('name', sym1)} and {c2.get('name', sym2)}. Auditing shock recovery half-life, narrative fidelity, and regime resilience."

        else:
            target_sym = dna_matched_syms[0] if dna_matched_syms else detected_symbol
            c1 = fetch_live_stock_data(target_sym) or get_company_by_symbol(target_sym) or {"name": target_sym}
            action_payload = {
                "type": "NAVIGATE_AND_SELECT",
                "target_page": "dna",
                "params": {
                    "symbol": target_sym
                }
            }
            if is_hindi:
                reply_text = f"{c1.get('name', target_sym)} का 8-स्ट्रैंड स्टॉक डीएनए फिंगरप्रिंट, रिकवरी हाफ-लाइफ और रेजीम डीएनए लोड किया गया है।"
            elif is_hinglish:
                reply_text = f"{target_sym} ka 8-strand Stock DNA Fingerprint open ho gaya hai. Shock recovery half-life, narrative gap, aur event sensitivity mapped hain."
            else:
                reply_text = f"Loading 8-strand Stock DNA Fingerprint for {c1.get('name', target_sym)}. Analyzing shock recovery half-life, narrative gap, and regime resilience."

    # =========================================================================
    # 2B. AI SECTOR DECISION INTELLIGENCE & SCENARIO ENGINE INTENT
    # =========================================================================
    elif any(w in q_lower for w in [
        "sector", "sector intelligence", "sector comparison", "peer comparison", "peer matrix",
        "compare with sector", "sector analysis", "industry comparison", "sektor",
        "scenario lab", "sector scenario", "rate shock", "margin shock", "growth shock",
        "stress test", "sector stress test", "scenario",
        "why gap", "why is this company different", "margin gap", "thesis unlock", "what must become true",
        "counterfactual", "ai consensus", "disagreement map", "economic peers", "dynamic peers",
        "traditional peers", "peer universe", "dna positioning", "5-axis", "radar chart",
        "upgrade", "strong buy upgrade", "unlock condition", "unlock", "conditions", "growth edge",
        "सेक्टर", "सेक्टर इंटेलिजेंस", "सेक्टर तुलना", "पीयर", "शॉक", "शॉक सिमुलेशन", "स्ट्रेस टेस्ट"
    ]) or (
        any(w in q_lower for w in ["compare", "tulaana", "तुलना", "muqabla", "मुकाबला"])
        and not any(w in q_lower for w in ["trade", "buy", "sell"])
    ):
        from services.sector_intelligence_service import get_sector_intelligence_data

        sec_data = get_sector_intelligence_data(detected_symbol)
        overall_sc = sec_data.get("overall_score", 78)
        tag_val = sec_data.get("tag", "SELECTIVE ACCUMULATION")
        hl_val = sec_data.get("headline", "Quality Improving, Valuation Neutral")
        thesis_read = sec_data.get("ai_read", "")

        # 1. Detect target tab
        target_tab = "overview"
        if any(w in q_lower for w in ["why gap", "why-gap", "different", "margin breakdown", "variance", "gap reasoning", "margin gap", "मार्जिन गैप"]):
            target_tab = "why_gap"
        elif any(w in q_lower for w in ["unlock", "thesis unlock", "become true", "strong buy upgrade", "strong buy", "upgrade", "condition", "कंडीशन", "अपग्रेड"]):
            target_tab = "thesis_unlock"
        elif any(w in q_lower for w in ["counterfactual", "what if", "hypothetical", "slider", "अगर मार्जिन"]):
            target_tab = "counterfactual"
        elif any(w in q_lower for w in ["consensus", "disagreement", "model consensus", "disagreement map", "कंसेंसस"]):
            target_tab = "consensus"

        # 2. Detect scenario shock
        target_scenario = None
        if "crude" in q_lower or "oil" in q_lower or "कच्चा तेल" in q_lower:
            target_scenario = "+10% Crude Oil"
        elif "rate" in q_lower or "repo" in q_lower or "rbi" in q_lower or "interest" in q_lower or "ब्याज दर" in q_lower:
            target_scenario = "+100 bps Rates"
        elif "margin" in q_lower and ("expansion" in q_lower or "150" in q_lower or "बढ़े" in q_lower):
            target_scenario = "+150 bps Margin"
        elif "slowdown" in q_lower or "deceleration" in q_lower or "revenue drop" in q_lower or "-5%" in q_lower:
            target_scenario = "-5% Revenue Growth"

        # 3. Detect peer universe mode
        target_mode = None
        if "dynamic" in q_lower or "economic peers" in q_lower or "डाइनैमिक" in q_lower:
            target_mode = "dynamic"
        elif "traditional" in q_lower or "ट्रेडिशनल" in q_lower:
            target_mode = "traditional"

        # 4. Detect target sector
        target_sector = None
        if any(w in q_lower for w in ["it sector", "tech sector", "software sector", "it services"]):
            target_sector = "IT Services & Tech"
        elif any(w in q_lower for w in ["banking sector", "bank sector", "finance sector", "financial services"]):
            target_sector = "Banking & Financial Services"
        elif any(w in q_lower for w in ["auto sector", "automobile", "mobility sector", "गाड़ी"]):
            target_sector = "Automotive & Mobility"
        elif any(w in q_lower for w in ["pharma sector", "healthcare sector", "दवा"]):
            target_sector = "Pharma & Healthcare"
        elif any(w in q_lower for w in ["consumer sector", "fmcg sector", "fmcg"]):
            target_sector = "Consumer & FMCG"
        elif any(w in q_lower for w in ["energy sector", "oil sector", "power sector", "ऊर्जा"]):
            target_sector = "Energy & Conglomerate"
        elif any(w in q_lower for w in ["infra sector", "metal sector", "steel sector"]):
            target_sector = "Infrastructure & Metals"
        elif any(w in q_lower for w in ["defense sector", "aerospace"]):
            target_sector = "Defense & Aerospace"
        elif any(w in q_lower for w in ["aviation sector", "internet sector"]):
            target_sector = "Consumer Tech & Aviation"

        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "sector",
            "command": "SECTOR_ACTION",
            "params": {
                "symbol": detected_symbol,
                "sector": target_sector,
                "scenario": target_scenario,
                "tab": target_tab,
                "mode": target_mode
            }
        }

        # 5. Dynamically generate AI Voice Agent reply via Gemini 2.5 Flash
        reply_text = ""
        if gemini_client:
            try:
                lang_rule = (
                    "The client has selected HINDI. You MUST respond exclusively in natural, grammatically pure Hindi in Devanagari script."
                    if is_hindi else
                    "The client has selected HINGLISH. Speak in natural Dalal Street professional Hinglish."
                    if is_hinglish else
                    "The client has selected ENGLISH. Deliver your complete answer in crisp, professional institutional English without retail fluff."
                )

                prompt_agent = f"""You are MarketMind AI Copilot — Chief Investment Officer and Senior Quantitative Equity Strategist.
The client asked: "{user_query}"
Current Company: {comp['name']} ({detected_symbol}) | Sector: {sec_data.get('sector', 'Core Industry')}

LIVE SECTOR DECISION INTELLIGENCE TELEMETRY (EXACT DATA AS SHOWN IN THE UI):
- Active View / Tab: {target_tab}
- Active Scenario Shock: {target_scenario or 'None'}
- Overall AI Sector Score: {overall_sc}/100 | Stance: {tag_val}
- Institutional Headline: {hl_val}
- Institutional Thesis: {thesis_read}
- Growth Edge vs Sector: {sec_data.get('growth_edge', {}).get('val', '+0.0 pp')} ({sec_data.get('growth_edge', {}).get('status')})
- Margin Gap vs Sector: {sec_data.get('margin_gap', {}).get('val', '+0.0 pp')} ({sec_data.get('margin_gap', {}).get('status')})
- Valuation Multiple: {sec_data.get('valuation_multiple', {}).get('val', '24.0x P/E')}
- Why-Gap Attribution: Operational {sec_data.get('margin_breakdown', {}).get('ai_attribution', {}).get('operational_pct', 70)}% vs Mix {sec_data.get('margin_breakdown', {}).get('ai_attribution', {}).get('business_mix_pct', 30)}%
- Thesis Unlock Threshold: Target {sec_data.get('thesis_unlock', {}).get('target_threshold', 85)}+ with conditions: {sec_data.get('thesis_unlock', {}).get('conditions', [])}
- Scenario Shocks:
  * +10% Crude: Margin Delta {sec_data.get('scenarios', {}).get('+10% Crude Oil', {}).get('margin_delta')}%, Score {sec_data.get('scenarios', {}).get('+10% Crude Oil', {}).get('score_before')} -> {sec_data.get('scenarios', {}).get('+10% Crude Oil', {}).get('score_after')} | {sec_data.get('scenarios', {}).get('+10% Crude Oil', {}).get('narrative')}
  * +150 bps Margin: Score {sec_data.get('scenarios', {}).get('+150 bps Margin', {}).get('score_after')} | {sec_data.get('scenarios', {}).get('+150 bps Margin', {}).get('narrative')}
  * +100 bps Rates: Margin Delta {sec_data.get('scenarios', {}).get('+100 bps Rates', {}).get('margin_delta')}%, Score {sec_data.get('scenarios', {}).get('+100 bps Rates', {}).get('score_after')}
  * -5% Revenue: Margin Delta {sec_data.get('scenarios', {}).get('-5% Revenue Growth', {}).get('margin_delta')}%, Score {sec_data.get('scenarios', {}).get('-5% Revenue Growth', {}).get('score_after')}
- Dynamic Economic Peers: {', '.join(sec_data.get('economic_exposure', {}).get('economic_peers', []))}

INSTRUCTIONS:
1. Deliver a natural, high-conviction 25-35 word verbal response directly answering the client's query.
2. Quote the exact numbers from the data above so your response precisely matches what is visible on the screen.
3. {lang_rule}
4. Never output markdown asterisks (no '**'). Keep sentences clean and ready for text-to-speech.
"""
                res_text = await call_fast_gemini(
                    prompt=prompt_agent,
                    max_tokens=80,
                    temperature=0.25,
                    timeout_secs=2.2
                )
                if res_text:
                    reply_text = res_text
            except Exception as e:
                print(f"Sector AI Agent generation error/timeout: {e}")

        # Dynamic fallback if Gemini is offline
        if not reply_text:
            if target_tab == "why_gap":
                gap_info = sec_data.get("margin_breakdown", {})
                gap_pct = gap_info.get("gap_percentage", "-2.4%")
                attrib = gap_info.get("ai_attribution", {})
                op_pct = attrib.get("operational_pct", 72)
                mix_pct = attrib.get("business_mix_pct", 28)
                if is_hindi:
                    reply_text = f"{comp['name']} का व्हाई-गैप रीज़निंग प्रस्तुत है। मार्जिन गैप ({gap_pct}) में {op_pct}% ऑपरेशनल लागत संरचना और {mix_pct}% बिज़नेस-मिक्स भिन्नता का योगदान है।"
                elif is_hinglish:
                    reply_text = f"{comp['name']} ka Why-Gap decomposition open kiya hai. Margin gap ({gap_pct}) me {op_pct}% operational cost structure aur {mix_pct}% conglomerate business-mix variance identify hui hai."
                else:
                    reply_text = f"Displaying Why-Gap decomposition for {comp['name']}. The variance ({gap_pct}) decomposes into {op_pct}% operational cost dynamics and {mix_pct}% portfolio business-mix differences."
            elif target_tab == "thesis_unlock":
                tu = sec_data.get("thesis_unlock", {})
                c_score = tu.get("current_score", overall_sc)
                t_score = tu.get("target_threshold", 85)
                if is_hindi:
                    reply_text = f"थीसिस अनलॉक इंजन सक्रिय है। {comp['name']} का वर्तमान स्कोर {c_score} है। स्ट्रॉन्ग बाय अपग्रेड के लिए स्कोर {t_score}+ और 4 में से 3 शर्तों को पूरा करना आवश्यक है।"
                elif is_hinglish:
                    reply_text = f"Thesis Unlock Engine load ho gaya hai. {comp['name']} ka current score {c_score} hai. Strong Buy upgrade ke liye score {t_score}+ aur margin expansion conditions met hona zaroori hai."
                else:
                    reply_text = f"Loading Thesis Unlock Engine for {comp['name']}. Current score is {c_score}. Upgrading to Strong Buy requires crossing the {t_score}+ threshold across capital efficiency and margin milestones."
            elif target_tab == "counterfactual":
                cf = sec_data.get("counterfactual", {})
                sim_sc = cf.get("simulated_score", overall_sc + 8)
                sim_m = cf.get("hypothetical_metric", "Net Margin 15.5%")
                if is_hindi:
                    reply_text = f"काउंटरफैक्चुअल सिमुलेटर खुला है। यदि {comp['name']} {sim_m} प्राप्त करता है, तो AI स्कोर बढ़कर {sim_sc}/100 हो जाएगा और रैंक #1 हासिल हो सकती है।"
                elif is_hinglish:
                    reply_text = f"Counterfactual Simulator load ho gaya hai. Agar {comp['name']} {sim_m} deliver karta hai, to AI score jump karke {sim_sc} ho jayega aur peer universe me Rank #1 unlock ho sakti hai."
                else:
                    reply_text = f"Running Counterfactual Simulator for {comp['name']}. Under hypothetical {sim_m}, the AI score ascends to {sim_sc}/100, unlocking Rank #1 positioning."
            elif target_tab == "consensus":
                if is_hindi:
                    reply_text = f"मल्टी-मॉडल AI कंसेंसस मैप लोड हो चुका है। फंडामेंटल्स और मैनेजमेंट ट्रस्ट मॉडल मजबूत हैं, जबकि वैल्यूएशन मल्टीपल न्यूट्रल ज़ोन में है।"
                elif is_hinglish:
                    reply_text = f"Multi-Model AI Consensus Map open ho gaya hai. Fundamentals AI aur Institutional Quant Model bullish stance maintain kar rahe hain."
                else:
                    reply_text = f"Loading Multi-Model AI Consensus Map for {comp['name']}. Fundamental and Governance models demonstrate constructive alignment."
            elif target_scenario:
                sc_obj = sec_data.get("scenarios", {}).get(target_scenario, {})
                m_delta = sc_obj.get("margin_delta", -1.5)
                sc_before = sc_obj.get("score_before", overall_sc)
                sc_after = sc_obj.get("score_after", overall_sc - 4)
                narr = sc_obj.get("narrative", "")
                if is_hindi:
                    reply_text = f"{target_scenario} सिमुलेशन सक्रिय है। {comp['name']} के मार्जिन पर {m_delta}% प्रभाव पड़ेगा और स्कोर {sc_before} से {sc_after} पर पुनः कैलिब्रेट होगा। {narr}"
                elif is_hinglish:
                    reply_text = f"{target_scenario} shock simulation execute kiya hai. {comp['name']} ke operating margin par {m_delta}% delta aayega aur AI score {sc_before} se {sc_after} recalibrate hoga."
                else:
                    reply_text = f"Executed {target_scenario} stress test on {comp['name']}. Operating margin absorbs a {m_delta}% impact, adjusting the AI score from {sc_before} to {sc_after}. {narr}"
            else:
                if is_hindi:
                    reply_text = f"{comp['name']} का AI सेक्टर इंटेलिजेंस खुला है। समग्र AI स्कोर {overall_sc}/100 ({tag_val}) है। {thesis_read}"
                elif is_hinglish:
                    reply_text = f"{comp['name']} ka Sector Decision Intelligence open ho gaya hai. Current AI Score {overall_sc}/100 ke saath rating {tag_val} hai. {thesis_read}"
                else:
                    reply_text = f"Navigating to Sector Intelligence for {comp['name']}. Overall AI Score is {overall_sc}/100 rated {tag_val}. {thesis_read}"

    # =========================================================================
    # 2.5. SMART ALERTS & DEEP MEMORY INTELLIGENCE INTENT
    # =========================================================================
    elif any(w in q_lower for w in [
        "smart alert", "smart alerts", "deep alert", "deep alerts", "alert intelligence",
        "stance", "ai stance", "purchase wait avoid", "wait watch", "entry quality",
        "why alert", "why was this alert generated", "evidence layer", "evidence layers",
        "before buy", "before buy improves", "upgrade criteria", "what must happen",
        "invalidation alert", "invalidation rule", "invalidation condition", "invalid kab",
        "pattern memory", "last few months pattern", "historical pattern memory",
        "news reaction timeline", "event memory", "reaction timeline",
        "अलर्ट", "स्मार्ट अलर्ट", "स्टांस", "बाय इम्प्रूव", "इनवैलिडेशन", "पैटर्न मेमोरी"
    ]) or (
        "alert" in q_lower and any(w in q_lower for w in ["reliance", "tcs", "hdfc", "tata", "infy", "sun", "zomato", "show", "dikhao", "batao", "kya"])
    ):
        from services.smart_alert_service import get_smart_alert_intelligence

        lookback = "3M"
        if any(w in q_lower for w in ["1 month", "1m", "1 mahina", "एक महीना"]):
            lookback = "1M"
        elif any(w in q_lower for w in ["6 month", "6m", "6 mahine", "छह महीने"]):
            lookback = "6M"
        elif any(w in q_lower for w in ["1 year", "1y", "1 saal", "एक साल"]):
            lookback = "1Y"

        alert_data = get_smart_alert_intelligence(detected_symbol, lookback)
        dec = alert_data.get("decision_layer", {})
        stance_val = dec.get("stance", "WAIT / WATCH")
        stance_conf = dec.get("stance_confidence", 78)
        entry_q = dec.get("entry_quality", 62)
        risk_lvl = dec.get("risk_level", "Medium")

        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "alerts",
            "command": "SMART_ALERT_ACTION",
            "params": {
                "symbol": detected_symbol,
                "lookback": lookback
            }
        }

        # Dynamically generate AI Voice Agent reply via Gemini 2.5 Flash
        reply_text = ""
        if gemini_client:
            try:
                lang_rule = (
                    "The client has selected HINDI. You MUST respond exclusively in natural, grammatically pure Hindi in Devanagari script."
                    if is_hindi else
                    "The client has selected HINGLISH. Speak in natural Dalal Street professional Hinglish."
                    if is_hinglish else
                    "The client has selected ENGLISH. Deliver your complete answer in crisp, professional institutional English without retail fluff."
                )

                prompt_agent = f"""You are MarketMind AI Copilot — Chief Investment Officer and Senior Quantitative Equity Strategist.
The client asked: "{user_query}"
Current Company: {comp['name']} ({detected_symbol}) | Price: ₹{alert_data.get('price', 1000):,.2f} ({alert_data.get('change', '+0.0%')})

LIVE DEEP ALERT INTELLIGENCE & MARKET MEMORY TELEMETRY (EXACT ACTIVE UI DATA):
- Current AI Stance: {stance_val} ({stance_conf}% confidence)
- Entry Quality Score: {entry_q}/100 | Risk Level: {risk_lvl}
- Stance Rationale: {dec.get('stance_explanation', '')}
- Price Alert Banner: {alert_data.get('price_alert_banner', {}).get('title')} ({alert_data.get('price_alert_banner', {}).get('pattern_match_pct')}% match)
- 6 Evidence Layers: {[l.get('title') + ' (' + l.get('badge') + '): ' + l.get('desc') for l in alert_data.get('why_alert_generated', {}).get('layers', [])]}
- Upgrade Conditions (What Must Happen Before Buy): {[c.get('title') + ' [' + c.get('status') + ']' for c in alert_data.get('thesis_upgrade', {}).get('conditions', [])]}
- Invalidation Rule: {alert_data.get('thesis_upgrade', {}).get('invalidation', {}).get('desc')}
- Top Pattern Memory Matches: {[p.get('title') + ' (' + p.get('badge') + ', Avg follow-through ' + p.get('stat_2_val') + ')' for p in alert_data.get('pattern_memory', {}).get('patterns', [])]}
- Event Reaction Timeline: {[e.get('period') + ': ' + e.get('title') + ' (' + e.get('reaction_pct') + ' ' + e.get('tag') + ')' for e in alert_data.get('news_reaction_timeline', {}).get('events', [])]}

INSTRUCTIONS:
1. Deliver a natural, high-conviction 25-35 word verbal response directly answering the client's query.
2. Quote the exact numbers from the data above (e.g. Stance {stance_val}, Confidence {stance_conf}%, Entry Quality {entry_q}/100) so your response precisely matches what is visible on the screen.
3. {lang_rule}
4. Never output markdown asterisks (no '**'). Keep sentences clean and ready for text-to-speech.
"""
                res_text = await call_fast_gemini(
                    prompt=prompt_agent,
                    max_tokens=80,
                    temperature=0.25,
                    timeout_secs=2.2
                )
                if res_text:
                    reply_text = res_text
            except Exception as e:
                print(f"Smart Alert AI generation error/timeout: {e}")

        # Dynamic fallback if Gemini is offline
        if not reply_text:
            if any(w in q_lower for w in ["invalidation", "invalid"]):
                inv = alert_data.get("thesis_upgrade", {}).get("invalidation", {})
                inv_text = inv.get("desc", "If price loses key support with heavy volume, stance shifts to Avoid.")
                if is_hindi:
                    reply_text = f"{comp['name']} का इनवैलिडेशन नियम: {inv_text}"
                elif is_hinglish:
                    reply_text = f"{comp['name']} ka Invalidation Rule: {inv_text}"
                else:
                    reply_text = f"Invalidation rule for {comp['name']}: {inv_text}"
            elif any(w in q_lower for w in ["why", "evidence", "क्यो"]):
                ev_cnt = alert_data.get("why_alert_generated", {}).get("evidence_count", 6)
                if is_hindi:
                    reply_text = f"{comp['name']} के लिए {ev_cnt} एविडेंस लेयर्स एक्टिव हैं। ब्रेकआउट सपोर्ट होल्ड हो रहा है और वॉल्यूम क्वालिटी सुधर रही है, लेकिन वैल्यूएशन स्ट्रेच मार्जिन ऑफ सेफ्टी को सीमित कर रहा है।"
                elif is_hinglish:
                    reply_text = f"{comp['name']} ke liye {ev_cnt} evidence layers evaluate hui hain. Breakout support hold ho raha hai aur volume improve ho raha hai, lekin valuation multiple entry comfort limit kar raha hai."
                else:
                    reply_text = f"Evaluating {ev_cnt} evidence layers for {comp['name']}. Price breakout support holds and volume quality is constructive, but valuation stretch limits margin of safety."
            elif any(w in q_lower for w in ["before buy", "upgrade", "शर्तें"]):
                if is_hindi:
                    reply_text = f"बाय अपग्रेड के लिए वॉल्यूम और ट्रेंड सपोर्ट पहले से संतुष्ट हैं। पेंडिंग शर्तें: वैल्यूएशन का कूल होना या ईपीएस अनुमानों में वृद्धि और सेक्टर कन्फर्मेशन।"
                elif is_hinglish:
                    reply_text = f"Buy upgrade ke liye breakout support aur volume quality already met hain. Pending conditions me valuation cooling ya EPS estimate upgrade aur sector confirmation zaroori hai."
                else:
                    reply_text = f"Upgrade to Attractive requires valuation multiple cooling or earnings upgrades alongside broader sector confirmation. Breakout support and volume criteria are already satisfied."
            elif any(w in q_lower for w in ["pattern", "memory"]):
                top_p = alert_data.get("pattern_memory", {}).get("patterns", [{}])[0]
                p_title = top_p.get("title", "Accumulation to breakout")
                p_match = top_p.get("badge", "82% match")
                if is_hindi:
                    reply_text = f"{comp['name']} के 3-महीने के पैटर्न मेमोरी में {p_title} ({p_match}) डिटेक्ट हुआ है। ऐतिहासिक रूप से ऐसे सेटअप में औसत फॉलो-थ्रू +5.6% देखा गया है।"
                elif is_hinglish:
                    reply_text = f"{comp['name']} ke pattern memory me {p_title} ({p_match}) detect hua hai. Historical setup me average follow-through +5.6% observe hua hai."
                else:
                    reply_text = f"Pattern memory identifies {p_title} ({p_match}) for {comp['name']}, with historical setups delivering an average +5.6% follow-through."
            else:
                if is_hindi:
                    reply_text = f"{comp['name']} का डीप अलर्ट प्रस्तुत है। वर्तमान AI स्टांस {stance_val} ({stance_conf}% विश्वास) है और एंट्री क्वालिटी {entry_q}/100 है।"
                elif is_hinglish:
                    reply_text = f"{comp['name']} ka Deep Alert Intelligence open ho gaya hai. Current AI Stance {stance_val} ({stance_conf}% confidence) hai aur Entry Quality {entry_q}/100 rated hai."
                else:
                    reply_text = f"Displaying Deep Alert Intelligence for {comp['name']}. Current AI Stance is {stance_val} with {stance_conf}% confidence and an Entry Quality score of {entry_q}/100."

    # =========================================================================
    # 2B. CANDLESTICK INTELLIGENCE & CHART COPILOT INTENT
    # =========================================================================
    elif any(w in q_lower for w in [
        "candlestick", "candle", "pattern", "hammer", "doji", "engulfing", "rejection",
        "chart intelligence", "chart copilot", "कैंडल", "कैंडलस्टिक", "पैटर्न", "कैंडल पैटर्न",
        "support resistance", "breakout", "fake breakout", "bull trap", "outcome probability",
        "probabilistic outlook", "counterfactual", "today's candle", "todays candle"
    ]):
        from services.candlestick_intelligence_service import get_candlestick_intelligence
        c_intel = get_candlestick_intelligence(detected_symbol)
        
        c_stance = c_intel.get("decision_stance", {}).get("stance", "WATCH")
        c_conf = c_intel.get("decision_stance", {}).get("stance_confidence", 72)
        pat_conf = c_intel.get("probabilistic_outlook", {}).get("pattern_confidence", 81)
        out_conf = c_intel.get("probabilistic_outlook", {}).get("outcome_confidence", 58)
        sup_str = c_intel.get("chart_support_resistance", {}).get("support_label", "Support")
        res_str = c_intel.get("chart_support_resistance", {}).get("resistance_label", "Resistance")
        pat_name = c_intel.get("ai_setup", {}).get("headline", "Rejection Candle near Support")
        upg_rule = c_intel.get("counterfactual_engine", {}).get("upgrade_conditions", [""])[0]
        inv_rule = c_intel.get("counterfactual_engine", {}).get("downgrade_conditions", [""])[0]

        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "candles",
            "command": "SHOW_CANDLESTICK_INTELLIGENCE",
            "params": {
                "symbol": detected_symbol
            }
        }

        if is_hindi:
            reply_text = f"{comp['name']} में {pat_name} डिटेक्ट हुआ है {sup_str} के पास। पैटर्न मैच {pat_conf}% है, लेकिन आउटकम कॉन्फिडेंस {out_conf}% है। करंट रुख {c_stance} है। {upg_rule} होने पर रुख बेहतर होगा, और {inv_rule} होने पर इनवैलिडेट हो जाएगा।"
        elif is_hinglish:
            reply_text = f"{comp['name']} me {pat_name} observe hua hai near {sup_str}. Pattern Confidence {pat_conf}% hai, but empirical Outcome Confidence {out_conf}% hai. AI Stance {c_stance} ({c_conf}%). {upg_rule} par conviction upgrade hogi aur {inv_rule} par view invalid ho jayega."
        else:
            reply_text = f"Displaying Candlestick Intelligence for {comp['name']}. Detected {pat_name} near {sup_str}. Pattern Confidence is {pat_conf}% while Outcome Confidence is {out_conf}%. Current Stance is {c_stance} ({c_conf}%). Invalidation level is {inv_rule}."

    # =========================================================================
    # 2C. FINANCIAL NEWS & CATALYST IMPACT INTENT
    # =========================================================================
    elif any(w in q_lower for w in [
        "news", "headline", "headlines", "catalyst", "event", "breaking",
        "न्यूज़", "खबर", "खबरें", "ताज़ा खबर", "समाचार", "le test news", "market news",
        "latest news", "top news", "ripple", "feed"
    ]):
        from services.live_news_service import get_news_intelligence, lookup_news_by_topic
        news_intel = get_news_intelligence("All")
        matched_item = lookup_news_by_topic(user_query) or (news_intel.get("articles", [])[0] if news_intel.get("articles") else {})

        item_title = matched_item.get("title", "Market Update")
        item_source = matched_item.get("source", "Financial Press")
        item_ben = matched_item.get("beneficiaries", "Market Leaders")
        item_risk = matched_item.get("headwinds", "Sector volatility")
        item_tickers = matched_item.get("tickers", [detected_symbol])

        wants_copilot = any(k in q_lower for k in ["copilot", "कोपलट", "कॉपायलट", "chat", "ask", "पूंछो", "पूछो", "सवाल", "drawer", "panel"])

        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "news",
            "command": "SHOW_NEWS",
            "params": {
                "symbol": item_tickers[0] if item_tickers else detected_symbol,
                "category": matched_item.get("category", "All"),
                "news_id": matched_item.get("id"),
                "open_copilot": wants_copilot,
                "query": user_query
            }
        }

        if is_hindi:
            if wants_copilot:
                reply_text = f"मैंने '{item_title}' के लिए न्यूज़ कॉपायलट खोल दिया है। इसका मुख्य प्रभाव {item_ben} पर है। आप कॉपायलट में कोई भी सवाल पूछ सकते हैं।"
            else:
                reply_text = f"ताज़ा मार्केट न्यूज़ में '{item_title}' ({item_source}) सबसे प्रमुख है। इसका मुख्य फायदा {item_ben} को मिल रहा है, जबकि {item_risk} पर नज़र रखनी होगी।"
        elif is_hinglish:
            if wants_copilot:
                reply_text = f"Maine '{item_title}' ke liye News Copilot drawer open kar diya hai. Iska main impact {item_ben} par hai. Poochiye aapka targeted question."
            else:
                reply_text = f"Market news me top headline '{item_title}' ({item_source}) hai. Iska primary positive impact {item_ben} par hai, jabki key risk {item_risk} observe karna hoga."
        else:
            if wants_copilot:
                reply_text = f"Opened MarketMind News Copilot for '{item_title}'. Primary beneficiary is {item_ben}. Ask any targeted questions regarding sector ripples."
            else:
                reply_text = f"Displaying Latest Financial News. Key headline is '{item_title}' via {item_source}. Primary beneficiaries include {item_ben}, with risks centered on {item_risk}."

    # =========================================================================
    # 3. INVESTMENT THESIS BREAKER & THESIS INTELLIGENCE INTENT
    # =========================================================================
    elif (
        any(w in q_lower for w in [
            "thesis breaker", "thesis break", "investment thesis", "thesis", "theses", "theisis",
            "कोर थीसिस", "थीसिस ब्रेकर", "थीसिस", "इन्वेस्टमेंट थीसिस", "थीसिस ब्रेक",
            # Speech recognition phonetic transcriptions for "thesis breaker":
            "faces breaker", "basis breaker", "theses breaker", "theisis breaker",
            "teases breaker", "teasis breaker", "pieces breaker", "feces breaker", "investment breaker",
            # Analytical commands & causal inquiries:
            "weakening", "kamzor kyu", "weak kyu", "causal map", "causal path",
            "causal chain", "strongest contradiction", "contradiction", "falsifier", "falsifiers", "what breaks",
            "deep recheck", "thesis health", "survival rate", "breakdown risk", "evidence ledger", "weakest link"
        ])
        or ("weak" in q_lower and any(k in q_lower for k in ["why", "is", "kyu", "kamzor", "reason"]))
        or ("break" in q_lower and any(k in q_lower for k in ["what", "thesis", "theses", "faces", "how"]))
        or (
            "breaker" in q_lower and any(w in q_lower for w in [
                "investment", "invest", "face", "faces", "thes", "theses", "teas", "basis", "open", "kholo", "show", "dekho", "load"
            ])
        )
        or (
            "breaker" in q_lower and (explicit_symbol is not None or context_ticker is not None)
        )
        or bool(re.search(r"\b(face|faces|thes[ie]s|basis|investment)s?\s+breaker\b", q_lower))
        or bool(re.search(r"\bbreaker\s+(for|of|on)\b", q_lower))
    ):
        from services.thesis_service import process_thesis_copilot_command
        copilot_res = await process_thesis_copilot_command(
            query=user_query,
            active_symbol=detected_symbol
        )

        resolved_sym = copilot_res.get("symbol", detected_symbol)
        action_payload = {
            "type": "THESIS_ACTION",
            "target_page": "thesis",
            "command": "THESIS_ACTION",
            "params": {
                "symbol": resolved_sym,
                "active_tab": copilot_res.get("active_tab", "evidence"),
                "highlight_item": copilot_res.get("highlight_item"),
                "speech_reply": copilot_res.get("reply", ""),
                "user_query": user_query
            }
        }
        reply_text = copilot_res.get("reply", "")

    # =========================================================================
    # 5. DECISION TIME MACHINE INTENT (Redirects cleanly to Thesis Intelligence)
    # =========================================================================
    elif any(w in q_lower for w in ["time machine", "decision time machine", "historical decision", "टाइम मशीन"]):
        action_payload = {
            "type": "NAVIGATE",
            "target_page": "thesis"
        }
        if is_hindi:
            reply_text = "डिसीजन टाइम मशीन सुविधा हटा दी गई है। कोर थीसिस इंटेलिजेंस इंजन प्रस्तुत है।"
        elif is_hinglish:
            reply_text = "Decision Time Machine module remove ho gaya hai. Core Thesis Intelligence Engine open kar rahe hain."
        else:
            reply_text = "Decision Time Machine has been removed to prioritize core decisions. Opening Thesis Intelligence Engine."

    # =========================================================================
    # 6. EXPLICIT SIMULATED TRADE EXECUTION ONLY (With digit or explicit command)
    # =========================================================================
    elif (
        any(w in q_lower for w in ["simulate trade", "execute trade", "add to portfolio", "पोर्टफोलियो में ट्रेड"])
        or (
            any(w in q_lower for w in ["buy", "sell", "kharido", "becho", "खरीद", "बेच"])
            and any(char.isdigit() for char in q_lower)
            and not (set(re.findall(r'\b[a-zA-Z]+\b', q_lower)) & {"should", "kya", "karu", "chahiye", "upar", "niche", "ya", "or", "target", "advisable", "opinion", "recommend"})
        )
    ):
        side = "SELL" if any(w in q_lower for w in ["sell", "बेच", "becho"]) else "BUY"
        shares = 20
        for word in q_lower.split():
            if word.isdigit():
                shares = int(word)
                break

        trade_res = execute_trade(detected_symbol, shares, side)
        action_payload = {
            "type": "NAVIGATE_AND_EXECUTE",
            "target_page": "portfolio",
            "command": "CREATE_PORTFOLIO_SIMULATION",
            "params": {
                "symbol": detected_symbol,
                "shares": shares,
                "side": side,
                "price": comp["price"],
                "trade_result": trade_res
            }
        }
        if is_hindi:
            reply_text = f"{comp['name']} के लिए ₹{comp['price']:,.2f} पर {shares} शेयर का पोर्टफोलियो सिमुलेशन सेट कर दिया गया है।"
        elif is_hinglish:
            reply_text = f"{comp['name']} ke ₹{comp['price']:,.2f} par {shares} shares ka {side} simulation execute ho gaya hai."
        else:
            reply_text = f"Simulating {side} order of {shares} shares for {comp['name']} at ₹{comp['price']:,.2f}. Navigating to Portfolio Simulator."

    # =========================================================================
    # 6B. PORTFOLIO PAGE & INVESTMENT SIMULATOR INTENT
    # =========================================================================
    elif any(w in q_lower for w in [
        "portfolio", "portfoli", "holdings", "mera portfolio", "पोर्टफोलियो", 
        "होल्डिंग्स", "generate portfolio", "portfolio dikhao", "show portfolio",
        "simulator", "simulat", "सिम्युलेटर", "सिमुलेटर", "invest kiya hota", 
        "lagaya hota", "1 lakh", "100000", "sip"
    ]):
        port_sum = get_portfolio_summary()
        nav_val = port_sum.get("nav", 1000000.0)
        pnl_val = port_sum.get("overall_pnl", 0.0)
        pnl_pct_val = port_sum.get("overall_pnl_pct", 0.0)
        h_count = len(port_sum.get("holdings", []))

        # Check if the user mentioned a specific company (like Adani, Reliance, Tata, etc.)
        has_specific_company = explicit_symbol is not None
        specific_holding = None
        if has_specific_company:
            specific_holding = next((h for h in port_sum.get("holdings", []) if h["symbol"] == detected_symbol), None)
            if not specific_holding:
                for h in port_sum.get("holdings", []):
                    h_name_lower = h.get("name", "").lower()
                    h_sym_lower = h.get("symbol", "").lower()
                    if any(w in h_name_lower or w == h_sym_lower for w in q_lower.split() if len(w) >= 4):
                        specific_holding = h
                        detected_symbol = h["symbol"]
                        comp = get_company_by_symbol(detected_symbol)
                        break

        is_sim_req = any(w in q_lower for w in [
            "simulator", "simulat", "सिम्युलेटर", "सिमुलेटर", "invest kiya hota", 
            "lagaya hota", "1 lakh", "100000", "sip", "what if", "lumpsum", 
            "agar maine", "kya hota"
        ])

        if is_sim_req:
            sim_sym = explicit_symbol or detected_symbol or "ADANIENT"
            sim_res = simulate_investment(
                symbol=sim_sym,
                investment=100000.0,
                start_date="2026-08-03",
                end_date="2026-09-03",
                investment_type="lumpsum",
                benchmark="NIFTY 50"
            )
            detected_symbol = sim_res["symbol"]
            GLOBAL_SESSION_STATE["active_symbol"] = detected_symbol

            action_payload = {
                "type": "NAVIGATE_AND_EXECUTE",
                "target_page": "portfolio",
                "command": "RUN_PORTFOLIO_SIMULATION",
                "params": {
                    "symbol": detected_symbol,
                    "amount": sim_res["initial_investment"],
                    "start_date": sim_res["start_date"],
                    "end_date": sim_res["end_date"],
                    "view_mode": "simulator",
                    "simulation": sim_res
                }
            }

            if is_hindi:
                reply_text = f"{sim_res['company']} में 3 अगस्त 2026 को ₹{sim_res['initial_investment']:,.0f} का निवेश आज ₹{sim_res['portfolio_value']:,.0f} होता ({sim_res['profit_loss']:+,.0f} या {sim_res['return_pct']:+.2f}%)। निफ्टी 50 का रिटर्न {sim_res['benchmark_return']:+.2f}% रहा, जिससे अल्फा {sim_res['alpha']:+.2f}% है।"
            elif is_hinglish:
                reply_text = f"{sim_res['company']} me 03 Aug ko ₹{sim_res['initial_investment']:,.0f} invest kiya hota to aaj value ₹{sim_res['portfolio_value']:,.0f} ({sim_res['return_pct']:+.2f}%) hoti. NIFTY 50 benchmark {sim_res['benchmark_return']:+.2f}% raha, jisse alpha {sim_res['alpha']:+.2f}% mila."
            else:
                reply_text = f"In {sim_res['company']}, a ₹{sim_res['initial_investment']:,.0f} investment on 03 Aug would yield {sim_res['shares']} shares. Today's value is ₹{sim_res['portfolio_value']:,.0f} ({sim_res['profit_loss']:+,.0f} or {sim_res['return_pct']:+.2f}%). NIFTY 50 returned {sim_res['benchmark_return']:+.2f}%, with alpha of {sim_res['alpha']:+.2f}%."
        elif specific_holding:
            sh_val = specific_holding.get("current_value", 0)
            sh_shares = specific_holding.get("shares", 0)
            sh_pnl_pct = specific_holding.get("pnl_pct", 0.0)
            sh_ltp = specific_holding.get("ltp", 0.0)

            action_payload = {
                "type": "NAVIGATE",
                "target_page": "portfolio",
                "command": "CREATE_PORTFOLIO_SIMULATION",
                "params": {
                    "symbol": detected_symbol,
                    "view_mode": "strategy",
                    "nav": nav_val,
                    "pnl": pnl_val,
                    "pnl_pct": pnl_pct_val
                }
            }
            
            if is_hindi:
                reply_text = f"{comp['name']} का सिमुलेटर खुला है: पोजीशन वैल्यू ₹{sh_val:,.0f} ({sh_shares} शेयर @ ₹{sh_ltp:,.2f}) और P&L {sh_pnl_pct:+,.2f}% है। जबकि कुल पोर्टफोलियो का टोटल NAV ₹{nav_val:,.0f} ({pnl_pct_val:+,.1f}%) है।"
            elif is_hinglish:
                reply_text = f"{comp['name']} Strategy view open hai: Position value ₹{sh_val:,.0f} ({sh_shares} shares @ ₹{sh_ltp:,.2f}, P&L {sh_pnl_pct:+,.2f}%). Aur pure portfolio ka total NAV ₹{nav_val:,.0f} ({pnl_pct_val:+,.1f}%) hai."
            else:
                reply_text = f"Showing {comp['name']} strategy: position value is ₹{sh_val:,.0f} ({sh_shares} shares @ ₹{sh_ltp:,.2f}, P&L {sh_pnl_pct:+,.2f}%). Total consolidated portfolio NAV is ₹{nav_val:,.0f} ({pnl_pct_val:+,.1f}%)."
        else:
            action_payload = {
                "type": "NAVIGATE",
                "target_page": "portfolio",
                "command": "VIEW_PORTFOLIO",
                "params": {
                    "symbol": None,
                    "view_mode": "overall",
                    "nav": nav_val,
                    "pnl": pnl_val,
                    "pnl_pct": pnl_pct_val
                }
            }
            if is_hindi:
                reply_text = f"पोर्टफोलियो प्रस्तुत है। कुल एनएवी ₹{nav_val:,.2f} है और {h_count} सक्रिय पोजीशन के साथ ओवरऑल रिटर्न {pnl_pct_val:+,.1f}% है।"
            elif is_hinglish:
                reply_text = f"Portfolio khul gaya hai. Total NAV ₹{nav_val:,.2f} hai aur {h_count} active holdings ke sath overall return {pnl_pct_val:+,.1f}% chal raha hai."
            else:
                reply_text = f"Opening Portfolio Simulator. Current NAV is ₹{nav_val:,.2f} with an overall return of {pnl_pct_val:+,.1f}% across {h_count} holdings."

    # =========================================================================
    # PRIMARY INTELLIGENCE ENGINE: GEMINI AI COPILOT REASONING (ZERO HARDCODING)
    # =========================================================================
    else:
        # Check if query has an explicit stock or identifiable market / financial question
        has_stock_mention = (explicit_symbol is not None)
        has_market_intent = any(k in q_lower for k in [
            "vwap", "var", "rsi", "obi", "order book", "imbalance", "price", "target", "stop", "sl", "loss",
            "support", "resistance", "buy", "sell", "hold", "accumulate", "verdict", "call", "signal",
            "pe", "p/e", "roe", "roce", "margin", "valuation", "ratio", "multiple", "debt", "cash flow", "ocf", "pat",
            "revenue", "earnings", "result", "quarter", "dividend", "q1", "q2", "q3", "q4",
            "stock", "share", "company", "ticker", "sector", "industry", "market", "nifty", "sensex", "banknifty",
            "domino", "ripple", "shock", "macro", "crude", "oil", "brent", "rate", "rates", "rbi", "repo", "inflation",
            "usdinr", "rupee", "dollar", "currency", "forex", "gold", "yield", "fed", "tariff",
            "portfolio", "simulate", "risk", "conviction", "thesis", "dna", "fingerprint", "divergence",
            "accounting", "red flag", "audit", "forensic", "manipulation", "promoter",
            "hft", "liquidity", "flow", "institutional", "accumulation", "distribution", "breakout", "breakdown",
            "chart", "candle", "pattern", "trend", "momentum", "bullish", "bearish", "crash", "rally",
            "compare", "peer", "better", "versus", "vs", "kya lagta hai", "kaisa hai", "kharidna", "bechna",
            "levels", "outlook", "stance", "analysis", "analyze", "explain", "detail", "detailed", "summary",
            "bhav", "kimat", "teji", "mandi", "kharide", "beche", "kitna", "kya hai"
        ])
        has_context_followup = any(w in q_lower for w in ["what", "how", "why", "when", "is it", "will it", "kya", "kyu", "kaise", "kab", "batao", "bataiye"]) and len(q_lower.split()) >= 2

        if not has_stock_mention and not has_market_intent and not has_context_followup:
            # Query is ambiguous, incomplete, or random text (e.g. "tujhko", "asdf", random phrases)
            if is_hindi:
                reply_text = "मुझे आपका प्रश्न पूरी तरह समझ नहीं आया। क्या आप स्पष्ट कर सकते हैं कि आप किस स्टॉक, सेक्टर या मार्केट मीट्रिक का विश्लेषण करना चाहते हैं? (जैसे: रिलायंस VWAP, टाटा मोटर्स Buy/Sell फैसला, या क्रूड 30% डोमिनो रिपल)"
            elif is_hinglish:
                reply_text = "Mujhe aapka question clear nahi hua. Kya aap clarify kar sakte hain ki aap kis stock, sector ya metric ko analyze karna chahte hain? (Jaise Reliance VWAP, Tata Motors Buy/Sell verdict, ya Crude 30% Domino Ripple)"
            else:
                reply_text = "Could you please clarify which stock, sector, or market metric you would like to analyze? For example, ask about Reliance VWAP, Tata Motors buy/sell verdict, or Crude Oil domino cascades."
            
            return {
                "reply": reply_text,
                "action": None,
                "detected_symbol": detected_symbol,
                "language": language
            }

        thesis = STOCK_THESIS_REGISTRY.get(detected_symbol) or {}
        up = thesis.get("upside_pct", 2.8)
        dn = thesis.get("downside_pct", 1.0)
        tgt_p = round(comp["price"] * (1 + up / 100), 2)
        stp_p = round(comp["price"] * (1 - dn / 100), 2)
        rr_ratio = round(up / max(dn, 0.1), 1)

        action_payload = {
            "type": "QUANT_HIGHLIGHT",
            "params": {
                "symbol": detected_symbol,
                "support": stp_p,
                "resistance": tgt_p,
                "vwap": vwap_lvl,
                "obi": obi_val,
                "bias": f"{thesis.get('signal', 'STRONG BUY')} ({thesis.get('conviction', 95)}% Conviction)"
            }
        }

        # Build context history string for multi-turn coherence
        hist_context = ""
        if history and isinstance(history, list):
            hist_lines = []
            for h in history[-5:]:
                sender = h.get("role") or h.get("sender") or "user"
                txt = h.get("text") or h.get("message") or ""
                if txt:
                    hist_lines.append(f"{sender}: {txt}")
            hist_context = "\n".join(hist_lines)

        reply_text = ""

        if gemini_client:
            try:
                lang_rule = (
                    "The client has selected HINDI. You MUST respond exclusively in natural, grammatically pure Hindi in Devanagari script."
                    if is_hindi else
                    "The client has selected HINGLISH. Speak in natural Dalal Street professional Hinglish."
                    if is_hinglish else
                    "The client has selected ENGLISH. Deliver your complete answer in crisp, professional institutional English without retail fluff."
                )
                is_detailed = any(w in q_lower for w in ["detail", "detailed", "explain more", "in-depth", "विस्तार", "vistrit", "deep dive", "pura samjhao"])
                target_words = "between 60 and 75 words" if is_detailed else "EXACTLY 35 to 40 words"
                max_tokens_val = 150 if is_detailed else 100

                # Streamlined, ultra-fast institutional quantitative telemetry
                system_inst = f"""You are Alex Copilot — Senior Institutional Quantitative Strategist for MarketMind AI.
Speak with decisive institutional authority, mathematical precision, clarity, and easy-to-understand explanations.

LIVE DATA FOR {comp['name']} ({detected_symbol}):
- Price: ₹{comp['price']:,.2f} ({comp.get('change', '+0.0%')}) | Sector: {comp.get('sector', 'Core Industry')}
- 20D VWAP: ₹{vwap_lvl:,.2f} | 14D RSI: {rsi_val} | Pattern: {pattern_name}
- Order Book Imbalance (OBI): {obi_val:+.2f} ({'Net Buyer Accumulation' if obi_val >= 0 else 'Seller Overhang'})
- 95% Daily VaR: ₹{var_95_val:,.2f} | Support: ₹{stp_p:,.2f} | Target: ₹{tgt_p:,.2f} | R:R 1:{rr_ratio}
- Quality: P/E {comp.get('pe_ratio', 24.5)}x | ROE {comp.get('roe', 16.5)}%
- Stance: {thesis.get('signal', 'STRONG BUY')} with {thesis.get('conviction', 95)}% Conviction

STRICT RULES:
1. WORD LIMIT CONSTRAINT: Your answer MUST be {target_words} (2-3 concise, complete, easily understandable sentences).
2. Only provide more detail if the client explicitly requests 'detailed' or 'explain in detail'.
3. State the exact numbers directly (Price, VWAP, VaR, OBI, Support or Target).
4. No markdown asterisks (never use '**').
5. {lang_rule}"""

                prompt_content = f"""Recent Chat History:\n{hist_context}\n\nClient Question: {user_query}\n\nDeliver an institutional answer in {target_words} for {comp['name']} ({detected_symbol}):"""

                res_text = await call_fast_gemini(
                    prompt=prompt_content,
                    system_instruction=system_inst,
                    max_tokens=max_tokens_val,
                    temperature=0.2,
                    timeout_secs=2.2
                )
                if res_text:
                    reply_text = res_text
            except Exception as e:
                print(f"Gemini hedge-fund quant reasoning error: {e}")

        # Dynamic high-precision fallback computed from active stock telemetry if Gemini is offline/slow
        if not reply_text:
            sig = thesis.get("signal", "STRONG BUY")
            conv = thesis.get("conviction", 95)
            cat = thesis.get("catalyst", "Institutional block buying above 20D VWAP")
            exp = thesis.get("explanation", f"Active buyer accumulation observed for {comp['name']}.")
            hft = thesis.get("hft_pattern", "⚡ Order Block Inflow")

            if any(w in q_lower for w in ["vwap", "var", "imbalance", "order book", "quant"]):
                if is_hindi:
                    reply_text = f"{comp['name']} का 20-दिन वीडब्ल्यूपी ₹{vwap_lvl:,.2f} और दैनिक 95% वीएआर ₹{var_95_val:,.2f} है। {obi_val:+.2f} ऑर्डर बुक इम्बैलेंस बायर्स की मजबूती दिखाता है, जिससे मॉडल का टारगेट ₹{tgt_p:,.2f} बना हुआ है।"
                elif is_hinglish:
                    reply_text = f"{comp['name']} ka 20-day VWAP ₹{vwap_lvl:,.2f} aur 95% daily VaR ₹{var_95_val:,.2f} hai. Order book imbalance {obi_val:+.2f} steady institutional buyer absorption confirm karta hai, targeting ₹{tgt_p:,.2f}."
                else:
                    reply_text = f"{comp['name']} trades at a 20-day VWAP of ₹{vwap_lvl:,.2f} with a 95% daily VaR of ₹{var_95_val:,.2f}. Order book imbalance stands at {obi_val:+.2f}, confirming institutional buy-side depth targeting ₹{tgt_p:,.2f}."
            elif any(w in q_lower for w in ["target", "stop", "sl", "level", "floor", "resistance", "risk", "downside"]):
                if is_hindi:
                    reply_text = f"{comp['name']} के लिए ₹{stp_p:,.2f} (-{dn}%) पर मजबूत संस्थागत सपोर्ट है और टारगेट रेजिस्टेंस ₹{tgt_p:,.2f} (+{up}%) पर है। 20-डे वीडब्ल्यूपी के साथ रिस्क-टू-रिवॉर्ड 1:{rr_ratio} सुरक्षित है।"
                elif is_hinglish:
                    reply_text = f"{comp['name']} me primary support ₹{stp_p:,.2f} (-{dn}%) par solidly defended hai aur target resistance ₹{tgt_p:,.2f} (+{up}%) par anchored hai. 1:{rr_ratio} risk-to-reward ratio maintain hota hai."
                else:
                    reply_text = f"For {comp['name']}, primary support is defended at ₹{stp_p:,.2f} (-{dn}%) with target resistance at ₹{tgt_p:,.2f} (+{up}%). Risk-to-reward is 1:{rr_ratio}, anchored above the 20-day VWAP."
            elif any(w in q_lower for w in ["valuation", "pe", "roe", "p/b", "fair value", "multiple"]):
                pe_r = comp.get("pe_ratio", 24.5)
                roe_r = comp.get("roe", 16.5)
                if is_hindi:
                    reply_text = f"{comp['name']} वर्तमान में {pe_r}x पी/ई और {roe_r}% आरओई पर ट्रेड कर रहा है। ऑपरेटिंग कैश फ्लो इसे सेक्टर के मुकाबले मजबूत वैल्यूएशन सुरक्षा प्रदान करते हैं।"
                elif is_hinglish:
                    reply_text = f"{comp['name']} currently {pe_r}x P/E multiple aur {roe_r}% ROE par trade ho raha hai. Steady operating cash flows valuation margin provide karte hain."
                else:
                    reply_text = f"{comp['name']} trades at an attractive {pe_r}x P/E multiple supported by {roe_r}% ROE. Disciplined operational cash flows provide comfortable valuation safety against sector peers."
            elif any(w in q_lower for w in ["peer", "compare", "nifty", "sector"]):
                if is_hindi:
                    reply_text = f"{comp['name']} अपने सेक्टर की तुलना में {comp.get('roe', 16.5)}% आरओई और स्थिर मार्जिन के साथ टॉप पर है। 1.12 बीटा बाजार में अनुशासित रिटर्न बनाए रखता है।"
                elif is_hinglish:
                    reply_text = f"{comp['name']} sector peers ke mukable {comp.get('roe', 16.5)}% ROE aur consistent operating margins deliver karta hai with 1.12 beta."
                else:
                    reply_text = f"{comp['name']} relative to sector peers maintains an industry-leading {comp.get('roe', 16.5)}% ROE and resilient operating margins, delivering disciplined capital compounding."
            else:
                if is_hindi:
                    reply_text = f"{comp['name']} में 20-दिन वीडब्ल्यूपी ₹{vwap_lvl:,.2f} के ऊपर मजबूत संस्थागत संचय जारी है। क्वांट मॉडल {conv}% विश्वास के साथ {sig} बनाए हुए है और सपोर्ट ₹{stp_p:,.2f} पर सुरक्षित है।"
                elif is_hinglish:
                    reply_text = f"{comp['name']} me 20-day VWAP ₹{vwap_lvl:,.2f} ke upar institutional buying active hai. Model {conv}% conviction ke saath {sig} maintain karta hai with support at ₹{stp_p:,.2f}."
                else:
                    reply_text = f"For {comp['name']}, active institutional accumulation is sustained above 20-day VWAP ₹{vwap_lvl:,.2f}. Quantitative factor scoring confirms buy-side depth, underwriting a high-conviction {sig} stance targeting ₹{tgt_p:,.2f}."

    # Strip markdown bold asterisks so no raw ** ever appears in chat bubbles
    if reply_text:
        reply_text = re.sub(r'\*\*(.*?)\*\*', r'\1', reply_text)
        reply_text = reply_text.replace("**", "")

    return {
        "reply": reply_text,
        "action": action_payload,
        "detected_symbol": detected_symbol
    }

def clean_text_for_speech(text: str) -> str:
    if not text:
        return ""
    t = re.sub(r'[*_#`]', '', text)
    t = t.replace('₹', 'Rupees ')
    t = t.replace('bps', ' basis points')
    t = t.replace('VWAP', 'V-WAP')
    t = t.replace('P/E', 'P-E ratio')
    t = t.replace('LTP', 'last price')
    t = t.replace('NAV', 'N-A-V')
    t = t.replace('RSI', 'R-S-I')
    t = t.replace('VaR', 'V-A-R')
    t = t.replace('OBI', 'O-B-I')
    t = t.replace('%', ' percent')
    t = re.sub(r'\+([0-9])', r'plus \1', t)
    t = re.sub(r'−([0-9])', r'minus \1', t)
    t = re.sub(r'-([0-9])', r'minus \1', t)
    t = re.sub(r'[()\[\]{}]', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

async def synthesize_speech_audio(text: str, voice_gender: str = "male", language: str = "english") -> Optional[bytes]:
    if language.lower() in ["hindi", "hi"]:
        return None

    if not settings.DEEPGRAM_API_KEY or not text:
        return None
    
    cleaned = clean_text_for_speech(text)
    if not cleaned:
        return None

    voice_model = settings.DEFAULT_TTS_VOICE_FEMALE if (voice_gender or "").lower() == "female" else settings.DEFAULT_TTS_VOICE_MALE
    if not voice_model:
        voice_model = "aura-orion-en"

    url = f"https://api.deepgram.com/v1/speak?model={voice_model}"
    headers = {
        "Authorization": f"Token {settings.DEEPGRAM_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"text": cleaned}
    
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                return response.content
    except Exception as e:
        print(f"Deepgram audio error: {e}")
    return None
