import { COMPANY_NAME_MAP } from "../data/allCompaniesUniverse.js";

const PRIORITY_ALIASES = [
  { regex: /\badani\s*ent(?:erprise[s]?)?\b/i, symbol: "ADANIENT", name: "Adani Enterprises" },
  { regex: /\badani\s*port[s]?\b/i, symbol: "ADANIPORTS", name: "Adani Ports" },
  { regex: /\badani\s*green\b/i, symbol: "ADANIGREEN", name: "Adani Green Energy" },
  { regex: /\badani\s*power\b/i, symbol: "ADANIPOWER", name: "Adani Power" },
  { regex: /\badani\s*total\b/i, symbol: "ATGL", name: "Adani Total Gas" },
  { regex: /\badani\s*wilmar\b/i, symbol: "AWL", name: "Adani Wilmar" },
  { regex: /\btata\s*motor[s]?\b/i, symbol: "TATAMOTORS", name: "Tata Motors" },
  { regex: /\btata\s*steel\b/i, symbol: "TATASTEEL", name: "Tata Steel" },
  { regex: /\btata\s*power\b/i, symbol: "TATAPOWER", name: "Tata Power" },
  { regex: /\btcs\b|\btata\s*consultancy\b/i, symbol: "TCS", name: "Tata Consultancy Services" },
  { regex: /\breliance(?:\s*ind(?:ustries)?)?\b/i, symbol: "RELIANCE", name: "Reliance Industries" },
  { regex: /\bhdfc\s*bank\b/i, symbol: "HDFCBANK", name: "HDFC Bank" },
  { regex: /\bhdfc\b/i, symbol: "HDFCBANK", name: "HDFC Bank" },
  { regex: /\bicici(?:\s*bank)?\b/i, symbol: "ICICIBANK", name: "ICICI Bank" },
  { regex: /\bsbi\b|\bstate\s*bank(?:\s*of\s*india)?\b/i, symbol: "SBIN", name: "State Bank of India" },
  { regex: /\bcoal\s*india\b/i, symbol: "COALINDIA", name: "Coal India" },
  { regex: /\binfosys\b|\binfy\b/i, symbol: "INFY", name: "Infosys" },
  { regex: /\bzomato\b/i, symbol: "ZOMATO", name: "Zomato" },
  { regex: /\bswiggy\b/i, symbol: "SWIGGY", name: "Swiggy" },
  { regex: /\bpaytm\b/i, symbol: "PAYTM", name: "Paytm" },
  { regex: /\bbharti\s*airtel\b|\bairtel\b/i, symbol: "BHARTIARTL", name: "Bharti Airtel" },
  { regex: /\bitc\b/i, symbol: "ITC", name: "ITC Ltd" },
  { regex: /\bl&t\b|\blarsen\b/i, symbol: "LT", name: "Larsen & Toubro" },
  { regex: /\bwipro\b/i, symbol: "WIPRO", name: "Wipro" },
  { regex: /\bmaruti(?:\s*suzuki)?\b/i, symbol: "MARUTI", name: "Maruti Suzuki" },
  { regex: /\btitan\b/i, symbol: "TITAN", name: "Titan Company" },
  { regex: /\bbajaj\s*finance\b/i, symbol: "BAJFINANCE", name: "Bajaj Finance" },
  { regex: /\bbajaj\s*finserv\b/i, symbol: "BAJAJFINSV", name: "Bajaj Finserv" },
  { regex: /\bkotak(?:\s*bank)?\b/i, symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
  { regex: /\baxis(?:\s*bank)?\b/i, symbol: "AXISBANK", name: "Axis Bank" },
  { regex: /\bhal\b|\bhindustan\s*aeronautics\b/i, symbol: "HAL", name: "Hindustan Aeronautics" },
  { regex: /\bbel\b|\bbharat\s*electronics\b/i, symbol: "BEL", name: "Bharat Electronics" },
  { regex: /\bdlf\b/i, symbol: "DLF", name: "DLF Ltd" },
  { regex: /\bvedanta\b|\bvedl\b/i, symbol: "VEDL", name: "Vedanta Ltd" },
  { regex: /\btrent\b/i, symbol: "TRENT", name: "Trent Ltd" },
  { regex: /\bsun\s*pharma\b/i, symbol: "SUNPHARMA", name: "Sun Pharma" },
  { regex: /\bdr\s*reddy\b/i, symbol: "DRREDDY", name: "Dr Reddy's Laboratories" },
  { regex: /\bcipla\b/i, symbol: "CIPLA", name: "Cipla" },
  { regex: /\beicher\b/i, symbol: "EICHERMOT", name: "Eicher Motors" },
  { regex: /\bapollo\s*hosp\b/i, symbol: "APOLLOHOSP", name: "Apollo Hospitals" },
  { regex: /\bultratech\b/i, symbol: "ULTRACEMCO", name: "UltraTech Cement" },
  { regex: /\basian\s*paints\b/i, symbol: "ASIANPAINT", name: "Asian Paints" },
  { regex: /\bntpc\b/i, symbol: "NTPC", name: "NTPC Ltd" },
  { regex: /\bpower\s*grid\b/i, symbol: "POWERGRID", name: "Power Grid Corp" },
  { regex: /\bm&m\b|\bmahindra\b/i, symbol: "M&M", name: "Mahindra & Mahindra" },
  { regex: /\bhcl\b/i, symbol: "HCLTECH", name: "HCL Technologies" },
  { regex: /\bongc\b/i, symbol: "ONGC", name: "Oil & Natural Gas Corp" },
  { regex: /\bjsw\s*steel\b/i, symbol: "JSWSTEEL", name: "JSW Steel" },
  { regex: /\bhindalco\b/i, symbol: "HINDALCO", name: "Hindalco Industries" },
  { regex: /\bbpcl\b/i, symbol: "BPCL", name: "Bharat Petroleum" },
];

/**
 * Robust matcher to find an Indian stock symbol & name from natural language query or voice transcript.
 * Handles spoken forms, Hindi/Hinglish phrasing, and multi-word company names.
 */
export function findStockInText(text) {
  if (!text || typeof text !== "string") return null;
  const lower = text.toLowerCase().trim();
  if (!lower) return null;

  // 1. High priority alias matching
  for (const item of PRIORITY_ALIASES) {
    if (item.regex.test(lower)) {
      return { symbol: item.symbol, name: item.name };
    }
  }

  // 2. Generic scan against COMPANY_NAME_MAP
  if (COMPANY_NAME_MAP && typeof COMPANY_NAME_MAP === "object") {
    for (const [sym, fullName] of Object.entries(COMPANY_NAME_MAP)) {
      const sLow = sym.toLowerCase();
      const nLow = (fullName || "").toLowerCase();

      // Check full company name match first (minimum 4 chars)
      if (nLow.length >= 4 && lower.includes(nLow)) {
        return { symbol: sym, name: fullName || sym };
      }
      // Check symbol match (minimum 3 chars, or surrounded by word boundary)
      if (sLow.length >= 3) {
        const symRegex = new RegExp(`\\b${sLow}\\b`, "i");
        if (symRegex.test(lower)) {
          return { symbol: sym, name: fullName || sym };
        }
      }
    }
  }

  // 3. Fallback: single word "adani" -> default to ADANIENT
  if (/\badani\b/i.test(lower)) {
    return { symbol: "ADANIENT", name: "Adani Enterprises" };
  }
  if (/\btata\b/i.test(lower)) {
    return { symbol: "TATAMOTORS", name: "Tata Motors" };
  }

  return null;
}
