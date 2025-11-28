package com.web.TradeApp.feature.aibot.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import com.web.TradeApp.feature.aibot.model.Bot;
import com.web.TradeApp.feature.aibot.dto.BotCreateRequest;
import com.web.TradeApp.feature.aibot.dto.BotResponse;
import org.mapstruct.Builder;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE, builder = @Builder(disableBuilder = true))
public interface BotMapper {
    // // --- Ignoring System and Operational Fields ---
    // @Mapping(target = "id", ignore = true)
    // @Mapping(target = "createdAt", ignore = true)
    // @Mapping(target = "updatedAt", ignore = true)
    // // Ignore real-time/status fields
    // @Mapping(target = "lastSignalAt", ignore = true)
    // @Mapping(target = "lastErrorMessage", ignore = true)
    // // Ignore generated operational fields
    // @Mapping(target = "apiUrl", ignore = true)
    // @Mapping(target = "apiSecret", ignore = true)
    // --- Setting Defaults and Mapping Input Fields ---
    @Mapping(target = "status", expression = "java(com.web.TradeApp.feature.aibot.enums.BotStatus.ACTIVE)")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "coinSymbol", source = "coinSymbol")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "tradingPair", source = "tradingPair")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "riskLevel", source = "riskLevel")
    Bot toEntity(BotCreateRequest request);

    // This updates the 'bot' object IN-PLACE with values from 'request'
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", ignore = true) // Status is usually managed via state transitions, not edit form
    @Mapping(target = "apiUrl", ignore = true) // Webhook URL shouldn't change via basic edit
    @Mapping(target = "apiSecret", ignore = true)
    // Map the editable fields
    @Mapping(target = "name", source = "name")
    @Mapping(target = "coinSymbol", source = "coinSymbol")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "tradingPair", source = "tradingPair")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "riskLevel", source = "riskLevel")
    void updateEntity(@MappingTarget Bot bot, BotCreateRequest request);

    // 1. Main entry point: Maps Bot + Stats -> BotResponse
    @Mapping(target = "id", source = "bot.id")
    @Mapping(target = "name", source = "bot.name")
    @Mapping(target = "description", source = "bot.description")
    @Mapping(target = "category", source = "bot.category")
    @Mapping(target = "status", source = "bot.status")
    @Mapping(target = "createdAt", source = "bot.createdAt")
    // Map nested records by passing the 'bot' entity itself as the source
    @Mapping(target = "tradingConfig", source = "bot")
    // Pass the stats object directly
    @Mapping(target = "stats", source = "stats")
    BotResponse toResponse(Bot bot, BotResponse.BotStats stats);

    @Mapping(target = "coinSymbol", source = "coinSymbol")
    @Mapping(target = "tradingPair", source = "tradingPair")
    @Mapping(target = "riskLevel", source = "riskLevel")
    BotResponse.TradingConfig mapTradingConfig(Bot bot);

    // // 3. Helper: Maps Bot -> IntegrationConfig
    // @Mapping(target = "websocketUrl", source = "websocketUrl")
    // @Mapping(target = "healthCheckUrl", source = "healthCheckUrl")
    // BotResponse.IntegrationConfig mapIntegrationConfig(Bot bot);
}