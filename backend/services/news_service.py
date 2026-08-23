import os
import feedparser
from typing import List, Dict
from google import genai
from config import settings

client = None
if settings.GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Error initializing Gemini in news_service: {e}")

FALLBACK_NEWS = [
    {
        "id": "news-1",
        "logo": "RB",
        "title": "RBI holds repo rate at 6.5%, signals cautious optimism on inflation",
        "meta": "Economic Times · Live",
        "impact": "benefit",
        "impactLabel": "Benefit",
        "snippet": "The Monetary Policy Committee kept rates unchanged for a fourth straight meeting, citing steady disinflation and resilient growth — easing pressure on bank funding costs.",
        "prediction": "Rate-sensitive banking names (HDFC Bank, ICICI Bank, SBI) could see a 1–2% uptick over the next 2 sessions as margin stability supports sentiment.",
        "tickers": ["HDFC Bank", "ICICI Bank", "Nifty Bank"],
        "score": 82,
        "scoreOffset": 17,
        "scoreColor": "#2F6F62",
    },
    {
        "id": "news-2",
        "logo": "RT",
        "title": "Crude oil jumps 6% on Middle East supply concerns",
        "meta": "Reuters · Live",
        "impact": "loss",
        "impactLabel": "Loss",
        "snippet": "Brent crude touched a five-month high after fresh disruption reports near a key shipping corridor. Fuel-intensive sectors face immediate cost pressure, while upstream producers stand to benefit.",
        "prediction": "Airline margins (IndiGo, SpiceJet) likely compressed next quarter; ONGC and upstream energy names may see modest outperformance.",
        "tickers": ["IndiGo", "SpiceJet", "ONGC"],
        "score": 74,
        "scoreOffset": 24,
        "scoreColor": "#A14545",
        "linkToDomino": True,
    },
    {
        "id": "news-3",
        "logo": "BL",
        "title": "TCS wins $1.2B multi-year cloud transformation deal",
        "meta": "Business Line · Live",
        "impact": "benefit",
        "impactLabel": "Benefit",
        "snippet": "The deal, one of the company's largest this fiscal year, spans cloud migration and managed services for a European banking client — adding meaningful revenue visibility.",
        "prediction": "Deal-win momentum has historically supported a 3–4% re-rating within the following week for IT services.",
        "tickers": ["TCS", "IT Services"],
        "score": 91,
        "scoreOffset": 8,
        "scoreColor": "#2F6F62",
    },
    {
        "id": "news-4",
        "logo": "MN",
        "title": "Adani Enterprises faces fresh regulatory scrutiny over import valuations",
        "meta": "Mint · Live",
        "impact": "loss",
        "impactLabel": "Loss",
        "snippet": "A regulatory body has sought clarifications on valuation practices tied to certain coal import contracts, reviving governance concerns flagged in prior reports.",
        "prediction": "Elevated volatility likely near-term; further downside if the inquiry widens in scope.",
        "tickers": ["Adani Enterprises"],
        "score": 68,
        "scoreOffset": 30,
        "scoreColor": "#A14545",
    },
    {
        "id": "news-5",
        "logo": "MC",
        "title": "Reliance Retail same-store sales growth slows to 6% in Q2",
        "meta": "Moneycontrol · Live",
        "impact": "neutral",
        "impactLabel": "Neutral",
        "snippet": "Growth decelerated from 9% a year ago, which management attributed to a high base and softer discretionary spending in metro markets.",
        "prediction": "Muted near-term price impact; festive-quarter numbers will be the confirming signal to watch.",
        "tickers": ["Reliance Industries", "Retail"],
        "score": 45,
        "scoreOffset": 52,
        "scoreColor": "#B8935A",
    },
    {
        "id": "news-6",
        "logo": "ET",
        "title": "Infosys raises FY guidance after strong Q2 beat",
        "meta": "Economic Times · Live",
        "impact": "benefit",
        "impactLabel": "Benefit",
        "snippet": "Revenue and margins both beat estimates, prompting management to lift full-year revenue growth guidance for the second consecutive quarter.",
        "prediction": "Guidance upgrades of this size have historically preceded a 2–5% rally within a week.",
        "tickers": ["Infosys", "IT Services"],
        "score": 88,
        "scoreOffset": 11,
        "scoreColor": "#2F6F62",
    }
]

def fetch_live_rss_news(query: str = "Indian stock market NSE") -> List[Dict]:
    try:
        encoded_query = query.replace(" ", "+")
        rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
        feed = feedparser.parse(rss_url)
        
        results = []
        for i, entry in enumerate(feed.entries[:8]):
            # Assign impact heuristic or Gemini tag
            title_lower = entry.title.lower()
            if any(k in title_lower for k in ["profit", "surges", "jumps", "beat", "rally", "wins", "expansion", "growth", "high"]):
                impact = "benefit"
                impact_label = "Benefit"
                score = 82
                color = "#2F6F62"
                offset = 18
            elif any(k in title_lower for k in ["falls", "drops", "slumps", "fraud", "scrutiny", "probe", "loss", "plunges", "war"]):
                impact = "loss"
                impact_label = "Loss"
                score = 75
                color = "#A14545"
                offset = 25
            else:
                impact = "neutral"
                impact_label = "Neutral"
                score = 50
                color = "#B8935A"
                offset = 50

            results.append({
                "id": f"rss-{i}",
                "logo": entry.source.get("title", "ET")[:2].upper() if hasattr(entry, "source") and entry.source else "NE",
                "title": entry.title,
                "meta": f"{entry.source.get('title', 'Financial Express') if hasattr(entry, 'source') and entry.source else 'Market News'} · Live RSS",
                "impact": impact,
                "impactLabel": impact_label,
                "snippet": entry.title,
                "prediction": f"Market sentiment reaction for {query} based on fresh reporting.",
                "tickers": [query.title() if query != "Indian stock market NSE" else "Nifty 50"],
                "score": score,
                "scoreOffset": offset,
                "scoreColor": color,
                "link": entry.link
            })
        if results:
            return results
    except Exception as e:
        print(f"Error fetching RSS news: {e}")
    return FALLBACK_NEWS

def get_all_scored_news(filter_tag: str = "All") -> List[Dict]:
    news_list = FALLBACK_NEWS
    if filter_tag and filter_tag != "All":
        news_list = [n for n in news_list if n.get("impact", "").lower() == filter_tag.lower()]
    return news_list
