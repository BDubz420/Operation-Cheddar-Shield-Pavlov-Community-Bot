import { EmbedBuilder, TextChannel } from 'discord.js';

import { prisma } from './DatabaseService';

import { getRconClient, sendCommand, getTelemetry} from './PavlovRconManager';

import { logger } from './Logger';

type StatusBoard = {
  guildId: string;
  channelId: string;
  messageId: string;
};

const boards: StatusBoard[] = [];

export async function createServerStatusBoard(
  channel: TextChannel,
  guildId: string
) {
  const embed =
    new EmbedBuilder()
      .setColor('#d4af37')
      .setTitle(
        '🛡️ O.C.S Server Status'
      )
      .setDescription(
        'Initializing server telemetry...'
      )
      .setFooter({
        text:
          'Operation Cheddar Shield'
      })
      .setTimestamp();

  const message =
    await channel.send({
      embeds: [embed]
    });

  boards.push({
    guildId,
    channelId: channel.id,
    messageId: message.id
  });

  logger.info(
    `Registered live status board for guild ${guildId}`
  );
}

export async function startServerStatusUpdater(
  client: any
) {
  setInterval(async () => {
    try {
      for (const board of boards) {
        try {
          const channel =
            await client.channels.fetch(
              board.channelId
            );

          if (
            !channel ||
            !channel.isTextBased()
          ) {
            continue;
          }

          const message =
            await channel.messages.fetch(
              board.messageId
            );

          const servers =
            await prisma.pavlovServer.findMany({
              where: {
                guildId: board.guildId
              }
            });

          const lines: string[] = [];

          for (const server of servers) {
            const telemetry =
              getTelemetry(server.id);

            const online =
              telemetry
                ? '🟢 ONLINE'
                : '🔴 OFFLINE';

            lines.push(
              `🟡 ${server.name}\n└ Status: ${online}`
            );

            sendCommand(
              server.id,
              'ServerInfo'
            );
          }

          const embed =
            new EmbedBuilder()
              .setColor('#d4af37')
              .setTitle(
                '🛡️ O.C.S Server Status'
              )
              .setDescription(
                lines.join('\n\n')
              )
              .setFooter({
                text:
                  'Operation Cheddar Shield'
              })
              .setTimestamp();

          await message.edit({
            embeds: [embed]
          });
        } catch (err) {
          console.error(err);
        }
      }
    } catch (error) {
      logger.error(
        'Server board updater failed'
      );

      console.error(error);
    }
  }, 30000);
}