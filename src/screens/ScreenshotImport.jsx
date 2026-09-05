// ─── SCREENSHOT IMPORT ────────────────────────────────────────────────────────
import { useState, useRef } from "react";
import { calcTrade }   from "../utils/calc.js";
import { fC }          from "../utils/format.js";
import { buildStyles } from "../components/Styles.js";
import { todayStr }    from "../utils/format.js";

export function ScreenshotImport({ onImport, onClose, T }) {
  const S = buildStyles(T);
  const [prev,    setPrev]    = useState(null);
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [err,     setErr]     = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setFile(f); setResult(null); setErr(null);
    const r = new FileReader();
    r.onload = (ev) => setPrev(ev.target.result);
    r.readAsDataURL(f);
  };

  const analyse = async () => {
    if (!prev) return;
    setLoading(true); setErr(null);
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
    if (!key) {
      setErr("AI Import needs VITE_ANTHROPIC_API_KEY. See README. Add trades manually until configured.");
      setLoading(false); return;
    }
    try {
      const base64 = prev.split(",")[1];
      const mt     = file?.type || "image/jpeg";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":               "application/json",
          "x-api-key":                  key,
          "anthropic-version":          "2023-06-01",
          "anthropic-dangerous-allow-browser": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 2000,
          system: `You extract trade data from broker screenshots. Return ONLY a valid JSON array with no markdown. Each element: {"stock":"SYMBOL","side":"BUY"or"SELL","date":"YYYY-MM-DD","entryTime":"HH:MM","exitTime":"HH:MM","qty":number,"entryPrice":number,"exitPrice":number,"brokerage":20,"otherCharges":5}. Use today ${todayStr()} for missing dates. Use "09:30"/"10:00" for missing times. Return [] if no trades found.`,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mt, data: base64 } },
              { type: "text",  text: "Extract all trades. JSON array only." },
            ],
          }],
        }),
      });
      const data = await res.json();
      if (data.error) { setErr(`API: ${data.error.message}`); setLoading(false); return; }
      const txt    = data.content?.map(c => c.text || "").join("") || "[]";
      const trades = JSON.parse(txt.replace(/```json|```/g, "").trim());
      if (!Array.isArray(trades) || !trades.length) {
        setErr("No trades found. Use a clearer screenshot showing stock, price, and quantity.");
      } else {
        setResult(trades.map(t => calcTrade({
          ...t, id: Date.now() + Math.random(),
          mistakes: [], notes: "Imported from screenshot", screenshot: prev,
        })));
      }
    } catch (e) {
      setErr("Could not read trade data. Try a clearer screenshot or add manually.");
    }
    setLoading(false);
  };

  const confirm = () => { result.forEach(t => onImport(t)); onClose(); };

  return (
    <div style={{ position: "fixed", inset: 0, background: T.surface, zIndex: 210, overflowY: "auto", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ position: "sticky", top: 0, background: T.surface, borderBottom: `1px solid ${T.cardBorder}`, padding: "48px 16px 12px", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMid, fontSize: 22, cursor: "pointer" }}>✕</button>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.textMid, letterSpacing: "0.1em" }}>AI SCREENSHOT IMPORT</span>
          <div style={{ width: 32 }} />
        </div>
      </div>

      <div style={{ padding: "16px 16px 80px" }}>
        <div style={{ ...S.card, background: T.blueDim, border: `1px solid ${T.blue}30`, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.blue, marginBottom: 5 }}>📱 Auto-detect trades from screenshots</div>
          <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.65 }}>
            Upload a screenshot from <b>Zerodha Kite</b>, <b>Upstox</b>, <b>Angel One</b>, or any broker trade book. AI reads entry/exit prices, quantity, and stock automatically.
          </div>
        </div>

        <div style={{ ...S.card, border: `2px dashed ${prev ? T.accent : T.cardBorder}`, cursor: "pointer", textAlign: "center", padding: 20, marginBottom: 12, transition: "border-color 0.2s" }}
          onClick={() => fileRef.current?.click()}>
          {prev ? (
            <img src={prev} alt="Upload" style={{ width: "100%", borderRadius: 10, objectFit: "contain", maxHeight: 210, marginBottom: 8 }} />
          ) : (
            <>
              <div style={{ fontSize: 44, marginBottom: 10 }}>📸</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Tap to upload screenshot</div>
              <div style={{ fontSize: 11, color: T.textDim }}>Broker screenshot · contract note · trade summary</div>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </div>

        {prev && !result && (
          <button onClick={analyse} disabled={loading}
            style={{ ...S.btn("primary", T), width: "100%", marginBottom: 12, opacity: loading ? 0.7 : 1, boxShadow: `0 0 24px ${T.accentGlow}` }}>
            {loading ? "🔍 Analysing…" : "✨ Extract Trades with AI"}
          </button>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: T.accent, animation: `bounce 1s ${i * 0.2}s infinite`, opacity: 0.7 }} />)}
            </div>
            <div style={{ fontSize: 13, color: T.textMid }}>Reading trade data…</div>
          </div>
        )}

        {err && (
          <div style={{ ...S.card, background: T.redDim, border: `1px solid ${T.red}30`, marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: T.red, lineHeight: 1.65 }}>{err}</div>
          </div>
        )}

        {result?.length > 0 && (
          <>
            <div style={{ ...S.card, background: T.accentDim, border: `1px solid ${T.accent}30`, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 3 }}>✅ {result.length} trade{result.length > 1 ? "s" : ""} detected</div>
              <div style={{ fontSize: 11, color: T.textMid }}>Review below then tap Import to add to journal</div>
            </div>
            {result.map((t, i) => (
              <div key={i} style={{ ...S.card, borderLeft: `3px solid ${t.netPnL >= 0 ? T.accent : T.red}`, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{t.stock}</span>
                    <span style={{ ...S.chip(t.side === "BUY" ? T.accent : T.gold, t.side === "BUY" ? T.accentDim : T.goldDim), fontSize: 9 }}>{t.side}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.netPnL >= 0 ? T.accent : T.red }}>{fC(t.netPnL)}</span>
                </div>
                <div style={{ fontSize: 11, color: T.textMid }}>₹{t.entryPrice} → ₹{t.exitPrice} · {t.qty} qty · {t.holdStr}</div>
                <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{t.date} · {t.entryTime} – {t.exitTime}</div>
              </div>
            ))}
            <button onClick={confirm} style={{ ...S.btn("primary", T), width: "100%", boxShadow: `0 0 24px ${T.accentGlow}` }}>
              ✅ Import {result.length} Trade{result.length > 1 ? "s" : ""} to Journal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
