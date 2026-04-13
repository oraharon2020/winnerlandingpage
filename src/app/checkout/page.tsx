"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "weekly",
    nameHe: "חבילת היכרות",
    icon: "🔥",
    price: 49,
    periodHe: "/ שבוע",
    durationHe: "7 ימים",
  },
  {
    id: "monthly",
    nameHe: "חבילה חודשית",
    icon: "👑",
    price: 199,
    originalPrice: 399,
    periodHe: "/ חודש",
    durationHe: "30 ימים",
    badge: "50% הנחה — מבצע השקה",
    popular: true,
  },
];

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

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

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">בחר חבילה ושלם</h1>
          <p className="text-gray-400">תשלום מאובטח דרך PayPal</p>
        </div>

        {/* Plan Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {PLANS.map((p) => (
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

        {/* Order Summary */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="text-white font-bold mb-3">סיכום הזמנה</h2>
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>{plan.icon} {plan.nameHe}</span>
            <span>{plan.durationHe}</span>
          </div>
          <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
            <span className="text-white font-bold">סה&quot;כ</span>
            <span className="text-[#f5a623] font-extrabold text-lg">₪{plan.price}</span>
          </div>
        </div>

        {/* PayPal Buttons */}
        {status === "error" && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 mb-4 text-center text-red-400 text-sm">
            {errorMsg || "שגיאה בתשלום. נסה שוב."}
          </div>
        )}

        <PayPalScriptProvider
          options={{
            clientId: paypalClientId,
            currency: "ILS",
            intent: "capture",
          }}
        >
          <PayPalButtons
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
              const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: selectedPlan }),
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
        </PayPalScriptProvider>

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
