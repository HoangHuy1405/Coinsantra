package com.web.TradeApp.feature.aibot.dto;

import com.web.TradeApp.feature.aibot.enums.BotCategory;
import com.web.TradeApp.feature.aibot.enums.RiskLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BotCreateRequest(
                @NotBlank String name,
                @NotBlank String coinSymbol,
                @NotBlank String tradingPair,
                String description,
                @NotNull BotCategory category,
                @NotNull RiskLevel riskLevel) {
}
