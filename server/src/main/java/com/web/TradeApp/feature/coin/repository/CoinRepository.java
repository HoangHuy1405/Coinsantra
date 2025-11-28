package com.web.TradeApp.feature.coin.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.coin.entity.Coin;

import jakarta.persistence.LockModeType;

@Repository
public interface CoinRepository extends JpaRepository<Coin, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE) // tránh race condition khi nhiều admin cùng nạp coin
    Optional<Coin> findByCoinGeckoId(String id);

    Optional<Coin> findBySymbol(String symbol);

}
