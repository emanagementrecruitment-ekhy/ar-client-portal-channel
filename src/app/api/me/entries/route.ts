import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/client-session";
import { apiError } from "@/lib/api-error";

function monthOf(raw: string | null): string {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) return raw;
  return new Date().toISOString().slice(0, 7);
}

// Read-only, scoped to the logged-in Client's own rows only.
export async function GET(req: Request) {
  try {
    const session = await requireClientSession();
    const { searchParams } = new URL(req.url);
    const month = monthOf(searchParams.get("month"));

    const rows = await prisma.clientEntry.findMany({
      where: { clientId: session.clientId, month },
      orderBy: { createdAt: "asc" },
    });

    const totalVcr = rows.reduce((s, r) => s + r.vcr, 0);
    const totalJumlah = rows.reduce((s, r) => s + r.vcr * r.fee, 0);
    const totalPotongan = rows.reduce((s, r) => s + r.potongan, 0);

    return NextResponse.json({
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
