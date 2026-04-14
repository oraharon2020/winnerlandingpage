import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Cron endpoint to expire subscriptions.
 * - Deactivates subscriptions where expires_at <= NOW()
 * - Sets is_premium = false for users with no remaining active subscriptions
 * 
 * Protected by CRON_SECRET header to prevent unauthorized access.
 * Call via Vercel Cron or external scheduler: GET /api/cron/expire-subscriptions
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  try {
    const client = await pool.connect();
    try {
      // 1. Find and deactivate expired subscriptions
      const expired = await client.query(
        `UPDATE subscriptions
         SET is_active = false
         WHERE is_active = true AND expires_at <= NOW()
         RETURNING user_id`
      );

      const affectedUserIds = [...new Set(expired.rows.map((r) => r.user_id))];

      // 2. For each affected user, check if they have any remaining active subs
      let premiumRevoked = 0;
      for (const userId of affectedUserIds) {
        const remaining = await client.query(
          `SELECT id FROM subscriptions WHERE user_id = $1 AND is_active = true AND expires_at > NOW()`,
          [userId]
        );
        if (remaining.rows.length === 0) {
          await client.query(
            `UPDATE users SET is_premium = false, updated_at = NOW() WHERE id = $1 AND is_premium = true`,
            [userId]
          );
          premiumRevoked++;
        }
      }

      console.log(`[Cron] Expired ${expired.rowCount} subscriptions, revoked premium for ${premiumRevoked} users`);

      return NextResponse.json({
        ok: true,
        expiredSubscriptions: expired.rowCount,
        premiumRevoked,
        timestamp: new Date().toISOString(),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[Cron] Expire subscriptions error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
