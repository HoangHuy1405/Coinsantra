package com.web.TradeApp.feature.aibot.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.aibot.model.SubscriptionSnapshot;

/**
 * Repository using JPQL queries for database portability (MySQL & MSSQL)
 * Each metric has its own query - service layer aggregates the results
 */
@Repository
public interface SnapshotMetricsRepository extends JpaRepository<SubscriptionSnapshot, UUID> {
  /**
   * 1. Calculate total PnL of bot by timeframe
   * Uses subqueries to get latest and compare snapshots, then sums the
   * differences
   */
  @Query("""
      SELECT COALESCE(SUM(latest.pnl - COALESCE(compare.pnl, 0)), 0)
      FROM SubscriptionSnapshot latest
      LEFT JOIN SubscriptionSnapshot compare ON compare.botSubscription.id = latest.botSubscription.id
        AND compare.recordedAt = (
          SELECT MIN(ss2.recordedAt) FROM SubscriptionSnapshot ss2
          WHERE ss2.botSubscription.id = latest.botSubscription.id
            AND ss2.recordedAt >= :compareTime
        )
      WHERE latest.botSubscription.bot.id = :botId
        AND latest.botSubscription.active = true
        AND latest.recordedAt = (
          SELECT MAX(ss3.recordedAt) FROM SubscriptionSnapshot ss3
          WHERE ss3.botSubscription.id = latest.botSubscription.id
        )
      """)
  BigDecimal calcBotPnl(@Param("botId") UUID botId, @Param("compareTime") Instant compareTime);

  /**
   * 3. Calculate average ROI of bot by timeframe
   */
  @Query("""
      SELECT COALESCE(AVG(
        CASE WHEN COALESCE(compare.netInvestment, latest.netInvestment) > 0
          THEN ((latest.pnl - COALESCE(compare.pnl, 0)) / COALESCE(compare.netInvestment, latest.netInvestment)) * 100
          ELSE 0
        END
      ), 0)
      FROM SubscriptionSnapshot latest
      LEFT JOIN SubscriptionSnapshot compare ON compare.botSubscription.id = latest.botSubscription.id
        AND compare.recordedAt = (
          SELECT MIN(ss2.recordedAt) FROM SubscriptionSnapshot ss2
          WHERE ss2.botSubscription.id = latest.botSubscription.id
            AND ss2.recordedAt >= :compareTime
        )
      WHERE latest.botSubscription.bot.id = :botId
        AND latest.botSubscription.active = true
        AND latest.recordedAt = (
          SELECT MAX(ss3.recordedAt) FROM SubscriptionSnapshot ss3
          WHERE ss3.botSubscription.id = latest.botSubscription.id
        )
      """)
  BigDecimal calcBotRoi(@Param("botId") UUID botId, @Param("compareTime") Instant compareTime);

  /**
   * 4. Calculate max drawdown of bot (all-time)
   */
  @Query("""
      SELECT COALESCE(MIN(ss.totalEquity - ss.netInvestment), 0)
      FROM SubscriptionSnapshot ss
      WHERE ss.botSubscription.bot.id = :botId
        AND ss.botSubscription.active = true
      """)
  BigDecimal calcBotMaxDrawdown(@Param("botId") UUID botId);

  /**
   * 5. Calculate max drawdown percentage of bot (all-time)
   */
  @Query("""
      SELECT COALESCE(MIN(
        CASE WHEN ss.netInvestment > 0
          THEN ((ss.totalEquity - ss.netInvestment) / ss.netInvestment) * 100
          ELSE 0
        END
      ), 0)
      FROM SubscriptionSnapshot ss
      WHERE ss.botSubscription.bot.id = :botId
        AND ss.botSubscription.active = true
      """)
  BigDecimal calcBotMaxDrawdownPct(@Param("botId") UUID botId);

  /**
   * 6. Calculate total equity of bot
   * Sums the latest total equity from all active subscriptions
   */
  @Query("""
      SELECT COALESCE(SUM(ss.totalEquity), 0)
      FROM SubscriptionSnapshot ss
      WHERE ss.botSubscription.bot.id = :botId
        AND ss.botSubscription.active = true
        AND ss.recordedAt = (
          SELECT MAX(ss2.recordedAt) FROM SubscriptionSnapshot ss2
          WHERE ss2.botSubscription.id = ss.botSubscription.id
        )
      """)
  BigDecimal calcBotTotalEquity(@Param("botId") UUID botId);

  // ============================================================================
  // SUBSCRIPTION METRICS - Queries for metrics of a single subscription
  // ============================================================================

  /**
   * 8. Calculate PnL of subscription by timeframe
   */
  @Query("""
      SELECT COALESCE(latest.pnl - compare.pnl, latest.pnl, 0)
      FROM SubscriptionSnapshot latest
      LEFT JOIN SubscriptionSnapshot compare ON compare.botSubscription.id = latest.botSubscription.id
        AND compare.recordedAt = (
          SELECT MIN(ss2.recordedAt) FROM SubscriptionSnapshot ss2
          WHERE ss2.botSubscription.id = :subscriptionId
            AND ss2.recordedAt >= :compareTime
        )
      WHERE latest.botSubscription.id = :subscriptionId
        AND latest.recordedAt = (
          SELECT MAX(ss3.recordedAt) FROM SubscriptionSnapshot ss3
          WHERE ss3.botSubscription.id = :subscriptionId
        )
      """)
  BigDecimal calcSubPnl(@Param("subscriptionId") UUID subscriptionId, @Param("compareTime") Instant compareTime);

  /**
   * 9. Calculate ROI of subscription by timeframe
   */
  @Query("""
      SELECT COALESCE(
        CASE WHEN COALESCE(compare.netInvestment, latest.netInvestment) > 0
          THEN ((latest.pnl - COALESCE(compare.pnl, 0)) / COALESCE(compare.netInvestment, latest.netInvestment)) * 100
          ELSE 0
        END
      , 0)
      FROM SubscriptionSnapshot latest
      LEFT JOIN SubscriptionSnapshot compare ON compare.botSubscription.id = latest.botSubscription.id
        AND compare.recordedAt = (
          SELECT MIN(ss2.recordedAt) FROM SubscriptionSnapshot ss2
          WHERE ss2.botSubscription.id = :subscriptionId
            AND ss2.recordedAt >= :compareTime
        )
      WHERE latest.botSubscription.id = :subscriptionId
        AND latest.recordedAt = (
          SELECT MAX(ss3.recordedAt) FROM SubscriptionSnapshot ss3
          WHERE ss3.botSubscription.id = :subscriptionId
        )
      """)
  BigDecimal calcSubRoi(@Param("subscriptionId") UUID subscriptionId, @Param("compareTime") Instant compareTime);

  /**
   * 10. Calculate max drawdown of subscription (all-time)
   */
  @Query("""
      SELECT COALESCE(MIN(ss.totalEquity - ss.netInvestment), 0)
      FROM SubscriptionSnapshot ss
      WHERE ss.botSubscription.id = :subscriptionId
      """)
  BigDecimal calcSubMaxDrawdown(@Param("subscriptionId") UUID subscriptionId);

  /**
   * 11. Calculate max drawdown percentage of subscription (all-time)
   */
  @Query("""
      SELECT COALESCE(MIN(
        CASE WHEN ss.netInvestment > 0
          THEN ((ss.totalEquity - ss.netInvestment) / ss.netInvestment) * 100
          ELSE 0
        END
      ), 0)
      FROM SubscriptionSnapshot ss
      WHERE ss.botSubscription.id = :subscriptionId
      """)
  BigDecimal calcSubMaxDrawdownPct(@Param("subscriptionId") UUID subscriptionId);

  /**
   * 12. Get latest net investment of subscription
   */
  @Query("""
      SELECT COALESCE(ss.netInvestment, 0)
      FROM SubscriptionSnapshot ss
      WHERE ss.botSubscription.id = :subscriptionId
        AND ss.recordedAt = (
          SELECT MAX(ss2.recordedAt) FROM SubscriptionSnapshot ss2
          WHERE ss2.botSubscription.id = :subscriptionId
        )
      """)
  BigDecimal getLatestNetInvestment(@Param("subscriptionId") UUID subscriptionId);

  /**
   * 13. Get latest total equity of subscription
   */
  @Query("""
      SELECT COALESCE(ss.totalEquity, 0)
      FROM SubscriptionSnapshot ss
      WHERE ss.botSubscription.id = :subscriptionId
        AND ss.recordedAt = (
          SELECT MAX(ss2.recordedAt) FROM SubscriptionSnapshot ss2
          WHERE ss2.botSubscription.id = :subscriptionId
        )
      """)
  BigDecimal getLatestTotalEquity(@Param("subscriptionId") UUID subscriptionId);

  /**
   * 14. Get chart data (PnL over time) for bot by timeframe
   * Aggregates all active subscriptions' PnL at each snapshot time
   * Returns List of Object[] where [0] = Instant recordedAt, [1] = BigDecimal
   * totalPnl
   */
  // @Query("""
  // SELECT ss.recordedAt, SUM(ss.pnl)
  // FROM SubscriptionSnapshot ss
  // WHERE ss.botSubscription.bot.id = :botId
  // AND ss.botSubscription.active = true
  // AND ss.recordedAt >= :fromTime
  // GROUP BY ss.recordedAt // wrong because it requires exact timestamp match to
  // aggregate properly
  // ORDER BY ss.recordedAt ASC
  // """)
  @Query("""
          SELECT
            FUNCTION('DATE_FORMAT', ss.recordedAt, '%Y-%m-%d %H:%i:00'),
            SUM(ss.pnl)
          FROM SubscriptionSnapshot ss
          WHERE ss.botSubscription.bot.id = :botId
            AND ss.botSubscription.active = true
            AND ss.recordedAt >= :fromTime
          GROUP BY FUNCTION('DATE_FORMAT', ss.recordedAt, '%Y-%m-%d %H:%i:00')
          ORDER BY FUNCTION('DATE_FORMAT', ss.recordedAt, '%Y-%m-%d %H:%i:00') ASC
      """)
  List<Object[]> getBotChartData(@Param("botId") UUID botId, @Param("fromTime") Instant fromTime);

  /**
   * 15. Get chart data (PnL over time) for a single subscription by timeframe
   * Returns List of Object[] where [0] = Instant recordedAt, [1] = BigDecimal pnl
   */
  @Query("""
      SELECT ss.recordedAt, ss.pnl
      FROM SubscriptionSnapshot ss
      WHERE ss.botSubscription.id = :subscriptionId
        AND ss.recordedAt >= :fromTime
      ORDER BY ss.recordedAt ASC
      """)
  List<Object[]> getSubscriptionChartData(@Param("subscriptionId") UUID subscriptionId,
      @Param("fromTime") Instant fromTime);
}
