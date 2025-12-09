package com.web.TradeApp.feature.history.dto;

import java.time.Instant;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;

import com.web.TradeApp.feature.common.entity.BaseTrade.TradeType;

import lombok.Data;

@Data
public class BotSubHistoryRequest {
    private UUID botSubId;
    private String coinName;
    private TradeType type;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant toDate;
}
