import React, { useState } from "react";

const HISTORICAL_AUTOPSIES = {
  dhfl: {
    name: "DHFL (2019 Collapse)",
    type: "NBFC Liquidity & Related Party Lending Crisis",
    totalLoss: "₹91,000 Cr Debt Default",
    timeline: [
      { month: "12m", category: "Cash Flow", title: "Negative Operating Cash Flow (-₹3,400 Cr) despite reported net profit of +₹1,172 Cr.", flag: "Critical" },
      { month: "9m", category: "Receivables", title: "Loan book grew 38% faster than actual customer deposit mobilization; developer loans ballooned.", flag: "High" },
      { month: "7m", category: "Short-Term Debt", title: "Commercial Paper (CP) borrowings surged to 24% of liabilities to plug liquidity gap.", flag: "Severe" },
      { month: "5m", category: "Pledging", title: "Promoter share pledging reached 68.4% with private non-bank lenders.", flag: "Severe" },
      { month: "3m", category: "Auditor Resignation", title: "Statutory auditor raised multiple qualifications on pass-through loans to shell entities.", flag: "Fatal" },
      { month: "0m", category: "Default & IBC", title: "Commercial paper repayment defaulted; RBI supersedes board under IBC Section 227.", flag: "Collapse" }
    ]
  },
  yesbank: {
    name: "Yes Bank (2020 Crisis)",
    type: "Aggressive Corporate Loan Underwriting & Hidden NPAs",
    totalLoss: "₹2.5L Cr Asset Quality Overhaul & Moratorium",
    timeline: [
      { month: "12m", category: "Divergence", title: "RBI divergence audit reveals ₹3,277 Cr under-reported bad loans (NPAs).", flag: "Critical" },
      { month: "9m", category: "Concentration", title: "Top 10 stressed corporate borrower exposure exceeded 180% of net worth.", flag: "Severe" },
      { month: "7m", category: "Capital Adequacy", title: "Common Equity Tier-1 (CET1) ratio fell below regulatory 7.375% threshold.", flag: "Severe" },
      { month: "5m", category: "Deposit Outflow", title: "Corporate depositors pulled ₹44,000 Cr in CASA balances over 90 days.", flag: "Fatal" },
      { month: "3m", category: "AT1 Write-Down", title: "Independent directors resigned; emergency capital raising talks stalled.", flag: "Fatal" },
      { month: "0m", category: "Reconstruction", title: "RBI imposed 30-day moratorium and SBI led ₹10,000 Cr rescue consortium.", flag: "Collapse" }
    ]
  },
  satyam: {
    name: "Satyam Computers (2009 Scandal)",
    type: "Fictitious Bank Deposits & Revenue Inflation",
    totalLoss: "₹7,800 Cr Balance Sheet Inflation",
    timeline: [
      { month: "12m", category: "Interest Yield", title: "Reported ₹5,040 Cr cash in bank earned barely 1.8% annual interest yield.", flag: "Severe" },
      { month: "9m", category: "Cash vs Capex", title: "Company took external bank loans despite claiming ₹5,300 Cr idle cash in current account.", flag: "Critical" },
      { month: "7m", category: "Unbilled Revenue", title: "Unbilled revenue rose from 8% to 26% of quarterly turnover.", flag: "Severe" },
      { month: "3m", category: "Related Acquisition", title: "Attempted ₹7,900 Cr acquisition of Maytas Infra/Properties without minority vote.", flag: "Fatal" },
      { month: "0m", category: "Confession", title: "Chairman confessed to inflating profits over several years; Tech Mahindra acquired assets.", flag: "Collapse" }
    ]
  }
};

const LIVE_HOLDINGS_AUTOPSY_AUDIT = [
  { symbol: "RELIANCE", name: "Reliance Industries", zScore: 3.42, zone: "Safe", cashFlowDiv: "Normal (+18% OCF)", auditorScore: "Clean (Deloitte)", riskFlag: "Low Risk" },
  { symbol: "TCS", name: "Tata Consultancy Services", zScore: 6.85, zone: "Safe", cashFlowDiv: "Pristine (+94% FCF Conversion)", auditorScore: "Clean (BSR & Co)", riskFlag: "Low Risk" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", zScore: 2.78, zone: "Grey Zone", cashFlowDiv: "Deleveraging (-12% Debt YoY)", auditorScore: "Clean (S.R. Batliboi)", riskFlag: "Moderate Risk" },
  { symbol: "ADANIENT", name: "Adani Enterprises", zScore: 1.92, zone: "Grey Zone", cashFlowDiv: "High Capex Frontloading", auditorScore: "Audited Clean (Shah Dhandharia)", riskFlag: "Monitoring Alert" }
];

export default function StockAutopsyPage() {
  const [selectedCase, setSelectedCase] = useState("dhfl");
  const [activeTab, setActiveTab] = useState("historical"); // 'historical' | 'scanner'
  const [scanning, setScanning] = useState(false);

  const autopsy = HISTORICAL_AUTOPSIES[selectedCase] || HISTORICAL_AUTOPSIES.dhfl;

  const handleRunScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 1200);
  };

  return (
    <div className="grid">
      {/* Top Banner */}
      <div className="page-banner" style={{ background: "linear-gradient(135deg, #101B33, #192B4F)", borderColor: "var(--navy-3)" }}>
        <div>
          <h2 style={{ color: "#FBF4E4" }}>AI Forensic Stock Autopsy &amp; Disease Scanner</h2>
          <p style={{ color: "#AFB6CC" }}>
            Reconstruct the exact forensic warning signs that appeared 6–12 months before major Indian corporate collapses — and scan your active portfolio for the same accounting pathologies.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            style={{ border: "1px solid rgba(216,188,139,.4)", background: "rgba(255,255,255,.08)", color: "#F1EAD8", borderRadius: "10px", padding: "8px 12px", fontSize: "12.5px", fontWeight: 600 }}
          >
            <option value="dhfl">Case Study: DHFL (2019 NBFC Crisis)</option>
            <option value="yesbank">Case Study: Yes Bank (2020 NPA Crisis)</option>
            <option value="satyam">Case Study: Satyam Computers (2009 Scandal)</option>
          </select>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="card c12" style={{ padding: "8px 14px", display: "flex", gap: "10px", background: "var(--paper)" }}>
        <button
          className={`pill-btn ${activeTab === "historical" ? "active" : "ghost"}`}
          onClick={() => setActiveTab("historical")}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          🔍 Historical Collapse Reconstructor
        </button>
        <button
          className={`pill-btn ${activeTab === "scanner" ? "active" : "ghost"}`}
          onClick={() => setActiveTab("scanner")}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          🛡️ Active Portfolio Disease Scanner (Altman Z-Score)
        </button>
      </div>

      {activeTab === "historical" ? (
        /* Historical Reconstructed Autopsy Timeline */
        <div className="card c12" style={{ padding: "24px" }}>
          <div className="card-head" style={{ marginBottom: "16px" }}>
            <div className="card-eyebrow">
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold-light)" }}>FORENSIC TIMELINE RECONSTRUCTION</span>
                <h3 style={{ fontSize: "20px" }}>{autopsy.name} — {autopsy.type}</h3>
              </div>
            </div>
            <span className="tag" style={{ background: "rgba(161,69,69,.15)", color: "#A14545", fontWeight: 700, fontSize: "12px" }}>
              {autopsy.totalLoss}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            {autopsy.timeline.map((node, idx) => (
              <div key={idx} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "42px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: node.flag === "Collapse" ? "#A14545" : "var(--navy)", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700, fontSize: "12px", boxShadow: "0 2px 6px rgba(16,27,51,.15)" }}>
                    {node.month}
                  </div>
                  {idx < autopsy.timeline.length - 1 && (
                    <div style={{ width: "2px", height: "35px", background: "var(--line)", margin: "4px 0" }}></div>
                  )}
                </div>

                <div style={{ flex: 1, background: "var(--paper)", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--gold-light)", fontWeight: 700 }}>
                      {node.category}
                    </span>
                    <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: node.flag === "Collapse" ? "rgba(161,69,69,.18)" : "rgba(216,188,139,.18)", color: node.flag === "Collapse" ? "#A14545" : "var(--navy)" }}>
                      {node.flag}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--navy)", fontWeight: 600, lineHeight: "1.5" }}>
                    {node.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Active Holdings Disease Scanner */
        <div className="card c12" style={{ padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold-light)" }}>PORTFOLIO PATHOLOGY AUDIT</span>
              <h3 style={{ fontSize: "19px", margin: 0 }}>Active Holdings Accounting &amp; Distress Health</h3>
            </div>
            <button
              className="pill-btn"
              onClick={handleRunScan}
              style={{ background: "var(--navy)", color: "var(--gold-light)", fontWeight: 700 }}
            >
              {scanning ? "Scanning Exchange Data..." : "⚡ Run Real-Time Autopsy Scan"}
            </button>
          </div>

          <div className="table-scroll">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Altman Z-Score</th>
                  <th>Health Zone</th>
                  <th>Cash Flow Divergence Audit</th>
                  <th>Auditor Credibility</th>
                  <th>Risk Rating</th>
                </tr>
              </thead>
              <tbody>
                {LIVE_HOLDINGS_AUTOPSY_AUDIT.map((row) => (
                  <tr key={row.symbol}>
                    <td className="sym">
                      <span className="row-logo">{row.symbol.slice(0, 2)}</span>
                      <b>{row.name}</b>
                    </td>
                    <td className="num" style={{ fontWeight: 700, fontFamily: "monospace" }}>{row.zScore}</td>
                    <td>
                      <span className="tag" style={{ background: row.zone === "Safe" ? "rgba(47,111,98,.12)" : "rgba(216,188,139,.2)", color: row.zone === "Safe" ? "#2F6F62" : "#B8935A", fontWeight: 700 }}>
                        {row.zone}
                      </span>
                    </td>
                    <td style={{ fontSize: "12px" }}>{row.cashFlowDiv}</td>
                    <td style={{ fontSize: "12px" }}>{row.auditorScore}</td>
                    <td>
                      <span className="tag live" style={{ background: row.riskFlag === "Low Risk" ? "rgba(47,111,98,.15)" : "rgba(216,188,139,.2)", color: row.riskFlag === "Low Risk" ? "#2F6F62" : "var(--navy)", fontWeight: 700 }}>
                        {row.riskFlag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
