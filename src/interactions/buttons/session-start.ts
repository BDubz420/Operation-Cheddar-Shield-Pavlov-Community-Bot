import { prisma } from '../../services/DatabaseService';

import {
  buildSessionEmbed
} from '../../services/TrainingSessionService';

export default {
  customId: 'session-start',

  async execute(
    interaction: any
  ) {
    const sessionId =
      interaction.customId.replace(
        'session-start-',
        ''
      );

    const session =
      await prisma.trainingSession.findUnique({
        where: {
          id: sessionId
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
          'Only the trainer can start this session.',

        ephemeral: true
      });
    }

    if (
      session.status === 'ACTIVE'
    ) {
      return interaction.reply({
        content:
          'Session already active.',

        ephemeral: true
      });
    }

    await prisma.trainingSession.update({
      where: {
        id: sessionId
      },

      data: {
        status: 'ACTIVE',

        startedAt:
          new Date()
      }
    });

    const embed =
      await buildSessionEmbed(
        sessionId
      );

    await interaction.message.edit({
      embeds: [embed]
    });

    await interaction.reply({
      content:
        'Training session started.',

      ephemeral: true
    });
  }
};