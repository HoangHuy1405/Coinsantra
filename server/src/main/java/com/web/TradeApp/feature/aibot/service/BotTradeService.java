package com.web.TradeApp.feature.aibot.service;

import java.math.BigDecimal;

import com.web.TradeApp.feature.aibot.model.BotSubscription;

public interface BotTradeService {
    void executeBuy(BotSubscription sub, BigDecimal price);

    void executeSell(BotSubscription sub, BigDecimal price);
}
