import React, { useState } from "react";

export default function SectorPage() {
  const [company, setCompany] = useState("Reliance Industries");
  const [sector, setSector] = useState("Energy & Conglomerate");

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Sector Comparison Engine</h2>
          <p>Compare any company against peers in the same sector, side by side, across growth, margin and valuation metrics.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "9px 12px", fontSize: "12.5px" }}
          >
            <option>Reliance Industries</option>
            <option>TCS</option>
            <option>HDFC Bank</option>
          </select>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "9px 12px", fontSize: "12.5px" }}
          >
            <option>Energy &amp; Conglomerate</option>
            <option>IT Services</option>
            <option>Banking</option>
          </select>
          <button className="pill-btn">Compare</button>
        </div>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Growth &amp; Margins</span><h3>{company} vs. Sector Average</h3></div></div>
        </div>
        <div className="bar-row"><div className="lbl">Revenue Growth</div><div className="bar-track"><div className="bar-fill you" style={{ width: "78%" }}></div></div><div className="val">14.2%</div></div>
        <div className="bar-row"><div className="lbl">Sector Avg</div><div className="bar-track"><div className="bar-fill" style={{ width: "58%" }}></div></div><div className="val">9.8%</div></div>
        <div className="bar-row"><div className="lbl">Net Margin</div><div className="bar-track"><div className="bar-fill you" style={{ width: "64%" }}></div></div><div className="val">8.1%</div></div>
        <div className="bar-row"><div className="lbl">Sector Avg</div><div className="bar-track"><div className="bar-fill" style={{ width: "49%" }}></div></div><div className="val">6.4%</div></div>
        <div className="bar-row"><div className="lbl">ROE</div><div className="bar-track"><div className="bar-fill you" style={{ width: "70%" }}></div></div><div className="val">11.6%</div></div>
        <div className="bar-row"><div className="lbl">Sector Avg</div><div className="bar-track"><div className="bar-fill" style={{ width: "52%" }}></div></div><div className="val">8.9%</div></div>
        <div className="legend">
          <span><i style={{ background: "var(--gold)" }}></i>{company}</span>
          <span><i style={{ background: "var(--teal)" }}></i>Sector Average</span>
        </div>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Multi-Metric</span><h3 style={{ fontSize: "18px" }}>Positioning Map</h3></div></div>
        </div>
        <svg viewBox="0 0 220 220" width="100%" height="220">
          <polygon points="110,20 190,80 160,180 60,180 30,80" fill="none" stroke="#EEE6D2" strokeWidth="1.5"/>
          <polygon points="110,55 165,90 145,150 75,150 55,90" fill="none" stroke="#EEE6D2" strokeWidth="1.5"/>
          <line x1="110" y1="20" x2="110" y2="180" stroke="#F3ECDD"/>
          <line x1="30" y1="80" x2="190" y2="80" stroke="#F3ECDD"/>
          <polygon points="110,32 172,84 150,164 74,168 48,86" fill="#D9BC8B" fillOpacity="0.38" stroke="#B8935A" strokeWidth="2"/>
          <polygon points="110,70 148,96 132,140 92,142 72,98" fill="#2F6F62" fillOpacity="0.22" stroke="#2F6F62" strokeWidth="1.6"/>
          <circle cx="110" cy="20" r="2.5" fill="#101B33"/>
          <circle cx="190" cy="80" r="2.5" fill="#101B33"/>
          <circle cx="160" cy="180" r="2.5" fill="#101B33"/>
          <circle cx="60" cy="180" r="2.5" fill="#101B33"/>
          <circle cx="30" cy="80" r="2.5" fill="#101B33"/>
        </svg>
        <div className="legend">
          <span><i style={{ background: "var(--gold)" }}></i>{company}</span>
          <span><i style={{ background: "var(--teal)" }}></i>Sector Average</span>
        </div>
      </div>

      <div className="section-title"><h2>Peer Table</h2><div className="rule"></div></div>
      <div className="card c12">
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr>
                <th>Company</th>
                <th>Revenue Gr.</th>
                <th>Net Margin</th>
                <th>ROE</th>
                <th>P/E</th>
                <th>Market Cap</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="sym"><span className="row-logo">RE</span>Reliance Industries</td><td className="num">14.2%</td><td className="num">8.1%</td><td className="num">11.6%</td><td className="num">24.8x</td><td className="num">₹19.9L Cr</td></tr>
              <tr><td className="sym"><span className="row-logo">ON</span>ONGC</td><td className="num">9.4%</td><td className="num">12.2%</td><td className="num">14.1%</td><td className="num">8.6x</td><td className="num">₹3.1L Cr</td></tr>
              <tr><td className="sym"><span className="row-logo">AD</span>Adani Enterprises</td><td className="num">11.1%</td><td className="num">4.7%</td><td className="num">9.8%</td><td className="num">61.4x</td><td className="num">₹3.6L Cr</td></tr>
              <tr><td className="sym"><span className="row-logo">BP</span>BPCL</td><td className="num">6.8%</td><td className="num">5.4%</td><td className="num">18.3%</td><td className="num">7.9x</td><td className="num">₹1.4L Cr</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
