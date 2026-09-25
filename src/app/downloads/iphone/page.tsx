import Image from "next/image";

// iOS has no APK installer at all (different OS, different binary format) —
// this page is the real substitute: AR Corp Channel is already a PWA (see
// src/app/manifest.ts + the appleWebApp meta tags in layout.tsx), so
// Safari's own "Add to Home Screen" gives an iPhone user a real app icon,
// full-screen launch, and offline-friendly shell without the App Store, an
// Apple Developer account, or a Mac to build/sign anything.
const STEPS = [
  {
    title: "Buka di Safari",
    body: "Halaman ini (dan halaman login) harus dibuka lewat Safari — bukan Chrome/lainnya. Hanya Safari yang bisa “Add to Home Screen” di iPhone.",
  },
  {
    title: "Tap tombol Share",
    body: "Di bar bawah Safari, tap ikon kotak dengan panah ke atas (Share / Bagikan).",
  },
  {
    title: "Pilih “Add to Home Screen”",
    body: "Scroll daftar opsi ke bawah sampai ketemu “Add to Home Screen” (Tambah ke Layar Utama), lalu tap.",
  },
  {
    title: "Tap “Add”",
    body: "Nama sudah otomatis terisi “AR Corp Channel” — langsung tap Add di pojok kanan atas.",
  },
  {
    title: "Selesai — buka dari Home Screen",
    body: "Ikon AR Corp Channel sekarang ada di layar utama iPhone, persis seperti aplikasi biasa: full-screen, tanpa address bar Safari.",
  },
];

export default function IphoneInstallPage() {
  return (
    <div className="min-h-screen grid place-items-center p-5 sm:p-10">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="relative">
            <div
              className="absolute -inset-2 rounded-full opacity-70 blur-md"
              style={{ background: "radial-gradient(circle, rgba(201,162,74,0.35), transparent 70%)" }}
            />
            <Image
              src="/ar-corp-logo.png"
              alt="AR Corp"
              width={110}
              height={110}
              unoptimized
              className="relative rounded-full object-contain bg-[var(--bg)] border border-[var(--goldline)]"
            />
          </div>
          <div>
            <div className="text-[11px] tracking-[0.32em] uppercase text-[var(--gold)] font-semibold">AR CORP</div>
            <div className="text-[18px] font-semibold mt-1">Channel Portal</div>
            <div className="text-[11px] text-[var(--dim)] mt-1 uppercase tracking-[0.14em]">Pasang di iPhone — tanpa App Store</div>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 mb-4">
          <p className="text-[12px] leading-[1.7] text-[var(--dim)]">
            iPhone tidak bisa memasang file APK (format Android) — sistemnya beda total. Tapi AR Corp Channel sudah
            berbentuk aplikasi web (PWA), jadi cukup 5 langkah di bawah untuk dapat ikon aplikasi asli di layar utama,
            tanpa App Store, tanpa akun developer, gratis.
          </p>
        </div>

        <ol className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <li key={i} className="bg-[var(--surface)] border border-[var(--line)] rounded-[16px] p-4 flex gap-3.5 items-start">
              <div
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))", color: "#1a1200" }}
              >
                {i + 1}
              </div>
              <div>
                <div className="text-[12.5px] font-semibold text-[var(--gold)] mb-1">{step.title}</div>
                <div className="text-[11.5px] leading-[1.6] text-[var(--dim)]">{step.body}</div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col items-center gap-2">
          <a
            href="/login"
            className="w-full text-center py-[13px] rounded-[11px] text-[12px] font-bold tracking-[0.18em] uppercase"
            style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))", color: "#1a1200" }}
          >
            Buka Halaman Login
          </a>
          <div className="text-[9.5px] text-[var(--faint)] text-center mt-1">
            Butuh Android atau Windows? <a href="/login" className="underline">Buka halaman login</a> untuk tombol unduh APK/Desktop.
          </div>
        </div>

        <div className="mt-6 text-center text-[9px] tracking-[0.15em] text-[var(--faint)] opacity-60">
          AR Corp Channel
        </div>
      </div>
    </div>
  );
}
