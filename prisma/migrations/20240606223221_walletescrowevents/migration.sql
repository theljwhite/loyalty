/*
  Warnings:

  - The values [UserWithdraw] on the enum `EventName` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "WalletEscrowEventName" AS ENUM ('ERC20UserWithdraw', 'ERC20CreatorWithdraw', 'ERC20Deposit', 'ERC721TokenReceived', 'ERC721BatchReceived', 'ERC721UserWithdraw', 'ERC721CreatorWithdraw', 'ERC1155TokenReceived', 'ERC1155BatchReceived', 'ERC1155CreatorWithdraw', 'ERC1155CreatorWithdrawAll', 'ERC1155UserWithdrawAll');

-- AlterEnum
BEGIN;
CREATE TYPE "EventName_new" AS ENUM ('ObjectiveCompleted', 'PointsUpdate', 'ERC20Rewarded', 'ERC721Rewarded', 'ERC1155Rewarded');
ALTER TABLE "ProgressionEvent" ALTER COLUMN "eventName" TYPE "EventName_new" USING ("eventName"::text::"EventName_new");
ALTER TABLE "RewardEvent" ALTER COLUMN "eventName" TYPE "EventName_new" USING ("eventName"::text::"EventName_new");
ALTER TYPE "EventName" RENAME TO "EventName_old";
ALTER TYPE "EventName_new" RENAME TO "EventName";
DROP TYPE "EventName_old";
COMMIT;

-- CreateTable
CREATE TABLE "WalletEscrowEvent" (
    "id" TEXT NOT NULL,
    "eventName" "WalletEscrowEventName" NOT NULL,
    "loyaltyAddress" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactorAddress" TEXT NOT NULL,
    "erc20Amount" BIGINT,
    "tokenId" INTEGER,
    "tokenAmount" INTEGER,
    "erc721Batch" JSONB,
    "erc1155Batch" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletEscrowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgressionEvent_loyaltyAddress_idx" ON "ProgressionEvent"("loyaltyAddress");

-- CreateIndex
CREATE INDEX "ProgressionEvent_userAddress_idx" ON "ProgressionEvent"("userAddress");

-- CreateIndex
CREATE INDEX "ProgressionEvent_timestamp_idx" ON "ProgressionEvent"("timestamp");

-- CreateIndex
CREATE INDEX "ProgressionEvent_loyaltyAddress_userAddress_idx" ON "ProgressionEvent"("loyaltyAddress", "userAddress");

-- CreateIndex
CREATE INDEX "RewardEvent_eventName_idx" ON "RewardEvent"("eventName");

-- CreateIndex
CREATE INDEX "RewardEvent_loyaltyAddress_idx" ON "RewardEvent"("loyaltyAddress");

-- CreateIndex
CREATE INDEX "RewardEvent_timestamp_idx" ON "RewardEvent"("timestamp");

-- CreateIndex
CREATE INDEX "RewardEvent_loyaltyAddress_userAddress_idx" ON "RewardEvent"("loyaltyAddress", "userAddress");
