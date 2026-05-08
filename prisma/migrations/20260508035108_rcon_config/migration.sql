/*
  Warnings:

  - Added the required column `rconPassword` to the `PavlovServer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rconPort` to the `PavlovServer` table without a default value. This is not possible if the table is not empty.
  - Made the column `serverIp` on table `PavlovServer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `serverPort` on table `PavlovServer` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PavlovServer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logPath" TEXT,
    "serverIp" TEXT NOT NULL,
    "serverPort" INTEGER NOT NULL,
    "rconPort" INTEGER NOT NULL,
    "rconPassword" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PavlovServer" ("createdAt", "enabled", "guildId", "id", "logPath", "name", "serverIp", "serverPort") SELECT "createdAt", "enabled", "guildId", "id", "logPath", "name", "serverIp", "serverPort" FROM "PavlovServer";
DROP TABLE "PavlovServer";
ALTER TABLE "new_PavlovServer" RENAME TO "PavlovServer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
