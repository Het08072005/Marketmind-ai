import React, { useState } from "react";

export default function DominoPage({ goPage }) {
  const [eventInput, setEventInput] = useState("Crude Oil +30%");
  const [depth, setDepth] = useState("4th-order effects");

  return (
    <div className="grid">
      <div className="page-banner" style={{ background: "linear-gradient(135deg,#12213D,#1B2F52)", borderColor: "var(--navy-3)" }}>
        <div>
          <h2 style={{ color: "#FBF4E4" }}>Market Domino Predictor</h2>
          <p style={{ color: "#AFB6CC" }}>
            We don't just predict which stock moves — we trace the chain of <em>why</em>. Give it one event and follow every ripple, order by order.
          </p>
        </div>
      </div>

      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Simulation Input</span><h3>Trace an Event</h3></div></div>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1, minWidth: "220px", marginBottom: 0 }}>
            <label>Event</label>
            <input type="text" value={eventInput} onChange={(e) => setEventInput(e.target.value)} />
          </div>
          <div className="field" style={{ minWidth: "160px", marginBottom: 0 }}>
            <label>Depth</label>
            <select value={depth} onChange={(e) => setDepth(e.target.value)}>
              <option>4th-order effects</option>
              <option>3rd-order effects</option>
              <option>2nd-order effects</option>
            </select>
          </div>
          <button className="pill-btn" style={{ padding: "11px 20px" }}>Run Simulation</button>
        </div>
      </div>

      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Chain of Reasoning</span><h3>1st → 4th Order Effects</h3></div></div>
          <span className="tag beta">Simulated</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Order 1 */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--navy)", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700 }}>
                1
              </div>
              <div style={{ width: "2px", flex: 1, background: "var(--line)", margin: "4px 0" }}></div>
            </div>
            <div style={{ paddingBottom: "22px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>Direct impact</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "17px", color: "var(--navy)", fontWeight: 600 }}>Crude oil rises 30% — jet fuel cost surges for all airlines</div>
              <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "2px" }}>Fuel typically accounts for ~35–40% of an airline's operating cost.</div>
            </div>
          </div>

          {/* Order 2 */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--navy)", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700 }}>
                2
              </div>
              <div style={{ width: "2px", flex: 1, background: "var(--line)", margin: "4px 0" }}></div>
            </div>
            <div style={{ paddingBottom: "22px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>2nd-order</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "17px", color: "var(--navy)", fontWeight: 600 }}>IndiGo &amp; SpiceJet operating margins compress</div>
              <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "2px" }}>Estimated margin impact: −180 to −260 bps this quarter.</div>
            </div>
          </div>

          {/* Order 3 */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--navy)", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700 }}>
                3
              </div>
              <div style={{ width: "2px", flex: 1, background: "var(--line)", margin: "4px 0" }}></div>
            </div>
            <div style={{ paddingBottom: "22px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>3rd-order</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "17px", color: "var(--navy)", fontWeight: 600 }}>Airlines pass costs on — average ticket prices rise 8–12%</div>
              <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "2px" }}>Domestic leisure travel demand historically softens 5–7% per 10% fare rise.</div>
            </div>
          </div>

          {/* Order 4 */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--gold)", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontWeight: 700 }}>
                4
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>4th-order · Endpoint</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "17px", color: "var(--navy)", fontWeight: 600 }}>Hotel occupancy &amp; tourism-linked stocks face secondary drag</div>
              <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "2px" }}>Indian Hotels, Thomas Cook and regional tourism boards flagged as watch-list candidates.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Network</span><h3>Affected Companies Graph</h3></div></div>
        </div>
        <svg viewBox="0 0 460 240" width="100%" height="240">
          <line x1="80" y1="120" x2="200" y2="60" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="80" y1="120" x2="200" y2="120" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="80" y1="120" x2="200" y2="180" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="200" y1="60" x2="330" y2="40" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="200" y1="60" x2="330" y2="90" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="200" y1="120" x2="330" y2="120" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="200" y1="180" x2="330" y2="160" stroke="#E6DCC4" strokeWidth="1.5"/>
          <line x1="200" y1="180" x2="330" y2="205" stroke="#E6DCC4" strokeWidth="1.5"/>
          <circle cx="80" cy="120" r="26" fill="var(--navy)"/><text x="80" y="124" textAnchor="middle" fill="#EADFC7" fontSize="10" fontFamily="Inter">Oil +30%</text>
          <circle cx="200" cy="60" r="20" fill="#A14545" fillOpacity=".85"/><text x="200" y="64" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Inter">IndiGo</text>
          <circle cx="200" cy="120" r="20" fill="#A14545" fillOpacity=".85"/><text x="200" y="124" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Inter">SpiceJet</text>
          <circle cx="200" cy="180" r="20" fill="#B8935A"/><text x="200" y="184" textAnchor="middle" fill="#12213D" fontSize="9" fontFamily="Inter">Fuel Cos.</text>
          <circle cx="330" cy="40" r="16" fill="#D9BC8B"/><text x="330" y="44" textAnchor="middle" fill="#12213D" fontSize="8.5" fontFamily="Inter">Fares ↑</text>
          <circle cx="330" cy="90" r="16" fill="#D9BC8B"/><text x="330" y="94" textAnchor="middle" fill="#12213D" fontSize="8.5" fontFamily="Inter">Demand ↓</text>
          <circle cx="330" cy="120" r="16" fill="#2F6F62"/><text x="330" y="124" textAnchor="middle" fill="#fff" fontSize="8.5" fontFamily="Inter">ONGC ↑</text>
          <circle cx="330" cy="160" r="16" fill="#D9BC8B"/><text x="330" y="164" textAnchor="middle" fill="#12213D" fontSize="8.5" fontFamily="Inter">Hotels ↓</text>
          <circle cx="330" cy="205" r="16" fill="#D9BC8B"/><text x="330" y="209" textAnchor="middle" fill="#12213D" fontSize="8.5" fontFamily="Inter">Tourism ↓</text>
        </svg>
        <div className="legend">
          <span><i style={{ background: "#A14545" }}></i>Direct hit</span>
          <span><i style={{ background: "#B8935A" }}></i>Cost pass-through</span>
          <span><i style={{ background: "#2F6F62" }}></i>Benefits</span>
          <span><i style={{ background: "#D9BC8B" }}></i>Secondary drag</span>
        </div>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Click-through</span><h3 style={{ fontSize: "18px" }}>What Did Management Say?</h3></div></div>
        </div>
        <p className="desc">Select any affected company to see whether leadership had already flagged this risk.</p>
        <div className="watch-row">
          <div className="watch-id">
            <div className="watch-logo">IN</div>
            <div>
              <div className="watch-name">IndiGo</div>
              <div className="watch-sub">FY24 call: "hedged 40% of fuel exposure"</div>
            </div>
          </div>
          <div className="watch-right"><span className="alert-flag ok">Flagged risk</span></div>
        </div>
        <div className="watch-row">
          <div className="watch-id">
            <div className="watch-logo">SP</div>
            <div>
              <div className="watch-name">SpiceJet</div>
              <div className="watch-sub">No mention of oil hedging in last 3 calls</div>
            </div>
          </div>
          <div className="watch-right"><span className="alert-flag">Unaddressed</span></div>
        </div>
        <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}>
          <a className="link-btn" onClick={() => goPage("trust")}>
            Open Management Trust Meter <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
