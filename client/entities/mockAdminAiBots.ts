import {
  BotStatus,
  RiskLevel,
  BotAction,
} from "@/services/constants/botConstant";

export interface AdminBot {
  id: string;
  name: string;
  coin: string;
  status: BotStatus;

  roi1d: number; // ROI (24h)
  pnl1d: number; // PnL (24h)
  copyingUsers: number;

  lastSignal: {
    type: "buy" | "sell";
    timestamp: string; // readable, e.g. "2025-01-05 14:32"
  };
}

export const adminBotDatabase: AdminBot[] = [
  {
    id: "bot-001",
    name: "Alpha Scalper",
    coin: "BTC",
    status: "ACTIVE",
    roi1d: 2.4,
    pnl1d: 125.75,
    copyingUsers: 842,
    lastSignal: {
      type: "buy",
      timestamp: "2025-01-05 14:32",
    },
  },
  {
    id: "bot-002",
    name: "Swing Master",
    coin: "ETH",
    status: "PAUSED",
    roi1d: -1.1,
    pnl1d: -48.32,
    copyingUsers: 421,
    lastSignal: {
      type: "sell",
      timestamp: "2025-01-05 11:02",
    },
  },
  {
    id: "bot-003",
    name: "Grid Titan",
    coin: "BNB",
    status: "ACTIVE",
    roi1d: 3.7,
    pnl1d: 212.14,
    copyingUsers: 1290,
    lastSignal: {
      type: "buy",
      timestamp: "2025-01-04 22:10",
    },
  },
  {
    id: "bot-004",
    name: "Volatility Hunter",
    coin: "SOL",
    status: "ERROR",
    roi1d: -4.5,
    pnl1d: -202.55,
    copyingUsers: 184,
    lastSignal: {
      type: "sell",
      timestamp: "2025-01-05 02:41",
    },
  },
  {
    id: "bot-005",
    name: "Mean Reversion Pro",
    coin: "XRP",
    status: "ACTIVE",
    roi1d: 1.3,
    pnl1d: 54.09,
    copyingUsers: 602,
    lastSignal: {
      type: "buy",
      timestamp: "2025-01-05 16:20",
    },
  },
  {
    id: "bot-006",
    name: "Trend Rider",
    coin: "ADA",
    status: "PAUSED",
    roi1d: 0.2,
    pnl1d: 6.45,
    copyingUsers: 293,
    lastSignal: {
      type: "sell",
      timestamp: "2025-01-05 07:50",
    },
  },
];
// More detailed admin bot model for create/edit pages
export interface AdminBotDetail {
  id: string;
  name: string;
  description?: string;

  category: string;
  tags: string[];
  riskLevel: RiskLevel;

  coin: string;
  allocationPercentage: number;
  tradingFrequency: string;
  tradeType: BotAction;

  apiUrl: string;
  websocketUrl?: string;
  healthCheckUrl?: string;

  apiKey: string;
  apiSecret: string;

  autoPauseOnErrors: boolean;
  autoPauseOnUnsupportedCoins: boolean;

  createdAt: string;
  totalTrades: number;
  uptime: number; // %
  copyingUsers: number;

  status: BotStatus;

  lastSignal: {
    type: "buy" | "sell";
    timestamp: string;
  };

  roi1d: number;
  pnl1d: number;
}

export const adminBotDetailDatabase: AdminBotDetail[] = [
  {
    id: "bot-001",
    name: "Alpha Scalper",
    description: "high-frequency scalping bot optimized for BTC volatility.",
    category: "Scalping",
    tags: ["HFT", "Momentum"],
    riskLevel: "HIGH",

    coin: "BTC",
    allocationPercentage: 25,
    tradingFrequency: "1m",
    tradeType: "BUY",

    apiUrl: "https://api.botengine.example/bot-001",
    websocketUrl: "wss://ws.botengine.example/bot-001",
    healthCheckUrl: "https://api.botengine.example/bot-001/health",

    apiKey: "alpha_key_001",
    apiSecret: "alpha_secret_001",

    autoPauseOnErrors: true,
    autoPauseOnUnsupportedCoins: true,

    createdAt: "2024-11-18 10:15",
    totalTrades: 18234,
    uptime: 99.7,
    copyingUsers: 842,

    status: "ACTIVE",

    lastSignal: {
      type: "buy",
      timestamp: "2025-01-05 14:32",
    },

    roi1d: 2.4,
    pnl1d: 125.75,
  },

  {
    id: "bot-002",
    name: "Swing Master",
    description: "ETH swing-trading bot using momentum reversal models.",
    category: "Trend FolLOWing",
    tags: ["Swing", "ETH"],
    riskLevel: "MEDIUM",

    coin: "ETH",
    allocationPercentage: 40,
    tradingFrequency: "4h",
    tradeType: "SELL",

    apiUrl: "https://api.botengine.example/bot-002",
    websocketUrl: undefined,
    healthCheckUrl: "https://api.botengine.example/bot-002/health",

    apiKey: "swing_key_002",
    apiSecret: "swing_secret_002",

    autoPauseOnErrors: true,
    autoPauseOnUnsupportedCoins: false,

    createdAt: "2024-10-02 08:40",
    totalTrades: 6321,
    uptime: 92.4,
    copyingUsers: 421,

    status: "PAUSED",

    lastSignal: {
      type: "sell",
      timestamp: "2025-01-05 11:02",
    },

    roi1d: -1.1,
    pnl1d: -48.32,
  },

  {
    id: "bot-003",
    name: "Grid Titan",
    description: "Automated grid bot for BNB with dynamic grid spacing.",
    category: "Grid Trading",
    tags: ["Grid", "Automation"],
    riskLevel: "LOW",

    coin: "BNB",
    allocationPercentage: 30,
    tradingFrequency: "15m",
    tradeType: "SELL",

    apiUrl: "https://api.botengine.example/bot-003",
    websocketUrl: "wss://ws.botengine.example/bot-003",
    healthCheckUrl: "https://api.botengine.example/bot-003/health",

    apiKey: "grid_key_003",
    apiSecret: "grid_secret_003",

    autoPauseOnErrors: true,
    autoPauseOnUnsupportedCoins: true,

    createdAt: "2024-07-12 13:10",
    totalTrades: 10344,
    uptime: 98.2,
    copyingUsers: 1290,

    status: "ACTIVE",

    lastSignal: {
      type: "buy",
      timestamp: "2025-01-04 22:10",
    },

    roi1d: 3.7,
    pnl1d: 212.14,
  },

  {
    id: "bot-004",
    name: "Volatility Hunter",
    description: "SOL volatility bot using predictive breakout detection.",
    category: "AI Predictive",
    tags: ["AI", "Breakout"],
    riskLevel: "HIGH",

    coin: "SOL",
    allocationPercentage: 20,
    tradingFrequency: "5m",
    tradeType: "SELL",

    apiUrl: "https://api.botengine.example/bot-004",
    websocketUrl: undefined,
    healthCheckUrl: undefined,

    apiKey: "vol_key_004",
    apiSecret: "vol_secret_004",

    autoPauseOnErrors: false,
    autoPauseOnUnsupportedCoins: true,

    createdAt: "2024-12-01 17:50",
    totalTrades: 3444,
    uptime: 76.9,
    copyingUsers: 184,

    status: "ERROR",

    lastSignal: {
      type: "sell",
      timestamp: "2025-01-05 02:41",
    },

    roi1d: -4.5,
    pnl1d: -202.55,
  },

  {
    id: "bot-005",
    name: "Mean Reversion Pro",
    description: "Statistical mean reversion engine for XRP cycles.",
    category: "Mean Reversion",
    tags: ["XRP", "Cycles"],
    riskLevel: "MEDIUM",

    coin: "XRP",
    allocationPercentage: 35,
    tradingFrequency: "1h",
    tradeType: "BUY",

    apiUrl: "https://api.botengine.example/bot-005",
    websocketUrl: "wss://ws.botengine.example/bot-005",
    healthCheckUrl: "https://api.botengine.example/bot-005/health",

    apiKey: "mrp_key_005",
    apiSecret: "mrp_secret_005",

    autoPauseOnErrors: true,
    autoPauseOnUnsupportedCoins: true,

    createdAt: "2024-09-20 09:25",
    totalTrades: 7840,
    uptime: 96.5,
    copyingUsers: 602,

    status: "ACTIVE",

    lastSignal: {
      type: "buy",
      timestamp: "2025-01-05 16:20",
    },

    roi1d: 1.3,
    pnl1d: 54.09,
  },

  {
    id: "bot-006",
    name: "Trend Rider",
    description: "Momentum-based ADA trend detection bot.",
    category: "Trend FolLOWing",
    tags: ["Momentum", "ADA"],
    riskLevel: "LOW",

    coin: "ADA",
    allocationPercentage: 15,
    tradingFrequency: "30m",
    tradeType: "SELL",

    apiUrl: "https://api.botengine.example/bot-006",
    websocketUrl: undefined,
    healthCheckUrl: undefined,

    apiKey: "trend_key_006",
    apiSecret: "trend_secret_006",

    autoPauseOnErrors: false,
    autoPauseOnUnsupportedCoins: true,

    createdAt: "2024-05-08 12:30",
    totalTrades: 5432,
    uptime: 88.1,
    copyingUsers: 293,

    status: "PAUSED",

    lastSignal: {
      type: "sell",
      timestamp: "2025-01-05 07:50",
    },

    roi1d: 0.2,
    pnl1d: 6.45,
  },
];
