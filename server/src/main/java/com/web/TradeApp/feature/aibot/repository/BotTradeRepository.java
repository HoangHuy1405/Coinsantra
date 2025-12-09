package com.web.TradeApp.feature.aibot.repository;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.aibot.model.BotTrade;
import com.web.TradeApp.feature.common.entity.BaseTrade.TradeType;

@Repository
public interface BotTradeRepository extends JpaRepository<BotTrade, UUID>, JpaSpecificationExecutor<BotTrade> {

  /**
   * Find bot trades filtered by user's bot subscription
   * 
   * @param userId    User ID (required)
   * @param botSubId  Bot Subscription ID (required - must belong to userId)
   * @param tradeType Trade type (optional - null = both BUY and SELL)
   * @param coinName  Coin name (optional - null = all coins)
   * @param beginTime Start time (optional - null = no lower bound)
   * @param endTime   End time (optional - null = no upper bound)
   * @param pageable  Pagination and sorting
   * @return Page of bot trades
   */
  @Query("""
      SELECT bt FROM BotTrade bt
      JOIN FETCH bt.bot b
      JOIN FETCH bt.coin c
      JOIN FETCH bt.botSubscription bs
      WHERE bs.id = :botSubId
        AND bs.userId = :userId
        AND (:tradeType IS NULL OR bt.type = :tradeType)
        AND (:coinName IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :coinName, '%')))
        AND (:beginTime IS NULL OR bt.createdAt >= :beginTime)
        AND (:endTime IS NULL OR bt.createdAt <= :endTime)
      """)
  Page<BotTrade> findBotTrades(
      @Param("userId") UUID userId,
      @Param("botSubId") UUID botSubId,
      @Param("tradeType") TradeType tradeType,
      @Param("coinName") String coinName,
      @Param("beginTime") Instant beginTime,
      @Param("endTime") Instant endTime,
      Pageable pageable);
}
