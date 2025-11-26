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

import com.web.TradeApp.feature.aibot.enums.BotCategory;
import com.web.TradeApp.feature.aibot.enums.BotStatus;
import com.web.TradeApp.feature.aibot.enums.RiskLevel;
import com.web.TradeApp.feature.common.entity.BaseEntity;

@Entity
@Table(name = "bots")
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Bot extends BaseEntity {

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // The single coin this bot is allowed to trade (e.g., "BTC")
    @Column(name = "coin_symbol", nullable = false, length = 20)
    private String coinSymbol;

    // e.g. "BTC/USDT" if you want
    @Column(name = "trading_pair", length = 40)
    private String tradingPair;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 20)
    @Builder.Default
    private RiskLevel riskLevel = RiskLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = true, length = 20)
    private BotCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private BotStatus status = BotStatus.ACTIVE;

    @Column(name = "fee", nullable = false, precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal fee = BigDecimal.ZERO;

    @Column(name = "last_signal_at")
    private Instant lastSignalAt;
    @Column(name = "last_error_message", length = 1000)
    private String lastErrorMessage;

    // The unique Webhook URL that YOUR system generated for the Python bot to POST
    // signals TO
    @Column(name = "api_url", nullable = true, length = 500) // Made nullable=true since it's set after initial save
    private String apiUrl;
    // The generated key/secret the Python bot uses to authenticate itself to your
    // webhook
    @Column(name = "api_key", length = 255)
    private String apiKey;
    @Column(name = "api_secret", length = 255)
    private String apiSecret;

}
