const faqs = [
  {
    q: "מה זה הטיפ המנצח?",
    a: "הטיפ המנצח הוא שירות המלצות כדורגל מקצועי. כל יום אנחנו סורקים מעל 30 ליגות, מנתחים מאות משחקים ושולחים לך רק את הטיפים הכי חזקים עם המקדמים שמשתלמים.",
  },
  {
    q: "מה אני מקבל בחינם?",
    a: "טיפ 1 ביום — הטוב ביותר מבין כל מה שנמצא. תוכל לראות מה ההמלצה, המקדם והסבר קצר.",
  },
  {
    q: "מה ההבדל בין חינם לפרימיום?",
    a: "בחינם מקבלים טיפ אחד ביום. בפרימיום מקבלים את כל הטיפים (בממוצע 3-5 ביום), ניתוח מפורט לכל משחק, דשבורד תוצאות מלא והתראות ישירות כל בוקר.",
  },
  {
    q: "כמה זה עולה?",
    a: "חבילת היכרות: ₪49 לשבוע. חבילה חודשית: ₪199 (במקום ₪399 — מבצע השקה). ביטול בכל רגע, בלי התחייבות.",
  },
  {
    q: "מה זה 2.5+ / 2.5- שערים?",
    a: "2.5+ (מעל 2.5) אומר שאתה מהמר שיהיו 3 שערים ומעלה במשחק (למשל 2-1, 3-0). 2.5- (מתחת 2.5) אומר שיהיו 2 שערים או פחות (למשל 1-0, 1-1, 0-0).",
  },
  {
    q: "מה זה 1+ / 1- ?",
    a: "1+ אומר שההימור הוא שהקבוצה תנצח או תהיה תיקו (אם הפסידה — הפסדת). 1- אומר שהקבוצה צריכה לנצח ביותר מגול אחד (למשל 2-0, 3-1).",
  },
  {
    q: "על אילו ליגות אתם עובדים?",
    a: "פרמייר ליג, לה ליגה, בונדסליגה, ליג 1, ארדיוויזי, ליגת העל, צ׳מפיונס ליג, יורופה ליג, קונפרנס ליג, MLS, ברזיל, ארגנטינה, טורקיה, בלגיה, סקוטלנד ועוד.",
  },
  {
    q: "אפשר לבטל בכל רגע?",
    a: "כן. ביטול בלחיצת כפתור. בלי התחייבויות, בלי דמי ביטול, בלי שאלות.",
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
