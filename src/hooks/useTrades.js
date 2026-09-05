// ─── useTrades HOOK ────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  getAllTrades, putTrade, deleteTrade, clearAllTrades,
  bulkPutTrades, migrateLegacyData,
} from "../utils/storage.js";
import { calcTrade } from "../utils/calc.js";
import { SAMPLE_TRADES } from "../constants/index.js";

export function useTrades() {
  const [trades, setTrades]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Load trades from IndexedDB on mount (+ run legacy migration once)
  useEffect(() => {
    (async () => {
      await migrateLegacyData(); // no-op if already done
      const stored = await getAllTrades();
      if (stored.length > 0) {
        setTrades(stored.map(calcTrade));
      } else {
        // First launch — seed demo data
        const demo = SAMPLE_TRADES.map(calcTrade);
        await bulkPutTrades(demo);
        setTrades(demo);
      }
      setLoading(false);
    })();
  }, []);

  const saveTrade = useCallback(async (trade) => {
    const calculated = calcTrade(trade);
    await putTrade(calculated);
    setTrades(prev => {
      const filtered = prev.filter(t => t.id !== calculated.id);
      return [calculated, ...filtered];
    });
    return calculated;
  }, []);

  const removeTrade = useCallback(async (id) => {
    await deleteTrade(id);
    setTrades(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllTrades();
    setTrades([]);
  }, []);

  const importTrades = useCallback(async (newTrades, replace = false) => {
    if (replace) await clearAllTrades();
    const calculated = newTrades.map(t => calcTrade({ ...t, id: t.id || Date.now() + Math.random() }));
    await bulkPutTrades(calculated);
    setTrades(prev => replace ? calculated : [...calculated, ...prev.filter(p => !calculated.find(c => c.id === p.id))]);
  }, []);

  // Check if currently showing demo data
  const isDemo =
    trades.length === SAMPLE_TRADES.length &&
    trades.every(t => SAMPLE_TRADES.some(s => s.id === t.id));

  return { trades, loading, isDemo, saveTrade, removeTrade, clearAll, importTrades };
}
