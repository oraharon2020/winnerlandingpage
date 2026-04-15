export default function Footer() {
  return (
    <footer className="bg-[#0a0e17] border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="text-lg font-bold text-white">
              הטיפ <span className="text-[#f5a623]">המנצח</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://t.me/WinnerBotTips"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#f5a623] text-sm transition-colors"
            >
              📢 ערוץ טיפים
            </a>
            <a
              href="/privacy"
              className="text-gray-400 hover:text-[#f5a623] text-sm transition-colors"
            >
              מדיניות פרטיות
            </a>
            <a
              href="/terms"
              className="text-gray-400 hover:text-[#f5a623] text-sm transition-colors"
            >
              תנאי שימוש
            </a>
          </div>

          <div className="text-gray-500 text-sm text-center">
            האתר מספק ניתוח סטטיסטי והמלצות ספורט מקצועיות בלבד.
            <br />
            אנחנו לא בית הימורים — השירות מיועד למבוגרים (18+) בלבד.
          </div>

          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} הטיפ המנצח
          </div>
        </div>
      </div>
    </footer>
  );
}
