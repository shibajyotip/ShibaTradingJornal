// ─── SHARED UI PRIMITIVES ─────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";

// ── Row ────────────────────────────────────────────────────────────────────────
export function Row({ label, val, color, sub, last, T }) {
  const c = color || T.text;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: last ? "none" : `1px solid ${T.cardBorder}` }}>
      <span style={{ fontSize: 13, color: T.textMid }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{val}</div>
        {sub && <div style={{ fontSize: 10, color: T.textDim }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
export function Toast({ msg, color }) {
  return (
    <div style={{
      position: "fixed", top: 58, left: "50%", transform: "translateX(-50%)",
      zIndex: 999, background: color, color: "#000", fontWeight: 700, fontSize: 13,
      padding: "10px 22px", borderRadius: 22, boxShadow: "0 6px 28px rgba(0,0,0,0.5)",
      whiteSpace: "nowrap", animation: "fadeUp 0.3s ease",
    }}>
      {msg}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose, T }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ background: T.surface, borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "85vh", overflowY: "auto", padding: "20px 20px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMid, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── ConfirmModal ───────────────────────────────────────────────────────────────
export function ConfirmModal({ title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel, T }) {
  return (
    <Modal title={title} onClose={onCancel} T={T}>
      <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, marginBottom: 20 }}>{message}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMid, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Cancel
        </button>
        <button onClick={onConfirm} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: danger ? T.red : `linear-gradient(135deg,${T.accent},${T.accent}BB)`, color: danger ? "#fff" : "#000", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── Swipeable Trade Card container ────────────────────────────────────────────
export function SwipeToDelete({ onDelete, children, T }) {
  const [offsetX, setOffX] = useState(0);
  const startX = useRef(null);
  const threshold = 80;

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchMove  = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) setOffX(Math.max(dx, -130));
  };
  const onTouchEnd = () => {
    if (offsetX < -threshold) { onDelete(); }
    else setOffX(0);
    startX.current = null;
  };

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, marginBottom: 0 }}>
      {/* Delete hint behind card */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 100,
        background: T.red, borderRadius: "0 16px 16px 0",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, opacity: Math.min(Math.abs(offsetX) / threshold, 1),
      }}>🗑</div>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translateX(${offsetX}px)`, transition: offsetX === 0 ? "transform 0.3s ease" : "none" }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────
export function SectionHeader({ label, T }) {
  return (
    <div style={{ fontSize: 11, color: T.textMid, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 20px 8px", fontWeight: 600 }}>
      {label}
    </div>
  );
}
