import { Client, EmbedBuilder, TextChannel } from 'discord.js';

import { prisma } from './DatabaseService';

export async function buildRulesEmbed(guildId: string) {
  const rules = await prisma.rule.findMany({
    where: { guildId },
    orderBy: { number: 'asc' }
  });

  const description = rules.length
    ? rules
        .map(
          rule =>
            `**${rule.number}. ${rule.title}**\n${rule.content}`
        )
        .join('\n\n')
    : '*No rules have been configured yet.*';

  return new EmbedBuilder()
    .setColor('#d4af37')
    .setTitle('📜 Operation Cheddar Shield Rules')
    .setDescription(description)
    .setFooter({
      text: 'Operation Cheddar Shield • Rules & Guidelines'
    })
    .setTimestamp();
}

export async function refreshRulesBoards(
  client: Client,
  guildId: string
) {
  const panels = await prisma.panel.findMany({
    where: {
      guildId,
      type: 'rules_board'
    }
  });

  const embed = await buildRulesEmbed(guildId);

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
        where: { id: panel.id }
      });
    }
  }
}

export async function createRulesBoard(
  channel: TextChannel,
  guildId: string
) {
  const embed = await buildRulesEmbed(guildId);

  const message = await channel.send({
    embeds: [embed]
  });

  await prisma.panel.create({
    data: {
      guildId,
      channelId: channel.id,
      messageId: message.id,
      type: 'rules_board'
    }
  });

  return message;
}