package com.web.TradeApp.feature.admin.coin;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import com.web.TradeApp.feature.admin.coin.entity.Coin;

import jakarta.persistence.LockModeType;

public interface CoinRepository extends JpaRepository<Coin, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE) // tránh race condition khi nhiều admin cùng nạp coin
    Optional<Coin> findByCoinGeckoId(String id);
}
