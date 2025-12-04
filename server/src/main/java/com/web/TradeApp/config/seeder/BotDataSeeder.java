package com.web.TradeApp.config.seeder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.support.TransactionTemplate;

import com.web.TradeApp.feature.aibot.enums.BotCategory;
import com.web.TradeApp.feature.aibot.enums.BotStatus;
import com.web.TradeApp.feature.aibot.enums.RiskLevel;
import com.web.TradeApp.feature.aibot.model.Bot;
import com.web.TradeApp.feature.aibot.model.BotSubscription;
import com.web.TradeApp.feature.aibot.repository.BotRepository;
import com.web.TradeApp.feature.aibot.repository.BotSubscriptionRepository;
import com.web.TradeApp.feature.user.entity.User;
import com.web.TradeApp.feature.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class BotDataSeeder {

    private final BotRepository botRepository;
    private final BotSubscriptionRepository botSubscriptionRepository;
    private final UserRepository userRepository;
    private final TransactionTemplate transactionTemplate;

    @Value("${bot.api.url:}")
    private String botApiUrl;

    @Value("${bot.api.key:}")
    private String botApiKey;

    @Value("${bot.api.secret:}")
    private String botApiSecret;

    private static final String BOT_NAME = "BTC Trading Bot Alpha";
    private static final BigDecimal BOT_FEE = new BigDecimal("0.01");

    @Bean
    @Order(2)
    public CommandLineRunner seedBotData() {
        return args -> {
            log.info("Starting Bot Data Seeding...");

            transactionTemplate.execute(status -> {
                // --- 1. SEED BOT ---
                Bot bot = botRepository.findAll().stream()
                        .filter(b -> BOT_NAME.equals(b.getName()))
                        .findFirst()
                        .orElseGet(() -> {
                            Bot newBot = Bot.builder()
                                    .name(BOT_NAME)
                                    .description(
                                            "An AI-powered trading bot specializing in Bitcoin (BTC) trading with advanced trend-following algorithms. "
                                                    +
                                                    "This bot analyzes market patterns, volume trends, and momentum indicators to execute strategic trades.")
                                    .coinSymbol("BTC")
                                    .tradingPair("BTC/USDT")
                                    .riskLevel(RiskLevel.MEDIUM)
                                    .category(BotCategory.AI_PREDICTIVE)
                                    .status(BotStatus.ACTIVE)
                                    .fee(BOT_FEE)
                                    .apiUrl(botApiUrl)
                                    .apiKey(botApiKey)
                                    .apiSecret(botApiSecret)
                                    .build();
                            Bot savedBot = botRepository.save(newBot);
                            log.info("Created Bot: {} with ID: {}", savedBot.getName(), savedBot.getId());
                            return savedBot;
                        });

                // --- 2. SEED BOT SUBSCRIPTIONS ---
                seedBotSubscription(bot, "user1", new BigDecimal(1000), new BigDecimal(0.5), new BigDecimal(.01));
                seedBotSubscription(bot, "user2", new BigDecimal(2000), new BigDecimal(1), new BigDecimal(.02));

                return null;
            });

            log.info("Bot Data Seeding Completed.");
        };
    }

    private void seedBotSubscription(Bot bot, String username, BigDecimal initialBalance,
            BigDecimal initialCoinAmount, BigDecimal tradePercentage) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            log.warn("User {} not found, skipping bot subscription", username);
            return;
        }

        User user = userOpt.get();
        UUID userId = user.getId();

        // Check if subscription already exists
        Optional<BotSubscription> existingSubscription = botSubscriptionRepository.findByUserIdAndBotId(userId,
                bot.getId());

        if (existingSubscription.isEmpty()) {
            // Calculate net investment (balance + coin value at current price)
            // For seeding, we'll use a simplified approach assuming initial investment
            // equals
            // the total value
            BigDecimal netInvestment = initialBalance
                    .add(initialCoinAmount.multiply(new BigDecimal("60000"))); // Assuming BTC price = 60000 for
                                                                               // initial calculation (doesnt matter
                                                                               // that much)

            BotSubscription subscription = BotSubscription.builder()
                    .bot(bot)
                    .userId(userId)
                    .botWalletBalance(initialBalance)
                    .botWalletCoin(initialCoinAmount)
                    .netInvestment(netInvestment)
                    .tradePercentage(tradePercentage)
                    .active(true)
                    .startedAt(Instant.now())
                    .maxDailyLossPercentage(10.0) // Optional: 10% max daily loss
                    .build();

            botSubscriptionRepository.save(subscription);
            log.info("Created BotSubscription for User: {} (ID: {}) to Bot: {}", username, userId, bot.getName());
        } else {
            log.info("BotSubscription already exists for User: {} to Bot: {}", username, bot.getName());
        }
    }
}
