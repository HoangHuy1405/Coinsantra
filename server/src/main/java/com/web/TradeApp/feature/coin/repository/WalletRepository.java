package com.web.TradeApp.feature.coin.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.coin.entity.Wallet;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Optional<Wallet> findByUserId(UUID userId);

    // Look up Wallet directly by the linked User's username
    // Spring Data JPA automatically parses "User_Username" to join the tables.
    // only for admin
    Optional<Wallet> findByUser_Username(String username);
}
