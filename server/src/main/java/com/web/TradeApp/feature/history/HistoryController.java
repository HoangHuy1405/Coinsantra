package com.web.TradeApp.feature.history;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.feature.common.response.ResultPaginationResponse;
import com.web.TradeApp.feature.history.service.HistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @GetMapping("/inventory")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getInventoryHistory(Pageable pageable) {
        ResultPaginationResponse result = historyService.getInventoryHistory(pageable);
        return ResponseEntity.ok().body(result);
    }
}
