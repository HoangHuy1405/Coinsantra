package com.web.TradeApp.feature.aibot.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.web.TradeApp.feature.aibot.dto.BotMetricsDTO;
import com.web.TradeApp.feature.aibot.model.BotTrade;
import com.web.TradeApp.feature.aibot.repository.BotRepository;
import com.web.TradeApp.feature.aibot.repository.BotSignalRepository;
import com.web.TradeApp.feature.aibot.repository.BotSubscriptionRepository;
import com.web.TradeApp.feature.aibot.repository.BotTradeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BotAnalysisServiceImpl implements BotAnalysisService {

    private final BotRepository botRepository;
    private final BotTradeRepository tradeRepository;
    private final BotSignalRepository signalRepository;
    private final BotSubscriptionRepository subscriptionRepository;

    @Override
    public BotMetricsDTO getBotMetrics(UUID botId) {

        botRepository.findById(botId)
                .orElseThrow(() -> new RuntimeException("Bot not found"));

        BigDecimal pnl24h = calculatePnl24h(botId);
        BigDecimal roi24h = calculateRoi24h(botId);
        long subs = subscriptionRepository.countActiveSubscribers(botId);
        Instant lastSignal = signalRepository.findLastSignalTime(botId);
        List<BotMetricsDTO.PnlPoint> chart = getPnlChart24h(botId);

        return new BotMetricsDTO(
                botId,
                pnl24h,
                roi24h,
                subs,
                lastSignal,
                chart);
    }

    @Override
    public BigDecimal calculatePnl24h(UUID botId) {
        Instant from = Instant.now().minus(Duration.ofHours(24));
        return new BigDecimal(tradeRepository.sumRealizedPnlSince(botId, from));
    }

    @Override
    public BigDecimal calculateRoi24h(UUID botId) {
        // 1. Fetch allocated capital as Double (since repo returns Double)
        Double allocatedDouble = subscriptionRepository.sumAllocatedCapital(botId);
        // 2. Convert to BigDecimal safely, handling Nulls
        BigDecimal allocated = (allocatedDouble != null) ? BigDecimal.valueOf(allocatedDouble) : BigDecimal.ZERO;
        BigDecimal pnl24h = calculatePnl24h(botId);
        if (pnl24h == null) {
            pnl24h = BigDecimal.ZERO;
        }
        // 3. Prevent Division by Zero
        if (allocated.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        // 4. Perform Calculation: (PnL / Allocated) * 100
        return pnl24h.divide(allocated, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    @Override
    public List<BotMetricsDTO.PnlPoint> getPnlChart24h(UUID botId) {

        Instant from = Instant.now().minus(Duration.ofHours(24));

        List<BotTrade> trades = tradeRepository.findTradesSince(botId, from);

        List<BotMetricsDTO.PnlPoint> points = new ArrayList<>();

        BigDecimal cumulative = new BigDecimal(0);

        for (BotTrade trade : trades) {
            cumulative.add(trade.getPnl());
            points.add(new BotMetricsDTO.PnlPoint(trade.getCreatedAt(), cumulative));
        }

        return points;
    }
}
