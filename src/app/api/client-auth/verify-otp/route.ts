import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeIdentifier } from "@/lib/lookup";
import { verifyClientOtp } from "@/lib/otp";
import { createClientSession } from "@/lib/client-session";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const REASON_MESSAGE: Record<string, string> = {
  not_found: "Kode belum diminta atau sudah kedaluwarsa. Kirim ulang kode.",
  expired: "Kode sudah kedaluwarsa. Kirim ulang kode.",
  too_many_attempts: "Terlalu banyak percobaan. Kirim ulang kode.",
  mismatch: "Kode salah. Coba lagi.",
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const identifier = typeof body?.identifier === "string" ? body.identifier : "";
  const code = typeof body?.code === "string" ? body.code : "";

  if (!rateLimit(`otp-verify:ip:${clientIp(req)}`, 30, 10 * 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." }, { status: 429 });
  }

  const norm = normalizeIdentifier(identifier);
  const client = norm.value
    ? norm.kind === "email"
      ? await prisma.clientAccount.findUnique({ where: { email: norm.value } })
      : await prisma.clientAccount.findUnique({ where: { phone: norm.value } })
    : null;
  if (!client || client.status !== "AKTIF") {
    return NextResponse.json({ error: "Akun tidak terdaftar." }, { status: 404 });
  }

  const result = await verifyClientOtp(client.id, code);
  if (!result.ok) {
    return NextResponse.json({ error: REASON_MESSAGE[result.reason] }, { status: 400 });
  }

  await createClientSession({ clientId: client.id, name: client.name, code: client.code });
  return NextResponse.json({ ok: true });
}
