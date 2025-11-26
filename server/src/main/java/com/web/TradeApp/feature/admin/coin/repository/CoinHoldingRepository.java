package com.web.TradeApp.feature.admin.coin.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.admin.coin.entity.CoinHolding;

@Repository
public interface CoinHoldingRepository extends JpaRepository<CoinHolding, UUID> {
    // Critical: Used to find if a user already owns a specific coin in their wallet
    Optional<CoinHolding> findByWalletIdAndCoinId(UUID walletId, UUID coinId);
}
