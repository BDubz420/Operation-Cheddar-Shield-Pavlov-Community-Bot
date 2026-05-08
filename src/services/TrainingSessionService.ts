import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextChannel
} from 'discord.js';

import { prisma } from './DatabaseService';

export async function createTrainingSession(
  channel: TextChannel,
  guildId: string,
  trainerId: string,
  trainerName: string,
  branch: string
) {
  const session =
    await prisma.trainingSession.create({
      data: {
        guildId,
        trainerId,
        trainerName,
        branch
      }
    });

  const embed =
    await buildSessionEmbed(
      session.id
    );

  const row =
    new ActionRowBuilder<ButtonBuilder>()

      .addComponents(
        new ButtonBuilder()

          .setCustomId(
            `session-join-${session.id}`
          )

          .setLabel(
            'Join Session'
          )

          .setEmoji('📥')

          .setStyle(
            ButtonStyle.Success
          ),

        new ButtonBuilder()

          .setCustomId(
            `session-leave-${session.id}`
          )

          .setLabel(
            'Leave'
          )

          .setEmoji('🚪')

          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()

          .setCustomId(
            `session-start-${session.id}`
          )

          .setLabel(
            'Start Session'
          )

          .setEmoji('📚')

          .setStyle(
            ButtonStyle.Primary
          ),

        new ButtonBuilder()

          .setCustomId(
            `session-end-${session.id}`
          )

          .setLabel(
            'End Session'
          )

          .setEmoji('✅')

          .setStyle(
            ButtonStyle.Danger
          )
      );

  const message =
    await channel.send({
      embeds: [embed],
      components: [row]
    });

  await prisma.trainingSession.update({
    where: {
      id: session.id
    },

    data: {
      messageId: message.id
    }
  });

  return session;
}

export async function buildSessionEmbed(
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

  const traineeList =
    session.trainees.length
      ? session.trainees
          .map(
            trainee =>
              `• ${trainee.username}`
          )
          .join('\n')
      : 'No trainees joined';

  return new EmbedBuilder()

    .setColor('#d4af37')

    .setTitle(
      `🎖 ${session.branch} Training Session`
    )

    .setDescription(
      [
        `📚 Trainer: <@${session.trainerId}>`,
        '',
        `📌 Status: ${session.status}`,
        '',
        '👥 Trainees',
        traineeList
      ].join('\n')
    )

    .setFooter({
      text:
        'Spec Ops PMC • Training Command'
    })

    .setTimestamp();
}