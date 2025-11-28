package com.web.TradeApp.feature.admin;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.feature.admin.service.AdminCoinService;
import com.web.TradeApp.feature.coin.dto.CoinDepositRequest;
import com.web.TradeApp.feature.coin.dto.CoinDepositResponse;
import com.web.TradeApp.feature.coin.dto.CoinWithdrawRequest;
import com.web.TradeApp.feature.coin.dto.CoinWithdrawResponse;
import com.web.TradeApp.feature.common.Annotation.ApiMessage;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// already authorize role in securityConfig
@RestController
@RequestMapping("admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminCoinService adminCoinService;

    @PostMapping("/coins/deposit")
    @ApiMessage("Coin deposited successfully")
    public ResponseEntity<CoinDepositResponse> depositCoin(
            @Valid @RequestBody CoinDepositRequest request) {

        CoinDepositResponse response = adminCoinService.depositCoin(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/coins/withdraw")
    @ApiMessage("Coin withdrew successfully")
    public ResponseEntity<CoinWithdrawResponse> withdrawCoin(
            @Valid @RequestBody CoinWithdrawRequest request) {

        CoinWithdrawResponse response = adminCoinService.withdrawCoin(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/coins")
    @ApiMessage("Coins fetched successfully")
    public ResponseEntity<ResultPaginationResponse> getAllCoins(
            Pageable pageable) {
        ResultPaginationResponse result = adminCoinService.getAllCoins(pageable);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }
}
