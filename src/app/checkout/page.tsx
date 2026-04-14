"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalCardFieldsProvider,
  PayPalCardFieldsForm,
  usePayPalCardFields,
} from "@paypal/react-paypal-js";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PlanOption {
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
}

const FALLBACK_PLANS: PlanOption[] = [
  { id: "weekly", nameHe: "חבילת היכרות", icon: "🔥", price: 49, originalPrice: null, periodHe: "/ שבוע", durationDays: 7, features: ["כל הטיפים — ללא הגבלה", "דשבורד תוצאות מלא", "ניתוח מפורט", "30+ ליגות", "ביטול בכל רגע"], badge: null, isPopular: false },
  { id: "monthly", nameHe: "חבילה חודשית", icon: "👑", price: 199, originalPrice: 399, periodHe: "/ חודש", durationDays: 30, features: ["כל הטיפים — ללא הגבלה", "דשבורד תוצאות מלא", "ניתוח מפורט", "30+ ליגות", "התראות ישירות כל בוקר", "ביטול בכל רגע"], badge: "50% הנחה — מבצע השקה", isPopular: true },
];

interface CouponState {
  valid: boolean;
  code: string;
  discountAmount: number;
  finalPrice: number;
  couponId: number;
}

// Card submit button (must be inside PayPalCardFieldsProvider)
function CardSubmitButton({ disabled, label }: { disabled: boolean; label: string }) {
  const { cardFieldsForm } = usePayPalCardFields();

  const handleClick = async () => {
    if (!cardFieldsForm) return;
    const formState = await cardFieldsForm.getState();
    if (!formState.isFormValid) return;
    cardFieldsForm.submit();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-full bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17] font-bold py-4 rounded-xl text-lg transition-all disabled:opacity-50 cursor-pointer"
    >
      {label}
    </button>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [plans, setPlans] = useState<PlanOption[]>(FALLBACK_PLANS);
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "monthly");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authReady, setAuthReady] = useState(false); // true when user is logged in or just signed up
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponState | null>(null);
  const [couponError, setCouponError] = useState("");

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        setAuthReady(true);
        setEmail(user.email || "");
      } else {
        setIsLoggedIn(false);
        setAuthReady(false);
      }
    });
  }, [supabase.auth]);

  // Fetch plans from DB
  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        if (data.plans && data.plans.length > 0) {
          const paidPlans = data.plans.filter((p: PlanOption & { isFree?: boolean }) => !p.isFree && p.price > 0);
          if (paidPlans.length > 0) setPlans(paidPlans);
        }
      })
      .catch(() => {});
  }, []);

  // Reset coupon when plan changes
  useEffect(() => {
    setAppliedCoupon(null);
    setCouponError("");
  }, [selectedPlan]);

  const plan = plans.find((p) => p.id === selectedPlan) || plans[0];
  const finalPrice = appliedCoupon ? appliedCoupon.finalPrice : plan.price;

  // Inline signup
  const handleSignup = useCallback(async (): Promise<boolean> => {
    if (authReady) return true; // Already logged in

    setAuthError("");
    if (!email || !password) {
      setAuthError("נא למלא אימייל וסיסמה");
      return false;
    }
    if (password.length < 6) {
      setAuthError("סיסמה חייבת להכיל לפחות 6 תווים");
      return false;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      // If user already exists, try to log in
      if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          setAuthError("משתמש קיים — סיסמה שגויה");
          return false;
        }
      } else {
        setAuthError(error.message);
        return false;
      }
    }

    setAuthReady(true);
    setIsLoggedIn(true);
    return true;
  }, [authReady, email, password, fullName, supabase.auth]);

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, planId: selectedPlan }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          valid: true,
          code: data.code,
          discountAmount: data.discountAmount,
          finalPrice: data.finalPrice,
          couponId: data.couponId,
        });
      } else {
        setCouponError(data.error || "קופון לא תקף");
      }
    } catch {
      setCouponError("שגיאה בבדיקת קופון");
    } finally {
      setCouponLoading(false);
    }
  }

  if (!paypalClientId) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 text-lg">מערכת התשלום בהקמה</p>
          <Link href="/" className="text-[#f5a623] hover:underline mt-4 inline-block">
            ← חזרה לעמוד הראשי
          </Link>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-4">התשלום הושלם!</h1>
          <p className="text-gray-400 text-lg mb-8">
            המנוי שלך פעיל. עכשיו אתה מקבל גישה מלאה לכל הטיפים.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17] font-bold px-8 py-4 rounded-xl text-lg transition-all"
          >
            🏆 לדשבורד שלי
          </button>
        </div>
      </div>
    );
  }

  // Loading auth state
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-gray-500">⏳ טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white">
            🏆 הטיפ <span className="text-[#f5a623]">המנצח</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4 mb-1">
            {isLoggedIn ? "בחר חבילה ושלם" : "הרשמה + מנוי — שלב אחד"}
          </h1>
          <p className="text-gray-400 text-sm">תשלום מאובטח דרך PayPal • ביטול בכל רגע</p>
        </div>

        {/* ── Step 1: Plan Selection ── */}
        <div className={`grid gap-3 mb-6 ${plans.length <= 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3"}`}>
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`relative rounded-xl p-4 text-center transition-all border-2 ${
                selectedPlan === p.id
                  ? "border-[#f5a623] bg-[#f5a623]/10"
                  : "border-gray-700 bg-gray-900/50 hover:border-gray-500"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#f5a623] text-[#0a0e17] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {p.badge}
                </div>
              )}
              <div className="text-2xl mb-1">{p.icon}</div>
              <div className="text-white font-bold text-sm">{p.nameHe}</div>
              <div className="mt-1">
                {p.originalPrice && (
                  <span className="text-gray-500 line-through text-xs ml-1">₪{p.originalPrice}</span>
                )}
                <span className="text-white font-extrabold text-xl">₪{p.price}</span>
              </div>
              <div className="text-gray-400 text-xs">{p.periodHe}</div>
            </button>
          ))}
        </div>

        {/* ── Plan Features ── */}
        {plan.features.length > 0 && (
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-2">
              {plan.features.map((f) => (
                <div key={f} className="flex items-start gap-1.5 text-xs text-gray-300">
                  <span className="text-[#10b981] mt-px">✓</span>{f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Account Details (if not logged in) ── */}
        {!isLoggedIn && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#f5a623] text-[#0a0e17] text-xs font-bold flex items-center justify-center">1</div>
              <h2 className="text-white font-bold">פרטי חשבון</h2>
              {authReady && <span className="text-emerald-400 text-xs mr-auto">✅ מוכן</span>}
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setAuthError(""); }}
                placeholder="שם מלא"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-sm"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setAuthError(""); setAuthReady(false); }}
                placeholder="אימייל"
                dir="ltr"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-sm"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(""); setAuthReady(false); }}
                placeholder="סיסמה (לפחות 6 תווים)"
                dir="ltr"
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-sm"
              />
              {authError && (
                <p className="text-red-400 text-xs text-center bg-red-400/10 rounded-lg py-2">{authError}</p>
              )}
              <p className="text-gray-600 text-[11px] text-center">
                כבר יש לך חשבון? הכנס את הפרטים שלך ונחבר אותך אוטומטית
              </p>
            </div>
          </div>
        )}

        {/* ── Coupon Code ── */}
        <div className="mb-5">
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="קוד קופון"
              className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-[#f5a623] focus:outline-none transition"
            />
            <button
              onClick={applyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {couponLoading ? "⏳" : "החל"}
            </button>
          </div>
          {couponError && <p className="text-red-400 text-xs mt-1.5">{couponError}</p>}
          {appliedCoupon && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-emerald-400 text-xs">✅ קופון {appliedCoupon.code} — הנחה ₪{appliedCoupon.discountAmount}</span>
              <button onClick={() => { setAppliedCoupon(null); setCouponInput(""); }} className="text-gray-500 hover:text-gray-300 text-xs">✕</button>
            </div>
          )}
        </div>

        {/* ── Order Summary ── */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
              isLoggedIn ? "bg-[#f5a623] text-[#0a0e17]" : "bg-gray-600 text-gray-300"
            }`}>
              {isLoggedIn ? "1" : "2"}
            </div>
            <h2 className="text-white font-bold">סיכום ותשלום</h2>
          </div>
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>{plan.icon} {plan.nameHe}</span>
            <span>{plan.durationDays} ימים</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-sm text-emerald-400 mb-2">
              <span>🎟️ קופון {appliedCoupon.code}</span>
              <span>-₪{appliedCoupon.discountAmount}</span>
            </div>
          )}
          <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
            <span className="text-white font-bold">סה&quot;כ</span>
            <div className="text-left">
              {appliedCoupon && (
                <span className="text-gray-500 line-through text-sm ml-2">₪{plan.price}</span>
              )}
              <span className="text-[#f5a623] font-extrabold text-lg">₪{finalPrice}</span>
            </div>
          </div>
        </div>

        {/* ── Payment ── */}
        {status === "error" && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 mb-4 text-center text-red-400 text-sm">
            {errorMsg || "שגיאה בתשלום. נסה שוב."}
          </div>
        )}

        {finalPrice > 0 ? (
          <PayPalScriptProvider
            options={{
              clientId: paypalClientId,
              currency: "ILS",
              intent: "capture",
              components: "buttons,card-fields",
              locale: "he_IL",
            }}
          >
            {/* Payment method tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                  paymentMethod === "card"
                    ? "border-[#f5a623] bg-[#f5a623]/10 text-white"
                    : "border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-500"
                }`}
              >
                💳 כרטיס אשראי
              </button>
              <button
                onClick={() => setPaymentMethod("paypal")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                  paymentMethod === "paypal"
                    ? "border-[#f5a623] bg-[#f5a623]/10 text-white"
                    : "border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-500"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.564 0-1.04.408-1.13.964L7.076 21.337z"/></svg>
                PayPal
              </button>
            </div>

            {/* ── Credit Card (inline form) ── */}
            {paymentMethod === "card" && (
              <PayPalCardFieldsProvider
                createOrder={async () => {
                  setStatus("processing");
                  setErrorMsg("");

                  if (!authReady) {
                    const ok = await handleSignup();
                    if (!ok) {
                      setStatus("idle");
                      throw new Error("Signup failed");
                    }
                  }

                  const res = await fetch("/api/paypal/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      planId: selectedPlan,
                      couponCode: appliedCoupon?.code || null,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.orderId) {
                    setStatus("error");
                    setErrorMsg(data.error || "Failed to create order");
                    throw new Error("Order creation failed");
                  }
                  return data.orderId;
                }}
                onApprove={async (data) => {
                  const res = await fetch("/api/paypal/capture-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: data.orderID }),
                  });
                  const result = await res.json();
                  if (res.ok && result.ok) {
                    setStatus("success");
                  } else {
                    setStatus("error");
                    setErrorMsg(result.error || "Payment capture failed");
                  }
                }}
                onError={(err) => {
                  console.error("Card payment error:", err);
                  setStatus("error");
                  setErrorMsg("שגיאה בתשלום בכרטיס. נסה שוב או השתמש ב-PayPal.");
                }}
              >
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 mb-4">
                  <PayPalCardFieldsForm />
                </div>
                <CardSubmitButton
                  disabled={status === "processing"}
                  label={status === "processing" ? "⏳ מעבד..." : `💳 שלם ₪${finalPrice}`}
                />
              </PayPalCardFieldsProvider>
            )}

            {/* ── PayPal Button ── */}
            {paymentMethod === "paypal" && (
              <PayPalButtons
                key={`${selectedPlan}-${appliedCoupon?.code || "none"}-${authReady}`}
                style={{
                  layout: "vertical",
                  color: "gold",
                  shape: "rect",
                  label: "pay",
                  height: 50,
                }}
                disabled={status === "processing"}
                createOrder={async () => {
                  setStatus("processing");
                  setErrorMsg("");

                  if (!authReady) {
                    const ok = await handleSignup();
                    if (!ok) {
                      setStatus("idle");
                      throw new Error("Signup failed");
                    }
                  }

                  const res = await fetch("/api/paypal/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      planId: selectedPlan,
                      couponCode: appliedCoupon?.code || null,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.orderId) {
                    setStatus("error");
                    setErrorMsg(data.error || "Failed to create order");
                    throw new Error("Order creation failed");
                  }
                  return data.orderId;
                }}
                onApprove={async (data) => {
                  const res = await fetch("/api/paypal/capture-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: data.orderID }),
                  });
                  const result = await res.json();
                  if (res.ok && result.ok) {
                    setStatus("success");
                  } else {
                    setStatus("error");
                    setErrorMsg(result.error || "Payment capture failed");
                  }
                }}
                onError={() => {
                  setStatus("error");
                  setErrorMsg("שגיאה בתהליך התשלום");
                }}
                onCancel={() => {
                  setStatus("idle");
                }}
              />
            )}
          </PayPalScriptProvider>
        ) : (
          <button
            onClick={async () => {
              setStatus("processing");
              if (!authReady) {
                const ok = await handleSignup();
                if (!ok) { setStatus("idle"); return; }
              }
              const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  planId: selectedPlan,
                  couponCode: appliedCoupon?.code || null,
                  freeOrder: true,
                }),
              });
              const data = await res.json();
              if (res.ok && data.ok) {
                setStatus("success");
              } else {
                setStatus("error");
                setErrorMsg(data.error || "שגיאה");
              }
            }}
            disabled={status === "processing"}
            className="w-full bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17] font-bold py-4 rounded-xl text-lg transition-all disabled:opacity-50"
          >
            {status === "processing" ? "⏳ מעבד..." : "🎁 הפעל מנוי חינם"}
          </button>
        )}

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition">
            ← חזרה לעמוד הראשי
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-gray-500">
          <span>🔒 תשלום מאובטח</span>
          <span>↩️ ביטול בכל רגע</span>
          <span>🛡️ PayPal Buyer Protection</span>
        </div>
      </div>
    </div>
  );
}
