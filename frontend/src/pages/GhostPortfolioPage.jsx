import React from "react";

export default function GhostPortfolioPage() {
  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Ghost Portfolio</h2>
          <p>A parallel, imaginary portfolio of everything you rejected or sold too early — so you can see the decision, not just the price.</p>
        </div>
      </div>

      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Since Inception</span><h3>Real You vs. Ghost You</h3></div></div>
        </div>
        <div className="ghost-compare">
          <div className="ghost-block real">
            <div className="gl">Real You</div>
            <div className="gv">₹12.4L</div>
            <div className="gd">₹10L invested · Actual decisions taken</div>
          </div>
          <div className="ghost-vs">vs</div>
          <div className="ghost-block ghost">
            <div className="gl">👻 Ghost You</div>
            <div className="gv">₹13.1L</div>
            <div className="gd">"If you'd bought the stocks you rejected"</div>
          </div>
        </div>
      </div>

      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Insight</span><h3 style={{ fontSize: "18px" }}>Biggest Missed Decision</h3></div></div>
        </div>
        <div className="watch-row" style={{ borderBottom: "none" }}>
          <div className="watch-id">
            <div className="watch-logo">DM</div>
            <div>
              <div className="watch-name">Divi's Labs</div>
              <div className="watch-sub">Considered, not bought · Mar 2023</div>
            </div>
          </div>
          <div className="watch-right"><div className="watch-change up">+64%</div></div>
        </div>
      </div>

      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Insight</span><h3 style={{ fontSize: "18px" }}>Best Avoided Mistake</h3></div></div>
        </div>
        <div className="watch-row" style={{ borderBottom: "none" }}>
          <div className="watch-id">
            <div className="watch-logo">YB</div>
            <div>
              <div className="watch-name">Yes Bank</div>
              <div className="watch-sub">Considered, skipped · Jan 2020</div>
            </div>
          </div>
          <div className="watch-right"><div className="watch-change down">−78%</div></div>
        </div>
      </div>

      <div className="card c4">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Pattern</span><h3 style={{ fontSize: "18px" }}>Your Recurring Mistake</h3></div></div>
        </div>
        <p className="desc" style={{ marginBottom: 0 }}>
          Selling winners too early — in 6 of your last 9 exits, the stock continued rising an average of 18% in the following quarter.
        </p>
      </div>

      <div className="section-title"><h2>Decision Log</h2><div className="rule"></div></div>
      <div className="card c12">
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr><th>Stock</th><th>Your Decision</th><th>Date</th><th>Actual Outcome</th><th>Ghost Outcome</th></tr>
            </thead>
            <tbody>
              <tr><td className="sym">Divi's Labs</td><td>Rejected</td><td className="num">Mar 2023</td><td className="num">—</td><td className="num" style={{ color: "#2F6F62" }}>+64%</td></tr>
              <tr><td className="sym">Yes Bank</td><td>Rejected</td><td className="num">Jan 2020</td><td className="num">—</td><td className="num" style={{ color: "#A14545" }}>−78%</td></tr>
              <tr><td className="sym">Tata Motors</td><td>Sold early</td><td className="num">Jun 2023</td><td className="num" style={{ color: "#2F6F62" }}>+9%</td><td className="num" style={{ color: "#2F6F62" }}>+31%</td></tr>
              <tr><td className="sym">HDFC Bank</td><td>Held</td><td className="num">Ongoing</td><td className="num" style={{ color: "#2F6F62" }}>+12%</td><td className="num">+12%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
