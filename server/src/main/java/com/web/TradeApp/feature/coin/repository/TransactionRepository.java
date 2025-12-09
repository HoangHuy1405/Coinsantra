package com.web.TradeApp.feature.coin.repository;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.coin.entity.Transaction;
import com.web.TradeApp.feature.common.entity.BaseTrade.TradeType;

/**
 * Repository for Transaction entity with pagination, filtering, and sorting.
 * 
 * Single query method handles all filter combinations:
 * - userId (required)
 * - Source = MANUAL (always applied)
 * - TradeType (optional - pass null to include both BUY and SELL)
 * - Coin name (optional - pass null or empty to skip)
 * - Sortable by any column via Pageable
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

  /**
   * Find MANUAL transactions with optional filters.
   * 
   * Note: Validate beginTime < endTime in service layer before calling this
   * method.
   * 
   * @param userId    User ID (required)
   * @param tradeType Trade type (optional - null = both BUY and SELL)
   * @param coinName  Coin name search (optional - null/empty = all coins)
   * @param beginTime Start time (optional - null = no lower bound)
   * @param endTime   End time (optional - null = no upper bound)
   * @param pageable  Pagination and sorting
   * @return Page of transactions
   */
  @Query("""
      SELECT t FROM Transaction t
      JOIN FETCH t.wallet w
      JOIN FETCH t.coin c
      WHERE w.user.id = :userId
        AND t.source = 'MANUAL'
        AND (:tradeType IS NULL OR t.type = :tradeType)
        AND (:coinName IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :coinName, '%')))
        AND (:beginTime IS NULL OR t.createdAt >= :beginTime)
        AND (:endTime IS NULL OR t.createdAt <= :endTime)
      """)
  Page<Transaction> findManualTransactions(
      @Param("userId") UUID userId,
      @Param("tradeType") TradeType tradeType,
      @Param("coinName") String coinName,
      @Param("beginTime") Instant beginTime,
      @Param("endTime") Instant endTime,
      Pageable pageable);
}
