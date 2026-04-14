"use client";

import TipsShowcase from "./TipsShowcase";

const CHANNEL_LINK = "https://t.me/WinnerBotTips";

export default function Hero() {
  return (
    <section className="hero-gradient min-h-screen flex items-center pt-16">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Right side - Text content */}
          <div className="flex-1 text-center lg:text-right">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#f5a623]/10 border border-[#f5a623]/30 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
              <span className="text-[#f5a623] text-sm font-medium">
                סורק משחקים עכשיו — הטיפים מתעדכנים כל יום
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              תפסיק להפסיד.
              <br />
              <span className="text-[#f5a623]">תתחיל לתפוס.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 lg:mr-0 mb-10 leading-relaxed">
              <strong className="text-white">אנליסטים מנוסים + מערכת AI מתקדמת</strong> סורקים כל יום
              מעל 30 ליגות, מנתחים אלפי נתונים ומוציאים רק את
              <strong className="text-white"> הטיפים שבאמת שווים</strong> — 
              ישירות אליך, כל בוקר.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <a
                href="/checkout"
                className="pulse-cta bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17] font-bold px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 flex items-center gap-2"
              >
                🏆 התחל לנצח — חינם
              </a>
              <a
                href={CHANNEL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-8 py-4 rounded-xl text-lg transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                הערוץ שלנו בטלגרם
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-[#10b981]">✓</span> טיפ 1 ביום בחינם
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#10b981]">✓</span> 30+ ליגות מנותחות כל יום
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#10b981]">✓</span> ביטול בכל רגע
              </div>
            </div>
          </div>

          {/* Left side - Tips Showcase */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <TipsShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
