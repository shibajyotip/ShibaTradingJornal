// ─── APP ROOT ─────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";

// Hooks
import { useTrades }   from "./hooks/useTrades.js";
import { useSettings } from "./hooks/useSettings.js";

// Utils
import { loadPin, hashPin } from "./utils/storage.js";
import { todayStr }         from "./utils/format.js";

// Screens
import { HomeScreen }        from "./screens/HomeScreen.jsx";
import { JournalScreen }     from "./screens/JournalScreen.jsx";
import { AnalyticsScreen }   from "./screens/AnalyticsScreen.jsx";
import { AICoachScreen }     from "./screens/AICoachScreen.jsx";
import { SettingsScreen }    from "./screens/SettingsScreen.jsx";
import { TradeForm }         from "./screens/TradeForm.jsx";
import { ScreenshotImport }  from "./screens/ScreenshotImport.jsx";
import { PinLock }           from "./screens/PinLock.jsx";

// Components
import { Toast }      from "./components/UI.jsx";
import { PWABanner }  from "./components/PWABanner.jsx";
import { buildStyles } from "./components/Styles.js";

export default function App() {
  const { trades, loading, isDemo, saveTrade, removeTrade, clearAll, importTrades } = useTrades();
  const { settings, setSettings, theme: T } = useSettings();
  const S = buildStyles(T);

  const [screen,   setScreen]  = useState("HOME");
  const [showAdd,  setShowAdd] = useState(false);
  const [editT,    setEditT]   = useState(null);
  const [showImp,  setShowImp] = useState(false);
  const [toast,    setToast]   = useState(null);
  const [locked,   setLocked]  = useState(!!loadPin()); // start locked if PIN set

  // Show toast helper
  const showT = (msg, color = T.accent) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2400);
  };

  const handleSave  = async (t) => { await saveTrade(t); showT(editT ? "✓ Trade updated" : "✓ Trade saved"); setEditT(null); };
  const handleDel   = async (id) => { await removeTrade(id); showT("Trade deleted", T.red); };
  const handleEdit  = (t) => { setEditT(t); setShowAdd(true); };
  const handleImp   = async (t) => { await saveTrade(t); showT("✓ Trade imported"); };
  const handleClear = async () => { await clearAll(); showT("All trades cleared", T.red); };

  const navItems = [
    { id: "HOME",      ic: "⌂",  lb: "Home"     },
    { id: "JOURNAL",   ic: "≡",  lb: "Journal"  },
    { id: "ANALYTICS", ic: "◈",  lb: "Analytics"},
    { id: "AI",        ic: "◉",  lb: "Coach"    },
    { id: "SETTINGS",  ic: "⚙",  lb: "Settings" },
  ];

  if (loading) return (
    <div style={{ background: "#090B0F", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 13, color: "#4A5568" }}>Loading…</div>
    </div>
  );

  if (locked) return <PinLock onUnlock={() => setLocked(false)} T={T} />;

  return (
    <div style={S.app}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { margin: 0; background: ${T.bg}; overscroll-behavior: none; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        input, select, textarea { color-scheme: dark; font-family: inherit; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        ::-webkit-scrollbar { width: 0; height: 0; }
        select option { background: #0D1117; color: #F0F4FF; }
        @keyframes bounce  { 0%,100% { transform: translateY(0); }  50% { transform: translateY(-4px); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px);  } to { opacity: 1; transform: translateY(0); } }
        button:active { opacity: 0.75; }
      `}</style>

      {/* Demo banner */}
      {isDemo && (
        <div style={{ position: "sticky", top: 0, zIndex: 90, background: "rgba(255,184,48,0.09)", borderBottom: `1px solid rgba(255,184,48,0.2)`, padding: "5px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: T.gold, letterSpacing: "0.06em" }}>⚡ Demo data · 8 sample trades</span>
          <button onClick={() => { if (window.confirm("Clear demo data and start fresh?")) clearAll(); }}
            style={{ background: "none", border: `1px solid ${T.gold}50`, borderRadius: 6, color: T.gold, fontSize: 9, padding: "3px 8px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>
            Clear Demo
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} color={toast.color} />}

      {/* Screens */}
      {screen === "HOME"      && <HomeScreen      trades={trades} settings={settings} T={T} />}
      {screen === "JOURNAL"   && <JournalScreen   trades={trades} onDelete={handleDel} onEdit={handleEdit} T={T} />}
      {screen === "ANALYTICS" && <AnalyticsScreen trades={trades} T={T} />}
      {screen === "AI"        && <AICoachScreen   trades={trades} T={T} />}
      {screen === "SETTINGS"  && <SettingsScreen  settings={settings} setSettings={setSettings} trades={trades} onImport={importTrades} onClearAll={handleClear} T={T} />}

      {/* FABs — hidden when an overlay is open */}
      {!showAdd && !showImp && (
        <>
          <button style={S.fab(T)} onClick={() => { setEditT(null); setShowAdd(true); }} title="Add trade">+</button>
          <button style={S.cam(T)} onClick={() => setShowImp(true)} title="Import from screenshot">📷</button>
        </>
      )}

      {/* Overlays */}
      {showAdd && (
        <TradeForm
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setEditT(null); }}
          editTrade={editT}
          settings={settings}
          T={T}
        />
      )}
      {showImp && <ScreenshotImport onImport={handleImp} onClose={() => setShowImp(false)} T={T} />}

      <PWABanner T={T} />

      {/* Bottom nav */}
      <nav style={S.nav}>
        {navItems.map(({ id, ic, lb }) => (
          <button key={id} style={S.nb(screen === id)} onClick={() => setScreen(id)}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{ic}</span>
            <span>{lb}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
