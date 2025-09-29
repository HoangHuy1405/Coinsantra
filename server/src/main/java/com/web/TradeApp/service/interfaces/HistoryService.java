package com.web.TradeApp.service.interfaces;

import org.springframework.data.domain.Pageable;

import com.web.TradeApp.dto.ResultPaginationDTO;

public interface HistoryService {
    ResultPaginationDTO getInventoryHistory(Pageable pageable);
}
