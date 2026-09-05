// ─── INDEXEDDB STORAGE ─────────────────────────────────────────────────────────
// Replaces localStorage for trade data — no 5 MB cap, handles large screenshots.

const DB_NAME    = "TradeLogDB";
const DB_VERSION = 1;
const STORE      = "trades";

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess  = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror    = (e) => reject(e.target.error);
  });
}

export async function getAllTrades() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = () => reject(req.error);
  });
}

export async function putTrade(trade) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).put(trade);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

export async function deleteTrade(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

export async function clearAllTrades() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

export async function bulkPutTrades(trades) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    trades.forEach(t => store.put(t));
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

// ─── SETTINGS (localStorage — small object, fine here) ────────────────────────
import { SETTINGS_KEY, DEFAULT_SETTINGS } from "../constants/index.js";

export function loadSettings() {
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
  } catch (_) {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (_) {}
}

// ─── PIN (localStorage) ────────────────────────────────────────────────────────
import { PIN_KEY } from "../constants/index.js";

export function loadPin() {
  return localStorage.getItem(PIN_KEY) || null;
}

export function savePin(hashedPin) {
  if (hashedPin) localStorage.setItem(PIN_KEY, hashedPin);
  else localStorage.removeItem(PIN_KEY);
}

/** Simple hash for PIN — not cryptographic, just obfuscation for personal use */
export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(pin + "tradelog_salt");
  const hash    = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── AI HISTORY (localStorage) ────────────────────────────────────────────────
import { AI_HISTORY_KEY } from "../constants/index.js";

export function loadAIHistory() {
  try {
    const s = localStorage.getItem(AI_HISTORY_KEY);
    return s ? JSON.parse(s) : [];
  } catch (_) { return []; }
}

export function saveAIHistory(msgs) {
  try { localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(msgs.slice(-50))); } catch (_) {}
}

// ─── LEGACY MIGRATION — pull old localStorage trades into IndexedDB ────────────
const LEGACY_KEY = "tradelog_v3";

export async function migrateLegacyData() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return false;
    const parsed = JSON.parse(legacy);
    if (!Array.isArray(parsed) || !parsed.length) return false;
    const existing = await getAllTrades();
    if (existing.length > 0) return false; // already migrated
    await bulkPutTrades(parsed);
    localStorage.removeItem(LEGACY_KEY);
    return true;
  } catch (_) { return false; }
}
