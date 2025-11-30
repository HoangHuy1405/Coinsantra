package com.web.TradeApp.feature.aibot.dto.BotSubscription;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BotUpdateRequest(

                @NotNull @Positive(message = "Bot wallet balance must be greater than 0") BigDecimal botWalletBalance,

                @NotNull @Positive(message = "Bot wallet coin must be greater than 0") BigDecimal botWalletCoin,

                @NotNull @DecimalMin(value = "0.01", message = "Trade percentage must be at least 1%") @DecimalMax(value = "1.0", message = "Trade percentage cannot exceed 100%") BigDecimal tradePercentage,

                @NotNull @DecimalMin(value = "0.01", message = "Max daily loss must be at least 1%") @DecimalMax(value = "1.0", message = "Max daily loss cannot exceed 100%") BigDecimal maxDailyLossPercentage) {
}
