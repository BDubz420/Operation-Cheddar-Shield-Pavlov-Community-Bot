import { prisma } from './DatabaseService';

import { logger } from './Logger';

export function startTrainerCleanup() {
  setInterval(async () => {
    try {
      const expired =
        await prisma.trainerRequest.findMany({
          where: {
            status: {
              in: [
                'OPEN',
                'CLAIMED'
              ]
            },

            expiresAt: {
              lte: new Date()
            }
          }
        });

      for (const request of expired) {
        await prisma.trainerRequest.update({
          where: {
            id: request.id
          },

          data: {
            status:
              'EXPIRED'
          }
        });

        logger.info(
          `Expired trainer request: ${request.id}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  }, 60000);
}