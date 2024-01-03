-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('User', 'Creator', 'Team');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('Points', 'ERC20', 'ERC721', 'ERC1155');

-- CreateEnum
CREATE TYPE "EscrowType" AS ENUM ('ERC20', 'ERC721', 'ERC1155');

-- CreateEnum
CREATE TYPE "ProgramState" AS ENUM ('Idle', 'AwaitingEscrowSetup', 'Active', 'Completed', 'Canceled');

-- CreateEnum
CREATE TYPE "EscrowState" AS ENUM ('Idle', 'AwaitingEscrowApprovals', 'DepositPeriod', 'AwaitingEscrowSettings', 'InIssuance', 'Completed', 'Frozen', 'Canceled');

-- CreateEnum
CREATE TYPE "Authority" AS ENUM ('USER', 'CREATOR');

-- CreateTable
CREATE TABLE "LoyaltyProgram" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" "ProgramState" NOT NULL,
    "chain" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "tiersActive" BOOLEAN NOT NULL,
    "programStart" TIMESTAMP(3) NOT NULL,
    "programEnd" TIMESTAMP(3) NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "escrowAddress" TEXT NOT NULL,

    CONSTRAINT "LoyaltyProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escrow" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "rewardAddress" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "escrowType" "EscrowType" NOT NULL,
    "state" "EscrowState" NOT NULL,
    "depositKey" TEXT NOT NULL,
    "depositEndDate" TIMESTAMP(3) NOT NULL,
    "isSenderApproved" BOOLEAN NOT NULL,
    "isRewardApproved" BOOLEAN NOT NULL,
    "isDepositKeySet" BOOLEAN NOT NULL,
    "loyaltyAddress" TEXT NOT NULL,

    CONSTRAINT "Escrow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objective" (
    "id" TEXT NOT NULL,
    "indexInContract" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "reward" INTEGER NOT NULL,
    "authority" "Authority" NOT NULL,
    "loyaltyProgramId" TEXT,

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tier" (
    "id" TEXT NOT NULL,
    "indexInContract" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rewardsRequired" INTEGER NOT NULL,
    "loyaltyProgramId" TEXT,

    CONSTRAINT "Tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "type" "UserType" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyProgram_address_key" ON "LoyaltyProgram"("address");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyProgram_escrowAddress_key" ON "LoyaltyProgram"("escrowAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Escrow_address_key" ON "Escrow"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Escrow_loyaltyAddress_key" ON "Escrow"("loyaltyAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "LoyaltyProgram" ADD CONSTRAINT "LoyaltyProgram_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_loyaltyAddress_fkey" FOREIGN KEY ("loyaltyAddress") REFERENCES "LoyaltyProgram"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_loyaltyProgramId_fkey" FOREIGN KEY ("loyaltyProgramId") REFERENCES "LoyaltyProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tier" ADD CONSTRAINT "Tier_loyaltyProgramId_fkey" FOREIGN KEY ("loyaltyProgramId") REFERENCES "LoyaltyProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
