import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-session";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getClientSession();
  if (!session) redirect("/login");
  return <DashboardClient name={session.name} code={session.code} />;
}
