// ─── APP CONSTANTS ─────────────────────────────────────────────────────────────

export const STORAGE_KEY      = "tradelog_v4";
export const SETTINGS_KEY     = "tradelog_settings_v1";
export const PIN_KEY          = "tradelog_pin_v1";
export const AI_HISTORY_KEY   = "tradelog_ai_history_v1";
export const CHECKLIST_KEY    = "tradelog_checklist_v1";

export const DEFAULT_CAPITAL  = 500000;   // ₹5 lakh

// Default strategies — user can customise in Settings
export const DEFAULT_STRATEGIES = [
  "RSI", "PSAR", "VWAP", "Volume",
  "RSI + PSAR", "RSI + VWAP", "VWAP + Volume",
  "RSI + PSAR + VWAP", "RSI + PSAR + VWAP + Volume",
  "ORB", "Gap & Go", "Breakout", "Pullback",
  "Scalp", "News Play", "Custom",
];

export const DEFAULT_MISTAKES = [
  "FOMO", "Revenge Trading", "Overtrading", "Late Entry", "Early Entry",
  "No Stop Loss", "Moved Stop Loss", "Premature Exit", "Ignored Strategy",
  "Oversized Position", "Traded Against Trend", "Chased Price",
  "Poor Risk:Reward", "Emotion-Based",
];

export const DEFAULT_EMOTIONS = [
  "Calm", "Confident", "Anxious", "Fearful", "Greedy",
  "Excited", "Frustrated", "Bored", "Disciplined", "Impulsive",
];

export const MARKET_CONDITIONS = [
  "Trending Up", "Trending Down", "Ranging", "Volatile",
  "Gap Up", "Gap Down", "News Driven", "Low Volume",
];

// Default settings object
export const DEFAULT_SETTINGS = {
  startCapital:      DEFAULT_CAPITAL,
  dailyLossLimit:    2000,      // ₹ — warn when day loss exceeds this
  maxTradesPerDay:   5,         // warn when exceeded
  defaultBrokerage:  20,        // ₹ flat per trade
  defaultOtherCharges: 5,       // ₹ flat per trade
  accentColour:      "#00D4AA",
  strategies:        DEFAULT_STRATEGIES,
  emotions:          DEFAULT_EMOTIONS,
  mistakes:          DEFAULT_MISTAKES,
  checklist:         [
    "Setup matches my strategy",
    "Risk:Reward ≥ 1.5",
    "Stop loss defined",
    "Not already at daily trade limit",
    "Not revenge trading",
  ],
  taxYearStart:      "04-01",   // April 1 (MM-DD)
};

// Sample trades (demo data)
export const SAMPLE_TRADES = [
  { id:1, stock:"TATASTEEL",  side:"BUY",  date:"2026-08-22", entryTime:"09:47", exitTime:"10:30", qty:100, entryPrice:168,   exitPrice:172.5, brokerage:42.5, otherCharges:18.3, strategy:"RSI + VWAP",           entryReason:"RSI bounce + VWAP reclaim",       exitReason:"Hit target",    stopLoss:165, target:174, marketCondition:"Trending Up",   emotion:"Confident",  mistakes:[],                          notes:"Clean setup, waited for confirmation", screenshot:null },
  { id:2, stock:"FEDERALBNK", side:"BUY",  date:"2026-08-22", entryTime:"10:15", exitTime:"11:05", qty:50,  entryPrice:213,   exitPrice:209,   brokerage:36.8, otherCharges:15.2, strategy:"VWAP",                 entryReason:"VWAP breakout",                   exitReason:"Stop loss hit", stopLoss:208, target:220, marketCondition:"Volatile",      emotion:"Anxious",    mistakes:["Late Entry","FOMO"],        notes:"Entered late",                        screenshot:null },
  { id:3, stock:"PNB",        side:"SELL", date:"2026-08-21", entryTime:"11:30", exitTime:"12:45", qty:200, entryPrice:108,   exitPrice:105,   brokerage:48.2, otherCharges:21.4, strategy:"RSI + PSAR",           entryReason:"RSI overbought + PSAR flip",       exitReason:"Target hit",    stopLoss:110, target:105, marketCondition:"Trending Down", emotion:"Calm",       mistakes:[],                          notes:"Perfect execution",                   screenshot:null },
  { id:4, stock:"BANKBARODA", side:"BUY",  date:"2026-08-21", entryTime:"14:10", exitTime:"14:50", qty:80,  entryPrice:253,   exitPrice:248,   brokerage:39.6, otherCharges:16.8, strategy:"RSI",                  entryReason:"Oversold RSI",                    exitReason:"Panic exit",    stopLoss:249, target:262, marketCondition:"Ranging",       emotion:"Fearful",    mistakes:["Premature Exit"],          notes:"Should have held",                    screenshot:null },
  { id:5, stock:"SUZLON",     side:"BUY",  date:"2026-08-20", entryTime:"09:20", exitTime:"10:10", qty:500, entryPrice:59,    exitPrice:62.5,  brokerage:56.8, otherCharges:28.2, strategy:"RSI + PSAR + VWAP",    entryReason:"All indicators aligned",          exitReason:"Target hit",    stopLoss:57,  target:63,  marketCondition:"Trending Up",   emotion:"Confident",  mistakes:[],                          notes:"Best trade of the week",              screenshot:null },
  { id:6, stock:"SAIL",       side:"BUY",  date:"2026-08-19", entryTime:"10:45", exitTime:"11:30", qty:150, entryPrice:138,   exitPrice:135,   brokerage:33.6, otherCharges:14.2, strategy:"VWAP + Volume",        entryReason:"Volume spike + VWAP hold",        exitReason:"Stopped out",   stopLoss:135, target:144, marketCondition:"Volatile",      emotion:"Frustrated", mistakes:["Overtrading","FOMO"],       notes:"Overtraded after earlier loss",       screenshot:null },
  { id:7, stock:"IDFCFIRSTB", side:"SELL", date:"2026-08-19", entryTime:"13:15", exitTime:"14:30", qty:200, entryPrice:75,    exitPrice:72,    brokerage:47.6, otherCharges:20.2, strategy:"RSI + VWAP",           entryReason:"RSI overbought + VWAP rejection", exitReason:"Target hit",    stopLoss:77,  target:72,  marketCondition:"Trending Down", emotion:"Calm",       mistakes:[],                          notes:"Textbook short setup",                screenshot:null },
  { id:8, stock:"NHPC",       side:"BUY",  date:"2026-08-18", entryTime:"09:30", exitTime:"10:45", qty:300, entryPrice:91,    exitPrice:95,    brokerage:52.4, otherCharges:25.6, strategy:"RSI + PSAR + VWAP + Volume", entryReason:"All 4 indicators bullish",   exitReason:"Target hit",    stopLoss:88,  target:95,  marketCondition:"Trending Up",   emotion:"Confident",  mistakes:[],                          notes:"Best setup type",                     screenshot:null },
];
