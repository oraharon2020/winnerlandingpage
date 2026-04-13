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
      </head>
      <body className="antialiased">
        <GoogleAds />
        {children}
      </body>
    </html>
  );
}
