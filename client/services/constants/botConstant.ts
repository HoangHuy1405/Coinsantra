// botConstants.ts

// --- RiskLevel (Must match Java: LOW, MEDIUM, HIGH)
export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

// --- BotCategory (Must match Java: UPPER_SNAKE_CASE)
export const BOT_CATEGORIES = [
  "AI_PREDICTIVE",
  "TREND_FOLLOWING",
  "DCA",
  "SCALPING",
  "GRID_TRADING",
  "MEAN_REVERSION",
  "ARBITRAGE",
] as const;
export type BotCategory = (typeof BOT_CATEGORIES)[number];

// --- BotStatus (Must match Java: ACTIVE, PAUSED, ERROR)
export const BOT_STATUSES = ["ACTIVE", "PAUSED", "ERROR"] as const;
export type BotStatus = (typeof BOT_STATUSES)[number];

// --- Other Enums (For reference, not necessarily used in the creation form)
// BotAction (Used for BotSignal/BotTrade entities)
export const BOT_ACTIONS = ["BUY", "SELL"] as const;
export type BotAction = (typeof BOT_ACTIONS)[number];
