import React from "react";

export default function DependencyMapPage() {
  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Portfolio Hidden Dependency Map</h2>
          <p>Your 10 holdings may look diversified on paper — until you see the common risk factors quietly running underneath all of them.</p>
        </div>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Network</span><h3>Shared Risk Exposure</h3></div></div>
        </div>
        <svg viewBox="0 0 460 260" width="100%" height="260">
          <line x1="230" y1="130" x2="90" y2="50" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="230" y1="130" x2="90" y2="210" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="230" y1="130" x2="370" y2="50" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="230" y1="130" x2="370" y2="210" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="90" y1="50" x2="30" y2="30" stroke="#E6DCC4"/>
          <line x1="90" y1="50" x2="30" y2="80" stroke="#E6DCC4"/>
          <line x1="90" y1="210" x2="30" y2="190" stroke="#E6DCC4"/>
          <line x1="90" y1="210" x2="30" y2="235" stroke="#E6DCC4"/>
          <line x1="370" y1="50" x2="430" y2="30" stroke="#E6DCC4"/>
          <line x1="370" y1="50" x2="430" y2="75" stroke="#E6DCC4"/>
          <line x1="370" y1="210" x2="430" y2="190" stroke="#E6DCC4"/>
          <line x1="370" y1="210" x2="430" y2="235" stroke="#E6DCC4"/>
          <circle cx="230" cy="130" r="24" fill="var(--navy)"/><text x="230" y="134" textAnchor="middle" fill="#EADFC7" fontSize="9.5" fontFamily="Inter">Your 10 Stocks</text>
          <circle cx="90" cy="50" r="19" fill="#B8935A"/><text x="90" y="54" textAnchor="middle" fill="#12213D" fontSize="9" fontFamily="Inter">USD Rate</text>
          <circle cx="90" cy="210" r="19" fill="#2F6F62"/><text x="90" y="214" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Inter">Crude Oil</text>
          <circle cx="370" cy="50" r="19" fill="#A14545" fillOpacity=".85"/><text x="370" y="54" textAnchor="middle" fill="#fff" fontSize="8.5" fontFamily="Inter">US IT Spend</text>
          <circle cx="370" cy="210" r="19" fill="#7986B5"/><text x="370" y="214" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Inter">Monsoon</text>
          <circle cx="30" cy="30" r="12" fill="#D9BC8B"/><text x="30" y="34" textAnchor="middle" fill="#12213D" fontSize="7.5" fontFamily="Inter">TCS</text>
          <circle cx="30" cy="80" r="12" fill="#D9BC8B"/><text x="30" y="84" textAnchor="middle" fill="#12213D" fontSize="7.5" fontFamily="Inter">Infosys</text>
          <circle cx="30" cy="190" r="12" fill="#D9BC8B"/><text x="30" y="194" textAnchor="middle" fill="#12213D" fontSize="7.5" fontFamily="Inter">IndiGo</text>
          <circle cx="30" cy="235" r="12" fill="#D9BC8B"/><text x="30" y="239" textAnchor="middle" fill="#12213D" fontSize="7.5" fontFamily="Inter">ONGC</text>
          <circle cx="430" cy="30" r="12" fill="#D9BC8B"/><text x="430" y="34" textAnchor="middle" fill="#12213D" fontSize="7.5" fontFamily="Inter">Wipro</text>
          <circle cx="430" cy="75" r="12" fill="#D9BC8B"/><text x="430" y="79" textAnchor="middle" fill="#12213D" fontSize="7.5" fontFamily="Inter">TechM</text>
          <circle cx="430" cy="190" r="12" fill="#D9BC8B"/><text x="430" y="194" textAnchor="middle" fill="#12213D" fontSize="7.5" fontFamily="Inter">ITC</text>
          <circle cx="430" cy="235" r="12" fill="#D9BC8B"/><text x="430" y="239" textAnchor="middle" fill="#12213D" fontSize="7.5" fontFamily="Inter">Tata Cons.</text>
        </svg>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Concentration</span><h3 style={{ fontSize: "18px" }}>Risk Factors Found</h3></div></div>
        </div>
        <div className="risk-node-row">
          <div className="risk-node-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
          <div><div className="risk-node-name">USD / INR Exchange Rate</div><div className="risk-node-sub">TCS, Infosys, Wipro, TechM, Tata Cons.</div></div>
          <div className="risk-node-count">5</div>
        </div>
        <div className="risk-node-row">
          <div className="risk-node-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l7 7"/></svg></div>
          <div><div className="risk-node-name">Crude Oil Price</div><div className="risk-node-sub">IndiGo, ONGC, ITC, Tata Cons.</div></div>
          <div className="risk-node-count">4</div>
        </div>
        <div className="risk-node-row">
          <div className="risk-node-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></div>
          <div><div className="risk-node-name">US IT Spending Cycle</div><div className="risk-node-sub">TCS, Infosys, Wipro</div></div>
          <div className="risk-node-count">3</div>
        </div>
        <div className="risk-node-row">
          <div className="risk-node-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M3 17l4-9 3 5 3-8 3 7 5-4"/></svg></div>
          <div><div className="risk-node-name">Monsoon / Rural Demand</div><div className="risk-node-sub">ITC, Tata Consumer</div></div>
          <div className="risk-node-count">2</div>
        </div>
        <div className="verdict-box" style={{ marginTop: "16px" }}>
          <div className="vi"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg></div>
          <div><div className="vl">AI Verdict</div><div className="vt">50% of your portfolio shares USD exposure — diversification is narrower than it looks.</div></div>
        </div>
      </div>
    </div>
  );
}
