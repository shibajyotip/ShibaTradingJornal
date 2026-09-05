// ─── PWA INSTALL BANNER ───────────────────────────────────────────────────────
import { useState, useEffect } from "react";

export function PWABanner({ T }) {
  const [prompt, setPrompt] = useState(null);
  const [show,   setShow]   = useState(false);
  const [upd,    setUpd]    = useState(false);

  useEffect(() => {
    const h = (e) => {
      e.preventDefault();
      setPrompt(e);
      const sa = window.matchMedia("(display-mode:standalone)").matches || window.navigator.standalone;
      if (!sa) setTimeout(() => setShow(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", h);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(r => {
        r.addEventListener("updatefound", () => {
          const sw = r.installing;
          if (sw) sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) setUpd(true);
          });
        });
      });
    }
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setShow(false);
  };

  const base = {
    position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
    width: "calc(100% - 32px)", maxWidth: 398, zIndex: 500, borderRadius: 14,
    padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
  };

  if (upd) return (
    <div style={{ ...base, background: "rgba(77,159,255,0.12)", border: "1px solid rgba(77,159,255,0.35)", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.blue }}>Update Available</div>
        <div style={{ fontSize: 11, color: T.textMid }}>Reload for latest version</div>
      </div>
      <button onClick={() => window.location.reload()}
        style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: T.blue, color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
        Reload
      </button>
    </div>
  );

  if (!show || !prompt) return null;

  return (
    <div style={{ ...base, background: "rgba(0,212,170,0.10)", border: `1px solid ${T.accent}50` }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: T.accentDim, border: `1px solid ${T.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📲</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>Install TradeLog</div>
        <div style={{ fontSize: 11, color: T.textMid }}>Add to home screen · offline access</div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={() => setShow(false)}
          style={{ padding: "7px 11px", borderRadius: 9, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMid, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
          Later
        </button>
        <button onClick={install}
          style={{ padding: "7px 13px", borderRadius: 9, border: "none", background: `linear-gradient(135deg,${T.accent},${T.accent}BB)`, color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
          Install
        </button>
      </div>
    </div>
  );
}
