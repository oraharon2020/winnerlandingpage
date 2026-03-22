"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────
interface DashboardData {
  overview: {
    totalUsers: number;
    newUsers7d: number;
    newUsers30d: number;
    premiumUsers: number;
    activeSubs: number;
    newSubs30d: number;
    revenue30d: number;
    totalRevenue: number;
  };
  predictions: {
    total: number;
    checked: number;
    wins: number;
    losses: number;
    winRate: number;
  };
  today: {
    total: number;
    wins: number;
    losses: number;
    pending: number;
  };
  weeklyStats: {
    week: string;
    wins: number;
    losses: number;
    total: number;
    winRate: number;
  }[];
  dailyStats: {
    day: string;
    total: number;
    wins: number;
    losses: number;
    pending: number;
  }[];
  betTypes: {
    key: string;
    total: number;
    wins: number;
    losses: number;
    avgOdds: number;
    winRate: number;
  }[];
  recentRecs: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    betType: string;
    betTypeKey: string;
    odds: number;
    probability: number;
    isCorrect: boolean | null;
    matchTime: string;
  }[];
  campaigns: { source: string; users: string }[];
}

// ─── Stat Card ───────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color = "emerald",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "emerald" | "blue" | "amber" | "red" | "purple";
}) {
  const colors = {
    emerald: "border-emerald-600/30 bg-emerald-950/20",
    blue: "border-blue-600/30 bg-blue-950/20",
    amber: "border-amber-600/30 bg-amber-950/20",
    red: "border-red-600/30 bg-red-950/20",
    purple: "border-purple-600/30 bg-purple-950/20",
  };
  const textColors = {
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
    red: "text-red-400",
    purple: "text-purple-400",
  };
  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${textColors[color]}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ─── Simple Bar ──────────────────────────────────────────
function WinBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  if (total === 0) return <div className="h-2 bg-gray-800 rounded-full" />;
  const pct = Math.round((wins / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-10 text-left">{pct}%</span>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401 || res.redirected) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError("");
    } catch {
      setError("שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">⏳ טוען דשבורד...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || "שגיאה"}</p>
          <button
            onClick={fetchData}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  const { overview, predictions, today, weeklyStats, dailyStats, betTypes, recentRecs } = data;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">📊 Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">WinnerBot — ממשק ניהול</p>
        </div>
        <button
          onClick={fetchData}
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          🔄 רענן
        </button>
      </div>

      {/* ──── Overview Cards ──── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="👥 משתמשים"
          value={overview.totalUsers}
          sub={`+${overview.newUsers7d} ב-7 ימים`}
          color="blue"
        />
        <StatCard
          label="⭐ מנויים פעילים"
          value={overview.activeSubs}
          sub={`+${overview.newSubs30d} ב-30 ימים`}
          color="purple"
        />
        <StatCard
          label="🎯 אחוז הצלחה"
          value={`${predictions.winRate}%`}
          sub={`${predictions.wins}W / ${predictions.losses}L מתוך ${predictions.checked}`}
          color={predictions.winRate >= 70 ? "emerald" : predictions.winRate >= 60 ? "amber" : "red"}
        />
        <StatCard
          label="💰 הכנסות 30 יום"
          value={`${overview.revenue30d.toLocaleString()}⭐`}
          sub={`סה"כ: ${overview.totalRevenue.toLocaleString()}⭐`}
          color="amber"
        />
      </div>

      {/* ──── Today ──── */}
      <div className="border border-gray-800 rounded-xl p-6 mb-8 bg-gray-900/50">
        <h2 className="text-xl font-bold mb-4">📅 היום</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{today.total}</p>
            <p className="text-gray-400 text-sm">המלצות</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-400">{today.wins}</p>
            <p className="text-gray-400 text-sm">✅ ניצחונות</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{today.losses}</p>
            <p className="text-gray-400 text-sm">❌ הפסדים</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-400">{today.pending}</p>
            <p className="text-gray-400 text-sm">⏳ ממתינים</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* ──── Weekly Win Rate ──── */}
        <div className="border border-gray-800 rounded-xl p-6 bg-gray-900/50">
          <h2 className="text-xl font-bold mb-4">📈 אחוז הצלחה שבועי</h2>
          <div className="space-y-3">
            {weeklyStats.map((w) => (
              <div key={w.week}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">
                    {new Date(w.week).toLocaleDateString("he-IL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className={w.winRate >= 70 ? "text-emerald-400" : w.winRate >= 60 ? "text-amber-400" : "text-red-400"}>
                    {w.winRate}% ({w.wins}W/{w.losses}L)
                  </span>
                </div>
                <WinBar wins={w.wins} losses={w.losses} />
              </div>
            ))}
          </div>
        </div>

        {/* ──── Bet Type Performance ──── */}
        <div className="border border-gray-800 rounded-xl p-6 bg-gray-900/50">
          <h2 className="text-xl font-bold mb-4">🎰 ביצועים לפי סוג הימור</h2>
          <div className="space-y-3">
            {betTypes.map((bt) => (
              <div key={bt.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 font-medium">{bt.key}</span>
                  <span className="text-gray-400">
                    {bt.winRate}% · {bt.wins}W/{bt.losses}L · avg {bt.avgOdds}
                  </span>
                </div>
                <WinBar wins={bt.wins} losses={bt.losses} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──── Daily Stats (Last 14 days) ──── */}
      <div className="border border-gray-800 rounded-xl p-6 mb-8 bg-gray-900/50">
        <h2 className="text-xl font-bold mb-4">📊 14 ימים אחרונים</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-right py-2 text-gray-400 font-medium">תאריך</th>
                <th className="text-center py-2 text-gray-400 font-medium">סה&quot;כ</th>
                <th className="text-center py-2 text-gray-400 font-medium">✅</th>
                <th className="text-center py-2 text-gray-400 font-medium">❌</th>
                <th className="text-center py-2 text-gray-400 font-medium">⏳</th>
                <th className="text-center py-2 text-gray-400 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {dailyStats.map((d) => {
                const checked = d.wins + d.losses;
                const rate = checked > 0 ? Math.round((d.wins / checked) * 100) : null;
                return (
                  <tr key={d.day} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 text-gray-300">
                      {new Date(d.day).toLocaleDateString("he-IL", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="text-center py-2">{d.total}</td>
                    <td className="text-center py-2 text-emerald-400">{d.wins}</td>
                    <td className="text-center py-2 text-red-400">{d.losses}</td>
                    <td className="text-center py-2 text-amber-400">{d.pending}</td>
                    <td className="text-center py-2">
                      {rate !== null ? (
                        <span className={rate >= 70 ? "text-emerald-400 font-bold" : rate >= 60 ? "text-amber-400" : "text-red-400"}>
                          {rate}%
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──── Recent Recommendations ──── */}
      <div className="border border-gray-800 rounded-xl p-6 bg-gray-900/50">
        <h2 className="text-xl font-bold mb-4">🕐 המלצות אחרונות</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-right py-2 text-gray-400 font-medium">משחק</th>
                <th className="text-right py-2 text-gray-400 font-medium">ליגה</th>
                <th className="text-right py-2 text-gray-400 font-medium">סוג</th>
                <th className="text-center py-2 text-gray-400 font-medium">מקדם</th>
                <th className="text-center py-2 text-gray-400 font-medium">תוצאה</th>
              </tr>
            </thead>
            <tbody>
              {recentRecs.map((r, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2">
                    <span className="text-white">{r.homeTeam}</span>
                    <span className="text-gray-500 mx-1">vs</span>
                    <span className="text-white">{r.awayTeam}</span>
                  </td>
                  <td className="py-2 text-gray-400 text-xs">{r.league}</td>
                  <td className="py-2 text-gray-300">{r.betType}</td>
                  <td className="text-center py-2 text-amber-400">{r.odds}</td>
                  <td className="text-center py-2 text-lg">
                    {r.isCorrect === true
                      ? "✅"
                      : r.isCorrect === false
                        ? "❌"
                        : "⏳"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 text-xs mt-8 pb-4">
        WinnerBot Admin · Auto-refresh every 60s
      </div>
    </div>
  );
}
