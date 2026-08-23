import os
import json
from typing import Dict, List, Optional
from google import genai
from config import settings

DOMINO_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "macro_dominos.json")

def get_domino_events() -> List[Dict]:
    if os.path.exists(DOMINO_FILE):
        with open(DOMINO_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def trace_event_causality(event: str) -> Dict:
    events = get_domino_events()
    for e in events:
        if event.lower() in e.get("event", "").lower():
            return e
    
    # If dynamic event requested and Gemini is available, generate dynamic 4-order causality chain!
    if settings.GEMINI_API_KEY:
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            prompt = f"""
            Analyze the following macroeconomic or business event: '{event}'.
            Generate a structured 4-order causality chain for financial markets in JSON format:
            {{
              "event": "{event}",
              "depth": 4,
              "steps": [
                {{"order": 1, "title": "Direct impact", "description": "..."}},
                {{"order": 2, "title": "2nd-order effect", "description": "..."}},
                {{"order": 3, "title": "3rd-order effect", "description": "..."}},
                {{"order": 4, "title": "4th-order endpoint", "description": "..."}}
              ],
              "affected_companies": [
                {{"name": "Company A", "type": "hit", "impact": "..."}},
                {{"name": "Company B", "type": "benefit", "impact": "..."}}
              ]
            }}
            Return valid JSON only.
            """
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            raw = response.text.strip().replace("```json", "").replace("```", "")
            return json.loads(raw)
        except Exception as err:
            print(f"Error generating dynamic domino: {err}")
            
    # Default fallback
    return events[0] if events else {}
