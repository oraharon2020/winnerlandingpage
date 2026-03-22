import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  try {
    const client = await pool.connect();
    try {
      // Run all queries in parallel
      const [
        usersResult,
        subsResult,
        recsResult,
        todayRecsResult,
        winRateResult,
        dailyStatsResult,
        betTypeResult,
        recentRecsResult,
        campaignResult,
      ] = await Promise.all([
        // 1. Total users & new users (last 7 days)
        client.query(`
          SELECT 
            COUNT(*) as total_users,
            COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_users_7d,
            COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
            COUNT(*) FILTER (WHERE is_premium = true) as premium_users
          FROM users
        `),

        // 2. Active subscriptions & revenue
        client.query(`
          SELECT 
            COUNT(*) FILTER (WHERE is_active = true AND expires_at > NOW()) as active_subs,
            COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_subs_30d,
            COALESCE(SUM(price_paid) FILTER (WHERE created_at > NOW() - INTERVAL '30 days'), 0) as revenue_30d,
            COALESCE(SUM(price_paid), 0) as total_revenue
          FROM subscriptions
        `),

        // 3. Total recommendations & checked
        client.query(`
          SELECT 
            COUNT(*) as total_recs,
            COUNT(*) FILTER (WHERE is_correct IS NOT NULL) as checked,
            COUNT(*) FILTER (WHERE is_correct = true) as wins,
            COUNT(*) FILTER (WHERE is_correct = false) as losses
          FROM daily_recommendations
        `),

        // 4. Today's recommendations
        client.query(`
          SELECT 
            COUNT(*) as today_total,
            COUNT(*) FILTER (WHERE is_correct = true) as today_wins,
            COUNT(*) FILTER (WHERE is_correct = false) as today_losses,
            COUNT(*) FILTER (WHERE is_correct IS NULL) as today_pending
          FROM daily_recommendations
          WHERE DATE(match_time) = CURRENT_DATE
        `),

        // 5. Win rate over time (last 30 days, grouped by week)
        client.query(`
          SELECT 
            DATE_TRUNC('week', match_time)::date as week,
            COUNT(*) FILTER (WHERE is_correct = true) as wins,
            COUNT(*) FILTER (WHERE is_correct = false) as losses,
            COUNT(*) as total,
            ROUND(
              COUNT(*) FILTER (WHERE is_correct = true) * 100.0 / 
              NULLIF(COUNT(*) FILTER (WHERE is_correct IS NOT NULL), 0), 1
            ) as win_rate
          FROM daily_recommendations
          WHERE match_time > NOW() - INTERVAL '60 days'
            AND is_correct IS NOT NULL
          GROUP BY DATE_TRUNC('week', match_time)
          ORDER BY week DESC
          LIMIT 8
        `),

        // 6. Daily recommendation count (last 14 days)
        client.query(`
          SELECT 
            DATE(match_time) as day,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE is_correct = true) as wins,
            COUNT(*) FILTER (WHERE is_correct = false) as losses,
            COUNT(*) FILTER (WHERE is_correct IS NULL) as pending
          FROM daily_recommendations
          WHERE match_time > NOW() - INTERVAL '14 days'
          GROUP BY DATE(match_time)
          ORDER BY day DESC
        `),

        // 7. Performance by bet type
        client.query(`
          SELECT 
            bet_type_key,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE is_correct = true) as wins,
            COUNT(*) FILTER (WHERE is_correct = false) as losses,
            ROUND(AVG(odds)::numeric, 2) as avg_odds,
            ROUND(
              COUNT(*) FILTER (WHERE is_correct = true) * 100.0 / 
              NULLIF(COUNT(*) FILTER (WHERE is_correct IS NOT NULL), 0), 1
            ) as win_rate
          FROM daily_recommendations
          WHERE is_correct IS NOT NULL
          GROUP BY bet_type_key
          ORDER BY total DESC
        `),

        // 8. Recent recommendations (last 20)
        client.query(`
          SELECT 
            home_team, away_team, league, bet_type, odds, 
            probability, is_correct, match_time, bet_type_key
          FROM daily_recommendations
          ORDER BY match_time DESC
          LIMIT 20
        `),

        // 9. Campaign tracking - users by source (from deep links)
        client.query(`
          SELECT 
            us.source,
            COUNT(*) as users,
            COUNT(s.id) FILTER (WHERE s.is_active = true AND s.expires_at > NOW()) as paying
          FROM user_sources us
          LEFT JOIN users u ON u.telegram_id = us.telegram_id
          LEFT JOIN subscriptions s ON s.user_id = u.id
          GROUP BY us.source
          ORDER BY users DESC
          LIMIT 20
        `).catch(() => ({ rows: [] })),
      ]);

      const users = usersResult.rows[0];
      const subs = subsResult.rows[0];
      const recs = recsResult.rows[0];
      const todayRecs = todayRecsResult.rows[0];

      return NextResponse.json({
        overview: {
          totalUsers: parseInt(users.total_users),
          newUsers7d: parseInt(users.new_users_7d),
          newUsers30d: parseInt(users.new_users_30d),
          premiumUsers: parseInt(users.premium_users),
          activeSubs: parseInt(subs.active_subs),
          newSubs30d: parseInt(subs.new_subs_30d),
          revenue30d: parseFloat(subs.revenue_30d),
          totalRevenue: parseFloat(subs.total_revenue),
        },
        predictions: {
          total: parseInt(recs.total_recs),
          checked: parseInt(recs.checked),
          wins: parseInt(recs.wins),
          losses: parseInt(recs.losses),
          winRate:
            parseInt(recs.checked) > 0
              ? Math.round(
                  (parseInt(recs.wins) / parseInt(recs.checked)) * 1000
                ) / 10
              : 0,
        },
        today: {
          total: parseInt(todayRecs.today_total),
          wins: parseInt(todayRecs.today_wins),
          losses: parseInt(todayRecs.today_losses),
          pending: parseInt(todayRecs.today_pending),
        },
        weeklyStats: winRateResult.rows.map((r) => ({
          week: r.week,
          wins: parseInt(r.wins),
          losses: parseInt(r.losses),
          total: parseInt(r.total),
          winRate: parseFloat(r.win_rate),
        })),
        dailyStats: dailyStatsResult.rows.map((r) => ({
          day: r.day,
          total: parseInt(r.total),
          wins: parseInt(r.wins),
          losses: parseInt(r.losses),
          pending: parseInt(r.pending),
        })),
        betTypes: betTypeResult.rows.map((r) => ({
          key: r.bet_type_key,
          total: parseInt(r.total),
          wins: parseInt(r.wins),
          losses: parseInt(r.losses),
          avgOdds: parseFloat(r.avg_odds),
          winRate: parseFloat(r.win_rate),
        })),
        recentRecs: recentRecsResult.rows.map((r) => ({
          homeTeam: r.home_team,
          awayTeam: r.away_team,
          league: r.league,
          betType: r.bet_type,
          betTypeKey: r.bet_type_key,
          odds: parseFloat(r.odds),
          probability: parseFloat(r.probability),
          isCorrect: r.is_correct,
          matchTime: r.match_time,
        })),
        campaigns: campaignResult.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
