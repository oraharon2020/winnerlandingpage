import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

// POST: Validate a coupon code and return discount info
export async function POST(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  let body: { code: string; planId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = (body.code || "").toUpperCase().trim();
  const { planId } = body;

  if (!code || !planId) {
    return NextResponse.json({ error: "Missing code or planId" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM coupons
         WHERE code = $1
           AND is_active = true
           AND (plan_id IS NULL OR plan_id = $2)
           AND (max_uses IS NULL OR current_uses < max_uses)
           AND (expires_at IS NULL OR expires_at > NOW())
         LIMIT 1`,
        [code, planId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ valid: false, error: "קופון לא תקף" });
      }

      const coupon = result.rows[0];

      // Get plan price to calculate final price
      const planResult = await client.query(
        `SELECT price FROM plans WHERE id = $1 AND is_active = true`,
        [planId]
      );
      if (planResult.rows.length === 0) {
        return NextResponse.json({ valid: false, error: "חבילה לא נמצאה" });
      }

      const planPrice = parseFloat(planResult.rows[0].price);
      let discount = 0;

      if (coupon.discount_percent) {
        discount = Math.round(planPrice * coupon.discount_percent / 100);
      } else if (coupon.discount_amount) {
        discount = parseFloat(coupon.discount_amount);
      }

      const finalPrice = Math.max(0, planPrice - discount);

      return NextResponse.json({
        valid: true,
        couponId: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discount_percent,
        discountAmount: discount,
        finalPrice,
        originalPrice: planPrice,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
