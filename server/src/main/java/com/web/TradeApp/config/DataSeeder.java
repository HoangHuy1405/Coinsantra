package com.web.TradeApp.config;

import java.math.BigDecimal;
import java.util.Set;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;

import com.web.TradeApp.feature.coin.entity.Coin;
import com.web.TradeApp.feature.coin.entity.CoinHolding;
import com.web.TradeApp.feature.coin.entity.Wallet;
import com.web.TradeApp.feature.coin.repository.CoinHoldingRepository;
import com.web.TradeApp.feature.coin.repository.CoinRepository;
import com.web.TradeApp.feature.coin.repository.WalletRepository;
import com.web.TradeApp.feature.user.auth.constant.AuthProvider;
import com.web.TradeApp.feature.user.auth.constant.Role;
import com.web.TradeApp.feature.user.entity.User;

import com.web.TradeApp.feature.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final CoinRepository coinRepository;
    private final CoinHoldingRepository coinHoldingRepository;

    private final TransactionTemplate transactionTemplate;

    public static final String uniqueAdminUsername = "admin";
    private static final BigDecimal FEE = new BigDecimal("0.025");

    // Admin Config
    private static final BigDecimal ADMIN_BALANCE = new BigDecimal("10000000");
    private static final BigDecimal ADMIN_COIN_AMOUNT = new BigDecimal("1000");

    // User Config
    private static final BigDecimal USER_BALANCE = new BigDecimal("10000"); // 10,000 USDT
    private static final BigDecimal USER_BTC_AMOUNT = new BigDecimal("10"); // 10 BTC

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            log.info("Starting Data Seeding...");

            transactionTemplate.execute(status -> {

                // --- 1. SEED TRADERS (User1 & User2) ---
                seedTrader("user1", "John", "Paul", "user1@example.com", "02546113841");
                seedTrader("user2", "Michael", "Jackson", "user2@example.com", "02546113234");
                seedTrader("user3", "Duy", "Tien", "user3@example.com", "02546163234");

                // --- 2. SEED ADMIN ---
                User admin = userRepository.findByUsername(uniqueAdminUsername).orElseGet(() -> {
                    User newAdmin = User.builder()
                            .username(uniqueAdminUsername)
                            .firstName("System")
                            .lastName("Admin")
                            .email("admin@example.com")
                            .password(passwordEncoder.encode("admin"))
                            .roles(Set.of(Role.ADMIN, Role.TRADER))
                            .phoneNum("1234567890")
                            .enabled(true)
                            .accountLocked(false)
                            .authProvider(AuthProvider.CREDENTIALS)
                            .build();
                    return userRepository.save(newAdmin);
                });

                // Seed Admin Wallet
                Wallet wallet = walletRepository.findByUserId(admin.getId()).orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .user(admin)
                            .balance(ADMIN_BALANCE)
                            .build();
                    return walletRepository.save(newWallet);
                });

                // Force balance update for Admin if needed
                if (wallet.getBalance().compareTo(ADMIN_BALANCE) < 0) {
                    wallet.setBalance(ADMIN_BALANCE);
                    walletRepository.save(wallet);
                }

                // Seed Admin Coins (1000 of each)
                seedCoinAndHolding(wallet, "bitcoin", "Bitcoin", "BTC", ADMIN_COIN_AMOUNT);
                seedCoinAndHolding(wallet, "ethereum", "Ethereum", "ETH", ADMIN_COIN_AMOUNT);
                seedCoinAndHolding(wallet, "binancecoin", "BNB", "BNB", ADMIN_COIN_AMOUNT);
                seedCoinAndHolding(wallet, "solana", "Solana", "SOL", ADMIN_COIN_AMOUNT);
                seedCoinAndHolding(wallet, "ripple", "XRP", "XRP", ADMIN_COIN_AMOUNT);
                seedCoinAndHolding(wallet, "cardano", "Cardano", "ADA", ADMIN_COIN_AMOUNT);
                seedCoinAndHolding(wallet, "dogecoin", "Dogecoin", "DOGE", ADMIN_COIN_AMOUNT);

                return null;
            });

            log.info("Data Seeding Completed.");
        };
    }

    private void seedTrader(String username, String firstName, String lastName, String email, String phone) {
        // A. Create User
        User user = userRepository.findByUsername(username).orElseGet(() -> {
            User newUser = User.builder()
                    .username(username)
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(passwordEncoder.encode("root"))
                    .roles(Set.of(Role.TRADER))
                    .phoneNum(phone)
                    .enabled(true)
                    .accountLocked(false)
                    .authProvider(AuthProvider.CREDENTIALS)
                    .build();
            return userRepository.save(newUser);
        });

        // B. Create Wallet with 10,000 USDT
        Wallet wallet = walletRepository.findByUserId(user.getId()).orElseGet(() -> {
            Wallet newWallet = Wallet.builder()
                    .user(user)
                    .balance(USER_BALANCE)
                    .build();
            return walletRepository.save(newWallet);
        });

        // Ensure balance is at least 10,000 (if existed previously with 0)
        if (wallet.getBalance().compareTo(USER_BALANCE) < 0) {
            wallet.setBalance(USER_BALANCE);
            walletRepository.save(wallet);
        }

        // C. Seed 10 BTC
        seedCoinAndHolding(wallet, "bitcoin", "Bitcoin", "BTC", USER_BTC_AMOUNT);
    }

    private void seedCoinAndHolding(Wallet wallet, String coinGeckoId, String name, String symbol, BigDecimal amount) {
        // A. Find or Create Coin
        Coin coin = coinRepository.findByCoinGeckoId(coinGeckoId).orElseGet(() -> {
            return coinRepository.save(Coin.builder()
                    .coinGeckoId(coinGeckoId)
                    .name(name)
                    .symbol(symbol)
                    .fee(FEE)
                    .build());
        });

        // B. Check if User already holds this coin
        Optional<CoinHolding> existingHolding = coinHoldingRepository.findByWalletIdAndCoinId(wallet.getId(),
                coin.getId());

        if (existingHolding.isEmpty()) {
            CoinHolding holding = CoinHolding.builder()
                    .wallet(wallet)
                    .coin(coin)
                    .amount(amount)
                    .averageBuyPrice(new BigDecimal("60000")) // Dummy entry price for BTC
                    .build();
            coinHoldingRepository.save(holding);
        }
    }
}