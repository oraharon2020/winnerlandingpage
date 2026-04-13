export default function StatsBar({
  stats,
  todayCount,
}: {
  stats: { wins: number; losses: number; total: number; rate: number };
  todayCount: number;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="glass-card rounded-xl p-4 border border-white/10 text-center">
        <p className="text-2xl font-bold text-[#10b981]">{stats.rate}%</p>
        <p className="text-gray-400 text-xs mt-1">אחוז הצלחה כללי</p>
      </div>
      <div className="glass-card rounded-xl p-4 border border-white/10 text-center">
        <p className="text-2xl font-bold text-white">{stats.total}</p>
        <p className="text-gray-400 text-xs mt-1">המלצות שנבדקו</p>
      </div>
      <div className="glass-card rounded-xl p-4 border border-white/10 text-center">
        <p className="text-2xl font-bold text-green-400">
          {stats.wins}
          <span className="text-red-400 text-lg">/{stats.losses}</span>
        </p>
        <p className="text-gray-400 text-xs mt-1">W / L</p>
      </div>
      <div className="glass-card rounded-xl p-4 border border-white/10 text-center">
        <p className="text-2xl font-bold text-yellow-400">{todayCount}</p>
        <p className="text-gray-400 text-xs mt-1">המלצות היום</p>
      </div>
    </div>
  );
}
