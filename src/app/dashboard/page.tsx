import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import StatsBar from "@/components/dashboard/StatsBar";

export const revalidate = 300; // Revalidate every 5 minutes

async function getTodayRecommendations() {
  if (!pool) return [];
  const today = new Date().toISOString().split("T")[0];
  const result = await pool.query(
    `SELECT id, fixture_id, home_team, away_team, league, match_time, 
            bet_type, odds, probability, risk_profile, reasons, is_correct
     FROM daily_recommendations 
     WHERE recommendation_date = $1 AND is_active = true
     ORDER BY match_time ASC`,
    [today]
  );
  return result.rows;
}

async function getRecentResults() {
  if (!pool) return { wins: 0, losses: 0, total: 0, rate: 0 };
  const result = await pool.query(
    `SELECT 
       COUNT(*) FILTER (WHERE is_correct = true) as wins,
       COUNT(*) FILTER (WHERE is_correct = false) as losses,
       COUNT(*) as total
     FROM daily_recommendations 
     WHERE is_correct IS NOT NULL`
  );
  const row = result.rows[0];
  return {
    wins: Number(row.wins),
    losses: Number(row.losses),
    total: Number(row.total),
    rate: row.total > 0 ? Math.round((row.wins / row.total) * 1000) / 10 : 0,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [recommendations, stats] = await Promise.all([
    getTodayRecommendations(),
    getRecentResults(),
  ]);

  const now = new Date();

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          שלום, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
          👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          ההמלצות של היום —{" "}
          {now.toLocaleDateString("he-IL", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Stats Bar */}
      <StatsBar stats={stats} todayCount={recommendations.length} />

      {/* Recommendations */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          🎯 המלצות היום
          <span className="text-gray-400 text-sm font-normal mr-2">
            ({recommendations.length} המלצות)
          </span>
        </h2>

        {recommendations.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-gray-400 text-lg">אין המלצות להיום (עדיין)</p>
            <p className="text-gray-500 text-sm mt-2">
              ההמלצות מתעדכנות כל בוקר ב-06:30
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
