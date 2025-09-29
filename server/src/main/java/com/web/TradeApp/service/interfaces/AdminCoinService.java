package com.web.TradeApp.service.interfaces;

import org.springframework.data.domain.Pageable;

import com.web.TradeApp.dto.ResultPaginationDTO;
import com.web.TradeApp.dto.CoinDTO.CoinDepositRequest;
import com.web.TradeApp.dto.CoinDTO.CoinDepositResponse;

public interface AdminCoinService {
    CoinDepositResponse depositCoin(CoinDepositRequest request);

    ResultPaginationDTO getAllCoins(Pageable pageable);
}
