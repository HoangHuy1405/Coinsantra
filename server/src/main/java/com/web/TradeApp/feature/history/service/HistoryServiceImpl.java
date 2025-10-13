package com.web.TradeApp.feature.history.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.web.TradeApp.feature.common.response.ResultPaginationResponse;
import com.web.TradeApp.feature.history.dto.InventoryHistoryResponse;
import com.web.TradeApp.feature.history.entity.InventoryHistory;
import com.web.TradeApp.feature.history.repository.InventoryHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {
    private final InventoryHistoryRepository inventoryHistoryRepository;

    @Override
    public ResultPaginationResponse getInventoryHistory(Pageable pageable) {
        Page<InventoryHistory> pageHistory = this.inventoryHistoryRepository.findAll(pageable);

        ResultPaginationResponse res = new ResultPaginationResponse();
        ResultPaginationResponse.PageMeta meta = new ResultPaginationResponse.PageMeta();

        meta.setPage(pageable.getPageNumber());
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageHistory.getTotalPages());
        meta.setTotal(pageHistory.getTotalElements());

        res.setMeta(meta);

        List<InventoryHistoryResponse> list = pageHistory.getContent()
                .stream().map(this::toInventoryHisDto).toList();
        res.setResult(list);
        return res;
    }

    private InventoryHistoryResponse toInventoryHisDto(InventoryHistory inventory) {
        return InventoryHistoryResponse.builder()
                .actionType(inventory.getAction())
                .coinGeckoId(inventory.getCoin().getCoinGeckoId())
                .coinName(inventory.getCoin().getName())
                .quantityDelta(inventory.getQuantityDelta())
                .note(inventory.getNote())
                .performedBy(inventory.getCreatedBy())
                .performedAt(inventory.getCreatedAt())
                .build();
    }

}
