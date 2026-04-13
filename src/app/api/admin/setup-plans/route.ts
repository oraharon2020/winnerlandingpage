import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

// POST: Run migration to create plans + coupons tables and seed defaults
export async function POST() {
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Plans table
      await client.query(`
        CREATE TABLE IF NOT EXISTS plans (
          id TEXT PRIMARY KEY,
          name_he TEXT NOT NULL,
          icon TEXT DEFAULT '⭐',
          price NUMERIC(10,2) NOT NULL DEFAULT 0,
          original_price NUMERIC(10,2),
          period TEXT NOT NULL DEFAULT 'month',
          period_he TEXT NOT NULL DEFAULT '/ חודש',
          duration_days INTEGER NOT NULL DEFAULT 30,
          features JSONB NOT NULL DEFAULT '[]'::jsonb,
          max_tips_per_day INTEGER NOT NULL DEFAULT 1,
          badge TEXT,
          is_popular BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          is_free BOOLEAN DEFAULT false,
          cta_text TEXT DEFAULT 'התחל עכשיו',
          cta_link TEXT,
          sort_order INTEGER DEFAULT 0,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Coupons table
      await client.query(`
        CREATE TABLE IF NOT EXISTS coupons (
          id SERIAL PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          discount_percent INTEGER,
          discount_amount NUMERIC(10,2),
          plan_id TEXT REFERENCES plans(id) ON DELETE SET NULL,
          max_uses INTEGER,
          current_uses INTEGER DEFAULT 0,
          expires_at TIMESTAMPTZ,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Seed default plans if empty
      const existing = await client.query("SELECT COUNT(*) FROM plans");
      if (parseInt(existing.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO plans (id, name_he, icon, price, original_price, period, period_he, duration_days, features, max_tips_per_day, badge, is_popular, is_active, is_free, cta_text, cta_link, sort_order, description) VALUES
          ('free', 'חינם', '🆓', 0, NULL, 'forever', 'לצמיתות', 0,
           '["טיפ 1 ביום — הטוב ביותר","צפייה במשחקי היום","30+ ליגות"]'::jsonb,
           1, NULL, false, true, true, 'התחל בחינם', '/auth/signup', 0, NULL),
          ('weekly', 'חבילת היכרות', '🔥', 49, NULL, 'week', '/ שבוע', 7,
           '["כל הטיפים — ללא הגבלה","דשבורד תוצאות מלא","ניתוח מפורט לכל משחק","30+ ליגות","ביטול בכל רגע"]'::jsonb,
           999, NULL, false, true, false, 'נסה שבוע', NULL, 1, '7 ימים — בלי התחייבות'),
          ('monthly', 'חבילה חודשית', '👑', 199, 399, 'month', '/ חודש', 30,
           '["כל הטיפים — ללא הגבלה","דשבורד תוצאות מלא","ניתוח מפורט לכל משחק","30+ ליגות","התראות ישירות כל בוקר","ביטול בכל רגע"]'::jsonb,
           999, '50% הנחה — מבצע השקה', true, true, false, 'התחל לנצח', NULL, 2, NULL)
        `);
      }

      await client.query("COMMIT");
      return NextResponse.json({ ok: true, message: "Migration complete" });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
