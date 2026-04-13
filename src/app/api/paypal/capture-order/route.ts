import { NextRequest, NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal";
import { getPlanById } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Verify user is logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Capture the payment
    const capture = await captureOrder(orderId);

    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment not completed", status: capture.status },
        { status: 400 }
      );
    }

    // Extract plan and user from custom_id
    const customId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id || "";
    const [planId, paypalUserId] = customId.split(":");

    // Security: make sure the logged-in user matches
    if (paypalUserId !== user.id) {
      return NextResponse.json({ error: "User mismatch" }, { status: 403 });
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    // Activate subscription in DB
    if (pool) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.durationDays);
      const pricePaid = parseFloat(
        capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || plan.price.toString()
      );
      const paypalOrderId = capture.id;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Deactivate old subscriptions
        await client.query(
          `UPDATE subscriptions SET is_active = false WHERE user_id = (
             SELECT id FROM users WHERE supabase_uid = $1
           ) AND is_active = true`,
          [user.id]
        );

        // Create new subscription
        await client.query(
          `INSERT INTO subscriptions (user_id, plan_type, price_paid, starts_at, expires_at, is_active, payment_method, is_recurring, paypal_order_id)
           VALUES (
             (SELECT id FROM users WHERE supabase_uid = $1),
             $2, $3, NOW(), $4, true, 'paypal', false, $5
           )`,
          [user.id, plan.id, pricePaid, expiresAt.toISOString(), paypalOrderId]
        );

        // Mark user as premium
        await client.query(
          `UPDATE users SET is_premium = true, updated_at = NOW() WHERE supabase_uid = $1`,
          [user.id]
        );

        await client.query("COMMIT");
      } catch (dbErr) {
        await client.query("ROLLBACK");
        throw dbErr;
      } finally {
        client.release();
      }
    }

    return NextResponse.json({
      ok: true,
      plan: plan.nameHe,
      expiresIn: plan.durationDays,
    });
  } catch (error) {
    console.error("Capture order error:", error);
    return NextResponse.json(
      { error: "Failed to capture payment" },
      { status: 500 }
    );
  }
}
