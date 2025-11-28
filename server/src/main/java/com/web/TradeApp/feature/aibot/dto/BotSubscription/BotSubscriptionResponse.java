package com.web.TradeApp.feature.aibot.dto.BotSubscription;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BotSubscriptionResponse(
        UUID id,
        UUID botId,
        String botName,
        UUID userId,
        BigDecimal allocatedAmount,
        BigDecimal allocatedCoin,
        BigDecimal tradePercentage,
        String status,
        BigDecimal totalProfit,
        Instant startedAt) {
}
