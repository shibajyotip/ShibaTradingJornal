// ─── TRADE FORM (ADD + EDIT) ──────────────────────────────────────────────────
import { useState, useRef, useMemo } from "react";
import { calcTrade }   from "../utils/calc.js";
import { fC, todayStr } from "../utils/format.js";
import { buildStyles }  from "../components/Styles.js";

export function TradeForm({ onSave, onClose, editTrade, settings, T }) {
  const S      = buildStyles(T);
  const isEdit = !!editTrade;

  const blank = {
    stock: "", side: "BUY", date: todayStr(),
    entryTime: "09:30", exitTime: "10:00",
    qty: "", entryPrice: "", exitPrice: "",
    brokerage: String(settings.defaultBrokerage ?? 20),
    otherCharges: String(settings.defaultOtherCharges ?? 5),
    strategy: "", stopLoss: "", target: "",
    emotion: "", marketCondition: "",
    mistakes: [], notes: "", entryReason: "", exitReason: "",
    screenshot: null,
    checklistDone: false,
  };

  const [f, setF]       = useState(isEdit ? {
    ...editTrade,
    qty:          String(editTrade.qty),
    entryPrice:   String(editTrade.entryPrice),
    exitPrice:    String(editTrade.exitPrice),
    brokerage:    String(editTrade.brokerage   ?? settings.defaultBrokerage   ?? 20),
    otherCharges: String(editTrade.otherCharges ?? settings.defaultOtherCharges ?? 5),
    stopLoss:     editTrade.stopLoss != null ? String(editTrade.stopLoss) : "",
    target:       editTrade.target   != null ? String(editTrade.target)   : "",
    mistakes:     editTrade.mistakes || [],
    screenshot:   editTrade.screenshot || null,
    checklistDone: true,
  } : blank);

  const [step, setStep]   = useState(1);
  const [done, setDone]   = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [checkedItems, setCheckedItems]   = useState([]);
  const fileRef = useRef(null);

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const tog = (m)    => set("mistakes", f.mistakes.includes(m) ? f.mistakes.filter(x => x !== m) : [...f.mistakes, m]);

  const preview = useMemo(() => {
    const n = { ...f, qty: parseFloat(f.qty) || 0, entryPrice: parseFloat(f.entryPrice) || 0, exitPrice: parseFloat(f.exitPrice) || 0, brokerage: parseFloat(f.brokerage) || 0, otherCharges: parseFloat(f.otherCharges) || 0 };
    return (n.qty && n.entryPrice && n.exitPrice) ? calcTrade(n) : null;
  }, [f]);

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => set("screenshot", ev.target.result);
    r.readAsDataURL(file);
  };

  const checklist = settings.checklist || [];
  const allChecked = checklist.length === 0 || checkedItems.length === checklist.length;

  const save = () => {
    if (!f.stock || !f.qty || !f.entryPrice || !f.exitPrice) return;
    // Enforce pre-trade checklist on new trades
    if (!isEdit && checklist.length > 0 && !f.checklistDone) {
      setShowChecklist(true); return;
    }
    const trade = calcTrade({
      ...f,
      id:           isEdit ? editTrade.id : Date.now(),
      qty:          parseFloat(f.qty),
      entryPrice:   parseFloat(f.entryPrice),
      exitPrice:    parseFloat(f.exitPrice),
      brokerage:    parseFloat(f.brokerage)    || 0,
      otherCharges: parseFloat(f.otherCharges) || 0,
      stopLoss:     f.stopLoss ? parseFloat(f.stopLoss) : null,
      target:       f.target   ? parseFloat(f.target)   : null,
    });
    setDone(true);
    setTimeout(() => { onSave(trade); onClose(); }, 700);
  };

  if (done) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)", zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ width: 80, height: 80, borderRadius: 40, background: T.accentDim, border: `2px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 18 }}>✓</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.accent }}>{isEdit ? "Trade Updated!" : "Trade Saved!"}</div>
      {preview && <div style={{ fontSize: 13, color: T.textMid, marginTop: 8 }}>{fC(preview.netPnL)} net P&L</div>}
    </div>
  );

  const canSave = f.stock && f.qty && f.entryPrice && f.exitPrice;
  const iW = { ...S.inp, marginBottom: 10 };

  return (
    <div style={{ position: "fixed", inset: 0, background: T.surface, zIndex: 200, overflowY: "auto", maxWidth: 430, margin: "0 auto" }}>
      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, background: T.surface, borderBottom: `1px solid ${T.cardBorder}`, padding: "46px 16px 12px", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMid, fontSize: 22, cursor: "pointer" }}>✕</button>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.textMid, letterSpacing: "0.1em" }}>{isEdit ? "EDIT TRADE" : "ADD TRADE"}</span>
          <button onClick={save} disabled={!canSave}
            style={{ ...S.btn("primary", T), padding: "8px 16px", fontSize: 12, opacity: canSave ? 1 : 0.4 }}>
            {isEdit ? "Update" : "Save"}{preview ? ` ${fC(preview.netPnL)}` : ""}
          </button>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["1 Required", 1], ["2 Optional", 2], ["3 Notes", 3]].map(([l, s]) => (
            <button key={s} onClick={() => setStep(s)}
              style={{ flex: 1, padding: "7px 4px", borderRadius: 10, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "none", background: step === s ? T.accentDim : "transparent", color: step === s ? T.accent : T.textDim, letterSpacing: "0.05em" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px 100px" }}>

        {/* ── STEP 1 ── */}
        {step === 1 && <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <div>
              <div style={S.lbl}>Stock Symbol</div>
              <input placeholder="e.g. TATASTEEL" style={iW} value={f.stock} onChange={e => set("stock", e.target.value.toUpperCase())} autoCapitalize="characters" />
            </div>
            <div>
              <div style={S.lbl}>Side</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                {["BUY", "SELL"].map(s => (
                  <button key={s} onClick={() => set("side", s)}
                    style={{ padding: "12px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12, cursor: "pointer", background: f.side === s ? (s === "BUY" ? T.accentDim : T.goldDim) : "transparent", color: f.side === s ? (s === "BUY" ? T.accent : T.gold) : T.textDim, border: `1px solid ${f.side === s ? (s === "BUY" ? T.accent : T.gold) : T.cardBorder}` }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><div style={S.lbl}>Date</div><input type="date" style={iW} value={f.date} onChange={e => set("date", e.target.value)} /></div>
            <div><div style={S.lbl}>Quantity</div><input type="number" inputMode="numeric" placeholder="100" style={iW} value={f.qty} onChange={e => set("qty", e.target.value)} /></div>
            <div><div style={S.lbl}>Entry Price ₹</div><input type="number" inputMode="decimal" placeholder="168.00" style={iW} value={f.entryPrice} onChange={e => set("entryPrice", e.target.value)} /></div>
            <div><div style={S.lbl}>Entry Time</div><input type="time" style={iW} value={f.entryTime} onChange={e => set("entryTime", e.target.value)} /></div>
            <div><div style={S.lbl}>Exit Price ₹</div><input type="number" inputMode="decimal" placeholder="172.50" style={iW} value={f.exitPrice} onChange={e => set("exitPrice", e.target.value)} /></div>
            <div><div style={S.lbl}>Exit Time</div><input type="time" style={iW} value={f.exitTime} onChange={e => set("exitTime", e.target.value)} /></div>
            <div><div style={S.lbl}>Brokerage ₹</div><input type="number" inputMode="decimal" style={iW} value={f.brokerage} onChange={e => set("brokerage", e.target.value)} /></div>
            <div><div style={S.lbl}>Other Charges ₹</div><input type="number" inputMode="decimal" style={iW} value={f.otherCharges} onChange={e => set("otherCharges", e.target.value)} /></div>
          </div>
          {preview && (
            <div style={{ background: T.card, border: `1px solid ${preview.netPnL >= 0 ? T.accent : T.red}30`, borderRadius: 14, padding: 14, marginTop: 4 }}>
              <div style={{ ...S.lbl, marginBottom: 10 }}>LIVE P&L PREVIEW</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[
                  ["Gross",   fC(preview.grossPnL),    preview.grossPnL >= 0 ? T.accent : T.red],
                  ["Charges", `-₹${preview.totalCharges.toFixed(0)}`, T.red],
                  ["Net P&L", fC(preview.netPnL),      preview.netPnL >= 0 ? T.accent : T.red],
                  ["Return",  `${preview.netReturn.toFixed(2)}%`, preview.netReturn >= 0 ? T.accent : T.red],
                  ["Hold",    preview.holdStr,          T.text],
                  ["Capital", `₹${(preview.entryVal / 1000).toFixed(0)}K`, T.textMid],
                ].map(([k, v, vc]) => (
                  <div key={k} style={{ background: T.surface, borderRadius: 10, padding: "9px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: T.textDim, marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: vc || T.text }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>}

        {/* ── STEP 2 ── */}
        {step === 2 && <>
          <div style={S.lbl}>Strategy</div>
          <select style={{ ...S.sel, marginBottom: 10 }} value={f.strategy} onChange={e => set("strategy", e.target.value)}>
            <option value="">— Select Strategy —</option>
            {(settings.strategies || []).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><div style={S.lbl}>Stop Loss ₹</div><input type="number" inputMode="decimal" style={iW} value={f.stopLoss} onChange={e => set("stopLoss", e.target.value)} placeholder="165" /></div>
            <div><div style={S.lbl}>Target ₹</div><input type="number" inputMode="decimal" style={iW} value={f.target} onChange={e => set("target", e.target.value)} placeholder="175" /></div>
            <div>
              <div style={S.lbl}>Emotion</div>
              <select style={{ ...S.sel, marginBottom: 10 }} value={f.emotion} onChange={e => set("emotion", e.target.value)}>
                <option value="">—</option>
                {(settings.emotions || []).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <div style={S.lbl}>Market Condition</div>
              <select style={{ ...S.sel, marginBottom: 10 }} value={f.marketCondition} onChange={e => set("marketCondition", e.target.value)}>
                <option value="">—</option>
                {["Trending Up","Trending Down","Ranging","Volatile","Gap Up","Gap Down","News Driven","Low Volume"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* R:R Preview */}
          {f.stopLoss && f.target && f.entryPrice && (() => {
            const risk   = Math.abs(parseFloat(f.entryPrice) - parseFloat(f.stopLoss));
            const reward = Math.abs(parseFloat(f.target) - parseFloat(f.entryPrice));
            const rr     = risk > 0 ? (reward / risk).toFixed(2) : null;
            return rr && (
              <div style={{ background: parseFloat(rr) >= 1.5 ? T.accentDim : T.redDim, border: `1px solid ${parseFloat(rr) >= 1.5 ? T.accent : T.red}30`, borderRadius: 12, padding: "10px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: T.textMid }}>Risk:Reward</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: parseFloat(rr) >= 1.5 ? T.accent : T.red }}>1 : {rr}</span>
              </div>
            );
          })()}

          {/* Screenshot */}
          <div style={{ ...S.card, margin: "0 0 10px", cursor: "pointer", textAlign: "center" }} onClick={() => fileRef.current?.click()}>
            {f.screenshot ? (
              <>
                <div style={{ ...S.lbl, color: T.blue, marginBottom: 6 }}>📎 SCREENSHOT ATTACHED</div>
                <img src={f.screenshot} alt="preview" style={{ width: "100%", borderRadius: 10, objectFit: "contain", maxHeight: 150, marginBottom: 8 }} />
                <button onClick={e => { e.stopPropagation(); set("screenshot", null); }} style={{ ...S.btn("danger", T), padding: "6px 14px", fontSize: 11, width: "100%" }}>Remove</button>
              </>
            ) : (
              <div style={{ padding: "16px 0" }}>
                <div style={{ fontSize: 30, marginBottom: 6 }}>📷</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.blue }}>Tap to attach screenshot</div>
                <div style={{ fontSize: 11, color: T.textDim, marginTop: 3 }}>Chart snapshot or broker confirmation</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

          {/* Mistakes */}
          <div style={S.lbl}>Mistakes (tap to tag)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {(settings.mistakes || []).map(m => (
              <button key={m} onClick={() => tog(m)}
                style={{ padding: "5px 11px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", background: f.mistakes.includes(m) ? T.redDim : "transparent", color: f.mistakes.includes(m) ? T.red : T.textDim, border: `1px solid ${f.mistakes.includes(m) ? T.red : T.cardBorder}` }}>
                {m}
              </button>
            ))}
          </div>
        </>}

        {/* ── STEP 3 ── */}
        {step === 3 && <>
          <div style={S.lbl}>Entry Reason</div>
          <input style={iW} placeholder="Why did you enter?" value={f.entryReason} onChange={e => set("entryReason", e.target.value)} />
          <div style={S.lbl}>Exit Reason</div>
          <input style={iW} placeholder="Why did you exit?" value={f.exitReason} onChange={e => set("exitReason", e.target.value)} />
          <div style={S.lbl}>Notes / Observations</div>
          <textarea style={{ ...S.inp, height: 110, resize: "none", marginBottom: 10, lineHeight: 1.6 }} placeholder="What did you learn? What would you do differently?" value={f.notes} onChange={e => set("notes", e.target.value)} />
        </>}
      </div>

      {/* Bottom save bar */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "12px 16px 28px", background: `linear-gradient(to top,${T.surface} 80%,transparent)`, zIndex: 10 }}>
        <button onClick={save} disabled={!canSave}
          style={{ ...S.btn("primary", T), width: "100%", opacity: canSave ? 1 : 0.35, boxShadow: `0 0 24px ${T.accentGlow}` }}>
          {isEdit ? "Update Trade" : "Save Trade"}{preview ? ` · ${fC(preview.netPnL)}` : ""}
        </button>
      </div>

      {/* Pre-Trade Checklist modal */}
      {showChecklist && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
          <div style={{ background: T.surface, borderRadius: "20px 20px 0 0", width: "100%", padding: "24px 20px 36px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Pre-Trade Checklist</div>
            <div style={{ fontSize: 12, color: T.textMid, marginBottom: 20 }}>Confirm all criteria before saving</div>
            {checklist.map((item, i) => (
              <div key={i} onClick={() => setCheckedItems(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.cardBorder}`, cursor: "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checkedItems.includes(i) ? T.accent : T.cardBorder}`, background: checkedItems.includes(i) ? T.accentDim : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {checkedItems.includes(i) && <span style={{ color: T.accent, fontSize: 13, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: checkedItems.includes(i) ? T.text : T.textMid }}>{item}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setShowChecklist(false); setCheckedItems([]); }}
                style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMid, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={() => { if (!allChecked) return; set("checklistDone", true); setShowChecklist(false); setTimeout(save, 50); }}
                disabled={!allChecked}
                style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: allChecked ? `linear-gradient(135deg,${T.accent},${T.accent}BB)` : T.card, color: allChecked ? "#000" : T.textDim, fontSize: 14, fontWeight: 700, cursor: allChecked ? "pointer" : "default", fontFamily: "inherit" }}>
                {allChecked ? "Confirmed — Save Trade" : `${checkedItems.length}/${checklist.length} checked`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
