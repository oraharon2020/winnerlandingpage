"use client";

import { useEffect, useState } from "react";

interface PlanDisplay {
  id: string;
  nameHe: string;
  icon: string;
  price: number;
  originalPrice: number | null;
  periodHe: string;
  durationDays: number;
  features: string[];
  badge: string | null;
  isPopular: boolean;
  isFree: boolean;
  ctaText: string;
  ctaLink: string | null;
  description: string | null;
}

// Fallback plans if DB is not available
const FALLBACK_PLANS: PlanDisplay[] = [
  {
    id: "free", nameHe: "חינם", icon: "🆓", price: 0, originalPrice: null,
    periodHe: "לצמיתות", durationDays: 0,
    features: ["טיפ 1 ביום — הטוב ביותר", "צפייה במשחקי היום", "30+ ליגות"],
    badge: null, isPopular: false, isFree: true, ctaText: "התחל בחינם",
    ctaLink: "/checkout", description: null,
  },
  {
    id: "weekly", nameHe: "חבילת היכרות", icon: "🔥", price: 49, originalPrice: null,
    periodHe: "/ שבוע", durationDays: 7,
    features: ["כל הטיפים — ללא הגבלה", "דשבורד תוצאות מלא", "ניתוח מפורט לכל משחק", "30+ ליגות", "ביטול בכל רגע"],
    badge: null, isPopular: false, isFree: false, ctaText: "נסה שבוע",
    ctaLink: null, description: "7 ימים — בלי התחייבות",
  },
  {
    id: "monthly", nameHe: "חבילה חודשית", icon: "👑", price: 199, originalPrice: 399,
    periodHe: "/ חודש", durationDays: 30,
    features: ["כל הטיפים — ללא הגבלה", "דשבורד תוצאות מלא", "ניתוח מפורט לכל משחק", "30+ ליגות", "התראות ישירות כל בוקר", "ביטול בכל רגע"],
    badge: "50% הנחה — מבצע השקה", isPopular: true, isFree: false, ctaText: "התחל לנצח",
    ctaLink: null, description: null,
  },
];

export default function Pricing() {
  const [plans, setPlans] = useState<PlanDisplay[]>(FALLBACK_PLANS);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        if (data.plans && data.plans.length > 0) setPlans(data.plans);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="pricing" className="py-20 bg-[#111827]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            בחר את המסלול שלך
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            התחל בחינם עם טיפ 1 ביום. רוצה יותר הזדמנויות? שדרג בכל רגע.
          </p>
        </div>

        <div className={`grid gap-6 max-w-4xl mx-auto ${
          plans.length === 1 ? "sm:grid-cols-1 max-w-md" :
          plans.length === 2 ? "sm:grid-cols-2 max-w-2xl" :
          plans.length === 3 ? "sm:grid-cols-3" :
          "sm:grid-cols-2 lg:grid-cols-4"
        }`}>
          {plans.map((plan) => {
            const href = plan.ctaLink || `/checkout?plan=${plan.id}`;
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`glass-card rounded-2xl p-6 flex flex-col ${
                  isPopular ? "pricing-popular relative" : "border border-white/10"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f5a623] text-[#0a0e17] text-xs font-bold px-3 py-1 rounded-full">
                    הכי משתלם
                  </div>
                )}

                <h3 className="text-lg font-bold text-white mb-1">{plan.icon} {plan.nameHe}</h3>
                <div className="mb-1">
                  {plan.originalPrice && (
                    <span className="text-gray-500 line-through text-lg ml-2">₪{plan.originalPrice}</span>
                  )}
                  <span className="text-3xl font-extrabold text-white">₪{plan.price}</span>
                  {plan.periodHe && plan.periodHe !== "לצמיתות" && (
                    <span className="text-gray-400 text-sm mr-1">{plan.periodHe}</span>
                  )}
                </div>
                <div className="text-xs mb-6">
                  {plan.badge ? (
                    <span className="text-[#10b981]">{plan.badge}</span>
                  ) : plan.description ? (
                    <span className="text-gray-500">{plan.description}</span>
                  ) : plan.isFree ? (
                    <span className="text-gray-500">לצמיתות</span>
                  ) : null}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-[#10b981] mt-0.5">✓</span>{f}
                    </li>
                  ))}
                </ul>

                <a
                  href={href}
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                    isPopular
                      ? "bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17]"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {plan.ctaText}
                </a>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          תשלום מאובטח באשראי. ביטול בלחיצת כפתור, בלי דמי ביטול.
        </p>
      </div>
    </section>
  );
}
