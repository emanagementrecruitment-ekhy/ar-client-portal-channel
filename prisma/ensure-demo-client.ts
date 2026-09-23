// Runs on every production start (see package.json "start:railway") —
// upserts a standing demo Client/Channel account, the same idea as AR Corp's
// own DEMO_TERA_CODE (Grace/DEMO-01): a fake email/phone nobody can actually
// receive mail at, but issueClientOtp() always surfaces its OTP on-screen
// (see DEMO_CLIENT_CODE in src/lib/constants.ts), so anyone can log in and
// see a populated ledger without needing real OTP delivery configured.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_CLIENT = {
  code: "DEMO-CH01",
  name: "Mami Ariel (Demo)",
  email: "demo.channel@arcorp-channel.invalid",
  phone: "080000000001",
};

// Mirrors the first few real rows from the uploaded "DATA CLIENT/CHANNEL"
// Excel format (HR_LINK_AR_CORP.pdf) so the demo dashboard looks like real
// production data rather than empty/placeholder rows.
const DEMO_ENTRIES = [
  { id: "demo-entry-1", nama: "ARSYA", outlet: "HRV", vcr: 4, fee: 10_000, potongan: 0, keterangan: null as string | null },
  { id: "demo-entry-2", nama: "PUPUT", outlet: "ROYAL", vcr: 2, fee: 15_000, potongan: 0, keterangan: null },
  { id: "demo-entry-3", nama: "DERA", outlet: "SA", vcr: 4, fee: 20_000, potongan: 0, keterangan: null },
  { id: "demo-entry-4", nama: "PANDA", outlet: "MTR", vcr: 3, fee: 25_000, potongan: 0, keterangan: null },
  { id: "demo-entry-5", nama: "FLORYN", outlet: "MEGA A", vcr: 41, fee: 30_000, potongan: 1_000_000, keterangan: "kasbon" },
];

async function main() {
  const month = new Date().toISOString().slice(0, 7);

  const client = await prisma.clientAccount.upsert({
    where: { code: DEMO_CLIENT.code },
    update: { name: DEMO_CLIENT.name, email: DEMO_CLIENT.email, phone: DEMO_CLIENT.phone, status: "AKTIF" },
    create: { ...DEMO_CLIENT, status: "AKTIF" },
  });

  for (const { id, ...fields } of DEMO_ENTRIES) {
    await prisma.clientEntry.upsert({
      where: { id },
      update: { ...fields, clientId: client.id, month },
      create: { id, ...fields, clientId: client.id, month },
    });
  }

  console.log(`[ensure-demo-client] ready: ${client.code} (${DEMO_ENTRIES.length} entries for ${month})`);
}

main()
  .catch((e) => {
    console.error("[ensure-demo-client] failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
