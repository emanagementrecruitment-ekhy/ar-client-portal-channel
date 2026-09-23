-- CreateTable
CREATE TABLE "ClientAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ClientOtpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "consumedAt" DATETIME,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientOtpCode_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientLoginEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientLoginEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "outlet" TEXT NOT NULL,
    "vcr" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "potongan" INTEGER NOT NULL DEFAULT 0,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccount_code_key" ON "ClientAccount"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccount_email_key" ON "ClientAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccount_phone_key" ON "ClientAccount"("phone");

-- CreateIndex
CREATE INDEX "ClientOtpCode_clientId_createdAt_idx" ON "ClientOtpCode"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientLoginEvent_clientId_createdAt_idx" ON "ClientLoginEvent"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientEntry_clientId_month_idx" ON "ClientEntry"("clientId", "month");
