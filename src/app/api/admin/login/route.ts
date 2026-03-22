import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const expected = process.env.ADMIN_PASSWORD || "winner2026";

  if (password !== expected) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }

  // Set cookie with base64 encoded password
  const token = Buffer.from(password).toString("base64");
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
