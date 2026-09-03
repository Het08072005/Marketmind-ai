import React, { useState, useEffect, useRef } from "react";
import { MASTERBOOK_DATA } from "../data/learningMasterbookData";

export default function MasterbookReaderModal({ isOpen, initialChapter = 1, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tocQuery, setTocQuery] = useState("");
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mm-bookmarks") || "[]");
    } catch {
      return [];
    }
  });

  const chapters = MASTERBOOK_DATA.chapters || [];
  const modules = MASTERBOOK_DATA.modules || [];
  const readerLayerRef = useRef(null);
  const tocListRef = useRef(null);
  const chapterRefs = useRef({});

  // Sync initial chapter on open
  useEffect(() => {
    if (isOpen) {
      const targetIdx = Math.max(0, Math.min(chapters.length - 1, initialChapter - 1));
      setCurrentIdx(targetIdx);
      if (readerLayerRef.current) {
        readerLayerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [isOpen, initialChapter, chapters.length]);

  // Handle keyboard shortcuts (Escape, Arrows)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && (e.altKey || e.metaKey)) {
        handlePrev();
      } else if (e.key === "ArrowRight" && (e.altKey || e.metaKey)) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIdx]);

  // Keep active TOC item in view
  useEffect(() => {
    if (!isOpen || !tocListRef.current) return;
    const activeItem = tocListRef.current.querySelector(`.toc-item[data-idx="${currentIdx}"]`);
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentIdx, isOpen]);

  if (!isOpen) return null;

  const toggleBookmark = (chId) => {
    setBookmarks((prev) => {
      const next = prev.includes(chId) ? prev.filter((id) => id !== chId) : [...prev, chId];
      localStorage.setItem("mm-bookmarks", JSON.stringify(next));
      return next;
    });
  };

  const jumpToChapter = (idx) => {
    const clamped = Math.max(0, Math.min(chapters.length - 1, idx));
    setCurrentIdx(clamped);
    setIsMobileTocOpen(false);
    if (readerLayerRef.current) {
      readerLayerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      jumpToChapter(currentIdx - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < chapters.length - 1) {
      jumpToChapter(currentIdx + 1);
    }
  };

  // Group chapters by module for left TOC (guaranteed 01 -> 10 order)
  const moduleOrder = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
  const groupedChapters = {};
  chapters.forEach((ch, idx) => {
    const m = ch.moduleId || "01";
    if (!groupedChapters[m]) groupedChapters[m] = [];
    groupedChapters[m].push({ ch, idx });
  });

  const q = tocQuery.trim().toLowerCase();
  const currentChapter = chapters[currentIdx] || chapters[0];
  const progressPct = chapters.length ? Math.round(((currentIdx + 1) / chapters.length) * 100) : 0;

  return (
    <div className="book-layer open" ref={readerLayerRef}>
      {/* Top sticky reader control bar */}
      <header className="readerbar">
        <button
          type="button"
          className="reader-back-btn"
          onClick={onClose}
          title="Back to Learning Overview"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <button
          type="button"
          className="toc-toggle"
          onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
        >
          ☰ Chapters
        </button>
        <div className="reader-title">
          Chapter {String(currentIdx + 1).padStart(2, "0")} · {currentChapter?.title}
        </div>
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          title="Previous Chapter"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={currentIdx === chapters.length - 1}
          title="Next Chapter"
        >
          Next →
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          title="Print or Save PDF"
          className="hide-mobile"
        >
          Print / PDF
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{ background: "#dc2626", borderColor: "#dc2626" }}
        >
          ✕ Close
        </button>
      </header>

      {/* Mobile Backdrop for Drawer */}
      <div
        className={`reader-toc-overlay ${isMobileTocOpen ? "show" : ""}`}
        onClick={() => setIsMobileTocOpen(false)}
      />

      <div className="reader-shell">
        {/* Left GeeksforGeeks-Style Sticky TOC */}
        <aside
          className={`reader-toc ${isMobileTocOpen ? "mobile-open" : ""}`}
          ref={tocListRef}
        >
          <div className="toc-top">
            <div className="toc-eyebrow">MASTERBOOK NAVIGATION</div>
            <div className="toc-title">Table of Contents</div>
            <input
              className="toc-search"
              type="search"
              placeholder="Search 62 chapters…"
              value={tocQuery}
              onChange={(e) => setTocQuery(e.target.value)}
            />
            <div className="toc-progress">
              <span>Chapter {String(currentIdx + 1).padStart(2, "0")} of {chapters.length}</span>
              <div className="toc-progress-track">
                <div
                  className="toc-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="toc-groups-container">
            {moduleOrder.map((modId) => {
              const list = groupedChapters[modId] || [];
              const modMeta = modules.find((m) => m.id === modId) || { title: `Module ${modId}` };
              const filtered = list.filter(({ ch }) => {
                if (!q) return true;
                return (
                  ch.title.toLowerCase().includes(q) ||
                  ch.category.toLowerCase().includes(q) ||
                  ch.lead.toLowerCase().includes(q)
                );
              });

              if (filtered.length === 0 && q) return null;

              return (
                <div key={modId} className="toc-group">
                  <div className="toc-group-title">
                    {modId} · {modMeta.title}
                  </div>
                  {filtered.map(({ ch, idx }) => {
                    const isActive = idx === currentIdx;
                    const isBookmarked = bookmarks.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        data-idx={idx}
                        className={`toc-item ${isActive ? "active" : ""}`}
                        onClick={() => jumpToChapter(idx)}
                      >
                        <span className="toc-no">{String(idx + 1).padStart(2, "0")}</span>
                        <span className="toc-item-text">
                          {ch.title}
                          {isBookmarked && <span style={{ color: "#d97706", marginLeft: "4px" }}>★</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Reading Canvas */}
        <main className="book">
          {currentIdx === 0 && (
            <div className="book-intro">
              <div className="eyebrow">EQUITY INTELLIGENCE · MASTERBOOK</div>
              <h2>The Market Analysis Masterbook</h2>
              <p>
                From first principles to analyst-grade diagnostics. Read sequentially or jump directly to any chapter via the Table of Contents.
                The curriculum intentionally separates objective evidence from narrative and treats technical patterns as probabilistic context rather than guaranteed forecasts.
              </p>
              <div className="disclaimer">
                <b>How to use this masterbook:</b> Understand the concept, study the worked example, apply the analyst checklist to a live company, and write down what evidence would invalidate your thesis.
              </div>
            </div>
          )}

          {/* Active Chapter View */}
          {currentChapter && (
            <article
              key={currentChapter.id}
              id={`ch-${currentChapter.id}`}
              className="chapter"
            >
              {/* 1. Header & Kicker */}
              <div className="chapter-kicker">
                <span>CHAPTER {String(currentIdx + 1).padStart(2, "0")}</span>
                <span>MODULE {currentChapter.moduleId}</span>
                <span>{currentChapter.category}</span>
              </div>
              <div className="chapter-title-row">
                <h2>{currentChapter.title}</h2>
                <button
                  type="button"
                  className={`bookmark ${bookmarks.includes(currentChapter.id) ? "saved" : ""}`}
                  onClick={() => toggleBookmark(currentChapter.id)}
                  title={bookmarks.includes(currentChapter.id) ? "Remove Bookmark" : "Bookmark this chapter"}
                  aria-label="Bookmark"
                >
                  {bookmarks.includes(currentChapter.id) ? "★" : "☆"}
                </button>
              </div>
              <p className="chapter-lead">{currentChapter.lead}</p>

              {/* 2. Why this matters */}
              {currentChapter.whyMatters && (
                <div className="whybox">
                  <b>Why this matters</b>
                  <p>{currentChapter.whyMatters}</p>
                </div>
              )}

              {/* 3. Formula / Framework */}
              {currentChapter.formula && (
                <div className="formula">
                  <div className="formula-label">{currentChapter.formulaLabel || "FORMULA / FRAMEWORK"}</div>
                  <div>{currentChapter.formula}</div>
                </div>
              )}

              {/* 4. Worked Example */}
              {currentChapter.example && (
                <div className="example">
                  <div className="mini-label">WORKED EXAMPLE</div>
                  <p>{currentChapter.example}</p>
                </div>
              )}

              {/* 5. Visual Walkthrough */}
              {currentChapter.visual && currentChapter.visual.nodes && currentChapter.visual.nodes.length > 0 && (
                <div className="visual-card">
                  <div className="visual-label">{currentChapter.visual.label || "VISUAL WALKTHROUGH"}</div>
                  <div className="visual-flow">
                    {currentChapter.visual.nodes.map((node, nIdx) => (
                      <React.Fragment key={nIdx}>
                        <div className={`vnode ${node.type}`}>{node.text}</div>
                        {nIdx < currentChapter.visual.nodes.length - 1 && <div className="varrow">→</div>}
                      </React.Fragment>
                    ))}
                  </div>
                  {currentChapter.visual.caption && (
                    <div className="visual-caption">{currentChapter.visual.caption}</div>
                  )}
                </div>
              )}

              {/* 6. Deep Dive Grid */}
              {currentChapter.deepDive && currentChapter.deepDive.length > 0 && (
                <>
                  <h3>Deep Dive</h3>
                  <div className="deep-grid">
                    {currentChapter.deepDive.map((item, dIdx) => (
                      <div key={dIdx} className="deep-item">
                        <span>{String(dIdx + 1).padStart(2, "0")}</span>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 7. Traps vs Checklist */}
              {((currentChapter.traps && currentChapter.traps.length > 0) || (currentChapter.checklist && currentChapter.checklist.length > 0)) && (
                <div className="two-col">
                  {currentChapter.traps && currentChapter.traps.length > 0 && (
                    <div className="panel danger">
                      <h3>Common traps</h3>
                      <ul>
                        {currentChapter.traps.map((trap, tIdx) => (
                          <li key={tIdx}>{trap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {currentChapter.checklist && currentChapter.checklist.length > 0 && (
                    <div className="panel good">
                      <h3>Analyst checklist</h3>
                      <ul>
                        {currentChapter.checklist.map((chk, cIdx) => (
                          <li key={cIdx}>{chk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 8. Advanced Lens */}
              {currentChapter.advanced && (
                <div className="advanced">
                  <span>ADVANCED LENS</span>
                  <p>{currentChapter.advanced}</p>
                </div>
              )}

              {/* 9. Research Anchor */}
              {currentChapter.sourceNote && (
                <div className="source-note">{currentChapter.sourceNote}</div>
              )}

              {/* Chapter Bottom Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", paddingTop: "18px", borderTop: "1px solid var(--line, #ddd)" }}>
                {currentIdx > 0 ? (
                  <button
                    type="button"
                    onClick={() => jumpToChapter(currentIdx - 1)}
                    style={{ padding: "8px 14px", borderRadius: "8px", background: "#f8f5ee", border: "1px solid #d9cfbd", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}
                  >
                    ← Previous ({String(currentIdx).padStart(2, "0")})
                  </button>
                ) : <div />}
                <button
                  type="button"
                  onClick={() => readerLayerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                  style={{ padding: "8px 14px", borderRadius: "8px", background: "transparent", border: "none", color: "#8a652d", fontWeight: "700", fontSize: "11.5px", cursor: "pointer" }}
                >
                  ↑ Back to Top
                </button>
                {currentIdx < chapters.length - 1 && (
                  <button
                    type="button"
                    onClick={() => jumpToChapter(currentIdx + 1)}
                    style={{ padding: "8px 14px", borderRadius: "8px", background: "var(--navy, #0b1533)", color: "#fff", border: "none", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}
                  >
                    Next ({String(currentIdx + 2).padStart(2, "0")}) →
                  </button>
                )}
              </div>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
