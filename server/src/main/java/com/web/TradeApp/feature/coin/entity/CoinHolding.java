package com.web.TradeApp.feature.coin.entity;

import java.math.BigDecimal;

import com.web.TradeApp.feature.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coin_holdings", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "wallet_id", "coin_id" })
})
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class CoinHolding extends BaseEntity {
    @ManyToOne(optional = false)
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    @ManyToOne(optional = false)
    @JoinColumn(name = "coin_id")
    private Coin coin;

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal amount;

    @Column(precision = 19, scale = 8)
    private BigDecimal averageBuyPrice;
}
