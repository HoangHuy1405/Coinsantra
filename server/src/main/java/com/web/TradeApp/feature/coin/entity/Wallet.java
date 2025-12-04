package com.web.TradeApp.feature.coin.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.web.TradeApp.feature.common.entity.BaseEntity;
import com.web.TradeApp.feature.user.entity.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "wallets")
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Wallet extends BaseEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal balance; // in USD

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal netInvestment; // in USD

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CoinHolding> coinHoldings = new ArrayList<>();

}
