package com.web.TradeApp.feature.aibot.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
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
    Long countByBotIdAndActiveTrue(UUID botId);

    /*
     * represents how much total money is currently allocated by users to that bot
     */
    @Query("""
                SELECT COALESCE(SUM(bs.botWalletBalance), 0)
                FROM BotSubscription bs
                WHERE bs.bot.id = :botId AND bs.active = true
            """)
    Double sumAllocatedCapital(@Param("botId") UUID botId);

    /**
     * Calculate total net investment of bot from all active subscriptions
     * This sums the current netInvestment field from BotSubscription entities
     */
    @Query("""
            SELECT COALESCE(SUM(bs.netInvestment), 0)
            FROM BotSubscription bs
            WHERE bs.bot.id = :botId AND bs.active = true
            """)
    java.math.BigDecimal calcBotTotalInvestment(@Param("botId") UUID botId);

    // Used in the fan-out phase (Signal Listener) to find who to execute trades for
    List<BotSubscription> findByBotIdAndActiveTrue(UUID botId);

    // Optional: Find specific subscription for a user/bot pair
    Optional<BotSubscription> findByUserIdAndBotId(UUID userId, UUID botId);

    boolean existsByUserIdAndBotId(UUID userId, UUID botId);

    /**
     * Efficient Keyset Pagination.
     * Instead of OFFSET (which gets slow), we ask for IDs greater than the last one
     * we saw. -> using to process a batch of large subscriptions without loading
     * all
     */
    List<BotSubscription> findByIdGreaterThanAndActiveTrueOrderByIdAsc(UUID id, Pageable pageable);

    /**
     * Same as above but with EAGER fetch of Bot to avoid
     * LazyInitializationException
     * when accessing bot properties outside transaction
     */
    @Query("""
            SELECT bs FROM BotSubscription bs
            JOIN FETCH bs.bot
            WHERE bs.id > :id AND bs.active = true
            ORDER BY bs.id ASC
            """)
    List<BotSubscription> findByIdGreaterThanAndActiveTrueWithBotOrderByIdAsc(@Param("id") UUID id, Pageable pageable);

    // Find all active subscriptions for a specific bot
    List<BotSubscription> findAllByBotIdAndActiveTrue(UUID botId);

    // Find all subscriptions for a specific user
    List<BotSubscription> findAllByUserId(UUID userId);
}
