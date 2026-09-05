// ─── GROWW CSV IMPORT ──────────────────────────────────────────────────────────
// Parses the CSV downloaded from:
//   Groww App → Profile → Reports → Trade Book → Download
//
// Groww CSV columns (as of 2025):
//   Trade Date, Exchange, Symbol, Trade Type (BUY/SELL), Quantity, Price,
//   Trade Value, Order ID, Trade ID, Brokerage, STT, Exchange Charges,
//   SEBI Fees, Stamp Duty, GST, Total Charges, Net Amount

import { calcTrade } from "./calc.js";

/**
 * Parse Groww CSV text into an array of trade objects ready for calcTrade.
 * Returns { trades, errors } where errors is an array of row-level issues.
 */
export function parseGrowwCSV(csvText) {
  const lines  = csvText.trim().split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return { trades: [], errors: ["File appears empty"] };

  // Detect header row (first row)
  const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));

  // Column index helpers
  const col = (name) => header.findIndex(h => h.includes(name));
  const idxDate    = col("trade date") !== -1 ? col("trade date") : col("date");
  const idxSymbol  = col("symbol") !== -1 ? col("symbol") : col("scrip");
  const idxType    = col("trade type") !== -1 ? col("trade type") : col("type");
  const idxQty     = col("quantity") !== -1 ? col("quantity") : col("qty");
  const idxPrice   = col("price");
  const idxBroke   = col("brokerage");
  const idxTotal   = col("total charges") !== -1 ? col("total charges") : col("charges");

  const trades  = [];
  const errors  = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      // Handle quoted CSV fields
      const row = splitCSVRow(lines[i]);
      if (row.length < 5) { errors.push(`Row ${i + 1}: too few columns`); continue; }

      const clean = (idx) => idx !== -1 ? (row[idx] || "").replace(/"/g, "").trim() : "";

      const rawDate   = clean(idxDate);
      const symbol    = clean(idxSymbol).toUpperCase().replace(/\s+/g, "");
      const tradeType = clean(idxType).toUpperCase();
      const qty       = parseFloat(clean(idxQty));
      const price     = parseFloat(clean(idxPrice));
      const brokerage = parseFloat(clean(idxBroke)) || 20;
      const charges   = parseFloat(clean(idxTotal))  || 5;

      if (!symbol || !rawDate || !qty || !price) {
        errors.push(`Row ${i + 1}: missing required fields (${symbol || "?"} ${rawDate || "?"})`);
        continue;
      }

      // Parse date — Groww uses DD-MM-YYYY or DD/MM/YYYY
      const date = parseGrowwDate(rawDate);
      if (!date) { errors.push(`Row ${i + 1}: unrecognised date format "${rawDate}"`); continue; }

      const side = tradeType.includes("BUY") ? "BUY" : "SELL";

      // Groww does not provide entry/exit times in the trade book CSV
      // Use market-open defaults; user can edit later
      const trade = calcTrade({
        id:           Date.now() + i + Math.random(),
        stock:        symbol,
        side,
        date,
        entryTime:    "09:15",
        exitTime:     "15:30",
        qty,
        entryPrice:   side === "BUY"  ? price : price,
        exitPrice:    side === "SELL" ? price : price,
        brokerage:    brokerage,
        otherCharges: Math.max(0, charges - brokerage),
        strategy:     "",
        stopLoss:     null,
        target:       null,
        marketCondition: "",
        emotion:      "",
        mistakes:     [],
        notes:        "Imported from Groww CSV",
        entryReason:  "",
        exitReason:   "",
        screenshot:   null,
        _imported:    true,
      });

      trades.push(trade);
    } catch (e) {
      errors.push(`Row ${i + 1}: parse error — ${e.message}`);
    }
  }

  return { trades, errors };
}

/** Parse Groww date formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD */
function parseGrowwDate(str) {
  if (!str) return null;
  str = str.trim();

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // DD-MM-YYYY or DD/MM/YYYY
  const m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2,"0")}-${d.padStart(2,"0")}`;
  }

  return null;
}

/** Handle CSV rows with quoted fields containing commas */
function splitCSVRow(line) {
  const result = [];
  let cur = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === "," && !inQ) { result.push(cur); cur = ""; }
    else cur += ch;
  }
  result.push(cur);
  return result;
}

// ─── JSON BACKUP EXPORT / IMPORT ──────────────────────────────────────────────

export function exportJSON(trades, settings) {
  const payload = {
    version:    "tradelog_v4",
    exportedAt: new Date().toISOString(),
    trades,
    settings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `tradelog-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV(trades) {
  const headers = [
    "Date","Stock","Side","Qty","Entry Price","Exit Price",
    "Gross P&L","Brokerage","Other Charges","Net P&L","Net Return %",
    "Hold Time","Strategy","Stop Loss","Target","R:R",
    "Emotion","Market Condition","Mistakes","Entry Reason","Exit Reason","Notes",
  ];
  const rows = trades.map(t => [
    t.date, t.stock, t.side, t.qty, t.entryPrice, t.exitPrice,
    t.grossPnL?.toFixed(2), t.brokerage, t.otherCharges, t.netPnL?.toFixed(2),
    t.netReturn?.toFixed(2), t.holdStr, t.strategy || "",
    t.stopLoss || "", t.target || "", t.rr || "",
    t.emotion || "", t.marketCondition || "",
    (t.mistakes || []).join("|"), t.entryReason || "", t.exitReason || "",
    (t.notes || "").replace(/,/g, ";"),
  ]);
  const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `tradelog-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse a JSON backup file and return { trades, settings, error }.
 */
export function parseJSONBackup(text) {
  try {
    const data = JSON.parse(text);
    if (!data.trades || !Array.isArray(data.trades)) {
      return { trades: null, settings: null, error: "Invalid backup file — no trades array found." };
    }
    return { trades: data.trades, settings: data.settings || null, error: null };
  } catch (e) {
    return { trades: null, settings: null, error: `JSON parse error: ${e.message}` };
  }
}
