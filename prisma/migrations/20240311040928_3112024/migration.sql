/*
  Warnings:

  - A unique constraint covering the columns `[walletSetId]` on the table `LoyaltyProgram` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LoyaltyProgram" ADD COLUMN     "walletSetId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apiKey" TEXT;

-- CreateTable
CREATE TABLE "Wallet" (
    "refId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "walletSetId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isAssigned" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_refId_key" ON "Wallet"("refId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_walletId_key" ON "Wallet"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_externalId_key" ON "Wallet"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyProgram_walletSetId_key" ON "LoyaltyProgram"("walletSetId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_walletSetId_fkey" FOREIGN KEY ("walletSetId") REFERENCES "LoyaltyProgram"("walletSetId") ON DELETE RESTRICT ON UPDATE CASCADE;
