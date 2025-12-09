package com.web.TradeApp.feature.aibot.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.exception.IdInvalidException;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotCopyRequest;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotSubOverviewDTO;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotSubscriptionResponse;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotUpdateRequest;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.SubDetailsMetricsDTO;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.SubItemDTO;
import com.web.TradeApp.feature.aibot.service.subscription.BotSubscriptionService;
import com.web.TradeApp.feature.aibot.service.subscription.ModularMetricsService;
import com.web.TradeApp.feature.common.Annotation.ApiMessage;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse.PageMeta;
import com.web.TradeApp.utils.SecurityUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/bot-sub")
@RequiredArgsConstructor
public class BotSubController {
    private final BotSubscriptionService botSubService;
    private final ModularMetricsService metricsService;

    @PostMapping
    @ApiMessage("Bot copied successfully")
    public ResponseEntity<BotSubscriptionResponse> copyBot(
            @Valid @RequestBody BotCopyRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId().isPresent() ? SecurityUtil.getCurrentUserId().get() : null;

        BotSubscriptionResponse response = botSubService.copyBot(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{botSubId}")
    @ApiMessage("Bot config updated successfully")
    public ResponseEntity<BotSubscriptionResponse> updateBotSub(
            @PathVariable(name = "botSubId") UUID botId,
            @Valid @RequestBody BotUpdateRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId().isPresent() ? SecurityUtil.getCurrentUserId().get() : null;

        BotSubscriptionResponse response = botSubService.updateBotSub(botId, userId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{botSubId}/status")
    @ApiMessage("Toggle bot successfully")
    public ResponseEntity<BotSubscriptionResponse> toggleSubscription(
            @PathVariable(name = "botSubId") UUID botSubId,
            @RequestParam(name = "active") boolean active) {
        UUID userId = SecurityUtil.getCurrentUserId().isPresent() ? SecurityUtil.getCurrentUserId().get() : null;
        BotSubscriptionResponse response = botSubService.toggleSubscription(botSubId, userId, active);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @ApiMessage("Get user subscriptions successfully")
    public ResponseEntity<ResultPaginationResponse> getAllSubscriptions(
            @RequestParam(name = "sortBy", defaultValue = "pnl") String sortBy,
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        UUID userId = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        Page<SubItemDTO> subscriptions = metricsService.getAllUserSubscriptions(userId, sortBy, pageable);

        // Build simple pagination response
        ResultPaginationResponse response = new ResultPaginationResponse();
        PageMeta meta = new PageMeta();
        meta.setPage(pageable.getPageNumber());
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(subscriptions.getTotalPages());
        meta.setTotal(subscriptions.getTotalElements());

        response.setMeta(meta);
        response.setResult(subscriptions.getContent());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/overview")
    @ApiMessage("Get overview of bot subscriptions successfully")
    public ResponseEntity<BotSubOverviewDTO> getOverviewBotSubscriptions() {
        UUID userId = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new IdInvalidException("User not authenticated"));

        BotSubOverviewDTO overview = metricsService
                .getUserBotSubscriptionOverview(userId);
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/{subId}")
    @ApiMessage("Get subscription details successfully")
    public ResponseEntity<SubDetailsMetricsDTO> getSubscriptionDetails(
            @PathVariable UUID subId,
            @RequestParam(name = "timeframe", defaultValue = "current") String timeframe) {
        // Verify authentication
        SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new IdInvalidException("User not authenticated"));

        SubDetailsMetricsDTO details = metricsService.getSubscriptionMetrics(subId, timeframe);
        return ResponseEntity.ok(details);
    }
}
