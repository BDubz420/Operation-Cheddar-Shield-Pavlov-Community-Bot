import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextChannel
} from 'discord.js';

import { prisma } from './DatabaseService';

export async function postTrainerDashboard(
  channel: TextChannel,
  guildId: string
) {
  const embed =
    await buildDashboardEmbed(
      guildId
    );

  const row =
    new ActionRowBuilder<ButtonBuilder>()

      .addComponents(
        new ButtonBuilder()

          .setCustomId(
            'trainer-duty-on'
          )

          .setLabel(
            'Go On Duty'
          )

          .setStyle(
            ButtonStyle.Success
          ),

        new ButtonBuilder()

          .setCustomId(
            'trainer-duty-off'
          )

          .setLabel(
            'Go Off Duty'
          )

          .setStyle(
            ButtonStyle.Danger
          ),

        new ButtonBuilder()

          .setCustomId(
            'trainer-session-start'
          )

          .setLabel(
            'Start Session'
          )

          .setStyle(
            ButtonStyle.Primary
          ),

        new ButtonBuilder()

          .setCustomId(
            'trainer-session-end'
          )

          .setLabel(
            'End Session'
          )

          .setStyle(
            ButtonStyle.Secondary
          )
      );

  await channel.send({
    embeds: [embed],
    components: [row]
  });
}

export async function buildDashboardEmbed(
  guildId: string
) {
  const trainers =
    await prisma.trainerStatus.findMany({
      where: {
        guildId,
        onDuty: true
      }
    });

  const sessions =
    await prisma.trainerStatus.findMany({
      where: {
        guildId,
        activeSession: true
      }
    });

  const waiting =
    await prisma.trainerRequest.count({
      where: {
        guildId,
        status: 'OPEN'
      }
    });

  const completed =
    await prisma.trainerRequest.count({
      where: {
        guildId,
        status: 'COMPLETED'
      }
    });

  return new EmbedBuilder()

    .setColor('#d4af37')

    .setTitle(
      '🎖 Training Operations Dashboard'
    )

    .addFields(
      {
        name:
          '🟢 Trainers On Duty',

        value:
          trainers.length
            ? trainers
                .map(
                  t =>
                    `• ${t.username}`
                )
                .join('\n')
            : 'None'
      },

      {
        name:
          '📚 Active Sessions',

        value:
          sessions.length
            ? sessions
                .map(
                  t =>
                    `• ${t.username}`
                )
                .join('\n')
            : 'None'
      },

      {
        name:
          '⏳ Waiting Requests',

        value:
          `${waiting}`,

        inline: true
      },

      {
        name:
          '✅ Completed Trainings',

        value:
          `${completed}`,

        inline: true
      }
    )

    .setFooter({
      text:
        'Spec Ops PMC • Training Command'
    })

    .setTimestamp();
}