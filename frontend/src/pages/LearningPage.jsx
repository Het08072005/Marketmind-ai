import React, { useState } from "react";
import { lessonsData } from "../data/mockData";

export default function LearningPage() {
  const [activeLevel, setActiveLevel] = useState("Beginner");

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Personalized Learning Mode</h2>
          <p>Beginner-friendly, bite-sized explanations of the terms and indicators used across your terminal.</p>
        </div>
        <div className="chip-tabs">
          {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <div
              key={lvl}
              className={`chip-tab ${activeLevel === lvl ? "active" : ""}`}
              onClick={() => setActiveLevel(lvl)}
            >
              {lvl}
            </div>
          ))}
        </div>
      </div>

      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Your Path</span><h3>Continue Learning</h3></div></div>
          <span className="tag beta">42% complete</span>
        </div>
        <div className="mini-grid">
          {lessonsData.map((lesson) => (
            <div key={lesson.id} className="mini-card">
              <div className="mi-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 3v18h18"/><path d="M7 15l3.5-4 3 3L20 7"/>
                </svg>
              </div>
              <h4>{lesson.title}</h4>
              <p>{lesson.desc}</p>
              <div className="lesson-ring" style={{ alignSelf: "flex-start" }}>
                <svg width="36" height="36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F0E9D8" strokeWidth="4"/>
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={lesson.ringColor}
                    strokeWidth="4"
                    strokeDasharray="88"
                    strokeDashoffset={lesson.ringOffset}
                  />
                </svg>
                <span className="pct">{lesson.ringPct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title"><h2>Glossary of the Day</h2><div className="rule"></div></div>
      <div className="card c12">
        <div className="mini-grid">
          <div className="mini-card">
            <h4 style={{ fontSize: "15px" }}>Volatility</h4>
            <p>The rate at which a stock's price rises or falls over a period of time.</p>
          </div>
          <div className="mini-card">
            <h4 style={{ fontSize: "15px" }}>Market Cap</h4>
            <p>Total value of a company's shares — price per share × total shares.</p>
          </div>
          <div className="mini-card">
            <h4 style={{ fontSize: "15px" }}>Dividend Yield</h4>
            <p>Annual dividend paid, shown as a percentage of the share price.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
