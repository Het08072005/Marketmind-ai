import React, { useState } from "react";
import { newsArticles } from "../data/mockData";

export default function NewsPage({ goPage }) {
  const [filter, setFilter] = useState("All");

  const filteredNews = newsArticles.filter((item) => {
    if (filter === "All") return true;
    return item.impact.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Latest News</h2>
          <p>A live-style feed of market-moving headlines — each scored for portfolio impact, tagged Benefit or Loss, and paired with a short prediction.</p>
        </div>
        <div className="chip-tabs">
          {["All", "Benefit", "Loss", "Neutral"].map((f) => (
            <div
              key={f}
              className={`chip-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      {filteredNews.map((n) => (
        <div key={n.id} className="card c12">
          <div className="news-head" style={{ marginBottom: "2px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <div className="news-source-logo">{n.logo}</div>
              <div>
                <div className="news-title">{n.title}</div>
                <div className="news-meta">{n.meta}</div>
              </div>
            </div>
            <span className={`impact-tag ${n.impact}`}>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                {n.impact === "neutral" ? <path d="M8 12h8"/> : <path d="M5 12h14M13 6l6 6-6 6"/>}
              </svg>
              {n.impactLabel}
            </span>
          </div>

          <p className="news-snippet">{n.snippet}</p>

          <div className="prediction-box">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2a4 4 0 0 0-4 4c0 1.2.5 2 1 3-1.5.5-3 2-3 4.5A4.5 4.5 0 0 0 10.5 18h3A4.5 4.5 0 0 0 18 13.5c0-2.5-1.5-4-3-4.5.5-1 1-1.8 1-3a4 4 0 0 0-4-4z"/>
              <path d="M9 21h6"/>
            </svg>
            <span><b>Prediction:</b> {n.prediction}</span>
          </div>

          <div className="news-foot">
            <div className="news-tickers">
              {n.tickers.map((t, idx) => (
                <span key={idx} className="ticker-chip">{t}</span>
              ))}
            </div>
            <div className="news-score">
              <div className="ring">
                <svg width="38" height="38" viewBox="0 0 38 38">
                  <circle cx="19" cy="19" r="15" fill="none" stroke="#F0E9D8" strokeWidth="4.5"/>
                  <circle
                    cx="19"
                    cy="19"
                    r="15"
                    fill="none"
                    stroke={n.scoreColor}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray="94"
                    strokeDashoffset={n.scoreOffset}
                  />
                </svg>
                <span>{n.score}</span>
              </div>
              <div className="lbl">Impact<br/>Score</div>
            </div>
          </div>

          {n.linkToDomino && (
            <div className="card-foot" style={{ borderTop: "none", paddingTop: "10px" }}>
              <a className="link-btn" onClick={() => goPage("domino")}>
                Trace full ripple effect <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
