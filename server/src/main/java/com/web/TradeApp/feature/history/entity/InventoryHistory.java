package com.web.TradeApp.feature.history.entity;

import java.math.BigDecimal;

import com.web.TradeApp.feature.admin.coin.entity.Coin;
import com.web.TradeApp.feature.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admin_inventory_history")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
/**
 * To keep track of admin deposit/withdraw coins and user buy/sell coins
 */
public class InventoryHistory extends BaseEntity {
    public enum ActionType {
        DEPOSIT, WITHDRAW, SELL_TO_USER, BUY_FROM_USER, ADJUST
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "coin_id")
    private Coin coin;

    @Enumerated(EnumType.STRING)
    private ActionType action;

    @Column(nullable = false, precision = 38, scale = 18)
    private BigDecimal quantityDelta; // + nạp, - rút

    private String note;
}
