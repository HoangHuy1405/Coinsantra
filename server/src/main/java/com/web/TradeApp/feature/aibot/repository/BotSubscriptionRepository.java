package com.web.TradeApp.feature.aibot.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.aibot.model.BotSubscription;

@Repository
public interface BotSubscriptionRepository extends JpaRepository<BotSubscription, UUID> {
    /*
     * Count active subscribers to this bot
     */
    @Query("""
                SELECT COUNT(bs)
                FROM BotSubscription bs
                WHERE bs.bot.id = :botId AND bs.active = true
            """)
    long countActiveSubscribers(@Param("botId") UUID botId);

    /*
     * represents how much total money is currently allocated by users to that bot
     */
    @Query("""
                SELECT COALESCE(SUM(bs.allocatedAmount), 0)
                FROM BotSubscription bs
                WHERE bs.bot.id = :botId AND bs.active = true
            """)
    Double sumAllocatedCapital(@Param("botId") UUID botId);

    // Used in the fan-out phase (Signal Listener) to find who to execute trades for
    List<BotSubscription> findByBotIdAndActiveTrue(UUID botId);

    // Optional: Find specific subscription for a user/bot pair
    Optional<BotSubscription> findByUserIdAndBotId(UUID userId, UUID botId);
}
