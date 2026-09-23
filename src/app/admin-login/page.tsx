"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
        <div className="flex flex-col items-center gap-2.5 mb-5 text-center">
          <Image
            src="/ar-corp-logo.png"
            alt="AR Corp"
            width={64}
            height={64}
            unoptimized
            className="rounded-full object-contain bg-[var(--bg)] border border-[var(--goldline)]"
          />
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-[var(--gold)]">AR Corp Channel</div>
            <div className="text-[20px] font-semibold mt-0.5">Admin — Masuk</div>
          </div>
        </div>
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

        <div className="mt-5 flex flex-wrap gap-2 justify-center">
          <a
            href="/downloads/client-portal.apk"
            download
            className="text-[9.5px] tracking-[0.12em] uppercase text-[var(--gold)] border border-[var(--goldline)] rounded-full px-3.5 py-1.5 hover:bg-[rgba(201,162,74,0.1)] transition"
          >
            ⬇ APK Android
          </a>
          <a
            href="https://github.com/emanagementrecruitment-ekhy/ar-client-portal-channel/releases/latest/download/AR-Corp-Channel-Desktop-Setup.exe"
            className="text-[9.5px] tracking-[0.12em] uppercase text-[var(--gold)] border border-[var(--goldline)] rounded-full px-3.5 py-1.5 hover:bg-[rgba(201,162,74,0.1)] transition"
          >
            ⬇ Desktop (Windows)
          </a>
        </div>
      </div>
    </div>
  );
}
