/*
  Warnings:

  - A unique constraint covering the columns `[creatorId]` on the table `Escrow` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `LoyaltyProgram` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[creatorId]` on the table `LoyaltyProgram` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Escrow_creatorId_key" ON "Escrow"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyProgram_id_key" ON "LoyaltyProgram"("id");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyProgram_creatorId_key" ON "LoyaltyProgram"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
