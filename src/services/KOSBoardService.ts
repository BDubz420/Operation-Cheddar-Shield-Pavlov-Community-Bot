import {
  Client,
  EmbedBuilder,
  NewsChannel,
  TextChannel,
  ThreadChannel
} from 'discord.js';

import { prisma } from './DatabaseService';

import { EmbedService } from './EmbedService';

type SendableGuildChannel =
  | TextChannel
  | NewsChannel
  | ThreadChannel;

export async function buildKOSBoardEmbed(
  guildId: string
): Promise<EmbedBuilder> {
  const entries = await prisma.kOS.findMany({
    where: { guildId },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return EmbedService.tactical(
    'O.C.S KOS / BLACKLIST',
    [
      '☠️ Known Hostile Players',
      '',
      entries.length
        ? entries
            .map(
              entry =>
                `🔴 **${entry.target}**\n` +
                `└ Reason: ${entry.reason}`
            )
            .join('\n\n')
        : '*No blacklisted players.*'
    ].join('\n')
  );
}

export async function refreshKOSBoards(
  client: Client,
  guildId: string
) {
  const panels = await prisma.panel.findMany({
    where: {
      guildId,
      type: 'kos_board'
    }
  });

  const embed = await buildKOSBoardEmbed(
    guildId
  );

  for (const panel of panels) {
    try {
      const channel =
        await client.channels.fetch(
          panel.channelId
        );

      if (
        !channel ||
        !channel.isTextBased()
      )
        continue;

      const message =
        await channel.messages.fetch(
          panel.messageId
        );

      await message.edit({
        embeds: [embed]
      });
    } catch {
      await prisma.panel.delete({
        where: {
          id: panel.id
        }
      });
    }
  }
}

export async function createKOSBoard(
  channel: SendableGuildChannel,
  guildId: string
) {
  const embed = await buildKOSBoardEmbed(
    guildId
  );

  const message = await channel.send({
    embeds: [embed]
  });

  await prisma.panel.create({
    data: {
      guildId,
      channelId: channel.id,
      messageId: message.id,
      type: 'kos_board'
    }
  });

  return message;
}