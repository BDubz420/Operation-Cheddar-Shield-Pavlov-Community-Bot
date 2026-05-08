-- CreateTable
CREATE TABLE "ServerStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "playerCount" INTEGER NOT NULL DEFAULT 0,
    "maxPlayers" INTEGER NOT NULL DEFAULT 0,
    "map" TEXT,
    "gameMode" TEXT,
    "updatedAt" DATETIME NOT NULL
);
