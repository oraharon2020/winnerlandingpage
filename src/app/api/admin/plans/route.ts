import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET: List ALL plans (including inactive) for admin
export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM plans ORDER BY sort_order ASC, created_at ASC`
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
          isActive: r.is_active,
          isFree: r.is_free,
          ctaText: r.cta_text,
          ctaLink: r.cta_link,
          sortOrder: r.sort_order,
          description: r.description,
          createdAt: r.created_at,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Admin plans error:", error);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}

// POST: Create or update a plan
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!pool) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  let body: {
    action: string;
    plan?: {
      id: string;
      nameHe: string;
      icon: string;
      price: number;
      originalPrice?: number | null;
      period: string;
      periodHe: string;
      durationDays: number;
      features: string[];
      maxTipsPerDay: number;
      badge?: string | null;
      isPopular?: boolean;
      isActive?: boolean;
      isFree?: boolean;
      ctaText?: string;
      ctaLink?: string | null;
      sortOrder?: number;
      description?: string | null;
    };
    planId?: string;
    field?: string;
    value?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;
  const allowed = ["create", "update", "delete", "toggle", "reorder"];
  if (!allowed.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      if (action === "create") {
        const p = body.plan;
        if (!p || !p.id || !p.nameHe) {
          return NextResponse.json({ error: "Missing plan data" }, { status: 400 });
        }

        // Validate ID format (alphanumeric + hyphens only)
        if (!/^[a-z0-9_-]+$/.test(p.id)) {
          return NextResponse.json({ error: "Plan ID must be lowercase alphanumeric with hyphens/underscores" }, { status: 400 });
        }

        await client.query(
          `INSERT INTO plans (id, name_he, icon, price, original_price, period, period_he, duration_days, features, max_tips_per_day, badge, is_popular, is_active, is_free, cta_text, cta_link, sort_order, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
          [
            p.id, p.nameHe, p.icon || "⭐", p.price, p.originalPrice || null,
            p.period, p.periodHe, p.durationDays, JSON.stringify(p.features || []),
            p.maxTipsPerDay || 999, p.badge || null, p.isPopular || false,
            p.isActive !== false, p.isFree || false, p.ctaText || "התחל עכשיו",
            p.ctaLink || null, p.sortOrder || 0, p.description || null,
          ]
        );

        return NextResponse.json({ ok: true, message: "Plan created" });
      }

      if (action === "update") {
        const p = body.plan;
        if (!p || !p.id) {
          return NextResponse.json({ error: "Missing plan data" }, { status: 400 });
        }

        await client.query(
          `UPDATE plans SET
            name_he = $2, icon = $3, price = $4, original_price = $5,
            period = $6, period_he = $7, duration_days = $8,
            features = $9::jsonb, max_tips_per_day = $10, badge = $11,
            is_popular = $12, is_active = $13, is_free = $14,
            cta_text = $15, cta_link = $16, sort_order = $17,
            description = $18, updated_at = NOW()
           WHERE id = $1`,
          [
            p.id, p.nameHe, p.icon || "⭐", p.price, p.originalPrice || null,
            p.period, p.periodHe, p.durationDays, JSON.stringify(p.features || []),
            p.maxTipsPerDay || 999, p.badge || null, p.isPopular || false,
            p.isActive !== false, p.isFree || false, p.ctaText || "התחל עכשיו",
            p.ctaLink || null, p.sortOrder || 0, p.description || null,
          ]
        );

        return NextResponse.json({ ok: true, message: "Plan updated" });
      }

      if (action === "toggle") {
        const { planId, field } = body;
        if (!planId || !field) {
          return NextResponse.json({ error: "Missing planId or field" }, { status: 400 });
        }
        const allowedFields = ["is_active", "is_popular", "is_free"];
        if (!allowedFields.includes(field)) {
          return NextResponse.json({ error: "Invalid toggle field" }, { status: 400 });
        }
        await client.query(
          `UPDATE plans SET ${field} = NOT ${field}, updated_at = NOW() WHERE id = $1`,
          [planId]
        );
        return NextResponse.json({ ok: true });
      }

      if (action === "delete") {
        const { planId } = body;
        if (!planId) {
          return NextResponse.json({ error: "Missing planId" }, { status: 400 });
        }
        // Don't delete plans with active subscriptions — just deactivate
        const activeSubs = await client.query(
          `SELECT COUNT(*) FROM subscriptions WHERE plan_type = $1 AND is_active = true`,
          [planId]
        );
        if (parseInt(activeSubs.rows[0].count) > 0) {
          await client.query(
            `UPDATE plans SET is_active = false, updated_at = NOW() WHERE id = $1`,
            [planId]
          );
          return NextResponse.json({ ok: true, message: "Plan deactivated (has active subs)" });
        }
        await client.query(`DELETE FROM plans WHERE id = $1`, [planId]);
        return NextResponse.json({ ok: true, message: "Plan deleted" });
      }

      if (action === "reorder") {
        // body should have planId and a new sortOrder value
        const { planId } = body;
        const sortOrder = body.value as number;
        if (!planId || sortOrder === undefined) {
          return NextResponse.json({ error: "Missing planId or value" }, { status: 400 });
        }
        await client.query(
          `UPDATE plans SET sort_order = $2, updated_at = NOW() WHERE id = $1`,
          [planId, sortOrder]
        );
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Admin plans error:", error);
    const msg = String(error);
    if (msg.includes("duplicate key")) {
      return NextResponse.json({ error: "מזהה חבילה כבר קיים" }, { status: 409 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
