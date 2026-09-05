// ─── SETTINGS SCREEN ─────────────────────────────────────────────────────────
import { useState, useRef } from "react";
import { buildStyles }   from "../components/Styles.js";
import { ConfirmModal }  from "../components/UI.jsx";
import { PinSetup }      from "./PinLock.jsx";
import { ACCENT_PRESETS } from "../constants/theme.js";
import { hashPin, loadPin, savePin } from "../utils/storage.js";
import { exportJSON, exportCSV, parseJSONBackup, parseGrowwCSV } from "../utils/csvImport.js";
import { calcTrade }     from "../utils/calc.js";

export function SettingsScreen({ settings, setSettings, trades, onImport, onClearAll, T }) {
  const S = buildStyles(T);

  const [section, setSection]   = useState("GENERAL");
  const [confirm, setConfirm]   = useState(null);   // { title, message, action }
  const [toast,   setToast]     = useState(null);
  const [pinFlow, setPinFlow]   = useState(false);
  const [editList, setEditList] = useState(null);   // { key, label, items[] }
  const [importErr, setImportErr] = useState(null);

  const jsonRef = useRef(null);
  const csvRef  = useRef(null);
  const growwRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const set = (k, v) => setSettings(prev => ({ ...prev, [k]: v }));

  const sections = ["GENERAL", "LIMITS", "BROKER", "LISTS", "DATA", "SECURITY", "APPEARANCE"];

  // ── PIN management ──────────────────────────────────────────────────────────
  const currentPin   = loadPin();
  const handlePinSave = async (pin) => {
    const hashed = await hashPin(pin);
    savePin(hashed);
    setPinFlow(false);
    showToast("✓ PIN set");
  };
  const removePin = () => {
    setConfirm({
      title: "Remove PIN Lock?",
      message: "Your journal will open without a PIN. You can set a new one any time.",
      action: () => { savePin(null); showToast("PIN removed"); },
    });
  };

  // ── List editor ─────────────────────────────────────────────────────────────
  const openList = (key, label) => setEditList({ key, label, items: [...(settings[key] || [])] });
  const saveList = () => { set(editList.key, editList.items); setEditList(null); showToast("✓ List saved"); };
  const addItem  = (val) => { if (!val.trim() || editList.items.includes(val.trim())) return; setEditList(e => ({ ...e, items: [...e.items, val.trim()] })); };
  const remItem  = (i)   => setEditList(e => ({ ...e, items: e.items.filter((_, idx) => idx !== i) }));

  // ── Export ──────────────────────────────────────────────────────────────────
  const doExportJSON = () => { exportJSON(trades, settings); showToast("✓ JSON backup exported"); };
  const doExportCSV  = () => { exportCSV(trades);            showToast("✓ CSV exported"); };

  // ── JSON restore ────────────────────────────────────────────────────────────
  const handleJSONImport = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const { trades: t, settings: s, error } = parseJSONBackup(ev.target.result);
      if (error) { setImportErr(error); return; }
      setConfirm({
        title:   "Restore Backup?",
        message: `This will replace all ${trades.length} existing trades with ${t.length} trades from the backup. This cannot be undone.`,
        action:  () => {
          onImport(t.map(calcTrade), true);
          if (s) setSettings(s);
          showToast(`✓ Restored ${t.length} trades`);
        },
      });
    };
    r.readAsText(file);
    e.target.value = "";
  };

  // ── Groww CSV import ────────────────────────────────────────────────────────
  const handleGrowwCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const { trades: t, errors } = parseGrowwCSV(ev.target.result);
      if (!t.length) { setImportErr(`No trades found. Errors: ${errors.join("; ")}`); return; }
      setConfirm({
        title:   "Import Groww CSV?",
        message: `Found ${t.length} trades${errors.length ? ` (${errors.length} rows skipped)` : ""}. These will be added to your existing journal. Entry/exit times will default to 09:15 / 15:30 — edit trades to update.`,
        action:  () => { onImport(t, false); showToast(`✓ Imported ${t.length} trades`); },
      });
    };
    r.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={S.page}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 58, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: T.accent, color: "#000", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 22, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <div style={S.hdr}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Settings</div>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 5, overflowX: "auto", padding: "0 16px 12px", paddingBottom: 10 }}>
        {sections.map(sec => (
          <button key={sec} onClick={() => setSection(sec)}
            style={{ padding: "6px 12px", borderRadius: 20, fontSize: 9.5, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", whiteSpace: "nowrap", border: "none", background: section === sec ? T.accentDim : T.card, color: section === sec ? T.accent : T.textDim, fontFamily: "inherit" }}>
            {sec}
          </button>
        ))}
      </div>

      {/* ── GENERAL ── */}
      {section === "GENERAL" && (
        <div style={S.card}>
          <div style={{ ...S.lbl, marginBottom: 14 }}>GENERAL</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: T.textMid, marginBottom: 6 }}>Starting Capital (₹)</div>
            <input type="number" inputMode="numeric" style={{ ...S.inp }}
              value={settings.startCapital}
              onChange={e => set("startCapital", parseFloat(e.target.value) || 500000)} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: T.textMid, marginBottom: 6 }}>Tax Year Start</div>
            <select style={S.sel} value={settings.taxYearStart} onChange={e => set("taxYearStart", e.target.value)}>
              <option value="04-01">April 1 (Indian FY)</option>
              <option value="01-01">January 1 (Calendar year)</option>
            </select>
          </div>
        </div>
      )}

      {/* ── LIMITS ── */}
      {section === "LIMITS" && (
        <div style={S.card}>
          <div style={{ ...S.lbl, marginBottom: 14 }}>DAILY LIMITS & ALERTS</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: T.textMid, marginBottom: 4 }}>Daily Loss Limit (₹)</div>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 6 }}>Alert shown on Home when day loss exceeds this. Set 0 to disable.</div>
            <input type="number" inputMode="numeric" style={S.inp} value={settings.dailyLossLimit} onChange={e => set("dailyLossLimit", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: T.textMid, marginBottom: 4 }}>Max Trades Per Day</div>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 6 }}>Alert when exceeded. Set 0 to disable.</div>
            <input type="number" inputMode="numeric" style={S.inp} value={settings.maxTradesPerDay} onChange={e => set("maxTradesPerDay", parseInt(e.target.value) || 0)} />
          </div>
        </div>
      )}

      {/* ── BROKER ── */}
      {section === "BROKER" && (
        <div style={S.card}>
          <div style={{ ...S.lbl, marginBottom: 14 }}>BROKERAGE DEFAULTS</div>
          <div style={{ fontSize: 11, color: T.textDim, marginBottom: 14 }}>Pre-filled in Add Trade form. Override per trade.</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: T.textMid, marginBottom: 6 }}>Default Brokerage (₹)</div>
            <input type="number" inputMode="decimal" style={S.inp} value={settings.defaultBrokerage} onChange={e => set("defaultBrokerage", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: T.textMid, marginBottom: 6 }}>Default Other Charges (₹)</div>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 6 }}>STT + exchange fees + GST combined estimate</div>
            <input type="number" inputMode="decimal" style={S.inp} value={settings.defaultOtherCharges} onChange={e => set("defaultOtherCharges", parseFloat(e.target.value) || 0)} />
          </div>
        </div>
      )}

      {/* ── LISTS ── */}
      {section === "LISTS" && (
        <>
          {[["strategies", "Strategies"], ["emotions", "Emotions"], ["mistakes", "Mistakes"], ["checklist", "Pre-Trade Checklist"]].map(([key, label]) => (
            <div key={key} style={{ ...S.card, cursor: "pointer" }} onClick={() => openList(key, label)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 11, color: T.textMid, marginTop: 2 }}>{(settings[key] || []).length} items</div>
                </div>
                <span style={{ fontSize: 18, color: T.textDim }}>›</span>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── DATA ── */}
      {section === "DATA" && (
        <>
          {importErr && (
            <div style={{ ...S.card, background: T.redDim, border: `1px solid ${T.red}30`, marginBottom: 0 }}>
              <div style={{ fontSize: 12, color: T.red }}>{importErr}</div>
              <button onClick={() => setImportErr(null)} style={{ marginTop: 8, background: "none", border: "none", color: T.red, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Dismiss</button>
            </div>
          )}

          {/* Export */}
          <div style={S.card}>
            <div style={{ ...S.lbl, marginBottom: 14 }}>EXPORT</div>
            <button onClick={doExportJSON} style={{ ...S.btn("primary", T), width: "100%", marginBottom: 10 }}>
              ⬇ Export JSON Backup ({trades.length} trades)
            </button>
            <button onClick={doExportCSV} style={{ ...S.btn("ghost", T), width: "100%" }}>
              ⬇ Export CSV (spreadsheet)
            </button>
          </div>

          {/* Import */}
          <div style={S.card}>
            <div style={{ ...S.lbl, marginBottom: 14 }}>IMPORT</div>
            <button onClick={() => jsonRef.current?.click()} style={{ ...S.btn("ghost", T), width: "100%", marginBottom: 10 }}>
              ⬆ Restore JSON Backup
            </button>
            <input ref={jsonRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleJSONImport} />

            <button onClick={() => growwRef.current?.click()} style={{ ...S.btn("ghost", T), width: "100%", marginBottom: 6 }}>
              ⬆ Import Groww CSV
            </button>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 10, lineHeight: 1.5 }}>
              Groww App → Profile → Reports → Trade Book → Download CSV
            </div>
            <input ref={growwRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleGrowwCSV} />
          </div>

          {/* Danger zone */}
          <div style={{ ...S.card, border: `1px solid ${T.red}30` }}>
            <div style={{ ...S.lbl, color: T.red, marginBottom: 14 }}>DANGER ZONE</div>
            <button
              onClick={() => setConfirm({ title: "Clear All Data?", message: "This permanently deletes all your trades. Export a backup first. Type to confirm:", action: onClearAll, dangerous: true })}
              style={{ ...S.btn("danger", T), width: "100%" }}>
              🗑 Clear All Trades
            </button>
          </div>
        </>
      )}

      {/* ── SECURITY ── */}
      {section === "SECURITY" && (
        <div style={S.card}>
          <div style={{ ...S.lbl, marginBottom: 14 }}>PIN LOCK</div>
          <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, marginBottom: 20 }}>
            Protect your journal with a 4-digit PIN. You'll be asked for it every time the app opens.
          </div>
          {currentPin ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: T.accentDim, border: `1px solid ${T.accent}30`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <span style={{ fontSize: 13, color: T.accent, fontWeight: 600 }}>PIN lock is enabled</span>
              </div>
              <button onClick={() => setPinFlow(true)} style={{ ...S.btn("ghost", T), width: "100%" }}>Change PIN</button>
              <button onClick={removePin} style={{ ...S.btn("danger", T), width: "100%" }}>Remove PIN</button>
            </div>
          ) : (
            <button onClick={() => setPinFlow(true)} style={{ ...S.btn("primary", T), width: "100%" }}>
              🔒 Set PIN Lock
            </button>
          )}
        </div>
      )}

      {/* ── APPEARANCE ── */}
      {section === "APPEARANCE" && (
        <div style={S.card}>
          <div style={{ ...S.lbl, marginBottom: 14 }}>ACCENT COLOUR</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            {ACCENT_PRESETS.map(({ name, hex }) => (
              <button key={hex} onClick={() => set("accentColour", hex)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: hex, border: `3px solid ${settings.accentColour === hex ? "#fff" : "transparent"}`, boxShadow: settings.accentColour === hex ? `0 0 12px ${hex}` : "none" }} />
                <span style={{ fontSize: 10, color: settings.accentColour === hex ? T.text : T.textDim }}>{name}</span>
              </button>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, color: T.textMid, marginBottom: 6 }}>Custom hex colour</div>
            <input type="color" value={settings.accentColour} onChange={e => set("accentColour", e.target.value)}
              style={{ width: "100%", height: 48, borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: T.card, cursor: "pointer", padding: 4 }} />
          </div>
        </div>
      )}

      {/* ── LIST EDITOR MODAL ── */}
      {editList && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
          <div style={{ background: T.surface, borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "80vh", overflowY: "auto", padding: "24px 20px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Edit {editList.label}</span>
              <button onClick={() => setEditList(null)} style={{ background: "none", border: "none", color: T.textMid, fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>

            {/* Add new item */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input id="newItem" placeholder={`Add ${editList.label.toLowerCase().slice(0, -1)}…`}
                style={{ ...S.inp, flex: 1 }}
                onKeyDown={e => { if (e.key === "Enter") { addItem(e.target.value); e.target.value = ""; } }} />
              <button onClick={() => { const el = document.getElementById("newItem"); addItem(el.value); el.value = ""; }}
                style={{ ...S.btn("primary", T), padding: "12px 18px", whiteSpace: "nowrap" }}>Add</button>
            </div>

            {/* Items list */}
            {editList.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ fontSize: 13, color: T.text }}>{item}</span>
                <button onClick={() => remItem(i)} style={{ background: "none", border: "none", color: T.red, fontSize: 18, cursor: "pointer", padding: "0 4px" }}>×</button>
              </div>
            ))}

            <button onClick={saveList} style={{ ...S.btn("primary", T), width: "100%", marginTop: 20 }}>Save List</button>
          </div>
        </div>
      )}

      {/* ── CONFIRM MODAL ── */}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.dangerous ? "Delete Everything" : "Confirm"}
          danger={confirm.dangerous}
          onConfirm={() => { confirm.action(); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
          T={T}
        />
      )}

      {/* ── PIN SETUP ── */}
      {pinFlow && <PinSetup onSave={handlePinSave} onCancel={() => setPinFlow(false)} T={T} />}
    </div>
  );
}
