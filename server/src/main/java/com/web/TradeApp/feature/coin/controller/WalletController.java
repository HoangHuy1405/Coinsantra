package com.web.TradeApp.feature.coin.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.feature.coin.dto.AssetResponse;
import com.web.TradeApp.feature.coin.service.WalletService;
import com.web.TradeApp.utils.SecurityUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("wallet")
@RequiredArgsConstructor
public class WalletController {
    private final WalletService walletService;

    @GetMapping("/assets")
    public ResponseEntity<AssetResponse> getAssetTotal() {
        UUID userId = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
        AssetResponse assetSummary = walletService.getAssetTotal(userId);
        return ResponseEntity.ok(assetSummary);
    }
}
