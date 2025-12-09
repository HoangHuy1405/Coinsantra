package com.web.TradeApp.feature.aibot.service.subscription;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.web.TradeApp.feature.aibot.dto.Bot.BotDetailDTO;
import com.web.TradeApp.feature.aibot.dto.Bot.BotGridItemDTO;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotSubOverviewDTO;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.SubDetailsMetricsDTO;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.SubItemDTO;

public interface ModularMetricsService {
        Page<BotGridItemDTO> getAllBotsWithPagination(
                        String timeframe,
                        String sortBy,
                        String searchName,
                        Pageable pageable);

        BotGridItemDTO getSingleBotMetrics(UUID botId, String timeframe);

        Page<SubItemDTO> getAllUserSubscriptions(
                        UUID userId,
                        String sortBy,
                        Pageable pageable);

        SubDetailsMetricsDTO getSubscriptionMetrics(UUID subscriptionId, String timeframe);

        BotDetailDTO getBotDetailWithChart(UUID botId, String timeframe);

        BotSubOverviewDTO getUserBotSubscriptionOverview(
                        UUID userId);
}
