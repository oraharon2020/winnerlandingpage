import pool from "@/lib/db";
import RecommendationCard from "@/components/dashboard/RecommendationCard";

export const revalidate = 300;

async function getRecentResults() {
  if (!pool) return [];
  const result = await pool.query(
    `SELECT id, fixture_id, home_team, away_team, league, match_time, 
            bet_type, odds, probability, risk_profile, reasons, is_correct
     FROM daily_recommendations 
     WHERE is_correct IS NOT NULL
     ORDER BY match_time DESC
     LIMIT 50`
  );
  return result.rows;
}

export default async function ResultsPage() {
  const results = await getRecentResults();
  const wins = results.filter((r) => r.is_correct === true);
  const losses = results.filter((r) => r.is_correct === false);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">📊 תוצאות אחרונות</h1>
        <p className="text-gray-400 text-sm mt-1">
          50 ההמלצות האחרונות שנבדקו — {wins.length} ניצחונות, {losses.length}{" "}
          הפסדים ({results.length > 0 ? Math.round((wins.length / results.length) * 100) : 0}%)
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <span className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium">
          הכל ({results.length})
        </span>
        <span className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-medium">
          ✅ {wins.length}
        </span>
        <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-medium">
          ❌ {losses.length}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}
