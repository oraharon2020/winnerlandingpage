import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware to protect /admin routes with a simple password cookie
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (not /admin/login itself)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("admin_token")?.value;
    const expected = process.env.ADMIN_PASSWORD || "winner2026";

    // Simple token check: token = base64(password)
    if (!token || Buffer.from(token, "base64").toString() !== expected) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
