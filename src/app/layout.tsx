import type { Metadata } from "next";
import GoogleAds from "@/components/GoogleAds";
import "./globals.css";

export const metadata: Metadata = {
  title: "הטיפ המנצח — טיפים לכדורגל שבאמת עובדים | 30+ ליגות כל יום",
  description:
    "שירות טיפים מקצועי לכדורגל. כל יום נסרקות 30+ ליגות ויוצאים רק הטיפים הכי חזקים. הצטרף בחינם וקבל טיפ 1 ביום.",
  keywords: [
    "טיפים כדורגל",
    "הימורים",
    "ניתוח ספורט",
    "המלצות כדורגל",
    "טיפר",
    "הטיפ המנצח",
    "ניחושים כדורגל",
    "פרמייר ליג",
  ],
  openGraph: {
    title: "הטיפ המנצח — טיפים לכדורגל שבאמת עובדים",
    description:
      "30+ ליגות נסרקות כל יום. רק הטיפים הכי חזקים מגיעים אליך. הצטרף בחינם!",
    type: "website",
    locale: "he_IL",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Meshulam/Grow Payment SDK */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var s = document.createElement('script');
                s.type = 'text/javascript';
                s.async = true;
                s.src = 'https://cdn.meshulam.co.il/sdk/gs.min.js';
                s.onload = function() {
                  if (window.growPayment) {
                    window.growPayment.init({
                      environment: "PRODUCTION",
                      version: 1,
                      events: {
                        onSuccess: function(response) {
                          window.dispatchEvent(new CustomEvent('meshulam-success', { detail: response }));
                        },
                        onFailure: function(response) {
                          window.dispatchEvent(new CustomEvent('meshulam-failure', { detail: response }));
                        },
                        onError: function(response) {
                          window.dispatchEvent(new CustomEvent('meshulam-error', { detail: response }));
                        },
                        onClose: function() {
                          window.dispatchEvent(new CustomEvent('meshulam-close'));
                        }
                      }
                    });
                    window.meshulam_sdk_ready = true;
                  }
                };
                var x = document.getElementsByTagName('script')[0];
                x.parentNode.insertBefore(s, x);
              })();
            `
          }}
        />
      </head>
      <body className="antialiased">
        <GoogleAds />
        {children}
      </body>
    </html>
  );
}
