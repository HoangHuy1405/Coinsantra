package com.web.TradeApp.feature.aibot.dto.BotSubscription;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BotSubOverviewDTO {
    // Total subscription counts
    private Long totalActive;
    private Long totalInactive;

    // Random featured subscription (optional - null if no subscriptions)
    private FeaturedSubscription featuredSubscription;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeaturedSubscription {
        private UUID subscriptionId;
        private String botName;
        private BigDecimal pnl;
        private BigDecimal roi;
        private BigDecimal maxDrawdown;
    }
}
