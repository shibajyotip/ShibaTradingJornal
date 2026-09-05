// ─── TRADE CARD & DETAIL ──────────────────────────────────────────────────────
import { buildStyles } from "./Styles.js";
import { Row }         from "./UI.jsx";
import { fC, fP }      from "../utils/format.js";

// ── Compact card for list views ────────────────────────────────────────────────
export function TradeCard({ t, onTap, T }) {
  const S = buildStyles(T);
  const c = t.netPnL > 0 ? T.accent : T.red;
  return (
    <div onClick={onTap}
      style={{ margin: "0 16px 10px", background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 14, cursor: "pointer", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: c, borderRadius: "16px 0 0 16px" }} />
      <div style={{ paddingLeft: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{t.stock}</span>
              <span style={{ ...S.chip(t.side === "BUY" ? T.accent : T.gold, t.side === "BUY" ? T.accentDim : T.goldDim), fontSize: 9, padding: "2px 7px" }}>{t.side}</span>
              {t.screenshot && <span style={{ fontSize: 9, color: T.blue }}>📎</span>}
              {t._imported  && <span style={{ fontSize: 9, color: T.purple }}>↓ CSV</span>}
            </div>
            <div style={{ fontSize: 11, color: T.textMid }}>₹{t.entryPrice} → ₹{t.exitPrice} · {t.qty} qty</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{fC(t.netPnL)}</div>
            <div style={{ fontSize: 10, color: c, opacity: 0.8 }}>{fP(t.netReturn)}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: T.textMid }}>{t.entryTime} → {t.exitTime} · {t.holdStr}</span>
          {t.strategy && <span style={{ fontSize: 10, color: T.textDim, background: T.surface, padding: "2px 8px", borderRadius: 10 }}>{t.strategy}</span>}
        </div>
        {t.mistakes?.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
            {t.mistakes.map(m => <span key={m} style={{ ...S.chip(T.red, T.redDim), fontSize: 9, padding: "2px 6px" }}>{m}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Full-screen trade detail ───────────────────────────────────────────────────
export function TradeDetail({ t, onClose, onDelete, onEdit, T }) {
  const S = buildStyles(T);
  const c = t.netPnL > 0 ? T.accent : T.red;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 200, overflowY: "auto", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ background: T.surface, minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ padding: "50px 20px 18px", background: `linear-gradient(180deg,${c}15,transparent)`, borderBottom: `1px solid ${T.cardBorder}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMid, fontSize: 22, cursor: "pointer", padding: 4 }}>←</button>
            <span style={{ fontSize: 11, color: T.textMid, letterSpacing: "0.1em" }}>TRADE DETAIL</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onEdit(t)} style={{ background: T.blueDim, border: `1px solid ${T.blue}40`, borderRadius: 9, color: T.blue, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "5px 12px" }}>✏ Edit</button>
              <button onClick={() => { if (window.confirm("Delete this trade? Cannot undo.")) onDelete(t.id); }}
                style={{ background: T.redDim, border: `1px solid ${T.red}40`, borderRadius: 9, color: T.red, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "5px 12px" }}>🗑 Del</button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 700 }}>{t.stock}</span>
                <span style={{ ...S.chip(t.side === "BUY" ? T.accent : T.gold, t.side === "BUY" ? T.accentDim : T.goldDim) }}>{t.side}</span>
              </div>
              <div style={{ fontSize: 12, color: T.textMid }}>{t.date} · {t.holdStr}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: c, letterSpacing: "-0.03em" }}>{fC(t.netPnL)}</div>
              <div style={{ fontSize: 13, color: c }}>{fP(t.netReturn)}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 16px 40px" }}>
          {/* P&L Breakdown */}
          <div style={{ ...S.gcrd, margin: "0 0 12px" }}>
            <div style={{ ...S.lbl, marginBottom: 10 }}>P&L BREAKDOWN</div>
            {[
              ["Invested",      `₹${(t.entryVal || 0).toFixed(2)}`,   T.text],
              ["Gross P&L",     fC(t.grossPnL),                        t.grossPnL >= 0 ? T.accent : T.red],
              ["Brokerage",     `-₹${(t.brokerage || 0).toFixed(2)}`,  T.red],
              ["Other Charges", `-₹${(t.otherCharges || 0).toFixed(2)}`, T.red],
              ["Net P&L",       fC(t.netPnL),                          c],
            ].map(([k, v, vc], i, a) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: i < a.length - 1 ? 8 : 0, borderBottom: i < a.length - 1 ? `1px solid ${T.cardBorder}` : "none", marginBottom: i < a.length - 1 ? 8 : 0 }}>
                <span style={{ fontSize: 13, color: T.textMid }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: vc }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Entry / Exit */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {[{ l: "ENTRY", p: t.entryPrice, tm: t.entryTime, vc: T.blue }, { l: "EXIT", p: t.exitPrice, tm: t.exitTime, vc: c }].map(({ l, p, tm, vc }) => (
              <div key={l} style={{ ...S.card, margin: 0, textAlign: "center" }}>
                <div style={{ ...S.lbl, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: vc }}>₹{p}</div>
                <div style={{ fontSize: 11, color: T.textMid }}>{tm}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div style={{ ...S.card, margin: "0 0 12px" }}>
            <div style={{ ...S.lbl, marginBottom: 10 }}>DETAILS</div>
            {[
              ["Quantity",    t.qty],
              ["R:R Ratio",   t.rr ? `1:${t.rr}` : "—"],
              ["Stop Loss",   t.stopLoss ? `₹${t.stopLoss}` : "—"],
              ["Target",      t.target   ? `₹${t.target}`   : "—"],
              ["Strategy",    t.strategy || "—"],
              ["Emotion",     t.emotion  || "—"],
              ["Market",      t.marketCondition || "—"],
              ["Hold Time",   t.holdStr],
            ].map(([k, v], i, a) => (
              <Row key={k} label={k} val={v} last={i === a.length - 1} T={T} />
            ))}
          </div>

          {/* Screenshot */}
          {t.screenshot && (
            <div style={{ ...S.card, margin: "0 0 12px" }}>
              <div style={{ ...S.lbl, marginBottom: 8, color: T.blue }}>📎 SCREENSHOT</div>
              <img src={t.screenshot} alt="trade" style={{ width: "100%", borderRadius: 10, objectFit: "contain", maxHeight: 220 }} />
            </div>
          )}

          {/* Text fields */}
          {[["ENTRY REASON", t.entryReason], ["EXIT REASON", t.exitReason], ["NOTES", t.notes]].map(([l, v]) =>
            v ? (
              <div key={l} style={{ ...S.card, margin: "0 0 10px" }}>
                <div style={{ ...S.lbl, marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{v}</div>
              </div>
            ) : null
          )}

          {/* Mistakes */}
          {t.mistakes?.length > 0 && (
            <div style={{ ...S.card, margin: "0 0 10px" }}>
              <div style={{ ...S.lbl, color: T.red, marginBottom: 10 }}>MISTAKES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {t.mistakes.map(m => <span key={m} style={{ ...S.chip(T.red, T.redDim) }}>{m}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
