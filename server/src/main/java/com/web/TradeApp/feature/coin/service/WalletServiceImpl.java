package com.web.TradeApp.feature.coin.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.web.TradeApp.feature.coin.dto.AssetResponse;
import com.web.TradeApp.feature.coin.entity.Wallet;
import com.web.TradeApp.feature.coin.entity.WalletSnapshot;
import com.web.TradeApp.feature.coin.repository.WalletRepository;
import com.web.TradeApp.feature.coin.repository.WalletSnapshotRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletServiceImpl implements WalletService {
        private final WalletRepository walletRepository;
        private final WalletSnapshotRepository walletSnapshotRepository;

        @Override
        public AssetResponse getAssetTotal(UUID userId) {
                Wallet wallet = walletRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

                // Get latest snapshot data for performance metrics
                WalletSnapshot latestSnapshot = walletSnapshotRepository.getLatestSnapshot(wallet.getId());

                // Calculate timeframe for metrics (30 days ago)
                Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

                // Calculate PnL (last 30 days)
                BigDecimal pnl = calculatePnl(wallet.getId(), thirtyDaysAgo);

                // Calculate ROI (last 30 days)
                BigDecimal roi = calculateRoi(wallet.getId(), thirtyDaysAgo);

                // Calculate Max Drawdown (all-time)
                BigDecimal maxDrawdown = calculateMaxDrawdown(wallet.getId());
                BigDecimal maxDrawdownPct = calculateMaxDrawdownPct(wallet.getId());

                // Get chart data (last 30 days)
                List<AssetResponse.ChartDataPoint> chartData = getChartData(wallet.getId(), thirtyDaysAgo);

                // Build response
                AssetResponse asset = AssetResponse.builder()
                                .balance(wallet.getBalance())
                                .coinHoldings(wallet.getCoinHoldings().stream()
                                                .map(holding -> AssetResponse.CoinHoldingDTO.builder()
                                                                .coinSymbol(holding.getCoin().getSymbol())
                                                                .coinName(holding.getCoin().getName())
                                                                .amount(holding.getAmount())
                                                                .build())
                                                .collect(Collectors.toList()))
                                // Performance metrics from latest snapshot
                                .totalEquity(latestSnapshot != null ? latestSnapshot.getTotalEquity() : BigDecimal.ZERO)
                                .netInvestment(latestSnapshot != null ? latestSnapshot.getNetInvestment()
                                                : BigDecimal.ZERO)
                                .pnl(pnl)
                                .roi(roi)
                                .maxDrawdown(maxDrawdown)
                                .maxDrawdownPct(maxDrawdownPct)
                                .pnlChartData(chartData)
                                .build();

                return asset;
        }

        /**
         * Calculate PnL for the given timeframe
         */
        private BigDecimal calculatePnl(UUID walletId, Instant compareTime) {
                try {
                        BigDecimal pnl = walletSnapshotRepository.calcWalletPnl(walletId, compareTime);
                        return pnl != null ? pnl : BigDecimal.ZERO;
                } catch (Exception e) {
                        log.warn("Failed to calculate PnL for wallet {}: {}", walletId, e.getMessage());
                        return BigDecimal.ZERO;
                }
        }

        /**
         * Calculate ROI for the given timeframe
         */
        private BigDecimal calculateRoi(UUID walletId, Instant compareTime) {
                try {
                        BigDecimal roi = walletSnapshotRepository.calcWalletRoi(walletId, compareTime);
                        return roi != null ? roi : BigDecimal.ZERO;
                } catch (Exception e) {
                        log.warn("Failed to calculate ROI for wallet {}: {}", walletId, e.getMessage());
                        return BigDecimal.ZERO;
                }
        }

        /**
         * Calculate Max Drawdown (all-time)
         */
        private BigDecimal calculateMaxDrawdown(UUID walletId) {
                try {
                        BigDecimal maxDD = walletSnapshotRepository.calcWalletMaxDrawdown(walletId);
                        return maxDD != null ? maxDD : BigDecimal.ZERO;
                } catch (Exception e) {
                        log.warn("Failed to calculate Max Drawdown for wallet {}: {}", walletId, e.getMessage());
                        return BigDecimal.ZERO;
                }
        }

        /**
         * Calculate Max Drawdown Percentage (all-time)
         */
        private BigDecimal calculateMaxDrawdownPct(UUID walletId) {
                try {
                        BigDecimal maxDDPct = walletSnapshotRepository.calcWalletMaxDrawdownPct(walletId);
                        return maxDDPct != null ? maxDDPct : BigDecimal.ZERO;
                } catch (Exception e) {
                        log.warn("Failed to calculate Max Drawdown % for wallet {}: {}", walletId, e.getMessage());
                        return BigDecimal.ZERO;
                }
        }

        /**
         * Get PnL chart data for the given timeframe
         */
        private List<AssetResponse.ChartDataPoint> getChartData(UUID walletId, Instant fromTime) {
                try {
                        List<Object[]> rawData = walletSnapshotRepository.getWalletChartData(walletId, fromTime);

                        return rawData.stream()
                                        .map(row -> AssetResponse.ChartDataPoint.builder()
                                                        .timestamp((Instant) row[0])
                                                        .value((BigDecimal) row[1])
                                                        .build())
                                        .collect(Collectors.toList());
                } catch (Exception e) {
                        log.warn("Failed to get chart data for wallet {}: {}", walletId, e.getMessage());
                        return new ArrayList<>();
                }
        }

        // private List<AssetResponse.CoinHoldingDTO> getTop5HighestValueCoins(UUID
        // userId) {
        // List<CoinHolding> holdings =
        // coinHoldingRepository.findByWallet_User_Id(userId);

        // return holdings.stream()
        // .map(holding -> {
        // // Get live price
        // BigDecimal livePrice =
        // priceService.getCurrentPrice(holding.getCoin().getSymbol());
        // BigDecimal totalValue = holding.getAmount().multiply(livePrice);
        // return AssetResponse.CoinHoldingDTO.builder()
        // .coinSymbol(holding.getCoin().getSymbol())
        // .coinName(holding.getCoin().getName())
        // .amount(holding.getAmount())
        // .totalValue(totalValue)
        // .portfolioPercentage(BigDecimal.ZERO) // Placeholder, calculate later
        // .build();
        // })
        // .sorted(Comparator.comparing(AssetResponse.CoinHoldingDTO::getTotalValue).reversed())
        // .limit(5)
        // .collect(Collectors.toList());
        // }

}
