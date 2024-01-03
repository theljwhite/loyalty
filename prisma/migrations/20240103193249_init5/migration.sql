-- AlterTable
ALTER TABLE "Escrow" ALTER COLUMN "rewardAddress" SET DEFAULT '',
ALTER COLUMN "depositEndDate" DROP NOT NULL,
ALTER COLUMN "senderAddress" SET DEFAULT '';
