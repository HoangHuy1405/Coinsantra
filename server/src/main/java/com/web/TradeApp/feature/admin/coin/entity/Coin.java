package com.web.TradeApp.feature.admin.coin.entity;

import java.math.BigDecimal;

import com.web.TradeApp.feature.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coins", indexes = {
        @Index(name = "ux_coins_gecko", columnList = "coin_gecko_id", unique = true)
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Coin extends BaseEntity {

    @Column(name = "coin_gecko_id", nullable = false, unique = true)
    private String coinGeckoId;
    private String name;
    private String symbol;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal fee;

    // Lượng coin hệ thống (CEO) đang nắm giữ
    // @Column(nullable = false, precision = 38, scale = 18)
    // private BigDecimal quantity;
    // REASON: Admin funds are now stored in CoinHolding linked to an Admin Wallet
}
