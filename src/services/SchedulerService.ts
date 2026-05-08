import cron from 'node-cron';

import { prisma } from './DatabaseService';

import { logger } from './Logger';

import { OCSClient } from '../structures/OCSClient';

import { refreshLeaderboardBoards } from './LeaderboardService';

export function startSchedulers(
  client: OCSClient
) {
  // DAILY RESET
  // Midnight server time

  cron.schedule('0 0 * * *', async () => {
    logger.info(
      'Running daily leaderboard reset'
    );

    const guilds =
      await prisma.guildConfig.findMany();

    // Reset daily playtime

    await prisma.playerStat.updateMany({
      data: {
        dailyPlaytime: 0
      }
    });

    // Refresh all leaderboard boards

    for (const guild of guilds) {
      await refreshLeaderboardBoards(
        client,
        guild.guildId
      );
    }

    logger.info(
      'Daily leaderboard reset completed'
    );
  });

  logger.info(
    'Schedulers initialized'
  );
}