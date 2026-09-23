"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "id" | "otp" | "gps";
interface GpsStep {
  label: string;
  value: string;
}

export default function ClientLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("id");
  const [loginId, setLoginId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [delivered, setDelivered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gpsSteps, setGpsSteps] = useState<GpsStep[]>([]);
  const [gpsReady, setGpsReady] = useState(false);

  async function sendOtp() {
    if (!loginId.trim()) {
      setError("Masukkan email atau nomor HP terdaftar.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/client-auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim kode.");
        return;
      }
      setDevCode(data.devCode ?? null);
      setDelivered(Boolean(data.delivered));
      setOtp("");
      setStep("otp");
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi internet dan coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    if (otp.length < 6) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/client-auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginId, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kode salah.");
        return;
      }
      beginLocation();
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi internet dan coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  function beginLocation() {
    setStep("gps");
    setGpsSteps([
      { label: "Perangkat", value: navigator.userAgent.includes("Mobile") ? "Mobile · AR Corp Channel 1.0" : "Desktop · AR Corp Channel 1.0" },
      { label: "Koordinat", value: "Mencari lokasi…" },
      { label: "Notifikasi ke AR Corp", value: "Menunggu…" },
    ]);

    const finish = (lat?: number, lng?: number) =>
      fetch("/api/client-auth/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      })
        .then((r) => r.json())
        .then((data) => {
          setGpsSteps([
            { label: "Perangkat", value: navigator.userAgent.includes("Mobile") ? "Mobile · AR Corp Channel 1.0" : "Desktop · AR Corp Channel 1.0" },
            { label: "Koordinat", value: Number.isFinite(data.lat) ? `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}` : "—" },
            { label: "Notifikasi ke AR Corp", value: `Terkirim ${new Date(data.at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` },
          ]);
          setGpsReady(true);
        });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => finish(p.coords.latitude, p.coords.longitude),
        () => finish(undefined, undefined),
        { timeout: 6000 }
      );
    } else {
      finish(undefined, undefined);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-5 sm:p-10">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <div className="text-[11px] tracking-[0.32em] uppercase text-[var(--gold)] font-semibold">AR CORP</div>
          <div className="text-[22px] font-semibold mt-1">Channel Portal</div>
          <div className="text-[11px] text-[var(--dim)] mt-1">Pantau data VCR/Fee talent Anda</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6">
          {step === "id" && (
            <div>
              <label className="text-[10px] tracking-[0.14em] uppercase text-[var(--dim)] mb-1.5 block">Email atau Nomor HP</label>
              <input
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                placeholder="email@contoh.com atau 08xxxxxxxxxx"
                className="w-full py-3 px-4 bg-black/30 border border-[var(--line)] rounded-[10px] text-[13px] mb-3"
              />
              {error && <div className="text-[12px] text-[var(--red)] mb-3">{error}</div>}
              <button
                disabled={busy}
                onClick={sendOtp}
                className="w-full py-3 rounded-[10px] font-bold text-[12px] tracking-[0.14em] uppercase cursor-pointer disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))", color: "#1a1200" }}
              >
                Kirim Kode Verifikasi
              </button>
            </div>
          )}

          {step === "otp" && (
            <div>
              <div className="text-[12.5px] text-[var(--dim)] mb-4">
                Kode 6 angka dikirim ke <span className="text-[var(--gold)]">{loginId}</span>
              </div>
              {devCode && (
                <div className="mb-3 py-2 px-3 rounded-lg border border-[var(--goldline)] bg-[rgba(201,162,74,0.1)] text-[var(--gold2)] text-[12px] text-center tracking-[0.1em]">
                  Mode pengembangan — kode Anda: <strong>{devCode}</strong>
                </div>
              )}
              {delivered && (
                <div className="mb-3 py-2 px-3 rounded-lg border border-[rgba(74,222,128,.3)] bg-[rgba(74,222,128,.1)] text-[var(--green)] text-[12px] text-center">
                  Kode terkirim ke {loginId.includes("@") ? "email" : "nomor HP"} Anda.
                </div>
              )}
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                placeholder="••••••"
                className="w-full py-3 bg-black/30 border border-[var(--line)] rounded-[10px] text-[20px] tracking-[0.5em] text-center mb-3"
              />
              {error && <div className="text-[12px] text-[var(--red)] mb-3">{error}</div>}
              <button
                disabled={busy || otp.length < 6}
                onClick={verifyOtp}
                className="w-full py-3 rounded-[10px] font-bold text-[12px] tracking-[0.14em] uppercase cursor-pointer disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))", color: "#1a1200" }}
              >
                Verifikasi &amp; Masuk
              </button>
              <button
                onClick={() => {
                  setStep("id");
                  setOtp("");
                  setError("");
                }}
                className="w-full mt-2 py-2 bg-transparent text-[var(--dim)] text-[11.5px] cursor-pointer"
              >
                Ganti email / nomor
              </button>
            </div>
          )}

          {step === "gps" && (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                <span className="text-[11px] tracking-[0.1em] uppercase text-[var(--gold)]">Mencatat lokasi login</span>
              </div>
              <div className="flex flex-col gap-2">
                {gpsSteps.map((s) => (
                  <div key={s.label} className="flex justify-between gap-3 py-2.5 px-3 bg-[var(--surface2)] border border-[var(--line)] rounded-[10px] text-[12px]">
                    <span className="text-[var(--dim)]">{s.label}</span>
                    <span className="text-[var(--gold)] text-right">{s.value}</span>
                  </div>
                ))}
              </div>
              <button
                disabled={!gpsReady}
                onClick={() => router.push("/dashboard")}
                className="w-full mt-4 py-3 rounded-[10px] font-bold text-[12px] tracking-[0.14em] uppercase cursor-pointer disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))", color: "#1a1200" }}
              >
                Masuk ke Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
