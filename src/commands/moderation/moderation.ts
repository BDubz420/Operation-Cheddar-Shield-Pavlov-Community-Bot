import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { EmbedService } from '../../services/EmbedService';

import {
  createPunishment,
  getPunishments
} from '../../services/ModerationService';

export default class ModerationCommand extends Command {
  data = new SlashCommandBuilder()

    .setName('moderation')

    .setDescription(
      'Moderation systems'
    )

    // WARN

    .addSubcommand(sub =>
      sub
        .setName('warn')
        .setDescription('Warn user')

        .addUserOption(option =>
          option
            .setName('user')
            .setDescription(
              'Target user'
            )
            .setRequired(true)
        )

        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription(
              'Punishment reason'
            )
            .setRequired(true)
        )
    )

    // HISTORY

    .addSubcommand(sub =>
      sub
        .setName('history')
        .setDescription(
          'View punishment history'
        )

        .addUserOption(option =>
          option
            .setName('user')
            .setDescription(
              'Target user'
            )
            .setRequired(true)
        )
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.ModerateMembers
    );

  async execute(
    interaction: ChatInputCommandInteraction
  ) {
    const subcommand =
      interaction.options.getSubcommand();

    switch (subcommand) {
      case 'warn':
        return await this.warnUser(
          interaction
        );

      case 'history':
        return await this.userHistory(
          interaction
        );
    }
  }

  async warnUser(
    interaction: ChatInputCommandInteraction
  ) {
    const user =
      interaction.options.getUser(
        'user',
        true
      );

    const reason =
      interaction.options.getString(
        'reason',
        true
      );

    await createPunishment({
      guildId: interaction.guildId!,
      userId: user.id,
      moderatorId: interaction.user.id,
      type: 'warn',
      reason
    });

    await interaction.reply({
      embeds: [
        EmbedService.warning(
          'User Warned',
          [
            `User: ${user}`,
            `Reason: ${reason}`,
            `Moderator: ${interaction.user}`
          ].join('\n')
        )
      ],

      flags: ['Ephemeral']
    });
  }

  async userHistory(
    interaction: ChatInputCommandInteraction
  ) {
    const user =
      interaction.options.getUser(
        'user',
        true
      );

    const punishments =
      await getPunishments(
        interaction.guildId!,
        user.id
      );

    await interaction.reply({
      embeds: [
        EmbedService.tactical(
          `${user.username} History`,
          punishments.length
            ? punishments
                .map(
                  punishment =>
                    `🔸 ${punishment.type.toUpperCase()}\n` +
                    `└ ${punishment.reason}`
                )
                .join('\n\n')
            : 'No punishments found.'
        )
      ],

      flags: ['Ephemeral']
    });
  }
}