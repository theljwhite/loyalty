/*
  Warnings:

  - You are about to drop the column `senderAddress` on the `LoyaltyProgram` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `Escrow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderAddress` to the `Escrow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Escrow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `LoyaltyProgram` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LoyaltyProgram` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Escrow" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "senderAddress" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "LoyaltyProgram" DROP COLUMN "senderAddress",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
