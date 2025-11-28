package com.web.TradeApp.feature.aibot.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.feature.aibot.dto.BotCreateRequest;
import com.web.TradeApp.feature.aibot.dto.BotResponse;
import com.web.TradeApp.feature.aibot.dto.BotSecretResponse;
import com.web.TradeApp.feature.aibot.service.BotService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("admin/bots")
@RequiredArgsConstructor
public class BotAdminController {
    private final BotService botService;

    @PostMapping
    public ResponseEntity<BotSecretResponse> createBot(@Valid @RequestBody BotCreateRequest request) {
        BotSecretResponse response = botService.createBot(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BotResponse>> getAllBots(
            @RequestParam(name = "includeStats", defaultValue = "false") boolean includeStats) {
        List<BotResponse> response = botService.getAllBots(includeStats);
        return ResponseEntity.ok(response);
    }

    // GET /admin/bots/{id}?includeStats=true
    @GetMapping("/{botId}")
    public ResponseEntity<BotResponse> getBot(
            @PathVariable(name = "botId") UUID botId,
            @RequestParam(name = "includeStats", defaultValue = "false") boolean includeStats) {
        BotResponse response = botService.getBotForEdit(botId, includeStats);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{botId}")
    public ResponseEntity<BotResponse> updateBot(
            @PathVariable(name = "botId") UUID botId,
            @Valid @RequestBody BotCreateRequest request) {
        BotResponse response = botService.updateBot(botId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{botId}")
    public ResponseEntity<Void> deleteBot(
            @PathVariable(name = "botId") UUID botId) {
        botService.deleteBot(botId);
        return ResponseEntity.noContent().build();
    }
}
