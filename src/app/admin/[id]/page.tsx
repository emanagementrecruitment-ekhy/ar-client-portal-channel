"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CLIENT_OUTLETS, CLIENT_FEE_TIERS } from "@/lib/constants";
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

const emptyForm = { nama: "", outlet: "", vcr: "", fee: String(CLIENT_FEE_TIERS[0]), potongan: "", keterangan: "" };

export default function AdminClientLedgerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [clientName, setClientName] = useState("");
  const [clientCode, setClientCode] = useState("");
  const [month, setMonth] = useState(thisMonth());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [totals, setTotals] = useState<Totals>({ vcr: 0, jumlah: 0, potongan: 0, grandTotal: 0 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function load() {
    fetch(`/api/clients/${id}/entries?month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.client) {
          setClientName(d.client.name);
          setClientCode(d.client.code);
        }
        setEntries(d.entries ?? []);
        setTotals(d.totals ?? { vcr: 0, jumlah: 0, potongan: 0, grandTotal: 0 });
      });
  }

  useEffect(load, [id, month]);

  function startEdit(e: Entry) {
    setEditingId(e.id);
    setForm({
      nama: e.nama,
      outlet: e.outlet,
      vcr: String(e.vcr),
      fee: String(e.fee),
      potongan: e.potongan ? String(e.potongan) : "",
      keterangan: e.keterangan ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit() {
    setBusy(true);
    setMsg("");
    try {
      const body = {
        month,
        nama: form.nama,
        outlet: form.outlet,
        vcr: Number(form.vcr),
        fee: Number(form.fee),
        potongan: Number(form.potongan) || 0,
        keterangan: form.keterangan,
      };
      const res = await fetch(editingId ? `/api/clients/${id}/entries/${editingId}` : `/api/clients/${id}/entries`, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Gagal menyimpan.");
        return;
      }
      cancelEdit();
      load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(entryId: string) {
    if (!confirm("Hapus baris ini?")) return;
    const res = await fetch(`/api/clients/${id}/entries/${entryId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Gagal menghapus.");
      return;
    }
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="text-[22px] font-semibold leading-[1.1]">{clientName ? `Data Client — ${clientName}` : "Data Client"}</div>
          <div className="text-[11.5px] text-[var(--dim)] mt-1.5">{clientCode ? `Kode ${clientCode} · ledger VCR/Fee bulanan` : ""}</div>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
        />
      </div>

      <div className="pt-5.5 grid grid-cols-1 lg:[grid-template-columns:1fr_2fr] gap-4">
        <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl h-fit">
          <div className="text-[16px] font-semibold text-[var(--gold2)] mb-3.5">
            {editingId ? "Edit Baris" : "Tambah Baris"} — {monthLabel(month)}
          </div>
          <div className="grid gap-3.5">
            <div>
              <label className="text-[10px] tracking-[0.14em] uppercase text-[var(--dim)] mb-1.5 block">Nama</label>
              <input
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                className="w-full py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.14em] uppercase text-[var(--dim)] mb-1.5 block">Outlet</label>
              <select
                value={form.outlet}
                onChange={(e) => setForm((f) => ({ ...f, outlet: e.target.value }))}
                className="w-full py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
              >
                <option value="">Pilih outlet…</option>
                {form.outlet && !CLIENT_OUTLETS.includes(form.outlet as (typeof CLIENT_OUTLETS)[number]) && (
                  <option value={form.outlet}>{form.outlet} (lama)</option>
                )}
                {CLIENT_OUTLETS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] tracking-[0.14em] uppercase text-[var(--dim)] mb-1.5 block">Jumlah VCR</label>
                <input
                  type="number"
                  min={1}
                  value={form.vcr}
                  onChange={(e) => setForm((f) => ({ ...f, vcr: e.target.value }))}
                  className="w-full py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.14em] uppercase text-[var(--dim)] mb-1.5 block">Fee / VCR</label>
                <select
                  value={form.fee}
                  onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
                  className="w-full py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
                >
                  {CLIENT_FEE_TIERS.map((f) => (
                    <option key={f} value={f}>
                      {fmtRp(f)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="py-2.5 px-3.5 bg-[rgba(201,162,74,0.1)] border border-[var(--goldline)] rounded-[10px] text-[12.5px] text-[var(--gold2)]">
              {fmtRp(Number(form.fee) || 0)} × {Number(form.vcr) || 0} VCR = <strong>{fmtRp((Number(form.fee) || 0) * (Number(form.vcr) || 0))}</strong>
            </div>
            <div>
              <label className="text-[10px] tracking-[0.14em] uppercase text-[var(--dim)] mb-1.5 block">Potongan/Kasbon</label>
              <input
                type="number"
                min={0}
                value={form.potongan}
                onChange={(e) => setForm((f) => ({ ...f, potongan: e.target.value }))}
                placeholder="0"
                className="w-full py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.14em] uppercase text-[var(--dim)] mb-1.5 block">Keterangan</label>
              <input
                value={form.keterangan}
                onChange={(e) => setForm((f) => ({ ...f, keterangan: e.target.value }))}
                className="w-full py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
              />
            </div>
          </div>
          {msg && <div className="mt-3.5 text-[11.5px] text-[var(--red)]">{msg}</div>}
          <div className="flex gap-2.5 mt-3.5">
            <button
              disabled={busy || !form.nama || !form.outlet || !form.vcr}
              onClick={submit}
              className="py-2.5 px-5 rounded-[10px] text-[11px] font-bold tracking-[0.14em] uppercase cursor-pointer disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))", color: "#1a1200" }}
            >
              {editingId ? "Simpan Perubahan" : "Tambah Baris"}
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="py-2.5 px-5 bg-[var(--surface2)] border border-[var(--line)] rounded-[10px] text-[var(--dim)] text-[11px] font-bold tracking-[0.14em] uppercase cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>
        </div>

        <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl h-fit overflow-x-auto">
          <div className="text-[19px] font-semibold text-[var(--gold2)] mb-4">Ledger {monthLabel(month)}</div>
          <table className="w-full text-[14px] border-collapse min-w-[860px]">
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
                <th className="py-3 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-5 text-[var(--faint)]">
                    Belum ada data bulan ini.
                  </td>
                </tr>
              )}
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
                  <td className="py-3 pr-3 whitespace-nowrap">
                    <button onClick={() => startEdit(e)} className="text-[var(--gold)] text-[13px] mr-3 cursor-pointer">
                      Edit
                    </button>
                    <button onClick={() => remove(e.id)} className="text-[var(--red)] text-[13px] cursor-pointer">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr className="border-t border-[var(--goldline)] font-semibold">
                  <td className="py-3.5 pr-3" colSpan={3}>
                    TOTAL
                  </td>
                  <td className="py-3.5 pr-3 text-right">{totals.vcr}</td>
                  <td className="py-3.5 pr-3"></td>
                  <td className="py-3.5 pr-3 text-right text-[var(--gold2)]">{fmtRp(totals.jumlah)}</td>
                  <td className="py-3.5 pr-3 text-right text-[var(--red)]">{fmtRp(totals.potongan)}</td>
                  <td colSpan={2}></td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-3 text-[var(--gold)] uppercase text-[12px] tracking-[0.14em]" colSpan={5}>
                    Grand Total
                  </td>
                  <td className="py-3.5 pr-3 text-right text-[var(--gold2)] font-semibold text-[20px]" colSpan={4}>
                    {fmtRp(totals.grandTotal)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
