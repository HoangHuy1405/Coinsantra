package com.web.TradeApp.feature.history.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.web.TradeApp.feature.history.entity.InventoryHistory.ActionType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryHistoryResponse {
    private ActionType actionType;
    private String coinGeckoId;
    private String coinName;
    private BigDecimal quantityDelta;
    private String note;
    private String performedBy;
    private Instant performedAt;
}
