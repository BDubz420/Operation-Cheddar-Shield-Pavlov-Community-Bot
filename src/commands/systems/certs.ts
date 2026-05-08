import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { prisma } from '../../services/DatabaseService';

export default class CertsCommand extends Command {
  data = new SlashCommandBuilder()

    .setName('certs')

    .setDescription(
      'View certifications'
    )

    .addUserOption(option =>
      option
        .setName('user')
        .setDescription(
          'User to inspect'
        )
        .setRequired(true)
    );

  async execute(
    interaction: ChatInputCommandInteraction
  ) {
    const user =
      interaction.options.getUser(
        'user',
        true
      );

    const certs =
      await prisma.certification.findMany({
        where: {
          guildId:
            interaction.guildId!,

          userId:
            user.id
        },

        orderBy: {
          certifiedAt:
            'desc'
        }
      });

    const embed =
      new EmbedBuilder()

        .setColor('#d4af37')

        .setTitle(
          `🎖 ${user.username} Certifications`
        )

        .setDescription(
          certs.length
            ? certs.map(cert =>
                [
                  `✈ Branch: ${cert.branch}`,
                  `📌 Result: ${cert.result}`,
                  `🎖 Trainer: ${cert.trainerName}`,
                  `📅 ${cert.certifiedAt.toLocaleString()}`
                ].join('\n')
              ).join('\n\n')
            : 'No certifications found.'
        )

        .setFooter({
          text:
            'Spec Ops PMC • Certification Records'
        })

        .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
}