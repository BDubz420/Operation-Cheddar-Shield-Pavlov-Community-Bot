-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "embedColor" TEXT NOT NULL DEFAULT '#D4AF37',
    "logChannelId" TEXT,
    "antiRaidEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "raidThreshold" INTEGER NOT NULL DEFAULT 5,
    "raidWindowSeconds" INTEGER NOT NULL DEFAULT 10,
    "raidAlertChannelId" TEXT,
    "quarantineRoleId" TEXT
);
INSERT INTO "new_GuildConfig" ("antiRaidEnabled", "createdAt", "embedColor", "guildId", "id", "logChannelId", "updatedAt") SELECT "antiRaidEnabled", "createdAt", "embedColor", "guildId", "id", "logChannelId", "updatedAt" FROM "GuildConfig";
DROP TABLE "GuildConfig";
ALTER TABLE "new_GuildConfig" RENAME TO "GuildConfig";
CREATE UNIQUE INDEX "GuildConfig_guildId_key" ON "GuildConfig"("guildId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
