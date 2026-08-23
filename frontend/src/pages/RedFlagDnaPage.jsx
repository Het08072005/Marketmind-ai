import React from "react";

export default function RedFlagDnaPage() {
  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Financial Red-Flag DNA</h2>
          <p>The failure fingerprint of historical collapses like Satyam and Yes Bank, matched against companies you hold or watch today.</p>
        </div>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>SpiceJet</span><h3 style={{ fontSize: "18px" }}>Historical Risk Similarity</h3></div></div>
        </div>
        <div className="esg-wrap" style={{ justifyContent: "center" }}>
          <div className="gauge big">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="72" fill="none" stroke="#F0E9D8" strokeWidth="14"/>
              <circle cx="85" cy="85" r="72" fill="none" stroke="#A14545" strokeWidth="14" strokeLinecap="round" strokeDasharray="452" strokeDashoffset="122"/>
            </svg>
            <div className="gauge-center">
              <div className="n">73%</div>
              <div className="l">vs. DHFL pattern</div>
            </div>
          </div>
        </div>
        <p style={{ fontSize: "12.5px", color: "var(--ink-soft)", textAlign: "center", lineHeight: "1.6" }}>
          Matched on leverage trajectory, receivables growth and auditor commentary tone — diverges mainly on promoter shareholding stability.
        </p>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Marker-by-Marker</span><h3>Matched Red Flags</h3></div></div>
        </div>
        <div className="checklist-row"><div className="ci hit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></div>Operating cash flow negative for 2+ consecutive quarters</div>
        <div className="checklist-row"><div className="ci hit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></div>Debt-to-equity rising faster than industry average</div>
        <div className="checklist-row"><div className="ci hit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></div>Related-party transactions increasing as % of revenue</div>
        <div className="checklist-row"><div className="ci hit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></div>Frequent auditor or CFO changes within 24 months</div>
        <div className="checklist-row"><div className="ci miss"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="m5 13 4 4L19 7"/></svg></div>Promoter pledge of shares above 50%</div>
        <div className="checklist-row"><div className="ci miss"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="m5 13 4 4L19 7"/></svg></div>Sudden auditor resignation without clear reason</div>
      </div>

      <div className="section-title"><h2>Failure Pattern Library</h2><div className="rule"></div></div>
      <div className="card c12">
        <div className="mini-grid">
          <div className="mini-card">
            <div className="mi-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2v20"/><path d="M6 3h11l-3 4 3 4H6"/></svg></div>
            <h4>DHFL (2019)</h4>
            <p>Cash flow mismatch, aggressive receivables build-up, credit-rating downgrade cascade.</p>
          </div>
          <div className="mini-card">
            <div className="mi-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2v20"/><path d="M6 3h11l-3 4 3 4H6"/></svg></div>
            <h4>Yes Bank (2020)</h4>
            <p>Loan book concentration, delayed NPA recognition, governance red flags ignored.</p>
          </div>
          <div className="mini-card">
            <div className="mi-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2v20"/><path d="M6 3h11l-3 4 3 4H6"/></svg></div>
            <h4>Satyam (2009)</h4>
            <p>Fabricated cash balances, inflated revenue, whistleblower-triggered collapse.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
