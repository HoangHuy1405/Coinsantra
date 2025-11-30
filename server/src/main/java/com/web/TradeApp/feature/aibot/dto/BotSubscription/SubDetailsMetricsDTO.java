package com.web.TradeApp.feature.aibot.dto.BotSubscription;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Detailed DTO for subscription metrics with chart data
 */
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class SubDetailsMetricsDTO implements SubscriptionMetrics {
    // Basic Info
    private String subscriptionId;
    private String userId;
    private String botId;
    private String botName;
    private String tradingPair;
    private String coin;
    private boolean isActive;

    // Financial Metrics
    private BigDecimal netInvestment;
    private BigDecimal totalEquity;
    private BigDecimal pnl;
    private BigDecimal roi;
    private BigDecimal maxDrawdown;
    private BigDecimal maxDrawdownPercent;

    // Subscription Config
    private BigDecimal botWalletBalance;
    private BigDecimal botWalletCoin;
    private BigDecimal tradePercentage;
    private Double maxDailyLossPercentage;

    // Chart Data
    private List<SubChartDataPoint> chartData;

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SubChartDataPoint {
        private Instant timestamp;
        private BigDecimal pnl;
    }
}