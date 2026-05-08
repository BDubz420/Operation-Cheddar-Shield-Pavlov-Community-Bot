import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';

import { prisma } from './DatabaseService';

export async function buildCertificationEmbed(
  sessionId: string
) {
  const session =
    await prisma.trainingSession.findUnique({
      where: {
        id: sessionId
      },

      include: {
        trainees: true
      }
    });

  if (!session) {
    throw new Error(
      'Session not found'
    );
  }

  return new EmbedBuilder()

    .setColor('#d4af37')

    .setTitle(
      '🎖 Certification Review'
    )

    .setDescription(
      [
        `📚 Trainer: <@${session.trainerId}>`,
        `✈ Branch: ${session.branch}`,
        '',
        'Review trainee performance below.'
      ].join('\n')
    )

    .addFields(
      session.trainees.map(
        trainee => ({
          name:
            trainee.username,

          value:
            trainee.status,

          inline: false
        })
      )
    )

    .setFooter({
      text:
        'Spec Ops PMC • Certification Division'
    })

    .setTimestamp();
}

export function buildCertificationButtons(
  sessionId: string,
  traineeId: string
) {
  return new ActionRowBuilder<ButtonBuilder>()

    .addComponents(
      new ButtonBuilder()

        .setCustomId(
          `cert-pass-${sessionId}-${traineeId}`
        )

        .setLabel(
          'Certify'
        )

        .setEmoji('✅')

        .setStyle(
          ButtonStyle.Success
        ),

      new ButtonBuilder()

        .setCustomId(
          `cert-fail-${sessionId}-${traineeId}`
        )

        .setLabel(
          'Fail'
        )

        .setEmoji('❌')

        .setStyle(
          ButtonStyle.Danger
        ),

      new ButtonBuilder()

        .setCustomId(
          `cert-noshow-${sessionId}-${traineeId}`
        )

        .setLabel(
          'No Show'
        )

        .setEmoji('⚠')

        .setStyle(
          ButtonStyle.Secondary
        )
    );
}