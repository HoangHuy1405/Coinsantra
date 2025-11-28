package com.web.TradeApp.feature.aibot.dto.BotSubscription;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BotCopyRequest(
                @NotNull(message = "Bot ID is required") UUID botId,

                @NotNull @Positive(message = "Allocated amount must be greater than 0") BigDecimal allocatedAmount,

                @NotNull @Positive(message = "Allocated coin must be greater than 0") BigDecimal allocatedCoin,

                @NotNull @DecimalMin(value = "0.01", message = "Trade percentage must be at least 1%") @DecimalMax(value = "1.0", message = "Trade percentage cannot exceed 100%") BigDecimal tradePercentage,

                @NotNull @DecimalMin(value = "0.01", message = "Max daily loss must be at least 1%") @DecimalMax(value = "1.0", message = "Max daily loss cannot exceed 100%") BigDecimal maxDailyLossPercentage) {
}
