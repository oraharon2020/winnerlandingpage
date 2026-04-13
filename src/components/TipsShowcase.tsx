"use client";

import { useEffect, useState } from "react";

const tips = [
  {
    league: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 פרמייר ליג",
    home: "ליברפול",
    away: "מנצ׳סטר יונייטד",
    tip: "ניצחון בית",
    odds: "1.65",
    result: "won",
  },
  {
    league: "🇩🇪 בונדסליגה",
    home: "באיירן מינכן",
    away: "דורטמונד",
    tip: "מעל 2.5 שערים",
    odds: "1.55",
    result: "won",
  },
  {
    league: "🇪🇸 לה ליגה",
    home: "ריאל מדריד",
    away: "חטאפה",
    tip: "ניצחון בית",
    odds: "1.45",
    result: "won",
  },
  {
    league: "🇫🇷 ליג 1",
    home: "מארסיי",
    away: "ניס",
    tip: "מעל 2.5 שערים",
    odds: "1.60",
    result: "won",
  },
  {
    league: "🏆 צ׳מפיונס ליג",
    home: "ברצלונה",
    away: "אינטר",
    tip: "מעל 1.5 שערים",
    odds: "1.35",
    result: "won",
  },
  {
    league: "🇳🇱 ארדיוויזי",
    home: "PSV",
    away: "אייאקס",
    tip: "מעל 2.5 שערים",
    odds: "1.50",
    result: "won",
  },
];

export default function TipsShowcase() {
  const [active, setActive] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setActive((p) => (p + 1) % tips.length);
        setShow(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[380px] max-w-full mx-auto lg:mx-0">
      {/* Phone frame */}
      <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/40 bg-[#0e1621]">
        {/* Header */}
        <div className="bg-[#17212b] px-5 py-3 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span className="text-white font-bold text-sm">הטיפ המנצח</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
              <span className="text-[#10b981] text-xs font-medium">LIVE</span>
            </div>
          </div>
          <p className="text-gray-500 text-[11px] mt-1">התפיסות האחרונות שלנו</p>
        </div>

        {/* Tips feed */}
        <div className="p-4 min-h-[420px] flex flex-col">
          {/* Featured tip with animation */}
          <div
            className={`transition-all duration-400 ${
              show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            <div className="bg-gradient-to-br from-[#f5a623]/10 to-[#f5a623]/5 border border-[#f5a623]/20 rounded-2xl p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{tips[active].league}</span>
                <span className="bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✅ נתפס
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold text-sm">{tips[active].home}</span>
                <span className="text-gray-500 text-xs mx-2">VS</span>
                <span className="text-white font-bold text-sm">{tips[active].away}</span>
              </div>
              <div className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2">
                <div>
                  <div className="text-[10px] text-gray-500">הטיפ</div>
                  <div className="text-[#f5a623] font-bold text-sm">{tips[active].tip}</div>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-gray-500">יחס</div>
                  <div className="text-white font-bold text-lg">{tips[active].odds}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Previous tips list */}
          <div className="space-y-2 flex-1">
            {[1, 2, 3].map((offset) => {
              const idx = (active - offset + tips.length) % tips.length;
              const tip = tips[idx];
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[#1c2b3a]/50 rounded-xl px-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-gray-500">{tip.league}</div>
                    <div className="text-white text-xs font-medium truncate">
                      {tip.home} - {tip.away}
                    </div>
                  </div>
                  <div className="text-left mx-3">
                    <div className="text-[#f5a623] text-xs font-medium">{tip.tip}</div>
                    <div className="text-gray-400 text-[10px]">יחס {tip.odds}</div>
                  </div>
                  <span className="text-[#10b981] text-sm flex-shrink-0">✅</span>
                </div>
              );
            })}
          </div>

          {/* Stats bar */}
          <div className="mt-3 flex items-center justify-around bg-[#1c2b3a]/30 rounded-xl py-2.5 border border-white/5">
            <div className="text-center">
              <div className="text-[#f5a623] font-bold text-sm">500+</div>
              <div className="text-gray-500 text-[9px]">תפיסות</div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
              <div className="text-white font-bold text-sm">30+</div>
              <div className="text-gray-500 text-[9px]">ליגות</div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
              <div className="text-[#10b981] font-bold text-sm">12K+</div>
              <div className="text-gray-500 text-[9px]">משחקים נותחו</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
