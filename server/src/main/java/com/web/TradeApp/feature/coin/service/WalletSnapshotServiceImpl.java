package com.web.TradeApp.feature.coin.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import com.web.TradeApp.feature.coin.entity.CoinHolding;
import com.web.TradeApp.feature.coin.entity.Wallet;
import com.web.TradeApp.feature.coin.entity.WalletSnapshot;
import com.web.TradeApp.feature.coin.repository.WalletRepository;
import com.web.TradeApp.feature.coin.repository.WalletSnapshotRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletSnapshotServiceImpl implements WalletSnapshotService {

    private final WalletRepository walletRepo;
    private final WalletSnapshotRepository walletSnapshotRepo;
    private final CoinGeckoClient marketPriceService;
    private final PlatformTransactionManager transactionManager;

    @Value("${snapshot.batch-size:100}")
    private int batchSize;

    @Value("${snapshot.transaction-timeout:30}")
    private int transactionTimeout;

    @Scheduled(fixedRateString = "${snapshot.interval:300000}") // Default: Every 5 minutes
    @Override
    public void captureWallets() {
        log.info("💰 Starting Wallet Snapshot Job...");

        // Start with NIL UUID for keyset pagination
        UUID lastId = UUID.fromString("00000000-0000-0000-0000-000000000000");
        int totalProcessed = 0;
        boolean hasNextBatch = true;

        // Configure TransactionTemplate for manual control
        TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
        txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        txTemplate.setTimeout(transactionTimeout);

        while (hasNextBatch) {
            final UUID batchStartId = lastId;

            // 1. Fetch Data (Read-Only, outside transaction for speed)
            // Using LEFT JOIN FETCH to eagerly load CoinHoldings
            Pageable limit = PageRequest.of(0, batchSize);
            List<Wallet> batch = walletRepo.findByIdGreaterThanWithCoinHoldingsOrderByIdAsc(lastId, limit);

            if (batch.isEmpty()) {
                hasNextBatch = false;
                break;
            }

            // 2. Process & Save (Inside Transaction Boundary)
            Integer savedCount = txTemplate.execute(status -> {
                try {
                    return processAndSaveBatch(batch);
                } catch (Exception e) {
                    log.error("❌ Wallet batch failed for range > {}. Rolling back this batch only.", batchStartId, e);
                    status.setRollbackOnly();
                    return 0;
                }
            });

            // 3. Update Cursor
            lastId = batch.get(batch.size() - 1).getId();
            totalProcessed += (savedCount != null ? savedCount : 0);
        }

        log.info("✅ Wallet Snapshot Job Finished. Processed {} wallet snapshots.", totalProcessed);
    }

    /**
     * Process and save a batch of wallet snapshots
     * This method runs inside a transaction
     */
    private int processAndSaveBatch(List<Wallet> wallets) {
        List<WalletSnapshot> snapshots = new ArrayList<>();

        // OPTIMIZATION: Collect all unique coin IDs from all wallets FIRST
        Set<String> allCoinIds = wallets.stream()
                .flatMap(wallet -> wallet.getCoinHoldings().stream())
                .map(holding -> holding.getCoin().getCoinGeckoId())
                .collect(Collectors.toSet());

        // Fetch ALL prices in ONE API call (instead of N individual calls)
        Map<String, BigDecimal> priceMap = new HashMap<>();
        if (!allCoinIds.isEmpty()) {
            try {
                priceMap = marketPriceService.getBatchPrices(new ArrayList<>(allCoinIds));
                log.debug("📊 Fetched {} coin prices in one batch API call", priceMap.size());
            } catch (Exception e) {
                log.error("❌ Failed to fetch batch prices: {}", e.getMessage());
            }
        }

        // Now process each wallet using the pre-fetched prices
        for (Wallet wallet : wallets) {
            try {
                WalletSnapshot snapshot = processSingleWallet(wallet, priceMap);
                if (snapshot != null) {
                    snapshots.add(snapshot);
                }
            } catch (Exception e) {
                log.warn("Skipping wallet {} due to calculation error: {}", wallet.getId(), e.getMessage());
            }
        }

        // Bulk Insert
        if (!snapshots.isEmpty()) {
            walletSnapshotRepo.saveAll(snapshots);
        }

        return snapshots.size();
    }

    /**
     * Process a single wallet and create a snapshot using pre-fetched prices
     * 
     * @param wallet   The wallet to process
     * @param priceMap Pre-fetched coin prices (coinGeckoId -> price)
     */
    private WalletSnapshot processSingleWallet(Wallet wallet, Map<String, BigDecimal> priceMap) {
        // --- STEP 1: Get wallet USDT balance ---
        BigDecimal walletBalance = wallet.getBalance();

        // --- STEP 2: Calculate total coin value using pre-fetched prices ---
        BigDecimal totalCoinValue = BigDecimal.ZERO;

        if (wallet.getCoinHoldings() != null && !wallet.getCoinHoldings().isEmpty()) {
            for (CoinHolding holding : wallet.getCoinHoldings()) {
                try {
                    String coinGeckoId = holding.getCoin().getCoinGeckoId();
                    BigDecimal currentPrice = priceMap.get(coinGeckoId);

                    if (currentPrice != null && currentPrice.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal coinValue = holding.getAmount().multiply(currentPrice);
                        totalCoinValue = totalCoinValue.add(coinValue);
                    } else {
                        log.warn("No price available for coin {} in wallet {}",
                                holding.getCoin().getSymbol(), wallet.getId());
                    }
                } catch (Exception e) {
                    log.warn("Error calculating value for coin {} in wallet {}: {}",
                            holding.getCoin().getSymbol(), wallet.getId(), e.getMessage());
                }
            }
        }

        // --- STEP 3: Calculate total equity ---
        BigDecimal totalEquity = walletBalance.add(totalCoinValue);

        // --- STEP 4: Get net investment (baseline) ---
        // For now, use total equity as net investment if it's the first snapshot
        // TODO: Implement proper tracking of deposits/withdrawals
        BigDecimal netInvestment = wallet.getNetInvestment();
        if (netInvestment == null || netInvestment.compareTo(BigDecimal.ZERO) == 0) {
            // Fallback for first run: assume no PnL yet
            netInvestment = totalEquity;
            wallet.setNetInvestment(netInvestment); // Save initial net investment
        }

        // --- STEP 5: Calculate PnL ---
        BigDecimal pnl = totalEquity.subtract(netInvestment);

        // --- STEP 6: Calculate ROI (%) ---
        BigDecimal roi = BigDecimal.ZERO;
        if (netInvestment.compareTo(BigDecimal.ZERO) > 0) {
            roi = pnl.divide(netInvestment, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
        }

        // --- STEP 7: Create snapshot ---
        WalletSnapshot snapshot = WalletSnapshot.builder()
                .wallet(wallet)
                .walletBalance(walletBalance)
                .totalCoinValue(totalCoinValue)
                .totalEquity(totalEquity)
                .netInvestment(netInvestment)
                .pnl(pnl)
                .roi(roi)
                .recordedAt(Instant.now())
                .build();

        log.debug(
                "💰 Prepared Wallet Snapshot for Wallet {}: Balance=${} | CoinValue=${} | TotalEquity=${} | PnL=${} ({}%)",
                wallet.getId(), walletBalance, totalCoinValue, totalEquity, pnl, roi);

        return snapshot;
    }
}
