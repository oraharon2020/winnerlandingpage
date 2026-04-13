import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: List all subscriptions with filters
export async function GET(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;
  const filter = searchParams.get("filter") || "all"; // all, active, expired, admin, paypal

  try {
    const client = await pool.connect();
    try {
      let whereClause = "";
      if (filter === "active") whereClause = " WHERE s.is_active = true AND s.expires_at > NOW()";
      else if (filter === "expired") whereClause = " WHERE s.expires_at <= NOW()";
      else if (filter === "admin") whereClause = " WHERE s.payment_method = 'admin'";
      else if (filter === "paypal") whereClause = " WHERE s.payment_method = 'paypal'";

      const countResult = await client.query(
        `SELECT COUNT(*) FROM subscriptions s${whereClause}`
      );
      const total = parseInt(countResult.rows[0].count);

      const result = await client.query(
        `SELECT 
          s.id,
          s.user_id,
          s.plan_type,
          s.price_paid,
          s.starts_at,
          s.expires_at,
          s.is_active,
          s.payment_method,
          s.is_recurring,
          s.paypal_order_id,
          s.created_at,
          u.username,
          u.first_name,
          u.telegram_id
        FROM subscriptions s
        LEFT JOIN users u ON u.id = s.user_id
        ${whereClause}
        ORDER BY s.created_at DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return NextResponse.json({
        subscriptions: result.rows.map((r) => ({
          id: r.id,
          userId: r.user_id,
          planType: r.plan_type,
          pricePaid: parseFloat(r.price_paid || "0"),
          startsAt: r.starts_at,
          expiresAt: r.expires_at,
          isActive: r.is_active,
          paymentMethod: r.payment_method,
          isRecurring: r.is_recurring,
          paypalOrderId: r.paypal_order_id,
          createdAt: r.created_at,
          userName: r.first_name || r.username || `#${r.telegram_id}`,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Subscriptions API error:", error);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}

// POST: Admin actions on subscriptions
export async function POST(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  let body: { action: string; subscriptionId?: number; userId?: number; planType?: string; days?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;
  const allowed = ["extend", "cancel", "grant", "change_plan"];
  if (!allowed.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      if (action === "grant") {
        const { userId, planType, days } = body;
        if (!userId || !planType || !days) {
          return NextResponse.json({ error: "Missing userId, planType, or days" }, { status: 400 });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        await client.query("BEGIN");

        // Deactivate old subs
        await client.query(
          `UPDATE subscriptions SET is_active = false WHERE user_id = $1 AND is_active = true`,
          [userId]
        );

        // Create new subscription
        await client.query(
          `INSERT INTO subscriptions (user_id, plan_type, price_paid, starts_at, expires_at, is_active, payment_method, is_recurring)
           VALUES ($1, $2, 0, NOW(), $3, true, 'admin', false)`,
          [userId, planType, expiresAt.toISOString()]
        );

        // Mark premium
        await client.query(
          `UPDATE users SET is_premium = true, updated_at = NOW() WHERE id = $1`,
          [userId]
        );

        await client.query("COMMIT");
        return NextResponse.json({ ok: true, message: `Granted ${planType} for ${days} days` });
      }

      if (action === "extend") {
        const { subscriptionId, days } = body;
        if (!subscriptionId || !days) {
          return NextResponse.json({ error: "Missing subscriptionId or days" }, { status: 400 });
        }

        await client.query(
          `UPDATE subscriptions 
           SET expires_at = GREATEST(expires_at, NOW()) + ($2 || ' days')::interval,
               is_active = true
           WHERE id = $1`,
          [subscriptionId, days]
        );

        return NextResponse.json({ ok: true, message: `Extended by ${days} days` });
      }

      if (action === "cancel") {
        const { subscriptionId } = body;
        if (!subscriptionId) {
          return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
        }

        await client.query("BEGIN");

        const sub = await client.query(
          `UPDATE subscriptions SET is_active = false WHERE id = $1 RETURNING user_id`,
          [subscriptionId]
        );

        if (sub.rows[0]) {
          // Check if user has other active subs
          const otherSubs = await client.query(
            `SELECT id FROM subscriptions WHERE user_id = $1 AND is_active = true AND expires_at > NOW()`,
            [sub.rows[0].user_id]
          );
          if (otherSubs.rows.length === 0) {
            await client.query(
              `UPDATE users SET is_premium = false, updated_at = NOW() WHERE id = $1`,
              [sub.rows[0].user_id]
            );
          }
        }

        await client.query("COMMIT");
        return NextResponse.json({ ok: true, message: "Subscription cancelled" });
      }

      if (action === "change_plan") {
        const { subscriptionId, planType } = body;
        if (!subscriptionId || !planType) {
          return NextResponse.json({ error: "Missing subscriptionId or planType" }, { status: 400 });
        }

        await client.query(
          `UPDATE subscriptions SET plan_type = $2 WHERE id = $1`,
          [subscriptionId, planType]
        );

        return NextResponse.json({ ok: true, message: `Plan changed to ${planType}` });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Subscription action error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
