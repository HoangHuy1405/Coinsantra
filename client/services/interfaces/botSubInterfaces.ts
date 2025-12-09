// Bot Subscription Interfaces

export interface BotSubscription {
  subscriptionId: string;
  botName: string;
  tradingPair: string;
  coin: string;
  totalEquity: number;
  pnl: number;
  active: boolean;
}

export interface BotSubscriptionDetail {
  subscriptionId: string;
  userId: string;
  botId: string;
  botName: string;
  tradingPair: string;
  coin: string;
  active: boolean;
  netInvestment: number;
  totalEquity: number;
  pnl: number;
  roi: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  botWalletBalance: number;
  botWalletCoin: number;
  tradePercentage: number;
  maxDailyLossPercentage: number;
  chartData: ChartDataPoint[];
}

export interface ChartDataPoint {
  timestamp: string;
  pnl: number;
}

export interface SubscriptionPaginatedResponse {
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: BotSubscription[];
}

export interface SubscriptionFilterParams {
  page: number;
  size: number;
  sortBy?: "pnl" | "equity" | "bot";
}

export interface BotSubOverview {
  totalActive: number;
  totalInactive: number;
  featuredSubscription: FeaturedSubscription | null;
}

export interface FeaturedSubscription {
  subscriptionId: string;
  botName: string;
  pnl: number;
  roi: number;
  maxDrawdown: number;
}
