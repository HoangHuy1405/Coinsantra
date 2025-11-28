package com.web.TradeApp.feature.coin.service;

import java.util.UUID;

import com.web.TradeApp.feature.coin.dto.BuyCoinRequest;
import com.web.TradeApp.feature.coin.dto.SellCoinRequest;
import com.web.TradeApp.feature.coin.dto.TradeResponse;

public interface TradeService {
    /**
     * Execute a buy order for a user
     * 
     * @param userId  User ID
     * @param request Buy request containing coin symbol and quantity
     * @return Trade response with transaction details
     */
    TradeResponse buyCoin(UUID userId, BuyCoinRequest request);

    /**
     * Execute a sell order for a user
     * 
     * @param userId  User ID
     * @param request Sell request containing coin symbol and quantity
     * @return Trade response with transaction details
     */
    TradeResponse sellCoin(UUID userId, SellCoinRequest request);
}
