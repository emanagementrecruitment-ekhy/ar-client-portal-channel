"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/admin-auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      className="py-2 px-3.5 bg-transparent border border-[var(--line)] rounded-[9px] text-[var(--dim)] text-[10.5px] cursor-pointer"
    >
      Keluar
    </button>
  );
}
