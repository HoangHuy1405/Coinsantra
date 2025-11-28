package com.web.TradeApp.feature.aibot.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;
import com.web.TradeApp.feature.aibot.model.Bot;
import com.web.TradeApp.feature.aibot.service.BotUserService;
import com.web.TradeApp.feature.common.Annotation.ApiMessage;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("bots")
@RequiredArgsConstructor
public class BotUserController {
    private final BotUserService botService;

    @GetMapping
    @ApiMessage("Bots fetched successfully")
    public ResponseEntity<ResultPaginationResponse> fetchBots(
            @Filter Specification<Bot> spec,
            Pageable pageable) {
        ResultPaginationResponse result = botService.getAllBotsForUser(spec, pageable);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }
}
