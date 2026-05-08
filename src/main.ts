import 'dotenv/config';

import { OCSClient } from './structures/OCSClient';
import { logger } from './services/Logger';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';
import { loadInteractions } from './handlers/interactionHandler';
import { prisma } from './services/DatabaseService';
import { restorePanels } from './services/PanelRestoreService';
import { startSchedulers } from './services/SchedulerService';
import { initializeRconConnections } from './services/PavlovRconManager';
import { startServerStatusUpdater } from './services/ServerStatusService';
import { startTimedStateService } from './services/TimedStateService';
import { startTrainerCleanup } from './services/TrainerCleanupService';

const token = process.env.DISCORD_TOKEN;

process.on('unhandledRejection', error => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});

if (!token) {
  throw new Error(
    'Missing DISCORD_TOKEN in .env'
  );
}

const client = new OCSClient();

(async () => {
  await loadCommands(client);

  await loadEvents(client);

  await loadInteractions(client);

  await prisma.$connect();

  logger.info('Database connected');

  await restorePanels();

  startSchedulers(client);

  startTrainerCleanup();

  startTimedStateService(client);

  await initializeRconConnections();

  startServerStatusUpdater(client);

  await client.start(token);

  logger.info('O.C.S Bot Online');
})();