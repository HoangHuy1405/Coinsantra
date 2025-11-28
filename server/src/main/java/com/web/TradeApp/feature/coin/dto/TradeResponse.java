package com.web.TradeApp.feature.coin.dto;

import java.math.BigDecimal;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeResponse {

    private String transactionId;
    private String tradeType; // BUY or SELL
    private String coinSymbol;
    private String coinName;
    private BigDecimal quantity;
    private BigDecimal priceAtExecution;
    private BigDecimal notionalValue;
    private BigDecimal feeApplied;
    private BigDecimal totalCost; // For BUY: notionalValue + fee; For SELL: notionalValue - fee
    private BigDecimal newWalletBalance;
    private BigDecimal newCoinHolding;
    private Instant timestamp;
}
