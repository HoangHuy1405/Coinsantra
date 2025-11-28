package com.web.TradeApp.feature.aibot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.web.TradeApp.feature.common.entity.BaseEntity;

@Entity
@Table(name = "bot_subscriptions")
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class BotSubscription extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bot_id", nullable = false)
    private Bot bot;

    // reference to your existing User entity (adjust class name & package)
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // 1. Total Capital Allocated (e.g., 100 USDT)
    // The bot will never spend more than this amount from the wallet effectively.
    // (In this logic, it calculates trade size based on this number).
    @Column(name = "allocated_amount", nullable = false, precision = 18, scale = 6)
    private BigDecimal allocatedAmount;

    @Column(name = "allocated_coin", nullable = false, precision = 36, scale = 18)
    @Builder.Default
    private BigDecimal allocatedCoin = BigDecimal.ZERO;

    // 2. Percentage per Trade (e.g., 0.10 for 10%)
    // "For every action, bot buys/sells % of allocation amount"
    @Column(name = "trade_percentage", nullable = false, precision = 5, scale = 4)
    private BigDecimal tradePercentage;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "stopped_at")
    private Instant stoppedAt;

    // Optional: user-specific config for this bot
    @Column(name = "max_daily_loss_percentage", columnDefinition = "DECIMAL(5,2)")
    private Double maxDailyLossPercentage;

}
