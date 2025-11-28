package com.web.TradeApp.feature.coin.dto;

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
public class CoinInfoResponse {
    private UUID id; // FE sẽ lấy từ CoinGecko API
    private String coinGeckoId; // FE sẽ lấy từ CoinGecko API
    private String name;
    private String symbol;
    private BigDecimal quantity;
    private BigDecimal fee;
}
