package com.web.TradeApp.feature.aibot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import com.web.TradeApp.feature.common.entity.BaseTrade;

@Entity
@Table(name = "bot_trades")
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
public class BotTrade extends BaseTrade {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bot_id", nullable = false)
    private Bot bot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bot_subscription_id", nullable = false)
    private BotSubscription botSubscription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bot_signal_id")
    private BotSignal botSignal;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal feeBotApplied;
}
