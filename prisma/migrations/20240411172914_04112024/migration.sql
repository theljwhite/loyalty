/*
  Warnings:

  - A unique constraint covering the columns `[rsaPublicKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LoyaltyProgram" ALTER COLUMN "version" SET DEFAULT '0.03';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rsaPublicKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_rsaPublicKey_key" ON "User"("rsaPublicKey");
