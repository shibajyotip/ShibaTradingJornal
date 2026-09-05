// ─── TRADE CALCULATIONS ────────────────────────────────────────────────────────

/** Convert "HH:MM" to total minutes */
const toMin = (s) => {
  const [h, m] = (s || "09:00").split(":").map(Number);
  return h * 60 + m;
};

/** Format minutes into "Xh Ym" or "Zm" string */
export const minsToStr = (mins) => {
  const abs = Math.abs(mins);
  return abs >= 60
    ? `${Math.floor(abs / 60)}h ${abs % 60}m`
    : `${abs}m`;
};

/**
 * Derive all computed fields from a raw trade object.
 * Fixes: negative hold time when exitTime < entryTime (e.g. cross-session edge).
 */
export function calcTrade(t) {
  const sell      = t.side === "SELL";
  const entryVal  = (t.qty || 0) * (t.entryPrice || 0);
  const exitVal   = (t.qty || 0) * (t.exitPrice  || 0);
  const grossPnL  = sell
    ? (t.entryPrice - t.exitPrice) * t.qty
    : (t.exitPrice  - t.entryPrice) * t.qty;
  const totalCharges = (parseFloat(t.brokerage) || 0) + (parseFloat(t.otherCharges) || 0);
  const netPnL       = grossPnL - totalCharges;
  const grossReturn  = entryVal > 0 ? (grossPnL / entryVal) * 100 : 0;
  const netReturn    = entryVal > 0 ? (netPnL   / entryVal) * 100 : 0;

  // Hold time — always positive, handles overnight/cross-day edge gracefully
  const rawMins  = toMin(t.exitTime) - toMin(t.entryTime);
  const holdMins = rawMins >= 0 ? rawMins : rawMins + 24 * 60; // next-day exit
  const holdStr  = minsToStr(holdMins);

  // Risk : Reward ratio
  let rr = null;
  if (t.stopLoss != null && t.target != null && t.entryPrice) {
    const risk   = Math.abs(t.entryPrice - t.stopLoss);
    const reward = Math.abs(t.target     - t.entryPrice);
    rr = risk > 0 ? (reward / risk).toFixed(2) : null;
  }

  return { ...t, entryVal, exitVal, grossPnL, totalCharges, netPnL, grossReturn, netReturn, holdMins, holdStr, rr };
}

/**
 * Compute aggregate statistics for an array of calculated trades.
 * Returns null if trades array is empty.
 */
export function computeStats(trades) {
  if (!trades.length) return null;

  const wins   = trades.filter(t => t.netPnL > 0);
  const losses = trades.filter(t => t.netPnL <= 0);

  const totalNetPnL   = trades.reduce((s, t) => s + t.netPnL,   0);
  const totalGrossPnL = trades.reduce((s, t) => s + t.grossPnL, 0);
  const totalCharges  = trades.reduce((s, t) => s + t.totalCharges, 0);

  const winRate  = (wins.length / trades.length) * 100;
  const avgWin   = wins.length   ? wins.reduce((s, t)  => s + t.netPnL, 0)  / wins.length   : 0;
  const avgLoss  = losses.length ? Math.abs(losses.reduce((s, t) => s + t.netPnL, 0)) / losses.length : 0;

  const gw = wins.reduce((s, t) => s + t.netPnL, 0);
  const gl = Math.abs(losses.reduce((s, t) => s + t.netPnL, 0));
  const profitFactor = gl > 0 ? gw / gl : gw > 0 ? 999 : 0;
  const expectancy   = (winRate / 100) * avgWin - ((1 - winRate / 100) * avgLoss);

  const best  = trades.reduce((b, t) => t.netPnL > (b?.netPnL ?? -Infinity) ? t : b, null);
  const worst = trades.reduce((w, t) => t.netPnL < (w?.netPnL ??  Infinity) ? t : w, null);

  // Win / loss streaks
  let maxW = 0, maxL = 0, cw = 0, cl = 0;
  [...trades]
    .sort((a, b) => a.date.localeCompare(b.date) || a.entryTime.localeCompare(b.entryTime))
    .forEach(t => {
      if (t.netPnL > 0) { cw++; cl = 0; maxW = Math.max(maxW, cw); }
      else               { cl++; cw = 0; maxL = Math.max(maxL, cl); }
    });

  // Max drawdown
  let peak = 0, dd = 0, run = 0;
  trades.forEach(t => {
    run += t.netPnL;
    if (run > peak) peak = run;
    dd = Math.min(dd, run - peak);
  });

  // Drawdown curve points (for chart)
  const ddCurve = [];
  run = 0; peak = 0;
  [...trades]
    .sort((a, b) => a.date.localeCompare(b.date) || a.entryTime.localeCompare(b.entryTime))
    .forEach(t => {
      run += t.netPnL;
      if (run > peak) peak = run;
      ddCurve.push(run - peak);
    });

  const avgHold    = trades.reduce((s, t) => s + t.holdMins, 0) / trades.length;
  const avgHoldStr = minsToStr(Math.round(avgHold));

  // Session split: morning 09:15–12:00, afternoon 12:00–15:30
  const morning   = trades.filter(t => toMin(t.entryTime) < 720);
  const afternoon = trades.filter(t => toMin(t.entryTime) >= 720);

  return {
    totalNetPnL, totalGrossPnL, totalCharges,
    winRate, avgWin, avgLoss,
    profitFactor, expectancy,
    best, worst,
    maxWinStreak: maxW, maxLossStreak: maxL,
    maxDrawdown: dd, ddCurve,
    avgHoldStr,
    wins:   wins.length,
    losses: losses.length,
    total:  trades.length,
    morning:   { count: morning.length,   pnl: morning.reduce((s,t)=>s+t.netPnL,0),   wr: morning.length   ? morning.filter(t=>t.netPnL>0).length/morning.length*100   : 0 },
    afternoon: { count: afternoon.length, pnl: afternoon.reduce((s,t)=>s+t.netPnL,0), wr: afternoon.length ? afternoon.filter(t=>t.netPnL>0).length/afternoon.length*100 : 0 },
  };
}

/**
 * Compute rolling P&L for last N days from today.
 */
export function rollingPnL(trades, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutStr = cutoff.toISOString().split("T")[0];
  return trades
    .filter(t => t.date >= cutStr)
    .reduce((s, t) => s + t.netPnL, 0);
}
