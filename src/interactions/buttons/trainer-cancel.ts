import {
  EmbedBuilder
} from 'discord.js';

import { prisma } from '../../services/DatabaseService';

export default {
  customId:
    'trainer-cancel',

  async execute(
    interaction: any
  ) {
    const embed =
      EmbedBuilder.from(
        interaction.message.embeds[0]
      );

    const fields =
      embed.data.fields || [];

    const statusField =
      fields.find(
        field =>
          field.name ===
          '📌 Status'
      );

    if (statusField) {
      statusField.value =
        '🔴 TRAINING CANCELLED';
    }

    embed.setFields(fields);

    embed.setColor('#ed4245');

    const request =
      await prisma.trainerRequest.findFirst({
        where: {
          messageId:
            interaction.message.id
        }
      });

    if (request) {
      await prisma.trainerRequest.update({
        where: {
          id: request.id
        },

        data: {
          status:
            'CANCELLED'
        }
      });
    }

    await interaction.update({
      embeds: [embed],
      components: []
    });
  }
};