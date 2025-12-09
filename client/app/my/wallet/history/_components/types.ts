// Shared types for History Dashboard components

export interface BotSubscriptionForHistory {
  subscriptionId: string;
  botName: string;
  tradingPair: string;
  coin: string;
  active: boolean;
  pnl: number;
  totalEquity: number;
}

// Map API response to component-friendly format
export function mapBotSubscriptionToHistory(
  subscription: any,
): BotSubscriptionForHistory {
  return {
    subscriptionId: subscription.subscriptionId,
    botName: subscription.botName,
    tradingPair: subscription.tradingPair,
    coin: subscription.coin,
    active: subscription.active,
    pnl: subscription.pnl,
    totalEquity: subscription.totalEquity,
  };
}
