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
