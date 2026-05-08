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

export async function updatePlayerPlaytime(
  guildId: string,
  playerName: string,
  minutes: number
) {
  const existing =
    await prisma.playerStat.findFirst({
      where: {
        guildId,
        playerName
      }
    });

  if (!existing) {
    return prisma.playerStat.create({
      data: {
        guildId,
        playerName,
        totalPlaytime: minutes,
        dailyPlaytime: minutes
      }
    });
  }

  return prisma.playerStat.update({
    where: {
      id: existing.id
    },

    data: {
      totalPlaytime: {
        increment: minutes
      },

      dailyPlaytime: {
        increment: minutes
      }
    }
  });
}

export async function buildLeaderboardEmbed(
  guildId: string
): Promise<EmbedBuilder> {
  const players =
    await prisma.playerStat.findMany({
      where: {
        guildId
      },

      orderBy: {
        totalPlaytime: 'desc'
      },

      take: 10
    });

  return EmbedService.tactical(
    'O.C.S Leaderboards',
    [
      '🏆 Top Player Activity',
      '',

      players.length
        ? players
            .map(
              (player, index) =>
                `#${index + 1} — **${player.playerName}**\n` +
                `├ Daily: ${player.dailyPlaytime} mins\n` +
                `└ Total: ${player.totalPlaytime} mins`
            )
            .join('\n\n')
        : '*No leaderboard data.*'
    ].join('\n')
  );
}

export async function refreshLeaderboardBoards(
  client: Client,
  guildId: string
) {
  const panels = await prisma.panel.findMany({
    where: {
      guildId,
      type: 'leaderboard_board'
    }
  });

  const embed =
    await buildLeaderboardEmbed(
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

export async function createLeaderboardBoard(
  channel: SendableGuildChannel,
  guildId: string
) {
  const embed =
    await buildLeaderboardEmbed(
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
      type: 'leaderboard_board'
    }
  });

  return message;
}