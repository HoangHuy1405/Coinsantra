package com.web.TradeApp.feature.history.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.web.TradeApp.feature.common.entity.BaseTrade.TradeType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionHistoryResponse {
    private UUID id;
    private Instant createdAt;
    private TradeType type;

    // Coin info (no circular reference)
    private String coinName;
    private String coinSymbol;
    private String coinGeckoId;

    // Trade details
    private BigDecimal quantity;
    private BigDecimal priceAtExecution;
    private BigDecimal notionalValue;
    private BigDecimal feeTradeApplied;
}
