"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fmtRp, monthLabel } from "@/lib/format";

interface Entry {
  id: string;
  nama: string;
  outlet: string;
  vcr: number;
  fee: number;
  jumlah: number;
  potongan: number;
  keterangan: string | null;
}

interface Totals {
  vcr: number;
  jumlah: number;
  potongan: number;
  grandTotal: number;
}

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function DashboardClient({ name, code }: { name: string; code: string }) {
  const router = useRouter();
  const [month, setMonth] = useState(thisMonth());
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [totals, setTotals] = useState<Totals>({ vcr: 0, jumlah: 0, potongan: 0, grandTotal: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/me/entries?month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries ?? []);
        setTotals(d.totals ?? { vcr: 0, jumlah: 0, potongan: 0, grandTotal: 0 });
      });
  }, [month]);

  async function logout() {
    setBusy(true);
    await fetch("/api/client-auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen p-5 sm:p-8 max-w-[980px] mx-auto">
      <div className="fixed inset-0 -z-10 flex items-center justify-center pointer-events-none select-none">
        <Image src="/ar-corp-logo.png" alt="" width={520} height={520} unoptimized className="object-contain opacity-[0.04]" />
      </div>
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="text-[13px] text-[var(--gold2)]">{name}</div>
          <div className="text-[9.5px] tracking-[0.14em] uppercase text-[var(--dim)]">Client/Channel · {code}</div>
        </div>
        <button
          onClick={logout}
          disabled={busy}
          className="py-2 px-3.5 bg-transparent border border-[var(--line)] rounded-[9px] text-[var(--dim)] text-[10.5px] cursor-pointer"
        >
          Keluar
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 pt-5 pb-4">
        <div>
          <div className="text-[22px] font-semibold leading-[1.1]">Data VCR / Fee</div>
          <div className="text-[11.5px] text-[var(--dim)] mt-1.5">Ringkasan pendapatan talent Anda per periode.</div>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
        />
      </div>

      {entries === null && <div className="text-[12.5px] text-[var(--faint)]">Memuat…</div>}
      {entries !== null && entries.length === 0 && (
        <div className="text-[12.5px] text-[var(--faint)] py-4">Belum ada data untuk {monthLabel(month)}.</div>
      )}
      {entries !== null && entries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] border-collapse min-w-[760px]">
            <thead>
              <tr className="text-left text-[var(--dim)] uppercase text-[11.5px] tracking-[0.1em] border-b border-[var(--line)]">
                <th className="py-3 pr-3">No</th>
                <th className="py-3 pr-3">Nama</th>
                <th className="py-3 pr-3">Outlet</th>
                <th className="py-3 pr-3 text-right">VCR</th>
                <th className="py-3 pr-3 text-right">Fee</th>
                <th className="py-3 pr-3 text-right">Jumlah</th>
                <th className="py-3 pr-3 text-right">Potongan/Kasbon</th>
                <th className="py-3 pr-3">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.id} className="border-b border-[var(--line)]/60">
                  <td className="py-3 pr-3 text-[var(--dim)]">{i + 1}</td>
                  <td className="py-3 pr-3">{e.nama}</td>
                  <td className="py-3 pr-3 text-[var(--dim)]">{e.outlet}</td>
                  <td className="py-3 pr-3 text-right">{e.vcr}</td>
                  <td className="py-3 pr-3 text-right">{fmtRp(e.fee)}</td>
                  <td className="py-3 pr-3 text-right text-[var(--gold2)]">{fmtRp(e.jumlah)}</td>
                  <td className="py-3 pr-3 text-right text-[var(--red)]">{e.potongan ? fmtRp(e.potongan) : "—"}</td>
                  <td className="py-3 pr-3 text-[var(--dim)]">{e.keterangan || "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--goldline)] font-semibold">
                <td className="py-3.5 pr-3" colSpan={3}>
                  TOTAL
                </td>
                <td className="py-3.5 pr-3 text-right">{totals.vcr}</td>
                <td className="py-3.5 pr-3"></td>
                <td className="py-3.5 pr-3 text-right text-[var(--gold2)]">{fmtRp(totals.jumlah)}</td>
                <td className="py-3.5 pr-3 text-right text-[var(--red)]">{fmtRp(totals.potongan)}</td>
                <td></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-3 text-[var(--gold)] uppercase text-[12px] tracking-[0.14em]" colSpan={5}>
                  Grand Total
                </td>
                <td className="py-3.5 pr-3 text-right text-[var(--gold2)] font-semibold text-[20px]" colSpan={3}>
                  {fmtRp(totals.grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
