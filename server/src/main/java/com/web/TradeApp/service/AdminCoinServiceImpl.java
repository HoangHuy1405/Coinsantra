package com.web.TradeApp.service;

import java.math.BigDecimal;
import java.util.List;

import org.hibernate.query.sqm.produce.function.FunctionArgumentException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.web.TradeApp.dto.ResultPaginationDTO;
import com.web.TradeApp.dto.CoinDTO.CoinDepositRequest;
import com.web.TradeApp.dto.CoinDTO.CoinDepositResponse;
import com.web.TradeApp.dto.CoinDTO.CoinInfoResponse;
import com.web.TradeApp.dto.CoinDTO.CoinWithdrawRequest;
import com.web.TradeApp.dto.CoinDTO.CoinWithdrawResponse;
import com.web.TradeApp.exception.IdInvalidException;
import com.web.TradeApp.model.coin.Coin;
import com.web.TradeApp.model.coin.InventoryHistory;
import com.web.TradeApp.repository.CoinRepository;
import com.web.TradeApp.repository.InventoryHistoryRepository;
import com.web.TradeApp.service.interfaces.AdminCoinService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCoinServiceImpl implements AdminCoinService {
        private final CoinRepository coinRepository;
        private final InventoryHistoryRepository historyRepository;
        private final CoinGeckoClient coinGeckoClient;

        @Override
        @Transactional
        public CoinDepositResponse depositCoin(CoinDepositRequest request) {
                // 0. Check if the coinGeckoId actually exists
                if (!coinGeckoClient.isExists(request.getCoinGeckoId())) {
                        throw new IllegalArgumentException("Invalid coinGeckoId: " + request.getCoinGeckoId());
                }
                // 1. Tìm coin theo coinGeckoId (lock row nếu tồn tại)
                Coin coin = coinRepository.findByCoinGeckoId(request.getCoinGeckoId())
                                .orElseGet(() -> {
                                        // Nếu chưa tồn tại -> tạo mới coin
                                        Coin newCoin = Coin.builder()
                                                        .coinGeckoId(request.getCoinGeckoId())
                                                        .name(request.getName())
                                                        .symbol(request.getSymbol())
                                                        .fee(BigDecimal.ZERO) // có thể set default fee
                                                        .quantity(BigDecimal.ZERO)
                                                        .build();
                                        return coinRepository.save(newCoin);
                                });

                // 2. Cộng quantity
                coin.setQuantity(coin.getQuantity().add(request.getQuantity()));
                coinRepository.save(coin);

                // 3. Ghi log inventory
                historyRepository.save(InventoryHistory.builder()
                                .coin(coin)
                                .action(InventoryHistory.ActionType.DEPOSIT)
                                .quantityDelta(request.getQuantity())
                                .note(request.getNote())
                                .build());

                // 4. Trả về response
                return CoinDepositResponse.builder()
                                .id(coin.getId())
                                .coinGeckoId(coin.getCoinGeckoId())
                                .symbol(coin.getSymbol())
                                .name(coin.getName())
                                .depositedQuantity(request.getQuantity())
                                .newQuantity(coin.getQuantity())
                                .build();
        }

        @Override
        @Transactional
        public CoinWithdrawResponse withdrawCoin(CoinWithdrawRequest request) {
                // 1. Check
                Coin coin = coinRepository.findByCoinGeckoId(request.getCoinGeckoId())
                                .orElseThrow(() -> new IdInvalidException(
                                                "coinGeckoId not found: " + request.getCoinGeckoId()));
                // 2. Check sufficient quantity
                if (coin.getQuantity().compareTo(request.getQuantity()) < 0) {
                        throw new FunctionArgumentException("Not enough quantity to withdraw");
                }
                // 2. Subtract quantity
                coin.setQuantity(coin.getQuantity().subtract(request.getQuantity()));
                coinRepository.save(coin);

                // 3. Log history
                historyRepository.save(InventoryHistory.builder()
                                .coin(coin)
                                .action(InventoryHistory.ActionType.WITHDRAW)
                                .quantityDelta(request.getQuantity().negate())
                                .note(request.getNote())
                                .build());
                return CoinWithdrawResponse.builder()
                                .id(coin.getId())
                                .coinGeckoId(coin.getCoinGeckoId())
                                .withdrewQuantity(request.getQuantity())
                                .newQuantity(coin.getQuantity())
                                .build();
        }

        @Override
        public ResultPaginationDTO getAllCoins(Pageable pageable) {
                Page<Coin> pageCoins = this.coinRepository.findAll(pageable);

                ResultPaginationDTO res = new ResultPaginationDTO();
                ResultPaginationDTO.PageMeta meta = new ResultPaginationDTO.PageMeta();

                meta.setPage(pageable.getPageNumber());
                meta.setPageSize(pageable.getPageSize());
                meta.setPages(pageCoins.getTotalPages());
                meta.setTotal(pageCoins.getTotalElements());

                res.setMeta(meta);
                List<CoinInfoResponse> listCoin = pageCoins.getContent()
                                .stream().map(this::toCoinInfoDto).toList();

                res.setResult(listCoin);
                return res;
        }

        private CoinInfoResponse toCoinInfoDto(Coin c) {
                return CoinInfoResponse.builder()
                                .id(c.getId())
                                .coinGeckoId(c.getCoinGeckoId())
                                .name(c.getName())
                                .symbol(c.getSymbol())
                                .quantity(c.getQuantity())
                                .fee(c.getFee())
                                .build();
        }

}
