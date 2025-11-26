package com.web.TradeApp.feature.admin.coin.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.web.TradeApp.exception.IdInvalidException;
import com.web.TradeApp.feature.admin.coin.dto.CoinDepositRequest;
import com.web.TradeApp.feature.admin.coin.dto.CoinDepositResponse;
import com.web.TradeApp.feature.admin.coin.dto.CoinInfoResponse;
import com.web.TradeApp.feature.admin.coin.dto.CoinWithdrawRequest;
import com.web.TradeApp.feature.admin.coin.dto.CoinWithdrawResponse;
import com.web.TradeApp.feature.admin.coin.entity.Coin;
import com.web.TradeApp.feature.admin.coin.entity.CoinHolding;
import com.web.TradeApp.feature.admin.coin.entity.Wallet;
import com.web.TradeApp.feature.admin.coin.repository.CoinHoldingRepository;
import com.web.TradeApp.feature.admin.coin.repository.CoinRepository;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;
import com.web.TradeApp.feature.history.entity.InventoryHistory;
import com.web.TradeApp.feature.history.repository.InventoryHistoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminCoinServiceImpl implements AdminCoinService {

        private final CoinRepository coinRepository;
        private final CoinHoldingRepository coinHoldingRepository;
        private final InventoryHistoryRepository historyRepository;
        private final AdminServiceImpl adminService; // Use the new helper
        private final CoinGeckoClient coinGeckoClient; // Assuming this exists

        // =========================================================================
        // COIN MANAGEMENT (MINT / BURN)
        // =========================================================================

        @Override
        @Transactional
        public CoinDepositResponse depositCoin(CoinDepositRequest request) {
                // 1. Get Admin Wallet
                Wallet adminWallet = adminService.getAdminWallet();

                // 2. Validate Coin via External API (Optional but good safety)
                if (!coinGeckoClient.isExists(request.getCoinGeckoId())) {
                        throw new IllegalArgumentException("Invalid coinGeckoId: " + request.getCoinGeckoId());
                }

                // 3. Find Coin Definition (or create if logic allows, assuming exists here)
                Coin coin = coinRepository.findByCoinGeckoId(request.getCoinGeckoId())
                                .orElseThrow(() -> new IdInvalidException(
                                                "Coin not found in DB: " + request.getCoinGeckoId()));

                // 4. Find or Create Admin's Holding for this Coin
                CoinHolding adminHolding = coinHoldingRepository
                                .findByWalletIdAndCoinId(adminWallet.getId(), coin.getId())
                                .orElseGet(() -> CoinHolding.builder()
                                                .wallet(adminWallet)
                                                .coin(coin)
                                                .amount(BigDecimal.ZERO)
                                                .averageBuyPrice(BigDecimal.ZERO) // Admin gets it for free/minted
                                                .build());

                // 5. Add Quantity (Minting)
                adminHolding.setAmount(adminHolding.getAmount().add(request.getQuantity()));
                coinHoldingRepository.save(adminHolding);

                // 6. Log History
                saveHistory(coin, InventoryHistory.ActionType.DEPOSIT, request.getQuantity(), request.getNote());

                return CoinDepositResponse.builder()
                                .id(coin.getId())
                                .coinGeckoId(coin.getCoinGeckoId())
                                .symbol(coin.getSymbol())
                                .name(coin.getName())
                                .depositedQuantity(request.getQuantity())
                                .newQuantity(adminHolding.getAmount()) // Return holding amount
                                .build();
        }

        @Override
        @Transactional
        public CoinWithdrawResponse withdrawCoin(CoinWithdrawRequest request) {
                // 1. Get Admin Wallet & Coin
                Wallet adminWallet = adminService.getAdminWallet();

                Coin coin = coinRepository.findByCoinGeckoId(request.getCoinGeckoId())
                                .orElseThrow(() -> new IdInvalidException(
                                                "Coin not found: " + request.getCoinGeckoId()));

                CoinHolding adminHolding = coinHoldingRepository
                                .findByWalletIdAndCoinId(adminWallet.getId(), coin.getId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Admin has no holding of " + request.getCoinGeckoId()));

                // 2. Check Sufficient Balance
                if (adminHolding.getAmount().compareTo(request.getQuantity()) < 0) {
                        throw new IllegalArgumentException(
                                        "Insufficient Admin Funds. Has: " + adminHolding.getAmount());
                }

                // 3. Subtract Quantity (Burning)
                adminHolding.setAmount(adminHolding.getAmount().subtract(request.getQuantity()));
                coinHoldingRepository.save(adminHolding);

                // 4. Log History
                saveHistory(coin, InventoryHistory.ActionType.WITHDRAW, request.getQuantity().negate(),
                                request.getNote());

                return CoinWithdrawResponse.builder()
                                .id(coin.getId())
                                .coinGeckoId(coin.getCoinGeckoId())
                                .withdrewQuantity(request.getQuantity())
                                .newQuantity(adminHolding.getAmount())
                                .build();
        }

        // =========================================================================
        // USDT MANAGEMENT (SIMULATION TREASURY)
        // =========================================================================

        // @Transactional
        // public void depositUsdt(BigDecimal amount, String note) {
        // if (amount.compareTo(BigDecimal.ZERO) <= 0)
        // throw new IllegalArgumentException("Amount must be positive");

        // Wallet adminWallet = adminService.getAdminWallet();

        // // 1. Add to Balance
        // adminWallet.setBalance(adminWallet.getBalance().add(amount));
        // // You might need to cast to WalletRepository to save if adminService only
        // // returns Wallet
        // // But since Wallet is an entity attached to context in Transactional, it
        // might
        // // auto-save.
        // // Safer to save explicitly via a repository if you have access to it here,
        // // or ensure AdminService returns a managed entity.
        // // adminWalletRepository.save(adminWallet);

        // log.info("💰 Admin Deposited USDT: +{}. New Balance: {}", amount,
        // adminWallet.getBalance());

        // // Optional: Log to history if you have a special "USDT Coin" entry or
        // separate
        // // transaction log
        // }

        // @Transactional
        // public void withdrawUsdt(BigDecimal amount, String note) {
        // if (amount.compareTo(BigDecimal.ZERO) <= 0)
        // throw new IllegalArgumentException("Amount must be positive");

        // Wallet adminWallet = adminService.getAdminWallet();

        // if (adminWallet.getBalance().compareTo(amount) < 0) {
        // throw new IllegalArgumentException(
        // "Insufficient USDT. Admin Balance: " + adminWallet.getBalance());
        // }

        // adminWallet.setBalance(adminWallet.getBalance().subtract(amount));
        // log.info("🔥 Admin Withdrew USDT: -{}. New Balance: {}", amount,
        // adminWallet.getBalance());
        // }

        // =========================================================================
        // READ OPERATIONS
        // =========================================================================

        @Override
        public ResultPaginationResponse getAllCoins(Pageable pageable) {
                // Note: This iterates COIN definitions.
                // To show Admin Quantity, we must fetch the Admin's CoinHolding for each coin.
                // This can be N+1 issue if not careful. For admin panel, N+1 is usually
                // acceptable (low traffic).

                Page<Coin> pageCoins = this.coinRepository.findAll(pageable);
                Wallet adminWallet = adminService.getAdminWallet();

                ResultPaginationResponse res = new ResultPaginationResponse();
                ResultPaginationResponse.PageMeta meta = new ResultPaginationResponse.PageMeta();

                meta.setPage(pageable.getPageNumber());
                meta.setPageSize(pageable.getPageSize());
                meta.setPages(pageCoins.getTotalPages());
                meta.setTotal(pageCoins.getTotalElements());

                res.setMeta(meta);

                List<CoinInfoResponse> listCoin = pageCoins.getContent().stream()
                                .map(coin -> toCoinInfoDto(coin, adminWallet.getId()))
                                .toList();

                res.setResult(listCoin);
                return res;
        }

        private CoinInfoResponse toCoinInfoDto(Coin c, java.util.UUID adminWalletId) {
                // Fetch Admin's specific holding for this coin
                BigDecimal adminQuantity = coinHoldingRepository.findByWalletIdAndCoinId(adminWalletId, c.getId())
                                .map(CoinHolding::getAmount)
                                .orElse(BigDecimal.ZERO);

                return CoinInfoResponse.builder()
                                .id(c.getId())
                                .coinGeckoId(c.getCoinGeckoId())
                                .name(c.getName())
                                .symbol(c.getSymbol())
                                .quantity(adminQuantity) // Now mapped from Holding, not Coin entity
                                .fee(c.getFee())
                                .build();
        }

        private void saveHistory(Coin coin, InventoryHistory.ActionType action, BigDecimal delta, String note) {
                historyRepository.save(InventoryHistory.builder()
                                .coin(coin)
                                .action(action)
                                .quantityDelta(delta)
                                .note(note)
                                .build());
        }
}