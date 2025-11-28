package com.web.TradeApp.feature.aibot.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BotMetricsDTO {
    private UUID botId;
    private BigDecimal pnl24h;
    private BigDecimal roi24h;
    private long copyingUsers;
    private Instant lastSignalAt;
    private List<PnlPoint> pnlChart24h;

    @Data
    @AllArgsConstructor
    public static class PnlPoint {
        private Instant time;
        private BigDecimal pnl;
    }
}
