package com.web.TradeApp.feature.history.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.web.TradeApp.exception.InvalidFilterValueException;
import com.web.TradeApp.feature.aibot.model.BotTrade;
import com.web.TradeApp.feature.aibot.repository.BotTradeRepository;
import com.web.TradeApp.feature.coin.entity.Transaction;
import com.web.TradeApp.feature.coin.repository.TransactionRepository;
import com.web.TradeApp.feature.common.entity.BaseTrade.TradeType;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;
import com.web.TradeApp.feature.history.dto.BotTradeHistoryResponse;
import com.web.TradeApp.feature.history.dto.InventoryHistoryResponse;
import com.web.TradeApp.feature.history.entity.InventoryHistory;
import com.web.TradeApp.feature.history.repository.InventoryHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {
        private final InventoryHistoryRepository inventoryHistoryRepository;

        private final TransactionRepository transactionRepository;

        private final BotTradeRepository botTradeRepository;

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

        /**
         * Get manual transactions with optional filters
         * 
         * @param userId    User ID (required)
         * @param tradeType Trade type (optional)
         * @param coinName  Coin name (optional)
         * @param beginTime Start time (optional)
         * @param endTime   End time (optional)
         * @param pageable  Pagination and sorting
         * @throws InvalidFilterValueException if beginTime > endTime
         */
        @Override
        public ResultPaginationResponse getUserTransaction(
                        UUID userId,
                        TradeType tradeType,
                        String coinName,
                        Instant beginTime,
                        Instant endTime,
                        Pageable pageable) {

                // Validate time range
                if (beginTime != null && endTime != null && beginTime.isAfter(endTime)) {
                        throw new InvalidFilterValueException(
                                        String.format("Invalid time range: beginTime (%s) must be before endTime (%s)",
                                                        beginTime, endTime),
                                        null);
                }

                // Normalize empty string to null for consistent filtering
                String normalizedCoinName = (coinName != null && coinName.trim().isEmpty()) ? null : coinName;

                Page<Transaction> pageTransactions = this.transactionRepository.findManualTransactions(
                                userId, tradeType, normalizedCoinName, beginTime, endTime, pageable);

                ResultPaginationResponse res = new ResultPaginationResponse();
                ResultPaginationResponse.PageMeta meta = new ResultPaginationResponse.PageMeta();

                meta.setPage(pageable.getPageNumber());
                meta.setPageSize(pageable.getPageSize());
                meta.setPages(pageTransactions.getTotalPages());
                meta.setTotal(pageTransactions.getTotalElements());

                res.setMeta(meta);
                List<com.web.TradeApp.feature.history.dto.TransactionHistoryResponse> transactionDtos = pageTransactions
                                .getContent()
                                .stream()
                                .map(this::toTransactionDto)
                                .toList();
                res.setResult(transactionDtos);
                return res;
        }

        private com.web.TradeApp.feature.history.dto.TransactionHistoryResponse toTransactionDto(
                        Transaction transaction) {
                return com.web.TradeApp.feature.history.dto.TransactionHistoryResponse.builder()
                                .id(transaction.getId())
                                .createdAt(transaction.getCreatedAt())
                                .type(transaction.getType())
                                .coinName(transaction.getCoin().getName())
                                .coinSymbol(transaction.getCoin().getSymbol())
                                .coinGeckoId(transaction.getCoin().getCoinGeckoId())
                                .quantity(transaction.getQuantity())
                                .priceAtExecution(transaction.getPriceAtExecution())
                                .notionalValue(transaction.getNotionalValue())
                                .feeTradeApplied(transaction.getFeeTradeApplied())
                                .build();
        }

        @Override
        public ResultPaginationResponse getBotTransactionHistory(
                        UUID userId, UUID botSubId, TradeType tradeType, String coinName,
                        Instant beginTime, Instant endTime, Pageable pageable) {
                if (beginTime != null && endTime != null && beginTime.isAfter(endTime)) {
                        throw new InvalidFilterValueException(
                                        String.format("Invalid time range: beginTime (%s) must be before endTime (%s)",
                                                        beginTime, endTime),
                                        null);
                }

                // Normalize empty string to null for consistent filtering
                String normalizedCoinName = (coinName != null && coinName.trim().isEmpty()) ? null : coinName;

                Page<BotTrade> pageBotTrades = this.botTradeRepository.findBotTrades(
                                userId, botSubId, tradeType, normalizedCoinName, beginTime, endTime, pageable);

                ResultPaginationResponse res = new ResultPaginationResponse();
                ResultPaginationResponse.PageMeta meta = new ResultPaginationResponse.PageMeta();

                meta.setPage(pageable.getPageNumber());
                meta.setPageSize(pageable.getPageSize());
                meta.setPages(pageBotTrades.getTotalPages());
                meta.setTotal(pageBotTrades.getTotalElements());

                res.setMeta(meta);
                List<BotTradeHistoryResponse> botTradeDtos = pageBotTrades
                                .getContent()
                                .stream()
                                .map(this::toBotTradeDto)
                                .toList();
                res.setResult(botTradeDtos);
                return res;
        }

        private BotTradeHistoryResponse toBotTradeDto(BotTrade botTrade) {
                return BotTradeHistoryResponse.builder()
                                .id(botTrade.getId())
                                .createdAt(botTrade.getCreatedAt())
                                .type(botTrade.getType())
                                .botName(botTrade.getBot().getName())
                                // .botDescription(botTrade.getBot().getDescription())
                                .coinName(botTrade.getCoin().getName())
                                .coinSymbol(botTrade.getCoin().getSymbol())
                                .coinGeckoId(botTrade.getCoin().getCoinGeckoId())
                                .quantity(botTrade.getQuantity())
                                .priceAtExecution(botTrade.getPriceAtExecution())
                                .notionalValue(botTrade.getNotionalValue())
                                // .feeBotApplied(botTrade.getFeeBotApplied())
                                .build();
        }

}
