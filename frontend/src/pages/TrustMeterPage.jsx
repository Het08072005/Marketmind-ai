import React, { useState } from "react";

export default function TrustMeterPage() {
  const [selectedCompany, setSelectedCompany] = useState("IndiGo");

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Management Trust Meter</h2>
          <p>Every claim management made on earnings calls and in annual reports, checked against what actually happened.</p>
        </div>
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "9px 12px", fontSize: "12.5px" }}
        >
          <option>IndiGo</option>
          <option>Reliance Industries</option>
          <option>Tata Motors</option>
        </select>
      </div>

      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>{selectedCompany} · FY22–FY25</span><h3 style={{ fontSize: "18px" }}>Trust Score</h3></div></div>
        </div>
        <div className="esg-wrap" style={{ justifyContent: "center" }}>
          <div className="gauge big">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="72" fill="none" stroke="#F0E9D8" strokeWidth="14"/>
              <circle cx="85" cy="85" r="72" fill="none" stroke="#B8935A" strokeWidth="14" strokeLinecap="round" strokeDasharray="452" strokeDashoffset="126"/>
            </svg>
            <div className="gauge-center">
              <div className="n">72</div>
              <div className="l">of 100</div>
            </div>
          </div>
        </div>
        <div className="metric-strip" style={{ justifyContent: "center", gap: "22px" }}>
          <div className="metric"><div className="v" style={{ color: "#2F6F62" }}>13</div><div className="l">Kept</div></div>
          <div className="metric"><div className="v" style={{ color: "#B8935A" }}>3</div><div className="l">Delayed</div></div>
          <div className="metric"><div className="v" style={{ color: "#A14545" }}>2</div><div className="l">Broken</div></div>
        </div>
      </div>

      <div className="card c8">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Timeline</span><h3>Promises vs. Outcomes</h3></div></div>
        </div>
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr><th>Promise</th><th>Made</th><th>Deadline</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td>Expand fleet to 400 aircraft</td><td className="num">Q1 FY23</td><td className="num">FY25</td><td><span className="tag live">Kept</span></td></tr>
              <tr><td>Launch 6 new international routes</td><td className="num">Q3 FY23</td><td className="num">FY24</td><td><span className="tag beta">Delayed</span></td></tr>
              <tr><td>Reduce cost per available seat km by 5%</td><td className="num">Q2 FY24</td><td className="num">FY25</td><td><span className="tag new">Broken</span></td></tr>
              <tr><td>Hedge 40% of fuel exposure</td><td className="num">Q4 FY23</td><td className="num">Ongoing</td><td><span className="tag live">Kept</span></td></tr>
              <tr><td>Turn profitable on international ops</td><td className="num">Q1 FY24</td><td className="num">FY25</td><td><span className="tag beta">Delayed</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Source Quotes</span><h3 style={{ fontSize: "18px" }}>What Was Actually Said</h3></div></div>
        </div>
        <div className="msg bot" style={{ maxWidth: "100%" }}>
          <span className="tag-sm">FY23 Q3 Earnings Call</span>
          "We remain firmly on track to induct 30 new aircraft this fiscal, and we expect international capacity to double within 18 months."
        </div>
        <div style={{ height: "10px" }}></div>
        <div className="msg bot" style={{ maxWidth: "100%" }}>
          <span className="tag-sm">FY24 Q2 Earnings Call</span>
          "International capacity growth has been slower than guided, largely due to engine supply constraints industry-wide."
        </div>
      </div>
    </div>
  );
}
