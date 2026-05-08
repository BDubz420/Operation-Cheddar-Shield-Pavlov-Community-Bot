/*
  Warnings:

  - You are about to drop the column `logPath` on the `PavlovServer` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PavlovServer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serverIp" TEXT NOT NULL,
    "serverPort" INTEGER NOT NULL,
    "rconPort" INTEGER NOT NULL,
    "rconPassword" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PavlovServer" ("createdAt", "enabled", "guildId", "id", "name", "rconPassword", "rconPort", "serverIp", "serverPort") SELECT "createdAt", "enabled", "guildId", "id", "name", "rconPassword", "rconPort", "serverIp", "serverPort" FROM "PavlovServer";
DROP TABLE "PavlovServer";
ALTER TABLE "new_PavlovServer" RENAME TO "PavlovServer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
