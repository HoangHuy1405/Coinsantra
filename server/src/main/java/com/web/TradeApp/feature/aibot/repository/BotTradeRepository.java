package com.web.TradeApp.feature.aibot.repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.aibot.model.BotTrade;

@Repository
public interface BotTradeRepository extends JpaRepository<BotTrade, UUID> {
        /*
         * A Double representing the total realized profit-and-loss for a bot since a
         * given timestamp
         */
        @Query("""
                        SELECT COALESCE(SUM(bt.pnl), 0)
                        FROM BotTrade bt
                        WHERE bt.bot.id = :botId
                                AND bt.createdAt >= :fromTime
                                AND bt.pnl IS NOT NULL
                                """)
        Double sumRealizedPnlSince(
                        @Param("botId") UUID botId,
                        @Param("fromTime") Instant fromTime);

        /*
         * return s a List<BotTrade>, containing all trades for the bot since the given
         * time where realizedPnl is not null. (actual trades - useful for plotting)
         */
        @Query("""
                        SELECT bt
                        FROM BotTrade bt
                        WHERE bt.bot.id = :botId
                                AND bt.createdAt >= :fromTime
                                AND bt.pnl IS NOT NULL
                        ORDER BY bt.createdAt ASC
                        """)
        List<BotTrade> findTradesSince(
                        @Param("botId") UUID botId,
                        @Param("fromTime") Instant fromTime);
}
