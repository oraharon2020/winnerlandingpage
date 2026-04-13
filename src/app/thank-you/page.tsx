import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תודה! | הטיפ המנצח",
  robots: "noindex, nofollow",
};

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          מעולה! אתה כבר בדרך
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          ההרשמה הושלמה! עכשיו נשאר רק להצטרף לערוץ הטיפים שלנו
          ולהתחיל לקבל <strong className="text-white">הזדמנויות כל בוקר</strong>.
        </p>
        <div className="space-y-4">
          <a
            href="https://t.me/WinnerBotTips"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17] font-bold px-8 py-4 rounded-xl text-lg transition-all"
          >
            📢 הצטרף לערוץ הטיפים →
          </a>
          <div>
            <a
              href="/"
              className="text-gray-500 hover:text-gray-300 text-sm transition"
            >
              ← חזרה לעמוד הראשי
            </a>
          </div>
        </div>
      </div>

      {/* Google Ads conversion tracking pixel fires on this page */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof gtag === 'function') {
              var adsId = '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ""}';
              var label = '${process.env.NEXT_PUBLIC_GOOGLE_CONVERSION_LABEL || ""}';
              if (adsId && label) {
                gtag('event', 'conversion', { send_to: adsId + '/' + label });
              }
            }
          `,
        }}
      />
    </div>
  );
}
