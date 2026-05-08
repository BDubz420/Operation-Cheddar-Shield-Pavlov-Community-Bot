import { Client } from 'discord.js';
import { logger } from '../../services/Logger';
import { startServerStatusUpdater } from '../../services/ServerStatusService';

export default {
  name: 'clientReady',
  once: true,

  execute(client: Client) {
    logger.info(
      `O.C.S Connected as ${client.user?.tag}`
    );
  }
};