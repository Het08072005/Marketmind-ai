import React, { useState } from "react";

export default function AccountingCheckerPage({ goPage }) {
  const [selectedStock, setSelectedStock] = useState("Company X (illustrative)");

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Accounting Reality Checker</h2>
          <p>Headline profit isn't the whole story. We cross-check it against cash flow, receivables and debt to see if growth quality holds up.</p>
        </div>
        <select
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "9px 12px", fontSize: "12.5px" }}
        >
          <option>Company X (illustrative)</option>
          <option>Reliance Industries</option>
          <option>TCS</option>
        </select>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Signal Check</span><h3 style={{ fontSize: "18px" }}>Headline vs. Underlying</h3></div></div>
        </div>
        <div className="metric-flag-row">
          <div className="ml">Reported Profit</div>
          <div className="mv good">+24% <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div>
        </div>
        <div className="metric-flag-row">
          <div className="ml">Operating Cash Flow</div>
          <div className="mv bad">−17% <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>
        </div>
        <div className="metric-flag-row">
          <div className="ml">Receivables Growth</div>
          <div className="mv bad">+41% <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>
        </div>
        <div className="metric-flag-row">
          <div className="ml">Total Debt</div>
          <div className="mv bad">+22% <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>
        </div>
        <div className="verdict-box">
          <div className="vi">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>
          </div>
          <div>
            <div className="vl">AI Verdict</div>
            <div className="vt">Profit growth quality looks questionable.</div>
          </div>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "12px" }}>
          <a className="link-btn" onClick={() => goPage("trust")}>
            Investigate why <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Trend</span><h3>Profit vs. Cash Flow Divergence</h3></div></div>
        </div>
        <svg viewBox="0 0 560 150" width="100%" height="150" preserveAspectRatio="none">
          <line x1="0" y1="40" x2="560" y2="40" stroke="#EEE6D2"/>
          <line x1="0" y1="80" x2="560" y2="80" stroke="#EEE6D2"/>
          <line x1="0" y1="120" x2="560" y2="120" stroke="#EEE6D2"/>
          <polyline
            points="0,110 80,100 160,88 240,72 320,58 400,44 480,32 560,20"
            fill="none"
            stroke="#B8935A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="0,90 80,86 160,92 240,78 320,96 400,84 480,104 560,116"
            fill="none"
            stroke="#A14545"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5 4"
          />
        </svg>
        <div className="legend">
          <span><i style={{ background: "var(--gold)" }}></i>Reported Net Profit</span>
          <span><i style={{ background: "var(--rose)" }}></i>Operating Cash Flow</span>
        </div>
        <p style={{ fontSize: "12.5px", color: "var(--ink-soft)", lineHeight: "1.6", marginTop: "10px" }}>
          Profit and cash flow have moved in opposite directions for three consecutive quarters — a classic early signal of earnings that are booked faster than they are collected.
        </p>
      </div>

      <div className="section-title"><h2>Portfolio Quality Scan</h2><div className="rule"></div></div>
      <div className="card c12">
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr><th>Company</th><th>Profit Gr.</th><th>Cash Flow Gr.</th><th>Divergence</th><th>Quality Score</th></tr>
            </thead>
            <tbody>
              <tr><td className="sym">TCS</td><td className="num">+11%</td><td className="num">+13%</td><td className="num">−2 pts</td><td><span className="tag live">92 · Strong</span></td></tr>
              <tr><td className="sym">Reliance</td><td className="num">+14%</td><td className="num">+9%</td><td className="num">+5 pts</td><td><span className="tag beta">78 · Fair</span></td></tr>
              <tr><td className="sym">Company X</td><td className="num">+24%</td><td className="num">−17%</td><td className="num">+41 pts</td><td><span className="tag new">34 · Weak</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
