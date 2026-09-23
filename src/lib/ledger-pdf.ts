import "server-only";
import path from "node:path";
import PDFDocument from "pdfkit";
import { fmtRp, monthLabel } from "./format";

export interface LedgerEntry {
  nama: string;
  outlet: string;
  vcr: number;
  fee: number;
  jumlah: number;
  potongan: number;
  keterangan: string | null;
}

export interface LedgerTotals {
  vcr: number;
  jumlah: number;
  potongan: number;
  grandTotal: number;
}

export interface LedgerPdfInput {
  clientName: string;
  clientCode: string;
  month: string;
  entries: LedgerEntry[];
  totals: LedgerTotals;
}

const LOGO_PATH = path.join(process.cwd(), "public", "ar-corp-logo.png");

export function ledgerPdfFilename(input: LedgerPdfInput): string {
  const safeName = input.clientName.replace(/[\\/:*?"<>|]/g, "").trim();
  return `Ledger ${monthLabel(input.month)} - ${safeName}.pdf`;
}

/** Renders a Client/Channel ledger as a one-page A4 PDF, server-side — the
 * "Kirim PDF ke Email" counterpart to the browser's own Print button. A
 * faint centered watermark of the AR Corp logo is drawn first (low opacity,
 * behind every other element) so a printed/forwarded copy is still
 * recognizably an official AR Corp document. */
export function generateLedgerPdf(input: LedgerPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      const pageW = doc.page.width;
      const pageH = doc.page.height;
      const size = 320;
      doc.opacity(0.06);
      doc.image(LOGO_PATH, (pageW - size) / 2, (pageH - size) / 2, { width: size, height: size });
      doc.opacity(1);
    } catch {
      // Watermark is decorative — a missing/unreadable logo file must never
      // block the actual ledger PDF from being generated and sent.
    }

    doc.fontSize(9).fillColor("#8a6d1f").font("Helvetica-Bold").text("AR CORP CHANNEL", { characterSpacing: 2 });
    doc.moveDown(0.2);
    doc.fontSize(20).fillColor("#111111").font("Helvetica-Bold").text("Ledger VCR / Fee");
    doc.moveDown(0.8);

    doc.fontSize(10).font("Helvetica").fillColor("#111111");
    doc.text(`Client/Channel: ${input.clientName}`);
    doc.text(`Kode: ${input.clientCode}`);
    doc.text(`Periode: ${monthLabel(input.month)}`);
    doc.moveDown(0.8);

    const colX = [48, 78, 240, 300, 360, 430, 500];
    const colW = [28, 155, 55, 55, 65, 65, 47];
    const headers = ["No", "Nama", "Outlet", "VCR", "Fee", "Jumlah", "Potongan"];

    function drawRow(cells: string[], opts: { bold?: boolean; color?: string } = {}) {
      const y = doc.y;
      doc.fontSize(8).font(opts.bold ? "Helvetica-Bold" : "Helvetica").fillColor(opts.color ?? "#111111");
      cells.forEach((cell, i) => {
        doc.text(cell, colX[i], y, { width: colW[i], align: i >= 3 ? "right" : "left" });
      });
      doc.moveDown(0.6);
    }

    drawRow(headers, { bold: true, color: "#555555" });
    doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.3);

    if (input.entries.length === 0) {
      doc.fontSize(9).fillColor("#888888").text("Belum ada data bulan ini.", 48);
      doc.moveDown(0.5);
    }
    input.entries.forEach((e, i) => {
      drawRow([String(i + 1), e.nama, e.outlet, String(e.vcr), fmtRp(e.fee), fmtRp(e.jumlah), e.potongan ? fmtRp(e.potongan) : "—"]);
    });

    doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor("#8a6d1f").stroke();
    doc.moveDown(0.4);
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#8a6d1f").text("GRAND TOTAL", 48, doc.y, { continued: true, width: 300 });
    doc.fontSize(14).fillColor("#111111").text(fmtRp(input.totals.grandTotal), { align: "right" });

    doc.end();
  });
}
