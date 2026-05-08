import {
  Client,
  EmbedBuilder,
  TextChannel,
  ColorResolvable
} from 'discord.js';

import { prisma } from './DatabaseService';

const DEFCON_DATA: Record<
  number,
  {
    color: ColorResolvable;
    title: string;
    desc: string;
  }
> = {
  1: {
    color: '#ff0000',
    title: 'MAXIMUM WAR READINESS',
    desc: 'Nuclear conflict imminent.'
  },

  2: {
    color: '#ff6600',
    title: 'ARMED FORCES READY TO DEPLOY',
    desc: 'Major combat operations expected.'
  },

  3: {
    color: '#ffcc00',
    title: 'ELEVATED FORCE READINESS',
    desc: 'Military readiness increased.'
  },

  4: {
    color: '#00ccff',
    title: 'INCREASED SECURITY POSTURE',
    desc: 'Heightened intelligence monitoring.'
  },

  5: {
    color: '#66cc66',
    title: 'PEACETIME — NORMAL OPERATIONS',
    desc: 'No active threats detected.'
  }
};

export async function buildDefconEmbed(
  guildId: string
) {
  let status =
    await prisma.defconStatus.findUnique({
      where: { guildId }
    });

  if (!status) {
    status =
      await prisma.defconStatus.create({
        data: {
          guildId,

          level: 5,

          title:
            DEFCON_DATA[5].title,

          description:
            DEFCON_DATA[5].desc
        }
      });
  }

  const data =
    DEFCON_DATA[
      status.level as keyof typeof DEFCON_DATA
    ];

  return new EmbedBuilder()
    .setColor(data.color)

    .setTitle(
      `🛡️ DEFCON ${status.level}`
    )

    .setDescription(
      `# ${status.title}\n\n${status.description}`
    )

    .addFields({
      name: '📊 Readiness Level',
      value: `${status.level}/5`,
      inline: true
    })

    .setFooter({
      text:
        'Operation Cheddar Shield • DEFCON Board'
    })

    .setTimestamp();
}

export async function refreshDefconBoards(
  client: Client,
  guildId: string
) {
  const panels =
    await prisma.panel.findMany({
      where: {
        guildId,
        type: 'defcon_board'
      }
    });

  const embed =
    await buildDefconEmbed(guildId);

  for (const panel of panels) {
    try {
      const channel =
        await client.channels.fetch(
          panel.channelId
        );

      if (
        !channel ||
        !channel.isTextBased()
      ) {
        continue;
      }

      const message =
        await channel.messages.fetch(
          panel.messageId
        );

      await message.edit({
        embeds: [embed]
      });
    } catch {}
  }
}

export async function createDefconBoard(
  channel: TextChannel,
  guildId: string
) {
  const embed =
    await buildDefconEmbed(guildId);

  const message =
    await channel.send({
      embeds: [embed]
    });

  await prisma.panel.create({
    data: {
      guildId,

      channelId: channel.id,

      messageId: message.id,

      type: 'defcon_board'
    }
  });
}