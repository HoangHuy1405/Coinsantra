package com.web.TradeApp.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.web.TradeApp.dto.ResultPaginationDTO;
import com.web.TradeApp.dto.CoinDTO.CoinDepositRequest;
import com.web.TradeApp.dto.CoinDTO.CoinDepositResponse;
import com.web.TradeApp.dto.CoinDTO.CoinInfoResponse;
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

        @Override
        @Transactional
        public CoinDepositResponse depositCoin(CoinDepositRequest request) {
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
                                .uuid(coin.getId())
                                .coinGeckoId(coin.getCoinGeckoId())
                                .symbol(coin.getSymbol())
                                .name(coin.getName())
                                .depositedQuantity(request.getQuantity())
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
