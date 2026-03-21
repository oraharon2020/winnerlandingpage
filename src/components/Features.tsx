const features = [
  {
    icon: "🧠",
    title: "ניתוח AI מתקדם",
    description:
      "המערכת משתמשת בנתונים מ-API-Football וניתוח Claude AI. כל המלצה עוברת בדיקות שפיות וחישובי Value לפני שהיא יוצאת.",
  },
  {
    icon: "📊",
    title: "ניתוח מעמיק של כל משחק",
    description:
      "טופס 5 משחקים אחרונים, מאזן ישיר, סטטיסטיקות בית/חוץ, פציעות והרחקות, מיקום בטבלה ומקדמים אמיתיים.",
  },
  {
    icon: "⚡",
    title: "Push אוטומטי כל בוקר",
    description:
      "מנויי פרימיום מקבלים את כל ההמלצות ישירות לטלגרם כל בוקר. לא צריך לזכור לבדוק — ההמלצות מגיעות אליך.",
  },
  {
    icon: "🎯",
    title: "בדיקות שפיות אוטומטיות",
    description:
      "כל המלצה עוברת Sanity Check: חסימת סוגי הימורים עם אחוזי הצלחה נמוכים, בדיקת PPG, מקדמים חשודים ועוד.",
  },
  {
    icon: "📈",
    title: "מעקב שקוף אחרי תוצאות",
    description:
      "כל המלצה נרשמת ונבדקת אוטומטית. אפשר לראות את אחוזי ההצלחה וההיסטוריה אמיתיים בכל רגע.",
  },
  {
    icon: "🌍",
    title: "30+ ליגות מכל העולם",
    description:
      "פרמייר ליג, לה ליגה, סרייה A, בונדסליגה, ליגת העל, צ׳מפיונס ליג, ברזיל, ארגנטינה ועוד.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-[#0a0e17]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            למה <span className="text-[#f5a623]">WinnerBot</span> שונה?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            לא עוד &quot;טיפר&quot; רנדומלי. זו מערכת AI אמיתית שמנתחת אלפי
            נתונים לפני כל המלצה.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
