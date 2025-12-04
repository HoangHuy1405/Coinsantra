package com.web.TradeApp.feature.coin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetResponse {
    // Wallet basic info
    private BigDecimal balance;
    private List<CoinHoldingDTO> coinHoldings;

    // Performance metrics
    private BigDecimal totalEquity; // Current total value (balance + coins)
    private BigDecimal netInvestment; // Total invested amount
    private BigDecimal pnl; // Profit/Loss (totalEquity - netInvestment)
    private BigDecimal roi; // Return on Investment %
    private BigDecimal maxDrawdown; // Maximum loss ever recorded
    private BigDecimal maxDrawdownPct; // Maximum loss % ever recorded

    // Chart data for frontend visualization
    private List<ChartDataPoint> pnlChartData;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoinHoldingDTO {
        private String coinSymbol;
        private String coinName;
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChartDataPoint {
        private Instant timestamp;
        private BigDecimal value; // PnL value at this timestamp
    }
}
