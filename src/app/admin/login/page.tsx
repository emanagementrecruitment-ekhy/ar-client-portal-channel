"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal login.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-[360px] bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-7">
        <div className="text-[11px] tracking-[0.3em] uppercase text-[var(--gold)] mb-1">AR Corp Channel</div>
        <div className="text-[20px] font-semibold mb-5">Admin — Masuk</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Password admin"
          className="w-full py-3 px-4 bg-black/40 border border-[var(--line)] rounded-[10px] text-[13px] mb-3"
        />
        {error && <div className="text-[12px] text-[var(--red)] mb-3">{error}</div>}
        <button
          disabled={busy || !password}
          onClick={submit}
          className="w-full py-3 rounded-[10px] font-bold text-[12px] tracking-[0.14em] uppercase cursor-pointer disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))", color: "#1a1200" }}
        >
          {busy ? "Memeriksa…" : "Masuk"}
        </button>
      </div>
    </div>
  );
}
