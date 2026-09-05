// ─── JOURNAL SCREEN ───────────────────────────────────────────────────────────
import { useState } from "react";
import { buildStyles }              from "../components/Styles.js";
import { TradeCard, TradeDetail }   from "../components/TradeCard.jsx";
import { SwipeToDelete }            from "../components/UI.jsx";
import { fC, fDateShort, todayStr } from "../utils/format.js";

export function JournalScreen({ trades, onDelete, onEdit, T }) {
  const S = buildStyles(T);

  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("ALL");
  const [sort,      setSort]      = useState("DATE");
  const [sel,       setSel]       = useState(null);
  const [dateFrom,  setDateFrom]  = useState("");
  const [dateTo,    setDateTo]    = useState("");
  const [showRange, setShowRange] = useState(false);

  const ts = todayStr();

  // Quick date shortcuts
  const setQuickRange = (preset) => {
    const now = new Date();
    const fmt  = (d) => d.toISOString().split("T")[0];
    if (preset === "today")   { setDateFrom(ts);         setDateTo(ts);         }
    if (preset === "week")    { const d = new Date(now); d.setDate(d.getDate() - 7);  setDateFrom(fmt(d)); setDateTo(ts); }
    if (preset === "month")   { const d = new Date(now); d.setDate(d.getDate() - 30); setDateFrom(fmt(d)); setDateTo(ts); }
    if (preset === "clear")   { setDateFrom("");         setDateTo("");          }
    setShowRange(false);
  };

  const list = trades
    .filter(t => {
      const text = [t.stock, t.strategy, t.notes, t.entryReason, t.exitReason].join(" ").toLowerCase();
      if (search && !text.includes(search.toLowerCase())) return false;
      if (filter === "WIN"  && t.netPnL <= 0)  return false;
      if (filter === "LOSS" && t.netPnL >  0)  return false;
      if (dateFrom && t.date < dateFrom)        return false;
      if (dateTo   && t.date > dateTo)          return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "DATE")  return b.date.localeCompare(a.date) || b.entryTime.localeCompare(a.entryTime);
      if (sort === "PNL")   return b.netPnL - a.netPnL;
      if (sort === "STOCK") return a.stock.localeCompare(b.stock);
      return 0;
    });

  const groups  = {};
  if (sort === "DATE") list.forEach(t => { (groups[t.date] = groups[t.date] || []).push(t); });
  const netAll  = list.reduce((s, t) => s + t.netPnL, 0);
  const hasRange = dateFrom || dateTo;

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Journal</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: netAll >= 0 ? T.accent : T.red }}>
            {list.length} trades · {fC(netAll)}
          </div>
        </div>

        <input placeholder="Search stock, strategy, notes…" style={{ ...S.inp, marginBottom: 10 }} value={search} onChange={e => setSearch(e.target.value)} />

        <div style={{ display: "flex", gap: 6, justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["ALL", "WIN", "LOSS"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "5px 13px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", background: filter === f ? (f === "LOSS" ? T.redDim : T.accentDim) : "transparent", color: filter === f ? (f === "LOSS" ? T.red : T.accent) : T.textDim, border: `1px solid ${filter === f ? (f === "LOSS" ? T.red : T.accent) : T.cardBorder}` }}>
                {f}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {/* Date range */}
            <button onClick={() => setShowRange(v => !v)}
              style={{ padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", background: hasRange ? T.accentDim : "transparent", color: hasRange ? T.accent : T.textDim, border: `1px solid ${hasRange ? T.accent : T.cardBorder}` }}>
              {hasRange ? "📅 Range" : "📅"}
            </button>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ ...S.sel, width: "auto", padding: "5px 10px", fontSize: 10, height: 32 }}>
              <option value="DATE">Date ↓</option>
              <option value="PNL">P&L ↓</option>
              <option value="STOCK">Stock A–Z</option>
            </select>
          </div>
        </div>

        {/* Date range panel */}
        {showRange && (
          <div style={{ background: T.card, borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ ...S.lbl, marginBottom: 4 }}>From</div>
                <input type="date" style={{ ...S.inp, fontSize: 13, padding: "8px 10px" }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div>
                <div style={{ ...S.lbl, marginBottom: 4 }}>To</div>
                <input type="date" style={{ ...S.inp, fontSize: 13, padding: "8px 10px" }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["Today", "today"], ["Last 7d", "week"], ["Last 30d", "month"], ["Clear", "clear"]].map(([l, p]) => (
                <button key={p} onClick={() => setQuickRange(p)}
                  style={{ padding: "5px 12px", borderRadius: 16, fontSize: 11, cursor: "pointer", background: "transparent", color: p === "clear" ? T.red : T.accent, border: `1px solid ${p === "clear" ? T.red : T.accent}40`, fontFamily: "inherit" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.textDim }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No trades found</div>
          <div style={{ fontSize: 12 }}>Try different search or filter</div>
        </div>
      ) : sort === "DATE"
        ? Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])).map(([date, ts]) => (
          <div key={date}>
            <div style={{ padding: "8px 20px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: T.textMid, fontWeight: 700, letterSpacing: "0.07em" }}>{fDateShort(date)}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: ts.reduce((s, t) => s + t.netPnL, 0) >= 0 ? T.accent : T.red }}>
                {fC(ts.reduce((s, t) => s + t.netPnL, 0))}
              </span>
            </div>
            {ts.map(t => (
              <SwipeToDelete key={t.id} onDelete={() => onDelete(t.id)} T={T}>
                <TradeCard t={t} onTap={() => setSel(t)} T={T} />
              </SwipeToDelete>
            ))}
          </div>
        ))
        : list.map(t => (
          <SwipeToDelete key={t.id} onDelete={() => onDelete(t.id)} T={T}>
            <TradeCard t={t} onTap={() => setSel(t)} T={T} />
          </SwipeToDelete>
        ))
      }

      {sel && (
        <TradeDetail
          t={sel}
          onClose={() => setSel(null)}
          onDelete={id => { onDelete(id); setSel(null); }}
          onEdit={t => { setSel(null); onEdit(t); }}
          T={T}
        />
      )}
    </div>
  );
}
