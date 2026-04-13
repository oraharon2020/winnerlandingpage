const steps = [
  {
    number: "01",
    title: "נרשמים בחינם",
    description: "הרשמה תוך 30 שניות. בלי כרטיס אשראי, בלי התחייבות. נרשמים ומתחילים לראות תוצאות.",
    icon: "✍️",
  },
  {
    number: "02",
    title: "המערכת סורקת הכל",
    description:
      "כל יום נסרקים מעל 30 ליגות: טופס, מאזן ישיר, פציעות, מקדמים וסטטיסטיקות — הכל אוטומטי.",
    icon: "🔍",
  },
  {
    number: "03",
    title: "רק הטיפים החזקים עוברים",
    description:
      "מתוך מאות משחקים, רק הטיפים שעוברים סינון רציני מגיעים אליך. בממוצע 3-5 טיפים ליום.",
    icon: "🎯",
  },
  {
    number: "04",
    title: "מקבלים ומרוויחים",
    description:
      "כל בוקר מחכה לך טיפ מוכן: המשחק, סוג ההימור, המקדם והסבר קצר. פשוט נכנסים לבית ושמים.",
    icon: "💰",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 bg-[#111827]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            איך זה עובד?
          </h2>
          <p className="text-gray-400">4 צעדים ואתה מתחיל לתפוס</p>
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
