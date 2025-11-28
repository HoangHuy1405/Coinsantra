package com.web.TradeApp.feature.coin.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoinDepositRequest {
    @NotBlank
    private String coinGeckoId; // FE sẽ lấy từ CoinGecko API

    @NotBlank
    private String name; // optional nhưng nên gửi để tạo mới coin
    @NotBlank
    private String symbol;

    @NotNull
    @DecimalMin(value = "0.00000001", message = "Deposit quantity must be greater than zero")
    private BigDecimal quantity;

    private String note;
}
