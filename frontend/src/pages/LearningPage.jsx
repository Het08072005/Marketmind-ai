import React, { useState, useEffect } from "react";
import { MASTERBOOK_DATA } from "../data/learningMasterbookData";
import MasterbookReaderModal from "../components/MasterbookReaderModal";

export default function LearningPage({ onBack }) {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mm-bookmarks") || "[]");
    } catch {
      return [];
    }
  });

  // Sync bookmarks from storage on interval / open
  useEffect(() => {
    const updateBookmarks = () => {
      try {
        setBookmarks(JSON.parse(localStorage.getItem("mm-bookmarks") || "[]"));
      } catch {
        setBookmarks([]);
      }
    };
    window.addEventListener("storage", updateBookmarks);
    return () => window.removeEventListener("storage", updateBookmarks);
  }, []);

  const openReader = (chapterId = 1) => {
    setActiveChapterId(chapterId);
    setIsReaderOpen(true);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBookmarksClick = () => {
    if (bookmarks.length > 0) {
      openReader(bookmarks[0]);
    } else {
      alert("No bookmarks yet. Click the star ☆ inside any chapter in Book View to save it.");
      openReader(1);
    }
  };

  const chapters = MASTERBOOK_DATA.chapters || [];
  const modules = MASTERBOOK_DATA.modules || [];
  const workflow = MASTERBOOK_DATA.workflow || [];
  const patterns = MASTERBOOK_DATA.patterns || [];
  const glossary = MASTERBOOK_DATA.glossary || [];
  const sources = MASTERBOOK_DATA.sources || [];

  const q = searchQuery.trim().toLowerCase();
  const filteredChapters = chapters.filter((c) => {
    const matchMod = selectedModule === "all" || c.moduleId === selectedModule;
    const matchQ =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.lead.toLowerCase().includes(q);
    return matchMod && matchQ;
  });

  return (
    <div className="mm-book-page">
      {/* 1. TOPNAV */}
      <nav className="mm-book-topnav">
        {/* Left: Back to Terminal Button */}
        {onBack && (
          <button
            type="button"
            className="mm-book-back-btn"
            onClick={onBack}
            title="Return to Main Trading Terminal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Terminal
          </button>
        )}

        {/* Center Quick Navigation Links */}
        <div className="mm-book-navlinks hide-mobile">
          <button type="button" onClick={() => scrollToSection("workflow")}>Workflow</button>
          <button type="button" onClick={() => scrollToSection("modules")}>Modules</button>
          <button type="button" onClick={() => scrollToSection("library")}>Library</button>
          <button type="button" onClick={() => scrollToSection("patterns")}>Hidden Patterns</button>
          <button type="button" onClick={() => scrollToSection("glossary")}>Glossary</button>
          <button type="button" onClick={() => scrollToSection("sources")}>Sources</button>
        </div>

        {/* Right Action Buttons */}
        <div className="mm-book-nav-actions">
          <button
            type="button"
            className="hide-mobile"
            onClick={handleBookmarksClick}
            title="View saved bookmarked chapters"
          >
            ★ Bookmarks {bookmarks.length > 0 ? `(${bookmarks.length})` : ""}
          </button>
          <button
            type="button"
            className="highlight"
            onClick={() => openReader(1)}
          >
            Book View
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="mm-book-hero">
        <div className="hero-inner">
          <div className="eyebrow">Market Analysis Masterbook · Beginner to Expert</div>
          <h1>Learn to think like an analyst, not chase tips.</h1>
          <p>
            A research-backed, interactive stock-market learning system covering business analysis,
            financial statements, valuation, technical analysis, portfolio risk, derivatives, macro,
            psychology and forensic diagnostics. Every chapter connects concept → evidence → example → interpretation → risk.
          </p>
          <div className="hero-note">
            <b>No “secret pattern” guarantees profit.</b> The hidden-pattern section teaches diagnostic clues that professional analysts investigate. Markets are probabilistic; risk control and evidence matter more than prediction.
          </div>
          <div className="stats">
            <div className="stat">
              <b>62</b>
              <span>Deep Chapters</span>
            </div>
            <div className="stat">
              <b>10</b>
              <span>Master Modules</span>
            </div>
            <div className="stat">
              <b>24</b>
              <span>Hidden Diagnostics</span>
            </div>
            <div className="stat">
              <b>64+</b>
              <span>Glossary Terms</span>
            </div>
            <div className="stat">
              <b>7</b>
              <span>Step Workflow</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT BODY */}
      <main className="mm-book-content">
        {/* Section: Workflow */}
        <section className="mm-book-section" id="workflow">
          <div className="section-head">
            <div>
              <div className="smallcap">THE CORE SYSTEM</div>
              <h2>Professional 7-Step Analysis Workflow</h2>
              <p>
                Use this order to prevent confirmation bias. The goal is not to collect every metric;
                it is to answer the few questions that determine return, risk and valuation.
              </p>
            </div>
          </div>
          <div className="workflow">
            {workflow.map((st) => (
              <div key={st.step} className="step">
                <span>{st.step}</span>
                <h3>{st.title}</h3>
                <p>{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Modules */}
        <section className="mm-book-section" id="modules">
          <div className="section-head">
            <div>
              <div className="smallcap">CURRICULUM MAP</div>
              <h2>10 Modules, from Zero to Expert</h2>
              <p>
                Start with market mechanics, then build business and accounting fluency before moving into
                valuation, technical context, portfolio construction and derivatives.
              </p>
            </div>
          </div>
          <div className="modules">
            {modules.map((m) => {
              const firstCh = chapters.find((c) => c.moduleId === m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  className="module-card"
                  onClick={() => {
                    setSelectedModule(m.id);
                    scrollToSection("library");
                  }}
                >
                  <span>{m.number}</span>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                  <b>{m.count}</b>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section: Master Library (62 Chapters) */}
        <section className="mm-book-section" id="library">
          <div className="section-head">
            <div>
              <div className="smallcap">MASTER LIBRARY</div>
              <h2>62 Deep-Dive Chapters</h2>
              <p>
                Search any concept or filter by module. Open a chapter for detailed explanation,
                formula, worked example, visual reasoning, traps, checklist and advanced lens.
              </p>
            </div>
          </div>

          <div className="library-toolbar">
            <input
              className="search"
              type="text"
              placeholder="Search P/E, cash flow, RSI, option Greeks, red flags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="filter"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="all">All modules ({chapters.length})</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.number} · {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="chapter-grid">
            {filteredChapters.map((ch) => (
              <button
                key={ch.id}
                type="button"
                className="chapter-card"
                onClick={() => openReader(ch.id)}
              >
                <div className="card-top">
                  <span className="mod-chip">{ch.moduleId}</span>
                  <span>{ch.chapterNumber}</span>
                </div>
                <h3>{ch.title}</h3>
                <p>
                  {ch.lead.length > 150 ? `${ch.lead.slice(0, 150)}…` : ch.lead}
                </p>
                <div className="card-foot">
                  <span>{ch.category}</span>
                  <span>Read chapter →</span>
                </div>
              </button>
            ))}
          </div>
          {filteredChapters.length === 0 && (
            <div style={{ textAlign: "center", color: "#66708a", padding: "40px" }}>
              No chapter matches this search.
            </div>
          )}
        </section>

        {/* Section: Hidden Patterns */}
        <section className="mm-book-section" id="patterns">
          <div className="section-head">
            <div>
              <div className="smallcap">ANALYST DIAGNOSTICS</div>
              <h2>24 “Hidden Patterns” Worth Investigating</h2>
              <p>
                These are not buy/sell secrets. They are cross-checks that reveal where reported numbers,
                cash flow, positioning or expectations may be telling different stories.
              </p>
            </div>
          </div>
          <div className="patterns">
            {patterns.map((pt) => (
              <div key={pt.no} className="pattern">
                <div className="pattern-no">{pt.no}</div>
                <div>
                  <h3>{pt.title}</h3>
                  <p>{pt.desc}</p>
                  <div className="pattern-use">{pt.analystUse}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Glossary */}
        <section className="mm-book-section" id="glossary">
          <div className="section-head">
            <div>
              <div className="smallcap">REFERENCE DESK</div>
              <h2>Market Glossary</h2>
              <p>Fast definitions for the vocabulary used throughout the masterbook.</p>
            </div>
          </div>
          <div className="glossary-grid">
            {glossary.map((g, idx) => (
              <div key={idx} className="gitem">
                <b>{g.term}</b>
                <p>{g.def}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Sources */}
        <section className="mm-book-section" id="sources">
          <div className="section-head">
            <div>
              <div className="smallcap">RESEARCH SHELF</div>
              <h2>Primary &amp; High-Quality Learning Sources</h2>
              <p>
                The masterbook synthesizes investor education, financial-analysis, valuation and
                derivatives concepts from regulator, exchange, professional and academic resources.
              </p>
            </div>
          </div>
          <div className="source-grid">
            {sources.map((s, idx) => (
              <a
                key={idx}
                className="source-card"
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <b>{s.title}</b>
                <p>{s.desc}</p>
                <span>{s.domain} ↗</span>
              </a>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="disclaimer">
          <b>Educational use only.</b> This material is designed to teach analysis and risk awareness. It is not a recommendation to buy, sell or hold any security. Examples are simplified and illustrative; verify current filings, exchange data, taxes, rules and product specifications before acting.
        </div>
      </main>

      {/* 4. Full Masterbook Reader Modal (GeeksforGeeks-Style Left TOC) */}
      <MasterbookReaderModal
        isOpen={isReaderOpen}
        initialChapter={activeChapterId}
        onClose={() => setIsReaderOpen(false)}
      />
    </div>
  );
}
