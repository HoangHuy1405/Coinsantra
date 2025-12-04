package com.web.TradeApp.feature.coin.entity;

import java.math.BigDecimal;
import java.time.Instant;

import com.web.TradeApp.feature.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "wallet_snapshots")
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class WalletSnapshot extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    /**
     * USDT Balance in wallet at snapshot time
     */
    @Column(name = "wallet_balance", nullable = false, precision = 19, scale = 8)
    private BigDecimal walletBalance;

    /**
     * Total value of all coins in wallet (converted to USDT)
     */
    @Column(name = "total_coin_value", nullable = false, precision = 19, scale = 8)
    @Builder.Default
    private BigDecimal totalCoinValue = BigDecimal.ZERO;

    /**
     * Total Equity = Wallet Balance + Total Coin Value
     */
    @Column(name = "total_equity", nullable = false, precision = 19, scale = 8)
    private BigDecimal totalEquity;

    /**
     * Total net investment/deposits (baseline for PnL calculation)
     * Tracks cumulative deposits minus withdrawals
     */
    @Column(name = "net_investment", nullable = false, precision = 19, scale = 8)
    private BigDecimal netInvestment;

    /**
     * Profit/Loss = Total Equity - Net Investment
     */
    @Column(name = "pnl", nullable = false, precision = 19, scale = 8)
    private BigDecimal pnl;

    /**
     * ROI percentage = (PnL / Net Investment) × 100
     */
    @Column(name = "roi", nullable = false, precision = 5, scale = 2)
    private BigDecimal roi;

    /**
     * Timestamp when snapshot was recorded
     */
    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

}
