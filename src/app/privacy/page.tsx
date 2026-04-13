import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | הטיפ המנצח",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] py-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">מדיניות פרטיות</h1>
        <p className="text-gray-500 text-sm mb-10">עדכון אחרון: אפריל 2026</p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white">1. כללי</h2>
            <p>
              אתר &quot;הטיפ המנצח&quot; (להלן: &quot;האתר&quot;) מכבד את פרטיותך ומחויב להגנה על המידע האישי שלך.
              מדיניות פרטיות זו מפרטת כיצד אנו אוספים, משתמשים, מאחסנים ומגנים על מידע אישי
              כאשר אתה משתמש בשירותים שלנו.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. מידע שאנו אוספים</h2>
            <p>אנו אוספים את סוגי המידע הבאים:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                <strong className="text-white">מידע הרשמה:</strong> כתובת אימייל, שם מלא, סיסמה מוצפנת.
              </li>
              <li>
                <strong className="text-white">מידע תשלום:</strong> עסקאות PayPal (מזהה עסקה, סכום, תאריך).
                איננו שומרים פרטי כרטיס אשראי — כל התשלומים מבוצעים דרך PayPal.
              </li>
              <li>
                <strong className="text-white">מידע שימוש:</strong> דפים שנצפו, זמני גישה, סוג דפדפן ומכשיר.
              </li>
              <li>
                <strong className="text-white">קובצי עוגיות (Cookies):</strong> לצורכי אימות, ניהול סשן, ושיפור חוויית משתמש.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. שימוש במידע</h2>
            <p>אנו משתמשים במידע שנאסף למטרות:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li>מתן השירותים המבוקשים, לרבות שליחת טיפים והמלצות.</li>
              <li>ניהול חשבון המשתמש והמנוי שלך.</li>
              <li>עיבוד תשלומים ומתן תמיכה.</li>
              <li>שיפור השירות והתאמתו לצרכיך.</li>
              <li>שליחת עדכונים ומידע שיווקי (בכפוף להסכמתך).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. שיתוף מידע עם צדדים שלישיים</h2>
            <p>
              איננו מוכרים, סוחרים או מעבירים את המידע האישי שלך לצדדים שלישיים, 
              למעט במקרים הבאים:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                <strong className="text-white">ספקי שירות:</strong> PayPal (עיבוד תשלומים), Supabase (אחסון נתונים ואימות), Vercel (אירוח).
              </li>
              <li>
                <strong className="text-white">דרישה חוקית:</strong> כאשר נדרש על פי חוק או צו בית משפט.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. אבטחת מידע</h2>
            <p>
              אנו נוקטים אמצעי אבטחה מתקדמים להגנה על המידע שלך, לרבות:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>הצפנת SSL/TLS לכל התקשורת.</li>
              <li>סיסמאות מאוחסנות בהצפנה חד-כיוונית (hashing).</li>
              <li>גישה מוגבלת למידע רק לעובדים מורשים.</li>
              <li>תשלומים מעובדים דרך PayPal — איננו שומרים פרטי כרטיס.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. עוגיות (Cookies)</h2>
            <p>
              האתר משתמש בעוגיות לניהול סשן התחברות, זכירת העדפות, וניתוח שימוש.
              באפשרותך לחסום עוגיות דרך הגדרות הדפדפן, אך חלק מהשירותים עלולים שלא לפעול כראוי.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. זכויותיך</h2>
            <p>
              בהתאם לחוק הגנת הפרטיות, יש לך זכות:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>לעיין במידע שנאסף עליך.</li>
              <li>לבקש תיקון או מחיקה של המידע.</li>
              <li>להתנגד לשימוש במידע לצרכי שיווק.</li>
              <li>לבקש העתק של המידע בפורמט דיגיטלי.</li>
            </ul>
            <p>
              לכל בקשה ניתן לפנות אלינו בכתובת: winnerbot.tips@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">8. שינויים למדיניות</h2>
            <p>
              אנו שומרים לעצמנו את הזכות לעדכן מדיניות זו מעת לעת. 
              שינויים מהותיים יפורסמו באתר ויישלח עדכון למשתמשים רשומים.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">9. יצירת קשר</h2>
            <p>
              לשאלות לגבי מדיניות הפרטיות, ניתן לפנות אלינו:
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
