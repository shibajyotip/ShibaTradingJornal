// ─── FORMATTERS ────────────────────────────────────────────────────────────────

/** Absolute value formatter: 1.2L / 45.3K / 892 */
export const absF = (n) => {
  const a = Math.abs(n);
  if (a >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
};

/** Currency with sign: +₹1.2L / -₹450 */
export const fC = (n) => `${n >= 0 ? "+" : "-"}₹${absF(Math.abs(n))}`;

/** Percentage with sign: +3.45% / -1.20% */
export const fP = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

/** Today's date string in YYYY-MM-DD */
export const todayStr = () => new Date().toISOString().split("T")[0];

/** Today's label: "Saturday, 5 Sep" */
export const todayLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

/** Format a YYYY-MM-DD string to "5 Sep 2026" */
export const fDate = (dateStr) =>
  new Date(dateStr + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Format a YYYY-MM-DD string to short weekday+date: "Sat, 5 Sep" */
export const fDateShort = (dateStr) =>
  new Date(dateStr + "T12:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
