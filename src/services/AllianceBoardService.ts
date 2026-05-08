import {
  Client,
  EmbedBuilder,
  TextChannel,
  NewsChannel,
  ThreadChannel
} from 'discord.js';

import { prisma } from './DatabaseService';
import { EmbedService } from './EmbedService';

type SendableGuildChannel =
  | TextChannel
  | NewsChannel
  | ThreadChannel;

export async function buildAllianceBoardEmbed(
  guildId: string
): Promise<EmbedBuilder> {
  const alliances = await prisma.alliance.findMany({
    where: { guildId },
    orderBy: { name: 'asc' }
  });

  const byStatus = (status: string) =>
    alliances.filter(a => a.status === status);

  const list = (items: typeof alliances) =>
    items.length
      ? items.map(a => `├─ ${a.name}`).join('\n')
      : '└─ *None*';

  return EmbedService.tactical(
    'O.C.S Alliance Status',
    [
      '☀️ **RECOGNIZED**',
      '└─ *None*',
      '',
      '🟢 **ALLIED**',
      list(byStatus('allied')),
      '',
      '⚪ **NEUTRAL**',
      list(byStatus('neutral')),
      '',
      '🤝 **NEGOTIATION**',
      list(byStatus('negotiation')),
      '',
      '⚫ **UNEASY**',
      list(byStatus('uneasy')),
      '',
      '🔴 **WAR**',
      list(byStatus('war')),
      '',
      '☠️ **RAID / TERRORIST GROUP**',
      list(byStatus('raid'))
    ].join('\n')
  );
}

export async function refreshAllianceBoards(
  client: Client,
  guildId: string
) {
  const panels = await prisma.panel.findMany({
    where: {
      guildId,
      type: 'alliance_board'
    }
  });

  const embed = await buildAllianceBoardEmbed(guildId);

  for (const panel of panels) {
    try {
      const channel = await client.channels.fetch(panel.channelId);

      if (!channel || !channel.isTextBased()) continue;

      const message = await channel.messages.fetch(panel.messageId);

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

export async function createAllianceBoard(
  channel: SendableGuildChannel,
  guildId: string
) {
  const embed = await buildAllianceBoardEmbed(guildId);

  const message = await channel.send({
    embeds: [embed]
  });

  await prisma.panel.create({
    data: {
      guildId,
      channelId: channel.id,
      messageId: message.id,
      type: 'alliance_board'
    }
  });

  return message;
}