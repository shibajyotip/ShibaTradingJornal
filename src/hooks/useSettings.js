// ─── useSettings HOOK ──────────────────────────────────────────────────────────
import { useState, useCallback } from "react";
import { loadSettings, saveSettings } from "../utils/storage.js";
import { buildTheme } from "../constants/theme.js";

export function useSettings() {
  const [settings, setSettingsState] = useState(() => loadSettings());

  const setSettings = useCallback((updater) => {
    setSettingsState(prev => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      saveSettings(next);
      return next;
    });
  }, []);

  // Derived theme based on current accent colour
  const theme = buildTheme(settings.accentColour);

  return { settings, setSettings, theme };
}
