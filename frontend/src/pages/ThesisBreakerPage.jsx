import React, { useState } from "react";

export default function ThesisBreakerPage() {
  const [symbol, setSymbol] = useState("Reliance Industries");
  const [reasoning, setReasoning] = useState("Buying because revenue is growing fast (22% YoY)");
  const [metric, setMetric] = useState("Revenue growth rate");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Investment Thesis Breaker</h2>
          <p>Save the reason you bought — get alerted the moment that reason itself starts to break, not just when price moves.</p>
        </div>
        <button className="pill-btn" onClick={handleSave}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Log New Thesis
        </button>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>New Entry</span><h3 style={{ fontSize: "18px" }}>Log a Thesis</h3></div></div>
        </div>
        <div className="field">
          <label>Symbol</label>
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        </div>
        <div className="field">
          <label>Your Reasoning</label>
          <input type="text" value={reasoning} onChange={(e) => setReasoning(e.target.value)} />
        </div>
        <div className="field">
          <label>Metric to Track</label>
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option>Revenue growth rate</option>
            <option>Net margin</option>
            <option>Debt-to-equity</option>
            <option>Management guidance</option>
          </select>
        </div>
        <button className="btn-block" type="button" onClick={handleSave}>
          {saved ? "✓ Thesis Saved & Tracking!" : "Save & Start Tracking"}
        </button>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Tracked</span><h3>Active Theses</h3></div></div>
        </div>
        <div className="watch-row">
          <div className="watch-id">
            <div className="watch-logo">RE</div>
            <div>
              <div className="watch-name">Reliance — "Revenue growth"</div>
              <div className="watch-sub">Original: 22% YoY · Now: 14.2% YoY</div>
            </div>
          </div>
          <div className="watch-right"><span className="alert-flag">Weakening</span></div>
        </div>
        <div className="bar-row" style={{ margin: "4px 0 16px" }}>
          <div className="lbl">Thesis Health</div>
          <div className="bar-track"><div className="bar-fill" style={{ width: "56%", background: "linear-gradient(90deg,#B8935A,#D9BC8B)" }}></div></div>
          <div className="val">56%</div>
        </div>

        <div className="watch-row">
          <div className="watch-id">
            <div className="watch-logo">TC</div>
            <div>
              <div className="watch-name">TCS — "Margin expansion"</div>
              <div className="watch-sub">Original: 24% margin target · Now: 25.1%</div>
            </div>
          </div>
          <div className="watch-right"><span className="alert-flag ok">Intact</span></div>
        </div>
        <div className="bar-row" style={{ margin: "4px 0 16px" }}>
          <div className="lbl">Thesis Health</div>
          <div className="bar-track"><div className="bar-fill" style={{ width: "91%" }}></div></div>
          <div className="val">91%</div>
        </div>

        <div className="watch-row">
          <div className="watch-id">
            <div className="watch-logo">SP</div>
            <div>
              <div className="watch-name">SpiceJet — "Debt reduction"</div>
              <div className="watch-sub">Original: D/E to fall below 1.5 · Now: 2.3</div>
            </div>
          </div>
          <div className="watch-right"><span className="alert-flag">Broken</span></div>
        </div>
        <div className="bar-row" style={{ margin: "4px 0 0" }}>
          <div className="lbl">Thesis Health</div>
          <div className="bar-track"><div className="bar-fill" style={{ width: "18%", background: "linear-gradient(90deg,#A14545,#C97A7A)" }}></div></div>
          <div className="val">18%</div>
        </div>
      </div>

      <div className="section-title"><h2>Alert Log</h2><div className="rule"></div></div>
      <div className="card c12">
        <div className="report-row">
          <div className="report-icon" style={{ background: "var(--gold-dim)" }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" stroke="#8A6A32">
              <path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>
            </svg>
          </div>
          <div>
            <div className="report-name">Reliance revenue growth thesis weakening — 22% → 14.2%</div>
            <div className="report-meta">3 days ago</div>
          </div>
        </div>
        <div className="report-row">
          <div className="report-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>
            </svg>
          </div>
          <div>
            <div className="report-name">SpiceJet debt-reduction thesis broken — D/E rose past 2.0</div>
            <div className="report-meta">1 week ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}
