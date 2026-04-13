"use client";

import { useEffect, useRef } from "react";

/*
  100% CSS-animated Telegram chat simulation.
  No timers, no intervals, no setTimeout — just CSS @keyframes.
  
  Timeline (25s loop):
  - 0-2s: empty chat
  - 2-4s: typing indicator
  - 4-22s: welcome message visible
  - 8-22s: user message visible
  - 10-13s: typing indicator
  - 13-22s: recommendation visible
  - 22-25s: fade out, reset
*/

const LOOP = 25;
const p = (s: number) => +((s / LOOP) * 100).toFixed(1);

// Generate @keyframes for a chat element visible from `start` to `end` seconds
function kf(name: string, start: number, end: number, maxH = "700px") {
  const s = p(start), e = p(end);
  const before = Math.max(s - 1, 0);
  const fadeIn = Math.min(s + 1.5, 100);
  const fadeOut = Math.min(e + 1, 100);
  const collapse = Math.min(e + 2, 100);
  return `@keyframes ${name}{`
    + `0%,${before}%{opacity:0;max-height:0;margin-bottom:0;padding-top:0;padding-bottom:0;overflow:hidden}`
    + `${s}%{opacity:0;max-height:${maxH};margin-bottom:8px;overflow:visible}`
    + `${fadeIn}%{opacity:1;max-height:${maxH};margin-bottom:8px}`
    + `${e}%{opacity:1;max-height:${maxH};margin-bottom:8px}`
    + `${fadeOut}%{opacity:0;max-height:${maxH};margin-bottom:8px}`
    + `${collapse}%{opacity:0;max-height:0;margin-bottom:0;overflow:hidden}`
    + `100%{opacity:0;max-height:0;margin-bottom:0;overflow:hidden}`
    + `}`;
}

// Header status: "מקליד..." during typing periods
function headerKf() {
  // Typing visible during: 2-4s, 10-13s
  const tp = [[2,4],[10,13]].map(([a,b]) => [p(a),p(b)]);
  let t = `@keyframes hdrT{0%{opacity:0}`;
  let b = `@keyframes hdrB{0%{opacity:1}`;
  for (const [a, z] of tp) {
    t += `${a-1}%{opacity:0}${a}%{opacity:1}${z}%{opacity:1}${z+1}%{opacity:0}`;
    b += `${a-1}%{opacity:1}${a}%{opacity:0}${z}%{opacity:0}${z+1}%{opacity:1}`;
  }
  t += `100%{opacity:0}}`;
  b += `100%{opacity:1}}`;
  return t + b;
}

const CSS = [
  kf("t0", 2, 4, "50px"),     // typing 1
  kf("m0", 4, 22),             // welcome
  kf("b0", 4, 22),             // welcome buttons
  kf("m1", 8, 22),             // user click
  kf("t1", 10, 13, "50px"),   // typing 2
  kf("m2", 13, 22),            // recommendation
  kf("b2", 13, 22),            // recommendation buttons
  headerKf(),
].join("");

const anim = (name: string): React.CSSProperties => ({
  animation: `${name} ${LOOP}s infinite`,
  opacity: 0,
  maxHeight: 0,
  marginBottom: 0,
  overflow: "hidden",
});

// Typing indicator dots component
function Dots() {
  return (
    <div className="flex items-start gap-2">
      <img src="/bot-logo.png" alt="" width={28} height={28} className="rounded-full mt-0.5 flex-shrink-0" style={{ background: "#f5a623" }} />
      <div className="bg-[#1c2b3a] rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}

function BotMsg({ html, animName, btnAnimName, buttons }: { html: string; animName: string; btnAnimName: string; buttons?: string[] }) {
  return (
    <>
      <div style={anim(animName)} className="flex justify-start">
        <div className="flex items-start gap-2 w-full">
          <img src="/bot-logo.png" alt="" width={28} height={28} className="rounded-full mt-0.5 flex-shrink-0" style={{ background: "#f5a623" }} />
          <div
            className="bg-[#1c2b3a] rounded-2xl rounded-tl-md px-3 py-2.5 text-[11.5px] leading-[1.6] text-white [&_b]:font-semibold [&_i]:text-gray-400 flex-1 min-w-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
      {buttons && (
        <div style={anim(btnAnimName)} className="flex flex-col gap-1 mr-10">
          {buttons.map((b) => (
            <div key={b} className="border border-[#4ea4d9]/30 rounded-lg px-3 py-1.5 text-[11px] text-[#6ab7e2] text-center">{b}</div>
          ))}
        </div>
      )}
    </>
  );
}

function UserMsg({ text, animName }: { text: string; animName: string }) {
  return (
    <div style={anim(animName)} className="flex justify-end">
      <div className="bg-[#2b5278] rounded-2xl rounded-tr-md px-3 py-2.5 text-[11.5px] leading-[1.6] text-white">{text}</div>
    </div>
  );
}

export default function BotSimulation() {
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll: watch for content size changes
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    let lastH = 0;
    let raf: number;
    const check = () => {
      const h = el.scrollHeight;
      if (h !== lastH) {
        lastH = h;
        el.scrollTop = h;
      }
      raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-[360px] max-w-full mx-auto lg:mx-0">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/40 bg-[#0e1621]">
        {/* Telegram Header */}
        <div className="bg-[#17212b] px-4 py-2.5 flex items-center gap-3 border-b border-white/5">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <img src="/bot-logo.png" alt="W" width={36} height={36} className="rounded-full" style={{ background: "#f5a623" }} />
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium text-[13px]">הטיפ המנצח 🏆</div>
            <div className="text-[11px] h-4 relative">
              <span style={{ animation: `hdrB ${LOOP}s infinite`, position: "absolute" }} className="text-gray-500">בוט</span>
              <span style={{ animation: `hdrT ${LOOP}s infinite`, opacity: 0, position: "absolute" }} className="text-[#4ea4d9]">מקליד...</span>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>

        {/* Chat Area — all messages rendered, visibility driven by CSS */}
        <div ref={chatRef} className="px-3 py-3 h-[420px] overflow-y-auto">
          {/* Typing 1 */}
          <div style={anim("t0")}><Dots /></div>

          {/* Welcome message */}
          <BotMsg
            animName="m0"
            btnAnimName="b0"
            html="� <b>ברוך הבא לטיפ המנצח!</b><br><br>⚽ טיפים מקצועיים לכדורגל כל יום<br>🆓 טיפ 1 ביום — בחינם<br>👑 שדרג לכל הטיפים<br><br>⚠️ <i>18+ | הימור אחראי בלבד</i>"
            buttons={["🎯 הטיפים של היום", "👑 שדרג לפרימיום"]}
          />

          {/* User: המלצות */}
          <UserMsg animName="m1" text="🎯 הטיפים של היום" />

          {/* Typing 2 */}
          <div style={anim("t1")}><Dots /></div>

          {/* Recommendation */}
          <BotMsg
            animName="m2"
            btnAnimName="b2"
            html={[
              "━━━━━━━━━━━━━━━━━━",
              "🏆 <b>🏴󠁧󠁢󠁥󠁮󠁧󠁿 פרמייר ליג</b>",
              "📅 21/03 17:00",
              "━━━━━━━━━━━━━━━━━━",
              "",
              "🏠 <b>ליברפול</b> 🆚 ✈️ <b>מנצ'סטר יונייטד</b>",
              "",
              "━━━━━━━━━━━━━━━━━━",
              "🏠 <b>המלצה: ניצחון בית</b>",
              "💰 מקדם: <b>1.65</b>",
              "📊 סיכוי: <b>68%</b>",
              "🟢 סיכון: נמוך",
              "",
              "🧠 <b>ניתוח AI:</b>",
              "• ליברפול ניצחה 4 מ-5 אחרונים בבית",
              "• מאזן ישיר: 3 ניצחונות מ-4",
              "• יונייטד ללא ניצחון חוץ 3 משחקים",
              "━━━━━━━━━━━━━━━━━━",
              "<i>⚠️ 18+ | הימר בתבונה</i>",
            ].join("<br>")}
            buttons={["⭐ שדרג לפרימיום", "🏠 תפריט ראשי"]}
          />
        </div>

        {/* Input Bar */}
        <div className="bg-[#17212b] px-3 py-2 flex items-center gap-2 border-t border-white/5">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 bg-[#242f3d] rounded-full px-3.5 py-1.5 text-[12px] text-gray-600">הודעה...</div>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
