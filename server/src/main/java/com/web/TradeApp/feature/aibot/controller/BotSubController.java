package com.web.TradeApp.feature.aibot.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotCopyRequest;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotSubscriptionResponse;
import com.web.TradeApp.feature.aibot.service.BotSubscriptionService;
import com.web.TradeApp.feature.common.Annotation.ApiMessage;
import com.web.TradeApp.utils.SecurityUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("bot-sub")
@RequiredArgsConstructor
public class BotSubController {
    private final BotSubscriptionService botSubService;

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
            @Valid @RequestBody BotCopyRequest request) {
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
}
