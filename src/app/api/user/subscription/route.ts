import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ isActive: false });
    }

    if (!pool) {
      return NextResponse.json({ isActive: false });
    }

    const result = await pool.query(
      `SELECT s.is_active, s.expires_at, s.plan_type, s.is_recurring
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id
       WHERE u.supabase_uid = $1 AND s.is_active = true AND s.expires_at > NOW()
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [user.id]
    );

    if (result.rows.length > 0) {
      return NextResponse.json({
        isActive: true,
        planType: result.rows[0].plan_type,
        expiresAt: result.rows[0].expires_at,
        isRecurring: result.rows[0].is_recurring,
      });
    }

    return NextResponse.json({ isActive: false });
  } catch {
    return NextResponse.json({ isActive: false });
  }
}
