package com.web.TradeApp.feature.coin.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.coin.entity.Wallet;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Optional<Wallet> findByUserId(UUID userId);

    // Look up Wallet directly by the linked User's username
    // Spring Data JPA automatically parses "User_Username" to join the tables.
    // only for admin
    Optional<Wallet> findByUser_Username(String username);

    /**
     * Keyset pagination for wallet snapshots
     * Eagerly fetch coinHoldings to avoid LazyInitializationException
     */
    @Query("""
            SELECT w FROM Wallet w
            LEFT JOIN FETCH w.coinHoldings
            WHERE w.id > :id
            ORDER BY w.id ASC
            """)
    List<Wallet> findByIdGreaterThanWithCoinHoldingsOrderByIdAsc(@Param("id") UUID id, Pageable pageable);
}
