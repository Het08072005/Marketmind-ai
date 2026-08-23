import React from "react";

export default function CandlestickPage() {
  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Candlestick Pattern Detection</h2>
          <p>Automatic scanning across your watchlist for classic reversal and continuation patterns.</p>
        </div>
      </div>

      <div className="card c12">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>TCS · Daily</span><h3>Live Chart</h3></div></div>
        </div>
        <span className="pattern-flag">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M13 2 3 14h7l-1 8 10-12h-7z"/>
          </svg>
          Bullish Engulfing detected · 2h ago
        </span>
        <svg viewBox="0 0 720 200" width="100%" height="200">
          <line x1="0" y1="40" x2="720" y2="40" stroke="#EEE6D2"/>
          <line x1="0" y1="100" x2="720" y2="100" stroke="#EEE6D2"/>
          <line x1="0" y1="160" x2="720" y2="160" stroke="#EEE6D2"/>
          <g stroke="#A14545" strokeWidth="1.6">
            <line x1="30" y1="50" x2="30" y2="100"/><rect x="22" y="62" width="16" height="26" fill="#A14545"/>
            <line x1="80" y1="60" x2="80" y2="118" stroke="#2F6F62"/><rect x="72" y="70" width="16" height="30" fill="#2F6F62"/>
            <line x1="130" y1="40" x2="130" y2="92" stroke="#A14545"/><rect x="122" y="48" width="16" height="24" fill="#A14545"/>
          </g>
          <g stroke="#2F6F62" strokeWidth="1.8">
            <line x1="190" y1="36" x2="190" y2="104"/><rect x="178" y="52" width="24" height="40" fill="#2F6F62"/>
            <line x1="250" y1="20" x2="250" y2="92" strokeWidth="2.6"/><rect x="234" y="30" width="32" height="48" fill="#2F6F62" strokeWidth="2.6"/>
          </g>
          <g stroke="#A14545" strokeWidth="1.6"><line x1="320" y1="44" x2="320" y2="100"/><rect x="312" y="54" width="16" height="28" fill="#A14545"/></g>
          <g stroke="#2F6F62" strokeWidth="1.6"><line x1="370" y1="36" x2="370" y2="88"/><rect x="358" y="44" width="24" height="32" fill="#2F6F62"/><line x1="430" y1="16" x2="430" y2="76" strokeWidth="2.4"/><rect x="416" y="22" width="28" height="40" fill="#2F6F62" strokeWidth="2.4"/></g>
          <g stroke="#A14545" strokeWidth="1.6"><line x1="490" y1="30" x2="490" y2="86"/><rect x="482" y="38" width="16" height="30" fill="#A14545"/></g>
          <g stroke="#2F6F62" strokeWidth="1.6"><line x1="540" y1="24" x2="540" y2="70"/><rect x="528" y="30" width="24" height="28" fill="#2F6F62"/><line x1="600" y1="10" x2="600" y2="60" strokeWidth="2.6"/><rect x="586" y="14" width="28" height="36" fill="#2F6F62" strokeWidth="2.6"/></g>
          <g stroke="#A14545" strokeWidth="1.6"><line x1="660" y1="20" x2="660" y2="60"/><rect x="652" y="26" width="16" height="22" fill="#A14545"/></g>
        </svg>
      </div>

      <div className="card c6">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Scanner</span><h3>Recent Detections</h3></div></div>
        </div>
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr><th>Symbol</th><th>Pattern</th><th>Confidence</th><th>Time</th></tr>
            </thead>
            <tbody>
              <tr><td className="sym">TCS</td><td>Bullish Engulfing</td><td className="num">91%</td><td className="num">2h ago</td></tr>
              <tr><td className="sym">Infosys</td><td>Morning Star</td><td className="num">84%</td><td className="num">5h ago</td></tr>
              <tr><td className="sym">Tata Steel</td><td>Doji</td><td className="num">76%</td><td className="num">1d ago</td></tr>
              <tr><td className="sym">Axis Bank</td><td>Hammer</td><td className="num">88%</td><td className="num">1d ago</td></tr>
              <tr><td className="sym">Wipro</td><td>Bearish Engulfing</td><td className="num">80%</td><td className="num">2d ago</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card c6">
        <div className="card-head">
          <div className="card-eyebrow"><div><span>Reference</span><h3 style={{ fontSize: "18px" }}>Pattern Library</h3></div></div>
        </div>
        <div className="pattern-lib-card">
          <svg viewBox="0 0 40 50"><line x1="20" y1="6" x2="20" y2="44" stroke="#A14545" strokeWidth="2"/><rect x="12" y="20" width="16" height="10" fill="#A14545"/></svg>
          <div><div className="pn">Doji</div><div className="pd">Open and close nearly equal — signals indecision.</div></div>
        </div>
        <div className="pattern-lib-card">
          <svg viewBox="0 0 40 50"><line x1="20" y1="8" x2="20" y2="20" stroke="#2F6F62" strokeWidth="2"/><rect x="12" y="8" width="16" height="12" fill="#2F6F62"/><line x1="20" y1="20" x2="20" y2="44" stroke="#2F6F62" strokeWidth="2"/></svg>
          <div><div className="pn">Hammer</div><div className="pd">Small body, long lower wick — possible bullish reversal.</div></div>
        </div>
        <div className="pattern-lib-card">
          <svg viewBox="0 0 40 50"><rect x="6" y="18" width="12" height="16" fill="#A14545"/><rect x="20" y="10" width="16" height="26" fill="#2F6F62"/></svg>
          <div><div className="pn">Bullish Engulfing</div><div className="pd">A large green candle fully engulfs the prior red candle.</div></div>
        </div>
        <div className="pattern-lib-card" style={{ marginBottom: 0 }}>
          <svg viewBox="0 0 40 50"><rect x="4" y="10" width="10" height="12" fill="#A14545"/><rect x="16" y="16" width="8" height="8" fill="#A14545"/><rect x="26" y="8" width="10" height="24" fill="#2F6F62"/></svg>
          <div><div className="pn">Morning Star</div><div className="pd">Three-candle pattern signalling a bottom reversal.</div></div>
        </div>
      </div>
    </div>
  );
}
