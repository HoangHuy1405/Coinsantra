package com.web.TradeApp.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.web.TradeApp.dto.ResultPaginationDTO;
import com.web.TradeApp.dto.HistoryDTO.InventoryHistoryResponse;
import com.web.TradeApp.model.coin.InventoryHistory;
import com.web.TradeApp.repository.InventoryHistoryRepository;
import com.web.TradeApp.service.interfaces.HistoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {
    private final InventoryHistoryRepository inventoryHistoryRepository;

    @Override
    public ResultPaginationDTO getInventoryHistory(Pageable pageable) {
        Page<InventoryHistory> pageHistory = this.inventoryHistoryRepository.findAll(pageable);

        ResultPaginationDTO res = new ResultPaginationDTO();
        ResultPaginationDTO.PageMeta meta = new ResultPaginationDTO.PageMeta();

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
