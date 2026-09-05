// ─── ANALYTICS SCREEN ─────────────────────────────────────────────────────────
import { useState } from "react";
import { computeStats, rollingPnL } from "../utils/calc.js";
import { fC, fP, todayStr }         from "../utils/format.js";
import { buildStyles }              from "../components/Styles.js";
import { Row }                      from "../components/UI.jsx";
import {
  EquityCurve, DrawdownCurve, BarChart,
  PnLCalendar, MonthlyStrip,
  TimeHeatmap, DisciplineScore,
} from "../components/Charts.jsx";

// ── Main container ─────────────────────────────────────────────────────────────
export function AnalyticsScreen({ trades, T }) {
  const S    = buildStyles(T);
  const [tab, setTab]      = useState("OVERVIEW");
  const [selDay, setSelDay] = useState(null);
  const stats = computeStats(trades);
  const tabs  = ["OVERVIEW", "CALENDAR", "STRATEGY", "TIME", "STOCKS", "MISTAKES"];

  if (!stats) return (
    <div style={S.page}>
      <div style={S.hdr}><div style={{ fontSize: 18, fontWeight: 700 }}>Analytics</div></div>
      <div style={{ textAlign: "center", padding: "60px 20px", color: T.textDim }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>📈</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No data yet</div>
        <div style={{ fontSize: 13 }}>Add your first trade to see analytics</div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Analytics</div>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 2 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => { setTab(t); setSelDay(null); }}
              style={{ padding: "6px 11px", borderRadius: 20, fontSize: 9.5, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", whiteSpace: "nowrap", border: "none", background: tab === t ? T.accentDim : "transparent", color: tab === t ? T.accent : T.textDim }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "OVERVIEW"  && <OverviewTab  trades={trades} stats={stats} T={T} />}
      {tab === "CALENDAR"  && <CalendarTab  trades={trades} selDay={selDay} onSelDay={setSelDay} T={T} />}
      {tab === "STRATEGY"  && <StrategyTab  trades={trades} T={T} />}
      {tab === "TIME"      && <TimeTab      trades={trades} T={T} />}
      {tab === "STOCKS"    && <StocksTab    trades={trades} T={T} />}
      {tab === "MISTAKES"  && <MistakesTab  trades={trades} T={T} />}
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────
function OverviewTab({ trades, stats, T }) {
  const S = buildStyles(T);
  const w7  = rollingPnL(trades, 7);
  const w30 = rollingPnL(trades, 30);
  const w90 = rollingPnL(trades, 90);

  return (
    <>
      {/* Rolling P&L */}
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 12 }}>ROLLING P&L</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[["7 Days", w7], ["30 Days", w30], ["90 Days", w90]].map(([l, v]) => (
            <div key={l} style={{ background: T.surface, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.textDim, marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: v >= 0 ? T.accent : T.red }}>{fC(v)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Split */}
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 12 }}>SESSION ANALYSIS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["🌅 Morning (9:15–12:00)", stats.morning],
            ["🌆 Afternoon (12:00–15:30)", stats.afternoon],
          ].map(([label, s]) => (
            <div key={label} style={{ background: T.surface, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 10, color: T.textDim, marginBottom: 8, lineHeight: 1.3 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.pnl >= 0 ? T.accent : T.red }}>{fC(s.pnl)}</div>
              <div style={{ fontSize: 10, color: T.textMid, marginTop: 4 }}>{s.count} trades · {s.wr.toFixed(0)}% WR</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 12 }}>KEY METRICS</div>
        {[
          ["Total Net P&L",    fC(stats.totalNetPnL),   stats.totalNetPnL   >= 0 ? T.accent : T.red],
          ["Gross P&L",        fC(stats.totalGrossPnL), stats.totalGrossPnL >= 0 ? T.accent : T.red],
          ["Total Charges",    `-₹${stats.totalCharges.toFixed(0)}`, T.red, `${((stats.totalCharges / Math.abs(stats.totalGrossPnL || 1)) * 100).toFixed(1)}% of gross`],
          ["Win Rate",         `${stats.winRate.toFixed(1)}%`,       stats.winRate >= 50 ? T.accent : T.gold],
          ["Profit Factor",    stats.profitFactor.toFixed(2),        stats.profitFactor >= 1 ? T.accent : T.red],
          ["Expectancy/Trade", fC(stats.expectancy),                 stats.expectancy >= 0 ? T.accent : T.red],
          ["Avg Win",          fC(stats.avgWin),         T.accent],
          ["Avg Loss",         `-₹${stats.avgLoss.toFixed(0)}`,      T.red],
          ["Max Drawdown",     fC(stats.maxDrawdown),    T.red],
          ["Max Win Streak",   stats.maxWinStreak,       T.accent],
          ["Max Loss Streak",  stats.maxLossStreak,      T.red],
          ["Avg Hold Time",    stats.avgHoldStr,         T.text],
        ].map(([k, v, c, s], i, a) => <Row key={k} label={k} val={v} color={c} sub={s} last={i === a.length - 1} T={T} />)}
      </div>

      <DisciplineScore trades={trades} T={T} />

      {/* Equity Curve */}
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 10 }}>EQUITY CURVE</div>
        <EquityCurve trades={trades} T={T} />
      </div>

      {/* Drawdown Curve */}
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 6 }}>DRAWDOWN CURVE</div>
        <div style={{ fontSize: 11, color: T.textDim, marginBottom: 10 }}>Running drawdown from peak equity</div>
        <DrawdownCurve ddCurve={stats.ddCurve} T={T} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: T.red }}>Max: {fC(stats.maxDrawdown)}</span>
        </div>
      </div>
    </>
  );
}

// ── Calendar ───────────────────────────────────────────────────────────────────
function CalendarTab({ trades, selDay, onSelDay, T }) {
  const S = buildStyles(T);
  const dayTrades = selDay ? trades.filter(t => t.date === selDay) : [];
  return (
    <>
      <div style={S.card}>
        <PnLCalendar trades={trades} onDaySelect={d => onSelDay(selDay === d ? null : d)} T={T} />
      </div>
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 10 }}>MONTHLY SUMMARY</div>
        <MonthlyStrip trades={trades} T={T} />
      </div>
      {selDay && (
        <div>
          <div style={{ padding: "4px 20px 8px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {new Date(selDay + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </span>
            <button onClick={() => onSelDay(null)} style={{ background: "none", border: "none", color: T.textDim, fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
          {dayTrades.length === 0
            ? <div style={{ ...S.card, textAlign: "center", color: T.textDim, padding: 20 }}>No trades logged on this day</div>
            : dayTrades.map(t => (
              <div key={t.id} style={{ ...S.card, borderLeft: `3px solid ${t.netPnL >= 0 ? T.accent : T.red}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{t.stock} <span style={{ fontSize: 10, color: t.side === "BUY" ? T.accent : T.gold }}>{t.side}</span></span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.netPnL >= 0 ? T.accent : T.red }}>{fC(t.netPnL)}</span>
                </div>
                <div style={{ fontSize: 11, color: T.textMid }}>₹{t.entryPrice}→₹{t.exitPrice} · {t.qty} qty · {t.holdStr}</div>
              </div>
            ))}
          {dayTrades.length > 0 && (
            <div style={{ ...S.card, background: dayTrades.reduce((s, t) => s + t.netPnL, 0) >= 0 ? T.accentDim : T.redDim }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: T.textMid }}>Day Total · {dayTrades.length} trades</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: dayTrades.reduce((s, t) => s + t.netPnL, 0) >= 0 ? T.accent : T.red }}>
                  {fC(dayTrades.reduce((s, t) => s + t.netPnL, 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── Strategy ───────────────────────────────────────────────────────────────────
function StrategyTab({ trades, T }) {
  const S  = buildStyles(T);
  const sd = {};
  trades.forEach(t => { const s = t.strategy || "Untagged"; (sd[s] = sd[s] || []).push(t); });
  return (
    <>
      {Object.entries(sd).sort((a, b) => b[1].reduce((s,t)=>s+t.netPnL,0) - a[1].reduce((s,t)=>s+t.netPnL,0)).map(([name, ts]) => {
        const wins = ts.filter(t => t.netPnL > 0), losses = ts.filter(t => t.netPnL <= 0);
        const pnl  = ts.reduce((s, t) => s + t.netPnL, 0);
        const wr   = ts.length ? wins.length / ts.length * 100 : 0;
        const avg  = pnl / ts.length;
        const gw   = wins.reduce((s, t) => s + t.netPnL, 0);
        const gl   = Math.abs(losses.reduce((s, t) => s + t.netPnL, 0));
        const pf   = gl > 0 ? gw / gl : gw > 0 ? 999 : 0;
        return (
          <div key={name} style={{ ...S.card, borderLeft: `3px solid ${pnl >= 0 ? T.accent : T.red}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div><div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div><div style={{ fontSize: 11, color: T.textMid }}>{ts.length} trades</div></div>
              <div style={{ fontSize: 16, fontWeight: 700, color: pnl >= 0 ? T.accent : T.red }}>{fC(pnl)}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[["Win Rate", `${wr.toFixed(0)}%`, wr >= 50 ? T.accent : T.red], ["Avg P&L", fC(avg), avg >= 0 ? T.accent : T.red], ["Prof.Factor", pf.toFixed(2), pf >= 1 ? T.accent : T.red]].map(([l, v, c]) => (
                <div key={l} style={{ background: T.surface, borderRadius: 8, padding: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: T.textDim, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── Time ───────────────────────────────────────────────────────────────────────
function TimeTab({ trades, T }) {
  const S    = buildStyles(T);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayP = days.map((d, i) => {
    const ts = trades.filter(t => new Date(t.date + "T12:00:00").getDay() === i);
    return { d, count: ts.length, pnl: ts.reduce((s, t) => s + t.netPnL, 0), wr: ts.length ? ts.filter(t => t.netPnL > 0).length / ts.length * 100 : 0 };
  }).filter(x => x.count > 0);
  const maxA = Math.max(...dayP.map(d => Math.abs(d.pnl)), 1);
  return (
    <>
      <div style={S.card}><div style={{ ...S.lbl, marginBottom: 12 }}>INTRADAY TIME HEATMAP</div><TimeHeatmap trades={trades} T={T} /></div>
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 12 }}>DAY OF WEEK PERFORMANCE</div>
        {dayP.length === 0
          ? <div style={{ color: T.textDim, fontSize: 12, textAlign: "center" }}>Not enough data yet</div>
          : dayP.map(d => (
            <div key={d.d} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 30, fontSize: 11, color: T.textMid, fontWeight: 600 }}>{d.d}</div>
              <div style={{ flex: 1, height: 26, background: T.card, borderRadius: 6, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.abs(d.pnl) / maxA * 100}%`, background: d.pnl >= 0 ? `${T.accent}30` : `${T.red}30`, borderRadius: 6 }} />
                <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: d.pnl >= 0 ? T.accent : T.red }}>{fC(d.pnl)}</span>
                  <span style={{ fontSize: 9, color: T.textMid }}>{d.wr.toFixed(0)}% WR · {d.count}T</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

// ── Stocks ─────────────────────────────────────────────────────────────────────
function StocksTab({ trades, T }) {
  const S  = buildStyles(T);
  const sd = {};
  trades.forEach(t => { (sd[t.stock] = sd[t.stock] || []).push(t); });
  const rows = Object.entries(sd).map(([stock, ts]) => ({
    stock, count: ts.length,
    wr:   ts.filter(t => t.netPnL > 0).length / ts.length * 100,
    pnl:  ts.reduce((s, t) => s + t.netPnL, 0),
    avg:  ts.reduce((s, t) => s + t.netPnL, 0) / ts.length,
    hold: ts.reduce((s, t) => s + t.holdMins, 0) / ts.length,
  })).sort((a, b) => b.pnl - a.pnl);

  return (
    <>
      {rows.filter(r => r.pnl >= 0).length > 0 && <div style={{ fontSize: 11, color: T.textMid, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 20px 8px", fontWeight: 600 }}>BEST PERFORMING</div>}
      {rows.filter(r => r.pnl >= 0).map(r => <StockRow key={r.stock} r={r} T={T} S={S} />)}
      {rows.filter(r => r.pnl < 0).length > 0 && <div style={{ fontSize: 11, color: T.textMid, letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 20px 8px", fontWeight: 600 }}>WORST PERFORMING</div>}
      {[...rows.filter(r => r.pnl < 0)].reverse().map(r => <StockRow key={r.stock} r={r} T={T} S={S} />)}
    </>
  );
}

function StockRow({ r, T, S }) {
  return (
    <div style={{ ...S.card, borderLeft: `3px solid ${r.pnl >= 0 ? T.accent : T.red}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div><div style={{ fontSize: 14, fontWeight: 700 }}>{r.stock}</div><div style={{ fontSize: 11, color: T.textMid }}>{r.count} trades</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 700, color: r.pnl >= 0 ? T.accent : T.red }}>{fC(r.pnl)}</div><div style={{ fontSize: 10, color: T.textDim }}>{fC(r.avg)} avg</div></div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <span style={{ fontSize: 11, color: T.textMid }}>WR: <b style={{ color: r.wr >= 50 ? T.accent : T.red }}>{r.wr.toFixed(0)}%</b></span>
        <span style={{ fontSize: 11, color: T.textMid }}>Hold: <b>{Math.round(r.hold)}m</b></span>
      </div>
    </div>
  );
}

// ── Mistakes ───────────────────────────────────────────────────────────────────
function MistakesTab({ trades, T }) {
  const S  = buildStyles(T);
  const md = {};
  trades.forEach(t => (t.mistakes || []).forEach(m => {
    if (!md[m]) md[m] = { count: 0, losses: [] };
    md[m].count++;
    if (t.netPnL < 0) md[m].losses.push(t.netPnL);
  }));
  const rows = Object.entries(md).map(([name, d]) => ({
    name, count: d.count,
    loss: d.losses.reduce((s, v) => s + v, 0),
    avg:  d.losses.length ? d.losses.reduce((s, v) => s + v, 0) / d.losses.length : 0,
    lc:   d.losses.length,
  })).sort((a, b) => a.loss - b.loss);

  if (!rows.length) return (
    <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No mistakes tagged yet</div>
      <div style={{ fontSize: 12, color: T.textMid }}>Tag mistakes when adding trades to track patterns</div>
    </div>
  );
  return (
    <>
      <div style={{ ...S.card, background: T.redDim, border: `1px solid ${T.red}20` }}>
        <div style={{ ...S.lbl, color: T.red, marginBottom: 5 }}>PERFORMANCE LEAKS IDENTIFIED</div>
        <div style={{ fontSize: 12, color: T.textMid }}>{rows.reduce((s, r) => s + r.count, 0)} tagged mistakes across {trades.length} trades</div>
      </div>
      {rows.map(r => (
        <div key={r.name} style={{ ...S.card, borderLeft: `3px solid ${T.red}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{r.name}</div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 15, fontWeight: 700, color: T.red }}>{fC(r.loss)}</div><div style={{ fontSize: 9, color: T.textDim }}>total loss impact</div></div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: 11, color: T.textMid }}>Times: <b style={{ color: T.red }}>{r.count}</b></span>
            {r.lc > 0 && <span style={{ fontSize: 11, color: T.textMid }}>Avg loss: <b style={{ color: T.red }}>{fC(r.avg)}</b></span>}
          </div>
        </div>
      ))}
    </>
  );
}
