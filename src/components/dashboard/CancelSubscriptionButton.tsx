"use client";

import { useState } from "react";

export default function CancelSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleCancel() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/cancel-subscription", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setCancelled(true);
        setShowConfirm(false);
      } else {
        setError(data.error || "שגיאה בביטול");
      }
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  if (cancelled) {
    return (
      <p className="text-emerald-400 text-xs mt-1">
        ✅ הוראת הקבע בוטלה. המנוי פעיל עד סוף התקופה.
      </p>
    );
  }

  return (
    <div className="mt-1">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="text-gray-500 hover:text-red-400 text-xs transition underline"
        >
          בטל הוראת קבע
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-red-400 hover:text-red-300 text-xs font-medium transition disabled:opacity-50"
          >
            {loading ? "⏳ מבטל..." : "⚠️ אישור ביטול"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="text-gray-500 hover:text-gray-300 text-xs transition"
          >
            ביטול
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
