// ─── SHARED STYLE FACTORY ─────────────────────────────────────────────────────
// Generates style objects from the active theme.
// Import buildStyles(T) wherever you need S.card, S.inp, etc.

export function buildStyles(T) {
  return {
    app:  { background: T.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", fontFamily: "'Inter',-apple-system,sans-serif", color: T.text, position: "relative" },
    page: { padding: "0 0 92px", minHeight: "100vh" },
    hdr:  { padding: "50px 20px 14px", background: `linear-gradient(180deg,${T.accentDim} 0%,transparent 100%)` },
    card: { background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 16, margin: "0 16px 10px" },
    gcrd: { background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: 16, padding: 16, margin: "0 16px 10px" },
    lbl:  { fontSize: 10, color: T.textMid, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 },
    inp:  { width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 15, outline: "none", boxSizing: "border-box", WebkitAppearance: "none", fontFamily: "inherit" },
    sel:  { width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 15, outline: "none", boxSizing: "border-box", appearance: "none", fontFamily: "inherit" },
    nav:  { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(9,11,15,0.97)", backdropFilter: "blur(24px)", borderTop: `1px solid ${T.cardBorder}`, display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom,8px)" },
    nb:   (active) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 4px 6px", background: "none", border: "none", cursor: "pointer", color: active ? T.accent : T.textDim, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.06em", transition: "color 0.2s", fontFamily: "inherit" }),
    fab:  (T) => ({ position: "fixed", bottom: 90, right: "calc(50% - 200px)", width: 54, height: 54, borderRadius: 27, background: `linear-gradient(135deg,${T.accent},${T.accent}BB)`, border: "none", cursor: "pointer", color: "#000", fontSize: 26, fontWeight: 300, boxShadow: `0 0 32px ${T.accentGlow}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }),
    cam:  (T) => ({ position: "fixed", bottom: 90, left: "calc(50% - 200px)", width: 44, height: 44, borderRadius: 22, background: T.blueDim, border: `1px solid ${T.blue}50`, cursor: "pointer", color: T.blue, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }),
    chip: (c, b) => ({ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: c, background: b, border: `1px solid ${c}30` }),
    btn:  (variant, T) => ({
      padding: "14px 20px", borderRadius: 12, border: variant === "ghost" ? `1px solid ${T.cardBorder}` : "none",
      cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit",
      background: variant === "primary" ? `linear-gradient(135deg,${T.accent},${T.accent}BB)` : variant === "danger" ? T.redDim : T.card,
      color: variant === "primary" ? "#000" : variant === "danger" ? T.red : T.text,
    }),
  };
}
