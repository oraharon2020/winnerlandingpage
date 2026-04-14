import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const MESHULAM_API_URL = process.env.MESHULAM_API_URL || "https://secure.meshulam.co.il/api/light/server/1.0";
const MESHULAM_PAGE_CODE = process.env.MESHULAM_PAGE_CODE || "";
const MESHULAM_USER_ID = process.env.MESHULAM_USER_ID || "";

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
    } = data;

    // cField1 format: "planId:supabaseUid:durationDays"
    const customId = cField1;
    const paymentStatus = rawData.status || status;

    if (!customId) {
      console.error("[Grow Webhook] No cField1 in payload");
      return NextResponse.json({ status: 1 });
    }

    const parts = customId.split(":");
    const planId = parts[0] || "";
    const supabaseUid = parts[1] || "";
    const durationDays = parseInt(parts[2]) || 30;

    const isSuccess = paymentStatus === "1" || String(paymentStatus) === "1";

    if (isSuccess && pool) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Get internal user ID
        const userResult = await client.query(
          `SELECT id FROM users WHERE supabase_uid = $1`,
          [supabaseUid]
        );

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
             VALUES ($1, $2, $3, NOW(), $4, true, 'grow', false, $5)`,
            [
              userId,
              planId,
              parseFloat(sum) || 0,
              expiresAt.toISOString(),
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
              }),
            ]
          );

          // Mark user as premium
          await client.query(
            `UPDATE users SET is_premium = true, updated_at = NOW() WHERE id = $1`,
            [userId]
          );

          await client.query("COMMIT");
          console.log(`[Grow Webhook] Payment successful for user ${supabaseUid}, plan ${planId}, tx ${transactionId}`);
        } else {
          await client.query("ROLLBACK");
          console.error(`[Grow Webhook] User not found: ${supabaseUid}`);
        }
      } catch (dbErr) {
        await client.query("ROLLBACK");
        console.error("[Grow Webhook] DB error:", dbErr);
      } finally {
        client.release();
      }

      // Approve transaction (required by Grow)
      try {
        await approveTransaction(data);
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
    return NextResponse.json({ status: 1 });
  }
}

async function approveTransaction(webhookData: Record<string, string>) {
  const formData = new FormData();
  formData.append("pageCode", MESHULAM_PAGE_CODE);
  formData.append("userId", MESHULAM_USER_ID);
  formData.append("transactionId", webhookData.transactionId || "");
  formData.append("transactionToken", webhookData.transactionToken || "");
  formData.append("transactionTypeId", webhookData.TransactionTypeId || webhookData.transactionTypeId || "1");
  formData.append("paymentType", webhookData.paymentType || "1");
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

  const response = await fetch(`${MESHULAM_API_URL}/approveTransaction`, {
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
