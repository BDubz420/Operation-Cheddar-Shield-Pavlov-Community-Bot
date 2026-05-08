import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { prisma } from '../../services/DatabaseService';

export default class TrainerStatsCommand extends Command {
  data = new SlashCommandBuilder()

    .setName('trainerstats')

    .setDescription(
      'View trainer statistics'
    )

    .addUserOption(option =>
      option
        .setName('trainer')
        .setDescription(
          'Trainer'
        )
        .setRequired(true)
    );

  async execute(
    interaction: ChatInputCommandInteraction
  ) {
    const trainer =
      interaction.options.getUser(
        'trainer',
        true
      );

    const certs =
      await prisma.certification.findMany({
        where: {
          trainerId:
            trainer.id
        }
      });

    const certified =
      certs.filter(
        cert =>
          cert.result ===
          'CERTIFIED'
      ).length;

    const failed =
      certs.filter(
        cert =>
          cert.result ===
          'FAILED'
      ).length;

    const noShow =
      certs.filter(
        cert =>
          cert.result ===
          'NO_SHOW'
      ).length;

    const embed =
      new EmbedBuilder()

        .setColor('#d4af37')

        .setTitle(
          `🎖 ${trainer.username} Trainer Stats`
        )

        .addFields(
          {
            name:
              '✅ Certified',

            value:
              `${certified}`,

            inline: true
          },

          {
            name:
              '❌ Failed',

            value:
              `${failed}`,

            inline: true
          },

          {
            name:
              '⚠ No Show',

            value:
              `${noShow}`,

            inline: true
          },

          {
            name:
              '📚 Total Sessions',

            value:
              `${certs.length}`,

            inline: true
          }
        )

        .setFooter({
          text:
            'Spec Ops PMC • Instructor Analytics'
        })

        .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
}