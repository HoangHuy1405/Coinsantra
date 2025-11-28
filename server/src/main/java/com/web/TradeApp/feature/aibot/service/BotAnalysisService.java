package com.web.TradeApp.feature.aibot.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.web.TradeApp.feature.aibot.dto.BotMetricsDTO;

public interface BotAnalysisService {

    BotMetricsDTO getBotMetrics(UUID botId);

    List<BotMetricsDTO.PnlPoint> getPnlChart24h(UUID botId);

    BigDecimal calculatePnl24h(UUID botId);

    BigDecimal calculateRoi24h(UUID botId);
}
