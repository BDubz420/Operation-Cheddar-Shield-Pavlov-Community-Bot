import { prisma } from '../../services/DatabaseService';

import {
  buildSessionEmbed
} from '../../services/TrainingSessionService';

export default {
  customId: 'session-leave',

  async execute(
    interaction: any
  ) {
    const sessionId =
      interaction.customId.replace(
        'session-leave-',
        ''
      );

    await prisma.sessionTrainee.deleteMany({
      where: {
        sessionId,
        userId:
          interaction.user.id
      }
    });

    const updatedEmbed =
      await buildSessionEmbed(
        sessionId
      );

    await interaction.message.edit({
      embeds: [updatedEmbed]
    });

    await interaction.reply({
      content:
        'You left the training session.',

      ephemeral: true
    });
  }
};