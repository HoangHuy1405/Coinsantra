package com.web.TradeApp.config.seeder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import java.util.Random;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
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
    private static final BigDecimal ADMIN_COIN_AMOUNT = new BigDecimal("100");

    // User Config
    private static final BigDecimal USER_BALANCE = new BigDecimal("10000"); // 10,000 USDT
    private static final BigDecimal USER_BTC_AMOUNT = new BigDecimal("2"); // 2 BTC

    @Bean
    @Order(1)
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
                            .netInvestment(ADMIN_BALANCE) // Initial investment = initial balance
                            .build();
                    newWallet.setCreatedBy("admin@example.com");
                    return walletRepository.save(newWallet);
                });

                // Force balance update for Admin if needed
                if (wallet.getBalance().compareTo(ADMIN_BALANCE) < 0) {
                    wallet.setBalance(ADMIN_BALANCE);
                }

                // Initialize Admin Investment Calculation
                BigDecimal adminInvestment = ADMIN_BALANCE;

                // Seed Admin Coins (1000 of each) & accumulate investment
                adminInvestment = adminInvestment
                        .add(seedCoinAndHolding(wallet, "bitcoin", "Bitcoin", "BTC", ADMIN_COIN_AMOUNT));
                adminInvestment = adminInvestment
                        .add(seedCoinAndHolding(wallet, "ethereum", "Ethereum", "ETH", ADMIN_COIN_AMOUNT));
                adminInvestment = adminInvestment
                        .add(seedCoinAndHolding(wallet, "binancecoin", "BNB", "BNB", ADMIN_COIN_AMOUNT));
                adminInvestment = adminInvestment
                        .add(seedCoinAndHolding(wallet, "solana", "Solana", "SOL", ADMIN_COIN_AMOUNT));
                adminInvestment = adminInvestment
                        .add(seedCoinAndHolding(wallet, "ripple", "XRP", "XRP", ADMIN_COIN_AMOUNT));
                adminInvestment = adminInvestment
                        .add(seedCoinAndHolding(wallet, "cardano", "Cardano", "ADA", ADMIN_COIN_AMOUNT));
                adminInvestment = adminInvestment
                        .add(seedCoinAndHolding(wallet, "dogecoin", "Dogecoin", "DOGE", ADMIN_COIN_AMOUNT));

                // Update Admin Net Investment
                wallet.setNetInvestment(adminInvestment);
                walletRepository.save(wallet);

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
                    .netInvestment(USER_BALANCE)
                    .build();
            newWallet.setCreatedBy(email);
            return walletRepository.save(newWallet);
        });

        // Ensure balance is at least 10,000
        if (wallet.getBalance().compareTo(USER_BALANCE) < 0) {
            wallet.setBalance(USER_BALANCE);
        }

        // --- Calculate Net Investment for this User ---
        // Start with the cash balance
        BigDecimal totalInvestment = USER_BALANCE;

        // Add value of seeded coins (Amount * Approx Price)
        totalInvestment = totalInvestment.add(seedCoinAndHolding(wallet, "bitcoin", "Bitcoin", "BTC", USER_BTC_AMOUNT));
        totalInvestment = totalInvestment
                .add(seedCoinAndHolding(wallet, "ethereum", "Ethereum", "ETH", generateRandomAmount(0, 2)));
        totalInvestment = totalInvestment
                .add(seedCoinAndHolding(wallet, "binancecoin", "Binance Coin", "BNB", generateRandomAmount(0, 2)));
        totalInvestment = totalInvestment
                .add(seedCoinAndHolding(wallet, "solana", "Solana", "SOL", generateRandomAmount(0, 2)));
        totalInvestment = totalInvestment
                .add(seedCoinAndHolding(wallet, "ripple", "Ripple", "XRP", generateRandomAmount(0, 2)));
        totalInvestment = totalInvestment
                .add(seedCoinAndHolding(wallet, "cardano", "Cardano", "ADA", generateRandomAmount(0, 2)));
        totalInvestment = totalInvestment
                .add(seedCoinAndHolding(wallet, "dogecoin", "Dogecoin", "DOGE", generateRandomAmount(0, 2)));

        // Update Wallet with the calculated Net Investment
        wallet.setNetInvestment(totalInvestment);
        walletRepository.save(wallet);
    }

    /**
     * Seeds a coin holding and returns the estimated value (Price * Amount)
     * so it can be added to netInvestment.
     */
    private BigDecimal seedCoinAndHolding(Wallet wallet, String coinGeckoId, String name, String symbol,
            BigDecimal amount) {
        // 1. Get Approx Real World Price
        BigDecimal approxPrice = getFixedPrice(symbol);

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
                    .averageBuyPrice(approxPrice) // Use real-world price as entry price
                    .build();
            coinHoldingRepository.save(holding);
        }

        // Return the value (Price * Amount) to add to netInvestment
        return amount.multiply(approxPrice);
    }

    private BigDecimal generateRandomAmount(double min, double max) {
        BigDecimal minBd = BigDecimal.valueOf(min);
        BigDecimal maxBd = BigDecimal.valueOf(max);
        BigDecimal range = maxBd.subtract(minBd);
        BigDecimal factor = BigDecimal.valueOf(new Random().nextDouble());

        return minBd.add(range.multiply(factor))
                .setScale(8, RoundingMode.HALF_UP);
    }

    /**
     * Returns approximate real-world prices (Dec 2025 / Current Market levels)
     * Used to calculate realistic Net Investment.
     */
    private BigDecimal getFixedPrice(String symbol) {
        return switch (symbol.toUpperCase()) {
            case "BTC" -> new BigDecimal("85000.00");
            case "ETH" -> new BigDecimal("2500.00");
            case "BNB" -> new BigDecimal("500.00");
            case "SOL" -> new BigDecimal("200.00");
            case "XRP" -> new BigDecimal("2");
            case "ADA" -> new BigDecimal("1");
            case "DOGE" -> new BigDecimal("0.25");
            default -> BigDecimal.ZERO;
        };
    }
}