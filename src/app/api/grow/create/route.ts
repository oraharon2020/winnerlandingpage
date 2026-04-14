import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

const MESHULAM_API_URL = process.env.MESHULAM_API_URL || "https://secure.meshulam.co.il/api/light/server/1.0";
const MESHULAM_PAGE_CODE = process.env.MESHULAM_PAGE_CODE || "";
const MESHULAM_USER_ID = process.env.MESHULAM_USER_ID || "";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, couponCode, customerName, customerPhone, customerEmail } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }
    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: "Missing customerName or customerPhone" }, { status: 400 });
    }

    // Validate full name
    if (customerName.trim().split(/\s+/).length < 2) {
      return NextResponse.json({ error: "שם מלא חייב להכיל שם פרטי ושם משפחה" }, { status: 400 });
    }

    // Normalize phone
    let phone = customerPhone.replace(/[-\s]/g, "");
    if (phone.startsWith("+972")) phone = "0" + phone.slice(4);
    else if (phone.startsWith("972")) phone = "0" + phone.slice(3);
    if (!/^05\d{8}$/.test(phone)) {
      return NextResponse.json({ error: "מספר טלפון לא תקין (05xxxxxxxx)" }, { status: 400 });
    }

    // Fetch plan
    let planPrice = 0;
    let planName = "";
    let durationDays = 0;

    if (pool) {
      const client = await pool.connect();
      try {
        const planResult = await client.query(
          `SELECT price, name_he, duration_days FROM plans WHERE id = $1 AND is_active = true AND is_free = false`,
          [planId]
        );
        if (planResult.rows.length === 0) {
          return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }
        planPrice = parseFloat(planResult.rows[0].price);
        planName = planResult.rows[0].name_he;
        durationDays = planResult.rows[0].duration_days;

        // Apply coupon
        if (couponCode) {
          const couponResult = await client.query(
            `SELECT id, discount_percent, discount_amount FROM coupons
             WHERE code = $1 AND is_active = true
               AND (plan_id IS NULL OR plan_id = $2)
               AND (max_uses IS NULL OR current_uses < max_uses)
               AND (expires_at IS NULL OR expires_at > NOW())
             LIMIT 1`,
            [couponCode.toUpperCase().trim(), planId]
          );
          if (couponResult.rows.length > 0) {
            const coupon = couponResult.rows[0];
            let discount = 0;
            if (coupon.discount_percent) {
              discount = Math.round(planPrice * coupon.discount_percent / 100);
            } else if (coupon.discount_amount) {
              discount = parseFloat(coupon.discount_amount);
            }
            planPrice = Math.max(0, planPrice - discount);
            await client.query(`UPDATE coupons SET current_uses = current_uses + 1 WHERE id = $1`, [coupon.id]);
          }
        }
      } finally {
        client.release();
      }
    } else {
      const fallback: Record<string, { price: number; name: string; days: number }> = {
        weekly: { price: 49, name: "חבילת היכרות", days: 7 },
        monthly: { price: 199, name: "חבילה חודשית", days: 30 },
      };
      const p = fallback[planId];
      if (!p) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      planPrice = p.price;
      planName = p.name;
      durationDays = p.days;
    }

    // Handle free order (100% coupon)
    if (planPrice === 0) {
      if (pool) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const userResult = await client.query(`SELECT id FROM users WHERE supabase_uid = $1`, [user.id]);
          if (userResult.rows.length > 0) {
            const userId = userResult.rows[0].id;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + (durationDays || 30));
            await client.query(`UPDATE subscriptions SET is_active = false WHERE user_id = $1 AND is_active = true`, [userId]);
            await client.query(
              `INSERT INTO subscriptions (user_id, plan_type, price_paid, starts_at, expires_at, is_active, payment_method, is_recurring)
               VALUES ($1, $2, 0, NOW(), $3, true, 'coupon', false)`,
              [userId, planId, expiresAt.toISOString()]
            );
            await client.query(`UPDATE users SET is_premium = true, updated_at = NOW() WHERE id = $1`, [userId]);
          }
          await client.query("COMMIT");
        } catch (e) {
          await client.query("ROLLBACK");
          throw e;
        } finally {
          client.release();
        }
      }
      return NextResponse.json({ success: true, freeTransaction: true });
    }

    // Create Grow/Meshulam payment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.hatiphamnatzeach.co.il";
    const customId = `${planId}:${user.id}:${durationDays}`;

    const formData = new FormData();
    formData.append("pageCode", MESHULAM_PAGE_CODE);
    formData.append("userId", MESHULAM_USER_ID);
    formData.append("sum", planPrice.toString());
    formData.append("description", `הטיפ המנצח — ${planName}`);
    formData.append("successUrl", `${appUrl}/checkout?payment=success`);
    formData.append("cancelUrl", `${appUrl}/checkout?payment=cancelled`);
    formData.append("notifyUrl", `${appUrl}/api/grow/webhook`);
    formData.append("pageField[fullName]", customerName);
    formData.append("pageField[phone]", phone);
    if (customerEmail) {
      formData.append("pageField[email]", customerEmail);
    }
    formData.append("cField1", customId);

    const response = await fetch(`${MESHULAM_API_URL}/createPaymentProcess`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (result.status === 1 || result.status === "1") {
      const processId = result.data?.processId;
      const processToken = result.data?.processToken;

      const infoFormData = new FormData();
      infoFormData.append("pageCode", MESHULAM_PAGE_CODE);
      infoFormData.append("userId", MESHULAM_USER_ID);
      infoFormData.append("processId", processId.toString());
      infoFormData.append("processToken", processToken);

      const infoResponse = await fetch(`${MESHULAM_API_URL}/getPaymentProcessInfo`, {
        method: "POST",
        body: infoFormData,
      });
      const infoResult = await infoResponse.json();

      const isSandbox = MESHULAM_API_URL.includes("sandbox");
      const basePaymentUrl = isSandbox ? "https://sandbox.meshulam.co.il" : "https://secure.meshulam.co.il";
      const paymentUrl = infoResult.data?.url || result.data?.url || `${basePaymentUrl}/s/${MESHULAM_PAGE_CODE}/${processId}`;

      return NextResponse.json({
        success: true,
        paymentUrl,
        processId,
        processToken,
        authCode: result.data?.authCode,
      });
    } else {
      return NextResponse.json(
        { error: "Payment creation failed", details: result.err?.message || "Unknown error" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Grow create payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
