import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | WinnerBot",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
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
      <body className="antialiased bg-gray-950 text-white">{children}</body>
    </html>
  );
}
