// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────
import { useState } from "react";

// ── Equity Curve ───────────────────────────────────────────────────────────────
export function EquityCurve({ trades, T }) {
  const sorted = [...trades].sort(
    (a, b) => a.date.localeCompare(b.date) || a.entryTime.localeCompare(b.entryTime)
  );
  let run = 0;
  const pts = sorted.map(t => { run += t.netPnL; return run; });

  if (pts.length < 2) {
    return (
      <div style={{ height: 110, display: "flex", alignItems: "center", justifyContent: "center", color: T.textDim, fontSize: 12 }}>
        Add more trades to see curve
      </div>
    );
  }

  const W = 340, H = 110;
  const min = Math.min(...pts, 0), max = Math.max(...pts, 0);
  const rng = max - min || 1;
  const py  = v => H - ((v - min) / rng) * H;

  const coords = pts.map((v, i) => `${(i / (pts.length - 1)) * W},${py(v)}`).join(" ");
  const last   = pts.at(-1);
  const col    = last >= 0 ? T.accent : T.red;
  const zero   = py(0);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: H, overflow: "visible" }}>
      <defs>
        <linearGradient id="ec" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={col} stopOpacity="0.35" />
          <stop offset="100%" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      {zero > 2 && zero < H - 2 && (
        <line x1="0" y1={zero} x2={W} y2={zero} stroke={T.cardBorder} strokeWidth="1" strokeDasharray="4,4" />
      )}
      <path d={`M0,${H} ${coords.split(" ").map(p => `L${p}`).join(" ")} L${W},${H} Z`} fill="url(#ec)" />
      <polyline points={coords} fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const [x, y] = coords.split(" ").at(-1).split(",");
        return <circle cx={x} cy={y} r="5" fill={col} stroke="#090B0F" strokeWidth="2" />;
      })()}
    </svg>
  );
}

// ── Drawdown Curve ─────────────────────────────────────────────────────────────
export function DrawdownCurve({ ddCurve, T }) {
  if (!ddCurve || ddCurve.length < 2) {
    return (
      <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: T.textDim, fontSize: 12 }}>
        Not enough data
      </div>
    );
  }

  const W = 340, H = 80;
  const min = Math.min(...ddCurve, -0.01);
  const rng = Math.abs(min) || 1;
  const py  = v => ((Math.abs(v)) / rng) * H;

  const coords = ddCurve.map((v, i) => `${(i / (ddCurve.length - 1)) * W},${py(v)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: H, overflow: "visible" }}>
      <defs>
        <linearGradient id="dd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={T.red} stopOpacity="0.4" />
          <stop offset="100%" stopColor={T.red} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={`M0,0 ${coords.split(" ").map(p => `L${p}`).join(" ")} L${W},0 Z`} fill="url(#dd)" />
      <polyline points={coords} fill="none" stroke={T.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Bar Chart ──────────────────────────────────────────────────────────────────
export function BarChart({ data, height = 60, T }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => Math.abs(d.val)), 0.01);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height, padding: "0 2px" }}>
      {data.map((d, i) => {
        const h = Math.max(3, (Math.abs(d.val) / max) * height);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height }}>
            <div style={{ width: "100%", height: h, background: d.val >= 0 ? T.accent : T.red, borderRadius: "3px 3px 0 0", opacity: 0.85 }} />
          </div>
        );
      })}
    </div>
  );
}

// ── P&L Calendar ──────────────────────────────────────────────────────────────
export function PnLCalendar({ trades, onDaySelect, T }) {
  const [view, setView] = useState(new Date());
  const yr = view.getFullYear(), mo = view.getMonth();

  const byDate = {};
  trades.forEach(t => {
    if (!byDate[t.date]) byDate[t.date] = { pnl: 0, count: 0, wins: 0 };
    byDate[t.date].pnl   += t.netPnL;
    byDate[t.date].count++;
    if (t.netPnL > 0) byDate[t.date].wins++;
  });

  const first  = new Date(yr, mo, 1).getDay();
  const days   = new Date(yr, mo + 1, 0).getDate();
  const todStr = new Date().toISOString().split("T")[0];
  const maxA   = Math.max(...Object.values(byDate).map(d => Math.abs(d.pnl)), 1);
  const mKey   = `${yr}-${String(mo + 1).padStart(2, "0")}`;
  const mPnL   = Object.entries(byDate).filter(([d]) => d.startsWith(mKey)).reduce((s, [, d]) => s + d.pnl, 0);
  const mCnt   = Object.entries(byDate).filter(([d]) => d.startsWith(mKey)).reduce((s, [, d]) => s + d.count, 0);

  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button onClick={() => setView(new Date(yr, mo - 1, 1))} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, color: T.text, borderRadius: 10, padding: "6px 14px", cursor: "pointer", fontSize: 16 }}>‹</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{view.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: mPnL >= 0 ? T.accent : T.red, marginTop: 1 }}>
            {mCnt > 0 ? `${mPnL >= 0 ? "+" : "-"}₹${(Math.abs(mPnL) / 1000).toFixed(1)}K · ${mCnt} trade${mCnt > 1 ? "s" : ""}` : "No trades this month"}
          </div>
        </div>
        <button onClick={() => setView(new Date(yr, mo + 1, 1))} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, color: T.text, borderRadius: 10, padding: "6px 14px", cursor: "pointer", fontSize: 16 }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 3 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9, color: T.textDim, fontWeight: 700, paddingBottom: 4 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const key = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const d   = byDate[key];
          const isTod = key === todStr;
          const intensity = d ? Math.min(Math.abs(d.pnl) / maxA, 1) : 0;
          const bg = d ? (d.pnl >= 0 ? `rgba(0,212,170,${0.15 + intensity * 0.55})` : `rgba(255,77,109,${0.15 + intensity * 0.55})`) : "transparent";
          return (
            <button key={day} onClick={() => d && onDaySelect && onDaySelect(key)}
              style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 8, background: bg, cursor: d ? "pointer" : "default", padding: 2, border: isTod ? `2px solid ${T.accent}` : `1px solid ${d ? T.cardBorder : "transparent"}` }}>
              <div style={{ fontSize: 11, fontWeight: isTod ? 700 : 500, color: d ? (d.pnl >= 0 ? T.accent : T.red) : (isTod ? T.accent : T.textDim) }}>{day}</div>
              {d && <div style={{ fontSize: 7, color: d.pnl >= 0 ? T.accent : T.red, fontWeight: 700, lineHeight: 1, marginTop: 1 }}>
                {d.pnl >= 0 ? "+" : ""}{(d.pnl / 1000).toFixed(1)}K
              </div>}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
        {[[T.accent, "Profit"], [T.red, "Loss"]].map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c, opacity: 0.75 }} />
            <span style={{ fontSize: 10, color: T.textMid }}>{l}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, border: `2px solid ${T.accent}` }} />
          <span style={{ fontSize: 10, color: T.textMid }}>Today</span>
        </div>
      </div>
    </div>
  );
}

// ── Monthly Strip ──────────────────────────────────────────────────────────────
export function MonthlyStrip({ trades, T }) {
  const mp = {};
  trades.forEach(t => {
    const k = t.date.slice(0, 7);
    if (!mp[k]) mp[k] = { pnl: 0, count: 0 };
    mp[k].pnl   += t.netPnL;
    mp[k].count++;
  });
  const months = Object.keys(mp).sort();
  if (!months.length) return <div style={{ color: T.textDim, fontSize: 12, textAlign: "center", padding: 8 }}>No data yet</div>;
  const maxA = Math.max(...Object.values(mp).map(d => Math.abs(d.pnl)), 1);
  return (
    <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
      {months.map(m => {
        const d   = mp[m];
        const int = Math.min(Math.abs(d.pnl) / maxA, 1);
        const bg  = d.pnl >= 0 ? `rgba(0,212,170,${0.15 + int * 0.65})` : `rgba(255,77,109,${0.15 + int * 0.65})`;
        return (
          <div key={m} style={{ flex: "0 0 auto", width: 46, textAlign: "center" }}>
            <div style={{ height: 46, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: d.pnl >= 0 ? T.accent : T.red }}>{d.pnl >= 0 ? "+" : ""}{(d.pnl / 1000).toFixed(0)}K</span>
            </div>
            <div style={{ fontSize: 8, color: T.textDim }}>{new Date(m + "-01").toLocaleDateString("en-IN", { month: "short" })}</div>
            <div style={{ fontSize: 7, color: T.textDim }}>{new Date(m + "-01").getFullYear()}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Time Heatmap ───────────────────────────────────────────────────────────────
export function TimeHeatmap({ trades, T }) {
  const slots = [
    { label: "09:15–10:00", sm: 555, em: 600 },
    { label: "10:00–11:00", sm: 600, em: 660 },
    { label: "11:00–12:00", sm: 660, em: 720 },
    { label: "12:00–13:00", sm: 720, em: 780 },
    { label: "13:00–14:00", sm: 780, em: 840 },
    { label: "14:00–15:30", sm: 840, em: 930 },
  ];
  const data = slots.map(s => {
    const toMin = (str) => { const [h, m] = (str || "09:00").split(":").map(Number); return h * 60 + m; };
    const ts = trades.filter(t => { const mins = toMin(t.entryTime); return mins >= s.sm && mins < s.em; });
    return { ...s, count: ts.length, pnl: ts.reduce((a, t) => a + t.netPnL, 0), wr: ts.length ? ts.filter(t => t.netPnL > 0).length / ts.length * 100 : 0 };
  });
  const maxA = Math.max(...data.map(d => Math.abs(d.pnl)), 1);
  const fC   = (n) => `${n >= 0 ? "+" : "-"}₹${Math.abs(n) >= 1000 ? (Math.abs(n) / 1000).toFixed(1) + "K" : Math.abs(n).toFixed(0)}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map(d => {
        const int = Math.min(Math.abs(d.pnl) / maxA, 1);
        const col = d.pnl >= 0 ? T.accent : T.red;
        return (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 88, fontSize: 9.5, color: T.textMid, flexShrink: 0 }}>{d.label}</div>
            <div style={{ flex: 1, height: 28, background: T.card, borderRadius: 6, overflow: "hidden", position: "relative" }}>
              {d.count > 0 && <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${int * 100}%`, background: `${col}30`, borderRadius: 6 }} />}
              <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: d.count > 0 ? col : T.textDim, fontWeight: 600 }}>{d.count > 0 ? fC(d.pnl) : "—"}</span>
                {d.count > 0 && <span style={{ fontSize: 9, color: T.textMid }}>{d.wr.toFixed(0)}% WR · {d.count}T</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Discipline Score ───────────────────────────────────────────────────────────
export function DisciplineScore({ trades, T }) {
  const n       = trades.length || 1;
  const slUse   = trades.filter(t => t.stopLoss).length / n * 100;
  const stratUse = trades.filter(t => t.strategy).length / n * 100;
  const noteUse = trades.filter(t => t.notes && t.notes.trim()).length / n * 100;
  const mkCost  = Math.max(0, 100 - (trades.reduce((s, t) => s + (t.mistakes?.length || 0), 0) / n) * 25);
  const overall = Math.round(slUse * 0.3 + stratUse * 0.25 + noteUse * 0.15 + mkCost * 0.3);
  const c       = overall >= 75 ? T.accent : overall >= 50 ? T.gold : T.red;
  const label   = overall >= 80 ? "Elite Trader" : overall >= 65 ? "Disciplined" : overall >= 50 ? "Improving" : "Needs Work";

  return (
    <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 16, margin: "0 16px 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: T.textMid, letterSpacing: "0.1em", textTransform: "uppercase" }}>TRADING DISCIPLINE</div>
        <span style={{ fontSize: 9, color: T.textDim }}>Journal habits · not predictive</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 4 }}>
        <div style={{ width: 68, height: 68, borderRadius: 34, border: `3px solid ${c}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `${c}12`, flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: c, lineHeight: 1 }}>{overall}</div>
          <div style={{ fontSize: 8, color: T.textDim }}>/ 100</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: c, marginBottom: 10 }}>{label}</div>
          {[["Stop Loss Use", slUse], ["Strategy Tagging", stratUse], ["Notes Written", noteUse], ["Mistake Control", mkCost]].map(([l, v]) => (
            <div key={l} style={{ marginBottom: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10.5, color: T.textMid }}>{l}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: v >= 70 ? T.accent : v >= 45 ? T.gold : T.red }}>{v.toFixed(0)}%</span>
              </div>
              <div style={{ height: 4, background: T.card, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${v}%`, height: "100%", background: v >= 70 ? T.accent : v >= 45 ? T.gold : T.red, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
