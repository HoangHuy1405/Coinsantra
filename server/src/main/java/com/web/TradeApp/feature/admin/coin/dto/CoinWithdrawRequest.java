package com.web.TradeApp.feature.admin.coin.dto;

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
public class CoinWithdrawRequest {
    @NotBlank
    private String coinGeckoId;
    @NotNull
    @DecimalMin(value = "0.00000001", message = "Withdraw quantity must be greater than zero")
    private BigDecimal quantity;
    private String note;
}
