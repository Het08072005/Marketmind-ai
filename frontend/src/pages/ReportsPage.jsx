import React, { useState } from "react";

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState("Reliance Industries — Q1 Summary");

  const handleGenerate = (type) => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setActiveReport(`${type} — Newly Generated`);
    }, 1500);
  };

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>AI Report Generator</h2>
          <p>Generate a one-click PDF summary for any company, sector or your full portfolio.</p>
        </div>
      </div>

      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Templates</span><h3>Choose a Report Type</h3></div></div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <div className="mi-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M7 15l3.5-4 3 3L20 7"/></svg>
            </div>
            <h4>Company Snapshot</h4>
            <p>Valuation, fundamentals, technicals and ESG for a single company.</p>
            <button
              className="pill-btn"
              style={{ alignSelf: "flex-start" }}
              onClick={() => handleGenerate("Company Snapshot")}
            >
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>

          <div className="mini-card">
            <div className="mi-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            </div>
            <h4>Sector Outlook</h4>
            <p>A weekly view of leaders, laggards and rotation across a sector.</p>
            <button
              className="pill-btn"
              style={{ alignSelf: "flex-start" }}
              onClick={() => handleGenerate("Sector Outlook")}
            >
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>

          <div className="mini-card">
            <div className="mi-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M3 17l4-9 3 5 3-8 3 7 5-4"/></svg>
            </div>
            <h4>Portfolio Review</h4>
            <p>Full performance, allocation and risk review of your holdings.</p>
            <button
              className="pill-btn"
              style={{ alignSelf: "flex-start" }}
              onClick={() => handleGenerate("Portfolio Review")}
            >
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>History</span><h3>Generated Reports</h3></div></div>
        </div>
        <div className="report-row">
          <div className="report-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="report-name">Reliance Industries — Q1 Summary</div>
            <div className="report-meta">Generated 2 hrs ago · 6 pages</div>
          </div>
          <button className="link-btn" onClick={() => setActiveReport("Reliance Industries — Q1 Summary")}>Preview</button>
        </div>

        <div className="report-row">
          <div className="report-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="report-name">Nifty Banking — Weekly Outlook</div>
            <div className="report-meta">Generated yesterday · 4 pages</div>
          </div>
          <button className="link-btn" onClick={() => setActiveReport("Nifty Banking — Weekly Outlook")}>Preview</button>
        </div>

        <div className="report-row">
          <div className="report-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="report-name">My Portfolio — Monthly Review</div>
            <div className="report-meta">Generated 4 days ago · 9 pages</div>
          </div>
          <button className="link-btn" onClick={() => setActiveReport("My Portfolio — Monthly Review")}>Preview</button>
        </div>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Preview</span><h3 style={{ fontSize: "18px" }}>{activeReport}</h3></div></div>
        </div>
        <div className="doc-preview">
          <div className="doc-line w40" style={{ height: "11px", background: "var(--gold-dim)" }}></div>
          <div className="doc-line w80"></div>
          <div className="doc-line w100"></div>
          <div className="doc-line w60"></div>
          <div style={{ height: "10px" }}></div>
          <div className="doc-line w40" style={{ height: "11px", background: "var(--gold-dim)" }}></div>
          <div className="doc-line w100"></div>
          <div className="doc-line w80"></div>
        </div>
      </div>
    </div>
  );
}
