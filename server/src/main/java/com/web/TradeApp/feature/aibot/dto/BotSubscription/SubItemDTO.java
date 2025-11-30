package com.web.TradeApp.feature.aibot.dto.BotSubscription;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubItemDTO {
    private String subscriptionId;
    private String botName;
    private String tradingPair;
    private String coin;
    private boolean isActive;
    private BigDecimal totalEquity;
    private BigDecimal pnl;
}
