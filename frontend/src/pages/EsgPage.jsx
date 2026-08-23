import React from "react";

export default function EsgPage() {
  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>ESG &amp; Sustainability Score</h2>
          <p>Environmental, social and governance insight for every holding — built for the modern, values-aligned investor.</p>
        </div>
      </div>

      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Reliance Industries</span><h3 style={{ fontSize: "18px" }}>Overall Score</h3></div></div>
        </div>
        <div className="esg-wrap" style={{ justifyContent: "center" }}>
          <div className="gauge big">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="72" fill="none" stroke="#F0E9D8" strokeWidth="14"/>
              <circle cx="85" cy="85" r="72" fill="none" stroke="#2F6F62" strokeWidth="14" strokeLinecap="round" strokeDasharray="452" strokeDashoffset="104"/>
            </svg>
            <div className="gauge-center">
              <div className="n">77</div>
              <div className="l">of 100 · Strong</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Breakdown</span><h3>Category Detail</h3></div></div>
        </div>
        <div className="bar-row"><div className="lbl">Environmental</div><div className="bar-track"><div className="bar-fill" style={{ width: "81%" }}></div></div><div className="val">81</div></div>
        <div className="bar-row"><div className="lbl">Social</div><div className="bar-track"><div className="bar-fill you" style={{ width: "74%" }}></div></div><div className="val">74</div></div>
        <div className="bar-row"><div className="lbl">Governance</div><div className="bar-track"><div className="bar-fill alt" style={{ width: "76%" }}></div></div><div className="val">76</div></div>
        <p style={{ fontSize: "12.5px", color: "var(--ink-soft)", lineHeight: "1.6", marginTop: "8px" }}>
          Strong marks on renewable energy investment and emissions reduction; social score held back by supply-chain labour disclosures.
        </p>
      </div>

      <div className="section-title"><h2>Peer Comparison</h2><div className="rule"></div></div>
      <div className="card c6">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Sector</span><h3 style={{ fontSize: "18px" }}>ESG vs. Peers</h3></div></div>
        </div>
        <div className="bar-row"><div className="lbl">Reliance</div><div className="bar-track"><div className="bar-fill you" style={{ width: "77%" }}></div></div><div className="val">77</div></div>
        <div className="bar-row"><div className="lbl">ONGC</div><div className="bar-track"><div className="bar-fill" style={{ width: "64%" }}></div></div><div className="val">64</div></div>
        <div className="bar-row"><div className="lbl">Adani Ent.</div><div className="bar-track"><div className="bar-fill" style={{ width: "58%" }}></div></div><div className="val">58</div></div>
        <div className="bar-row"><div className="lbl">BPCL</div><div className="bar-track"><div className="bar-fill" style={{ width: "69%" }}></div></div><div className="val">69</div></div>
      </div>

      <div className="card c6">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Portfolio</span><h3 style={{ fontSize: "18px" }}>Holdings ESG</h3></div></div>
        </div>
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr><th>Symbol</th><th>E</th><th>S</th><th>G</th><th>Overall</th></tr>
            </thead>
            <tbody>
              <tr><td className="sym">Reliance</td><td className="num">81</td><td className="num">74</td><td className="num">76</td><td className="num">77</td></tr>
              <tr><td className="sym">TCS</td><td className="num">72</td><td className="num">85</td><td className="num">88</td><td className="num">82</td></tr>
              <tr><td className="sym">HDFC Bank</td><td className="num">68</td><td className="num">79</td><td className="num">83</td><td className="num">77</td></tr>
              <tr><td className="sym">Tata Motors</td><td className="num">75</td><td className="num">70</td><td className="num">72</td><td className="num">72</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
