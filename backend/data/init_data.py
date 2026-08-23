import os
import json

BASE_DATA_DIR = os.path.dirname(os.path.abspath(__file__))
COMPANIES_DIR = os.path.join(BASE_DATA_DIR, "companies")
FAILURES_DIR = os.path.join(BASE_DATA_DIR, "failures")

os.makedirs(COMPANIES_DIR, exist_ok=True)
os.makedirs(FAILURES_DIR, exist_ok=True)

companies_data = [
    {
        "symbol": "RELIANCE",
        "name": "Reliance Industries Ltd",
        "sector": "Energy & Conglomerate",
        "price": 2946.10,
        "change": "+1.8%",
        "market_cap": "₹19.9L Cr",
        "pe_ratio": 24.8,
        "pb_ratio": 2.1,
        "net_margin": 8.1,
        "roe": 11.6,
        "revenue_growth": 14.2,
        "debt_to_equity": 0.38,
        "rsi": 68.4,
        "pattern": "Ascending Triangle",
        "esg": { "overall": 77, "environmental": 81, "social": 74, "governance": 76 },
        "trust_meter": {
            "score": 78,
            "promises_kept": 14,
            "promises_delayed": 2,
            "promises_broken": 1,
            "timeline": [
                {"promise": "Commission 5G pan-India within 18 months", "made": "Q2 FY23", "status": "Kept"},
                {"promise": "Double retail footprint across Tier 2/3 cities", "made": "Q4 FY23", "status": "Kept"},
                {"promise": "Green Hydrogen Gigafactory Phase 1 commissioning", "made": "Q1 FY24", "status": "Delayed"}
            ],
            "latest_quote": "We remain on track to achieve net carbon zero by 2035 with our new energy gigafactories."
        },
        "forensic": {
            "reported_profit_growth": "+14%",
            "cash_flow_growth": "+9%",
            "receivables_growth": "+11%",
            "divergence_score": "Fair (Low Risk)"
        },
        "dna": { "growth": 82, "debt": 38, "news_sensitivity": 71, "mgmt_reliability": 76, "market_fear": 44 }
    },
    {
        "symbol": "TCS",
        "name": "Tata Consultancy Services",
        "sector": "IT Services",
        "price": 4112.55,
        "change": "+0.6%",
        "market_cap": "₹14.9L Cr",
        "pe_ratio": 29.4,
        "pb_ratio": 13.2,
        "net_margin": 25.1,
        "roe": 48.2,
        "revenue_growth": 11.0,
        "debt_to_equity": 0.02,
        "rsi": 58.2,
        "pattern": "Bullish Engulfing",
        "esg": { "overall": 82, "environmental": 72, "social": 85, "governance": 88 },
        "trust_meter": {
            "score": 88,
            "promises_kept": 16,
            "promises_delayed": 1,
            "promises_broken": 0,
            "timeline": [
                {"promise": "Maintain operating margin above 25%", "made": "Q1 FY24", "status": "Kept"},
                {"promise": "Train 100,000+ engineers in Generative AI", "made": "Q2 FY24", "status": "Kept"}
            ],
            "latest_quote": "Our deal pipeline remains solid with strong traction in enterprise AI and cloud modernization."
        },
        "forensic": {
            "reported_profit_growth": "+11%",
            "cash_flow_growth": "+13%",
            "receivables_growth": "+8%",
            "divergence_score": "Strong (Zero Anomaly)"
        },
        "dna": { "growth": 74, "debt": 5, "news_sensitivity": 52, "mgmt_reliability": 92, "market_fear": 35 }
    },
    {
        "symbol": "HDFCBANK",
        "name": "HDFC Bank Ltd",
        "sector": "Banking & Financials",
        "price": 1672.40,
        "change": "−0.3%",
        "market_cap": "₹12.7L Cr",
        "pe_ratio": 18.2,
        "pb_ratio": 2.8,
        "net_margin": 22.4,
        "roe": 16.8,
        "revenue_growth": 15.4,
        "debt_to_equity": 6.8,
        "rsi": 72.1,
        "pattern": "Overbought Resistance",
        "esg": { "overall": 77, "environmental": 68, "social": 79, "governance": 83 },
        "trust_meter": {
            "score": 80,
            "promises_kept": 12,
            "promises_delayed": 2,
            "promises_broken": 1,
            "timeline": [
                {"promise": "Complete post-merger branch integration in 12 months", "made": "Q2 FY24", "status": "Kept"},
                {"promise": "Bring credit-deposit ratio below 85%", "made": "Q3 FY24", "status": "Delayed"}
            ],
            "latest_quote": "Deposit mobilization continues to outpace credit growth as we rebalance the merged balance sheet."
        },
        "forensic": {
            "reported_profit_growth": "+16%",
            "cash_flow_growth": "+14%",
            "receivables_growth": "+12%",
            "divergence_score": "Healthy Banking Quality"
        },
        "dna": { "growth": 78, "debt": 65, "news_sensitivity": 68, "mgmt_reliability": 84, "market_fear": 48 }
    },
    {
        "symbol": "INFY",
        "name": "Infosys Ltd",
        "sector": "IT Services",
        "price": 1904.10,
        "change": "+2.4%",
        "market_cap": "₹7.9L Cr",
        "pe_ratio": 27.6,
        "pb_ratio": 8.9,
        "net_margin": 20.8,
        "roe": 31.5,
        "revenue_growth": 9.2,
        "debt_to_equity": 0.08,
        "rsi": 64.0,
        "pattern": "Morning Star",
        "esg": { "overall": 84, "environmental": 86, "social": 81, "governance": 85 },
        "trust_meter": {
            "score": 82,
            "promises_kept": 13,
            "promises_delayed": 2,
            "promises_broken": 1,
            "timeline": [
                {"promise": "Achieve 4-7% constant currency guidance", "made": "Q1 FY25", "status": "Kept"},
                {"promise": "Large deal total contract value > $10B", "made": "Q2 FY24", "status": "Kept"}
            ],
            "latest_quote": "Our Topaz AI suite is driving large enterprise renewals across European and US banking clients."
        },
        "forensic": {
            "reported_profit_growth": "+10%",
            "cash_flow_growth": "+11%",
            "receivables_growth": "+7%",
            "divergence_score": "Strong Quality"
        },
        "dna": { "growth": 72, "debt": 8, "news_sensitivity": 65, "mgmt_reliability": 88, "market_fear": 40 }
    },
    {
        "symbol": "TATAMOTORS",
        "name": "Tata Motors Ltd",
        "sector": "Automotive & EV",
        "price": 974.85,
        "change": "−1.1%",
        "market_cap": "₹3.5L Cr",
        "pe_ratio": 15.6,
        "pb_ratio": 3.4,
        "net_margin": 7.2,
        "roe": 22.4,
        "revenue_growth": 21.5,
        "debt_to_equity": 1.1,
        "rsi": 49.3,
        "pattern": "Consolidation Flag",
        "esg": { "overall": 72, "environmental": 75, "social": 70, "governance": 72 },
        "trust_meter": {
            "score": 74,
            "promises_kept": 11,
            "promises_delayed": 3,
            "promises_broken": 1,
            "timeline": [
                {"promise": "Achieve net zero automotive debt by FY25", "made": "Q2 FY23", "status": "Kept"},
                {"promise": "Launch 10 new EV models by 2026", "made": "Q4 FY23", "status": "Kept"},
                {"promise": "JLR EBIT margin above 8.5%", "made": "Q1 FY25", "status": "Kept"}
            ],
            "latest_quote": "We continue to maintain domestic EV market leadership with over 68% volume share."
        },
        "forensic": {
            "reported_profit_growth": "+28%",
            "cash_flow_growth": "+22%",
            "receivables_growth": "+15%",
            "divergence_score": "De-leveraging Positive"
        },
        "dna": { "growth": 86, "debt": 52, "news_sensitivity": 78, "mgmt_reliability": 79, "market_fear": 55 }
    },
    {
        "symbol": "ICICIBANK",
        "name": "ICICI Bank Ltd",
        "sector": "Banking & Financials",
        "price": 1241.30,
        "change": "+0.9%",
        "market_cap": "₹8.7L Cr",
        "pe_ratio": 17.8,
        "pb_ratio": 3.1,
        "net_margin": 24.1,
        "roe": 18.5,
        "revenue_growth": 19.2,
        "debt_to_equity": 7.1,
        "rsi": 62.4,
        "pattern": "Bullish Pennant",
        "esg": { "overall": 76, "environmental": 66, "social": 80, "governance": 82 },
        "trust_meter": {
            "score": 86,
            "promises_kept": 15,
            "promises_delayed": 1,
            "promises_broken": 0,
            "timeline": [
                {"promise": "Keep net NPA below 0.50%", "made": "Q1 FY24", "status": "Kept"},
                {"promise": "Grow retail lending at 18-20% sustainably", "made": "Q3 FY24", "status": "Kept"}
            ],
            "latest_quote": "Asset quality remains robust across our corporate and SME portfolios."
        },
        "forensic": { "reported_profit_growth": "+19%", "cash_flow_growth": "+17%", "receivables_growth": "+14%", "divergence_score": "Strong Quality" },
        "dna": { "growth": 80, "debt": 70, "news_sensitivity": 62, "mgmt_reliability": 89, "market_fear": 42 }
    },
    {
        "symbol": "ITC",
        "name": "ITC Ltd",
        "sector": "Conglomerate & FMCG",
        "price": 468.15,
        "change": "+1.2%",
        "market_cap": "₹5.8L Cr",
        "pe_ratio": 26.2,
        "pb_ratio": 7.8,
        "net_margin": 27.5,
        "roe": 30.1,
        "revenue_growth": 7.8,
        "debt_to_equity": 0.01,
        "rsi": 54.8,
        "pattern": "Ascending Channel",
        "esg": { "overall": 80, "environmental": 88, "social": 76, "governance": 77 },
        "trust_meter": {
            "score": 84,
            "promises_kept": 14,
            "promises_delayed": 2,
            "promises_broken": 0,
            "timeline": [
                {"promise": "Complete demerger of Hotels business", "made": "Q2 FY24", "status": "Kept"},
                {"promise": "Grow non-cigarette FMCG EBITDA margins to double digits", "made": "Q3 FY24", "status": "Kept"}
            ],
            "latest_quote": "FMCG revenue crossed landmark figures driven by packaged foods and personal care."
        },
        "forensic": { "reported_profit_growth": "+9%", "cash_flow_growth": "+10%", "receivables_growth": "+5%", "divergence_score": "High Cash Quality" },
        "dna": { "growth": 65, "debt": 2, "news_sensitivity": 48, "mgmt_reliability": 90, "market_fear": 28 }
    },
    {
        "symbol": "HINDUNILVR",
        "name": "Hindustan Unilever Ltd",
        "sector": "FMCG & Consumption",
        "price": 2480.00,
        "change": "+0.4%",
        "market_cap": "₹5.8L Cr",
        "pe_ratio": 54.1,
        "pb_ratio": 11.2,
        "net_margin": 17.2,
        "roe": 20.4,
        "revenue_growth": 5.4,
        "debt_to_equity": 0.02,
        "rsi": 46.2,
        "pattern": "Base Formation",
        "esg": { "overall": 85, "environmental": 89, "social": 84, "governance": 82 },
        "trust_meter": { "score": 83, "promises_kept": 13, "promises_delayed": 2, "promises_broken": 0, "timeline": [], "latest_quote": "Rural volume growth is gradually recovering." },
        "forensic": { "reported_profit_growth": "+6%", "cash_flow_growth": "+7%", "receivables_growth": "+4%", "divergence_score": "High Quality" },
        "dna": { "growth": 58, "debt": 4, "news_sensitivity": 42, "mgmt_reliability": 91, "market_fear": 30 }
    },
    {
        "symbol": "SBIN",
        "name": "State Bank of India",
        "sector": "Public Banking",
        "price": 812.30,
        "change": "+1.5%",
        "market_cap": "₹7.2L Cr",
        "pe_ratio": 10.4,
        "pb_ratio": 1.7,
        "net_margin": 14.8,
        "roe": 17.2,
        "revenue_growth": 16.1,
        "debt_to_equity": 11.2,
        "rsi": 59.0,
        "pattern": "Breakout Retest",
        "esg": { "overall": 73, "environmental": 64, "social": 78, "governance": 77 },
        "trust_meter": { "score": 79, "promises_kept": 12, "promises_delayed": 3, "promises_broken": 1, "timeline": [], "latest_quote": "Credit costs remain well below guided levels." },
        "forensic": { "reported_profit_growth": "+18%", "cash_flow_growth": "+15%", "receivables_growth": "+13%", "divergence_score": "Stable Banking Quality" },
        "dna": { "growth": 76, "debt": 85, "news_sensitivity": 70, "mgmt_reliability": 82, "market_fear": 45 }
    },
    {
        "symbol": "BHARTIARTL",
        "name": "Bharti Airtel Ltd",
        "sector": "Telecom & Digital",
        "price": 1640.20,
        "change": "+1.9%",
        "market_cap": "₹9.8L Cr",
        "pe_ratio": 48.0,
        "pb_ratio": 8.1,
        "net_margin": 9.4,
        "roe": 18.2,
        "revenue_growth": 14.8,
        "debt_to_equity": 1.4,
        "rsi": 66.5,
        "pattern": "Bullish Trendline",
        "esg": { "overall": 78, "environmental": 79, "social": 78, "governance": 77 },
        "trust_meter": { "score": 85, "promises_kept": 14, "promises_delayed": 1, "promises_broken": 0, "timeline": [], "latest_quote": "ARPU reached ₹211 with continuous postpaid upgrades." },
        "forensic": { "reported_profit_growth": "+22%", "cash_flow_growth": "+19%", "receivables_growth": "+10%", "divergence_score": "Healthy Growth" },
        "dna": { "growth": 84, "debt": 48, "news_sensitivity": 62, "mgmt_reliability": 87, "market_fear": 38 }
    },
    {
        "symbol": "LT",
        "name": "Larsen & Toubro Ltd",
        "sector": "Engineering & Infra",
        "price": 3520.00,
        "change": "+0.8%",
        "market_cap": "₹4.8L Cr",
        "pe_ratio": 34.2,
        "pb_ratio": 4.8,
        "net_margin": 6.8,
        "roe": 14.9,
        "revenue_growth": 18.4,
        "debt_to_equity": 0.82,
        "rsi": 53.4,
        "pattern": "Symmetrical Triangle",
        "esg": { "overall": 75, "environmental": 71, "social": 76, "governance": 78 },
        "trust_meter": { "score": 82, "promises_kept": 13, "promises_delayed": 2, "promises_broken": 1, "timeline": [], "latest_quote": "Order book stands at all-time high of ₹4.75 Lakh Crore." },
        "forensic": { "reported_profit_growth": "+16%", "cash_flow_growth": "+14%", "receivables_growth": "+16%", "divergence_score": "Fair (Working Capital Watch)" },
        "dna": { "growth": 80, "debt": 40, "news_sensitivity": 58, "mgmt_reliability": 86, "market_fear": 40 }
    },
    {
        "symbol": "BAJFINANCE",
        "name": "Bajaj Finance Ltd",
        "sector": "NBFC & Consumer Credit",
        "price": 6840.00,
        "change": "−0.6%",
        "market_cap": "₹4.2L Cr",
        "pe_ratio": 28.5,
        "pb_ratio": 5.4,
        "net_margin": 26.2,
        "roe": 21.8,
        "revenue_growth": 24.2,
        "debt_to_equity": 3.8,
        "rsi": 47.1,
        "pattern": "Support Zone",
        "esg": { "overall": 74, "environmental": 62, "social": 81, "governance": 79 },
        "trust_meter": { "score": 81, "promises_kept": 14, "promises_delayed": 2, "promises_broken": 1, "timeline": [], "latest_quote": "Omnichannel customer additions touched 4 million this quarter." },
        "forensic": { "reported_profit_growth": "+22%", "cash_flow_growth": "+20%", "receivables_growth": "+21%", "divergence_score": "High Quality NBFC" },
        "dna": { "growth": 88, "debt": 60, "news_sensitivity": 66, "mgmt_reliability": 85, "market_fear": 46 }
    },
    {
        "symbol": "SUNPHARMA",
        "name": "Sun Pharmaceutical Industries",
        "sector": "Pharma & Healthcare",
        "price": 1790.00,
        "change": "+1.1%",
        "market_cap": "₹4.3L Cr",
        "pe_ratio": 36.4,
        "pb_ratio": 6.2,
        "net_margin": 21.0,
        "roe": 17.5,
        "revenue_growth": 10.4,
        "debt_to_equity": 0.04,
        "rsi": 61.2,
        "pattern": "Bullish Breakout",
        "esg": { "overall": 79, "environmental": 78, "social": 82, "governance": 77 },
        "trust_meter": { "score": 83, "promises_kept": 13, "promises_delayed": 2, "promises_broken": 0, "timeline": [], "latest_quote": "Global specialty pharma portfolio grew 19% YoY." },
        "forensic": { "reported_profit_growth": "+15%", "cash_flow_growth": "+16%", "receivables_growth": "+8%", "divergence_score": "Strong Cash Conversion" },
        "dna": { "growth": 73, "debt": 6, "news_sensitivity": 55, "mgmt_reliability": 87, "market_fear": 32 }
    },
    {
        "symbol": "AXISBANK",
        "name": "Axis Bank Ltd",
        "sector": "Banking & Financials",
        "price": 1180.00,
        "change": "+0.5%",
        "market_cap": "₹3.6L Cr",
        "pe_ratio": 13.9,
        "pb_ratio": 2.1,
        "net_margin": 19.5,
        "roe": 16.4,
        "revenue_growth": 14.2,
        "debt_to_equity": 6.4,
        "rsi": 52.0,
        "pattern": "Hammer Reversal",
        "esg": { "overall": 75, "environmental": 67, "social": 79, "governance": 80 },
        "trust_meter": { "score": 78, "promises_kept": 11, "promises_delayed": 2, "promises_broken": 1, "timeline": [], "latest_quote": "Citibank integration completed ahead of planned schedule." },
        "forensic": { "reported_profit_growth": "+15%", "cash_flow_growth": "+13%", "receivables_growth": "+12%", "divergence_score": "Healthy Quality" },
        "dna": { "growth": 75, "debt": 68, "news_sensitivity": 64, "mgmt_reliability": 81, "market_fear": 44 }
    },
    {
        "symbol": "ONGC",
        "name": "Oil & Natural Gas Corp Ltd",
        "sector": "Energy & Oil Exploration",
        "price": 310.40,
        "change": "+3.1%",
        "market_cap": "₹3.9L Cr",
        "pe_ratio": 8.6,
        "pb_ratio": 1.1,
        "net_margin": 12.2,
        "roe": 14.1,
        "revenue_growth": 9.4,
        "debt_to_equity": 0.44,
        "rsi": 67.2,
        "pattern": "Multi-Year High Breakout",
        "esg": { "overall": 64, "environmental": 54, "social": 70, "governance": 68 },
        "trust_meter": { "score": 71, "promises_kept": 10, "promises_delayed": 3, "promises_broken": 2, "timeline": [], "latest_quote": "KG-DWN-98/2 deepwater block production ramping up." },
        "forensic": { "reported_profit_growth": "+11%", "cash_flow_growth": "+12%", "receivables_growth": "+7%", "divergence_score": "High Cash Realization" },
        "dna": { "growth": 68, "debt": 35, "news_sensitivity": 88, "mgmt_reliability": 73, "market_fear": 50 }
    },
    {
        "symbol": "NTPC",
        "name": "NTPC Ltd",
        "sector": "Power Generation & Green Energy",
        "price": 395.10,
        "change": "+1.4%",
        "market_cap": "₹3.8L Cr",
        "pe_ratio": 17.8,
        "pb_ratio": 2.2,
        "net_margin": 10.8,
        "roe": 13.4,
        "revenue_growth": 8.2,
        "debt_to_equity": 1.4,
        "rsi": 58.6,
        "pattern": "Steady Upchannel",
        "esg": { "overall": 68, "environmental": 58, "social": 74, "governance": 72 },
        "trust_meter": { "score": 77, "promises_kept": 12, "promises_delayed": 2, "promises_broken": 1, "timeline": [], "latest_quote": "Renewable capacity target of 60GW by 2032 firmly on track." },
        "forensic": { "reported_profit_growth": "+12%", "cash_flow_growth": "+11%", "receivables_growth": "+9%", "divergence_score": "Regulated Utility Cash Quality" },
        "dna": { "growth": 70, "debt": 58, "news_sensitivity": 50, "mgmt_reliability": 80, "market_fear": 34 }
    },
    {
        "symbol": "TATASTEEL",
        "name": "Tata Steel Ltd",
        "sector": "Metals & Mining",
        "price": 152.80,
        "change": "+0.7%",
        "market_cap": "₹1.9L Cr",
        "pe_ratio": 22.4,
        "pb_ratio": 2.1,
        "net_margin": 4.8,
        "roe": 9.2,
        "revenue_growth": 6.8,
        "debt_to_equity": 0.88,
        "rsi": 51.5,
        "pattern": "Doji Indecision",
        "esg": { "overall": 71, "environmental": 62, "social": 78, "governance": 74 },
        "trust_meter": { "score": 75, "promises_kept": 11, "promises_delayed": 3, "promises_broken": 1, "timeline": [], "latest_quote": "Port Talbot transition to electric arc furnace underway." },
        "forensic": { "reported_profit_growth": "+7%", "cash_flow_growth": "+6%", "receivables_growth": "+8%", "divergence_score": "Cyclical Margin Watch" },
        "dna": { "growth": 72, "debt": 55, "news_sensitivity": 82, "mgmt_reliability": 81, "market_fear": 58 }
    },
    {
        "symbol": "MARUTI",
        "name": "Maruti Suzuki India Ltd",
        "sector": "Automotive & Passenger Cars",
        "price": 12340.00,
        "change": "−0.4%",
        "market_cap": "₹3.8L Cr",
        "pe_ratio": 28.1,
        "pb_ratio": 4.5,
        "net_margin": 9.8,
        "roe": 16.8,
        "revenue_growth": 14.5,
        "debt_to_equity": 0.01,
        "rsi": 53.0,
        "pattern": "High Base Range",
        "esg": { "overall": 76, "environmental": 74, "social": 78, "governance": 76 },
        "trust_meter": { "score": 83, "promises_kept": 14, "promises_delayed": 1, "promises_broken": 0, "timeline": [], "latest_quote": "SUV market share surpassed 24% with strong hybrid demand." },
        "forensic": { "reported_profit_growth": "+18%", "cash_flow_growth": "+19%", "receivables_growth": "+7%", "divergence_score": "Cash Rich Quality" },
        "dna": { "growth": 75, "debt": 2, "news_sensitivity": 56, "mgmt_reliability": 89, "market_fear": 35 }
    },
    {
        "symbol": "ADANIENT",
        "name": "Adani Enterprises Ltd",
        "sector": "Conglomerate & Incubator",
        "price": 3120.00,
        "change": "+2.2%",
        "market_cap": "₹3.6L Cr",
        "pe_ratio": 61.4,
        "pb_ratio": 8.4,
        "net_margin": 4.7,
        "roe": 9.8,
        "revenue_growth": 11.1,
        "debt_to_equity": 1.6,
        "rsi": 57.0,
        "pattern": "High Beta Swing",
        "esg": { "overall": 58, "environmental": 54, "social": 60, "governance": 60 },
        "trust_meter": { "score": 68, "promises_kept": 9, "promises_delayed": 4, "promises_broken": 2, "timeline": [], "latest_quote": "Navi Mumbai Airport Phase 1 scheduled for commercial launch." },
        "forensic": { "reported_profit_growth": "+15%", "cash_flow_growth": "−8%", "receivables_growth": "+26%", "divergence_score": "Elevated Debt & Receivables Anomaly" },
        "dna": { "growth": 92, "debt": 78, "news_sensitivity": 95, "mgmt_reliability": 66, "market_fear": 72 }
    },
    {
        "symbol": "SPICEJET",
        "name": "SpiceJet Ltd",
        "sector": "Aviation & Case Study",
        "price": 54.20,
        "change": "−3.4%",
        "market_cap": "₹4,200 Cr",
        "pe_ratio": -8.2,
        "pb_ratio": -1.4,
        "net_margin": -14.2,
        "roe": -28.0,
        "revenue_growth": -6.5,
        "debt_to_equity": 2.3,
        "rsi": 38.0,
        "pattern": "Descending Breakdown",
        "esg": { "overall": 46, "environmental": 48, "social": 45, "governance": 45 },
        "trust_meter": {
            "score": 42,
            "promises_kept": 3,
            "promises_delayed": 6,
            "promises_broken": 7,
            "timeline": [
                {"promise": "Induct 20 grounded aircraft by Q3", "made": "Q1 FY24", "status": "Broken"},
                {"promise": "Clear lessor settlement payments", "made": "Q2 FY24", "status": "Delayed"}
            ],
            "latest_quote": "Qualified Institutional Placement successfully closed to resolve grounded fleet."
        },
        "forensic": {
            "reported_profit_growth": "−12%",
            "cash_flow_growth": "−42%",
            "receivables_growth": "+38%",
            "divergence_score": "Critical Collapse Risk Similarity (73% DHFL Pattern)"
        },
        "dna": { "growth": 45, "debt": 92, "news_sensitivity": 96, "mgmt_reliability": 40, "market_fear": 88 }
    }
]

# Write all 20 company JSON files
for comp in companies_data:
    filename = f"{comp['symbol'].lower()}.json"
    filepath = os.path.join(COMPANIES_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(comp, f, indent=2)

# Write Failures Data
failures = [
    {
        "case": "DHFL (2019 Collapse)",
        "year": 2019,
        "timeline": [
            {"months_prior": "12m", "category": "Cash Flow", "warning": "Operating cash flow turned negative despite reported profit growth."},
            {"months_prior": "9m", "category": "Receivables", "warning": "Receivables spiked 38% faster than top-line revenues."},
            {"months_prior": "7m", "category": "Leverage", "warning": "Short-term borrowings surged by 45% to plug cash burn."},
            {"months_prior": "5m", "category": "Guidance", "warning": "Management missed publicly stated debt repayment commitments."},
            {"months_prior": "3m", "category": "Audit", "warning": "Auditor flagged serious going-concern qualifications."},
            {"months_prior": "0m", "category": "Collapse", "warning": "Trading suspended; stock plummeted 88%."}
        ]
    }
]
with open(os.path.join(FAILURES_DIR, "historical_cases.json"), "w", encoding="utf-8") as f:
    json.dump(failures, f, indent=2)

# Write Macro Dominos
macro_dominos = [
    {
        "event": "Crude Oil +30%",
        "depth": 4,
        "steps": [
            {"order": 1, "title": "Direct impact", "description": "Crude oil rises 30% — jet fuel and refining input costs surge across all airlines & refiners."},
            {"order": 2, "title": "2nd-order effect", "description": "IndiGo & SpiceJet operating margins compress by 180 to 260 bps."},
            {"order": 3, "title": "3rd-order effect", "description": "Airlines pass fuel costs on — average airfares increase 8% to 12%."},
            {"order": 4, "title": "4th-order endpoint", "description": "Domestic leisure travel demand softens 6%, causing secondary occupancy drag on hotel chains (Indian Hotels, Lemon Tree)."}
        ],
        "affected_companies": [
            {"name": "IndiGo", "type": "hit", "impact": "Margins -220bps"},
            {"name": "SpiceJet", "type": "hit", "impact": "High fuel vulnerability"},
            {"name": "ONGC", "type": "benefit", "impact": "Net crude realization +$12/bbl"},
            {"name": "Indian Hotels", "type": "drag", "impact": "Leisure travel elasticity"}
        ]
    },
    {
        "event": "RBI Rate Cut 50bps",
        "depth": 3,
        "steps": [
            {"order": 1, "title": "Direct impact", "description": "Lending benchmark rates fall — bank borrowing costs ease immediately."},
            {"order": 2, "title": "2nd-order effect", "description": "Retail home loan and auto loan credit demand expands by 14–18%."},
            {"order": 3, "title": "3rd-order endpoint", "description": "Automotive OEMs (Tata Motors, Maruti) and real estate developers experience surge in pre-sales."}
        ],
        "affected_companies": [
            {"name": "HDFC Bank", "type": "benefit", "impact": "Credit growth +16%"},
            {"name": "Tata Motors", "type": "benefit", "impact": "Auto financing affordability"},
            {"name": "Bajaj Finance", "type": "benefit", "impact": "AUM expansion"}
        ]
    }
]
with open(os.path.join(BASE_DATA_DIR, "macro_dominos.json"), "w", encoding="utf-8") as f:
    json.dump(macro_dominos, f, indent=2)

print("Top 20 Companies, Failures, and Macro Dominos seeded successfully!")
