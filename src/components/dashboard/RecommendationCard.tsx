interface Rec {
  id: number;
  fixture_id: number;
  home_team: string;
  away_team: string;
  league: string;
  match_time: string;
  bet_type: string;
  odds: number;
  probability: number;
  risk_profile: string;
  reasons: string;
  is_correct: boolean | null;
}

export default function RecommendationCard({ rec }: { rec: Rec }) {
  const matchTime = new Date(rec.match_time);
  const timeStr = matchTime.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isFinished = rec.is_correct !== null;
  const isWin = rec.is_correct === true;
  const isPast = new Date() > matchTime;

  // Parse reasons
  const reasonsList = rec.reasons
    ? rec.reasons
        .split(/[;,\n]/)
        .map((r) => r.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all ${
        isFinished
          ? isWin
            ? "border-green-500/30 bg-green-500/5"
            : "border-red-500/30 bg-red-500/5"
          : "border-white/10 hover:border-[#10b981]/30"
      }`}
    >
      {/* Header: League + Time */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-xs">{rec.league}</span>
        <span className="text-gray-500 text-xs">{timeStr}</span>
      </div>

      {/* Teams */}
      <div className="text-center mb-3">
        <p className="text-white font-semibold text-base">
          {rec.home_team}
          <span className="text-gray-500 mx-2">vs</span>
          {rec.away_team}
        </p>
      </div>

      {/* Bet Type + Odds */}
      <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2 mb-3">
        <span className="text-[#10b981] font-medium text-sm">
          {rec.bet_type}
        </span>
        <span className="text-yellow-400 font-bold">{rec.odds}</span>
      </div>

      {/* Probability bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">סיכוי</span>
          <span className="text-white font-medium">{rec.probability}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5">
          <div
            className="bg-[#10b981] rounded-full h-1.5 transition-all"
            style={{ width: `${Math.min(rec.probability, 100)}%` }}
          />
        </div>
      </div>

      {/* Reasons */}
      {reasonsList.length > 0 && (
        <div className="space-y-1 mb-3">
          {reasonsList.map((reason, i) => (
            <p key={i} className="text-gray-500 text-xs">
              • {reason}
            </p>
          ))}
        </div>
      )}

      {/* Result badge */}
      {isFinished && (
        <div
          className={`text-center py-1.5 rounded-lg text-sm font-bold ${
            isWin
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isWin ? "✅ נתפס!" : "❌ לא נתפס"}
        </div>
      )}

      {/* Live indicator */}
      {!isFinished && isPast && (
        <div className="text-center py-1.5 rounded-lg text-sm font-medium bg-yellow-500/10 text-yellow-400">
          ⏱ משחק בתהליך
        </div>
      )}
    </div>
  );
}
