import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeIdentifier } from "@/lib/lookup";
import { issueClientOtp } from "@/lib/otp";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { DEMO_CLIENT_CODE } from "@/lib/constants";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const identifier = typeof body?.identifier === "string" ? body.identifier : "";

  if (!identifier.trim()) {
    return NextResponse.json({ error: "Masukkan email atau nomor HP terdaftar." }, { status: 400 });
  }

  const ip = clientIp(req);
  const norm = normalizeIdentifier(identifier);
  if (!rateLimit(`otp-req:ip:${ip}`, 20, 10 * 60_000) || !rateLimit(`otp-req:id:${norm.value}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan kode. Coba lagi beberapa menit lagi." }, { status: 429 });
  }

  if (!norm.value) {
    return NextResponse.json({ error: "Akun tidak terdaftar." }, { status: 404 });
  }
  const client =
    norm.kind === "email"
      ? await prisma.clientAccount.findUnique({ where: { email: norm.value } })
      : await prisma.clientAccount.findUnique({ where: { phone: norm.value } });

  if (!client || client.status !== "AKTIF") {
    return NextResponse.json({ error: "Akun tidak terdaftar. Hubungi AR Corp untuk didaftarkan." }, { status: 404 });
  }

  const target = norm.kind === "email" ? client.email : client.phone;
  const isDemo = client.code === DEMO_CLIENT_CODE;
  const { devCode, delivered } = await issueClientOtp(client.id, target, norm.kind, isDemo);

  return NextResponse.json({ ok: true, maskedTarget: target, delivered, devCode, isDemo });
}
