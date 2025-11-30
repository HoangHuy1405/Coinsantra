package com.web.TradeApp.feature.aibot.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import com.web.TradeApp.feature.aibot.dto.Bot.BotGridItemDTO;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.SubscriptionMetrics;
import com.web.TradeApp.feature.aibot.service.subscription.ModularMetricsServiceImpl;
import com.web.TradeApp.feature.common.Annotation.ApiMessage;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;

import lombok.RequiredArgsConstructor;

/**
 * Controller for bot and subscription metrics với kiến trúc modular
 * Hỗ trợ: pagination, search, sorting, timeframe filtering
 */
@RestController
@RequestMapping("metrics")
@RequiredArgsConstructor
public class BotMetricsController {

    private final ModularMetricsServiceImpl pnlService;

    /**
     * Get all bots metrics với pagination, search và sorting
     * 
     * @param timeframe "current" | "1d" | "7d" (default: current)
     * @param sortBy    "pnl" | "roi" | "copied" (default: pnl)
     * @param search    Search by bot name (optional)
     * @param pageable  Pagination params (page, size)
     * @return Paginated bot grid items
     * 
     *         Examples:
     *         - GET /metrics/bots?timeframe=1d&sortBy=pnl&page=0&size=10
     *         - GET /metrics/bots?timeframe=7d&sortBy=roi&search=BTC&page=0&size=20
     *         - GET /metrics/bots?sortBy=copied
     */
    @GetMapping("/bots")
    @ApiMessage("Bots metrics fetched successfully")
    public ResponseEntity<ResultPaginationResponse> getAllBotsWithPagination(
            @RequestParam(defaultValue = "current") String timeframe,
            @RequestParam(defaultValue = "pnl") String sortBy,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, page = 0) Pageable pageable) {

        Page<BotGridItemDTO> botsPage = pnlService.getAllBotsWithPagination(
                timeframe, sortBy, search, pageable);

        ResultPaginationResponse response = new ResultPaginationResponse();
        ResultPaginationResponse.PageMeta meta = new ResultPaginationResponse.PageMeta();
        meta.setPage(botsPage.getNumber() + 1);
        meta.setPageSize(botsPage.getSize());
        meta.setPages(botsPage.getTotalPages());
        meta.setTotal(botsPage.getTotalElements());

        response.setMeta(meta);
        response.setResult(botsPage.getContent());

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * Get single bot metrics
     * 
     * @param botId     Bot UUID
     * @param timeframe "current" | "1d" | "7d"
     * @return Bot metrics
     * 
     *         Example: GET /metrics/bots/{botId}?timeframe=7d
     */
    @GetMapping("/bots/{botId}")
    @ApiMessage("Bot metrics fetched successfully")
    public ResponseEntity<BotGridItemDTO> getBotMetrics(
            @PathVariable UUID botId,
            @RequestParam(defaultValue = "current") String timeframe) {

        BotGridItemDTO metrics = pnlService.getSingleBotMetrics(botId, timeframe);
        return ResponseEntity.status(HttpStatus.OK).body(metrics);
    }

    /**
     * Get bot detail with chart data for detail page
     * 
     * @param botId     Bot UUID
     * @param timeframe "1d" | "7d" (default: 7d) - determines chart data range
     * @return Bot detail with metrics and chart data points
     * 
     *         Example: GET /metrics/bots/{botId}/detail?timeframe=7d
     */
    @GetMapping("/bots/{botId}/detail")
    @ApiMessage("Bot detail with chart data fetched successfully")
    public ResponseEntity<com.web.TradeApp.feature.aibot.dto.Bot.BotDetailDTO> getBotDetailWithChart(
            @PathVariable UUID botId,
            @RequestParam(defaultValue = "7d") String timeframe) {

        com.web.TradeApp.feature.aibot.dto.Bot.BotDetailDTO detail = pnlService.getBotDetailWithChart(botId, timeframe);
        return ResponseEntity.status(HttpStatus.OK).body(detail);
    }

    /**
     * Get subscription metrics for detail page
     * 
     * @param subscriptionId Subscription UUID
     * @param timeframe      "current" (default) | "1d" | "7d"
     * @return Subscription metrics
     * 
     *         Example: GET
     *         /api/metrics/subscriptions/{subscriptionId}?timeframe=current
     */
    @GetMapping("/subscriptions/{subscriptionId}")
    @ApiMessage("Subscription metrics fetched successfully")
    public ResponseEntity<SubscriptionMetrics> getSubscriptionMetrics(
            @PathVariable UUID subscriptionId,
            @RequestParam(defaultValue = "current") String timeframe) {

        SubscriptionMetrics metrics = pnlService.getSubscriptionMetrics(subscriptionId, timeframe);
        return ResponseEntity.status(HttpStatus.OK).body(metrics);
    }
}
