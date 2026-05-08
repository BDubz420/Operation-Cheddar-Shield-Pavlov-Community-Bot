import {
  EmbedBuilder
} from 'discord.js';

import { prisma } from './DatabaseService';

export async function logTrainingSession(
  interaction: any,
  sessionId: string
) {
  const config =
    await prisma.trainingLogConfig.findUnique({
      where: {
        guildId:
          interaction.guildId
      }
    });

  if (!config) return;

  const session =
    await prisma.trainingSession.findUnique({
      where: {
        id: sessionId
      },

      include: {
        trainees: true
      }
    });

  if (!session) return;

  const certified =
    session.trainees
      .filter(
        trainee =>
          trainee.status ===
          'CERTIFIED'
      )
      .map(
        trainee =>
          `✅ <@${trainee.userId}>`
      );

  const failed =
    session.trainees
      .filter(
        trainee =>
          trainee.status ===
          'FAILED'
      )
      .map(
        trainee =>
          `❌ <@${trainee.userId}>`
      );

  const noShow =
    session.trainees
      .filter(
        trainee =>
          trainee.status ===
          'NO_SHOW'
      )
      .map(
        trainee =>
          `⚠ <@${trainee.userId}>`
      );

  const embed =
    new EmbedBuilder()

      .setColor('#d4af37')

      .setTitle(
        '🎖 Training Session Completed'
      )

      .setDescription(
        [
          `📚 Trainer: <@${session.trainerId}>`,
          `✈ Branch: ${session.branch}`,
          '',
          `✅ Certified: ${
            certified.length || 0
          }`,
          `❌ Failed: ${
            failed.length || 0
          }`,
          `⚠ No Show: ${
            noShow.length || 0
          }`
        ].join('\n')
      )

      .addFields(
        {
          name:
            '✅ Certified',

          value:
            certified.join('\n') ||
            'None',

          inline: false
        },

        {
          name:
            '❌ Failed',

          value:
            failed.join('\n') ||
            'None',

          inline: false
        },

        {
          name:
            '⚠ No Show',

          value:
            noShow.join('\n') ||
            'None',

          inline: false
        }
      )

      .setFooter({
        text:
          'Spec Ops PMC • Training Division'
      })

      .setTimestamp();

  const channel =
    await interaction.guild.channels.fetch(
      config.channelId
    );

  if (
    channel &&
    channel.isTextBased()
  ) {
    await channel.send({
      embeds: [embed]
    });
  }
}