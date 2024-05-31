/*
  Warnings:

  - The `tokenId` column on the `RewardEvent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userPointsTotal` on the `ProgressionEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ProgressionEvent" DROP COLUMN "userPointsTotal",
ADD COLUMN     "userPointsTotal" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RewardEvent" DROP COLUMN "tokenId",
ADD COLUMN     "tokenId" INTEGER,
ALTER COLUMN "erc20Amount" DROP NOT NULL;
