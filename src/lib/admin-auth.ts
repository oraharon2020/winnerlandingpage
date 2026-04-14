import { cookies } from "next/headers";

/**
 * Verify the admin_token cookie matches the expected admin password.
 * Returns true if authenticated, false otherwise.
 */
export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  const expected = process.env.ADMIN_PASSWORD || "winner2026";
  try {
    return Buffer.from(token, "base64").toString() === expected;
  } catch {
    return false;
  }
}
