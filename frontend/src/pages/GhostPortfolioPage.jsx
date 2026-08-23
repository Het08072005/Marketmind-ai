import React, { useState } from "react";

const INITIAL_GHOST_DECISIONS = [
  {
    id: "g-1",
    stock: "Divi's Laboratories",
    symbol: "DIVISLAB",
    action: "Rejected Idea",
    date: "Mar 2023",
    reason: "Valuation felt stretched at 45x PE during generic API price slump.",
    realOutcome: "Missed Opportunity",
    actualPct: "+64.2%",
    ghostReturn: "+64.2%",
    status: "missed"
  },
  {
    id: "g-2",
    stock: "Yes Bank Ltd",
    symbol: "YESBANK",
    action: "Skipped Trap",
    date: "Jan 2020",
    reason: "Severe divergences in NPA reporting and promoter pledging flagged by AI.",
    realOutcome: "Capital Saved",
    actualPct: "−78.5%",
    ghostReturn: "−78.5%",
    status: "saved"
  },
  {
    id: "g-3",
    stock: "Tata Motors Ltd",
    symbol: "TATAMOTORS",
    action: "Sold Too Early",
    date: "Jun 2023",
    reason: "Booked +18% quick gain before commercial EV orderbook ramped up.",
    realOutcome: "Subsequent Multi-bagger",
    actualPct: "+18.0%",
    ghostReturn: "+54.5%",
    status: "missed"
  },
  {
    id: "g-4",
    stock: "HDFC Bank Ltd",
    symbol: "HDFCBANK",
    action: "Held Steady",
    date: "Ongoing",
    reason: "Long-term compounding thesis intact with high CASA resilience.",
    realOutcome: "Active Compounder",
    actualPct: "+16.8%",
    ghostReturn: "+16.8%",
    status: "neutral"
  }
];

export default function GhostPortfolioPage() {
  const [decisions, setDecisions] = useState(INITIAL_GHOST_DECISIONS);
  const [stockName, setStockName] = useState("");
  const [actionType, setActionType] = useState("Rejected Idea");
  const [reason, setReason] = useState("");
  const [outcomeEstimate, setOutcomeEstimate] = useState("+25%");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddGhostEntry = (e) => {
    e.preventDefault();
    if (!stockName || !reason) return;

    const isMissed = outcomeEstimate.includes("+");
    const newEntry = {
      id: `g-${Date.now()}`,
      stock: stockName,
      symbol: stockName.slice(0, 5).toUpperCase(),
      action: actionType,
      date: "Aug 2026",
      reason,
      realOutcome: isMissed ? "Missed Alpha" : "Capital Preserved",
      actualPct: "0.0%",
      ghostReturn: outcomeEstimate,
      status: isMissed ? "missed" : "saved"
    };

    setDecisions([newEntry, ...decisions]);
    setStockName("");
    setReason("");
    setShowAddForm(false);
  };

  return (
    <div className="grid">
      {/* Top Banner */}
      <div className="page-banner">
        <div>
          <h2>Ghost Portfolio &amp; Cognitive Bias Audit</h2>
          <p>A parallel, shadow portfolio of every idea you rejected, skipped, or sold prematurely — auditing your decision quality rather than just price outcomes.</p>
        </div>

        <button
          className="pill-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ background: "var(--navy)", color: "var(--gold-light)", fontWeight: 700 }}
        >
          {showAddForm ? "Cancel" : "+ Log Skipped / Rejected Idea"}
        </button>
      </div>

      {/* Add New Ghost Entry Modal/Card */}
      {showAddForm && (
        <div className="card c12" style={{ background: "var(--paper)", border: "1.5px solid var(--gold-light)", padding: "18px 22px", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "17px", fontFamily: "var(--serif)", marginBottom: "12px" }}>Log a Decision (Rejected, Skipped, or Exited Early)</h3>
          <form onSubmit={handleAddGhostEntry} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            <div className="field">
              <label>Company / Stock Name</label>
              <input type="text" placeholder="e.g. Zomato / Paytm" value={stockName} onChange={(e) => setStockName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Decision Action</label>
              <select value={actionType} onChange={(e) => setActionType(e.target.value)}>
                <option>Rejected Idea (Didn't Buy)</option>
                <option>Sold Too Early (Exited Win)</option>
                <option>Skipped Trap (Avoided Loss)</option>
              </select>
            </div>
            <div className="field">
              <label>Subsequent Ghost Return %</label>
              <input type="text" placeholder="e.g. +42% or -35%" value={outcomeEstimate} onChange={(e) => setOutcomeEstimate(e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Why Did You Make This Call?</label>
              <input type="text" placeholder="e.g. Feared multiple compression or near-term headwinds" value={reason} onChange={(e) => setReason(e.target.value)} required />
            </div>
            <button type="submit" className="pill-btn" style={{ background: "var(--navy)", color: "var(--gold-light)", fontWeight: 700, padding: "8px 16px" }}>
              Save to Shadow Portfolio
            </button>
          </form>
        </div>
      )}

      {/* Real You vs Ghost You Portfolio Comparison */}
      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>Shadow Portfolio Analytics</span>
              <h3 style={{ fontSize: "20px" }}>Real You vs. Ghost You Performance</h3>
            </div>
          </div>
        </div>

        <div className="ghost-compare" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "20px", padding: "16px 0" }}>
          {/* Real You */}
          <div className="ghost-block real" style={{ background: "var(--paper)", border: "1px solid var(--line)", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
            <div className="gl" style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase" }}>Real Portfolio</div>
            <div className="gv" style={{ fontSize: "34px", fontWeight: 700, color: "#2F6F62", fontFamily: "var(--mono, monospace)", margin: "8px 0" }}>
              ₹12.45L
            </div>
            <div className="gd" style={{ fontSize: "12px", color: "var(--ink-soft)" }}>₹10.0L Capital Deployed · Actual Executed Orders</div>
          </div>

          <div className="ghost-vs" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--cream)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--ink-soft)", fontSize: "13px" }}>
            VS
          </div>

          {/* Ghost You */}
          <div className="ghost-block ghost" style={{ background: "rgba(216,188,139,.12)", border: "1.5px solid var(--gold-light)", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
            <div className="gl" style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase" }}>👻 Ghost Parallel Portfolio</div>
            <div className="gv" style={{ fontSize: "34px", fontWeight: 700, color: "#B8935A", fontFamily: "var(--mono, monospace)", margin: "8px 0" }}>
              ₹15.20L
            </div>
            <div className="gd" style={{ fontSize: "12px", color: "var(--ink-soft)" }}>+₹2.75L Alpha if rejected &amp; early-sold stocks were held</div>
          </div>
        </div>
      </div>

      {/* 3 Insight Metric Cards */}
      <div className="card c4" style={{ padding: "18px" }}>
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>Missed Multi-Bagger</span>
              <h3 style={{ fontSize: "17px" }}>Biggest Missed Gain</h3>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--navy)" }}>Divi's Laboratories</div>
            <div style={{ fontSize: "11px", color: "var(--ink-soft)" }}>Rejected at 45x PE · Mar 2023</div>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#2F6F62", fontFamily: "var(--mono, monospace)" }}>
            +64.2%
          </div>
        </div>
      </div>

      <div className="card c4" style={{ padding: "18px" }}>
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>Capital Preserved</span>
              <h3 style={{ fontSize: "17px" }}>Best Avoided Trap</h3>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--navy)" }}>Yes Bank Ltd</div>
            <div style={{ fontSize: "11px", color: "var(--ink-soft)" }}>Skipped on NPA red flags</div>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#A14545", fontFamily: "var(--mono, monospace)" }}>
            −78.5%
          </div>
        </div>
      </div>

      <div className="card c4" style={{ padding: "18px" }}>
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>Cognitive Bias</span>
              <h3 style={{ fontSize: "17px" }}>Identified Habit</h3>
            </div>
          </div>
        </div>
        <p style={{ fontSize: "12px", color: "var(--ink)", lineHeight: "1.5", margin: "6px 0 0 0" }}>
          <b>Premature Profit Taking:</b> In 3 of 4 recorded sales, profitable positions were closed at +15–18% while the stock rallied another +35% in subsequent quarters.
        </p>
      </div>

      {/* Decision Log Table */}
      <div className="section-title">
        <h2>Complete Decision &amp; Opportunity Cost Audit Log</h2>
        <div className="rule"></div>
      </div>

      <div className="card c12">
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr>
                <th>Stock / Decision</th>
                <th>Action Taken</th>
                <th>Date</th>
                <th>Reasoning Audit</th>
                <th>Ghost Outcome</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((d) => (
                <tr key={d.id}>
                  <td className="sym">
                    <span className="row-logo">{d.symbol.slice(0, 2)}</span>
                    <b>{d.stock}</b>
                  </td>
                  <td>
                    <span className="tag" style={{ background: d.status === "saved" ? "rgba(47,111,98,.12)" : "rgba(216,188,139,.18)", color: d.status === "saved" ? "#2F6F62" : "var(--navy)", fontWeight: 600, fontSize: "11px" }}>
                      {d.action}
                    </span>
                  </td>
                  <td className="num">{d.date}</td>
                  <td style={{ fontSize: "12px", color: "var(--ink-soft)" }}>{d.reason}</td>
                  <td className="num" style={{ fontWeight: 700, color: d.ghostReturn.includes("-") ? "#A14545" : "#2F6F62", fontFamily: "var(--mono, monospace)" }}>
                    {d.ghostReturn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
