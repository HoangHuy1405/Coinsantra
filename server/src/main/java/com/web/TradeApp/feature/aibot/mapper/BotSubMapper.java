package com.web.TradeApp.feature.aibot.mapper;

import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotCopyRequest;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotSubscriptionResponse;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotUpdateRequest;
import com.web.TradeApp.feature.aibot.model.BotSubscription;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE, builder = @Builder(disableBuilder = true))
public interface BotSubMapper {

    @Mapping(target = "startedAt", expression = "java(Instant.now())") // Set start time to NOW
    @Mapping(target = "active", constant = "true") // Force active on creation
    BotSubscription toEntity(BotCopyRequest request);

    @Mapping(target = "botId", source = "bot.id") // Flatten: sub.getBot().getId()
    @Mapping(target = "botName", source = "bot.name") // Flatten: sub.getBot().getName()
    @Mapping(target = "status", source = "active", qualifiedByName = "mapStatus")
    @Mapping(target = "totalProfit", expression = "java(BigDecimal.ZERO)") // Default 0 for new copies
    BotSubscriptionResponse toResponse(BotSubscription entity);

    void updateEntityFromDto(BotUpdateRequest request, @MappingTarget BotSubscription entity);

    @Named("mapStatus")
    default String mapStatus(boolean active) {
        return active ? "ACTIVE" : "PAUSED";
    }
}
