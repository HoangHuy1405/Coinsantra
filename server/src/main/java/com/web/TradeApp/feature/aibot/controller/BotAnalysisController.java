package com.web.TradeApp.feature.aibot.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.feature.aibot.dto.BotMetricsDTO;
import com.web.TradeApp.feature.aibot.service.BotAnalysisService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("bots")
@RequiredArgsConstructor
public class BotAnalysisController {

    private final BotAnalysisService botService;

    @GetMapping("/{botId}/metrics")
    public BotMetricsDTO getMetrics(@PathVariable UUID botId) {
        return botService.getBotMetrics(botId);
    }

    @GetMapping("/{botId}/pnl-chart-24h")
    public List<BotMetricsDTO.PnlPoint> getPnlChart(@PathVariable UUID botId) {
        return botService.getPnlChart24h(botId);
    }
}
