import React, { useState } from "react";

export default function TimeMachinePage() {
  const [decision, setDecision] = useState("Buy");
  const [reasoning, setReasoning] = useState("Retail growth steady, valuation reasonable despite market jitters");
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Decision Time Machine</h2>
          <p>Travel to a past date, decide with only the information available then, and see where your reasoning held up.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            defaultValue="15 Mar 2023"
            style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "9px 12px", fontSize: "12.5px", width: "130px" }}
          />
          <button className="pill-btn">Travel</button>
        </div>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>15 March 2023</span><h3>What You Knew Then</h3></div></div>
        </div>
        <div className="metric-strip">
          <div className="metric"><div className="v">₹2,145.00</div><div className="l">Reliance Price</div></div>
          <div className="metric"><div className="v">18.4x</div><div className="l">P/E at the time</div></div>
          <div className="metric"><div className="v">Neutral</div><div className="l">News Sentiment</div></div>
        </div>
        <div className="msg bot" style={{ maxWidth: "100%", marginTop: "10px" }}>
          <span className="tag-sm">Headline · 14 Mar 2023</span>
          "Reliance Retail reports steady but unspectacular Q3 growth; analysts split on near-term catalysts."
        </div>
        <div style={{ height: "10px" }}></div>
        <div className="msg bot" style={{ maxWidth: "100%" }}>
          <span className="tag-sm">Headline · 10 Mar 2023</span>
          "Global banking jitters weigh on broader markets; Nifty down 1.2% for the week."
        </div>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Your Call</span><h3 style={{ fontSize: "18px" }}>Make a Decision</h3></div></div>
        </div>
        <p className="desc">Based only on what was known on 15 Mar 2023, what would you have done?</p>
        <div className="toggle-pair" style={{ gridTemplateColumns: "1fr 1fr 1fr", display: "grid" }}>
          <button
            type="button"
            className={`buy ${decision === "Buy" ? "active" : ""}`}
            style={{ borderRadius: "8px" }}
            onClick={() => setDecision("Buy")}
          >
            Buy
          </button>
          <button
            type="button"
            className={decision === "Hold" ? "active" : ""}
            style={{ borderRadius: "8px", background: decision === "Hold" ? "var(--navy)" : "", color: decision === "Hold" ? "#fff" : "" }}
            onClick={() => setDecision("Hold")}
          >
            Hold
          </button>
          <button
            type="button"
            className={`sell ${decision === "Sell" ? "active" : ""}`}
            style={{ borderRadius: "8px" }}
            onClick={() => setDecision("Sell")}
          >
            Sell
          </button>
        </div>
        <div className="field">
          <label>Your Reasoning</label>
          <input type="text" value={reasoning} onChange={(e) => setReasoning(e.target.value)} />
        </div>
        <button className="btn-block" type="button" onClick={() => setRevealed(true)}>
          {revealed ? "✓ Future Unlocked!" : "Lock In Decision & Reveal Future"}
        </button>
      </div>

      <div className="section-title"><h2>Outcome Revealed</h2><div className="rule"></div></div>
      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>15 Mar 2023 → Today</span><h3>How It Played Out</h3></div></div>
          <span className="tag live">+37.3% since decision</span>
        </div>
        <svg viewBox="0 0 700 110" width="100%" height="110" preserveAspectRatio="none">
          <polyline
            points="0,80 60,78 120,84 180,70 240,74 300,58 360,64 420,44 480,50 540,30 600,36 660,16 700,22"
            fill="none"
            stroke="#2F6F62"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p style={{ fontSize: "12.5px", color: "var(--ink-soft)", lineHeight: "1.6", marginTop: "8px" }}>
          Your reasoning around steady retail growth held up — the segment re-accelerated over the following two quarters. The market-jitters concern proved short-lived and did not materially affect the thesis.
        </p>
      </div>
    </div>
  );
}
