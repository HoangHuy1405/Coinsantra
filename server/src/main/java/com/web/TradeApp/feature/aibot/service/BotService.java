package com.web.TradeApp.feature.aibot.service;

import java.util.List;
import java.util.UUID;

import com.web.TradeApp.feature.aibot.dto.BotCreateRequest;
import com.web.TradeApp.feature.aibot.dto.BotResponse;
import com.web.TradeApp.feature.aibot.dto.BotSecretResponse;
import com.web.TradeApp.feature.aibot.model.Bot;

public interface BotService {
    BotSecretResponse createBot(BotCreateRequest request);

    BotResponse getBotForEdit(UUID botId, boolean includeStats);

    BotResponse.BotStats calculateStats(Bot bot);

    // New method for the list view
    List<BotResponse> getAllBots(boolean includeStats);

    BotResponse updateBot(UUID botId, BotCreateRequest request);

    void deleteBot(UUID botId);
}
