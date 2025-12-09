package com.web.TradeApp.feature.history.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import com.web.TradeApp.feature.common.entity.BaseTrade.TradeType;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;

public interface HistoryService {
        ResultPaginationResponse getInventoryHistory(Pageable pageable);

        ResultPaginationResponse getUserTransaction(
                        UUID userId,
                        TradeType tradeType,
                        String coinName,
                        Instant beginTime,
                        Instant endTime,
                        Pageable pageable);

        ResultPaginationResponse getBotTransactionHistory(
                        UUID userId,
                        UUID botSubId,
                        TradeType tradeType,
                        String coinName,
                        Instant beginTime,
                        Instant endTime,
                        Pageable pageable);
}
