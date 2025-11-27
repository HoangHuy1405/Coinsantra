package com.web.TradeApp.feature.aibot.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.web.TradeApp.exception.IdInvalidException;
import com.web.TradeApp.exception.InsufficientBalanceException;
import com.web.TradeApp.feature.admin.coin.entity.Coin;
import com.web.TradeApp.feature.admin.coin.entity.CoinHolding;
import com.web.TradeApp.feature.admin.coin.entity.Wallet;
import com.web.TradeApp.feature.admin.coin.repository.CoinHoldingRepository;
import com.web.TradeApp.feature.admin.coin.repository.CoinRepository;
import com.web.TradeApp.feature.admin.coin.repository.WalletRepository;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotCopyRequest;
import com.web.TradeApp.feature.aibot.dto.BotSubscription.BotSubscriptionResponse;
import com.web.TradeApp.feature.aibot.enums.BotAction;
import com.web.TradeApp.feature.aibot.mapper.BotSubMapper;
import com.web.TradeApp.feature.aibot.model.Bot;
import com.web.TradeApp.feature.aibot.model.BotSignal;
import com.web.TradeApp.feature.aibot.model.BotSubscription;
import com.web.TradeApp.feature.aibot.repository.BotRepository;
import com.web.TradeApp.feature.aibot.repository.BotSubscriptionRepository;
import com.web.TradeApp.feature.ingestion.event.SignalReceivedEvent;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class BotSubscriptionServiceImpl implements BotSubscriptionService {

    private final BotSubscriptionRepository subRepo;
    private final BotRepository botRepo;
    private final BotTradeService botTradeService;
    private final WalletRepository walletRepo;
    private final BotSubMapper botSubMapper;
    private final CoinRepository coinRepo;
    private final CoinHoldingRepository holdingRepo;

    @Async
    @EventListener
    @Transactional
    @Override
    public void onSignalReceived(SignalReceivedEvent event) {
        BotSignal signal = event.getSignal();
        processSubscriptions(signal);
    }

    @Override
    public void processSubscriptions(BotSignal signal) {
        Bot bot = signal.getBot();
        // 1. Validate Price
        // We use the price from the SIGNAL (Python Bot) for consistency.
        if (signal.getPrice() == null || signal.getPrice() <= 0) {
            log.error("🚫 Signal Ignored: Invalid Price for Bot {}", bot.getName());
            return;
        }
        BigDecimal executionPrice = BigDecimal.valueOf(signal.getPrice());

        log.info("📢 Starting Fan-Out for Bot: {} | Action: {} | Price: {}",
                bot.getName(), signal.getAction(), executionPrice);

        // 2. Fetch Active Subscriptions
        List<BotSubscription> subscriptions = subRepo.findByBotIdAndActiveTrue(bot.getId());
        if (subscriptions.isEmpty()) {
            log.info("ℹ️ No active subscribers for bot {}", bot.getName());
            return;
        }
        int successCount = 0;
        int failCount = 0;

        for (BotSubscription sub : subscriptions) {
            try {
                processSingleSubscription(sub, signal.getAction(), executionPrice);
                successCount++;
            } catch (Exception e) {
                failCount++;
                log.error("❌ Failed to copy trade for User ID: {} | Error: {}", sub.getUserId(), e.getMessage());
                // We continue loop so other users are not affected
            }
        }

        log.info("✅ Fan-Out Complete. Success: {} | Failed: {}", successCount, failCount);
    }

    private void processSingleSubscription(BotSubscription sub, BotAction action, BigDecimal price) {
        // Delegate the transactional heavy lifting to SimulationTradeService
        if (action == BotAction.BUY) {
            botTradeService.executeBuy(sub, price);
        } else if (action == BotAction.SELL) {
            botTradeService.executeSell(sub, price);
        }
    }

    @Override
    public BotSubscriptionResponse copyBot(UUID userId, BotCopyRequest request) {
        // validate if user have already copied this bot
        if (subRepo.existsByUserIdAndBotId(userId, request.botId())) {
            throw new IllegalArgumentException(
                    "You are already subscribed to this Bot. Please update your existing subscription instead.");
        }

        // validate balance
        validateSufficientAsset(userId, request.botId(), request.allocatedAmount(), request.allocatedCoin());

        BotSubscription sub = botSubMapper.toEntity(request);
        Bot bot = botRepo.findById(request.botId())
                .orElseThrow(() -> new IdInvalidException("bot id is null"));
        sub.setBot(bot);
        sub.setUserId(userId);
        subRepo.save(sub);

        BotSubscription savedSub = subRepo.save(sub);

        return botSubMapper.toResponse(savedSub);
    }

    @Override
    @Transactional
    public BotSubscriptionResponse updateBotSub(UUID botSubId, UUID userId, BotCopyRequest request) {
        // 1. Fetch Existing Subscription
        BotSubscription sub = subRepo.findById(botSubId)
                .orElseThrow(() -> new IdInvalidException("Subscription not found for ID: " + botSubId));

        // 2. Validate Ownership
        if (!sub.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You do not have permission to update this subscription.");
        }

        // 3. Validate Assets for the NEW allocation amounts
        // We re-run validation to ensure the user has enough funds for the updated
        // target
        validateSufficientAsset(userId, request.botId(), request.allocatedAmount(), request.allocatedCoin());

        // 4. Update Fields
        botSubMapper.updateEntityFromDto(request, sub);

        // 5. Handle Bot Switch (if user changed the bot strategy)
        if (!sub.getBot().getId().equals(request.botId())) {
            Bot newBot = botRepo.findById(request.botId())
                    .orElseThrow(() -> new IdInvalidException("New Bot ID not found: " + request.botId()));
            sub.setBot(newBot);
        }
        BotSubscription updatedSub = subRepo.save(sub);
        return botSubMapper.toResponse(updatedSub);
    }

    /**
     * Checks if the user's wallet has enough USDT to cover the allocated amount.
     * Throws InsufficientBalanceException if funds are low.
     */
    private void validateSufficientAsset(UUID userId, UUID botId, BigDecimal allocatedAmount,
            BigDecimal allocatedCoin) {
        Wallet wallet = walletRepo.findByUserId(userId)
                .orElseThrow(() -> new IdInvalidException("User Wallet not found for ID: " + userId));

        // Check if Balance < Allocation
        if (wallet.getBalance().compareTo(allocatedAmount) < 0) {
            log.warn("❌ Copy Bot Failed: Insufficient Balance. User: {}, Has: {}, Needs: {}",
                    userId, wallet.getBalance(), allocatedAmount);
            throw new InsufficientBalanceException(
                    "Insufficient Wallet Balance. You have " + wallet.getBalance() + " USDT but tried to allocate "
                            + allocatedAmount + " USDT.");
        }
        if (allocatedCoin.compareTo(BigDecimal.ZERO) > 0) {
            // 1. Find which coin the bot trades
            Bot bot = botRepo.findById(botId)
                    .orElseThrow(() -> new IdInvalidException("Bot not found: " + botId));

            Coin coin = coinRepo.findBySymbol(bot.getCoinSymbol())
                    .orElseThrow(() -> new IdInvalidException("Coin not found for symbol: " + bot.getCoinSymbol()));

            // 2. Find user's holding of that coin
            CoinHolding holding = holdingRepo.findByWalletIdAndCoinId(wallet.getId(), coin.getId())
                    .orElseThrow(() -> new InsufficientBalanceException(
                            "You do not own any " + coin.getSymbol() + " to allocate."));

            // 3. Check sufficiency
            if (holding.getAmount().compareTo(allocatedCoin) < 0) {
                log.warn("❌ Copy Bot Failed: Insufficient Coin. User: {}, Has: {} {}, Needs: {}",
                        userId, holding.getAmount(), coin.getSymbol(), allocatedCoin);
                throw new InsufficientBalanceException(
                        "Insufficient " + coin.getSymbol() + " Balance. You have " + holding.getAmount()
                                + " but tried to allocate " + allocatedCoin);
            }
        }
    }

    @Override
    public BotSubscriptionResponse toggleSubscription(UUID botSubId, UUID userId, boolean active) {
        // 1. Fetch
        BotSubscription sub = subRepo.findById(botSubId)
                .orElseThrow(() -> new IdInvalidException("Subscription not found for ID: " + botSubId));

        // 2. Validate Ownership
        if (!sub.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You do not have permission to modify this subscription.");
        }
        sub.setActive(active);

        if (!active) {
            sub.setStoppedAt(Instant.now()); // Mark when it was paused
        } else {
            sub.setStoppedAt(null); // Clear stop time if resuming
        }
        BotSubscription savedSub = subRepo.save(sub);
        return botSubMapper.toResponse(savedSub);
    }

}
