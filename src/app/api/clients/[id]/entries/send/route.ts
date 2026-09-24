import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { emailProviderConfigured, sendPdfEmail } from "@/lib/otp-providers";
import { generateLedgerPdf, ledgerPdfFilename } from "@/lib/ledger-pdf";
import { monthLabel } from "@/lib/format";

function monthOf(raw: unknown): string | null {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}$/.test(raw)) return null;
  return raw;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const month = monthOf(body?.month) ?? new Date().toISOString().slice(0, 7);

    const client = await prisma.clientAccount.findUnique({ where: { id } });
    if (!client) return NextResponse.json({ error: "Client/channel tidak ditemukan." }, { status: 404 });
    if (!emailProviderConfigured()) return NextResponse.json({ error: "Pengiriman email belum dikonfigurasi di server." }, { status: 400 });

    const rows = await prisma.clientEntry.findMany({ where: { clientId: id, month }, orderBy: { createdAt: "asc" } });
    const totalVcr = rows.reduce((s, r) => s + r.vcr, 0);
    const totalJumlah = rows.reduce((s, r) => s + r.vcr * r.fee, 0);
    const totalPotongan = rows.reduce((s, r) => s + r.potongan, 0);

    const pdfInput = {
      clientName: client.name,
      clientCode: client.code,
      month,
      entries: rows.map((r) => ({
        nama: r.nama,
        outlet: r.outlet,
        vcr: r.vcr,
        fee: r.fee,
        jumlah: r.vcr * r.fee,
        potongan: r.potongan,
        keterangan: r.keterangan,
      })),
      totals: { vcr: totalVcr, jumlah: totalJumlah, potongan: totalPotongan, grandTotal: totalJumlah - totalPotongan },
    };

    const pdf = await generateLedgerPdf(pdfInput);
    const filename = ledgerPdfFilename(pdfInput);
    await sendPdfEmail(
      client.email,
      `Ledger ${monthLabel(month)} - AR Corp Channel`,
      `Halo ${client.name}, berikut ledger Komisi Anda untuk ${monthLabel(month)}. Dokumen terlampir.`,
      pdf,
      filename
    );

    return NextResponse.json({ ok: true, sentTo: client.email });
  } catch (e) {
    return apiError(e);
  }
}
