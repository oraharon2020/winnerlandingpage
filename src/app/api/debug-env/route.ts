import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const secret = process.env.PAYPAL_SECRET || "";
  const mode = process.env.PAYPAL_MODE || "";
  const publicId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return NextResponse.json({
    PAYPAL_MODE: mode,
    PAYPAL_CLIENT_ID_length: clientId.length,
    PAYPAL_CLIENT_ID_start: clientId.substring(0, 8),
    PAYPAL_CLIENT_ID_end: clientId.substring(clientId.length - 6),
    PAYPAL_SECRET_length: secret.length,
    PAYPAL_SECRET_start: secret.substring(0, 8),
    PAYPAL_SECRET_end: secret.substring(secret.length - 6),
    NEXT_PUBLIC_length: publicId.length,
    hasWhitespace: clientId !== clientId.trim() || secret !== secret.trim(),
  });
}
