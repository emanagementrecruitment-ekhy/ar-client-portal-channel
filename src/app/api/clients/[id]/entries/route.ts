import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { CLIENT_FEE_TIERS } from "@/lib/constants";

function monthOf(raw: unknown): string | null {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}$/.test(raw)) return null;
  return raw;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const month = monthOf(searchParams.get("month")) ?? new Date().toISOString().slice(0, 7);

    const client = await prisma.clientAccount.findUnique({ where: { id } });
    if (!client) return NextResponse.json({ error: "Client/channel tidak ditemukan." }, { status: 404 });

    const rows = await prisma.clientEntry.findMany({ where: { clientId: id, month }, orderBy: { createdAt: "asc" } });

    const totalVcr = rows.reduce((s, r) => s + r.vcr, 0);
    const totalJumlah = rows.reduce((s, r) => s + r.vcr * r.fee, 0);
    const totalPotongan = rows.reduce((s, r) => s + r.potongan, 0);

    return NextResponse.json({
      client: { id: client.id, code: client.code, name: client.name },
      month,
      entries: rows.map((r) => ({
        id: r.id,
        nama: r.nama,
        outlet: r.outlet,
        vcr: r.vcr,
        fee: r.fee,
        jumlah: r.vcr * r.fee,
        potongan: r.potongan,
        keterangan: r.keterangan,
      })),
      totals: { vcr: totalVcr, jumlah: totalJumlah, potongan: totalPotongan, grandTotal: totalJumlah - totalPotongan },
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const client = await prisma.clientAccount.findUnique({ where: { id } });
    if (!client) return NextResponse.json({ error: "Client/channel tidak ditemukan." }, { status: 404 });

    const body = await req.json().catch(() => null);
    const month = monthOf(body?.month);
    const nama = typeof body?.nama === "string" ? body.nama.trim() : "";
    const outlet = typeof body?.outlet === "string" ? body.outlet.trim() : "";
    const vcr = Number(body?.vcr);
    const fee = Number(body?.fee);
    const potongan = Number(body?.potongan) || 0;
    const keterangan = typeof body?.keterangan === "string" ? body.keterangan.trim() : "";

    if (!month) return NextResponse.json({ error: "Periode tidak valid." }, { status: 400 });
    if (!nama) return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
    if (!outlet) return NextResponse.json({ error: "Outlet wajib dipilih." }, { status: 400 });
    if (!Number.isFinite(vcr) || vcr <= 0) return NextResponse.json({ error: "Jumlah VCR wajib diisi." }, { status: 400 });
    if (!CLIENT_FEE_TIERS.includes(fee)) return NextResponse.json({ error: "Fee tidak valid." }, { status: 400 });
    if (potongan < 0) return NextResponse.json({ error: "Potongan/Kasbon tidak boleh negatif." }, { status: 400 });

    const entry = await prisma.clientEntry.create({
      data: {
        clientId: id,
        month,
        nama,
        outlet,
        vcr: Math.round(vcr),
        fee: Math.round(fee),
        potongan: Math.round(potongan),
        keterangan: keterangan || null,
      },
    });

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (e) {
    return apiError(e);
  }
}
