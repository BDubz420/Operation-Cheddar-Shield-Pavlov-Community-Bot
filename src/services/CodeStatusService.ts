import {
  Client,
  EmbedBuilder,
  TextChannel,
  ColorResolvable
} from 'discord.js';

import { prisma } from './DatabaseService';

const CODE_DATA: Record<
  string,
  {
    color: ColorResolvable;
    title: string;
    status: string;
    desc: string;
    scale: string;
  }
> = {
  GREEN: {
    color: '#66cc66',

    title:
      'ALL CLEAR — NORMAL OPERATIONS',

    status:
      'CODE GREEN',

    desc:
      'All units at ease. No active threat detected.\nContinue normal operations and maintain standard vigilance.',

    scale:
      '⚪ CODE WHITE — PRACTICE ATTACK — TRAINING EXERCISE\n' +
      '🟢 CODE GREEN — ALL CLEAR — NORMAL OPERATIONS ◀ ACTIVE\n' +
      '🟠 CODE ORANGE — UNDER ATTACK — DEFENSIVE POSTURE\n' +
      '🔴 CODE RED — BASE INFILTRATED — PREPARE TO FIGHT\n' +
      '⚫ CODE BLACK — BASE TAKEN — FIGHT TO RECLAIM'
  },

  YELLOW: {
    color: '#ffcc00',

    title:
      'ELEVATED ALERT STATUS',

    status:
      'CODE YELLOW',

    desc:
      'Potential instability detected. Units should prepare for rapid escalation if required.',

    scale:
      '⚪ CODE WHITE — PRACTICE ATTACK — TRAINING EXERCISE\n' +
      '🟢 CODE GREEN — ALL CLEAR — NORMAL OPERATIONS\n' +
      '🟡 CODE YELLOW — ELEVATED ALERT ◀ ACTIVE\n' +
      '🟠 CODE ORANGE — UNDER ATTACK — DEFENSIVE POSTURE\n' +
      '🔴 CODE RED — BASE INFILTRATED — PREPARE TO FIGHT\n' +
      '⚫ CODE BLACK — BASE TAKEN — FIGHT TO RECLAIM'
  },

  ORANGE: {
    color: '#ff8800',

    title:
      'DEFENSIVE READINESS',

    status:
      'CODE ORANGE',

    desc:
      'Operational threat level increased. Defensive units should prepare immediate response posture.',

    scale:
      '⚪ CODE WHITE — PRACTICE ATTACK — TRAINING EXERCISE\n' +
      '🟢 CODE GREEN — ALL CLEAR — NORMAL OPERATIONS\n' +
      '🟠 CODE ORANGE — UNDER ATTACK — DEFENSIVE POSTURE ◀ ACTIVE\n' +
      '🔴 CODE RED — BASE INFILTRATED — PREPARE TO FIGHT\n' +
      '⚫ CODE BLACK — BASE TAKEN — FIGHT TO RECLAIM'
  },

  RED: {
    color: '#ff0000',

    title:
      'BASE INFILTRATION DETECTED',

    status:
      'CODE RED',

    desc:
      'Critical operational threat confirmed.\nAll combat personnel report to active defensive positions immediately.',

    scale:
      '⚪ CODE WHITE — PRACTICE ATTACK — TRAINING EXERCISE\n' +
      '🟢 CODE GREEN — ALL CLEAR — NORMAL OPERATIONS\n' +
      '🟠 CODE ORANGE — UNDER ATTACK — DEFENSIVE POSTURE\n' +
      '🔴 CODE RED — BASE INFILTRATED — PREPARE TO FIGHT ◀ ACTIVE\n' +
      '⚫ CODE BLACK — BASE TAKEN — FIGHT TO RECLAIM'
  },

  BLACK: {
    color: '#111111',

    title:
      'TOTAL SECURITY FAILURE',

    status:
      'CODE BLACK',

    desc:
      'Base security compromised.\nEmergency reclamation protocols are active.',

    scale:
      '⚪ CODE WHITE — PRACTICE ATTACK — TRAINING EXERCISE\n' +
      '🟢 CODE GREEN — ALL CLEAR — NORMAL OPERATIONS\n' +
      '🟠 CODE ORANGE — UNDER ATTACK — DEFENSIVE POSTURE\n' +
      '🔴 CODE RED — BASE INFILTRATED — PREPARE TO FIGHT\n' +
      '⚫ CODE BLACK — BASE TAKEN — FIGHT TO RECLAIM ◀ ACTIVE'
  }
};

export async function buildCodeEmbed(
  guildId: string
) {
  let status =
    await prisma.codeStatus.findUnique({
      where: { guildId }
    });

  if (!status) {
    status =
      await prisma.codeStatus.create({
        data: {
          guildId,

          code: 'GREEN',

          title:
            CODE_DATA.GREEN.title,

          description:
            CODE_DATA.GREEN.desc
        }
      });
  }

  const data =
    CODE_DATA[status.code];

  return new EmbedBuilder()
    .setColor(data.color)

    .setAuthor({
      name:
        'SPEC OPS PMC — Operational Command'
    })

    .setTitle(
      `🧠 ${data.status}`
    )

    .setDescription(
      `## ${data.title}\n\n${data.desc}`
    )

    .addFields(
      {
        name:
          '⚡ Operational Scale',

        value:
          data.scale
      },

      {
        name:
          '🛡 Threat Level',

        value:
          `\`${data.status}\``,

        inline: true
      },

      {
        name:
          '📡 Status',

        value:
          `\`${data.title}\``,

        inline: true
      }
    )

    .setThumbnail(
      'https://i.imgur.com/AfFp7pu.png'
    )

    .setFooter({
      text:
        'Spec Ops PMC • Command & Control'
    })

    .setTimestamp();
}

export async function refreshCodeBoards(
  client: Client,
  guildId: string
) {
  const panels =
    await prisma.panel.findMany({
      where: {
        guildId,
        type: 'code_board'
      }
    });

  const embed =
    await buildCodeEmbed(guildId);

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

export async function createCodeBoard(
  channel: TextChannel,
  guildId: string
) {
  const embed =
    await buildCodeEmbed(guildId);

  const message =
    await channel.send({
      embeds: [embed]
    });

  await prisma.panel.create({
    data: {
      guildId,

      channelId: channel.id,

      messageId: message.id,

      type: 'code_board'
    }
  });
}