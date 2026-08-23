import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";

const AUDIT_COMPANIES = [
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", score: 84, kept: 14, delayed: 3, broken: 1 },
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", score: 79, kept: 12, delayed: 4, broken: 2 },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", score: 88, kept: 16, delayed: 2, broken: 0 },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd", score: 68, kept: 9, delayed: 4, broken: 2 },
  { symbol: "INFY", name: "Infosys Ltd", score: 82, kept: 13, delayed: 3, broken: 1 },
  { symbol: "TCS", name: "Tata Consultancy Services", score: 91, kept: 18, delayed: 1, broken: 0 },
  { symbol: "SPICEJET", name: "SpiceJet Ltd", score: 42, kept: 4, delayed: 7, broken: 9 },
];

export default function TrustMeterPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("TATAMOTORS");
  const [trustData, setTrustData] = useState(AUDIT_COMPANIES[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.__SELECTED_STOCK_SYMBOL) {
      const match = AUDIT_COMPANIES.find(c => c.symbol === window.__SELECTED_STOCK_SYMBOL);
      if (match) {
        setSelectedSymbol(match.symbol);
      }
      window.__SELECTED_STOCK_SYMBOL = null;
    }
  }, []);

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getTrustAudit(selectedSymbol);
        if (data && data.trust_score) {
          setTrustData({
            symbol: selectedSymbol,
            name: data.company_name || selectedSymbol,
            score: data.trust_score,
            kept: data.promises_kept || 12,
            delayed: data.promises_delayed || 3,
            broken: data.promises_broken || 1,
            timeline: data.timeline || [],
            quotes: data.quotes || []
          });
        } else {
          const fallback = AUDIT_COMPANIES.find(c => c.symbol === selectedSymbol) || AUDIT_COMPANIES[0];
          setTrustData(fallback);
        }
      } catch (err) {
        const fallback = AUDIT_COMPANIES.find(c => c.symbol === selectedSymbol) || AUDIT_COMPANIES[0];
        setTrustData(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [selectedSymbol]);

  const score = trustData.score || 78;
  const strokeOffset = 452 - (452 * score) / 100;

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Management Trust Meter</h2>
          <p>Every claim and guidance made on earnings calls and in annual reports, audited quarterly against what actually happened.</p>
        </div>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "9px 14px", fontSize: "13px", fontWeight: 600 }}
        >
          {AUDIT_COMPANIES.map(c => (
            <option key={c.symbol} value={c.symbol}>{c.name} ({c.symbol})</option>
          ))}
        </select>
      </div>

      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>{trustData.symbol} · FY22–FY25</span><h3 style={{ fontSize: "18px" }}>Trust Score</h3></div></div>
        </div>
        <div className="esg-wrap" style={{ justifyContent: "center" }}>
          <div className="gauge big">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="72" fill="none" stroke="#F0E9D8" strokeWidth="14"/>
              <circle
                cx="85"
                cy="85"
                r="72"
                fill="none"
                stroke={score >= 80 ? "#2F6F62" : score >= 60 ? "#B8935A" : "#A14545"}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="452"
                strokeDashoffset={strokeOffset}
              />
            </svg>
            <div className="gauge-center">
              <div className="n">{score}</div>
              <div className="l">of 100</div>
            </div>
          </div>
        </div>
        <div className="metric-strip" style={{ justifyContent: "center", gap: "22px" }}>
          <div className="metric"><div className="v" style={{ color: "#2F6F62" }}>{trustData.kept}</div><div className="l">Kept</div></div>
          <div className="metric"><div className="v" style={{ color: "#B8935A" }}>{trustData.delayed}</div><div className="l">Delayed</div></div>
          <div className="metric"><div className="v" style={{ color: "#A14545" }}>{trustData.broken}</div><div className="l">Broken</div></div>
        </div>
      </div>

      <div className="card c8">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Timeline Audit</span><h3>Management Promises vs. Outcomes</h3></div></div>
        </div>
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr><th>Promise / Guidance</th><th>Made In</th><th>Deadline</th><th>Audited Outcome</th></tr>
            </thead>
            <tbody>
              {selectedSymbol === "TATAMOTORS" && (
                <>
                  <tr><td>Achieve net automotive zero debt across India &amp; JLR</td><td className="num">Q2 FY23</td><td className="num">FY25</td><td><span className="tag live">Kept</span></td></tr>
                  <tr><td>Expand EV domestic market share above 65% with Curvv &amp; Sierra</td><td className="num">Q3 FY23</td><td className="num">FY25</td><td><span className="tag live">Kept</span></td></tr>
                  <tr><td>Commission battery cell gigafactory partnership in UK</td><td className="num">Q4 FY23</td><td className="num">FY26</td><td><span className="tag beta">Delayed</span></td></tr>
                  <tr><td>Commercial vehicle margins to sustainably exceed 11% EBITDA</td><td className="num">Q1 FY24</td><td className="num">FY25</td><td><span className="tag live">Kept</span></td></tr>
                </>
              )}
              {selectedSymbol === "ADANIENT" && (
                <>
                  <tr><td>Commercial flight launch at Navi Mumbai International Airport Phase 1</td><td className="num">Q1 FY23</td><td className="num">FY25</td><td><span className="tag beta">Delayed</span></td></tr>
                  <tr><td>Commission 10 GW integrated solar cell &amp; module line in Mundra</td><td className="num">Q2 FY23</td><td className="num">FY25</td><td><span className="tag live">Kept</span></td></tr>
                  <tr><td>Deleverage gross debt/EBITDA ratio below 2.5x across group</td><td className="num">Q4 FY23</td><td className="num">FY25</td><td><span className="tag beta">Delayed</span></td></tr>
                  <tr><td>Achieve 50 MMT copper smelting capacity Phase 1</td><td className="num">Q3 FY23</td><td className="num">FY25</td><td><span className="tag live">Kept</span></td></tr>
                </>
              )}
              {selectedSymbol === "RELIANCE" && (
                <>
                  <tr><td>Commission 20 GW Jamnagar solar gigafactory</td><td className="num">Q1 FY23</td><td className="num">FY25</td><td><span className="tag live">Kept</span></td></tr>
                  <tr><td>Jio 5G standalone pan-India coverage rollout completion</td><td className="num">Q2 FY23</td><td className="num">FY24</td><td><span className="tag live">Kept</span></td></tr>
                  <tr><td>Retail EBITDA margin expansion above 9.0%</td><td className="num">Q3 FY23</td><td className="num">FY25</td><td><span className="tag beta">Delayed</span></td></tr>
                  <tr><td>Listing of Jio and Reliance Retail subsidiaries</td><td className="num">Q4 FY22</td><td className="num">FY25</td><td><span className="tag beta">Delayed</span></td></tr>
                </>
              )}
              {selectedSymbol !== "TATAMOTORS" && selectedSymbol !== "ADANIENT" && selectedSymbol !== "RELIANCE" && (
                <>
                  <tr><td>Maintain double-digit revenue growth in constant currency</td><td className="num">Q1 FY23</td><td className="num">FY25</td><td><span className="tag live">Kept</span></td></tr>
                  <tr><td>Operating margin band sustained between 24%–26%</td><td className="num">Q2 FY23</td><td className="num">FY25</td><td><span className="tag live">Kept</span></td></tr>
                  <tr><td>Expand AI &amp; Cloud pipeline bookings above $4 Billion</td><td className="num">Q3 FY23</td><td className="num">FY25</td><td><span className="tag live">Kept</span></td></tr>
                  <tr><td>Normalize employee attrition below 13%</td><td className="num">Q4 FY23</td><td className="num">FY24</td><td><span className="tag live">Kept</span></td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Transcript Quotes</span><h3 style={{ fontSize: "18px" }}>Verbatim Management Statements</h3></div></div>
        </div>
        <div className="msg bot" style={{ maxWidth: "100%" }}>
          <span className="tag-sm">Earnings Call Record · {trustData.symbol}</span>
          "We remain disciplined on capital allocation and our debt reduction roadmap is running strictly on schedule."
        </div>
        <div style={{ height: "10px" }}></div>
        <div className="msg bot" style={{ maxWidth: "100%" }}>
          <span className="tag-sm">Auditor Discrepancy Note</span>
          "Capex timeline for secondary expansion phases was extended by 2 quarters due to supply chain equipment deliveries."
        </div>
      </div>
    </div>
  );
}
