export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-[#111827]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            בחר את המסלול שלך
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            התחל בחינם עם טיפ 1 ביום. רוצה יותר הזדמנויות? שדרג בכל רגע.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <div className="glass-card rounded-2xl p-6 flex flex-col border border-white/10">
            <h3 className="text-lg font-bold text-white mb-1">🆓 חינם</h3>
            <div className="mb-1">
              <span className="text-3xl font-extrabold text-white">₪0</span>
            </div>
            <div className="text-xs text-gray-500 mb-6">לצמיתות</div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "טיפ 1 ביום — הטוב ביותר",
                "צפייה במשחקי היום",
                "30+ ליגות",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-[#10b981] mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>

            <a
              href="/auth/signup"
              className="block text-center py-3 rounded-xl font-bold text-sm transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10"
            >
              התחל בחינם
            </a>
          </div>

          {/* היכרות — שבועי */}
          <div className="glass-card rounded-2xl p-6 flex flex-col border border-white/10">
            <h3 className="text-lg font-bold text-white mb-1">🔥 חבילת היכרות</h3>
            <div className="mb-1">
              <span className="text-3xl font-extrabold text-white">₪49</span>
              <span className="text-gray-400 text-sm mr-1">/ שבוע</span>
            </div>
            <div className="text-xs text-gray-500 mb-6">7 ימים — בלי התחייבות</div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "כל הטיפים — ללא הגבלה",
                "דשבורד תוצאות מלא",
                "ניתוח מפורט לכל משחק",
                "30+ ליגות",
                "ביטול בכל רגע",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-[#10b981] mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>

            <a
              href="/checkout?plan=weekly"
              className="block text-center py-3 rounded-xl font-bold text-sm transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10"
            >
              נסה שבוע
            </a>
          </div>

          {/* חודשי — Popular */}
          <div className="glass-card rounded-2xl p-6 flex flex-col pricing-popular relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f5a623] text-[#0a0e17] text-xs font-bold px-3 py-1 rounded-full">
              הכי משתלם
            </div>
            <h3 className="text-lg font-bold text-white mb-1">👑 חבילה חודשית</h3>
            <div className="mb-1">
              <span className="text-gray-500 line-through text-lg ml-2">₪399</span>
              <span className="text-3xl font-extrabold text-white">₪199</span>
              <span className="text-gray-400 text-sm mr-1">/ חודש</span>
            </div>
            <div className="text-xs text-[#10b981] mb-6">50% הנחה — מבצע השקה</div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "כל הטיפים — ללא הגבלה",
                "דשבורד תוצאות מלא",
                "ניתוח מפורט לכל משחק",
                "30+ ליגות",
                "התראות ישירות כל בוקר",
                "ביטול בכל רגע",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-[#10b981] mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>

            <a
              href="/checkout?plan=monthly"
              className="block text-center py-3 rounded-xl font-bold text-sm transition-all bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17]"
            >
              התחל לנצח
            </a>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          תשלום מאובטח באשראי. ביטול בלחיצת כפתור, בלי דמי ביטול.
        </p>
      </div>
    </section>
  );
}
