package com.web.TradeApp.feature.coin.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.coin.entity.WalletSnapshot;

/**
 * Repository for wallet snapshot metrics (PnL, ROI, Max Drawdown)
 * Similar to SnapshotMetricsRepository but for user wallets
 */
@Repository
public interface WalletSnapshotRepository extends JpaRepository<WalletSnapshot, UUID> {

    /**
     * Calculate PnL of wallet by timeframe
     * Returns the difference between latest PnL and earliest PnL in the timeframe
     */
    @Query("""
            SELECT COALESCE(latest.pnl - compare.pnl, latest.pnl, 0)
            FROM WalletSnapshot latest
            LEFT JOIN WalletSnapshot compare ON compare.wallet.id = latest.wallet.id
              AND compare.recordedAt = (
                SELECT MIN(ws2.recordedAt) FROM WalletSnapshot ws2
                WHERE ws2.wallet.id = :walletId
                  AND ws2.recordedAt >= :compareTime
              )
            WHERE latest.wallet.id = :walletId
              AND latest.recordedAt = (
                SELECT MAX(ws3.recordedAt) FROM WalletSnapshot ws3
                WHERE ws3.wallet.id = :walletId
              )
            """)
    BigDecimal calcWalletPnl(@Param("walletId") UUID walletId, @Param("compareTime") Instant compareTime);

    /**
     * Calculate ROI of wallet by timeframe
     * ROI = ((latest PnL - compare PnL) / compare netInvestment) * 100
     */
    @Query("""
            SELECT COALESCE(
              CASE WHEN COALESCE(compare.netInvestment, latest.netInvestment) > 0
                THEN ((latest.pnl - COALESCE(compare.pnl, 0)) / COALESCE(compare.netInvestment, latest.netInvestment)) * 100
                ELSE 0
              END
            , 0)
            FROM WalletSnapshot latest
            LEFT JOIN WalletSnapshot compare ON compare.wallet.id = latest.wallet.id
              AND compare.recordedAt = (
                SELECT MIN(ws2.recordedAt) FROM WalletSnapshot ws2
                WHERE ws2.wallet.id = :walletId
                  AND ws2.recordedAt >= :compareTime
              )
            WHERE latest.wallet.id = :walletId
              AND latest.recordedAt = (
                SELECT MAX(ws3.recordedAt) FROM WalletSnapshot ws3
                WHERE ws3.wallet.id = :walletId
              )
            """)
    BigDecimal calcWalletRoi(@Param("walletId") UUID walletId, @Param("compareTime") Instant compareTime);

    /**
     * Calculate max drawdown of wallet (all-time)
     * Returns the most negative PnL ever recorded
     */
    @Query("""
            SELECT COALESCE(MIN(ws.pnl), 0)
            FROM WalletSnapshot ws
            WHERE ws.wallet.id = :walletId
            """)
    BigDecimal calcWalletMaxDrawdown(@Param("walletId") UUID walletId);

    /**
     * Calculate max drawdown percentage of wallet (all-time)
     */
    @Query("""
            SELECT COALESCE(MIN(
              CASE WHEN ws.netInvestment > 0
                THEN (ws.pnl / ws.netInvestment) * 100
                ELSE 0
              END
            ), 0)
            FROM WalletSnapshot ws
            WHERE ws.wallet.id = :walletId
            """)
    BigDecimal calcWalletMaxDrawdownPct(@Param("walletId") UUID walletId);

    /**
     * Get chart data (PnL over time) for wallet by timeframe
     * Returns List of Object[] where [0] = Instant recordedAt, [1] = BigDecimal pnl
     */
    @Query("""
            SELECT ws.recordedAt, ws.pnl
            FROM WalletSnapshot ws
            WHERE ws.wallet.id = :walletId
              AND ws.recordedAt >= :fromTime
            ORDER BY ws.recordedAt ASC
            """)
    List<Object[]> getWalletChartData(@Param("walletId") UUID walletId, @Param("fromTime") Instant fromTime);

    /**
     * Get latest snapshot data for wallet
     */
    @Query("""
            SELECT ws
            FROM WalletSnapshot ws
            WHERE ws.wallet.id = :walletId
              AND ws.recordedAt = (
                SELECT MAX(ws2.recordedAt) FROM WalletSnapshot ws2
                WHERE ws2.wallet.id = :walletId
              )
            """)
    WalletSnapshot getLatestSnapshot(@Param("walletId") UUID walletId);
}
