package com.web.TradeApp.feature.coin.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.feature.coin.dto.BuyCoinRequest;
import com.web.TradeApp.feature.coin.dto.SellCoinRequest;
import com.web.TradeApp.feature.coin.dto.TradeResponse;
import com.web.TradeApp.feature.coin.service.TradeService;
import com.web.TradeApp.feature.common.Annotation.ApiMessage;
import com.web.TradeApp.utils.SecurityUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("trades")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    @PostMapping("/buy")
    @ApiMessage("Coin purchased successfully")
    public ResponseEntity<TradeResponse> buyCoin(@Valid @RequestBody BuyCoinRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        TradeResponse response = tradeService.buyCoin(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/sell")
    @ApiMessage("Coin sold successfully")
    public ResponseEntity<TradeResponse> sellCoin(@Valid @RequestBody SellCoinRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        TradeResponse response = tradeService.sellCoin(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
