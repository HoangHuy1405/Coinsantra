package com.web.TradeApp.feature.coin.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.web.TradeApp.exception.CoinNotFoundException;
import com.web.TradeApp.exception.InsufficientBalanceException;
import com.web.TradeApp.exception.InsufficientCoinException;
import com.web.TradeApp.feature.admin.service.AdminService;
import com.web.TradeApp.feature.coin.dto.BuyCoinRequest;
import com.web.TradeApp.feature.coin.dto.SellCoinRequest;
import com.web.TradeApp.feature.coin.dto.TradeResponse;
import com.web.TradeApp.feature.coin.entity.Coin;
import com.web.TradeApp.feature.coin.entity.CoinHolding;
import com.web.TradeApp.feature.coin.entity.Transaction;
import com.web.TradeApp.feature.coin.entity.Wallet;
import com.web.TradeApp.feature.coin.mapper.TradeMapper;
import com.web.TradeApp.feature.coin.repository.CoinHoldingRepository;
import com.web.TradeApp.feature.coin.repository.CoinRepository;
import com.web.TradeApp.feature.coin.repository.TransactionRepository;
import com.web.TradeApp.feature.coin.repository.WalletRepository;
import com.web.TradeApp.feature.common.entity.BaseTrade.TradeType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TradeServiceImpl implements TradeService {

    private final WalletRepository walletRepository;
    private final CoinRepository coinRepository;
    private final CoinHoldingRepository coinHoldingRepository;
    private final TransactionRepository transactionRepository;
    private final AdminService adminService;
    private final TradeMapper tradeMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=%s&vs_currencies=usd";

    @Override
    @Transactional
    public TradeResponse buyCoin(UUID userId, BuyCoinRequest request) {
        // 1. Fetch user and admin wallets
        Wallet userWallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user"));
        Wallet adminWallet = adminService.getAdminWallet();

        // 2. Fetch coin
        Coin coin = coinRepository.findBySymbol(request.getCoinSymbol().toUpperCase())
                .orElseThrow(() -> new CoinNotFoundException("Coin not found: " + request.getCoinSymbol()));

        // 3. Get current price from CoinGecko
        BigDecimal currentPrice = getCurrentPrice(coin.getCoinGeckoId());

        // 4. Calculate costs
        BigDecimal notionalValue = currentPrice.multiply(request.getQuantity())
                .setScale(8, RoundingMode.HALF_UP);
        // Convert fee percentage to decimal (e.g., 0.025% = 0.025/100 = 0.00025)
        BigDecimal feeAmount = notionalValue.multiply(coin.getFee()).divide(new BigDecimal("100"), 8,
                RoundingMode.HALF_UP);
        BigDecimal totalCost = notionalValue.add(feeAmount);

        // 5. Check user balance
        if (userWallet.getBalance().compareTo(totalCost) < 0) {
            throw new InsufficientBalanceException(
                    String.format("Insufficient balance. Required: %s, Available: %s",
                            totalCost, userWallet.getBalance()));
        }

        // 6. Check admin has enough coins
        CoinHolding adminHolding = coinHoldingRepository.findByWalletIdAndCoinId(adminWallet.getId(), coin.getId())
                .orElseThrow(() -> new InsufficientCoinException(
                        "Admin does not have " + coin.getSymbol() + " available"));

        if (adminHolding.getAmount().compareTo(request.getQuantity()) < 0) {
            throw new InsufficientCoinException(
                    String.format("Insufficient admin %s. Required: %s, Available: %s",
                            coin.getSymbol(), request.getQuantity(), adminHolding.getAmount()));
        }

        // 7. Transfer USDT: User -> Admin
        userWallet.setBalance(userWallet.getBalance().subtract(totalCost));
        adminWallet.setBalance(adminWallet.getBalance().add(totalCost));
        walletRepository.save(userWallet);
        walletRepository.save(adminWallet);

        // 8. Transfer Coin: Admin -> User
        // 8a. Deduct from admin
        adminHolding.setAmount(adminHolding.getAmount().subtract(request.getQuantity()));
        coinHoldingRepository.save(adminHolding);

        // 8b. Add to user (or create holding)
        CoinHolding userHolding = getOrCreateHolding(userWallet, coin);

        // Update average buy price
        BigDecimal totalValue = userHolding.getAverageBuyPrice().multiply(userHolding.getAmount())
                .add(notionalValue);
        BigDecimal totalAmount = userHolding.getAmount().add(request.getQuantity());
        BigDecimal newAverageBuyPrice = totalAmount.compareTo(BigDecimal.ZERO) > 0
                ? totalValue.divide(totalAmount, 8, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        userHolding.setAmount(totalAmount);
        userHolding.setAverageBuyPrice(newAverageBuyPrice);
        coinHoldingRepository.save(userHolding);

        // 9. Create transaction record
        Transaction transaction = Transaction.builder()
                .wallet(userWallet)
                .coin(coin)
                .type(TradeType.BUY)
                .quantity(request.getQuantity())
                .priceAtExecution(currentPrice)
                .notionalValue(notionalValue)
                .feeTradeApplied(feeAmount)
                .source(Transaction.Source.MANUAL)
                .build();
        transaction = transactionRepository.save(transaction);

        // 10. Build response using mapper
        TradeResponse response = tradeMapper.toTradeResponse(transaction);
        response.setTotalCost(totalCost);
        response.setNewWalletBalance(userWallet.getBalance());
        response.setNewCoinHolding(userHolding.getAmount());

        return response;
    }

    @Override
    @Transactional
    public TradeResponse sellCoin(UUID userId, SellCoinRequest request) {
        // 1. Fetch user and admin wallets
        Wallet userWallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user"));
        Wallet adminWallet = adminService.getAdminWallet();

        // 2. Fetch coin
        Coin coin = coinRepository.findBySymbol(request.getCoinSymbol().toUpperCase())
                .orElseThrow(() -> new CoinNotFoundException("Coin not found: " + request.getCoinSymbol()));

        // 3. Get current price from CoinGecko
        BigDecimal currentPrice = getCurrentPrice(coin.getCoinGeckoId());

        // 4. Check user has enough coins
        CoinHolding userHolding = coinHoldingRepository.findByWalletIdAndCoinId(userWallet.getId(), coin.getId())
                .orElseThrow(() -> new InsufficientCoinException("You don't own any " + coin.getSymbol()));

        if (userHolding.getAmount().compareTo(request.getQuantity()) < 0) {
            throw new InsufficientCoinException(
                    String.format("Insufficient %s. Required: %s, Available: %s",
                            coin.getSymbol(), request.getQuantity(), userHolding.getAmount()));
        }

        // 5. Calculate proceeds
        BigDecimal notionalValue = currentPrice.multiply(request.getQuantity())
                .setScale(8, RoundingMode.HALF_UP);
        // Convert fee percentage to decimal (e.g., 0.025% = 0.025/100 = 0.00025)
        BigDecimal feeAmount = notionalValue.multiply(coin.getFee()).divide(new BigDecimal("100"), 8,
                RoundingMode.HALF_UP);
        BigDecimal netProceeds = notionalValue.subtract(feeAmount);

        // 6. Check admin has enough USDT to buy from user
        if (adminWallet.getBalance().compareTo(netProceeds) < 0) {
            throw new RuntimeException("Admin wallet has insufficient balance to purchase coins");
        }

        // 7. Transfer Coin: User -> Admin
        userHolding.setAmount(userHolding.getAmount().subtract(request.getQuantity()));
        BigDecimal newUserAmount = userHolding.getAmount();

        // If holding is now zero, delete it
        if (newUserAmount.compareTo(BigDecimal.ZERO) == 0) {
            coinHoldingRepository.delete(userHolding);
        } else {
            coinHoldingRepository.save(userHolding);
        }

        // Add to admin holding (or create if doesn't exist)
        CoinHolding adminHolding = getOrCreateHolding(adminWallet, coin);
        adminHolding.setAmount(adminHolding.getAmount().add(request.getQuantity()));
        coinHoldingRepository.save(adminHolding);

        // 8. Transfer USDT: Admin -> User
        adminWallet.setBalance(adminWallet.getBalance().subtract(netProceeds));
        userWallet.setBalance(userWallet.getBalance().add(netProceeds));
        walletRepository.save(adminWallet);
        walletRepository.save(userWallet);

        // 9. Create transaction record
        Transaction transaction = Transaction.builder()
                .wallet(userWallet)
                .coin(coin)
                .type(TradeType.SELL)
                .quantity(request.getQuantity())
                .priceAtExecution(currentPrice)
                .notionalValue(notionalValue)
                .feeTradeApplied(feeAmount)
                .source(Transaction.Source.MANUAL)
                .build();
        transaction = transactionRepository.save(transaction);

        // 10. Build response using mapper
        TradeResponse response = tradeMapper.toTradeResponse(transaction);
        response.setTotalCost(netProceeds);
        response.setNewWalletBalance(userWallet.getBalance());
        response.setNewCoinHolding(newUserAmount);

        return response;
    }

    /**
     * Get current price from CoinGecko API
     */
    private BigDecimal getCurrentPrice(String coinGeckoId) {
        try {
            String url = String.format(COINGECKO_API_URL, coinGeckoId);
            @SuppressWarnings("unchecked")
            Map<String, Map<String, Object>> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey(coinGeckoId)) {
                Object priceObj = response.get(coinGeckoId).get("usd");

                // Handle both Integer and Double types from API
                if (priceObj instanceof Number) {
                    return BigDecimal.valueOf(((Number) priceObj).doubleValue());
                }

                throw new RuntimeException("Invalid price format from CoinGecko: " + priceObj);
            }

            throw new RuntimeException("Failed to fetch price for: " + coinGeckoId);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching price from CoinGecko: " + e.getMessage(), e);
        }
    }

    /**
     * Get or create a coin holding for a wallet
     */
    private CoinHolding getOrCreateHolding(Wallet wallet, Coin coin) {
        return coinHoldingRepository.findByWalletIdAndCoinId(wallet.getId(), coin.getId())
                .orElse(CoinHolding.builder()
                        .wallet(wallet)
                        .coin(coin)
                        .amount(BigDecimal.ZERO)
                        .averageBuyPrice(BigDecimal.ZERO)
                        .build());
    }
}
