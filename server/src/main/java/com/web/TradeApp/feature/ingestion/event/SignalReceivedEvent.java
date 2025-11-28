package com.web.TradeApp.feature.ingestion.event;

import com.web.TradeApp.feature.aibot.model.BotSignal;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class SignalReceivedEvent extends ApplicationEvent {
    private final BotSignal signal;

    public SignalReceivedEvent(Object source, BotSignal signal) {
        super(source);
        this.signal = signal;
    }
}
