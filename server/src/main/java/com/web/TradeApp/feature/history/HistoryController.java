package com.web.TradeApp.feature.history;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.exception.IdInvalidException;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;
import com.web.TradeApp.feature.history.dto.BotSubHistoryRequest;
import com.web.TradeApp.feature.history.dto.TransactionHistoryRequest;
import com.web.TradeApp.feature.history.service.HistoryService;
import com.web.TradeApp.utils.SecurityUtil;

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

        /**
         * Get user's manual transaction history with optional filters
         * 
         * Testing examples:
         * 
         * 1. Basic pagination (first page, 10 items):
         * GET /history/transactions/user?page=0&size=10
         * 
         * 2. With sorting (by createdAt descending):
         * GET /history/transactions/user?page=0&size=10&sort=createdAt,desc
         * 
         * 3. Sort by multiple fields:
         * GET /history/transactions/user?sort=createdAt,desc&sort=quantity,asc
         * 
         * 4. Filter by trade type (BUY only):
         * GET /history/transactions/user?type=BUY&page=0&size=10
         * 
         * 5. Filter by coin name (Bitcoin):
         * GET /history/transactions/user?coinName=Bitcoin&page=0&size=10
         * 
         * 6. Filter by date range:
         * GET
         * /history/transactions/user?fromDate=2025-01-01T00:00:00Z&toDate=2025-12-31T23:59:59Z
         * 
         * 7. Combined filters with sorting:
         * GET
         * /history/transactions/user?type=SELL&coinName=Ethereum&fromDate=2025-11-01T00:00:00Z&sort=quantity,desc&page=0&size=20
         * 
         * 8. Search partial coin name (case-insensitive):
         * GET /history/transactions/user?coinName=bit&page=0&size=10
         * (matches Bitcoin, Bitshares, etc.)
         * 
         * Sortable fields: createdAt, quantity, priceAtExecution, notionalValue,
         * feeTradeApplied, type
         */
        @GetMapping("/transactions/user")
        @PreAuthorize("hasAuthority('TRADER')")
        public ResponseEntity<?> getUserTransactionHistory(
                        Pageable pageable,
                        @ModelAttribute TransactionHistoryRequest filter) {
                UUID userId = SecurityUtil.getCurrentUserId()
                                .orElseThrow(() -> new IdInvalidException("Unauthenticated user"));

                // Default sort by createdAt desc if no sort provided
                if (pageable.getSort().isUnsorted()) {
                        pageable = org.springframework.data.domain.PageRequest.of(
                                        pageable.getPageNumber(),
                                        pageable.getPageSize(),
                                        org.springframework.data.domain.Sort.by(
                                                        org.springframework.data.domain.Sort.Direction.DESC,
                                                        "createdAt"));
                }

                ResultPaginationResponse result = historyService.getUserTransaction(
                                userId,
                                filter.getType(),
                                filter.getCoinName(),
                                filter.getFromDate(),
                                filter.getToDate(), pageable);
                return ResponseEntity.ok().body(result);
        }

        /**
         * Get user's bot transaction history with optional filters
         * 
         * Note: botSubId is REQUIRED to filter trades by specific bot subscription
         * 
         * Testing examples:
         * 
         * 1. Basic pagination with botSubId (REQUIRED):
         * GET /history/transactions/bot?botSubId=<uuid>&page=0&size=10
         * 
         * 2. With sorting (by notionalValue descending - largest trades first):
         * GET
         * /history/transactions/bot?botSubId=<uuid>&page=0&size=10&sort=notionalValue,desc
         * 
         * 3. Sort by date ascending (oldest first):
         * GET /history/transactions/bot?botSubId=<uuid>&sort=createdAt,asc
         * 
         * 4. Filter by trade type (SELL only):
         * GET /history/transactions/bot?botSubId=<uuid>&type=SELL&page=0&size=10
         * 
         * 5. Filter by coin name (Ethereum):
         * GET
         * /history/transactions/bot?botSubId=<uuid>&coinName=Ethereum&page=0&size=10
         * 
         * 6. Filter by date range (last 7 days):
         * GET
         * /history/transactions/bot?botSubId=<uuid>&fromDate=2025-11-30T00:00:00Z&toDate=2025-12-07T23:59:59Z
         * 
         * 7. Combined filters (BUY Bitcoin in November, sorted by price):
         * GET
         * /history/transactions/bot?botSubId=<uuid>&type=BUY&coinName=Bitcoin&fromDate=2025-11-01T00:00:00Z&toDate=2025-11-30T23:59:59Z&sort=priceAtExecution,asc&page=0&size=15
         * 
         * 8. High-value trades (sort by notionalValue + pagination):
         * GET
         * /history/transactions/bot?botSubId=<uuid>&sort=notionalValue,desc&page=0&size=5
         * 
         * 9. Search coins starting with 'eth':
         * GET /history/transactions/bot?botSubId=<uuid>&coinName=eth&page=0&size=10
         * (matches Ethereum, Ethereum Classic, etc.)
         * 
         * Required parameter: botSubId (Bot Subscription UUID)
         * Sortable fields: createdAt, quantity, priceAtExecution, notionalValue,
         * feeTradeApplied, type
         */
        @GetMapping("/transactions/bot")
        @PreAuthorize("hasAuthority('TRADER')")
        public ResponseEntity<?> getBotTransactionHistory(
                        Pageable pageable,
                        @ModelAttribute BotSubHistoryRequest filter) {
                UUID userId = SecurityUtil.getCurrentUserId()
                                .orElseThrow(() -> new IdInvalidException("Unauthenticated user"));

                // Default sort by createdAt desc if no sort provided
                if (pageable.getSort().isUnsorted()) {
                        pageable = org.springframework.data.domain.PageRequest.of(
                                        pageable.getPageNumber(),
                                        pageable.getPageSize(),
                                        org.springframework.data.domain.Sort.by(
                                                        org.springframework.data.domain.Sort.Direction.DESC,
                                                        "createdAt"));
                }

                ResultPaginationResponse result = historyService.getBotTransactionHistory(
                                userId,
                                filter.getBotSubId(),
                                filter.getType(),
                                filter.getCoinName(),
                                filter.getFromDate(),
                                filter.getToDate(), pageable);
                return ResponseEntity.ok().body(result);
        }
}
