package com.web.TradeApp.config;

import java.math.BigDecimal;
import java.util.Set;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate; // 1. IMPORT THIS

import com.web.TradeApp.feature.admin.coin.entity.Coin;
import com.web.TradeApp.feature.admin.coin.entity.CoinHolding;
import com.web.TradeApp.feature.admin.coin.entity.Wallet;
import com.web.TradeApp.feature.user.auth.constant.AuthProvider;
import com.web.TradeApp.feature.user.auth.constant.Role;
import com.web.TradeApp.feature.user.entity.User;

import com.web.TradeApp.feature.user.repository.UserRepository;
import com.web.TradeApp.feature.admin.coin.repository.CoinRepository;
import com.web.TradeApp.feature.admin.coin.repository.CoinHoldingRepository;
import com.web.TradeApp.feature.admin.coin.repository.WalletRepository;

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
    private static final BigDecimal ADMIN_BALANCE = new BigDecimal("10000000");
    private static final BigDecimal AMOUNT_COIN = new BigDecimal("1000");

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            log.info("Starting Data Seeding...");

            transactionTemplate.execute(status -> {

                // 1. Seed Admin User
                User admin = userRepository.findByUsername("admin").orElseGet(() -> {
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

                // 2. Seed Admin Wallet
                Wallet wallet = walletRepository.findByUserId(admin.getId()).orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .user(admin)
                            .balance(ADMIN_BALANCE)
                            .build();
                    return walletRepository.save(newWallet);
                });

                // Optional: Force balance update if needed
                if (wallet.getBalance().compareTo(ADMIN_BALANCE) < 0) {
                    wallet.setBalance(ADMIN_BALANCE);
                    walletRepository.save(wallet);
                }

                // 3. Seed Coins and Holdings
                seedCoinAndHolding(wallet, "bitcoin", "Bitcoin", "BTC");
                seedCoinAndHolding(wallet, "ethereum", "Ethereum", "ETH");
                seedCoinAndHolding(wallet, "binancecoin", "BNB", "BNB");
                seedCoinAndHolding(wallet, "solana", "Solana", "SOL");
                seedCoinAndHolding(wallet, "ripple", "XRP", "XRP");
                seedCoinAndHolding(wallet, "cardano", "Cardano", "ADA");
                seedCoinAndHolding(wallet, "dogecoin", "Dogecoin", "DOGE");

                return null;
            });

            log.info("Data Seeding Completed.");
        };
    }

    private void seedCoinAndHolding(Wallet wallet, String coinGeckoId, String name, String symbol) {
        // A. Find or Create Coin
        Coin coin = coinRepository.findByCoinGeckoId(coinGeckoId).orElseGet(() -> {
            return coinRepository.save(Coin.builder()
                    .coinGeckoId(coinGeckoId)
                    .name(name)
                    .symbol(symbol)
                    .fee(FEE)
                    .build());
        });

        // B. Check if Admin already holds this coin
        Optional<CoinHolding> existingHolding = coinHoldingRepository.findByWalletIdAndCoinId(wallet.getId(),
                coin.getId());

        if (existingHolding.isEmpty()) {
            CoinHolding holding = CoinHolding.builder()
                    .wallet(wallet)
                    .coin(coin)
                    .amount(AMOUNT_COIN)
                    .averageBuyPrice(new BigDecimal("100"))
                    .build();
            coinHoldingRepository.save(holding);
        }
    }
}