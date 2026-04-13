import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paypal";
import { getPlanById } from "@/lib/plans";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => { headers[k] = v; });

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(headers, body);
    if (!isValid) {
      console.warn("PayPal webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;

    // Handle PAYMENT.CAPTURE.COMPLETED — backup for client-side capture
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const capture = event.resource;
      const customId = capture?.custom_id || "";
      const [planId, userId] = customId.split(":");
      const plan = getPlanById(planId);

      if (plan && userId && pool) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

        const client = await pool.connect();
        try {
          // Check if this order was already processed
          const existing = await client.query(
            `SELECT id FROM subscriptions WHERE paypal_order_id = $1`,
            [capture.id]
          );
          if (existing.rows.length === 0) {
            await client.query("BEGIN");
            await client.query(
              `UPDATE subscriptions SET is_active = false WHERE user_id = (
                 SELECT id FROM users WHERE supabase_uid = $1
               ) AND is_active = true`,
              [userId]
            );
            await client.query(
              `INSERT INTO subscriptions (user_id, plan_type, price_paid, starts_at, expires_at, is_active, payment_method, is_recurring, paypal_order_id)
               VALUES (
                 (SELECT id FROM users WHERE supabase_uid = $1),
                 $2, $3, NOW(), $4, true, 'paypal', false, $5
               )`,
              [userId, plan.id, parseFloat(capture.amount?.value || "0"), expiresAt.toISOString(), capture.id]
            );
            await client.query(
              `UPDATE users SET is_premium = true, updated_at = NOW() WHERE supabase_uid = $1`,
              [userId]
            );
            await client.query("COMMIT");
          }
        } catch (err) {
          await client.query("ROLLBACK");
          console.error("Webhook DB error:", err);
        } finally {
          client.release();
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
