import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: Public endpoint — returns active plans for Pricing + Checkout
export async function GET() {
  if (!pool) {
    return NextResponse.json({ plans: [] });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, name_he, icon, price, original_price, period, period_he,
                duration_days, features, max_tips_per_day, badge, is_popular,
                is_free, cta_text, cta_link, description, sort_order
         FROM plans
         WHERE is_active = true
         ORDER BY sort_order ASC, created_at ASC`
      );

      return NextResponse.json({
        plans: result.rows.map((r) => ({
          id: r.id,
          nameHe: r.name_he,
          icon: r.icon,
          price: parseFloat(r.price),
          originalPrice: r.original_price ? parseFloat(r.original_price) : null,
          period: r.period,
          periodHe: r.period_he,
          durationDays: r.duration_days,
          features: r.features || [],
          maxTipsPerDay: r.max_tips_per_day,
          badge: r.badge,
          isPopular: r.is_popular,
          isFree: r.is_free,
          ctaText: r.cta_text,
          ctaLink: r.cta_link,
          description: r.description,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json({ plans: [] });
  }
}
