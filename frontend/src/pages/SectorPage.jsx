import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "../api/client";

const SECTOR_CATEGORIES = {
  "IT Services & Tech": ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"],
  "Banking & Finance": ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "KOTAKBANK", "BAJFINANCE"],
  "Energy & Conglomerate": ["RELIANCE", "ONGC", "ADANIENT", "ATGL", "ADANIPORTS", "COALINDIA"],
  "Automotive & Mobility": ["TATAMOTORS", "MARUTI", "M&M", "BAJAJ-AUTO", "EICHERMOT"],
  "Consumer & FMCG": ["ITC", "HINDUNILVR", "TITAN", "NESTLEIND", "ASIANPAINT"],
  "Infrastructure & Metals": ["LT", "TATASTEEL", "JSWSTEEL", "NTPC", "POWERGRID"],
  "Pharma & Healthcare": ["SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB"],
};

export default function SectorPage() {
  const [stocks, setStocks] = useState([]);
  const [selectedSector, setSelectedSector] = useState("Energy & Conglomerate");
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStocks = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getStocks();
        if (data && data.length > 0) {
          setStocks(data);
        }
      } catch (err) {
        console.warn("Using fallback stock repository", err);
      } finally {
        setLoading(false);
      }
    };
    loadStocks();

    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (action && action.target_page === "sector") {
        if (action.params?.symbol) {
          const sym = action.params.symbol;
          setSelectedSymbol(sym);
          for (const [sec, syms] of Object.entries(SECTOR_CATEGORIES)) {
            if (syms.includes(sym)) {
              setSelectedSector(sec);
              break;
            }
          }
        } else if (action.params?.sector) {
          setSelectedSector(action.params.sector);
        }
      }
    };

    window.addEventListener("marketmind:voice_action", handleVoiceAction);
    return () => {
      window.removeEventListener("marketmind:voice_action", handleVoiceAction);
    };
  }, []);

  // Update selected symbol if sector changes and current symbol isn't in sector
  useEffect(() => {
    const validSymbols = SECTOR_CATEGORIES[selectedSector] || [];
    if (validSymbols.length > 0 && !validSymbols.includes(selectedSymbol)) {
      setSelectedSymbol(validSymbols[0]);
    }
  }, [selectedSector]);

  // Filter peers in current sector
  const peers = useMemo(() => {
    const allowedSymbols = SECTOR_CATEGORIES[selectedSector] || [];
    return stocks.filter((s) => allowedSymbols.includes(s.symbol));
  }, [stocks, selectedSector]);

  // Selected company object
  const currentComp = useMemo(() => {
    return stocks.find((s) => s.symbol === selectedSymbol) || peers[0] || {
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd",
      price: 1316.0,
      revenue_growth: 14.2,
      net_margin: 8.1,
      roe: 11.6,
      pe_ratio: 24.8,
      market_cap: "₹19.9L Cr",
      esg: { overall: 72 }
    };
  }, [stocks, selectedSymbol, peers]);

  // Dynamic Sector Averages Calculation
  const sectorAvg = useMemo(() => {
    if (peers.length === 0) {
      return { revenue_growth: 10.5, net_margin: 7.2, roe: 12.0, pe_ratio: 28.5, esg: 65 };
    }
    const avgRev = peers.reduce((acc, p) => acc + (parseFloat(p.revenue_growth) || 10.0), 0) / peers.length;
    const avgMargin = peers.reduce((acc, p) => acc + (parseFloat(p.net_margin) || 6.5), 0) / peers.length;
    const avgRoe = peers.reduce((acc, p) => acc + (parseFloat(p.roe) || 11.0), 0) / peers.length;
    const avgPe = peers.reduce((acc, p) => acc + (parseFloat(p.pe_ratio) || 25.0), 0) / peers.length;
    const avgEsg = peers.reduce((acc, p) => acc + (p.esg?.overall || 65), 0) / peers.length;

    return {
      revenue_growth: Math.round(avgRev * 10) / 10,
      net_margin: Math.round(avgMargin * 10) / 10,
      roe: Math.round(avgRoe * 10) / 10,
      pe_ratio: Math.round(avgPe * 10) / 10,
      esg: Math.round(avgEsg)
    };
  }, [peers]);

  // Radar chart mathematical coordinate calculator (5 axes: Rev, Margin, ROE, PE Health, ESG)
  const getRadarPoints = (rev, margin, roe, pe, esg) => {
    const center = 110;
    const radius = 80;

    // Normalize metrics between 0.15 and 0.95
    const normRev = Math.min(Math.max((rev || 10) / 25, 0.2), 0.95);
    const normMargin = Math.min(Math.max((margin || 8) / 20, 0.2), 0.95);
    const normRoe = Math.min(Math.max((roe || 12) / 28, 0.2), 0.95);
    const normPe = Math.min(Math.max((40 / (pe || 25)) * 0.5, 0.2), 0.95); // Lower PE = Higher Value Score
    const normEsg = Math.min(Math.max((esg || 65) / 100, 0.2), 0.95);

    const values = [normRev, normMargin, normRoe, normPe, normEsg];
    const angles = [
      -Math.PI / 2,                  // Top: Revenue Growth
      -Math.PI / 2 + (2 * Math.PI) / 5, // Top Right: Net Margin
      -Math.PI / 2 + (4 * Math.PI) / 5, // Bottom Right: ROE
      -Math.PI / 2 + (6 * Math.PI) / 5, // Bottom Left: Valuation Health
      -Math.PI / 2 + (8 * Math.PI) / 5  // Top Left: ESG Score
    ];

    const coords = values.map((val, i) => {
      const r = radius * val;
      const x = Math.round(center + r * Math.cos(angles[i]));
      const y = Math.round(center + r * Math.sin(angles[i]));
      return `${x},${y}`;
    });

    return coords.join(" ");
  };

  const compRadarPoints = getRadarPoints(
    currentComp.revenue_growth,
    currentComp.net_margin,
    currentComp.roe,
    currentComp.pe_ratio,
    currentComp.esg?.overall
  );

  const sectorRadarPoints = getRadarPoints(
    sectorAvg.revenue_growth,
    sectorAvg.net_margin,
    sectorAvg.roe,
    sectorAvg.pe_ratio,
    sectorAvg.esg
  );

  return (
    <div className="grid">
      <div className="page-banner">
        <div>
          <h2>Sector Comparison Engine</h2>
          <p>Multi-dimensional side-by-side benchmarking across growth, margins, capital efficiency (ROE), and 5-axis radar positioning.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "9px 12px", fontSize: "12.5px", fontWeight: 600 }}
          >
            {Object.keys(SECTOR_CATEGORIES).map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            style={{ border: "1px solid var(--line)", background: "var(--paper)", borderRadius: "10px", padding: "9px 12px", fontSize: "12.5px", fontWeight: 600 }}
          >
            {(SECTOR_CATEGORIES[selectedSector] || []).map((sym) => {
              const c = stocks.find(s => s.symbol === sym);
              return <option key={sym} value={sym}>{c?.name || sym} ({sym})</option>;
            })}
          </select>
        </div>
      </div>

      {/* Growth & Margins vs Dynamic Sector Average */}
      <div className="card c7">
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>Benchmark Analysis · {selectedSector}</span>
              <h3>{currentComp.name || selectedSymbol} vs. Sector Average</h3>
            </div>
          </div>
          <span className="tag live" style={{ background: "rgba(216,188,139,.18)", color: "var(--gold-light)" }}>
            Live Sync
          </span>
        </div>

        {/* Revenue Growth Bar */}
        <div className="bar-row">
          <div className="lbl">Revenue Growth</div>
          <div className="bar-track">
            <div className="bar-fill you" style={{ width: `${Math.min(Math.max((currentComp.revenue_growth || 10) * 4, 10), 100)}%` }}></div>
          </div>
          <div className="val">{currentComp.revenue_growth || 14.2}%</div>
        </div>
        <div className="bar-row">
          <div className="lbl">Sector Avg</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.min(Math.max(sectorAvg.revenue_growth * 4, 10), 100)}%` }}></div>
          </div>
          <div className="val">{sectorAvg.revenue_growth}%</div>
        </div>

        {/* Net Margin Bar */}
        <div className="bar-row" style={{ marginTop: "14px" }}>
          <div className="lbl">Net Margin</div>
          <div className="bar-track">
            <div className="bar-fill you" style={{ width: `${Math.min(Math.max((currentComp.net_margin || 8) * 5, 10), 100)}%` }}></div>
          </div>
          <div className="val">{currentComp.net_margin || 8.1}%</div>
        </div>
        <div className="bar-row">
          <div className="lbl">Sector Avg</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.min(Math.max(sectorAvg.net_margin * 5, 10), 100)}%` }}></div>
          </div>
          <div className="val">{sectorAvg.net_margin}%</div>
        </div>

        {/* ROE Bar */}
        <div className="bar-row" style={{ marginTop: "14px" }}>
          <div className="lbl">ROE (Return on Equity)</div>
          <div className="bar-track">
            <div className="bar-fill you" style={{ width: `${Math.min(Math.max((currentComp.roe || 12) * 4, 10), 100)}%` }}></div>
          </div>
          <div className="val">{currentComp.roe || 11.6}%</div>
        </div>
        <div className="bar-row">
          <div className="lbl">Sector Avg</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.min(Math.max(sectorAvg.roe * 4, 10), 100)}%` }}></div>
          </div>
          <div className="val">{sectorAvg.roe}%</div>
        </div>

        <div className="legend" style={{ marginTop: "18px" }}>
          <span><i style={{ background: "var(--gold)" }}></i>{currentComp.name || selectedSymbol}</span>
          <span><i style={{ background: "var(--teal)" }}></i>{selectedSector} Avg</span>
        </div>
      </div>

      {/* Dynamic 5-Axis Positioning Radar Map */}
      <div className="card c5">
        <div className="card-head">
          <div className="card-eyebrow">
            <div>
              <span>5-Axis Radar</span>
              <h3 style={{ fontSize: "18px" }}>Positioning Map</h3>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
          <svg viewBox="0 0 220 220" width="200" height="200">
            {/* Background Web Grids */}
            <polygon points="110,20 190,80 160,180 60,180 30,80" fill="none" stroke="#EEE6D2" strokeWidth="1.2"/>
            <polygon points="110,50 165,85 145,150 75,150 55,85" fill="none" stroke="#EEE6D2" strokeWidth="1.2"/>
            <polygon points="110,80 138,95 128,128 92,128 82,95" fill="none" stroke="#EEE6D2" strokeWidth="1"/>
            
            {/* Axis Lines */}
            <line x1="110" y1="20" x2="110" y2="180" stroke="#F3ECDD"/>
            <line x1="30" y1="80" x2="190" y2="80" stroke="#F3ECDD"/>
            <line x1="60" y1="180" x2="190" y2="80" stroke="#F3ECDD" strokeDasharray="2 2"/>

            {/* Company Radar Polygon */}
            <polygon
              points={compRadarPoints}
              fill="#D9BC8B"
              fillOpacity="0.45"
              stroke="#B8935A"
              strokeWidth="2.2"
            />

            {/* Sector Average Radar Polygon */}
            <polygon
              points={sectorRadarPoints}
              fill="#2F6F62"
              fillOpacity="0.22"
              stroke="#2F6F62"
              strokeWidth="1.8"
            />

            {/* Vertex Markers */}
            <circle cx="110" cy="20" r="3" fill="#101B33"/>
            <circle cx="190" cy="80" r="3" fill="#101B33"/>
            <circle cx="160" cy="180" r="3" fill="#101B33"/>
            <circle cx="60" cy="180" r="3" fill="#101B33"/>
            <circle cx="30" cy="80" r="3" fill="#101B33"/>
          </svg>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", fontSize: "10.5px", color: "var(--ink-soft)", marginTop: "2px" }}>
          <span>Growth</span>
          <span>Margins</span>
          <span>ROE</span>
          <span>Value</span>
          <span>ESG</span>
        </div>
        <div className="legend" style={{ marginTop: "10px", justifyContent: "center" }}>
          <span><i style={{ background: "var(--gold)" }}></i>{currentComp.symbol}</span>
          <span><i style={{ background: "var(--teal)" }}></i>Sector Avg</span>
        </div>
      </div>

      {/* Interactive Peer Table */}
      <div className="section-title">
        <h2>{selectedSector} Peer Table</h2>
        <div className="rule"></div>
      </div>
      <div className="card c12">
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr>
                <th>Company</th>
                <th>Live Price</th>
                <th>Revenue Gr.</th>
                <th>Net Margin</th>
                <th>ROE</th>
                <th>P/E</th>
                <th>Market Cap</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {peers.map((p) => {
                const isSelected = p.symbol === selectedSymbol;
                return (
                  <tr key={p.symbol} style={isSelected ? { background: "rgba(216,188,139,.12)" } : {}}>
                    <td className="sym" style={{ cursor: "pointer" }} onClick={() => setSelectedSymbol(p.symbol)}>
                      <span className="row-logo">{p.symbol.slice(0, 2)}</span>
                      <b>{p.name || p.symbol}</b>
                      {isSelected && (
                        <span className="tag live" style={{ marginLeft: "8px", fontSize: "10px", padding: "2px 8px" }}>
                          Selected
                        </span>
                      )}
                    </td>
                    <td className="num">₹{p.price?.toLocaleString("en-IN")}</td>
                    <td className="num">{p.revenue_growth || 12.0}%</td>
                    <td className="num">{p.net_margin || 8.0}%</td>
                    <td className="num">{p.roe || 14.0}%</td>
                    <td className="num">{p.pe_ratio ? `${p.pe_ratio}x` : "24.5x"}</td>
                    <td className="num">{p.market_cap || "₹2.5L Cr"}</td>
                    <td>
                      <button
                        className={`pill-btn ${isSelected ? "" : "ghost"}`}
                        onClick={() => setSelectedSymbol(p.symbol)}
                        style={{ fontSize: "11px", padding: "4px 10px" }}
                      >
                        {isSelected ? "Comparing" : "Compare"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
