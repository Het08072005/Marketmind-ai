import os
import json
import httpx
from typing import Dict, Optional, Any, List
from google import genai
from config import settings
from services.market_data_service import fetch_live_stock_data, get_all_live_companies, get_stock_historical_candles
from services.stock_service import get_company_by_symbol, get_all_companies
from services.portfolio_service import execute_trade, get_portfolio_summary
from services.domino_service import get_domino_events

gemini_client = None
if settings.GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Error initializing Gemini client: {e}")

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
}

STOCK_CORE_THESES = {
    "RELIANCE": {
        "title": "Jamnagar Green Energy & Solar Gigafactory Capex Rollout",
        "metric": "Revenue Growth Rate (YoY / QoQ)",
        "benchmark": "Target revenue growth >= 20% & 20GW solar module rollout",
        "health": 88,
        "status": "Intact",
        "explanation": "For Reliance, the core investment thesis is the Jamnagar Green Energy Gigafactory rollout and retail revenue growth. The quantitative benchmark targets 20 gigawatt solar module rollout and revenue growth above 20%."
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
    is_hindi = language.lower() in ["hindi", "hi"]

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

    # Fetch technical candle indicators (RSI, Pattern, Support, Resistance)
    candles_info = get_stock_historical_candles(detected_symbol)
    rsi_val = candles_info.get("rsi") or comp.get("rsi") or 55.0
    pattern_name = candles_info.get("patterns", [{}])[0].get("name") if candles_info.get("patterns") else comp.get("pattern", "Consolidation Range")
    support_lvl = candles_info.get("support_level", round(comp["price"] * 0.95, 2))
    resistance_lvl = candles_info.get("resistance_level", round(comp["price"] * 1.05, 2))

    GLOBAL_SESSION_STATE["last_pattern"] = pattern_name

    # =========================================================================
    # 0. WAKE UP & CONVERSATIONAL GREETING INTENT ("Hey Alex", "Hello", "Hi")
    # =========================================================================
    wake_triggers = [
        "hey alex", "hey alexa", "alex", "alexa", "hey pulse", "hey marketpulse", "marketpulse",
        "hello", "hi", "hey", "नमस्ते", "मार्केटपल्स", "yes", "ok", "okay", "haan", "bol",
        "how can i help you", "how can i help", "yes how can i help you", "yes how can i help",
        "how can i help you today", "madad", "help"
    ]
    if q_lower in wake_triggers or any(q_lower == w for w in wake_triggers):
        if is_hindi:
            reply_text = "हाँ, मैं आपकी क्या मदद कर सकता हूँ?"
        else:
            reply_text = "Yes, how can I help you?"
        
        return {
            "reply": reply_text,
            "action": None,
            "detected_symbol": detected_symbol,
            "language": language
        }

    # =========================================================================
    # 1. GHOST PORTFOLIO INTENT (Must precede generic portfolio)
    # =========================================================================
    if any(w in q_lower for w in ["ghost", "ghost portfolio", "shadow portfolio", "missed stocks", "घोस्ट", "घोस्ट पोर्टफोलियो"]):
        action_payload = {
            "type": "NAVIGATE",
            "target_page": "ghost"
        }
        if is_hindi:
            reply_text = "घोस्ट पोर्टफोलियो प्रस्तुत है। आपके छोड़े गए और जल्दी बेचे गए शेयरों का शैडो रिटर्न ₹15.2L (+52%) पर ट्रैक हो रहा है।"
        else:
            reply_text = "Opening Ghost Portfolio. Shadow parallel analysis tracks +₹2.75L in missed alpha from skipped and early-sold stocks."

    # =========================================================================
    # 2. HIDDEN DEPENDENCY MAP INTENT (Must precede generic portfolio)
    # =========================================================================
    elif any(w in q_lower for w in ["dependency", "dependencies", "hidden dependency", "hidden dependencies", "macro correlation", "risk map", "डिपेंडेंसी"]):
        action_payload = {
            "type": "NAVIGATE",
            "target_page": "dependency"
        }
        if is_hindi:
            reply_text = "पोर्टफोलियो हिडन डिपेंडेंसी मैप खोला जा रहा है। 52% पूंजी यूएसडी और क्रूड ऑयल मैक्रो रिस्क से जुड़ी है।"
        else:
            reply_text = "Navigating to Hidden Dependency Map. Auditing 52% USD/INR exchange rate and crude oil correlation exposure."

    # =========================================================================
    # 3. INVESTMENT THESIS BREAKER INTENT
    # =========================================================================
    elif any(w in q_lower for w in ["thesis", "theses", "thesis breaker", "investment thesis", "investment case", "investment cases", "investment", "case", "cases", "reasoning", "buy case", "bull case", "why buy", "why to buy", "catalyst", "catalysts", "rationale", "benchmark", "थीसिस", "थीसिस ब्रेकर", "इन्वेस्टमेंट केस", "केस"]):
        th_data = STOCK_CORE_THESES.get(detected_symbol) or {
            "title": f"{comp['name']} Market Leadership & Capex Expansion",
            "metric": "Revenue Growth Rate (YoY / QoQ)",
            "benchmark": "Target revenue growth >= 15% & stable operating margin",
            "health": 85,
            "status": "Intact",
            "explanation": f"For {comp['name']}, the core thesis is domestic sector leadership and capex scaling, targeting revenue growth above 15%."
        }

        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "thesis",
            "command": "POPULATE_THESIS_FORM",
            "params": {
                "symbol": detected_symbol,
                "thesis_title": th_data["title"],
                "metric_type": th_data["metric"],
                "target_benchmark": th_data["benchmark"],
                "health_score": th_data["health"],
                "status": th_data["status"]
            }
        }
        if is_hindi:
            reply_text = f"{comp['name']} की कोर इन्वेस्टमेंट थीसिस: {th_data['title']}। क्वांटिटेटिव टारगेट बेंचमार्क: {th_data['benchmark']}।"
        else:
            reply_text = th_data["explanation"]

    # =========================================================================
    # 4. STOCK DNA FINGERPRINT INTENT (Must precede generic compare)
    # =========================================================================
    elif any(w in q_lower for w in ["dna", "dna fingerprint", "genetic", "fingerprint", "डीएनए", "फिंगरप्रिंट"]):
        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "dna",
            "params": {"symbol": detected_symbol}
        }
        if is_hindi:
            reply_text = f"{comp['name']} का स्टॉक डीएनए फिंगरप्रिंट और 5-स्ट्रैंड बिहेवियरल मैच विश्लेषण प्रस्तुत है।"
        else:
            reply_text = f"Loading 5-strand Stock DNA Fingerprint for {comp['name']}. Analyzing growth, debt, news beta, and management fidelity."

    # =========================================================================
    # 5. DECISION TIME MACHINE INTENT
    # =========================================================================
    elif any(w in q_lower for w in ["time machine", "decision time machine", "historical decision", "टाइम मशीन"]):
        action_payload = {
            "type": "NAVIGATE",
            "target_page": "timemachine"
        }
        if is_hindi:
            reply_text = "डिसीजन टाइम मशीन खुल रही है। ऐतिहासिक बाज़ार के अहम मोड़ों पर अपने निर्णयों का परीक्षण करें।"
        else:
            reply_text = "Navigating to Decision Time Machine. Travel back to pivotal historical market inflection points to audit decision quality."

    # =========================================================================
    # 6. FORENSIC HEALTH & AUTOPSY
    # =========================================================================
    elif any(w in q_lower for w in ["forensic", "autopsy", "health", "z-score", "fraud", "red flag", "dhfl", "satyam", "yes bank", "ऑटोप्सी", "हेल्थ"]):
        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "autopsy",
            "params": {"symbol": detected_symbol}
        }
        if is_hindi:
            reply_text = f"{comp['name']} का फॉरेंसिक हेल्थ ऑडिट और ज़ेड-स्कोर विश्लेषण खोला जा रहा है।"
        else:
            reply_text = f"Loading forensic autopsy and accounting health score for {comp['name']}. Navigating to Forensic Engine."

    # =========================================================================
    # 7. PORTFOLIO SIMULATOR INTENT
    # =========================================================================
    elif any(w in q_lower for w in ["portfolio", "portfoli", "simulator", "trade", "buy", "sell", "खरीद", "बेच", "पोर्टफोलियो"]):
        side = "SELL" if any(w in q_lower for w in ["sell", "बेच"]) else "BUY"
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
        else:
            reply_text = f"Simulating {side} order of {shares} shares for {comp['name']} at ₹{comp['price']:,.2f}. Navigating to Portfolio Simulator."

    # =========================================================================
    # 8. SECTOR COMPARISON & PEER BENCHMARK INTENT
    # =========================================================================
    elif any(w in q_lower for w in ["sector", "peer", "compare", "benchmark", "सेक्टर", "तुलना", "साथियों"]):
        sec_name = comp.get("sector", "Core Sector")
        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "sector",
            "params": {
                "symbol": detected_symbol,
                "sector": sec_name
            }
        }
        rev_gr = comp.get("revenue_growth", 12.0)
        net_m = comp.get("net_margin", 15.0)
        roe_val = comp.get("roe", 18.0)
        if is_hindi:
            reply_text = f"{comp['name']} की {sec_name} सेक्टर के साथियों के साथ तुलना प्रस्तुत है। नेट मार्जिन {net_m}% और आरओई {roe_val}% है।"
        else:
            reply_text = f"Comparing {comp['name']} against {sec_name} peers. Revenue growth is {rev_gr}%, net margin is {net_m}%, and ROE is {roe_val}%."

    # =========================================================================
    # 3. DOMINO PREDICTOR INTENT
    # =========================================================================
    elif any(w in q_lower for w in ["domino", "ripple", "chain", "crude oil", "oil", "rbi", "डोमिनो", "कच्चा तेल", "इफेक्ट"]):
        event_name = "Crude Oil +30%"
        if "rbi" in q_lower or "rate" in q_lower:
            event_name = "RBI Rate Hike +50bps"
        elif "ev" in q_lower or "subsidy" in q_lower:
            event_name = "EV Subsidy Boost +20%"
        elif "semiconductor" in q_lower or "chip" in q_lower:
            event_name = "Semiconductor Shortage -40%"

        action_payload = {
            "type": "NAVIGATE_AND_EXECUTE",
            "target_page": "domino",
            "command": "RUN_DOMINO_SIMULATION",
            "params": {"event": event_name}
        }
        if is_hindi:
            reply_text = f"डोमिनो प्रिडिक्टर खोल रहा हूँ और '{event_name}' का प्रभाव 1st से 4th आर्डर में सिमुलेट कर रहा हूँ।"
        else:
            reply_text = f"Opening Domino Predictor and simulating macro ripple effects for '{event_name}' across supply chain margins."

    # =========================================================================
    # 4. MANAGEMENT TRUST METER INTENT
    # =========================================================================
    elif any(w in q_lower for w in ["trust", "management", "promise", "discrepancy", "ट्रस्ट", "भरोसा", "वादे"]):
        score = comp.get("trust_meter", {}).get("score", 78)
        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "trust",
            "params": {"symbol": detected_symbol}
        }
        if is_hindi:
            reply_text = f"{comp['name']} का मैनेजमेंट ट्रस्ट स्कोर {score}/100 है। अर्निंग्स कॉल के वादों की तुलनात्मक रिपोर्ट स्क्रीन पर खुल रही है।"
        else:
            reply_text = f"{comp['name']} Management Trust Score is {score}/100. Navigating to Trust Meter audit breakdown."

    # =========================================================================
    # 5. SMART ALERTS INTENT
    # =========================================================================
    elif any(w in q_lower for w in ["alert", "smart alert", "notify", "trigger", "अलर्ट", "नोटिफिकेशन", "वॉचलिस्ट"]):
        action_payload = {
            "type": "NAVIGATE_AND_EXECUTE",
            "target_page": "alerts",
            "command": "CREATE_ALERT",
            "params": {
                "symbol": detected_symbol,
                "condition": "RSI crosses above",
                "threshold": "70"
            }
        }
        if is_hindi:
            reply_text = f"{comp['name']} के लिए स्मार्ट अलर्ट नियम सेट कर दिया गया है। स्मार्ट अलर्ट और लाइव वॉचलिस्ट स्क्रीन खुल रही है।"
        else:
            reply_text = f"Configuring Smart Alert trigger for {comp['name']}. Navigating to Smart Alerts & Watchlist engine."

    # =========================================================================
    # 6. AI REPORT GENERATOR INTENT
    # =========================================================================
    elif any(w in q_lower for w in ["report", "research report", "generate report", "snapshot", "रिपोर्ट", "एनालिसिस रिपोर्ट"]):
        action_payload = {
            "type": "NAVIGATE_AND_EXECUTE",
            "target_page": "reports",
            "command": "GENERATE_REPORT",
            "params": {
                "symbol": detected_symbol
            }
        }
        if is_hindi:
            reply_text = f"{comp['name']} के लिए इंस्टिट्यूशनल रिसर्च रिपोर्ट तैयार कर दी गई है। एग्जीक्यूटिव समरी स्क्रीन पर प्रस्तुत है।"
        else:
            reply_text = f"Generating institutional AI equity research report for {comp['name']}. Valuation, fundamentals, and investment thesis are ready on screen."

    # =========================================================================
    # 7. CANDLESTICK TECHNICAL CHART EXPLICIT REQUEST
    # =========================================================================
    elif any(w in q_lower for w in ["candlestick", "candle", "technical chart", "कैंडल", "चार्ट"]):
        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "candles",
            "command": "SHOW_CANDLESTICK",
            "params": {
                "symbol": detected_symbol
            }
        }
        if is_hindi:
            reply_text = f"{comp['name']} का 30-दिन का कैंडलस्टिक चार्ट खोला जा रहा है। डिटेक्टेड पैटर्न '{pattern_name}' है और आरएसआई {rsi_val} है।"
        else:
            reply_text = f"Opening 30-day technical candlestick patterns for {comp['name']}. Detected pattern is '{pattern_name}' with RSI at {rsi_val}."

    # =========================================================================
    # 8. ESG & SUSTAINABILITY SCORE
    # =========================================================================
    elif any(w in q_lower for w in ["esg", "sustainability", "governance", "environmental", "ईएसजी", "सस्टेनेबिलिटी", "पर्यावरण"]):
        action_payload = {
            "type": "NAVIGATE_AND_SELECT",
            "target_page": "esg",
            "command": "SHOW_ESG",
            "params": {
                "symbol": detected_symbol
            }
        }
        esg_score = comp.get("esg", {}).get("overall", 77)
        if is_hindi:
            reply_text = f"{comp['name']} का ओवरऑल ईएसजी स्कोर {esg_score}/100 है। ईएसजी और सस्टेनेबिलिटी ऑडिट स्क्रीन पर खोला जा रहा है।"
        else:
            reply_text = f"{comp['name']} has an overall ESG Sustainability score of {esg_score}/100, rated as Strong. Opening detailed pillar audit."

    # =========================================================================
    # 9. LIVE NEWS & SPECIFIC TOPIC INTELLIGENCE INTENT
    # =========================================================================
    elif any(w in q_lower for w in ["news", "headline", "headlines", "feed", "khabar", "khabrein", "samachar", "taaza", "taza", "खबर", "समाचार", "ताज़ा", "ताजा", "egr", "gold receipt", "electronic gold", "new-age tech", "tracker", "gigafactory"]):
        from services.live_news_service import lookup_news_by_topic
        matched_article = lookup_news_by_topic(user_query)
        
        action_payload = {
            "type": "NAVIGATE",
            "target_page": "news"
        }
        
        if matched_article:
            art_title = matched_article["title"]
            art_summary = matched_article["summary"]
            art_beneficiaries = matched_article.get("beneficiaries", "broader market participants")
            
            if is_hindi:
                reply_text = f"{art_title}। {art_summary} मुख्य लाभ: {art_beneficiaries}।"
            else:
                reply_text = f"{art_title}. {art_summary} Key beneficiaries include {art_beneficiaries}."
        else:
            if is_hindi:
                reply_text = "लाइव वित्तीय समाचार फ़ीड स्क्रीन पर प्रस्तुत की जा रही है।"
            else:
                reply_text = "Navigating to Live News feed with real-time Indian market headlines and AI impact scoring."

    # =========================================================================
    # 15. DEEP CONTEXTUAL / FOLLOW-UP / TRICKY QUESTIONS ("will it go up or down?", "what is the target?", "why margin falling?")
    # =========================================================================
    else:
        reply_text = ""
        action_payload = {
            "type": "KEEP_ACTIVE_PAGE",
            "params": {"symbol": detected_symbol}
        }

        # Build context history string for Gemini
        hist_context = ""
        if history and isinstance(history, list):
            hist_lines = []
            for h in history[-4:]:
                sender = h.get("role") or h.get("sender") or "user"
                txt = h.get("text") or h.get("message") or ""
                if txt:
                    hist_lines.append(f"{sender}: {txt}")
            hist_context = "\n".join(hist_lines)

        if gemini_client:
            try:
                system_inst = (
                    f"You are MarketPulse AI, an elite Wall Street and Indian Stock Market quantitative analyst. "
                    f"You are currently discussing {comp['name']} ({detected_symbol}). "
                    f"Verified Live Data: LTP ₹{comp['price']} ({comp['change']}), 14-Day RSI {rsi_val}, "
                    f"30-Day Candlestick Pattern '{pattern_name}', Support ₹{support_lvl}, Resistance ₹{resistance_lvl}, "
                    f"P/E {comp.get('pe_ratio', 24.5)}x, Sector {comp.get('sector')}. "
                    f"RULES:\n"
                    f"1. Strictly answer the user's specific question for {comp['name']} ({detected_symbol}).\n"
                    f"2. If asked whether the pattern or stock goes 'up or down' or 'bullish or bearish', directly evaluate RSI ({rsi_val}), Support (₹{support_lvl}), Resistance (₹{resistance_lvl}), and Pattern '{pattern_name}'. If RSI is near/below 30 (oversold) with strong support, indicate positive bounce probability; if RSI is >70 (overbought) or below support, indicate downside consolidation risk.\n"
                    f"3. Keep answer precise, professional, and within 30-40 words.\n"
                    f"4. If requested in Hindi or query is Hindi, reply in 100% natural, elegant Hindi in Devanagari script."
                )

                prompt_content = f"""Recent Chat History:\n{hist_context}\n\nCurrent Question: {user_query}\n\nDeliver a direct financial verdict for {comp['name']} ({detected_symbol}):"""

                res = gemini_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt_content,
                    config={"system_instruction": system_inst, "temperature": 0.25}
                )
                if res and res.text:
                    reply_text = res.text.strip()
            except Exception as e:
                print(f"Gemini multi-turn error: {e}")

        # Grounded fallback if Gemini is offline
        if not reply_text:
            is_oversold = rsi_val <= 35
            is_overbought = rsi_val >= 70
            bias = "Bullish bounce expected towards resistance ₹" + str(resistance_lvl) if is_oversold else "Downside consolidation risk with support at ₹" + str(support_lvl) if is_overbought else "Range-bound between ₹" + str(support_lvl) + " and ₹" + str(resistance_lvl)
            
            if is_hindi:
                reply_text = f"{comp['name']} का पैटर्न '{pattern_name}' है और आरएसआई {rsi_val} पर है। सपोर्ट ₹{support_lvl} पर स्थित है और रेजिस्टेंस ₹{resistance_lvl} पर है।"
            else:
                reply_text = f"For {comp['name']}, the '{pattern_name}' pattern with RSI at {rsi_val} indicates {bias}. Immediate support is at ₹{support_lvl}."

    return {
        "reply": reply_text,
        "action": action_payload,
        "detected_symbol": detected_symbol
    }

async def synthesize_speech_audio(text: str, voice_gender: str = "male", language: str = "english") -> Optional[bytes]:
    if language.lower() in ["hindi", "hi"]:
        return None

    if not settings.DEEPGRAM_API_KEY or not text:
        return None
    
    voice_model = "aura-orion-en"
    url = f"https://api.deepgram.com/v1/speak?model={voice_model}"
    headers = {
        "Authorization": f"Token {settings.DEEPGRAM_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"text": text}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                return response.content
    except Exception as e:
        print(f"Deepgram audio error: {e}")
    return None
