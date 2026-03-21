import type { Metadata } from "next";
import GoogleAds from "@/components/GoogleAds";
import "./globals.css";

export const metadata: Metadata = {
  title: "Winner Bot - ניתוח הימורי ספורט חכם עם AI | 70% דיוק",
  description:
    "בוט טלגרם חכם לניתוח הימורי כדורגל עם בינה מלאכותית. 3 מומחי AI מנתחים כל משחק, 30+ ליגות, דיוק של 70%. הצטרף עכשיו - 3 ימי ניסיון חינם!",
  keywords: [
    "הימורים",
    "כדורגל",
    "ניתוח ספורט",
    "AI",
    "בוט טלגרם",
    "טיפים",
    "ניחושים כדורגל",
    "winner bot",
  ],
  openGraph: {
    title: "Winner Bot - ניתוח הימורי ספורט חכם עם AI",
    description:
      "3 מומחי AI מנתחים כל משחק. דיוק של 70%. הצטרף עכשיו עם 3 ימי ניסיון חינם!",
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
      </head>
      <body className="antialiased">
        <GoogleAds />
        {children}
      </body>
    </html>
  );
}
