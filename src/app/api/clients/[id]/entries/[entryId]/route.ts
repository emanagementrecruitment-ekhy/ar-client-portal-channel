import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { CLIENT_FEE_TIERS } from "@/lib/constants";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; entryId: string }> }) {
  try {
    await requireAdmin();
    const { id, entryId } = await params;

    const existing = await prisma.clientEntry.findUnique({ where: { id: entryId } });
    if (!existing || existing.clientId !== id) {
      return NextResponse.json({ error: "Baris tidak ditemukan." }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const nama = typeof body?.nama === "string" ? body.nama.trim() : existing.nama;
    const outlet = typeof body?.outlet === "string" ? body.outlet.trim() : existing.outlet;
    const vcr = body?.vcr !== undefined ? Number(body.vcr) : existing.vcr;
    const fee = body?.fee !== undefined ? Number(body.fee) : existing.fee;
    const potongan = body?.potongan !== undefined ? Number(body.potongan) : existing.potongan;
    const keterangan = typeof body?.keterangan === "string" ? body.keterangan.trim() : existing.keterangan;

    if (!nama) return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
    if (!outlet) return NextResponse.json({ error: "Outlet wajib dipilih." }, { status: 400 });
    if (!Number.isFinite(vcr) || vcr <= 0) return NextResponse.json({ error: "Jumlah VCR wajib diisi." }, { status: 400 });
    if (!CLIENT_FEE_TIERS.includes(fee)) return NextResponse.json({ error: "Fee tidak valid." }, { status: 400 });
    if (potongan < 0) return NextResponse.json({ error: "Potongan/Kasbon tidak boleh negatif." }, { status: 400 });

    await prisma.clientEntry.update({
      where: { id: entryId },
      data: {
        nama,
        outlet,
        vcr: Math.round(vcr),
        fee: Math.round(fee),
        potongan: Math.round(potongan),
        keterangan: keterangan || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; entryId: string }> }) {
  try {
    await requireAdmin();
    const { id, entryId } = await params;

    const existing = await prisma.clientEntry.findUnique({ where: { id: entryId } });
    if (!existing || existing.clientId !== id) {
      return NextResponse.json({ error: "Baris tidak ditemukan." }, { status: 404 });
    }

    await prisma.clientEntry.delete({ where: { id: entryId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
