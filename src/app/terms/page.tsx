import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תנאי שימוש | הטיפ המנצח",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] py-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">תנאי שימוש</h1>
        <p className="text-gray-500 text-sm mb-10">עדכון אחרון: אפריל 2026</p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white">1. הגדרות</h2>
            <p>
              &quot;הטיפ המנצח&quot; (להלן: &quot;השירות&quot;) הוא שירות מנוי המספק המלצות והערכות לגבי 
              משחקי כדורגל, הכולל ניתוח סטטיסטי של משחקים וליגות שונות.
              &quot;המשתמש&quot; — כל אדם הנרשם ו/או משתמש בשירות.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. תנאי הרשמה ושימוש</h2>
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 mb-3">
              <p className="text-yellow-300 font-semibold text-sm">
                ⚠️ השירות מיועד לבני 18 ומעלה בלבד. בהרשמה לשירות, המשתמש מצהיר ומאשר כי הוא בן 18 לפחות.
                משתמש שגילו מתחת ל-18 אינו רשאי להירשם או לבצע רכישה באתר.
              </p>
            </div>
            <ul className="list-disc pr-6 space-y-2">
              <li>המשתמש מצהיר כי הוא כשיר משפטית לבצע עסקאות ולהתחייב לתנאים אלו.</li>
              <li>המשתמש אחראי לשמור על סודיות פרטי ההתחברות שלו.</li>
              <li>אסור להעביר, לשתף או למכור את פרטי הגישה לאדם אחר.</li>
              <li>אסור להעתיק, לשכפל או להפיץ את תכני השירות ללא אישור בכתב.</li>
              <li>המשתמש מתחייב למסור פרטים אישיים מדויקים ונכונים בעת ההרשמה.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. מנויים ותשלומים</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                השירות מציע מספר מסלולי מנוי: חינם, שבועי, וחודשי.
              </li>
              <li>
                התשלום מבוצע באופן מאובטח באמצעות חברת הסליקה Grow (משולם בע&quot;מ), המוסמכת לתקן PCI DSS.
                מחירי המנויים מוצגים בשקלים חדשים (₪). אנו תומכים בכרטיסי אשראי (Visa, Mastercard, Amex), ביט ועוד.
              </li>
              <li>
                <strong className="text-white">פרטי כרטיס האשראי אינם נשמרים אצלנו כלל</strong> — הם מעובדים ומאוחסנים אך ורק במערכות הסליקה המאובטחות של Grow.
              </li>
              <li>
                <strong className="text-white">מנוי חודשי — הוראת קבע:</strong> המנוי החודשי פועל כהוראת קבע (חיוב חודשי אוטומטי).
                בהרשמה למנוי חודשי, המשתמש מאשר חיוב חודשי חוזר של כרטיס האשראי שלו, עד לביטול ההוראה.
                סכום החיוב החודשי מוצג בבירור לפני אישור התשלום.
              </li>
              <li>
                מנוי שבועי פעיל לתקופה שנרכשה בלבד (ללא חיוב אוטומטי חוזר). בתום התקופה, המנוי עובר לחבילה חינמית.
              </li>
              <li>
                ניתן לבטל מנוי (כולל הוראת קבע) בכל עת דרך הדשבורד, דרך פנייה באימייל, או בכל דרך חוקית.
                ביטול הוראת קבע ייכנס לתוקף מיידי — לא יתבצעו חיובים נוספים לאחר הביטול.
              </li>
              <li>
                מחירי השירות עשויים להשתנות. שינוי מחיר לא ישפיע על מנויים פעילים או הוראות קבע קיימות.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. מדיניות ביטולים והחזרים</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                ביטול מנוי אפשרי בכל עת דרך הדשבורד האישי, או בפנייה לכתובת winnerbot.tips@gmail.com.
              </li>
              <li>
                <strong className="text-white">ביטול הוראת קבע:</strong> ניתן לבטל הוראת קבע בכל רגע דרך הדשבורד.
                לאחר הביטול — לא יתבצעו חיובים נוספים. הגישה תישמר עד תום תקופת החיוב האחרון.
              </li>
              <li>
                לאחר ביטול מנוי רגיל (לא הוראת קבע), תישמר הגישה עד תום התקופה ששולמה.
              </li>
              <li>
                החזר כספי מלא יינתן רק תוך 24 שעות מרגע הרכישה הראשונה, ובתנאי שהמשתמש לא צרך את השירות.
              </li>
              <li>
                בהתאם לחוק הגנת הצרכן, ביטול עסקה שבוצעה מרחוק אפשרי תוך 14 ימים מיום ביצוע העסקה,
                בכפוף לניכוי דמי ביטול כחוק (עד 5% מסכום העסקה או 100 ש&quot;ח, הנמוך מביניהם).
              </li>
              <li>
                לביטול ניתן לפנות: באימייל winnerbot.tips@gmail.com, דרך הדשבורד באתר, או בכל אמצעי תקשורת אחר.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. הגבלת אחריות והימורים אחראיים — חשוב!</h2>
            <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4">
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-white">השירות מספק הערכות וניתוחים סטטיסטיים בלבד — ואינו מהווה ייעוץ פיננסי, ייעוץ השקעות, או המלצה להמר.</strong>
                </li>
                <li>
                  ההמלצות אינן מבטיחות רווח. הימורים כרוכים בסיכון להפסד כספי משמעותי.
                </li>
                <li>
                  המשתמש אחראי באופן מלא ובלעדי להחלטותיו ולפעולותיו על בסיס המידע המסופק.
                </li>
                <li>
                  השירות לא יישא באחריות לכל הפסד כספי שנגרם כתוצאה משימוש בהמלצות.
                </li>
                <li>
                  <strong className="text-white">הימורים מותרים רק באמצעות גופים מורשים בישראל.</strong> הימור באתרים לא חוקיים הוא באחריות המשתמש בלבד.
                </li>
                <li>
                  המשתמש מתחייב להמר באחריות ובגבולות יכולתו הכלכלית. אם אתה חש שאתה מפתח בעיית הימורים,
                  פנה לקו הסיוע הארצי: 1-800-363-363.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. קניין רוחני</h2>
            <p>
              כל התכנים באתר — לרבות טקסטים, עיצובים, לוגו, ניתוחים, אלגוריתמים וקוד — 
              הם קניינו הבלעדי של &quot;הטיפ המנצח&quot; ומוגנים בזכויות יוצרים.
              אין להעתיק, לשכפל, לפרסם או להפיץ כל חלק מהתכנים ללא אישור בכתב.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. השעיה וביטול חשבון</h2>
            <p>אנו שומרים לעצמנו את הזכות להשעות או לבטל חשבון משתמש במקרים הבאים:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li>הפרת תנאי שימוש אלה.</li>
              <li>שיתוף פרטי מנוי עם אחרים.</li>
              <li>הפצת תכני השירות ללא אישור.</li>
              <li>שימוש לרעה בשירות.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">8. שינויים בתנאי השימוש</h2>
            <p>
              אנו שומרים לעצמנו את הזכות לעדכן תנאים אלו מעת לעת. 
              המשך השימוש בשירות לאחר עדכון מהווה הסכמה לתנאים המעודכנים.
              שינויים מהותיים יפורסמו באתר.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">9. דין חל וסמכות שיפוט</h2>
            <p>
              תנאי שימוש אלו כפופים לחוקי מדינת ישראל בלבד.
              סמכות השיפוט הבלעדית בכל מחלוקת תהיה נתונה לבתי המשפט המוסמכים בישראל.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">10. יצירת קשר</h2>
            <p>
              לשאלות לגבי תנאי השימוש, ניתן לפנות אלינו:
            </p>
            <ul className="list-disc pr-6 space-y-1">
              <li>אימייל: winnerbot.tips@gmail.com</li>
              <li>טלגרם: @WinnerBotTips</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition">
            ← חזרה לעמוד הראשי
          </a>
        </div>
      </div>
    </div>
  );
}
