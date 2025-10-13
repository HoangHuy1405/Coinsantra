package com.web.TradeApp.feature.history.service;

import org.springframework.data.domain.Pageable;

import com.web.TradeApp.feature.common.response.ResultPaginationResponse;

public interface HistoryService {
    ResultPaginationResponse getInventoryHistory(Pageable pageable);
}
