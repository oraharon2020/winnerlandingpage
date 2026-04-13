"use client";

import { useEffect, useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

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
  campaigns: { source: string; users: string; paying: string }[];
}

interface UserData {
  id: number;
  telegramId: number;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  isPremium: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
  subscription: {
    plan: string;
    expires: string;
    active: boolean;
    recurring: boolean;
    price: number;
  } | null;
  campaignSource: string | null;
}

interface RejectedBet {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchTime: string;
  betType: string;
  odds: number;
  reason: string;
  homeGoals: number | null;
  awayGoals: number | null;
  wouldHaveWon: boolean | null;
  createdAt: string;
}

interface RejectedSummary {
  reason: string;
  total: number;
  wouldWon: number;
  wouldLost: number;
  unchecked: number;
}

type Tab = "overview" | "users" | "predictions" | "rejected" | "campaigns" | "subscriptions" | "plans" | "coupons";

// ═══════════════════════════════════════════════════════════
// Shared Components
// ═══════════════════════════════════════════════════════════

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

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-gray-800 rounded-xl p-6 bg-gray-900/50 ${className}`}>
      {children}
    </div>
  );
}

function rateColor(rate: number) {
  if (rate >= 70) return "text-emerald-400 font-bold";
  if (rate >= 60) return "text-amber-400";
  return "text-red-400";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ═══════════════════════════════════════════════════════════
// Tab: Overview
// ═══════════════════════════════════════════════════════════

function OverviewTab({ data }: { data: DashboardData }) {
  const { overview, predictions, today, weeklyStats, dailyStats, betTypes } = data;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="👥 משתמשים"
          value={overview.totalUsers}
          sub={`+${overview.newUsers7d} ב-7 ימים · +${overview.newUsers30d} ב-30`}
          color="blue"
        />
        <StatCard
          label="⭐ מנויים פעילים"
          value={overview.activeSubs}
          sub={`+${overview.newSubs30d} חדשים ב-30 יום`}
          color="purple"
        />
        <StatCard
          label="🎯 אחוז הצלחה כולל"
          value={`${predictions.winRate}%`}
          sub={`${predictions.wins}W / ${predictions.losses}L מתוך ${predictions.checked}`}
          color={predictions.winRate >= 70 ? "emerald" : predictions.winRate >= 60 ? "amber" : "red"}
        />
        <StatCard
          label="💰 הכנסות 30 יום"
          value={`${overview.revenue30d.toLocaleString()}⭐`}
          sub={`סה"כ כל הזמנים: ${overview.totalRevenue.toLocaleString()}⭐`}
          color="amber"
        />
      </div>

      {/* Today */}
      <Panel>
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
      </Panel>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Weekly Win Rate */}
        <Panel>
          <h2 className="text-xl font-bold mb-4">📈 אחוז הצלחה שבועי</h2>
          <div className="space-y-3">
            {weeklyStats.map((w) => (
              <div key={w.week}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{formatDate(w.week)}</span>
                  <span className={rateColor(w.winRate)}>
                    {w.winRate}% ({w.wins}W/{w.losses}L)
                  </span>
                </div>
                <WinBar wins={w.wins} losses={w.losses} />
              </div>
            ))}
            {weeklyStats.length === 0 && (
              <p className="text-gray-600 text-sm">אין נתונים עדיין</p>
            )}
          </div>
        </Panel>

        {/* Bet Type Performance */}
        <Panel>
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
            {betTypes.length === 0 && (
              <p className="text-gray-600 text-sm">אין נתונים עדיין</p>
            )}
          </div>
        </Panel>
      </div>

      {/* Daily Stats */}
      <Panel>
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
                        <span className={rateColor(rate)}>{rate}%</span>
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
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab: Users
// ═══════════════════════════════════════════════════════════

function UsersTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [grantModal, setGrantModal] = useState<UserData | null>(null);
  const [grantDays, setGrantDays] = useState(30);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "30",
        filter,
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setUsers(json.users);
      setTotalPages(json.pagination.totalPages);
      setTotal(json.pagination.total);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  async function userAction(userId: number, action: string, days?: number) {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, days }),
      });
      if (!res.ok) throw new Error();
      await fetchUsers();
    } catch {
      alert("שגיאה בביצוע הפעולה");
    } finally {
      setActionLoading(null);
      setGrantModal(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="🔍 חפש לפי שם / username / ID..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
        >
          <option value="all">👥 כולם</option>
          <option value="premium">⭐ פרימיום</option>
          <option value="free">🆓 חינם</option>
        </select>
        <span className="text-gray-500 text-sm">{total} משתמשים</span>
      </div>

      {/* Table */}
      <Panel>
        {loading ? (
          <p className="text-gray-500 text-center py-8">⏳ טוען...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-center py-8">לא נמצאו משתמשים</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right py-2 text-gray-400 font-medium">משתמש</th>
                  <th className="text-center py-2 text-gray-400 font-medium">סטטוס</th>
                  <th className="text-center py-2 text-gray-400 font-medium">מנוי</th>
                  <th className="text-center py-2 text-gray-400 font-medium">מקור</th>
                  <th className="text-center py-2 text-gray-400 font-medium">הצטרף</th>
                  <th className="text-center py-2 text-gray-400 font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3">
                      <div>
                        <span className="text-white font-medium">
                          {u.firstName || "—"} {u.lastName || ""}
                        </span>
                        {u.username && (
                          <span className="text-gray-500 text-xs mr-2">@{u.username}</span>
                        )}
                      </div>
                      <span className="text-gray-600 text-xs">ID: {u.telegramId}</span>
                    </td>
                    <td className="text-center py-3">
                      {u.isAdmin && <span className="text-red-400 text-xs">👑 ADMIN</span>}
                      {u.isBlocked && <span className="text-red-400 text-xs">🚫 חסום</span>}
                      {!u.isAdmin && !u.isBlocked && (
                        <span className={u.isPremium ? "text-emerald-400" : "text-gray-500"}>
                          {u.isPremium ? "⭐ פרימיום" : "🆓 חינם"}
                        </span>
                      )}
                    </td>
                    <td className="text-center py-3 text-xs">
                      {u.subscription ? (
                        <div>
                          <span className={u.subscription.active ? "text-emerald-400" : "text-red-400"}>
                            {u.subscription.active ? "✅" : "❌"} {u.subscription.plan}
                          </span>
                          {u.subscription.recurring && (
                            <span className="text-blue-400 mr-1"> 🔄</span>
                          )}
                          <div className="text-gray-600">
                            {u.subscription.price}⭐ ·{" "}
                            {u.subscription.expires
                              ? formatDate(u.subscription.expires)
                              : "—"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="text-center py-3">
                      {u.campaignSource ? (
                        <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-xs">
                          {u.campaignSource}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">direct</span>
                      )}
                    </td>
                    <td className="text-center py-3 text-gray-400 text-xs">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="text-center py-3">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {actionLoading === u.id ? (
                          <span className="text-gray-500 text-xs">⏳</span>
                        ) : (
                          <>
                            {u.isPremium ? (
                              <button
                                onClick={() => {
                                  if (confirm(`בטל פרימיום ל-${u.firstName || u.username || u.telegramId}?`))
                                    userAction(u.id, "revoke_premium");
                                }}
                                className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-2 py-0.5 rounded text-xs transition-colors"
                              >
                                ❌ בטל
                              </button>
                            ) : (
                              <button
                                onClick={() => { setGrantDays(30); setGrantModal(u); }}
                                className="bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded text-xs transition-colors"
                              >
                                ⭐ תן פרימיום
                              </button>
                            )}
                            {u.isBlocked ? (
                              <button
                                onClick={() => userAction(u.id, "unblock")}
                                className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded text-xs transition-colors"
                              >
                                🔓 שחרר
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (confirm(`חסום את ${u.firstName || u.username || u.telegramId}?`))
                                    userAction(u.id, "block");
                                }}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-0.5 rounded text-xs transition-colors"
                              >
                                🚫
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-800">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-800 rounded text-sm disabled:opacity-30 hover:bg-gray-700"
            >
              ◀ הקודם
            </button>
            <span className="px-3 py-1 text-gray-400 text-sm">
              עמוד {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-800 rounded text-sm disabled:opacity-30 hover:bg-gray-700"
            >
              הבא ▶
            </button>
          </div>
        )}
      </Panel>

      {/* Grant Premium Modal */}
      {grantModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">⭐ הענק פרימיום</h3>
            <p className="text-gray-400 text-sm mb-4">
              {grantModal.firstName || grantModal.username || grantModal.telegramId}
            </p>
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-1 block">תקופה</label>
              <select
                value={grantDays}
                onChange={(e) => setGrantDays(parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value={7}>7 ימים</option>
                <option value={30}>30 ימים (חודש)</option>
                <option value={90}>90 ימים (3 חודשים)</option>
                <option value={365}>365 ימים (שנה)</option>
                <option value={36500}>ללא הגבלה</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => userAction(grantModal.id, "grant_premium", grantDays)}
                disabled={actionLoading === grantModal.id}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === grantModal.id ? "⏳ מעדכן..." : "✅ אשר"}
              </button>
              <button
                onClick={() => setGrantModal(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab: Predictions (Recent)
// ═══════════════════════════════════════════════════════════

function PredictionsTab({ data }: { data: DashboardData }) {
  const { recentRecs } = data;

  return (
    <div className="space-y-4">
      {/* Summary line */}
      <div className="flex gap-4 text-sm text-gray-400">
        <span>🎯 {data.predictions.winRate}% הצלחה כוללת</span>
        <span>·</span>
        <span>✅ {data.predictions.wins} / ❌ {data.predictions.losses}</span>
        <span>·</span>
        <span>📊 {data.predictions.total} סה&quot;כ</span>
      </div>

      <Panel>
        <h2 className="text-xl font-bold mb-4">🕐 המלצות אחרונות</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-right py-2 text-gray-400 font-medium">זמן</th>
                <th className="text-right py-2 text-gray-400 font-medium">משחק</th>
                <th className="text-right py-2 text-gray-400 font-medium">ליגה</th>
                <th className="text-right py-2 text-gray-400 font-medium">סוג</th>
                <th className="text-center py-2 text-gray-400 font-medium">מקדם</th>
                <th className="text-center py-2 text-gray-400 font-medium">prob</th>
                <th className="text-center py-2 text-gray-400 font-medium">תוצאה</th>
              </tr>
            </thead>
            <tbody>
              {recentRecs.map((r, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 text-gray-500 text-xs whitespace-nowrap">
                    {formatDateTime(r.matchTime)}
                  </td>
                  <td className="py-2">
                    <span className="text-white">{r.homeTeam}</span>
                    <span className="text-gray-600 mx-1">vs</span>
                    <span className="text-white">{r.awayTeam}</span>
                  </td>
                  <td className="py-2 text-gray-400 text-xs">{r.league}</td>
                  <td className="py-2">
                    <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs">
                      {r.betType}
                    </span>
                  </td>
                  <td className="text-center py-2 text-amber-400">{r.odds}</td>
                  <td className="text-center py-2 text-gray-400 text-xs">{r.probability}%</td>
                  <td className="text-center py-2 text-lg">
                    {r.isCorrect === true ? "✅" : r.isCorrect === false ? "❌" : "⏳"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab: Rejected Bets
// ═══════════════════════════════════════════════════════════

function RejectedTab() {
  const [rejected, setRejected] = useState<RejectedBet[]>([]);
  const [summary, setSummary] = useState<RejectedSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRejected = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rejected?days=${days}&page=${page}&limit=30`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRejected(json.rejected);
      setSummary(json.summary);
      setTotalPages(json.pagination.totalPages);
    } catch {
      setRejected([]);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }, [days, page]);

  useEffect(() => {
    fetchRejected();
  }, [fetchRejected]);

  // Summary stats
  const totalRejected = summary.reduce((s, r) => s + r.total, 0);
  const totalWouldWon = summary.reduce((s, r) => s + r.wouldWon, 0);
  const totalWouldLost = summary.reduce((s, r) => s + r.wouldLost, 0);
  const checkedRejected = totalWouldWon + totalWouldLost;
  const rejectedWinRate = checkedRejected > 0 ? Math.round((totalWouldWon / checkedRejected) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-3 items-center">
        <select
          value={days}
          onChange={(e) => { setDays(parseInt(e.target.value)); setPage(1); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value={3}>3 ימים</option>
          <option value={7}>7 ימים</option>
          <option value={14}>14 ימים</option>
          <option value={30}>30 ימים</option>
        </select>
        <span className="text-gray-500 text-sm">
          {totalRejected} נדחו · {checkedRejected > 0 && `${rejectedWinRate}% היו מנצחים`}
        </span>
      </div>

      {/* Summary by Reason */}
      <Panel>
        <h2 className="text-xl font-bold mb-4">📋 סיכום לפי סיבת דחייה</h2>
        {loading ? (
          <p className="text-gray-500 text-center py-4">⏳ טוען...</p>
        ) : summary.length === 0 ? (
          <p className="text-gray-500 text-center py-4">אין נתונים לתקופה זו</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right py-2 text-gray-400 font-medium">סיבה</th>
                  <th className="text-center py-2 text-gray-400 font-medium">נדחו</th>
                  <th className="text-center py-2 text-gray-400 font-medium">היו מנצחים</th>
                  <th className="text-center py-2 text-gray-400 font-medium">היו מפסידים</th>
                  <th className="text-center py-2 text-gray-400 font-medium">% ניצחון</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s) => {
                  const checked = s.wouldWon + s.wouldLost;
                  const rate = checked > 0 ? Math.round((s.wouldWon / checked) * 100) : null;
                  return (
                    <tr key={s.reason} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 text-gray-300 text-xs max-w-[300px] truncate">{s.reason}</td>
                      <td className="text-center py-2">{s.total}</td>
                      <td className="text-center py-2 text-emerald-400">{s.wouldWon}</td>
                      <td className="text-center py-2 text-red-400">{s.wouldLost}</td>
                      <td className="text-center py-2">
                        {rate !== null ? (
                          <span className={rate <= 50 ? "text-emerald-400" : "text-red-400"}>
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
        )}
        <p className="text-gray-600 text-xs mt-3">
          💡 אם &quot;% ניצחון&quot; נמוך = הפילטר עובד טוב (דחה הימורים מפסידים)
        </p>
      </Panel>

      {/* Rejected List */}
      <Panel>
        <h2 className="text-xl font-bold mb-4">🚫 הימורים שנדחו</h2>
        {loading ? (
          <p className="text-gray-500 text-center py-4">⏳ טוען...</p>
        ) : rejected.length === 0 ? (
          <p className="text-gray-500 text-center py-4">אין נתונים</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right py-2 text-gray-400 font-medium">משחק</th>
                  <th className="text-right py-2 text-gray-400 font-medium">סוג</th>
                  <th className="text-center py-2 text-gray-400 font-medium">מקדם</th>
                  <th className="text-right py-2 text-gray-400 font-medium">סיבה</th>
                  <th className="text-center py-2 text-gray-400 font-medium">תוצאה</th>
                  <th className="text-center py-2 text-gray-400 font-medium">היה?</th>
                </tr>
              </thead>
              <tbody>
                {rejected.map((r, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2">
                      <span className="text-white text-xs">{r.homeTeam} vs {r.awayTeam}</span>
                      <div className="text-gray-600 text-xs">{r.league}</div>
                    </td>
                    <td className="py-2 text-gray-300 text-xs">{r.betType}</td>
                    <td className="text-center py-2 text-amber-400 text-xs">{r.odds || "—"}</td>
                    <td className="py-2 text-gray-500 text-xs max-w-[200px] truncate">{r.reason}</td>
                    <td className="text-center py-2 text-xs text-gray-400">
                      {r.homeGoals !== null ? `${r.homeGoals}-${r.awayGoals}` : "—"}
                    </td>
                    <td className="text-center py-2 text-lg">
                      {r.wouldHaveWon === true ? "✅" : r.wouldHaveWon === false ? "❌" : "⏳"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-800">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-800 rounded text-sm disabled:opacity-30 hover:bg-gray-700"
            >
              ◀ הקודם
            </button>
            <span className="px-3 py-1 text-gray-400 text-sm">
              עמוד {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-800 rounded text-sm disabled:opacity-30 hover:bg-gray-700"
            >
              הבא ▶
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab: Subscriptions
// ═══════════════════════════════════════════════════════════

interface SubData {
  id: number;
  userId: number;
  planType: string;
  pricePaid: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  paymentMethod: string;
  isRecurring: boolean;
  paypalOrderId: string | null;
  createdAt: string;
  userName: string;
}

function SubscriptionsTab() {
  const [subs, setSubs] = useState<SubData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/subscriptions?page=${page}&filter=${filter}&limit=30`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubs(data.subscriptions);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  async function handleAction(action: string, subscriptionId: number, extra?: Record<string, unknown>) {
    setActionLoading(subscriptionId);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, subscriptionId, ...extra }),
      });
      if (res.ok) {
        fetchSubs();
      }
    } finally {
      setActionLoading(null);
    }
  }

  const filters = [
    { id: "all", label: "הכל" },
    { id: "active", label: "פעילים" },
    { id: "expired", label: "פג תוקף" },
    { id: "paypal", label: "PayPal" },
    { id: "admin", label: "אדמין" },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id
                ? "bg-emerald-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Panel>
        {loading ? (
          <p className="text-gray-500 text-center py-8">⏳ טוען...</p>
        ) : subs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">אין מנויים</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right py-2 text-gray-400 font-medium">משתמש</th>
                  <th className="text-center py-2 text-gray-400 font-medium">חבילה</th>
                  <th className="text-center py-2 text-gray-400 font-medium">מחיר</th>
                  <th className="text-center py-2 text-gray-400 font-medium">תשלום</th>
                  <th className="text-center py-2 text-gray-400 font-medium">תוקף</th>
                  <th className="text-center py-2 text-gray-400 font-medium">סטטוס</th>
                  <th className="text-center py-2 text-gray-400 font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => {
                  const isExpired = new Date(s.expiresAt) < new Date();
                  const isActiveNow = s.isActive && !isExpired;
                  return (
                    <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 text-gray-300">{s.userName}</td>
                      <td className="text-center py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          s.planType === "monthly" ? "bg-purple-900/30 text-purple-400" :
                          s.planType === "weekly" ? "bg-blue-900/30 text-blue-400" :
                          "bg-gray-800 text-gray-400"
                        }`}>
                          {s.planType}
                        </span>
                      </td>
                      <td className="text-center py-3 text-white">₪{s.pricePaid}</td>
                      <td className="text-center py-3">
                        <span className={`text-xs ${
                          s.paymentMethod === "paypal" ? "text-blue-400" : "text-amber-400"
                        }`}>
                          {s.paymentMethod === "paypal" ? "💳 PayPal" : "👑 אדמין"}
                        </span>
                      </td>
                      <td className="text-center py-3 text-gray-400 text-xs">
                        {formatDate(s.expiresAt)}
                      </td>
                      <td className="text-center py-3">
                        <span className={`text-xs font-medium ${
                          isActiveNow ? "text-emerald-400" : "text-red-400"
                        }`}>
                          {isActiveNow ? "✅ פעיל" : "❌ לא פעיל"}
                        </span>
                      </td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center gap-1">
                          {isActiveNow && (
                            <>
                              <button
                                onClick={() => handleAction("extend", s.id, { days: 7 })}
                                disabled={actionLoading === s.id}
                                className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-1 rounded transition-colors"
                                title="הארך 7 ימים"
                              >
                                +7
                              </button>
                              <button
                                onClick={() => handleAction("extend", s.id, { days: 30 })}
                                disabled={actionLoading === s.id}
                                className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-1 rounded transition-colors"
                                title="הארך 30 ימים"
                              >
                                +30
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("בטל מנוי?")) handleAction("cancel", s.id);
                                }}
                                disabled={actionLoading === s.id}
                                className="text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 px-2 py-1 rounded transition-colors"
                              >
                                ביטול
                              </button>
                            </>
                          )}
                          {!isActiveNow && (
                            <button
                              onClick={() => handleAction("extend", s.id, { days: 30 })}
                              disabled={actionLoading === s.id}
                              className="text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 px-2 py-1 rounded transition-colors"
                            >
                              חדש 30 ימים
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-800">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-800 text-sm disabled:opacity-30"
            >
              ←
            </button>
            <span className="text-sm text-gray-400 px-2 py-1">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-800 text-sm disabled:opacity-30"
            >
              →
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab: Plans Management
// ═══════════════════════════════════════════════════════════

interface PlanData {
  id: string;
  nameHe: string;
  icon: string;
  price: number;
  originalPrice: number | null;
  period: string;
  periodHe: string;
  durationDays: number;
  features: string[];
  maxTipsPerDay: number;
  badge: string | null;
  isPopular: boolean;
  isActive: boolean;
  isFree: boolean;
  ctaText: string;
  ctaLink: string | null;
  sortOrder: number;
  description: string | null;
}

const EMPTY_PLAN: PlanData = {
  id: "",
  nameHe: "",
  icon: "⭐",
  price: 0,
  originalPrice: null,
  period: "month",
  periodHe: "/ חודש",
  durationDays: 30,
  features: [],
  maxTipsPerDay: 999,
  badge: null,
  isPopular: false,
  isActive: true,
  isFree: false,
  ctaText: "התחל עכשיו",
  ctaLink: null,
  sortOrder: 0,
  description: null,
};

function PlansTab() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PlanData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [featuresText, setFeaturesText] = useState("");
  const [migrated, setMigrated] = useState<boolean | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlans(data.plans);
      setMigrated(true);
    } catch {
      setPlans([]);
      setMigrated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  async function runMigration() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/setup-plans", { method: "POST" });
      if (res.ok) {
        setMigrated(true);
        fetchPlans();
      }
    } finally {
      setSaving(false);
    }
  }

  function startEdit(plan: PlanData) {
    setEditing({ ...plan });
    setFeaturesText(plan.features.join("\n"));
    setIsNew(false);
  }

  function startCreate() {
    setEditing({ ...EMPTY_PLAN });
    setFeaturesText("");
    setIsNew(true);
  }

  async function savePlan() {
    if (!editing) return;
    setSaving(true);
    try {
      const planToSave = { ...editing, features: featuresText.split("\n").map(f => f.trim()).filter(Boolean) };
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isNew ? "create" : "update", plan: planToSave }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditing(null);
        fetchPlans();
      } else {
        alert(data.error || "שגיאה בשמירה");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(planId: string, field: string) {
    await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", planId, field }),
    });
    fetchPlans();
  }

  async function deletePlan(planId: string) {
    if (!confirm(`למחוק את החבילה "${planId}"?`)) return;
    const res = await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", planId }),
    });
    const data = await res.json();
    if (res.ok) {
      fetchPlans();
      if (data.message?.includes("deactivated")) alert("החבילה הושבתה (יש מנויים פעילים)");
    }
  }

  // Migration needed
  if (migrated === false) {
    return (
      <Panel>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">טבלת חבילות לא נמצאה. צריך להריץ מיגרציה.</p>
          <button
            onClick={runMigration}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? "⏳ מריץ..." : "🚀 הרץ מיגרציה"}
          </button>
        </div>
      </Panel>
    );
  }

  // Editor modal
  if (editing) {
    return (
      <Panel>
        <h3 className="text-white font-bold text-lg mb-4">
          {isNew ? "➕ חבילה חדשה" : `✏️ עריכת: ${editing.nameHe}`}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isNew && (
            <div>
              <label className="text-gray-400 text-xs block mb-1">מזהה (אנגלית, ללא רווחים)</label>
              <input
                value={editing.id}
                onChange={(e) => setEditing({ ...editing, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="yearly"
              />
            </div>
          )}
          <div>
            <label className="text-gray-400 text-xs block mb-1">שם (עברית)</label>
            <input
              value={editing.nameHe}
              onChange={(e) => setEditing({ ...editing, nameHe: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="חבילה שנתית"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">אייקון</label>
            <input
              value={editing.icon}
              onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="👑"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">מחיר (₪)</label>
            <input
              type="number"
              value={editing.price}
              onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">מחיר מקורי (לקו חוצה, ריק=ללא)</label>
            <input
              type="number"
              value={editing.originalPrice ?? ""}
              onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="399"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">תקופה</label>
            <select
              value={editing.period}
              onChange={(e) => {
                const p = e.target.value;
                const map: Record<string, { periodHe: string; durationDays: number }> = {
                  week: { periodHe: "/ שבוע", durationDays: 7 },
                  month: { periodHe: "/ חודש", durationDays: 30 },
                  year: { periodHe: "/ שנה", durationDays: 365 },
                  forever: { periodHe: "לצמיתות", durationDays: 0 },
                };
                setEditing({ ...editing, period: p, ...(map[p] || {}) });
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="week">שבוע</option>
              <option value="month">חודש</option>
              <option value="year">שנה</option>
              <option value="forever">לצמיתות</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">טקסט תקופה (מוצג)</label>
            <input
              value={editing.periodHe}
              onChange={(e) => setEditing({ ...editing, periodHe: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="/ חודש"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">ימים</label>
            <input
              type="number"
              value={editing.durationDays}
              onChange={(e) => setEditing({ ...editing, durationDays: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">באדג׳ (תווית מבצע)</label>
            <input
              value={editing.badge ?? ""}
              onChange={(e) => setEditing({ ...editing, badge: e.target.value || null })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="50% הנחה — מבצע השקה"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">טקסט כפתור</label>
            <input
              value={editing.ctaText}
              onChange={(e) => setEditing({ ...editing, ctaText: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="התחל לנצח"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">לינק כפתור (ריק = checkout)</label>
            <input
              value={editing.ctaLink ?? ""}
              onChange={(e) => setEditing({ ...editing, ctaLink: e.target.value || null })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="/auth/signup"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">סדר מיון</label>
            <input
              type="number"
              value={editing.sortOrder}
              onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">תיאור קצר</label>
            <input
              value={editing.description ?? ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value || null })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="7 ימים — בלי התחייבות"
            />
          </div>
          <div className="flex items-center gap-6 md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isPopular}
                onChange={(e) => setEditing({ ...editing, isPopular: e.target.checked })}
                className="rounded"
              />
              ⭐ הכי משתלם
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isFree}
                onChange={(e) => setEditing({ ...editing, isFree: e.target.checked })}
                className="rounded"
              />
              🆓 חינם
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isActive}
                onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                className="rounded"
              />
              ✅ פעיל
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-gray-400 text-xs block mb-1">פיצ׳רים (שורה לכל פיצ׳ר)</label>
          <textarea
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={5}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            placeholder={"כל הטיפים — ללא הגבלה\nדשבורד תוצאות מלא\nביטול בכל רגע"}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={savePlan}
            disabled={saving || !editing.nameHe || (isNew && !editing.id)}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? "⏳ שומר..." : "💾 שמור"}
          </button>
          <button
            onClick={() => setEditing(null)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            ביטול
          </button>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold">ניהול חבילות</h3>
        <button
          onClick={startCreate}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ➕ חבילה חדשה
        </button>
      </div>

      <Panel>
        {loading ? (
          <p className="text-gray-500 text-center py-8">⏳ טוען...</p>
        ) : plans.length === 0 ? (
          <p className="text-gray-500 text-center py-8">אין חבילות</p>
        ) : (
          <div className="space-y-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  p.isActive
                    ? "border-gray-700 bg-gray-900/50"
                    : "border-red-900/30 bg-red-950/10 opacity-60"
                }`}
              >
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{p.nameHe}</span>
                    {p.isPopular && <span className="text-[10px] bg-[#f5a623] text-[#0a0e17] px-1.5 py-0.5 rounded-full font-bold">הכי משתלם</span>}
                    {p.isFree && <span className="text-[10px] bg-gray-600 text-white px-1.5 py-0.5 rounded-full">חינם</span>}
                    {!p.isActive && <span className="text-[10px] bg-red-800 text-white px-1.5 py-0.5 rounded-full">מושבת</span>}
                    {p.badge && <span className="text-[10px] bg-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded-full">{p.badge}</span>}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {p.originalPrice && <span className="line-through text-gray-600 ml-1">₪{p.originalPrice}</span>}
                    <span className="text-white font-medium">₪{p.price}</span>
                    <span className="text-gray-500 mr-1">{p.periodHe}</span>
                    {p.description && <span className="text-gray-600 mr-2">· {p.description}</span>}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {p.features.length} פיצ׳רים · סדר: {p.sortOrder} · {p.durationDays} ימים
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleField(p.id, "is_active")}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      p.isActive
                        ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40"
                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                    title={p.isActive ? "השבת" : "הפעל"}
                  >
                    {p.isActive ? "🟢" : "🔴"}
                  </button>
                  <button
                    onClick={() => startEdit(p)}
                    className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-1 rounded transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deletePlan(p.id)}
                    className="text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 px-2 py-1 rounded transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <p className="text-gray-500 text-xs">
          💡 שינויים בחבילות משפיעים ישירות על סקשן התמחור באתר ועל דף התשלום.
          חבילות פעילות מוצגות לפי סדר מיון. חבילות עם מנויים פעילים יושבתו במקום להימחק.
        </p>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab: Coupons Management
// ═══════════════════════════════════════════════════════════

interface CouponData {
  id: number;
  code: string;
  discountPercent: number | null;
  discountAmount: number | null;
  planId: string | null;
  planName: string | null;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

function CouponsTab() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<{ id: string; nameHe: string }[]>([]);

  // New coupon form
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percent" | "amount">("percent");
  const [newDiscount, setNewDiscount] = useState("");
  const [newPlanId, setNewPlanId] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newExpires, setNewExpires] = useState("");

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCoupons(data.coupons);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans.filter((p: PlanData) => !p.isFree));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchCoupons(); fetchPlans(); }, [fetchCoupons, fetchPlans]);

  async function createCoupon() {
    if (!newCode || !newDiscount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          coupon: {
            code: newCode,
            discountPercent: newType === "percent" ? Number(newDiscount) : null,
            discountAmount: newType === "amount" ? Number(newDiscount) : null,
            planId: newPlanId || null,
            maxUses: newMaxUses ? Number(newMaxUses) : null,
            expiresAt: newExpires || null,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreating(false);
        setNewCode(""); setNewDiscount(""); setNewPlanId(""); setNewMaxUses(""); setNewExpires("");
        fetchCoupons();
      } else {
        alert(data.error || "שגיאה");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleCoupon(id: number) {
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", couponId: id }),
    });
    fetchCoupons();
  }

  async function deleteCoupon(id: number, code: string) {
    if (!confirm(`למחוק קופון "${code}"?`)) return;
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", couponId: id }),
    });
    fetchCoupons();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold">ניהול קופונים</h3>
        <button
          onClick={() => setCreating(!creating)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {creating ? "✕ סגור" : "➕ קופון חדש"}
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <Panel>
          <h4 className="text-white font-bold mb-4">יצירת קופון</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs block mb-1">קוד קופון</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="SUMMER50"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">סוג הנחה</label>
              <div className="flex gap-2">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as "percent" | "amount")}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="percent">אחוז %</option>
                  <option value="amount">סכום קבוע ₪</option>
                </select>
                <input
                  type="number"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder={newType === "percent" ? "20" : "50"}
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">מוגבל לחבילה (ריק = הכל)</label>
              <select
                value={newPlanId}
                onChange={(e) => setNewPlanId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">כל החבילות</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.nameHe}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">מקסימום שימושים (ריק = ללא הגבלה)</label>
              <input
                type="number"
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="100"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">תוקף (ריק = ללא הגבלה)</label>
              <input
                type="date"
                value={newExpires}
                onChange={(e) => setNewExpires(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <button
            onClick={createCoupon}
            disabled={saving || !newCode || !newDiscount}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? "⏳ יוצר..." : "✅ צור קופון"}
          </button>
        </Panel>
      )}

      {/* Coupons list */}
      <Panel>
        {loading ? (
          <p className="text-gray-500 text-center py-8">⏳ טוען...</p>
        ) : coupons.length === 0 ? (
          <p className="text-gray-500 text-center py-8">אין קופונים</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right py-2 text-gray-400 font-medium">קוד</th>
                  <th className="text-center py-2 text-gray-400 font-medium">הנחה</th>
                  <th className="text-center py-2 text-gray-400 font-medium">חבילה</th>
                  <th className="text-center py-2 text-gray-400 font-medium">שימושים</th>
                  <th className="text-center py-2 text-gray-400 font-medium">תוקף</th>
                  <th className="text-center py-2 text-gray-400 font-medium">סטטוס</th>
                  <th className="text-center py-2 text-gray-400 font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  const maxed = c.maxUses !== null && c.currentUses >= c.maxUses;
                  return (
                    <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3">
                        <code className="text-white font-mono font-bold bg-gray-800 px-2 py-0.5 rounded text-xs">{c.code}</code>
                      </td>
                      <td className="text-center py-3 text-white">
                        {c.discountPercent ? `${c.discountPercent}%` : `₪${c.discountAmount}`}
                      </td>
                      <td className="text-center py-3 text-gray-400 text-xs">
                        {c.planName || "הכל"}
                      </td>
                      <td className="text-center py-3 text-gray-300">
                        {c.currentUses}{c.maxUses !== null ? ` / ${c.maxUses}` : " / ∞"}
                      </td>
                      <td className="text-center py-3 text-xs text-gray-400">
                        {c.expiresAt ? formatDate(c.expiresAt) : "∞"}
                      </td>
                      <td className="text-center py-3">
                        <span className={`text-xs font-medium ${
                          !c.isActive ? "text-red-400" :
                          expired ? "text-amber-400" :
                          maxed ? "text-gray-500" :
                          "text-emerald-400"
                        }`}>
                          {!c.isActive ? "❌ מושבת" :
                           expired ? "⏰ פג תוקף" :
                           maxed ? "📊 מיצה" :
                           "✅ פעיל"}
                        </span>
                      </td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => toggleCoupon(c.id)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              c.isActive
                                ? "bg-amber-600/20 text-amber-400 hover:bg-amber-600/40"
                                : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40"
                            }`}
                          >
                            {c.isActive ? "השבת" : "הפעל"}
                          </button>
                          <button
                            onClick={() => deleteCoupon(c.id, c.code)}
                            className="text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 px-2 py-1 rounded transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab: Campaigns
// ═══════════════════════════════════════════════════════════

function CampaignsTab({ data }: { data: DashboardData }) {
  const { campaigns, overview } = data;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="👥 סה&quot;כ משתמשים" value={overview.totalUsers} color="blue" />
        <StatCard label="📢 מקמפיינים" value={campaigns.reduce((s, c) => s + parseInt(c.users || "0"), 0)} color="purple" />
        <StatCard
          label="💰 Conversion"
          value={
            overview.totalUsers > 0
              ? `${Math.round((overview.activeSubs / overview.totalUsers) * 100)}%`
              : "0%"
          }
          sub={`${overview.activeSubs} משלמים מתוך ${overview.totalUsers}`}
          color="emerald"
        />
      </div>

      {/* Deep Link Generator */}
      <Panel>
        <h2 className="text-xl font-bold mb-4">🔗 יצירת Deep Links לקמפיינים</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <DeepLinkCard label="Facebook" source="fb_main" />
          <DeepLinkCard label="Google Ads" source="google_ads" />
          <DeepLinkCard label="TikTok" source="tiktok_v1" />
          <DeepLinkCard label="Instagram" source="ig_story" />
        </div>
        <p className="text-gray-600 text-xs mt-3">
          💡 שנה את ה-source ליצירת קישורים לקמפיינים ספציפיים. לדוגמה: fb_march26, google_brand
        </p>
      </Panel>

      {/* Campaign Results */}
      <Panel>
        <h2 className="text-xl font-bold mb-4">📊 תוצאות קמפיינים</h2>
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">אין נתונים עדיין</p>
            <p className="text-gray-600 text-sm">
              משתמשים שנכנסים דרך Deep Links יופיעו כאן אוטומטית
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right py-2 text-gray-400 font-medium">מקור</th>
                  <th className="text-center py-2 text-gray-400 font-medium">משתמשים</th>
                  <th className="text-center py-2 text-gray-400 font-medium">משלמים</th>
                  <th className="text-center py-2 text-gray-400 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const users = parseInt(c.users || "0");
                  const paying = parseInt(c.paying || "0");
                  const conv = users > 0 ? Math.round((paying / users) * 100) : 0;
                  return (
                    <tr key={c.source} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3">
                        <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-xs">
                          {c.source}
                        </span>
                      </td>
                      <td className="text-center py-3 text-white">{users}</td>
                      <td className="text-center py-3 text-emerald-400">{paying}</td>
                      <td className="text-center py-3">
                        <span className={conv > 5 ? "text-emerald-400 font-bold" : "text-gray-400"}>
                          {conv}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function DeepLinkCard({ label, source }: { label: string; source: string }) {
  const [src, setSrc] = useState(source);
  const link = `https://t.me/WinnerBotTips`;
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <p className="text-gray-300 font-medium text-sm mb-2">{label}</p>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={src}
          onChange={(e) => setSrc(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
          className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white font-mono"
        />
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs text-gray-400 truncate">{link}</code>
        <button
          onClick={copy}
          className="text-xs bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded transition-colors whitespace-nowrap"
        >
          {copied ? "✅ הועתק" : "📋 העתק"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════════

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "סקירה", icon: "📊" },
  { id: "predictions", label: "המלצות", icon: "🎯" },
  { id: "users", label: "משתמשים", icon: "👥" },
  { id: "subscriptions", label: "מנויים", icon: "💳" },
  { id: "plans", label: "חבילות", icon: "📦" },
  { id: "coupons", label: "קופונים", icon: "🎟️" },
  { id: "rejected", label: "נדחו", icon: "🚫" },
  { id: "campaigns", label: "קמפיינים", icon: "📢" },
];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

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
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

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

  return (
    <div className="min-h-screen">
      {/* ──── Header ──── */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">📊 WinnerBot Admin</h1>
            <p className="text-gray-600 text-xs mt-0.5">
              עדכון אחרון: {new Date().toLocaleTimeString("he-IL")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              🔄 רענן
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              🚪 יציאה
            </button>
          </div>
        </div>

        {/* ──── Tabs ──── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-1 overflow-x-auto pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ──── Content ──── */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === "overview" && <OverviewTab data={data} />}
        {activeTab === "predictions" && <PredictionsTab data={data} />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "subscriptions" && <SubscriptionsTab />}
        {activeTab === "plans" && <PlansTab />}
        {activeTab === "coupons" && <CouponsTab />}
        {activeTab === "rejected" && <RejectedTab />}
        {activeTab === "campaigns" && <CampaignsTab data={data} />}
      </main>

      {/* Footer */}
      <div className="text-center text-gray-700 text-xs py-4">
        WinnerBot Admin · Auto-refresh 60s
      </div>
    </div>
  );
}
