import React, { useState } from "react";

export default function DnaFingerprintPage() {
  const [stock1, setStock1] = useState("Reliance Industries");
  const [stock2, setStock2] = useState("Adani Enterprises");

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Stock DNA Fingerprint</h2>
          <p>Growth, Debt, News Sensitivity, Management Reliability and Market Fear — reduced to a comparable genetic strand.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={stock1}
            onChange={(e) => setStock1(e.target.value)}
            style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "9px 12px", fontSize: "12.5px" }}
          >
            <option>Reliance Industries</option>
            <option>TCS</option>
          </select>
          <select
            value={stock2}
            onChange={(e) => setStock2(e.target.value)}
            style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "9px 12px", fontSize: "12.5px" }}
          >
            <option>Adani Enterprises</option>
            <option>Infosys</option>
          </select>
          <button className="pill-btn">Match DNA</button>
        </div>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Similarity</span><h3 style={{ fontSize: "18px" }}>DNA Match Score</h3></div></div>
        </div>
        <div className="esg-wrap" style={{ justifyContent: "center" }}>
          <div className="gauge big">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="72" fill="none" stroke="#F0E9D8" strokeWidth="14"/>
              <circle cx="85" cy="85" r="72" fill="none" stroke="#2F6F62" strokeWidth="14" strokeLinecap="round" strokeDasharray="452" strokeDashoffset="163"/>
            </svg>
            <div className="gauge-center">
              <div className="n">64%</div>
              <div className="l">Match</div>
            </div>
          </div>
        </div>
        <p style={{ fontSize: "12.5px", color: "var(--ink-soft)", textAlign: "center", lineHeight: "1.6" }}>
          {stock1} and {stock2} share high growth-ambition and news sensitivity, but diverge sharply on debt profile.
        </p>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Fingerprint</span><h3>Trait Comparison</h3></div></div>
        </div>
        <div className="bar-row"><div className="lbl">Growth</div><div className="bar-track"><div className="bar-fill you" style={{ width: "82%" }}></div></div><div className="val">82</div></div>
        <div className="bar-row"><div className="lbl">Debt Load</div><div className="bar-track"><div className="bar-fill alt" style={{ width: "38%" }}></div></div><div className="val">38</div></div>
        <div className="bar-row"><div className="lbl">News Sensitivity</div><div className="bar-track"><div className="bar-fill you" style={{ width: "71%" }}></div></div><div className="val">71</div></div>
        <div className="bar-row"><div className="lbl">Mgmt. Reliability</div><div className="bar-track"><div className="bar-fill you" style={{ width: "76%" }}></div></div><div className="val">76</div></div>
        <div className="bar-row"><div className="lbl">Market Fear</div><div className="bar-track"><div className="bar-fill alt" style={{ width: "44%" }}></div></div><div className="val">44</div></div>
        <div className="legend">
          <span><i style={{ background: "var(--gold)" }}></i>{stock1}</span>
          <span><i style={{ background: "#7986B5" }}></i>{stock2}</span>
        </div>
      </div>

      <div className="section-title"><h2>DNA Strand Visualization</h2><div className="rule"></div></div>
      <div className="card c12">
        <svg viewBox="0 0 700 90" width="100%" height="90">
          <polyline
            points="0,45 40,15 80,70 120,20 160,65 200,25 240,60 280,18 320,68 360,22 400,58 440,16 480,66 520,24 560,62 600,20 640,55 680,30"
            fill="none"
            stroke="#B8935A"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="0,45 40,60 80,30 120,55 160,25 200,58 240,28 280,60 320,22 360,58 400,26 440,60 480,24 520,55 560,28 600,58 640,30 680,50"
            fill="none"
            stroke="#2F6F62"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
