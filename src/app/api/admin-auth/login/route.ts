import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Single shared password, no per-account lockout of its own — an IP-based
  // cap is what actually stands between it and being brute-forced.
  if (!rateLimit(`admin-login:ip:${clientIp(req)}`, 10, 10 * 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  const expected = process.env.CLIENT_PORTAL_ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "CLIENT_PORTAL_ADMIN_PASSWORD belum diset di server." }, { status: 500 });
  }
  if (password !== expected) {
    return NextResponse.json({ error: "Password salah." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
