const leagues = [
  { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "פרמייר ליג" },
  { flag: "🇪🇸", name: "לה ליגה" },
  { flag: "🇮🇹", name: "סרייה A" },
  { flag: "🇩🇪", name: "בונדסליגה" },
  { flag: "🇫🇷", name: "ליג 1" },
  { flag: "🇳🇱", name: "ארדיוויזי" },
  { flag: "🇵🇹", name: "ליגה פורטוגלית" },
  { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "צ׳מפיונשיפ" },
  { flag: "🇦🇹", name: "ליגה אוסטרית" },
  { flag: "🇹🇷", name: "סופר ליג טורקי" },
  { flag: "🇧🇪", name: "ליגה בלגית" },
  { flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", name: "ליגה סקוטית" },
  { flag: "🇵🇱", name: "ליגה פולנית" },
  { flag: "🇬🇷", name: "סופר ליג יווני" },
  { flag: "🇮🇱", name: "ליגת העל" },
  { flag: "🇧🇷", name: "ברזיל סרייה A" },
  { flag: "🇦🇷", name: "ליגה ארגנטינאית" },
  { flag: "🇺🇸", name: "MLS" },
  { flag: "🏆", name: "צ׳מפיונס ליג" },
  { flag: "🏆", name: "יורופה ליג" },
  { flag: "🏆", name: "קונפרנס ליג" },
  { flag: "🌍", name: "מוקדמות מונדיאל" },
  { flag: "🇪🇺", name: "יורו" },
];

export default function Leagues() {
  return (
    <section className="py-20 bg-[#0a0e17]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            <span className="text-[#f5a623]">30+</span> ליגות מכל העולם
          </h2>
          <p className="text-gray-400">
            מפרמייר ליג ועד ליגת העל — הבוט מכסה הכל
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {leagues.map((league) => (
            <div
              key={league.name}
              className="glass-card rounded-full px-4 py-2 flex items-center gap-2 text-sm"
            >
              <span>{league.flag}</span>
              <span className="text-gray-300">{league.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
