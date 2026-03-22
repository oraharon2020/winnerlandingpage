import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all"; // all, premium, free, trial

  try {
    const client = await pool.connect();
    try {
      let whereClause = "";
      const params: (string | number)[] = [];
      let paramIndex = 1;

      if (search) {
        whereClause += ` WHERE (u.username ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR CAST(u.telegram_id AS TEXT) LIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (filter === "premium") {
        whereClause += whereClause ? " AND" : " WHERE";
        whereClause += " u.is_premium = true";
      } else if (filter === "free") {
        whereClause += whereClause ? " AND" : " WHERE";
        whereClause += " u.is_premium = false";
      }

      // Count total
      const countResult = await client.query(
        `SELECT COUNT(*) FROM users u${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].count);

      // Get users with subscription info
      const usersResult = await client.query(
        `SELECT 
          u.id,
          u.telegram_id,
          u.username,
          u.first_name,
          u.last_name,
          u.is_premium,
          u.is_admin,
          u.is_blocked,
          u.created_at,
          u.updated_at,
          s.plan_type as sub_plan,
          s.expires_at as sub_expires,
          s.is_active as sub_active,
          s.is_recurring as sub_recurring,
          s.price_paid as sub_price,
          us.source as campaign_source
        FROM users u
        LEFT JOIN LATERAL (
          SELECT * FROM subscriptions 
          WHERE user_id = u.id 
          ORDER BY created_at DESC LIMIT 1
        ) s ON true
        LEFT JOIN user_sources us ON us.telegram_id = u.telegram_id
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );

      return NextResponse.json({
        users: usersResult.rows.map((r) => ({
          id: r.id,
          telegramId: r.telegram_id,
          username: r.username,
          firstName: r.first_name,
          lastName: r.last_name,
          isPremium: r.is_premium,
          isAdmin: r.is_admin,
          isBlocked: r.is_blocked,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          subscription: r.sub_plan
            ? {
                plan: r.sub_plan,
                expires: r.sub_expires,
                active: r.sub_active,
                recurring: r.sub_recurring,
                price: parseFloat(r.sub_price || "0"),
              }
            : null,
          campaignSource: r.campaign_source,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// POST: Grant/revoke premium or block/unblock
// ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  let body: { userId: number; action: string; days?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, action, days } = body;
  if (!userId || !action) {
    return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
  }

  const allowed = ["grant_premium", "revoke_premium", "block", "unblock"];
  if (!allowed.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      if (action === "grant_premium") {
        const durationDays = days || 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        // Set user as premium
        await client.query(
          `UPDATE users SET is_premium = true, updated_at = NOW() WHERE id = $1`,
          [userId]
        );

        // Create a subscription record (payment_method = 'admin')
        await client.query(
          `INSERT INTO subscriptions (user_id, plan_type, price_paid, starts_at, expires_at, is_active, payment_method, is_recurring)
           VALUES ($1, 'monthly', 0, NOW(), $2, true, 'admin', false)`,
          [userId, expiresAt.toISOString()]
        );

        return NextResponse.json({ ok: true, message: `Premium granted for ${durationDays} days` });
      }

      if (action === "revoke_premium") {
        await client.query(
          `UPDATE users SET is_premium = false, updated_at = NOW() WHERE id = $1`,
          [userId]
        );
        await client.query(
          `UPDATE subscriptions SET is_active = false WHERE user_id = $1 AND is_active = true`,
          [userId]
        );
        return NextResponse.json({ ok: true, message: "Premium revoked" });
      }

      if (action === "block") {
        await client.query(
          `UPDATE users SET is_blocked = true, updated_at = NOW() WHERE id = $1`,
          [userId]
        );
        return NextResponse.json({ ok: true, message: "User blocked" });
      }

      if (action === "unblock") {
        await client.query(
          `UPDATE users SET is_blocked = false, updated_at = NOW() WHERE id = $1`,
          [userId]
        );
        return NextResponse.json({ ok: true, message: "User unblocked" });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("User action error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
