import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const isNewClient = !globalForPrisma.prisma;
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// WAL lets reads run concurrently with a write, and busy_timeout makes a
// second writer queue and retry instead of failing outright — same reasoning
// as the main AR Corp app's src/lib/prisma.ts.
if (isNewClient) {
  prisma.$executeRawUnsafe("PRAGMA journal_mode = WAL;").catch(() => {});
  prisma.$executeRawUnsafe("PRAGMA busy_timeout = 5000;").catch(() => {});
}
