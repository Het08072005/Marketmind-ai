import React, { useState } from "react";

const HISTORICAL_SCENARIOS = [
  {
    id: "sc-1",
    date: "15 Mar 2023",
    title: "Global Banking Tremors & Reliance Retail Ambition",
    stock: "Reliance Industries (RELIANCE)",
    priceAtTime: "₹2,145.00",
    peRatio: "18.4x",
    sentiment: "Neutral / Cautious",
    headlines: [
      "Silicon Valley Bank collapse sends tremors across global financial markets; Credit Suisse issues emergency liquidity request.",
      "Reliance Retail reports steady but unspectacular Q3 growth; street split on near-term retail margin catalysts."
    ],
    realOutcome: {
      returnPct: "+37.3%",
      returnText: "+37.3% Gain to Date",
      direction: "up",
      points: "0,80 60,78 120,84 180,70 240,74 300,58 360,64 420,44 480,50 540,30 600,36 660,16 700,22",
      postMortem: "Buying or Holding during the March 2023 banking panic proved optimal. Domestic earnings stability and Jio/Retail expansion outweighed global macro fears."
    }
  },
  {
    id: "sc-2",
    date: "23 Mar 2020",
    title: "COVID-19 National Lockdown Crash (Nifty 7,600)",
    stock: "Tata Motors (TATAMOTORS)",
    priceAtTime: "₹68.50",
    peRatio: "Loss-Making (Negative PE)",
    sentiment: "Extreme Panic & Max Fear",
    headlines: [
      "Nationwide 21-day lockdown announced; Indian equity indices hit 10% lower circuit limit within 15 minutes of open.",
      "Automobile assembly lines shut nationwide; Moody's places auto debt ratings on review for downgrade."
    ],
    realOutcome: {
      returnPct: "+1,240%",
      returnText: "+1,240% Multi-Bagger Surge",
      direction: "up",
      points: "0,95 60,92 120,80 180,68 240,55 300,48 360,35 420,28 480,22 540,15 600,10 660,6 700,4",
      postMortem: "Classic generation-defining contrarian entry. EV platform transition, Jaguar Land Rover debt reduction, and commercial vehicle recovery created a 13x multi-bagger."
    }
  },
  {
    id: "sc-3",
    date: "04 Jun 2024",
    title: "General Election Results Day Volatility Drawdown",
    stock: "Adani Enterprises (ADANIENT)",
    priceAtTime: "₹2,980.00",
    peRatio: "88.2x",
    sentiment: "High Volatility & Political Beta",
    headlines: [
      "Election outcome triggers sharp 6% intra-day selloff across infrastructure, defense, and public sector conglomerates.",
      "FIIs sell ₹12,000 Cr in single session amidst political coalition negotiations; retail investors buy the dip."
    ],
    realOutcome: {
      returnPct: "+18.6%",
      returnText: "+18.6% Rebound within 60 Days",
      direction: "up",
      points: "0,85 50,95 100,60 180,50 250,42 320,38 400,32 500,28 600,22 700,18",
      postMortem: "Panic selling on political beta subsided rapidly as underlying airport, solar, and port capex execution resumed without interruption."
    }
  }
];

export default function TimeMachinePage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState("sc-1");
  const [decision, setDecision] = useState("Buy");
  const [reasoning, setReasoning] = useState("Retail growth steady, valuation reasonable despite market jitters");
  const [revealed, setRevealed] = useState(false);

  const scenario = HISTORICAL_SCENARIOS.find(s => s.id === selectedScenarioId) || HISTORICAL_SCENARIOS[0];

  const handleScenarioChange = (id) => {
    setSelectedScenarioId(id);
    setRevealed(false);
  };

  const handleLockIn = () => {
    setRevealed(true);
  };

  return (
    <div className="grid">
      {/* Top Banner & Scenario Navigation */}
      <div className="page-banner">
        <div>
          <h2>Decision Time Machine</h2>
          <p>Travel back to historical market inflection points. Make investment calls using only what was known then — then unlock the future to audit your cognitive biases.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold-light)" }}>Historical Epoch:</span>
          <select
            value={selectedScenarioId}
            onChange={(e) => handleScenarioChange(e.target.value)}
            style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "8px 12px", fontSize: "12.5px", fontWeight: 600 }}
          >
            {HISTORICAL_SCENARIOS.map(s => (
              <option key={s.id} value={s.id}>{s.date}: {s.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* What You Knew Then (Historical Context) */}
      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span style={{ color: "var(--gold-light)", fontWeight: 700 }}>📅 Historical Snapshot: {scenario.date}</span>
              <h3 style={{ fontSize: "19px" }}>What You Knew Then ({scenario.stock})</h3>
            </div>
          </div>
        </div>

        {/* Metric Strip */}
        <div className="metric-strip" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          <div className="metric" style={{ background: "var(--paper)", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)" }}>
            <div className="v" style={{ fontSize: "18px", fontWeight: 700, color: "var(--navy)" }}>{scenario.priceAtTime}</div>
            <div className="l" style={{ fontSize: "11px", color: "var(--ink-soft)" }}>Price on {scenario.date}</div>
          </div>
          <div className="metric" style={{ background: "var(--paper)", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)" }}>
            <div className="v" style={{ fontSize: "18px", fontWeight: 700, color: "var(--navy)" }}>{scenario.peRatio}</div>
            <div className="l" style={{ fontSize: "11px", color: "var(--ink-soft)" }}>Valuation Multiple</div>
          </div>
          <div className="metric" style={{ background: "var(--paper)", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)" }}>
            <div className="v" style={{ fontSize: "15px", fontWeight: 700, color: "#B8935A" }}>{scenario.sentiment}</div>
            <div className="l" style={{ fontSize: "11px", color: "var(--ink-soft)" }}>Market Sentiment</div>
          </div>
        </div>

        {/* Contemporaneous Headlines */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {scenario.headlines.map((hl, idx) => (
            <div key={idx} className="msg bot" style={{ maxWidth: "100%", background: "var(--paper)", border: "1px solid var(--line)", padding: "12px 14px", borderRadius: "8px" }}>
              <span className="tag-sm" style={{ fontSize: "10px", fontWeight: 700, color: "var(--gold-light)", display: "block", marginBottom: "4px" }}>
                🗞️ Live Headline · {scenario.date}
              </span>
              <span style={{ fontSize: "13px", color: "var(--navy)", lineHeight: "1.5" }}>"{hl}"</span>
            </div>
          ))}
        </div>
      </div>

      {/* Make a Call Card */}
      <div className="card c5" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div className="card-head">
            <div className="card-eyebrow">
              <div>
                <span>Contrarian Decision</span>
                <h3 style={{ fontSize: "19px" }}>Make Your Call</h3>
              </div>
            </div>
          </div>

          <p style={{ fontSize: "12.5px", color: "var(--ink-soft)", marginBottom: "14px" }}>
            Based strictly on information available on {scenario.date}, what would your capital allocation decision have been?
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
            <button
              type="button"
              className={`pill-btn ${decision === "Buy" ? "active" : "ghost"}`}
              style={{ padding: "8px", fontSize: "13px", fontWeight: 700, background: decision === "Buy" ? "#2F6F62" : "var(--paper)", color: decision === "Buy" ? "#fff" : "var(--navy)" }}
              onClick={() => setDecision("Buy")}
            >
              🟢 BUY
            </button>
            <button
              type="button"
              className={`pill-btn ${decision === "Hold" ? "active" : "ghost"}`}
              style={{ padding: "8px", fontSize: "13px", fontWeight: 700, background: decision === "Hold" ? "#B8935A" : "var(--paper)", color: decision === "Hold" ? "#fff" : "var(--navy)" }}
              onClick={() => setDecision("Hold")}
            >
              ⚖️ HOLD
            </button>
            <button
              type="button"
              className={`pill-btn ${decision === "Sell" ? "active" : "ghost"}`}
              style={{ padding: "8px", fontSize: "13px", fontWeight: 700, background: decision === "Sell" ? "#A14545" : "var(--paper)", color: decision === "Sell" ? "#fff" : "var(--navy)" }}
              onClick={() => setDecision("Sell")}
            >
              🔴 SELL
            </button>
          </div>

          <div className="field">
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>Your Investment Logic</label>
            <input
              type="text"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="e.g. Valuation is too cheap to ignore panic selling"
              style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "8px", padding: "8px 12px", fontSize: "12.5px" }}
            />
          </div>
        </div>

        <button
          className="btn-block"
          type="button"
          onClick={handleLockIn}
          style={{ background: "var(--navy)", color: "var(--gold-light)", fontWeight: 700, marginTop: "12px" }}
        >
          {revealed ? "✓ Future Trajectory Unlocked!" : "⚡ Lock In Decision & Reveal Outcome"}
        </button>
      </div>

      {/* Outcome Revealed Section */}
      {revealed && (
        <>
          <div className="section-title">
            <h2>Outcome Revealed: {scenario.date} → Present Day</h2>
            <div className="rule"></div>
          </div>

          <div className="card c12" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold-light)" }}>MARKET VERDICT</span>
                <h3 style={{ fontSize: "18px", fontFamily: "var(--serif)", color: "var(--navy)", margin: 0 }}>
                  Real Subsequent Price Trajectory
                </h3>
              </div>
              <span className="tag live" style={{ background: "rgba(47,111,98,.15)", color: "#2F6F62", fontWeight: 700, fontSize: "13px", padding: "4px 12px" }}>
                {scenario.realOutcome.returnText}
              </span>
            </div>

            {/* Price Curve */}
            <div style={{ background: "var(--paper)", padding: "14px", borderRadius: "10px", border: "1px solid var(--line)", marginBottom: "14px" }}>
              <svg viewBox="0 0 700 110" width="100%" height="110" preserveAspectRatio="none">
                <polyline
                  points={scenario.realOutcome.points}
                  fill="none"
                  stroke="#2F6F62"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div style={{ background: "rgba(216,188,139,.12)", border: "1px solid rgba(216,188,139,.35)", padding: "14px 18px", borderRadius: "10px", fontSize: "13px", color: "var(--navy)", lineHeight: "1.6" }}>
              🧠 <b>Institutional Post-Mortem:</b> You selected <b>{decision.toUpperCase()}</b>. {scenario.realOutcome.postMortem}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
