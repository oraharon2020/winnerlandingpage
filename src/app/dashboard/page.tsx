import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import StatsBar from "@/components/dashboard/StatsBar";
import CancelSubscriptionButton from "@/components/dashboard/CancelSubscriptionButton";
import Link from "next/link";

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

async function getUserSubscription(supabaseUid: string) {
  if (!pool) return null;
  const result = await pool.query(
    `SELECT s.plan_type, s.expires_at, s.is_active, s.is_recurring
     FROM subscriptions s
     JOIN users u ON u.id = s.user_id
     WHERE u.supabase_uid = $1 AND s.is_active = true AND s.expires_at > NOW()
     ORDER BY s.expires_at DESC
     LIMIT 1`,
    [supabaseUid]
  );
  return result.rows[0] || null;
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

  // Check subscription
  const subscription = user ? await getUserSubscription(user.id) : null;
  const isPremium = !!subscription;
  const FREE_TIP_LIMIT = 1;

  // Free users see only the first tip
  const visibleRecs = isPremium ? recommendations : recommendations.slice(0, FREE_TIP_LIMIT);
  const lockedCount = isPremium ? 0 : Math.max(0, recommendations.length - FREE_TIP_LIMIT);

  const now = new Date();

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
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
          {isPremium ? (
            <div className="text-left">
              <span className="inline-flex items-center gap-1.5 bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] text-sm font-medium px-3 py-1 rounded-full">
                👑 {subscription.plan_type === "monthly" ? "חבילה חודשית" : "חבילת היכרות"}
                {subscription.is_recurring && <span className="text-[10px] opacity-70 mr-1">(הו&quot;ק)</span>}
              </span>
              {subscription.is_recurring && <CancelSubscriptionButton />}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-400 text-sm px-3 py-1 rounded-full">
              🆓 חינם
            </span>
          )}
        </div>
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
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleRecs.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>

            {/* Upgrade CTA for free users */}
            {lockedCount > 0 && (
              <div className="mt-6 glass-card rounded-2xl p-6 border border-[#f5a623]/30 bg-[#f5a623]/5 text-center">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-white font-bold text-lg mb-2">
                  עוד {lockedCount} טיפים ממתינים לך
                </h3>
                <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
                  משתמשי חינם מקבלים טיפ 1 ביום. שדרג כדי לראות את כל ההמלצות ולקבל גישה מלאה לדשבורד.
                </p>
                <Link
                  href="/checkout"
                  className="inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17] font-bold px-6 py-3 rounded-xl transition-all"
                >
                  🏆 שדרג עכשיו
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
