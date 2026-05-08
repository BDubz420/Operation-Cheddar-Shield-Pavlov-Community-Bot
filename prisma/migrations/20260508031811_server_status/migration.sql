/*
  Warnings:

  - A unique constraint covering the columns `[guildId,serverId]` on the table `ServerStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ServerStatus_guildId_serverId_key" ON "ServerStatus"("guildId", "serverId");
