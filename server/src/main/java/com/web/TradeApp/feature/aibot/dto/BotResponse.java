package com.web.TradeApp.feature.aibot.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.web.TradeApp.feature.aibot.enums.BotCategory;
import com.web.TradeApp.feature.aibot.enums.BotStatus;
import com.web.TradeApp.feature.aibot.enums.RiskLevel;
import java.time.Instant;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record BotResponse(
        UUID id,
        String name,
        String description,
        BotCategory category,
        BotStatus status,
        Instant createdAt,

        // Nested objects
        TradingConfig tradingConfig,
        // IntegrationConfig integrationConfig,
        BotStats stats) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record TradingConfig(
            String coinSymbol,
            String tradingPair,
            RiskLevel riskLevel) {
    }

    // @JsonInclude(JsonInclude.Include.NON_NULL)
    // public record IntegrationConfig(
    // String websocketUrl,
    // String healthCheckUrl) {
    // }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record BotStats(
            Long totalTrades,
            Double uptime,
            Long copyingUsers,
            Double roi24h,
            Double pnl24h,
            Instant lastSignalAt) {
    }
}