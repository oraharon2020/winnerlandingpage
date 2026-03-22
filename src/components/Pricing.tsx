const BOT_LINK = "https://t.me/Mywinnerisraelbot";

const plans = [
  {
    name: "חודשי מתחדש",
    emoji: "🔥",
    stars: 2500,
    period: "30 ימים — מתחדש אוטומטית",
    features: [
      "כל ההמלצות — ללא הגבלה",
      "Push אוטומטי כל בוקר",
      "ניתוח AI מפורט לכל משחק",
      "גישה ל-30+ ליגות",
      "הוראת קבע — ביטול בכל רגע",
    ],
    cta: "התחל עכשיו",
    popular: true,
    style: "pricing-popular",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-[#111827]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            תוכניות ומחירים
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            התחל בחינם עם המלצה 1 ביום. שדרג לפרימיום לכל ההמלצות.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-[#10b981]/10 text-[#10b981] px-4 py-2 rounded-full text-sm font-medium">
            🎁 3 ימי פרימיום חינם למשתמשים חדשים!
          </div>
        </div>

        {/* Free tier highlight */}
        <div className="glass-card rounded-2xl p-6 mb-8 border border-gray-700 max-w-md mx-auto text-center">
          <h3 className="text-lg font-bold text-white mb-2">🆓 חינם — לצמיתות</h3>
          <p className="text-gray-400 text-sm mb-3">המלצה 1 ביום (הטובה ביותר) + צפייה במשחקי היום</p>
          <a
            href={BOT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2 rounded-xl font-bold text-sm transition-all"
          >
            התחל בחינם
          </a>
        </div>

        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm">👑 רוצה את כל ההמלצות? שדרג לפרימיום:</p>
        </div>

        <div className="grid sm:grid-cols-1 gap-6 max-w-md mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card rounded-2xl p-6 flex flex-col ${plan.style} relative`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f5a623] text-[#0a0e17] text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-lg font-bold text-white mb-1">
                {plan.emoji} {plan.name}
              </h3>
              <div className="mb-2">
                <span className="text-3xl font-extrabold text-white">
                  {plan.stars.toLocaleString()}
                </span>
                <span className="text-[#f5a623] text-lg mr-1"> ⭐</span>
              </div>
              <div className="text-xs text-gray-500 mb-6">
                {plan.period}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <span className="text-[#10b981] mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={BOT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                  plan.popular
                    ? "bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17]"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          תשלום מאובטח דרך Telegram Stars. ביטול בכל רגע בתוך הבוט.
        </p>
      </div>
    </section>
  );
}
