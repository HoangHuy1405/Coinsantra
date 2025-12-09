package com.web.TradeApp.feature.aibot.service;

import com.web.TradeApp.exception.IdInvalidException;
import com.web.TradeApp.exception.InsufficientBalanceException;
import com.web.TradeApp.feature.admin.service.AdminService;
import com.web.TradeApp.feature.aibot.model.BotSubscription;
import com.web.TradeApp.feature.aibot.model.BotTrade;
import com.web.TradeApp.feature.aibot.repository.BotSubscriptionRepository;
import com.web.TradeApp.feature.aibot.repository.BotTradeRepository;
import com.web.TradeApp.feature.coin.entity.Coin;
import com.web.TradeApp.feature.coin.entity.CoinHolding;
import com.web.TradeApp.feature.coin.entity.Transaction;
import com.web.TradeApp.feature.coin.entity.Wallet;
import com.web.TradeApp.feature.coin.repository.CoinHoldingRepository;
import com.web.TradeApp.feature.coin.repository.CoinRepository;
import com.web.TradeApp.feature.coin.repository.TransactionRepository;
import com.web.TradeApp.feature.coin.repository.WalletRepository;
import com.web.TradeApp.feature.common.entity.BaseTrade;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class BotTradeServiceImpl implements BotTradeService {

        private final WalletRepository walletRepo;
        private final CoinRepository coinRepo;
        private final CoinHoldingRepository coinHoldingRepo;
        private final TransactionRepository transactionRepo;
        private final BotSubscriptionRepository subRepo;
        private final BotTradeRepository botTradeRepo;
        private final AdminService adminService;

        // Minimum trade value in USDT to prevent dust attacks or illogical trades
        private static final BigDecimal MIN_TRADE_VALUE_USDT = BigDecimal.valueOf(5.0);

        /**
         * EXECUTE BUY
         * User pays USDT -> Receives BTC (Minus Fees)
         * * Logic:
         * 1. Calculate Gross USDT to spend = Allocation Amount * Trade Percentage
         * (e.g., 100 USDT * 10% = 10 USDT)
         * 2. Check Wallet Balance & Min Trade Value.
         * 3. Apply Fees: Final BTC = (Gross USDT / Price) * (1 - SysFee) * (1 - BotFee)
         */
        @Transactional
        public void executeBuy(BotSubscription sub, BigDecimal price) {
                // 1. Validate Input
                if (price.compareTo(BigDecimal.ZERO) <= 0)
                        return;

                // get wallet of that user
                Wallet userWallet = walletRepo.findByUserId(sub.getUserId())
                                .orElseThrow(() -> new RuntimeException("Wallet not found"));
                Wallet adminWallet = adminService.getAdminWallet();

                // 2. Calculate Gross Amount to Spend (USDT)
                // Formula: Allocation Amount (e.g. 100) * Trade % (e.g. 0.1)
                BigDecimal grossUsdtToSpend = sub.getBotWalletBalance()
                                .multiply(sub.getTradePercentage())
                                .setScale(6, RoundingMode.DOWN);

                // 3. Check Minimum Value (> 5 USDT)
                if (grossUsdtToSpend.compareTo(MIN_TRADE_VALUE_USDT) <= 0) {
                        log.info("🚫 BUY Skipped: Amount {} USDT is below minimum (5 USDT) for user {}",
                                        grossUsdtToSpend, sub.getUserId());
                        return;
                }

                // 4. Check Real Wallet Balance (just for Safety Net - if else below should
                // never fall in)
                if (userWallet.getBalance().compareTo(grossUsdtToSpend) < 0) {
                        log.warn("💰 Insufficient Wallet Funds: User {} has {} but needs {}",
                                        sub.getUserId(), userWallet.getBalance(), grossUsdtToSpend);
                        return;
                }

                Coin coin = coinRepo.findBySymbol(sub.getBot().getCoinSymbol())
                                .orElseThrow(() -> new RuntimeException(
                                                "Coin not found: " + sub.getBot().getCoinSymbol()));

                // 5. Fee Calculation
                BigDecimal systemFeePct = coin.getFee(); // e.g. 0.025
                BigDecimal botFeePct = sub.getBot().getFee(); // e.g. 0.1

                // Step A: Calculate Raw BTC (without fees)
                BigDecimal rawQuantity = grossUsdtToSpend.divide(price, 10, RoundingMode.DOWN);

                // Step B: Apply Fees sequentially
                // Formula: raw * (1-fee1) * (1-fee2)
                BigDecimal afterSysFee = rawQuantity.multiply(BigDecimal.ONE.subtract(systemFeePct));
                BigDecimal finalQuantity = afterSysFee.multiply(BigDecimal.ONE.subtract(botFeePct))
                                .setScale(8, RoundingMode.DOWN);

                // 6. Execute Transfer
                // A. USDT: User -> Admin
                userWallet.setBalance(userWallet.getBalance().subtract(grossUsdtToSpend));
                adminWallet.setBalance(adminWallet.getBalance().add(grossUsdtToSpend));
                walletRepo.save(userWallet);
                walletRepo.save(adminWallet);

                // B. COIN: Admin -> User
                // B.1. Add Coin to user
                CoinHolding userHolding = getOrCreateHolding(userWallet, coin);
                BigDecimal newTotalQty = userHolding.getAmount().add(finalQuantity);

                userHolding.setAmount(newTotalQty);

                // Update Average Buy Price logic
                BigDecimal currentCost = userHolding.getAmount().multiply(userHolding.getAverageBuyPrice());
                BigDecimal newTotalCost = currentCost.add(grossUsdtToSpend);

                if (newTotalQty.compareTo(BigDecimal.ZERO) > 0) {
                        userHolding.setAverageBuyPrice(newTotalCost.divide(newTotalQty, 8, RoundingMode.HALF_UP));
                }
                coinHoldingRepo.save(userHolding);

                // B.2.Deduct Coin from Admin
                CoinHolding adminHolding = getOrCreateHolding(adminWallet, coin);

                // Check if Admin actually has enough coin (optional safety)
                if (adminHolding.getAmount().compareTo(finalQuantity) < 0) {
                        log.error("🚨 LIQUIDITY CRISIS: Admin wallet empty for {}", coin.getSymbol());
                        throw new RuntimeException("System Maintenance: Insufficient Liquidity");
                }
                adminHolding.setAmount(adminHolding.getAmount().subtract(finalQuantity));
                coinHoldingRepo.save(adminHolding);

                // 7. UPDATE VIRTUAL BALANCES OF BOT (The "Sub-Wallet" Logic)
                // Decrease USDT Allocation
                sub.setBotWalletBalance(sub.getBotWalletBalance().subtract(grossUsdtToSpend));
                // Increase Coin Allocation
                sub.setBotWalletCoin(sub.getBotWalletCoin().add(finalQuantity));
                subRepo.save(sub);

                // 8. Save Records
                saveTransaction(userWallet, coin, BaseTrade.TradeType.BUY, finalQuantity, price, grossUsdtToSpend);
                saveBotTrade(sub, BaseTrade.TradeType.BUY, finalQuantity, price, grossUsdtToSpend, grossUsdtToSpend);

                log.info("✅ BUY: User {} | Spent {} USDT | Got {} {}", sub.getUserId(), grossUsdtToSpend, finalQuantity,
                                coin.getSymbol());
        }

        private CoinHolding getOrCreateHolding(Wallet wallet, Coin coin) {
                return coinHoldingRepo.findByWalletIdAndCoinId(wallet.getId(), coin.getId())
                                .orElse(CoinHolding.builder()
                                                .wallet(wallet)
                                                .coin(coin)
                                                .amount(BigDecimal.ZERO)
                                                .averageBuyPrice(BigDecimal.ZERO)
                                                .build());
        }

        /**
         * EXECUTE SELL
         * User sells BTC -> Receives USDT (Minus Fees)
         * * Logic:
         * 1. Calculate Quantity to Sell = Held Quantity * Trade Percentage
         * (e.g. 2 BTC * 10% = 0.2 BTC)
         * 2. Apply Fees: Final USDT = (0.2 * Price) * (1 - SysFee) * (1 - BotFee)
         */
        @Transactional
        public void executeSell(BotSubscription sub, BigDecimal price) {
                if (price.compareTo(BigDecimal.ZERO) <= 0)
                        return;

                // 1. Fetch Wallets
                Wallet userWallet = walletRepo.findByUserId(sub.getUserId())
                                .orElseThrow(() -> new IdInvalidException("User Wallet not found"));
                Wallet adminWallet = adminService.getAdminWallet();

                Coin coin = coinRepo.findBySymbol(sub.getBot().getCoinSymbol())
                                .orElseThrow(() -> new IdInvalidException("Coin not found"));

                // User must have this holding to sell
                CoinHolding userHolding = coinHoldingRepo.findByWalletIdAndCoinId(userWallet.getId(), coin.getId())
                                .orElseThrow(() -> new InsufficientBalanceException("No holding found to sell"));

                // 2. Calculate Coin to Sell based on VIRTUAL Balance
                // Formula: Allocated Coin * Trade %
                BigDecimal quantityToSell = sub.getBotWalletCoin()
                                .multiply(sub.getTradePercentage())
                                .setScale(8, RoundingMode.DOWN);

                // 3. Validations
                if (quantityToSell.compareTo(BigDecimal.ZERO) <= 0)
                        return;

                // Safety: Ensure User actually has this amount in real DB (Real vs Virtual
                // sync)
                if (userHolding.getAmount().compareTo(quantityToSell) < 0) {
                        log.warn("⚠️ Mismatch: User {} virtual alloc says sell {}, but real holding is only {}. Adjusting.",
                                        sub.getUserId(), quantityToSell, userHolding.getAmount());
                        quantityToSell = userHolding.getAmount();
                }

                BigDecimal rawUsdtValue = quantityToSell.multiply(price);
                if (rawUsdtValue.compareTo(MIN_TRADE_VALUE_USDT) <= 0) {
                        log.info("🚫 SELL Skipped: Value {} USDT is below minimum", rawUsdtValue);
                        return;
                }

                // 4. Calculate Fees & Net USDT
                BigDecimal systemFeePct = coin.getFee();
                BigDecimal botFeePct = sub.getBot().getFee();

                // Formula: rawUSDT * (1 - sysFee) * (1 - botFee)
                BigDecimal afterSysFee = rawUsdtValue.multiply(BigDecimal.ONE.subtract(systemFeePct));
                BigDecimal finalUsdt = afterSysFee.multiply(BigDecimal.ONE.subtract(botFeePct))
                                .setScale(6, RoundingMode.DOWN);

                // 5. TRANSFERS (Counterparty Logic)

                // A. COIN: User -> Admin
                userHolding.setAmount(userHolding.getAmount().subtract(quantityToSell));
                coinHoldingRepo.save(userHolding);

                CoinHolding adminHolding = getOrCreateHolding(adminWallet, coin);
                adminHolding.setAmount(adminHolding.getAmount().add(quantityToSell));
                coinHoldingRepo.save(adminHolding);

                // B. USDT: Admin -> User
                // Check Admin Liquidity
                if (adminWallet.getBalance().compareTo(finalUsdt) < 0) {
                        log.error("🚨 CRITICAL: Admin Wallet Insufficient USDT to pay User for SELL!");
                        throw new InsufficientBalanceException("System Liquidity Error: Cannot Process Sell");
                }

                adminWallet.setBalance(adminWallet.getBalance().subtract(finalUsdt));
                userWallet.setBalance(userWallet.getBalance().add(finalUsdt));

                walletRepo.save(adminWallet);
                walletRepo.save(userWallet);

                // 6. UPDATE VIRTUAL BALANCES
                // Decrease Virtual Coin
                sub.setBotWalletCoin(sub.getBotWalletCoin().subtract(quantityToSell));
                // Increase Virtual USDT (Re-invest logic)
                sub.setBotWalletBalance(sub.getBotWalletBalance().add(finalUsdt));
                BotSubscription savedBotSub = subRepo.save(sub);

                // 7. Save Records
                // Fee = Raw Value - Final Value Received
                BigDecimal totalFee = rawUsdtValue.subtract(finalUsdt);
                saveTransaction(userWallet, coin, BaseTrade.TradeType.SELL, quantityToSell, price, totalFee);
                saveBotTrade(savedBotSub, BaseTrade.TradeType.SELL, quantityToSell, price, finalUsdt, totalFee);

                log.info("✅ SELL: User {} | Sold {} {} | Got {} USDT", sub.getUserId(), quantityToSell,
                                coin.getSymbol(), finalUsdt);
        }

        private void saveTransaction(Wallet w, Coin c, BaseTrade.TradeType type, BigDecimal qty, BigDecimal price,
                        BigDecimal feeOrNotional) {
                Transaction tx = Transaction.builder()
                                .wallet(w)
                                .coin(c)
                                .type(type)
                                .source(Transaction.Source.BOT)
                                .quantity(qty)
                                .priceAtExecution(price)
                                .notionalValue(qty.multiply(price))
                                .feeTradeApplied(type == BaseTrade.TradeType.SELL ? feeOrNotional : BigDecimal.ZERO)
                                .build();
                transactionRepo.save(tx);
        }

        private void saveBotTrade(BotSubscription sub, BaseTrade.TradeType type, BigDecimal qty, BigDecimal price,
                        BigDecimal notional, BigDecimal feeOrNotional) {
                BotTrade trade = BotTrade.builder()
                                .bot(sub.getBot())
                                .botSubscription(sub)
                                // Now we must fetch the User Wallet again or pass it down to ensure BaseTrade
                                // fields are populated
                                // Ideally, pass userWallet from executeBuy() into this method to avoid
                                // re-fetching
                                .wallet(walletRepo.findByUserId(sub.getUserId()).orElseThrow())
                                .coin(coinRepo.findBySymbol(sub.getBot().getCoinSymbol()).orElse(null))
                                .type(type)
                                .quantity(qty)
                                .priceAtExecution(price)
                                .notionalValue(notional)
                                .feeBotApplied(BigDecimal.ZERO)
                                .feeTradeApplied(type == BaseTrade.TradeType.SELL ? feeOrNotional : BigDecimal.ZERO)
                                .build();
                botTradeRepo.save(trade);
        }
}