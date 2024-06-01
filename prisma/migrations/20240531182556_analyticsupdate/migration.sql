/*
  Warnings:

  - You are about to drop the column `retentionRate` on the `ProgramAnalyticsSummary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProgramAnalyticsSummary" DROP COLUMN "retentionRate",
ADD COLUMN     "returningUsers" INTEGER NOT NULL DEFAULT 0;
