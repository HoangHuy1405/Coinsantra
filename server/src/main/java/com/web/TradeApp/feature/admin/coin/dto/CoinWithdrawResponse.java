package com.web.TradeApp.feature.admin.coin.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoinWithdrawResponse {
    private UUID id;
    private String coinGeckoId;
    private BigDecimal withdrewQuantity;
    private BigDecimal newQuantity;
}
