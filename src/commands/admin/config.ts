import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { EmbedService } from '../../services/EmbedService';

export default class ConfigCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('config')
    .setDescription(
      'Open the O.C.S configuration center'
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    );

  async execute(
    interaction: ChatInputCommandInteraction
  ) {
    const embed =
      EmbedService.tactical(
        'O.C.S Configuration Center',
        [
          '## System Configuration',
          '',
          'Select a system to configure.',
          '',
          '⚙ General Settings',
          '📡 Notifications',
          '🛡 Moderation',
          '🧠 Anti Raid',
          '📊 Leaderboards',
          '⚔ Alliance Systems',
          '🎫 Ticket Systems'
        ].join('\n')
      );

    const menu =
      new StringSelectMenuBuilder()
        .setCustomId('config-menu')
        .setPlaceholder(
          'Select a configuration category'
        )
        .addOptions([
          {
            label: 'General',
            value: 'general',
            emoji: '⚙',
            description:
              'General bot settings'
          },
          {
            label: 'Notifications',
            value: 'notifications',
            emoji: '📡',
            description:
              'Notification role systems'
          },
          {
            label: 'Moderation',
            value: 'moderation',
            emoji: '🛡',
            description:
              'Moderation settings'
          },
          {
            label: 'Anti Raid',
            value: 'antiraid',
            emoji: '🧠',
            description:
              'Raid protection systems'
          },
          {
            label: 'Leaderboards',
            value: 'leaderboards',
            emoji: '📊',
            description:
              'Leaderboard settings'
          },
          {
            label: 'Alliances',
            value: 'alliances',
            emoji: '⚔',
            description:
              'Alliance systems'
          },
          {
            label: 'Tickets',
            value: 'tickets',
            emoji: '🎫',
            description:
              'Ticket system settings'
          }
        ]);

    const row =
      new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
}