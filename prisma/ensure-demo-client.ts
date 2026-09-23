// Runs on every production start (see package.json "start:railway") —
// upserts a standing demo Client/Channel account, the same idea as AR Corp's
// own DEMO_TERA_CODE (Grace/DEMO-01): a fake email/phone nobody can actually
// receive mail at, but issueClientOtp() always surfaces its OTP on-screen
// (see DEMO_CLIENT_CODE in src/lib/constants.ts), so anyone can log in.
//
// The ledger itself is NOT auto-seeded (it used to be, with 5 fixed rows) —
// the admin was overwriting/replacing that seeded data by hand every time,
// so it now starts empty and is entered manually through the normal admin
// ledger page like any real client. The old fixed rows (ids "demo-entry-1"
// through "demo-entry-5") are deleted below, once, so old deploys' leftovers
// don't linger; this delete is a no-op once they're gone.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_CLIENT = {
  code: "DEMO-CH01",
  name: "Mami Maya (Demo)",
  email: "demo.channel@arcorp-channel.invalid",
  phone: "080000000001",
};

const OLD_SEEDED_ENTRY_IDS = ["demo-entry-1", "demo-entry-2", "demo-entry-3", "demo-entry-4", "demo-entry-5"];

async function main() {
  const client = await prisma.clientAccount.upsert({
    where: { code: DEMO_CLIENT.code },
    update: { name: DEMO_CLIENT.name, email: DEMO_CLIENT.email, phone: DEMO_CLIENT.phone, status: "AKTIF" },
    create: { ...DEMO_CLIENT, status: "AKTIF" },
  });

  const { count } = await prisma.clientEntry.deleteMany({ where: { id: { in: OLD_SEEDED_ENTRY_IDS } } });

  console.log(`[ensure-demo-client] ready: ${client.code}${count > 0 ? ` (removed ${count} old auto-seeded row(s))` : ""}`);
}

main()
  .catch((e) => {
    console.error("[ensure-demo-client] failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
