package com.web.TradeApp.feature.aibot.repository;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.web.TradeApp.feature.aibot.model.BotSignal;

@Repository
public interface BotSignalRepository extends JpaRepository<BotSignal, UUID> {
    /*
     * returns the last time this bot generated a trading signal
     */
    @Query("""
                SELECT MAX(bs.signalTimestamp)
                FROM BotSignal bs
                WHERE bs.bot.id = :botId
            """)
    Instant findLastSignalTime(@Param("botId") UUID botId);

    @Modifying
    @Transactional
    @Query("DELETE FROM BotSignal b WHERE b.signalTimestamp < :cutoff")
    int deleteBySignalTimestampBefore(Instant cutoff);
}
