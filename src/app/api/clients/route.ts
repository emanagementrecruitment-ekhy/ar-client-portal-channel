import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { normalizeIdentifier } from "@/lib/lookup";

async function nextClientCode() {
  const clients = await prisma.clientAccount.findMany({
    where: { code: { startsWith: "CH-" } },
    select: { code: true },
  });
  const max = clients.reduce((m, c) => {
    const n = Number(c.code.slice(3));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `CH-${String(max + 1).padStart(2, "0")}`;
}

export async function GET() {
  try {
    await requireAdmin();
    const clients = await prisma.clientAccount.findMany({ orderBy: { code: "asc" } });
    return NextResponse.json({
      clients: clients.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
        createdAt: c.createdAt,
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const emailRaw = typeof body?.email === "string" ? body.email.trim() : "";
    const phoneRaw = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!name) return NextResponse.json({ error: "Nama client/channel wajib diisi." }, { status: 400 });

    const email = normalizeIdentifier(emailRaw);
    if (email.kind !== "email" || !email.value.includes(".")) {
      return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
    }
    const phone = normalizeIdentifier(phoneRaw);
    if (phone.kind !== "phone" || phone.value.length < 9) {
      return NextResponse.json({ error: "Nomor HP tidak valid." }, { status: 400 });
    }

    const [emailTaken, phoneTaken] = await Promise.all([
      prisma.clientAccount.findUnique({ where: { email: email.value } }),
      prisma.clientAccount.findUnique({ where: { phone: phone.value } }),
    ]);
    if (emailTaken) return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    if (phoneTaken) return NextResponse.json({ error: "Nomor HP sudah terdaftar." }, { status: 409 });

    const code = await nextClientCode();
    const client = await prisma.clientAccount.create({ data: { code, name, email: email.value, phone: phone.value } });

    return NextResponse.json({ ok: true, id: client.id, code: client.code });
  } catch (e) {
    return apiError(e);
  }
}
