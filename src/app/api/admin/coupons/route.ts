import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: List all coupons
export async function GET() {
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT c.*, p.name_he as plan_name
         FROM coupons c
         LEFT JOIN plans p ON p.id = c.plan_id
         ORDER BY c.created_at DESC`
      );

      return NextResponse.json({
        coupons: result.rows.map((r) => ({
          id: r.id,
          code: r.code,
          discountPercent: r.discount_percent,
          discountAmount: r.discount_amount ? parseFloat(r.discount_amount) : null,
          planId: r.plan_id,
          planName: r.plan_name,
          maxUses: r.max_uses,
          currentUses: r.current_uses,
          expiresAt: r.expires_at,
          isActive: r.is_active,
          createdAt: r.created_at,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Coupons API error:", error);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}

// POST: Admin actions on coupons
export async function POST(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  let body: {
    action: string;
    coupon?: {
      code: string;
      discountPercent?: number | null;
      discountAmount?: number | null;
      planId?: string | null;
      maxUses?: number | null;
      expiresAt?: string | null;
    };
    couponId?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;
  const allowed = ["create", "toggle", "delete"];
  if (!allowed.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      if (action === "create") {
        const c = body.coupon;
        if (!c || !c.code) {
          return NextResponse.json({ error: "Missing coupon code" }, { status: 400 });
        }
        if (!c.discountPercent && !c.discountAmount) {
          return NextResponse.json({ error: "Must set discount percent or amount" }, { status: 400 });
        }

        // Normalize code to uppercase
        const code = c.code.toUpperCase().trim();
        if (!/^[A-Z0-9_-]+$/.test(code)) {
          return NextResponse.json({ error: "Code must be uppercase alphanumeric" }, { status: 400 });
        }

        await client.query(
          `INSERT INTO coupons (code, discount_percent, discount_amount, plan_id, max_uses, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            code,
            c.discountPercent || null,
            c.discountAmount || null,
            c.planId || null,
            c.maxUses || null,
            c.expiresAt || null,
          ]
        );

        return NextResponse.json({ ok: true, message: `Coupon ${code} created` });
      }

      if (action === "toggle") {
        const { couponId } = body;
        if (!couponId) {
          return NextResponse.json({ error: "Missing couponId" }, { status: 400 });
        }
        await client.query(
          `UPDATE coupons SET is_active = NOT is_active WHERE id = $1`,
          [couponId]
        );
        return NextResponse.json({ ok: true });
      }

      if (action === "delete") {
        const { couponId } = body;
        if (!couponId) {
          return NextResponse.json({ error: "Missing couponId" }, { status: 400 });
        }
        await client.query(`DELETE FROM coupons WHERE id = $1`, [couponId]);
        return NextResponse.json({ ok: true, message: "Coupon deleted" });
      }

      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Coupons error:", error);
    const msg = String(error);
    if (msg.includes("duplicate key")) {
      return NextResponse.json({ error: "קוד קופון כבר קיים" }, { status: 409 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
