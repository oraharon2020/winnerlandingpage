import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;
  const days = parseInt(searchParams.get("days") || "7");

  try {
    const client = await pool.connect();
    try {
      const [countResult, rejectedResult, summaryResult] = await Promise.all([
        client.query(
          `SELECT COUNT(*) FROM rejected_bets WHERE created_at > NOW() - INTERVAL '1 day' * $1`,
          [days]
        ),
        client.query(
          `SELECT 
            fixture_id, home_team, away_team, league, match_time,
            bet_type, odds, rejection_reason, 
            home_goals, away_goals, would_have_won, created_at
          FROM rejected_bets
          WHERE created_at > NOW() - INTERVAL '1 day' * $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3`,
          [days, limit, offset]
        ),
        // Summary: how many rejected bets would have won?
        client.query(
          `SELECT 
            rejection_reason,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE would_have_won = true) as would_won,
            COUNT(*) FILTER (WHERE would_have_won = false) as would_lost,
            COUNT(*) FILTER (WHERE would_have_won IS NULL) as unchecked
          FROM rejected_bets
          WHERE created_at > NOW() - INTERVAL '1 day' * $1
          GROUP BY rejection_reason
          ORDER BY total DESC`,
          [days]
        ),
      ]);

      const total = parseInt(countResult.rows[0].count);

      return NextResponse.json({
        rejected: rejectedResult.rows.map((r) => ({
          fixtureId: r.fixture_id,
          homeTeam: r.home_team,
          awayTeam: r.away_team,
          league: r.league,
          matchTime: r.match_time,
          betType: r.bet_type,
          odds: parseFloat(r.odds || "0"),
          reason: r.rejection_reason,
          homeGoals: r.home_goals,
          awayGoals: r.away_goals,
          wouldHaveWon: r.would_have_won,
          createdAt: r.created_at,
        })),
        summary: summaryResult.rows.map((r) => ({
          reason: r.rejection_reason,
          total: parseInt(r.total),
          wouldWon: parseInt(r.would_won),
          wouldLost: parseInt(r.would_lost),
          unchecked: parseInt(r.unchecked),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Rejected API error:", error);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
