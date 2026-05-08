import { prisma } from './DatabaseService';

import { logger } from './Logger';

export async function restorePanels() {
  const panels =
    await prisma.panel.findMany();

  logger.info(
    `Restored ${panels.length} persistent panels`
  );
}