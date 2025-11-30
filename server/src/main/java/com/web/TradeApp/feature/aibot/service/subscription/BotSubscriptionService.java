package com.web.TradeApp.feature.aibot.service.subscription;

import java.util.UUID;

import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotCopyRequest;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotSubscriptionResponse;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotUpdateRequest;
import com.web.TradeApp.feature.aibot.model.BotSignal;
import com.web.TradeApp.feature.ingestion.event.SignalReceivedEvent;

public interface BotSubscriptionService {

    void onSignalReceived(SignalReceivedEvent event);

    // process all subscription based on BotSignal
    void processSubscriptions(BotSignal signal);

    BotSubscriptionResponse copyBot(UUID userId, BotCopyRequest request);

    BotSubscriptionResponse updateBotSub(UUID botSubId, UUID userId, BotUpdateRequest request);

    BotSubscriptionResponse toggleSubscription(UUID botSubId, UUID userId, boolean active);

}
