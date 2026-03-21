const faqs = [
  {
    q: "מה זה בדיוק WinnerBot?",
    a: "WinnerBot הוא בוט טלגרם שמנתח משחקי כדורגל באמצעות AI. הוא סורק 30+ ליגות כל יום, משתמש בנתונים מ-API-Football וניתוח Claude AI, ושולח לך רק את ההמלצות שעברו את כל הבדיקות.",
  },
  {
    q: "מה אני מקבל בחינם?",
    a: "המלצה 1 ביום — הטובה ביותר! בנוסף, משתמשים חדשים מקבלים 3 ימי פרימיום חינם עם כל ההמלצות וה-Push האוטומטי.",
  },
  {
    q: "מה פרימיום נותן?",
    a: "כל ההמלצות ללא הגבלה, Push אוטומטי כל בוקר, וניתוח AI מפורט לכל משחק.",
  },
  {
    q: "כמה זה עולה?",
    a: "יש 3 חבילות: שבועי 750 ⭐ (7 ימים), חודשי 2,000 ⭐ (30 ימים), ו-3 חודשים 4,000 ⭐ (90 ימים) — הכי משתלם. תשלום דרך Telegram Stars בתוך הבוט.",
  },
  {
    q: "איך אני מצטרף?",
    a: 'לוחצים על "התחל בחינם", נכנסים לבוט בטלגרם, לוחצים Start — וזהו. בלי הרשמות, בלי אימיילים.',
  },
  {
    q: "אפשר לבטל בכל רגע?",
    a: "כמובן. ביטול בלחיצת כפתור בתוך הבוט. בלי התחייבויות, בלי דמי ביטול.",
  },
  {
    q: "מה זה Telegram Stars?",
    a: "Telegram Stars זו מערכת תשלום מובנית בטלגרם. קונים Stars ישירות באפליקציה עם Apple Pay, Google Pay או כרטיס אשראי, והתשלום מתבצע אוטומטית בתוך הבוט.",
  },
  {
    q: "על אילו ליגות הבוט עובד?",
    a: "פרמייר ליג, לה ליגה, סרייה A, בונדסליגה, ליג 1, ארדיוויזי, ליגת העל, צ׳מפיונס ליג, יורופה ליג, קונפרנס ליג, MLS, ברזיל, ארגנטינה, טורקיה, בלגיה, סקוטלנד, פולין, יוון, אוסטריה ועוד תחרויות גביעות ומוקדמות.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-[#0a0e17]">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            שאלות נפוצות
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-xl border border-white/[0.08] bg-[#111827]/70">
              <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between text-white hover:text-[#f5a623] transition-colors">
                <span className="font-medium text-sm sm:text-base">{faq.q}</span>
                <span className="flex-shrink-0 mr-4 text-[#f5a623] text-xl transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
