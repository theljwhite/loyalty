/*
  Warnings:

  - You are about to drop the column `type` on the `User` table. All the data in the column will be lost.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('User', 'Creator', 'Team');

-- AlterTable
ALTER TABLE "Escrow" ALTER COLUMN "isSenderApproved" SET DEFAULT false,
ALTER COLUMN "isRewardApproved" SET DEFAULT false,
ALTER COLUMN "isDepositKeySet" SET DEFAULT false;

-- AlterTable
ALTER TABLE "LoyaltyProgram" ALTER COLUMN "tiersActive" SET DEFAULT false,
ALTER COLUMN "senderAddress" DROP NOT NULL,
ALTER COLUMN "escrowAddress" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "type",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- DropEnum
DROP TYPE "UserType";
