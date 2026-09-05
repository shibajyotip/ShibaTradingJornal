// ─── AI COACH SCREEN ─────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { computeStats }       from "../utils/calc.js";
import { buildStyles }        from "../components/Styles.js";
import { loadAIHistory, saveAIHistory } from "../utils/storage.js";
import { todayStr }           from "../utils/format.js";

const INIT_MSG = { r: "ai", t: "I'm your Trade Intelligence engine. I analyse only your actual journal data — no assumptions. Ask me anything about your trading performance." };

export function AICoachScreen({ trades, T }) {
  const S = buildStyles(T);

  const [msgs,    setMsgs]    = useState(() => {
    const h = loadAIHistory();
    return h.length ? h : [INIT_MSG];
  });
  const [inp,     setInp]     = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const sugg = [
    "Why am I losing money?", "Which strategy works best?",
    "When do I perform best?", "What is my biggest mistake?",
    "Rate my trading discipline", "Best stocks for my style?",
    "Analyse my morning vs afternoon performance",
    "What is my average holding time?",
  ];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Persist conversation history
  useEffect(() => { saveAIHistory(msgs); }, [msgs]);

  const ctx = () => {
    const s = computeStats(trades);
    if (!s) return "No trades logged yet.";
    const sd = {};
    trades.forEach(t => { const k = t.strategy || "Untagged"; (sd[k] = sd[k] || []).push(t); });
    const strat = Object.entries(sd).map(([k, ts]) =>
      `${k}:${ts.length}T ${(ts.filter(t => t.netPnL > 0).length / ts.length * 100).toFixed(0)}%WR ₹${ts.reduce((a, t) => a + t.netPnL, 0).toFixed(0)}`
    ).join("; ");
    const md = {};
    trades.forEach(t => (t.mistakes || []).forEach(m => { md[m] = (md[m] || 0) + 1; }));
    const mist = Object.entries(md).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}(${v})`).join(", ");
    return `JOURNAL (${trades.length} trades, as of ${todayStr()}):
Net₹${s.totalNetPnL.toFixed(0)} WR:${s.winRate.toFixed(1)}% PF:${s.profitFactor.toFixed(2)} Exp:₹${s.expectancy.toFixed(0)}
AvgWin:₹${s.avgWin.toFixed(0)} AvgLoss:-₹${s.avgLoss.toFixed(0)} MaxDD:₹${s.maxDrawdown.toFixed(0)} Charges:₹${s.totalCharges.toFixed(0)}
Morning: ${s.morning.count}T ₹${s.morning.pnl.toFixed(0)} ${s.morning.wr.toFixed(0)}%WR | Afternoon: ${s.afternoon.count}T ₹${s.afternoon.pnl.toFixed(0)} ${s.afternoon.wr.toFixed(0)}%WR
Strategies: ${strat}
Mistakes: ${mist || "none"}
Recent: ${trades.slice(0, 5).map(t => `${t.stock} ${t.side} ₹${t.netPnL.toFixed(0)}`).join(", ")}`;
  };

  const ask = async (q) => {
    if (!q.trim() || loading) return;
    setInp("");
    const newMsgs = [...msgs, { r: "user", t: q }];
    setMsgs(newMsgs);
    setLoading(true);

    try {
      const key = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
      if (!key) {
        setMsgs(m => [...m, { r: "ai", t: "⚠️ AI Coach needs VITE_ANTHROPIC_API_KEY.\n\n1. Create .env file in project root\n2. Add: VITE_ANTHROPIC_API_KEY=sk-ant-...\n3. Restart: npm run dev\n\nGet free key at: console.anthropic.com" }]);
        setLoading(false); return;
      }

      // Build message history (last 10 exchanges for context)
      const history = msgs.slice(-10).map(m => ({
        role:    m.r === "user" ? "user" : "assistant",
        content: m.t,
      }));
      history.push({ role: "user", content: `${ctx()}\n\nQuestion: ${q}` });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":                 "application/json",
          "x-api-key":                    key,
          "anthropic-version":            "2023-06-01",
          "anthropic-dangerous-allow-browser": "true",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-6",
          max_tokens: 900,
          system:     "You are a professional trading coach for Indian stock markets (NSE/BSE). Analyse ONLY the journal data provided. Never fabricate stats. Never guarantee profits or signals. Be specific and data-driven. Keep responses under 280 words.",
          messages:   history,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMsgs(m => [...m, { r: "ai", t: `Error: ${data.error.message}` }]);
      } else {
        setMsgs(m => [...m, { r: "ai", t: data.content?.map(c => c.text || "").join("") || "No response." }]);
      }
    } catch (e) {
      setMsgs(m => [...m, { r: "ai", t: "Unavailable. Check connection and API key." }]);
    }
    setLoading(false);
  };

  const clearHistory = () => {
    setMsgs([INIT_MSG]);
    saveAIHistory([]);
  };

  return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column", height: "100vh", paddingBottom: 0 }}>
      {/* Header */}
      <div style={{ ...S.hdr, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: T.accentDim, border: `1px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧠</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Trade Intelligence</div>
              <div style={{ fontSize: 10, color: T.textMid }}>AI-powered · {trades.length} trades analysed</div>
            </div>
          </div>
          <button onClick={clearHistory} style={{ background: "none", border: `1px solid ${T.cardBorder}`, borderRadius: 8, color: T.textDim, fontSize: 10, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: m.r === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "86%",
              background:    m.r === "user" ? T.accentDim : T.card,
              border:        `1px solid ${m.r === "user" ? T.accent : T.cardBorder}`,
              borderRadius:  m.r === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding:       "10px 14px",
              fontSize:      13,
              color:         T.text,
              lineHeight:    1.65,
              whiteSpace:    "pre-wrap",
            }}>
              {m.t}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "10px 14px", marginBottom: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: 4, background: T.accent, animation: `bounce 1s ${i * 0.2}s infinite`, opacity: 0.6 }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {msgs.length <= 1 && trades.length > 0 && (
        <div style={{ padding: "0 16px 10px", flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: T.textDim, marginBottom: 8, letterSpacing: "0.08em" }}>SUGGESTED QUESTIONS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {sugg.map(s => (
              <button key={s} onClick={() => ask(s)}
                style={{ padding: "6px 12px", borderRadius: 16, fontSize: 11, background: T.card, border: `1px solid ${T.cardBorder}`, color: T.textMid, cursor: "pointer", fontFamily: "inherit" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {!trades.length && (
        <div style={{ textAlign: "center", color: T.textDim, fontSize: 13, padding: "0 16px 10px", flexShrink: 0 }}>
          Add trades first to enable AI analysis
        </div>
      )}

      {/* Input bar */}
      <div style={{ padding: "10px 16px 28px", background: T.surface, borderTop: `1px solid ${T.cardBorder}`, flexShrink: 0, display: "flex", gap: 10 }}>
        <input
          placeholder="Ask about your trading…"
          style={{ ...S.inp, flex: 1, margin: 0 }}
          value={inp}
          onChange={e => setInp(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask(inp)}
          disabled={loading}
        />
        <button onClick={() => ask(inp)} disabled={!inp.trim() || loading}
          style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, border: "none", cursor: inp.trim() && !loading ? "pointer" : "default", background: inp.trim() && !loading ? `linear-gradient(135deg,${T.accent},${T.accent}BB)` : T.card, color: inp.trim() && !loading ? "#000" : T.textDim, fontSize: 18, fontFamily: "inherit" }}>
          ↑
        </button>
      </div>
    </div>
  );
}
