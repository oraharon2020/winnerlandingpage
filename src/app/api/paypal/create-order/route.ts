import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/paypal";
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

    const { planId, couponCode, freeOrder } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    // Fetch plan from DB
    let planPrice = 0;
    let planName = "";
    let durationDays = 0;

    if (pool) {
      const client = await pool.connect();
      try {
        const planResult = await client.query(
          `SELECT price, name_he, duration_days FROM plans WHERE id = $1 AND is_active = true AND is_free = false`,
          [planId]
        );
        if (planResult.rows.length === 0) {
          return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }
        planPrice = parseFloat(planResult.rows[0].price);
        planName = planResult.rows[0].name_he;
        durationDays = planResult.rows[0].duration_days;

        // Apply coupon if provided
        if (couponCode) {
          const couponResult = await client.query(
            `SELECT id, discount_percent, discount_amount FROM coupons
             WHERE code = $1
               AND is_active = true
               AND (plan_id IS NULL OR plan_id = $2)
               AND (max_uses IS NULL OR current_uses < max_uses)
               AND (expires_at IS NULL OR expires_at > NOW())
             LIMIT 1`,
            [couponCode.toUpperCase().trim(), planId]
          );

          if (couponResult.rows.length > 0) {
            const coupon = couponResult.rows[0];
            let discount = 0;
            if (coupon.discount_percent) {
              discount = Math.round(planPrice * coupon.discount_percent / 100);
            } else if (coupon.discount_amount) {
              discount = parseFloat(coupon.discount_amount);
            }
            planPrice = Math.max(0, planPrice - discount);

            // Increment coupon usage
            await client.query(
              `UPDATE coupons SET current_uses = current_uses + 1 WHERE id = $1`,
              [coupon.id]
            );
          }
        }
      } finally {
        client.release();
      }
    } else {
      // Fallback to hardcoded plans
      const fallback: Record<string, { price: number; name: string; days: number }> = {
        weekly: { price: 49, name: "חבילת היכרות", days: 7 },
        monthly: { price: 199, name: "חבילה חודשית", days: 30 },
      };
      const p = fallback[planId];
      if (!p) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
      planPrice = p.price;
      planName = p.name;
      durationDays = p.days;
    }

    // Handle free order (100% coupon discount)
    if (planPrice === 0 || freeOrder) {
      if (pool) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");

          // Find user by supabase_uid
          const userResult = await client.query(
            `SELECT id FROM users WHERE supabase_uid = $1`,
            [user.id]
          );

          if (userResult.rows.length > 0) {
            const userId = userResult.rows[0].id;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + (durationDays || 30));

            await client.query(
              `UPDATE subscriptions SET is_active = false WHERE user_id = $1 AND is_active = true`,
              [userId]
            );

            await client.query(
              `INSERT INTO subscriptions (user_id, plan_type, price_paid, starts_at, expires_at, is_active, payment_method, is_recurring)
               VALUES ($1, $2, 0, NOW(), $3, true, 'coupon', false)`,
              [userId, planId, expiresAt.toISOString()]
            );

            await client.query(
              `UPDATE users SET is_premium = true, updated_at = NOW() WHERE id = $1`,
              [userId]
            );
          }

          await client.query("COMMIT");
        } catch (e) {
          await client.query("ROLLBACK");
          throw e;
        } finally {
          client.release();
        }
      }
      return NextResponse.json({ ok: true, message: "Free order activated" });
    }

    const customId = `${planId}:${user.id}`;
    const order = await createOrder(
      planPrice,
      `הטיפ המנצח — ${planName}`,
      customId
    );

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
