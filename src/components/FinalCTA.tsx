const CHANNEL_LINK = "https://t.me/WinnerBotTips";

export default function FinalCTA() {
  return (
    <section className="py-20 bg-[#111827] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f5a623]/5 to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <div className="text-5xl mb-6">🏆</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          מוכן לתפוס?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
          הצטרף לאלפי מנצחים שכבר מקבלים טיפים כל בוקר. 
          אל תפספס את ההזדמנות — טיפ 1 ביום בחינם, בלי התחייבות.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/checkout"
            className="pulse-cta inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17] font-bold px-10 py-4 rounded-xl text-lg transition-all transform hover:scale-105"
          >
            🏆 התחל לנצח — חינם
          </a>
          <a
            href={CHANNEL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-8 py-4 rounded-xl text-lg transition-all"
          >
            הערוץ שלנו בטלגרם
          </a>
        </div>
      </div>
    </section>
  );
}
