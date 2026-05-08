import {
  EmbedBuilder
} from 'discord.js';

import { prisma } from '../../services/DatabaseService';

import {
  buildSessionEmbed
} from '../../services/TrainingSessionService';

export default {
  customId: 'session-join',

  async execute(
    interaction: any
  ) {
    const sessionId =
      interaction.customId.replace(
        'session-join-',
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
          'Session no longer exists.',

        ephemeral: true
      });
    }

    // Already joined

    const existing =
      session.trainees.find(
        trainee =>
          trainee.userId ===
          interaction.user.id
      );

    if (existing) {
      return interaction.reply({
        content:
          'You are already in this session.',

        ephemeral: true
      });
    }

    // Add trainee

    await prisma.sessionTrainee.create({
      data: {
        sessionId,
        userId:
          interaction.user.id,
        username:
          interaction.user.username
      }
    });

    // Refresh embed

    const updatedEmbed =
      await buildSessionEmbed(
        sessionId
      );

    await interaction.message.edit({
      embeds: [updatedEmbed]
    });

    await interaction.reply({
      content:
        'You joined the training session.',

      ephemeral: true
    });
  }
};