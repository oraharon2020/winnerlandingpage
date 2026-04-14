import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

const MESHULAM_API_URL = process.env.MESHULAM_RECURRING_API_URL || process.env.MESHULAM_API_URL || "https://secure.meshulam.co.il/api/light/server/1.0";
const MESHULAM_USER_ID = process.env.MESHULAM_RECURRING_USER_ID || process.env.MESHULAM_USER_ID || "";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!pool) {
      return NextResponse.json({ error: "DB not configured" }, { status: 500 });
    }

    const client = await pool.connect();
    try {
      // Find active recurring subscription for this user
      const result = await client.query(
        `SELECT s.id, s.payment_data
         FROM subscriptions s
         JOIN users u ON u.id = s.user_id
         WHERE u.supabase_uid = $1 AND s.is_active = true AND s.is_recurring = true
         ORDER BY s.created_at DESC
         LIMIT 1`,
        [user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "לא נמצא מנוי פעיל לביטול" }, { status: 404 });
      }

      const sub = result.rows[0];
      const paymentData = sub.payment_data || {};
      const { transaction_id, transaction_token, asmachta } = paymentData;

      if (!transaction_id || !transaction_token || !asmachta) {
        return NextResponse.json({ error: "חסרים פרטי תשלום לביטול הוראת הקבע" }, { status: 400 });
      }

      // Call Grow updateDirectDebit to cancel the recurring payment
      const formData = new FormData();
      formData.append("userId", MESHULAM_USER_ID);
      formData.append("transactionId", transaction_id);
      formData.append("transactionToken", transaction_token);
      formData.append("asmachta", asmachta);
      formData.append("changeStatus", "2"); // 2 = canceled

      console.log("[Cancel Sub] Calling updateDirectDebit for sub", sub.id);

      const response = await fetch(`${MESHULAM_API_URL}/updateDirectDebit`, {
        method: "POST",
        body: formData,
      });
      const apiResult = await response.json();
      console.log("[Cancel Sub] updateDirectDebit response:", JSON.stringify(apiResult));

      if (apiResult.status !== 1 && apiResult.status !== "1") {
        console.error("[Cancel Sub] Grow API error:", JSON.stringify(apiResult));
        return NextResponse.json(
          { error: "שגיאה בביטול הוראת הקבע אצל הסליקה" },
          { status: 500 }
        );
      }

      // Mark subscription as non-recurring (keep active until expiry but stop renewals)
      await client.query(
        `UPDATE subscriptions
         SET is_recurring = false,
             payment_data = payment_data || '{"recurring_cancelled": true}'::jsonb
         WHERE id = $1`,
        [sub.id]
      );

      console.log(`[Cancel Sub] Recurring cancelled for sub ${sub.id}`);
      return NextResponse.json({ ok: true, message: "הוראת הקבע בוטלה. המנוי יישאר פעיל עד סוף התקופה." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[Cancel Sub] Error:", error);
    return NextResponse.json({ error: "שגיאה בביטול המנוי" }, { status: 500 });
  }
}
