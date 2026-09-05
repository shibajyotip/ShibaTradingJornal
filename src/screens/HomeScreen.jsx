// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
import { computeStats, rollingPnL } from "../utils/calc.js";
import { fC, fP, todayStr, todayLabel } from "../utils/format.js";
import { buildStyles } from "../components/Styles.js";
import { EquityCurve, BarChart } from "../components/Charts.jsx";

export function HomeScreen({ trades, settings, T }) {
  const S          = buildStyles(T);
  const ts         = todayStr();
  const todayT     = trades.filter(t => t.date === ts);
  const todayPnL   = todayT.reduce((s, t) => s + t.netPnL, 0);
  const totalPnL   = trades.reduce((s, t) => s + t.netPnL, 0);
  const stats      = computeStats(trades);
  const todayS     = computeStats(todayT);
  const startCap   = settings.startCapital || 500000;

  const byDate = {};
  trades.forEach(t => { byDate[t.date] = (byDate[t.date] || 0) + t.netPnL; });
  const dailyBars = Object.keys(byDate).sort().map(d => ({ val: byDate[d] }));

  const weekPnL  = rollingPnL(trades, 7);
  const monthPnL = rollingPnL(trades, 30);
  const roll90   = rollingPnL(trades, 90);

  // Alerts
  const dailyLoss    = settings.dailyLossLimit || 0;
  const maxTrades    = settings.maxTradesPerDay || 0;
  const overLoss     = dailyLoss   > 0 && todayPnL   < -dailyLoss;
  const overTrades   = maxTrades   > 0 && todayT.length > maxTrades;

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: T.textMid, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>Trading Command Centre</div>
            <div style={{ fontSize: 12, color: T.textDim }}>{todayLabel()}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: T.accentDim, border: `1px solid ${T.accentGlow}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
        </div>
      </div>

      {/* Alerts */}
      {overLoss && (
        <div style={{ margin: "0 16px 10px", background: T.redDim, border: `1px solid ${T.red}40`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.red }}>Daily Loss Limit Breached</div>
            <div style={{ fontSize: 11, color: T.textMid }}>Loss today {fC(todayPnL)} exceeds limit of {fC(-dailyLoss)}. Consider stopping.</div>
          </div>
        </div>
      )}
      {overTrades && (
        <div style={{ margin: "0 16px 10px", background: T.goldDim, border: `1px solid ${T.gold}40`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>🔢</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>Max Trades Exceeded</div>
            <div style={{ fontSize: 11, color: T.textMid }}>{todayT.length} trades today vs limit of {maxTrades}. Trade carefully.</div>
          </div>
        </div>
      )}

      {/* Today hero */}
      <div style={S.gcrd}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={S.lbl}>TODAY'S P&L</div>
            <div style={{ fontSize: 38, fontWeight: 800, color: todayPnL >= 0 ? T.accent : T.red, letterSpacing: "-0.03em", lineHeight: 1 }}>{fC(todayPnL)}</div>
            <div style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>{todayT.length} trade{todayT.length !== 1 ? "s" : ""} today</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={S.lbl}>TOTAL</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: totalPnL >= 0 ? T.accent : T.red, letterSpacing: "-0.02em" }}>{fC(totalPnL)}</div>
            <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>all time</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {[
            { l: "TRADES", v: todayT.length,                                c: T.text },
            { l: "WIN RATE", v: todayS ? `${todayS.winRate.toFixed(0)}%` : "—", c: T.accent },
            { l: "CHARGES", v: todayS ? `₹${todayS.totalCharges.toFixed(0)}` : "—", c: T.red },
            { l: "W / L",   v: `${todayS?.wins || 0} / ${todayS?.losses || 0}`, c: T.textMid },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ background: T.card, borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 8.5, color: T.textDim, letterSpacing: "0.07em", marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{v || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Capital Status */}
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 12 }}>CAPITAL STATUS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { l: "Start Capital",   v: `₹${(startCap / 1000).toFixed(0)}K`,            c: T.textMid },
            { l: "Current Capital", v: `₹${((startCap + totalPnL) / 1000).toFixed(1)}K`, c: totalPnL >= 0 ? T.accent : T.red },
            { l: "Overall Return",  v: fP(totalPnL / startCap * 100),                   c: totalPnL >= 0 ? T.accent : T.red },
            { l: "Max Drawdown",    v: stats ? fC(stats.maxDrawdown) : "—",              c: T.red },
            { l: "This Week",       v: fC(weekPnL),                                     c: weekPnL >= 0 ? T.accent : T.red },
            { l: "This Month",      v: fC(monthPnL),                                    c: monthPnL >= 0 ? T.accent : T.red },
          ].map(({ l, v, c }) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: T.textDim, marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rolling P&L */}
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 12 }}>ROLLING P&L</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[["7 Days", weekPnL], ["30 Days", monthPnL], ["90 Days", roll90]].map(([l, v]) => (
            <div key={l} style={{ background: T.surface, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.textDim, marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: v >= 0 ? T.accent : T.red }}>{fC(v)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Equity Curve */}
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 10 }}>EQUITY CURVE</div>
        <EquityCurve trades={trades} T={T} />
      </div>

      {/* Daily bars */}
      {dailyBars.length > 1 && (
        <div style={S.card}>
          <div style={{ ...S.lbl, marginBottom: 10 }}>DAILY P&L BARS</div>
          <BarChart data={dailyBars} height={64} T={T} />
        </div>
      )}

      {/* Journal snapshot */}
      {stats && (
        <div style={S.card}>
          <div style={{ ...S.lbl, marginBottom: 12 }}>JOURNAL SNAPSHOT</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {[
              { l: "Total Trades",   v: stats.total,                      c: T.text },
              { l: "Win Rate",       v: `${stats.winRate.toFixed(1)}%`,   c: T.accent },
              { l: "Profit Factor",  v: stats.profitFactor.toFixed(2),    c: stats.profitFactor >= 1 ? T.accent : T.red },
              { l: "Expectancy",     v: fC(stats.expectancy),             c: stats.expectancy >= 0 ? T.accent : T.red },
              { l: "Best Trade",     v: fC(stats.best?.netPnL || 0),      c: T.accent },
              { l: "Worst Trade",    v: fC(stats.worst?.netPnL || 0),     c: T.red },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: T.surface, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: T.textDim, letterSpacing: "0.05em", marginBottom: 3, lineHeight: 1.3 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!trades.length && (
        <div style={{ margin: "40px 16px", textAlign: "center", padding: 40, background: T.card, borderRadius: 20, border: `1px dashed ${T.cardBorder}` }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No trades yet</div>
          <div style={{ fontSize: 13, color: T.textMid }}>Tap <b style={{ color: T.accent }}>+</b> to log your first trade,<br />or <b style={{ color: T.blue }}>📷</b> to import from screenshot</div>
        </div>
      )}
    </div>
  );
}
