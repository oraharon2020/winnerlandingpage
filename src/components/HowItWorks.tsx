const steps = [
  {
    number: "01",
    title: "נכנסים לבוט בטלגרם",
    description: "לחיצה אחת ואתה בפנים. לוחצים Start ומתחילים. משתמשים חדשים מקבלים 3 ימי פרימיום חינם!",
    icon: "📱",
  },
  {
    number: "02",
    title: "הבוט סורק 30+ ליגות",
    description:
      "כל יום הבוט סורק את כל המשחקים, שולף נתונים מ-API-Football: טופס, מאזן ישיר, פציעות, מקדמים וסטטיסטיקות בית/חוץ.",
    icon: "🔍",
  },
  {
    number: "03",
    title: "AI מנתח ומסנן",
    description:
      "Claude AI מנתח כל משחק. בדיקות שפיות אוטומטיות מסננות המלצות עם סיכוי נמוך. רק מה שעובר את כל הפילטרים יוצא.",
    icon: "🧠",
  },
  {
    number: "04",
    title: "מקבלים את ההמלצה",
    description:
      "תקבל הודעה עם סוג ההימור, המקדם, רמת הביטחון והסבר מפורט מה-AI. פרימיום מקבלים Push אוטומטי כל בוקר.",
    icon: "🎯",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-[#111827]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            איך זה עובד?
          </h2>
          <p className="text-gray-400">ב-4 צעדים פשוטים אתה מתחיל להרוויח</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-4 glass-card rounded-2xl p-6"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-[#f5a623]/10 flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
              </div>
              <div>
                <div className="text-[#f5a623] text-sm font-bold mb-1">
                  שלב {step.number}
                </div>
                <h3 className="text-white font-bold text-lg mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
