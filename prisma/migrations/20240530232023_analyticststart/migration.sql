-- CreateEnum
CREATE TYPE "EventName" AS ENUM ('ObjectiveCompleted', 'PointsUpdate', 'ERC20Rewarded', 'ERC721Rewarded', 'ERC1155Rewarded', 'UserWithdraw');

-- CreateTable
CREATE TABLE "ProgressionEvent" (
    "id" TEXT NOT NULL,
    "eventName" "EventName" NOT NULL,
    "loyaltyAddress" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "userAddress" TEXT NOT NULL,
    "objectiveIndex" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "pointsChange" INTEGER,
    "userPointsTotal" TEXT NOT NULL,

    CONSTRAINT "ProgressionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardEvent" (
    "id" TEXT NOT NULL,
    "eventName" "EventName" NOT NULL,
    "loyaltyAddress" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "userAddress" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "tokenId" TEXT,
    "tokenAmount" INTEGER,
    "erc20Amount" BIGINT NOT NULL,
    "escrowType" "EscrowType" NOT NULL,

    CONSTRAINT "RewardEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramAnalyticsSummary" (
    "id" TEXT NOT NULL,
    "loyaltyAddress" TEXT NOT NULL,
    "totalObjectivesCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalUniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "totalUniqueRewarded" INTEGER NOT NULL DEFAULT 0,
    "totalTokensWithdrawn" INTEGER NOT NULL DEFAULT 0,
    "totalERC20Withdrawn" BIGINT NOT NULL DEFAULT 0,
    "totalUnclaimedTokens" INTEGER NOT NULL DEFAULT 0,
    "totalUnclaimedERC20" BIGINT NOT NULL DEFAULT 0,
    "avgUserWithdrawTime" INTEGER NOT NULL DEFAULT 0,
    "dailyAverageUsers" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "monthlyAverageUsers" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "retentionRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramAnalyticsSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramAnalyticsSummary_loyaltyAddress_key" ON "ProgramAnalyticsSummary"("loyaltyAddress");

-- AddForeignKey
ALTER TABLE "ProgressionEvent" ADD CONSTRAINT "ProgressionEvent_loyaltyAddress_fkey" FOREIGN KEY ("loyaltyAddress") REFERENCES "LoyaltyProgram"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardEvent" ADD CONSTRAINT "RewardEvent_loyaltyAddress_fkey" FOREIGN KEY ("loyaltyAddress") REFERENCES "LoyaltyProgram"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAnalyticsSummary" ADD CONSTRAINT "ProgramAnalyticsSummary_loyaltyAddress_fkey" FOREIGN KEY ("loyaltyAddress") REFERENCES "LoyaltyProgram"("address") ON DELETE CASCADE ON UPDATE CASCADE;
