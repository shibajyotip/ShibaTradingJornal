// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
// Base palette — accent is overridden at runtime from settings
export const T = {
  bg:          "#090B0F",
  surface:     "#0D1117",
  card:        "rgba(255,255,255,0.04)",
  cardBorder:  "rgba(255,255,255,0.08)",
  glass:       "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.12)",

  // Accent — default teal, overridden by settings
  accent:      "#00D4AA",
  accentDim:   "rgba(0,212,170,0.15)",
  accentGlow:  "rgba(0,212,170,0.3)",

  red:         "#FF4D6D",
  redDim:      "rgba(255,77,109,0.15)",
  gold:        "#FFB830",
  goldDim:     "rgba(255,184,48,0.15)",
  blue:        "#4D9FFF",
  blueDim:     "rgba(77,159,255,0.15)",
  purple:      "#A78BFA",
  purpleDim:   "rgba(167,139,250,0.15)",

  text:        "#F0F4FF",
  textMid:     "#8B95A8",
  textDim:     "#4A5568",
};

// Build a theme object with a custom accent colour
export function buildTheme(accentHex = "#00D4AA") {
  const hex = accentHex || "#00D4AA";
  // Parse hex → rgb for dim/glow variants
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return {
    ...T,
    accent:     hex,
    accentDim:  `rgba(${r},${g},${b},0.15)`,
    accentGlow: `rgba(${r},${g},${b},0.3)`,
  };
}

// Accent colour presets for the settings picker
export const ACCENT_PRESETS = [
  { name: "Teal",   hex: "#00D4AA" },
  { name: "Blue",   hex: "#4D9FFF" },
  { name: "Purple", hex: "#A78BFA" },
  { name: "Gold",   hex: "#FFB830" },
  { name: "Pink",   hex: "#FF6B9D" },
  { name: "Orange", hex: "#FF8C42" },
];
