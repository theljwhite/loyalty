/*
  Warnings:

  - A unique constraint covering the columns `[provider_providerAccountId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Session_provider_providerAccountId_key" ON "Session"("provider_providerAccountId");
