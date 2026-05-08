import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { EmbedService } from '../../services/EmbedService';

export default class HelpCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('help')
    .setDescription(
      'Open the O.C.S Command Center'
    );

  async execute(
    interaction: ChatInputCommandInteraction
  ) {
    const embed =
      EmbedService.tactical(
        'Operation Cheddar Shield',
        [
          '## Tactical Command Center',
          '',
          'Select a system below.',
          '',
          '🛡 Moderation',
          '📊 Leaderboards',
          '⚔ Alliance Systems',
          '🚫 KOS / Blacklist',
          '🎖 Staff Systems',
          '🎫 Support Systems',
          '📡 Notifications',
          '🧠 Anti Raid',
          '⚙ Configuration'
        ].join('\n')
      );

    const menu =
      new StringSelectMenuBuilder()
        .setCustomId('help-menu')
        .setPlaceholder(
          'Select a system'
        )
        .addOptions([
          {
            label: 'Moderation',
            description:
              'Moderation commands',
            emoji: '🛡',
            value: 'moderation'
          },
          {
            label: 'Leaderboards',
            description:
              'Leaderboard systems',
            emoji: '📊',
            value: 'leaderboards'
          },
          {
            label: 'Alliances',
            description:
              'Alliance management',
            emoji: '⚔',
            value: 'alliances'
          },
          {
            label: 'Configuration',
            description:
              'Bot configuration',
            emoji: '⚙',
            value: 'config'
          }
        ]);

    const row =
      new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
}