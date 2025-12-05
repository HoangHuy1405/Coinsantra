package com.web.TradeApp.feature.aibot.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

import com.web.TradeApp.feature.aibot.model.BotSubscription;
import com.web.TradeApp.feature.aibot.model.SubscriptionSnapshot;
import com.web.TradeApp.feature.aibot.repository.BotSubscriptionRepository;
import com.web.TradeApp.feature.aibot.repository.SnapshotMetricsRepository;
import com.web.TradeApp.feature.coin.service.CoinGeckoClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubSnapshotServiceImpl implements SubSnapshotService {

    private final BotSubscriptionRepository subscriptionRepo;
    private final SnapshotMetricsRepository snapshotRepo;
    private final CoinGeckoClient marketPriceService;
    private final PlatformTransactionManager transactionManager;

    @Value("${snapshot.batch-size:100}")
    private int batchSize;

    @Value("${snapshot.transaction-timeout:30}")
    private int transactionTimeout;

    @Scheduled(fixedRateString = "${snapshot.interval:300000}") // Default: Every 5 minutes (300000ms)
    public void captureSubscriptions() {
        log.info("🚀 Starting Batch Snapshot Job...");

        // Start with the lowest possible UUID (NIL UUID) for keyset pagination
        // This ensures we fetch everything > 0000... (which is effectively all valid v4
        // UUIDs)
        UUID lastId = UUID.fromString("00000000-0000-0000-0000-000000000000");
        int totalProcessed = 0;
        boolean hasNextBatch = true;

        // Configure TransactionTemplate for manual control
        TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
        // REQUIRES_NEW ensures a fresh transaction for every batch (commit immediately)
        txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        txTemplate.setTimeout(transactionTimeout); // Fail fast if DB is locked

        while (hasNextBatch) {
            // Capture the current lastId in a final variable for use inside the lambda
            final UUID batchStartId = lastId;

            // 1. Fetch Data (Read-Only, outside transaction for speed)
            // Using JOIN FETCH to eagerly load Bot entities to avoid
            // LazyInitializationException
            Pageable limit = PageRequest.of(0, batchSize);
            List<BotSubscription> batch = subscriptionRepo.findByIdGreaterThanAndActiveTrueWithBotOrderByIdAsc(lastId,
                    limit);

            if (batch.isEmpty()) {
                hasNextBatch = false;
                break;
            }

            // 2. Process & Save (Inside Transaction Boundary)
            // This lambda runs inside a short, isolated DB transaction
            Integer savedCount = txTemplate.execute(status -> {
                try {
                    return processAndSaveBatch(batch);
                } catch (Exception e) {
                    log.error("❌ Batch failed for range > {}. Rolling back this batch only.", batchStartId, e);
                    status.setRollbackOnly(); // Rollback only this chunk of 100
                    return 0;
                }
            });

            // 3. Update Cursor
            // Move the pointer to the last ID we processed
            lastId = batch.get(batch.size() - 1).getId();
            totalProcessed += (savedCount != null ? savedCount : 0);
        }

        log.info("✅ Job Finished. Processed {} snapshots.", totalProcessed);
    }

    /**
     * This helper method is called INSIDE the TransactionTemplate.
     * All DB writes here are atomic for this specific batch.
     */
    private int processAndSaveBatch(List<BotSubscription> subs) {
        List<SubscriptionSnapshot> snapshots = new ArrayList<>();

        // ✅ Use single timestamp for entire batch to prevent flickering
        // All snapshots in this batch will have identical recordedAt
        Instant batchTimestamp = Instant.now();

        // OPTIMIZATION: Collect all unique coin symbols from all subscriptions FIRST
        Set<String> allCoinSymbols = subs.stream()
                .map(sub -> sub.getBot().getCoinSymbol())
                .collect(Collectors.toSet());

        // Fetch ALL prices in ONE API call (instead of N individual calls)
        Map<String, BigDecimal> priceMap = new HashMap<>();
        if (!allCoinSymbols.isEmpty()) {
            try {
                priceMap = marketPriceService.getBatchPrices(new ArrayList<>(allCoinSymbols));
                log.debug("📊 Fetched {} bot coin prices in one batch API call", priceMap.size());
            } catch (Exception e) {
                log.error("❌ Failed to fetch batch prices: {}", e.getMessage());
            }
        }

        // Now process each subscription using the pre-fetched prices
        for (BotSubscription sub : subs) {
            try {
                // Business Logic with pre-fetched prices and batch timestamp
                SubscriptionSnapshot snapshot = processSingleSubscription(sub, priceMap, batchTimestamp);
                if (snapshot != null) {
                    snapshots.add(snapshot);
                }
            } catch (Exception e) {
                // Log individual failures, but don't fail the whole batch unless critical
                log.warn("Skipping sub {} due to calculation error: {}", sub.getId(), e.getMessage());
            }
        }

        // Bulk Insert
        if (!snapshots.isEmpty()) {
            snapshotRepo.saveAll(snapshots);
        }

        return snapshots.size();
    }

    /**
     * Process a single bot subscription using pre-fetched prices
     * 
     * @param sub            Bot subscription to process
     * @param priceMap       Pre-fetched coin prices (coinGeckoId -> price)
     * @param batchTimestamp Timestamp for this entire batch (prevents flickering)
     */
    private SubscriptionSnapshot processSingleSubscription(BotSubscription sub, Map<String, BigDecimal> priceMap,
            Instant batchTimestamp) {
        // --- BƯỚC 1: Lấy giá thị trường từ pre-fetched prices ---
        String symbol = sub.getBot().getCoinSymbol();

        // Convert symbol to CoinGecko ID using the service method
        BigDecimal currentPrice = marketPriceService.getPriceFromMap(symbol, priceMap);

        if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("No price available for bot coin symbol: {} (check SYMBOL_TO_ID_MAP)", symbol);
            return null;
        }

        // --- BƯỚC 2: Tính Total Equity (Tài sản ròng hiện tại) ---
        // Equity = Ví USDT + (Ví Coin * Giá hiện tại)
        BigDecimal botWalletUsdt = sub.getBotWalletBalance();
        BigDecimal botWalletCoin = sub.getBotWalletCoin();
        BigDecimal coinValueInUsdt = botWalletCoin.multiply(currentPrice);

        BigDecimal totalEquity = botWalletUsdt.add(coinValueInUsdt);

        // --- BƯỚC 3: Lấy Vốn Gốc (Mỏ neo) ---
        // netInvestment đã được cập nhật chính xác mỗi khi user nạp/rút ở Service khác
        // rồi
        // nên ở đây chỉ việc lấy ra dùng.
        if (sub.getNetInvestment() == null) {
            // Fallback: Nếu chưa có netInvestment (dữ liệu cũ), coi Equity hiện tại là vốn
            // gốc
            sub.setNetInvestment(totalEquity);
            subscriptionRepo.save(sub);
        }
        BigDecimal netInvestment = sub.getNetInvestment();

        // --- BƯỚC 4: Tính PnL ---
        // CÔNG THỨC TUYỆT ĐỐI: Lấy Hiện tại trừ Vốn gốc
        BigDecimal totalPnl = totalEquity.subtract(netInvestment);

        // --- BƯỚC 5: Tính ROI (%) ---
        BigDecimal roi = BigDecimal.ZERO;
        if (netInvestment.compareTo(BigDecimal.ZERO) > 0) {
            roi = totalPnl.divide(netInvestment, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
        }

        // --- BƯỚC 6: Tạo Snapshot (không save ngay) ---
        SubscriptionSnapshot snapshot = SubscriptionSnapshot.builder()
                .botSubscription(sub)
                .totalEquity(totalEquity)
                .netInvestment(netInvestment)
                .botWalletBalance(botWalletUsdt) // Lưu lại để trace lịch sử ví
                .botWalletCoin(botWalletCoin) // Lưu lại để trace lịch sử ví
                .pnl(totalPnl)
                .roi(roi)
                .recordedAt(batchTimestamp) // ✅ Use batch timestamp instead of Instant.now()
                .build();

        log.debug("📸 Prepared Snapshot for Sub {}: Equity=${} | NetInvest=${} | PnL=${} ({}%)",
                sub.getId(), totalEquity, netInvestment, totalPnl, roi);

        return snapshot;
    }
}
