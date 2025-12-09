package com.web.TradeApp.feature.coin.service;

import java.util.UUID;

import com.web.TradeApp.feature.coin.dto.AssetResponse;

public interface WalletService {
    AssetResponse getAssetTotal(UUID userId);
}
