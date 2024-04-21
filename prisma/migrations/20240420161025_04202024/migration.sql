/*
  Warnings:

  - A unique constraint covering the columns `[es]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "es" TEXT,
ADD COLUMN     "esUpdatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_es_key" ON "User"("es");
