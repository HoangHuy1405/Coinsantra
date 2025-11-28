package com.web.TradeApp.feature.common.entity;

import java.math.BigDecimal;

import com.web.TradeApp.feature.coin.entity.Coin;
import com.web.TradeApp.feature.coin.entity.Wallet;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@MappedSuperclass
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseTrade extends BaseEntity {

    public enum TradeType {
        BUY, SELL
    }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "coin_id", nullable = false)
    private Coin coin;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private TradeType type; // BUY or SELL

    @Column(nullable = false, precision = 36, scale = 18)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal priceAtExecution;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal notionalValue; // Total USDT value

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal feeTradeApplied;
}