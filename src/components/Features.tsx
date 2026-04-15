const features = [
  {
    icon: "🎯",
    title: "טיפים שנבדקו לעומק",
    description:
      "כל טיפ עובר ניתוח מעמיק: טופס, מאזן ישיר, פציעות, סטטיסטיקות בית/חוץ ובדיקת מקדמים. רק מה שעומד בכל הקריטריונים מגיע אליך.",
  },
  {
    icon: "📲",
    title: "ההמלצות מגיעות אליך",
    description:
      "לא צריך לחפש — כל בוקר תקבל את הטיפים ישירות. המלצה ברורה: איזה משחק, איזה סוג, ואיזה מקדם.",
  },
  {
    icon: "🔥",
    title: "רק סינגלים חזקים",
    description:
      "אנחנו לא מציפים אותך עם 20 המלצות ביום. בממוצע 3-5 טיפים ממוקדים — רק מה שבאמת שווה.",
  },
  {
    icon: "📊",
    title: "תוצאות שקופות",
    description:
      "דשבורד עם כל ההמלצות שנשלחו ותוצאותיהן. תפיסה או החמצה — הכל גלוי. אתה תמיד יודע מה המצב.",
  },
  {
    icon: "🌍",
    title: "30+ ליגות מכל העולם",
    description:
      "פרמייר ליג, לה ליגה, בונדסליגה, ליג 1, ליגת העל, צ׳מפיונס ליג, ברזיל, ארגנטינה ועוד.",
  },
  {
    icon: "💰",
    title: "מקדמים שמשתלמים",
    description:
      "כל המלצה מגיעה עם מקדם אמיתי שנבדק. אנחנו עובדים על מקדמים שנותנים Value — לא סתם ניחושים.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-[#0a0e17]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            למה <span className="text-[#f5a623]">הטיפ המנצח</span> שונה?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            שילוב של אנליסטים מנוסים ומערכת AI מתקדמת. כל טיפ עובר סינון רציני לפני שהוא מגיע אליך.
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
