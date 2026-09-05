# 📊 TradeLog — Intraday Trading Journal (PWA)

A futuristic, mobile-first trading journal **Progressive Web App** built with React 18 + Vite 5.  
Works **100% offline**. Installs on Android like a native app. Completely **free** via GitHub + Vercel.

---

## ✅ Quick Answers

| Question | Answer |
|---|---|
| **Framework** | React 18 (plain JSX, no TypeScript) |
| **Build tool** | Vite 5 |
| **Is it a PWA?** | ✅ YES — installs on Android home screen, works offline |
| **Backend / Database?** | ❌ None — 100% frontend only |
| **Where is data saved?** | IndexedDB (no 5MB cap) + localStorage for settings |
| **Works offline?** | ✅ YES — full offline mode via Service Worker |
| **Cost to run?** | 🆓 Free forever (GitHub + Vercel free tier) |

---

## 📁 Project Structure

```
trading-journal/
├── index.html              ← PWA entry point (manifest, SW, splash screen)
├── vite.config.js          ← Vite build config
├── package.json            ← Dependencies & scripts
├── vercel.json             ← SPA routing fix for Vercel
├── .gitignore              ← Excludes node_modules, .env, dist
├── .env.example            ← Template for Anthropic API key
├── public/
│   ├── manifest.json       ← PWA manifest
│   ├── sw.js               ← Service Worker (offline caching)
│   ├── offline.html        ← Shown when offline & not cached
│   └── icons/              ← PWA icons (72px → 512px)
└── src/
    ├── main.jsx            ← React root mount
    ├── index.css           ← Global reset & animations
    ├── App.jsx             ← Root — orchestrates screens, state, nav
    ├── constants/
    │   ├── index.js        ← App-wide constants, sample data, defaults
    │   └── theme.js        ← Colour tokens, buildTheme(), accent presets
    ├── hooks/
    │   ├── useTrades.js    ← IndexedDB CRUD, legacy migration, demo seed
    │   └── useSettings.js  ← Settings state + derived theme
    ├── utils/
    │   ├── calc.js         ← calcTrade(), computeStats(), rollingPnL()
    │   ├── format.js       ← fC(), fP(), todayStr(), fDate()
    │   ├── storage.js      ← IndexedDB, settings, PIN, AI history helpers
    │   └── csvImport.js    ← Groww CSV parser, JSON backup, CSV export
    ├── components/
    │   ├── Styles.js       ← buildStyles(T) — shared style factory
    │   ├── UI.jsx          ← Row, Toast, Modal, ConfirmModal, SwipeToDelete
    │   ├── Charts.jsx      ← EquityCurve, DrawdownCurve, BarChart, Calendar, etc.
    │   ├── TradeCard.jsx   ← Compact card + full detail view
    │   └── PWABanner.jsx   ← Install prompt + update notification
    └── screens/
        ├── HomeScreen.jsx      ← Dashboard: today P&L, capital, rolling metrics
        ├── JournalScreen.jsx   ← Trade list with search, filter, date range, swipe-delete
        ├── AnalyticsScreen.jsx ← 6-tab analytics (Overview, Calendar, Strategy, Time, Stocks, Mistakes)
        ├── AICoachScreen.jsx   ← AI chat with persistent history
        ├── SettingsScreen.jsx  ← Full settings: capital, limits, lists, data, PIN, colours
        ├── TradeForm.jsx       ← 3-step add/edit form with checklist gate
        ├── ScreenshotImport.jsx← AI broker screenshot → trade extraction
        └── PinLock.jsx         ← 4-digit PIN lock + setup flow
```

---

## 🚀 Run Locally

```bash
npm install
npm run dev
# Open: http://localhost:5173

npm run build
npm run preview
```

---

## ✨ Features

### Core Journal
- Log BUY/SELL intraday trades with full metadata
- 3-step form: Required → Optional → Notes
- Live P&L preview while filling in the form
- Edit / delete trades
- Swipe-left to delete trade cards on mobile
- Pre-trade checklist (configurable) — must tick all before saving

### Analytics
- **Overview**: rolling 7d/30d/90d P&L, session analysis (morning vs afternoon), key metrics, equity curve, drawdown curve
- **Calendar**: P&L calendar heatmap + monthly strip
- **Strategy**: per-strategy win rate, profit factor, avg P&L
- **Time**: intraday time heatmap + day-of-week performance
- **Stocks**: best/worst performing symbols
- **Mistakes**: performance leak analysis with loss impact

### Settings
- Configurable starting capital (default ₹5L)
- Daily loss limit alert + max trades/day alert
- Brokerage defaults (pre-filled in form)
- Custom strategy, emotion, mistake, checklist lists
- Export: JSON backup + CSV spreadsheet
- Import: JSON restore + **Groww CSV import**
- PIN lock (4-digit, SHA-256 hashed)
- Accent colour picker (6 presets + custom hex)

### AI Coach
- Chat interface powered by Claude (Anthropic)
- Conversation history persists across sessions
- Analyses your actual journal data — no hallucinated stats
- Indian market context (NSE/BSE)

### PWA
- Installs on Android home screen
- Full offline support via Service Worker
- Auto update notification banner
- Cache busting on new deploy

---

## 📱 Install on Android

1. Open **Chrome** on your Android phone
2. Go to your Vercel URL
3. Tap **⋮ menu → "Add to Home Screen"** → Install

---

## 📲 Import Groww Trades

1. Groww App → **Profile → Reports → Trade Book → Download**
2. In TradeLog: **Settings → Data → Import Groww CSV**
3. Review detected trades → Confirm import

> Note: Groww CSV does not include entry/exit times — they default to 09:15 / 15:30. Edit individual trades to update.

---

## 🔒 PIN Lock

Settings → Security → Set PIN Lock

Your 4-digit PIN is hashed with SHA-256 and stored locally. It is never sent anywhere.

---

## 🧠 AI Coach Setup (Optional)

```bash
cp .env.example .env
# Edit .env → paste your key from https://console.anthropic.com
```

For Vercel: Settings → Environment Variables → `VITE_ANTHROPIC_API_KEY`

---

## 💾 Data Storage

- Trades: **IndexedDB** — no size limit, handles thousands of trades + screenshots
- Settings / PIN / AI history: **localStorage** (small data, fine here)
- Auto-migration from old `tradelog_v3` localStorage on first launch

### Backup your data
Settings → Data → **Export JSON Backup** — save this file externally.

---

## 🛠️ npm Scripts

| Command | What it does |
|---|---|
| `npm install` | Install all packages |
| `npm run dev` | Dev server at localhost:5173 |
| `npm run build` | Build to `dist/` folder |
| `npm run preview` | Preview production build |

---

## 📄 License

Personal use. Not financial advice.
