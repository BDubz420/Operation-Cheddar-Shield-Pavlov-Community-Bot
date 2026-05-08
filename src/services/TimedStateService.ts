import { Client } from 'discord.js';

import { prisma } from './DatabaseService';

import {
  refreshCodeBoards
} from './CodeStatusService';

export function startTimedStateService(
  client: Client
) {
  setInterval(async () => {
    try {
      const expired =
        await prisma.timedState.findMany({
          where: {
            expiresAt: {
              lte: new Date()
            }
          }
        });

      for (const state of expired) {
        if (
          state.system === 'CODE'
        ) {
          await prisma.codeStatus.update({
            where: {
              guildId:
                state.guildId
            },

            data: {
              code:
                state.previous,

              title:
                `CODE ${state.previous}`,

              description:
                'Operational status normalized.'
            }
          });

          await refreshCodeBoards(
            client,
            state.guildId
          );
        }

        await prisma.timedState.delete({
          where: {
            id: state.id
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, 15000);
}