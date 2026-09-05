// ─── PIN LOCK SCREEN ─────────────────────────────────────────────────────────
import { useState } from "react";
import { hashPin, loadPin } from "../utils/storage.js";

export function PinLock({ onUnlock, T }) {
  const [digits, setDigits]  = useState([]);
  const [error,  setError]   = useState(false);
  const [shake,  setShake]   = useState(false);

  const append = async (d) => {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    setError(false);

    if (next.length === 4) {
      const hashed   = await hashPin(next.join(""));
      const stored   = loadPin();
      if (hashed === stored) {
        onUnlock();
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => { setDigits([]); setShake(false); }, 600);
      }
    }
  };

  const del = () => setDigits(prev => prev.slice(0, -1));

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"];

  return (
    <div style={{
      position: "fixed", inset: 0, background: T.bg, zIndex: 999,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", maxWidth: 430, margin: "0 auto",
    }}>
      {/* Icon */}
      <div style={{ width: 64, height: 64, borderRadius: 32, background: T.accentDim, border: `2px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 24 }}>
        🔒
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Enter PIN</div>
      <div style={{ fontSize: 13, color: T.textMid, marginBottom: 36 }}>TradeLog is locked</div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 18, marginBottom: 48, animation: shake ? "shake 0.4s ease" : "none" }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: 8,
            background: i < digits.length ? (error ? T.red : T.accent) : "transparent",
            border: `2px solid ${i < digits.length ? (error ? T.red : T.accent) : T.cardBorder}`,
            transition: "background 0.15s, border-color 0.15s",
          }} />
        ))}
      </div>

      {/* Keypad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,80px)", gap: 12 }}>
        {keys.map((k, i) => {
          if (k === null) return <div key={i} />;
          const isDel = k === "⌫";
          return (
            <button
              key={i}
              onClick={() => isDel ? del() : append(k)}
              style={{
                width: 80, height: 80, borderRadius: 40,
                background: isDel ? "transparent" : T.card,
                border: `1px solid ${isDel ? "transparent" : T.cardBorder}`,
                color: isDel ? T.textMid : T.text,
                fontSize: isDel ? 22 : 24,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
            >
              {k}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

// ─── PIN SETUP MODAL ─────────────────────────────────────────────────────────
export function PinSetup({ onSave, onCancel, T }) {
  const [step,    setStep]    = useState(1); // 1=enter new, 2=confirm
  const [first,   setFirst]   = useState("");
  const [digits,  setDigits]  = useState([]);
  const [error,   setError]   = useState("");

  const append = (d) => {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    setError("");

    if (next.length === 4) {
      if (step === 1) {
        setFirst(next.join(""));
        setDigits([]);
        setStep(2);
      } else {
        if (next.join("") === first) {
          onSave(next.join(""));
        } else {
          setError("PINs don't match. Try again.");
          setDigits([]);
          setStep(1);
          setFirst("");
        }
      }
    }
  };
  const del = () => setDigits(prev => prev.slice(0, -1));
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ background: T.surface, borderRadius: 24, padding: "32px 24px 28px", width: "90%", maxWidth: 340, textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          {step === 1 ? "Set New PIN" : "Confirm PIN"}
        </div>
        <div style={{ fontSize: 12, color: T.textMid, marginBottom: 28 }}>
          {step === 1 ? "Choose a 4-digit PIN" : "Re-enter to confirm"}
        </div>
        {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "flex", gap: 18, justifyContent: "center", marginBottom: 32 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: i < digits.length ? T.accent : "transparent", border: `2px solid ${i < digits.length ? T.accent : T.cardBorder}` }} />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {keys.map((k, i) => {
            if (k === null) return <div key={i} />;
            return (
              <button key={i} onClick={() => k === "⌫" ? del() : append(k)}
                style={{ height: 60, borderRadius: 12, background: T.card, border: `1px solid ${T.cardBorder}`, color: T.text, fontSize: 20, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {k}
              </button>
            );
          })}
        </div>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: T.textMid, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
      </div>
    </div>
  );
}
