import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminSession();
  if (!authed) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-3 px-5 sm:px-8 py-3.5 border-b border-[var(--line)]">
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-[var(--gold)]">AR Corp Channel</div>
          <div className="text-[9.5px] tracking-[0.14em] uppercase text-[var(--dim)]">Admin — Data Client/Channel</div>
        </div>
        <AdminLogoutButton />
      </header>
      <main className="max-w-[960px] mx-auto px-5 sm:px-8 py-6">{children}</main>
    </div>
  );
}
