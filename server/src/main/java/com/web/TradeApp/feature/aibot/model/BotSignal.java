package com.web.TradeApp.feature.aibot.model;

import java.time.Instant;

import com.web.TradeApp.feature.aibot.enums.BotAction;
import com.web.TradeApp.feature.aibot.enums.SignalStatus;
import com.web.TradeApp.feature.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "bot_signals")
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class BotSignal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bot_id", nullable = false)
    private Bot bot;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 10)
    private BotAction action; // BUY or SELL

    // The coin this signal refers to (should match bot.coinSymbol)
    @Column(name = "coin_symbol", nullable = false, length = 20)
    private String coinSymbol;

    @Column(name = "signal_timestamp", nullable = false)
    private Instant signalTimestamp;

    // Raw JSON from python, just for logging / debugging
    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;

    // If processing this signal to trades failed
    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "price")
    private Double price; // The price at the time of signal

    @Column(name = "confidence")
    private Double confidence; // The price at the time of signal

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SignalStatus status = SignalStatus.PENDING; // Default

    @Column(name = "processed_at")
    private Instant processedAt;

}
