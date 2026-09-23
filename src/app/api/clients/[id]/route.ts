import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { CLIENT_STATUSES, type ClientStatus } from "@/lib/constants";
import { normalizeIdentifier } from "@/lib/lookup";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const client = await prisma.clientAccount.findUnique({ where: { id } });
    if (!client) return NextResponse.json({ error: "Client/channel tidak ditemukan." }, { status: 404 });
    return NextResponse.json({
      client: {
        id: client.id,
        code: client.code,
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        createdAt: client.createdAt,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await prisma.clientAccount.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Client/channel tidak ditemukan." }, { status: 404 });

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : existing.name;
    const emailRaw = typeof body?.email === "string" ? body.email.trim() : existing.email;
    const phoneRaw = typeof body?.phone === "string" ? body.phone.trim() : existing.phone;
    const status = (body?.status as ClientStatus) ?? existing.status;

    if (!name) return NextResponse.json({ error: "Nama client/channel wajib diisi." }, { status: 400 });
    if (!CLIENT_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
    }

    const email = normalizeIdentifier(emailRaw);
    if (email.kind !== "email" || !email.value.includes(".")) {
      return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
    }
    const phone = normalizeIdentifier(phoneRaw);
    if (phone.kind !== "phone" || phone.value.length < 9) {
      return NextResponse.json({ error: "Nomor HP tidak valid." }, { status: 400 });
    }

    if (email.value !== existing.email) {
      const emailTaken = await prisma.clientAccount.findUnique({ where: { email: email.value } });
      if (emailTaken) return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }
    if (phone.value !== existing.phone) {
      const phoneTaken = await prisma.clientAccount.findUnique({ where: { phone: phone.value } });
      if (phoneTaken) return NextResponse.json({ error: "Nomor HP sudah terdaftar." }, { status: 409 });
    }

    await prisma.clientAccount.update({ where: { id }, data: { name, email: email.value, phone: phone.value, status } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await prisma.clientAccount.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Client/channel tidak ditemukan." }, { status: 404 });

    await prisma.clientAccount.delete({ where: { id } });
    return NextResponse.json({ ok: true, code: existing.code });
  } catch (e) {
    return apiError(e);
  }
}
