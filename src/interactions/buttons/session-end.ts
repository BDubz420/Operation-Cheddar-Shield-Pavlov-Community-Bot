import {
  EmbedBuilder
} from 'discord.js';

import { prisma } from '../../services/DatabaseService';

import {
  buildCertificationEmbed,
  buildCertificationButtons
} from '../../services/TrainingCertificationService';

export default {
  customId: 'session-end',

  async execute(
    interaction: any
  ) {
    const sessionId =
      interaction.customId.replace(
        'session-end-',
        ''
      );

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
      return interaction.reply({
        content:
          'Session not found.',

        ephemeral: true
      });
    }

    if (
      session.trainerId !==
      interaction.user.id
    ) {
      return interaction.reply({
        content:
          'Only the trainer can end this session.',

        ephemeral: true
      });
    }

    await prisma.trainingSession.update({
      where: {
        id: sessionId
      },

      data: {
        status:
          'CERTIFICATION',

        endedAt:
          new Date()
      }
    });

    const embed =
      await buildCertificationEmbed(
        sessionId
      );

    await interaction.message.edit({
      embeds: [embed],
      components: []
    });

    for (const trainee of session.trainees) {
      const traineeEmbed =
        new EmbedBuilder()

          .setColor('#d4af37')

          .setTitle(
            '🎖 Trainee Review'
          )

          .setDescription(
            [
              `👤 Recruit: <@${trainee.userId}>`,
              `✈ Branch: ${session.branch}`,
              '',
              'Select certification result below.'
            ].join('\n')
          );

      await interaction.channel.send({
        embeds: [traineeEmbed],

        components: [
          buildCertificationButtons(
            session.id,
            trainee.id
          )
        ]
      });
    }

    await interaction.reply({
      content:
        'Training moved into certification phase.',

      ephemeral: true
    });
  }
};