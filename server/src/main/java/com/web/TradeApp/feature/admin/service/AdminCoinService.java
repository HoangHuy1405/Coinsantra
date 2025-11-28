package com.web.TradeApp.feature.admin.service;

import org.springframework.data.domain.Pageable;

import com.web.TradeApp.feature.coin.dto.CoinDepositRequest;
import com.web.TradeApp.feature.coin.dto.CoinDepositResponse;
import com.web.TradeApp.feature.coin.dto.CoinWithdrawRequest;
import com.web.TradeApp.feature.coin.dto.CoinWithdrawResponse;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;

public interface AdminCoinService {
    CoinDepositResponse depositCoin(CoinDepositRequest request);

    CoinWithdrawResponse withdrawCoin(CoinWithdrawRequest request);

    ResultPaginationResponse getAllCoins(Pageable pageable);

}
