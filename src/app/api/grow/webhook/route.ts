import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const MESHULAM_API_URL = process.env.MESHULAM_API_URL || "https://secure.meshulam.co.il/api/light/server/1.0";
const MESHULAM_PAGE_CODE = process.env.MESHULAM_PAGE_CODE || "";
const MESHULAM_RECURRING_PAGE_CODE = process.env.MESHULAM_RECURRING_PAGE_CODE || "";
const MESHULAM_USER_ID = process.env.MESHULAM_USER_ID || "";
const MESHULAM_RECURRING_USER_ID = process.env.MESHULAM_RECURRING_USER_ID || MESHULAM_USER_ID;
const MESHULAM_RECURRING_API_URL = process.env.MESHULAM_RECURRING_API_URL || MESHULAM_API_URL;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log("[Grow Webhook] ====== RECEIVED PAYMENT WEBHOOK ======");

  try {
    // Parse form data (Grow sends as form-urlencoded)
    const contentType = req.headers.get("content-type") || "";
    let rawData: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        rawData[key] = value.toString();
      });
    } else {
      rawData = await req.json();
    }

    console.log("[Grow Webhook] Raw data:", JSON.stringify(rawData, null, 2));

    // Parse Grow webhook format — "data[fieldName]" and "data[customFields][cFieldX]"
    const data: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawData)) {
      if (key.startsWith("data[customFields]")) {
        const cfMatch = key.match(/^data\[customFields\]\[(.+?)\]$/);
        if (cfMatch) data[cfMatch[1]] = value;
      } else {
        const match = key.match(/^data\[([^\]]+)\]$/);
        if (match) data[match[1]] = value;
        else data[key] = value;
      }
    }

    console.log("[Grow Webhook] Parsed data:", JSON.stringify(data, null, 2));

    const {
      transactionId,
      transactionToken,
      processId,
      processToken,
      asmachta,
      cardSuffix,
      cardType,
      cardTypeCode,
      cardBrand,
      cardBrandCode,
      cardExp,
      paymentType,
      sum,
      paymentsNum,
      allPaymentsNum,
      firstPaymentSum,
      periodicalPaymentSum,
      paymentDate,
      description,
      status,
      fullName,
      payerPhone,
      payerEmail,
      cField1,
      directDebitId,
      recurringDebitId,
    } = data;

    // cField1 format: "planId_supabaseUid_durationDays_couponId_recurring"
    const customId = cField1;
    const paymentStatus = rawData.status || status;
    const isRecurringPayment = !!directDebitId;

    // Monthly renewal webhook — has directDebitId but no cField1 (or cField1 from original)
    // Recurring renewals are automatic charges by Grow — extend existing subscription
    if (isRecurringPayment && (paymentStatus === "1" || String(paymentStatus) === "1") && pool) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Idempotency: check if this specific transaction was already processed
        if (transactionId) {
          const existing = await client.query(
            `SELECT id FROM subscriptions WHERE payment_data->>'transaction_id' = $1`,
            [transactionId]
          );
          if (existing.rows.length > 0) {
            await client.query("ROLLBACK");
            console.log(`[Grow Webhook] Duplicate recurring transaction ${transactionId}, skipping`);
            try { await approveTransaction(data, true); } catch {}
            return NextResponse.json({ status: 1 });
          }
        }

        // Find existing active recurring subscription by directDebitId
        const existingSub = await client.query(
          `SELECT s.id, s.user_id, s.plan_type, s.expires_at
           FROM subscriptions s
           WHERE s.payment_data->>'direct_debit_id' = $1
             AND s.is_recurring = true AND s.is_active = true
           ORDER BY s.created_at DESC LIMIT 1`,
          [directDebitId]
        );

        if (existingSub.rows.length > 0) {
          // This is a monthly renewal — extend existing subscription
          const sub = existingSub.rows[0];
          const newExpiry = new Date(Math.max(new Date(sub.expires_at).getTime(), Date.now()));
          newExpiry.setDate(newExpiry.getDate() + 30);

          await client.query(
            `UPDATE subscriptions
             SET expires_at = $2, payment_data = payment_data || $3::jsonb
             WHERE id = $1`,
            [
              sub.id,
              newExpiry.toISOString(),
              JSON.stringify({
                last_renewal_transaction_id: transactionId,
                last_renewal_asmachta: asmachta,
                last_renewal_date: paymentDate || new Date().toISOString(),
                recurring_debit_id: recurringDebitId,
              }),
            ]
          );

          await client.query(
            `UPDATE users SET is_premium = true, updated_at = NOW() WHERE id = $1`,
            [sub.user_id]
          );

          await client.query("COMMIT");
          console.log(`[Grow Webhook] Recurring renewal for sub ${sub.id}, user ${sub.user_id}, extended to ${newExpiry.toISOString()}`);

          try { await approveTransaction(data, true); } catch {}
          return NextResponse.json({ status: 1 });
        }

        // If no existing sub found, this is the initial recurring setup — fall through to normal flow
        await client.query("ROLLBACK");
        console.log(`[Grow Webhook] No existing recurring sub for directDebitId=${directDebitId}, treating as initial setup`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("[Grow Webhook] Recurring renewal error:", err);
      } finally {
        client.release();
      }
    }

    if (!customId) {
      console.error("[Grow Webhook] No cField1 in payload");
      return NextResponse.json({ status: 1 });
    }

    // Support both old ":" and new "_" separator
    const sep = customId.includes("_") ? "_" : ":";
    const parts = customId.split(sep);
    const planId = parts[0] || "";
    // UUID may be without hyphens — restore standard format for DB lookup
    const rawUid = parts[1] || "";
    const supabaseUid = rawUid.length === 32 && !rawUid.includes("-")
      ? `${rawUid.slice(0,8)}-${rawUid.slice(8,12)}-${rawUid.slice(12,16)}-${rawUid.slice(16,20)}-${rawUid.slice(20)}`
      : rawUid;
    const durationDays = parseInt(parts[2]) || 30;
    const couponId = parts[3] && parts[3] !== '0' ? parseInt(parts[3]) : null;
    const isRecurringFlag = parts[4] === "1";

    const isSuccess = paymentStatus === "1" || String(paymentStatus) === "1";

    if (isSuccess && pool) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Idempotency check — skip if this transaction already processed
        if (transactionId) {
          const existing = await client.query(
            `SELECT id FROM subscriptions WHERE payment_data->>'transaction_id' = $1`,
            [transactionId]
          );
          if (existing.rows.length > 0) {
            await client.query("ROLLBACK");
            console.log(`[Grow Webhook] Duplicate transaction ${transactionId}, skipping`);
            // Still approve
            try { await approveTransaction(data); } catch {}
            return NextResponse.json({ status: 1 });
          }
        }

        // Get internal user ID (with fallback creation for web signups)
        let userResult = await client.query(
          `SELECT id FROM users WHERE supabase_uid = $1`,
          [supabaseUid]
        );

        if (userResult.rows.length === 0) {
          // Fallback: create users row if it wasn't created in the create route
          console.log(`[Grow Webhook] User not found for ${supabaseUid}, creating...`);
          await client.query(
            `INSERT INTO users (supabase_uid, first_name, username, is_premium, is_admin, is_blocked, created_at, updated_at)
             VALUES ($1, $2, $3, false, false, false, NOW(), NOW())
             ON CONFLICT (supabase_uid) DO NOTHING`,
            [supabaseUid, fullName || "", payerEmail || ""]
          );
          userResult = await client.query(
            `SELECT id FROM users WHERE supabase_uid = $1`,
            [supabaseUid]
          );
        }

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + durationDays);

          // Deactivate existing active subscriptions
          await client.query(
            `UPDATE subscriptions SET is_active = false WHERE user_id = $1 AND is_active = true`,
            [userId]
          );

          // Create new subscription
          await client.query(
            `INSERT INTO subscriptions (user_id, plan_type, price_paid, starts_at, expires_at, is_active, payment_method, is_recurring, payment_data)
             VALUES ($1, $2, $3, NOW(), $4, true, 'grow', $5, $6)`,
            [
              userId,
              planId,
              parseFloat(sum) || 0,
              expiresAt.toISOString(),
              isRecurringFlag || isRecurringPayment,
              JSON.stringify({
                transaction_id: transactionId,
                transaction_token: transactionToken,
                process_id: processId,
                process_token: processToken,
                asmachta,
                card_suffix: cardSuffix,
                card_type: cardType,
                card_brand: cardBrand,
                payment_date: paymentDate,
                customer_name: fullName,
                customer_phone: payerPhone,
                customer_email: payerEmail,
                ...(directDebitId ? { direct_debit_id: directDebitId } : {}),
                ...(recurringDebitId ? { recurring_debit_id: recurringDebitId } : {}),
              }),
            ]
          );

          // Mark user as premium
          await client.query(
            `UPDATE users SET is_premium = true, updated_at = NOW() WHERE id = $1`,
            [userId]
          );

          // Increment coupon uses now that payment is confirmed
          if (couponId) {
            await client.query(
              `UPDATE coupons SET current_uses = current_uses + 1 WHERE id = $1`,
              [couponId]
            );
            console.log(`[Grow Webhook] Incremented coupon ${couponId} uses`);
          }

          await client.query("COMMIT");
          console.log(`[Grow Webhook] Payment successful for user ${supabaseUid}, plan ${planId}, tx ${transactionId}`);
        } else {
          await client.query("ROLLBACK");
          console.error(`[Grow Webhook] User could not be created: ${supabaseUid}`);
        }
      } catch (dbErr) {
        await client.query("ROLLBACK");
        console.error("[Grow Webhook] DB error:", dbErr);
      } finally {
        client.release();
      }

      // Approve transaction (required by Grow)
      try {
        await approveTransaction(data, isRecurringFlag || isRecurringPayment);
        console.log(`[Grow Webhook] Transaction ${transactionId} approved`);
      } catch (approveErr) {
        console.error("[Grow Webhook] Approve error:", approveErr);
      }
    } else if (!isSuccess) {
      console.log(`[Grow Webhook] Payment not successful for ${customId}: status=${paymentStatus}`);
    }

    return NextResponse.json({ status: 1 });
  } catch (error) {
    console.error("[Grow Webhook] Error:", error);
    return NextResponse.json({ status: 0 }, { status: 500 });
  }
}

async function approveTransaction(webhookData: Record<string, string>, isRecurring: boolean = false) {
  const pageCode = isRecurring && MESHULAM_RECURRING_PAGE_CODE ? MESHULAM_RECURRING_PAGE_CODE : MESHULAM_PAGE_CODE;
  const userId = isRecurring ? MESHULAM_RECURRING_USER_ID : MESHULAM_USER_ID;
  const apiUrl = isRecurring ? MESHULAM_RECURRING_API_URL : MESHULAM_API_URL;
  const formData = new FormData();
  formData.append("pageCode", pageCode);
  formData.append("userId", userId);
  formData.append("transactionId", webhookData.transactionId || "");
  formData.append("transactionToken", webhookData.transactionToken || "");
  formData.append("transactionTypeId", webhookData.TransactionTypeId || webhookData.transactionTypeId || "1");
  // paymentType: 1 = Direct Debit (recurring), default from webhook otherwise
  formData.append("paymentType", isRecurring ? "1" : (webhookData.paymentType || "1"));
  formData.append("sum", webhookData.sum || "0");
  formData.append("firstPaymentSum", webhookData.firstPaymentSum || webhookData.sum || "0");
  formData.append("periodicalPaymentSum", webhookData.periodicalPaymentSum || "0");
  formData.append("paymentsNum", webhookData.paymentsNum || "1");
  formData.append("allPaymentsNum", webhookData.allPaymentsNum || webhookData.paymentsNum || "1");
  formData.append("paymentDate", webhookData.paymentDate || new Date().toLocaleDateString("en-GB").replace(/\//g, "/"));
  formData.append("asmachta", webhookData.asmachta || "");
  formData.append("description", webhookData.description || "הטיפ המנצח");
  formData.append("fullName", webhookData.fullName || "");
  formData.append("payerPhone", webhookData.payerPhone || "");
  formData.append("payerEmail", webhookData.payerEmail || "");
  formData.append("cardSuffix", webhookData.cardSuffix || "");
  formData.append("cardType", webhookData.cardType || "");
  formData.append("cardTypeCode", webhookData.cardTypeCode || "1");
  formData.append("cardBrand", webhookData.cardBrand || "");
  formData.append("cardBrandCode", webhookData.cardBrandCode || "3");
  formData.append("cardExp", webhookData.cardExp || "");
  formData.append("processId", webhookData.processId || "");
  formData.append("processToken", webhookData.processToken || "");

  const response = await fetch(`${apiUrl}/approveTransaction`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  console.log("[Grow Webhook] approveTransaction response:", JSON.stringify(result));

  if (result.status !== 1 && result.status !== "1") {
    throw new Error(`Approve failed: ${JSON.stringify(result)}`);
  }

  return result;
}
