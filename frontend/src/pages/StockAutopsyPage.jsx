import React, { useState } from "react";

export default function StockAutopsyPage({ goPage }) {
  const [caseStudy, setCaseStudy] = useState("Case Study: DHFL (2019 Collapse)");
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
    setScanned(true);
    setTimeout(() => setScanned(false), 3000);
  };

  return (
    <div className="grid">
      <div className="page-banner" style={{ background: "linear-gradient(135deg,#12213D,#1B2F52)", borderColor: "var(--navy-3)" }}>
        <div>
          <h2 style={{ color: "#FBF4E4" }}>AI Stock Autopsy</h2>
          <p style={{ color: "#AFB6CC" }}>
            Reconstruct the hidden warning signs that appeared 6–12 months before a real collapse — then scan your own holdings for the same disease.
          </p>
        </div>
        <select
          value={caseStudy}
          onChange={(e) => setCaseStudy(e.target.value)}
          style={{ border: "1px solid rgba(217,188,139,.35)", background: "rgba(255,255,255,.06)", color: "#F1EAD8", borderRadius: "10px", padding: "9px 12px", fontSize: "12.5px" }}
        >
          <option>Case Study: DHFL (2019 Collapse)</option>
          <option>Case Study: Yes Bank (2020 Collapse)</option>
          <option>Case Study: Satyam Computers (2009 Collapse)</option>
        </select>
      </div>

      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Reconstructed Timeline</span><h3>Warning Signs Before Collapse</h3></div></div>
          <span className="tag new">Historical case</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* 12m */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--navy)", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700, fontSize: "11px" }}>12m</div>
              <div style={{ width: "2px", flex: 1, background: "var(--line)", margin: "4px 0" }}></div>
            </div>
            <div style={{ paddingBottom: "20px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>Cash Flow</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "16.5px", color: "var(--navy)", fontWeight: 600 }}>Operating cash flow turns negative despite reported profit growth</div>
            </div>
          </div>

          {/* 9m */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--navy)", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700, fontSize: "11px" }}>9m</div>
              <div style={{ width: "2px", flex: 1, background: "var(--line)", margin: "4px 0" }}></div>
            </div>
            <div style={{ paddingBottom: "20px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>Receivables</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "16.5px", color: "var(--navy)", fontWeight: 600 }}>Receivables spike 38% faster than revenue growth</div>
            </div>
          </div>

          {/* 7m */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--navy)", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700, fontSize: "11px" }}>7m</div>
              <div style={{ width: "2px", flex: 1, background: "var(--line)", margin: "4px 0" }}></div>
            </div>
            <div style={{ paddingBottom: "20px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>Leverage</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "16.5px", color: "var(--navy)", fontWeight: 600 }}>Short-term borrowings rise sharply to plug the cash gap</div>
            </div>
          </div>

          {/* 5m */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--navy)", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700, fontSize: "11px" }}>5m</div>
              <div style={{ width: "2px", flex: 1, background: "var(--line)", margin: "4px 0" }}></div>
            </div>
            <div style={{ paddingBottom: "20px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>Guidance</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "16.5px", color: "var(--navy)", fontWeight: 600 }}>Management misses a publicly stated repayment / growth promise</div>
            </div>
          </div>

          {/* 3m */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--navy)", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700, fontSize: "11px" }}>3m</div>
              <div style={{ width: "2px", flex: 1, background: "var(--line)", margin: "4px 0" }}></div>
            </div>
            <div style={{ paddingBottom: "20px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>Audit</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "16.5px", color: "var(--navy)", fontWeight: 600 }}>Auditor raises a qualified opinion or flags going-concern language</div>
            </div>
          </div>

          {/* Collapse */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--rose)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700, fontSize: "15px" }}>💥</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--rose)", fontWeight: 600 }}>Collapse</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "16.5px", color: "var(--navy)", fontWeight: 600 }}>Trading suspended; stock loses over 85% of its value within weeks</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card c12" style={{ alignItems: "center" }}>
        <div className="card-head" style={{ width: "100%" }}>
          <div className="card-eyebrow"><div><span>Diagnostic</span><h3>Scan My Portfolio For Same Disease</h3></div></div>
          <button className="btn-gold" style={{ padding: "11px 22px" }} onClick={handleScan}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" style={{ stroke: "var(--navy)", width: "14px", height: "14px" }}>
              <path d="M11 4a7 7 0 1 0 4.9 12L20 20"/>
            </svg>
            {scanned ? "Scan Complete!" : "Run Scan"}
          </button>
        </div>
        <div className="table-scroll" style={{ width: "100%" }}>
          <table className="dtable" style={{ width: "100%" }}>
            <thead>
              <tr><th>Holding</th><th>Matched Warning Signs</th><th>Similarity</th><th>Risk</th></tr>
            </thead>
            <tbody>
              <tr><td className="sym"><span className="row-logo">TC</span>TCS</td><td>0 of 6</td><td className="num">12%</td><td><span className="tag live">Low</span></td></tr>
              <tr><td className="sym"><span className="row-logo">RE</span>Reliance</td><td>1 of 6</td><td className="num">21%</td><td><span className="tag live">Low</span></td></tr>
              <tr><td className="sym"><span className="row-logo">HD</span>HDFC Bank</td><td>1 of 6</td><td className="num">19%</td><td><span className="tag live">Low</span></td></tr>
              <tr><td className="sym"><span className="row-logo">SP</span>SpiceJet</td><td>4 of 6</td><td className="num">67%</td><td><span className="tag new">Elevated</span></td></tr>
            </tbody>
          </table>
        </div>
        <div className="card-foot" style={{ width: "100%", borderTop: "none", paddingTop: "12px" }}>
          <span style={{ fontSize: "11.5px", color: "var(--ink-soft)" }}>SpiceJet shares 4 of 6 warning-sign markers with the DHFL case study</span>
          <a className="link-btn" onClick={() => goPage("redflag")}>
            Open Red-Flag DNA <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
