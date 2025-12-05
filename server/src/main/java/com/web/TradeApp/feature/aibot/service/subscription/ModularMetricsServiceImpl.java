package com.web.TradeApp.feature.aibot.service.subscription;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.web.TradeApp.exception.IdInvalidException;
import com.web.TradeApp.feature.aibot.dto.Bot.BotDetailDTO;
import com.web.TradeApp.feature.aibot.dto.Bot.BotGridItemDTO;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.SubDetailsMetricsDTO;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.SubItemDTO;
import com.web.TradeApp.feature.aibot.model.Bot;
import com.web.TradeApp.feature.aibot.model.BotSubscription;
import com.web.TradeApp.feature.aibot.repository.BotRepository;
import com.web.TradeApp.feature.aibot.repository.BotSubscriptionRepository;
import com.web.TradeApp.feature.aibot.repository.SnapshotMetricsRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service tính toán metrics theo kiến trúc modular
 * Mỗi metric được tính bằng một query riêng biệt
 * Service layer tổng hợp kết quả lại thành DTO
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModularMetricsServiceImpl implements ModularMetricsService {

    private final SnapshotMetricsRepository metricsRepo;
    private final BotSubscriptionRepository subscriptionRepo;
    private final BotRepository botRepo;

    /**
     * Get bots list with pagination, search and sorting
     * 
     * @param timeframe  "current" | "1d" | "7d"
     * @param sortBy     "pnl" | "roi" | "copied"
     * @param searchName Bot name to search (optional)
     * @param pageable   Pagination info
     * @return Page of BotGridItemDTO
     */
    @Override
    public Page<BotGridItemDTO> getAllBotsWithPagination(
            String timeframe,
            String sortBy,
            String searchName,
            Pageable pageable) {

        Instant compareTime = getCompareTime(timeframe);

        // 1. Get all bots (can filter by name)
        List<Bot> allBots;
        if (searchName != null && !searchName.trim().isEmpty()) {
            Specification<Bot> spec = (root, query, cb) -> cb.like(cb.lower(root.get("name")),
                    "%" + searchName.toLowerCase() + "%");
            allBots = botRepo.findAll(spec);
        } else {
            allBots = botRepo.findAll();
        }

        // 2. Tính metrics cho từng bot (gọi nhiều queries riêng biệt)
        List<BotGridItemDTO> botGridItems = new ArrayList<>();
        for (Bot bot : allBots) {
            UUID botId = bot.getId();

            try {
                // Gọi từng query riêng để tính từng metric
                Long activeSubscribers = subscriptionRepo.countByBotIdAndActiveTrue(botId);
                BigDecimal totalPnl = metricsRepo.calcBotPnl(botId, compareTime);
                BigDecimal averageRoi = metricsRepo.calcBotRoi(botId, compareTime);
                BigDecimal maxDrawdown = metricsRepo.calcBotMaxDrawdown(botId);
                BigDecimal maxDrawdownPct = metricsRepo.calcBotMaxDrawdownPct(botId);
                BigDecimal totalInvestment = subscriptionRepo.calcBotTotalInvestment(botId);
                BigDecimal totalEquity = metricsRepo.calcBotTotalEquity(botId);

                // Tạo DTO
                BotGridItemDTO dto = BotGridItemDTO.builder()
                        .botId(botId.toString())
                        .name(bot.getName())
                        .coinSymbol(bot.getCoinSymbol())
                        .tradingPair(bot.getTradingPair())
                        .activeSubscribers(activeSubscribers != null ? activeSubscribers.intValue() : 0)
                        .totalPnl(totalPnl != null ? totalPnl : BigDecimal.ZERO)
                        .averageRoi(averageRoi != null ? averageRoi : BigDecimal.ZERO)
                        .maxDrawdown(maxDrawdown != null ? maxDrawdown : BigDecimal.ZERO)
                        .maxDrawdownPercent(maxDrawdownPct != null ? maxDrawdownPct : BigDecimal.ZERO)
                        .totalNetInvestment(totalInvestment != null ? totalInvestment : BigDecimal.ZERO)
                        .totalEquity(totalEquity != null ? totalEquity : BigDecimal.ZERO)
                        .build();

                botGridItems.add(dto);

            } catch (Exception e) {
                log.error("Error calculating metrics for bot {}: {}", botId, e.getMessage());
                // Skip bot nếu có lỗi
            }
        }

        // 3. Sorting
        List<BotGridItemDTO> sortedBots = sortBots(botGridItems, sortBy);

        // 4. Pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), sortedBots.size());

        if (start > sortedBots.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, sortedBots.size());
        }

        List<BotGridItemDTO> pageContent = sortedBots.subList(start, end);

        return new PageImpl<>(pageContent, pageable, sortedBots.size());
    }

    /**
     * Lấy metrics của một bot cụ thể
     */
    @Override
    public BotGridItemDTO getSingleBotMetrics(UUID botId, String timeframe) {
        Bot bot = botRepo.findById(botId)
                .orElseThrow(() -> new IdInvalidException("Bot not found: " + botId));

        Instant compareTime = getCompareTime(timeframe);

        Long activeSubscribers = subscriptionRepo.countByBotIdAndActiveTrue(botId);
        BigDecimal totalPnl = metricsRepo.calcBotPnl(botId, compareTime);
        BigDecimal averageRoi = metricsRepo.calcBotRoi(botId, compareTime);
        BigDecimal maxDrawdown = metricsRepo.calcBotMaxDrawdown(botId);
        BigDecimal maxDrawdownPct = metricsRepo.calcBotMaxDrawdownPct(botId);
        BigDecimal totalInvestment = subscriptionRepo.calcBotTotalInvestment(botId);
        BigDecimal totalEquity = metricsRepo.calcBotTotalEquity(botId);

        return BotGridItemDTO.builder()
                .botId(botId.toString())
                .name(bot.getName())
                .coinSymbol(bot.getCoinSymbol())
                .tradingPair(bot.getTradingPair())
                .activeSubscribers(activeSubscribers != null ? activeSubscribers.intValue() : 0)
                .totalPnl(totalPnl != null ? totalPnl : BigDecimal.ZERO)
                .averageRoi(averageRoi != null ? averageRoi : BigDecimal.ZERO)
                .maxDrawdown(maxDrawdown != null ? maxDrawdown : BigDecimal.ZERO)
                .maxDrawdownPercent(maxDrawdownPct != null ? maxDrawdownPct : BigDecimal.ZERO)
                .totalNetInvestment(totalInvestment != null ? totalInvestment : BigDecimal.ZERO)
                .totalEquity(totalEquity != null ? totalEquity : BigDecimal.ZERO)
                .build();
    }

    /**
     * Get all subscriptions for a user with pagination and sorting
     */
    @Override
    public Page<SubItemDTO> getAllUserSubscriptions(
            UUID userId,
            String sortBy,
            Pageable pageable) {

        List<BotSubscription> subscriptions = subscriptionRepo.findAllByUserId(userId);

        List<SubItemDTO> subItems = new ArrayList<>();
        for (BotSubscription sub : subscriptions) {
            try {
                Bot bot = sub.getBot();

                // Get latest metrics from snapshot
                BigDecimal totalEquity = metricsRepo.getLatestTotalEquity(sub.getId());
                BigDecimal pnl = metricsRepo.calcSubPnl(sub.getId(), Instant.EPOCH); // All-time PnL

                SubItemDTO dto = SubItemDTO.builder()
                        .subscriptionId(sub.getId().toString())
                        .botName(bot.getName())
                        .tradingPair(
                                bot.getTradingPair() != null ? bot.getTradingPair() : bot.getCoinSymbol() + "/USDT")
                        .coin(bot.getCoinSymbol())
                        .isActive(sub.isActive())
                        .totalEquity(totalEquity != null ? totalEquity : BigDecimal.ZERO)
                        .pnl(pnl != null ? pnl : BigDecimal.ZERO)
                        .build();

                subItems.add(dto);
            } catch (Exception e) {
                log.error("Error building SubItemDTO for subscription {}: {}", sub.getId(), e.getMessage());
            }
        }

        // 3. Sort
        List<SubItemDTO> sortedSubs = sortSubscriptions(subItems, sortBy);

        // 4. Pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), sortedSubs.size());

        if (start > sortedSubs.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, sortedSubs.size());
        }

        List<SubItemDTO> pageContent = sortedSubs.subList(start, end);
        return new PageImpl<>(pageContent, pageable, sortedSubs.size());
    }

    /**
     * Get detailed metrics of subscription with chart data
     */
    @Override
    public SubDetailsMetricsDTO getSubscriptionMetrics(UUID subscriptionId, String timeframe) {
        // 1. Get subscription entity
        BotSubscription subscription = subscriptionRepo.findById(subscriptionId)
                .orElseThrow(() -> new IdInvalidException("Subscription not found: " + subscriptionId));

        Bot bot = subscription.getBot();
        Instant compareTime = getCompareTime(timeframe);

        // 2. Calculate metrics
        BigDecimal pnl = metricsRepo.calcSubPnl(subscriptionId, compareTime);
        BigDecimal roi = metricsRepo.calcSubRoi(subscriptionId, compareTime);
        BigDecimal maxDrawdown = metricsRepo.calcSubMaxDrawdown(subscriptionId);
        BigDecimal maxDrawdownPct = metricsRepo.calcSubMaxDrawdownPct(subscriptionId);
        BigDecimal netInvestment = metricsRepo.getLatestNetInvestment(subscriptionId);
        BigDecimal totalEquity = metricsRepo.getLatestTotalEquity(subscriptionId);

        // 3. Get chart data
        List<Object[]> rawChartData = metricsRepo.getSubscriptionChartData(subscriptionId, compareTime);
        List<SubDetailsMetricsDTO.SubChartDataPoint> chartData = rawChartData.stream()
                .map(row -> {
                    Instant timestamp = row[0] instanceof java.sql.Timestamp
                            ? ((java.sql.Timestamp) row[0]).toInstant()
                            : (Instant) row[0];

                    return SubDetailsMetricsDTO.SubChartDataPoint.builder()
                            .timestamp(timestamp)
                            .pnl((BigDecimal) row[1])
                            .build();
                })
                .collect(Collectors.toList());

        // 4. Build detailed DTO
        return SubDetailsMetricsDTO.builder()
                .subscriptionId(subscriptionId.toString())
                .userId(subscription.getUserId().toString())
                .botId(bot.getId().toString())
                .botName(bot.getName())
                .tradingPair(bot.getTradingPair() != null ? bot.getTradingPair() : bot.getCoinSymbol() + "/USDT")
                .coin(bot.getCoinSymbol())
                .isActive(subscription.isActive())
                .netInvestment(netInvestment != null ? netInvestment : BigDecimal.ZERO)
                .totalEquity(totalEquity != null ? totalEquity : BigDecimal.ZERO)
                .pnl(pnl != null ? pnl : BigDecimal.ZERO)
                .roi(roi != null ? roi : BigDecimal.ZERO)
                .maxDrawdown(maxDrawdown != null ? maxDrawdown : BigDecimal.ZERO)
                .maxDrawdownPercent(maxDrawdownPct != null ? maxDrawdownPct : BigDecimal.ZERO)
                .botWalletBalance(subscription.getBotWalletBalance())
                .botWalletCoin(subscription.getBotWalletCoin())
                .tradePercentage(subscription.getTradePercentage())
                .maxDailyLossPercentage(subscription.getMaxDailyLossPercentage())
                .chartData(chartData)
                .build();
    }

    /**
     * Get bot detail with chart data for detail page
     * 
     * @param botId     Bot UUID
     * @param timeframe "1d" | "7d" for chart data
     * @return BotDetailDTO with metrics and chart data
     */
    @Override
    public BotDetailDTO getBotDetailWithChart(
            UUID botId,
            String timeframe) {

        Bot bot = botRepo.findById(botId)
                .orElseThrow(() -> new IdInvalidException("Bot not found with id: " + botId));

        Instant compareTime = getCompareTime(timeframe);

        // 1. Tính các metrics (reuse existing queries)
        Long activeSubscribers = subscriptionRepo.countByBotIdAndActiveTrue(botId);
        BigDecimal totalPnl = metricsRepo.calcBotPnl(botId, compareTime);
        BigDecimal averageRoi = metricsRepo.calcBotRoi(botId, compareTime);
        BigDecimal maxDrawdown = metricsRepo.calcBotMaxDrawdown(botId);
        BigDecimal maxDrawdownPct = metricsRepo.calcBotMaxDrawdownPct(botId);
        BigDecimal totalNetInvestment = subscriptionRepo.calcBotTotalInvestment(botId);
        BigDecimal totalEquity = metricsRepo.calcBotTotalEquity(botId);

        // 2. Lấy chart data
        List<Object[]> rawChartData = metricsRepo.getBotChartData(botId, compareTime);
        List<com.web.TradeApp.feature.aibot.dto.Bot.ChartDataPoint> chartData = rawChartData.stream()
                .map(row -> {
                    // Handle different timestamp types from database
                    Instant timestamp;
                    if (row[0] instanceof String) {
                        // repository query DATE_FORMAT returns String - parse it back to Instant
                        String dateStr = (String) row[0];
                        timestamp = java.time.LocalDateTime
                                .parse(dateStr, java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                                .atZone(java.time.ZoneId.systemDefault())
                                .toInstant();
                    } else if (row[0] instanceof java.sql.Timestamp) {
                        timestamp = ((java.sql.Timestamp) row[0]).toInstant();
                    } else {
                        timestamp = (Instant) row[0];
                    }

                    return com.web.TradeApp.feature.aibot.dto.Bot.ChartDataPoint.builder()
                            .timestamp(timestamp)
                            .totalPnl((BigDecimal) row[1])
                            .build();
                })
                .collect(Collectors.toList());

        return BotDetailDTO.builder()
                .botId(botId.toString())
                .name(bot.getName())
                .description(bot.getDescription())
                .coinSymbol(bot.getCoinSymbol())
                .tradingPair(bot.getTradingPair() != null ? bot.getTradingPair() : bot.getCoinSymbol() + "/USDT")
                .riskLevel(bot.getRiskLevel() != null ? bot.getRiskLevel().name() : null)
                .category(bot.getCategory() != null ? bot.getCategory().name() : null)
                .status(bot.getStatus() != null ? bot.getStatus().name() : null)
                .fee(bot.getFee() != null ? bot.getFee() : BigDecimal.ZERO)
                .activeSubscribers(activeSubscribers != null ? activeSubscribers.intValue() : 0)
                .totalPnl(totalPnl != null ? totalPnl : BigDecimal.ZERO)
                .averageRoi(averageRoi != null ? averageRoi : BigDecimal.ZERO)
                .maxDrawdown(maxDrawdown != null ? maxDrawdown : BigDecimal.ZERO)
                .maxDrawdownPercent(maxDrawdownPct != null ? maxDrawdownPct : BigDecimal.ZERO)
                .totalNetInvestment(totalNetInvestment != null ? totalNetInvestment : BigDecimal.ZERO)
                .totalEquity(totalEquity != null ? totalEquity : BigDecimal.ZERO)
                .chartData(chartData)
                .build();
    }

    private List<BotGridItemDTO> sortBots(List<BotGridItemDTO> bots, String sortBy) {
        return switch (sortBy.toLowerCase()) {
            case "pnl" -> bots.stream()
                    .sorted(Comparator.comparing(BotGridItemDTO::getTotalPnl).reversed())
                    .collect(Collectors.toList());
            case "roi" -> bots.stream()
                    .sorted(Comparator.comparing(BotGridItemDTO::getAverageRoi).reversed())
                    .collect(Collectors.toList());
            case "copied" -> bots.stream()
                    .sorted(Comparator.comparing(BotGridItemDTO::getActiveSubscribers).reversed())
                    .collect(Collectors.toList());
            default -> bots; // No sorting
        };
    }

    private List<SubItemDTO> sortSubscriptions(List<SubItemDTO> subs, String sortBy) {
        return switch (sortBy.toLowerCase()) {
            case "pnl" -> subs.stream()
                    .sorted(Comparator.comparing(SubItemDTO::getPnl).reversed())
                    .collect(Collectors.toList());
            case "equity" -> subs.stream()
                    .sorted(Comparator.comparing(SubItemDTO::getTotalEquity).reversed())
                    .collect(Collectors.toList());
            case "bot" -> subs.stream()
                    .sorted(Comparator.comparing(SubItemDTO::getBotName))
                    .collect(Collectors.toList());
            default -> subs; // No sorting
        };
    }

    private Instant getCompareTime(String timeframe) {
        return switch (timeframe.toLowerCase()) {
            case "1d" -> Instant.now().minus(1, ChronoUnit.DAYS);
            case "7d" -> Instant.now().minus(7, ChronoUnit.DAYS);
            case "current" -> Instant.EPOCH;
            default -> throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        };
    }

}
