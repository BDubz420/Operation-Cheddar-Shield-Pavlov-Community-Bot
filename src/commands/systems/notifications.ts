import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { EmbedService } from '../../services/EmbedService';
import { prisma } from '../../services/DatabaseService';

export default class NotificationsCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('notifications')
    .setDescription(
      'Notification role systems'
    )

    .addSubcommand(sub =>
      sub
        .setName('create')
        .setDescription(
          'Create notification role panel'
        )
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    );

  async execute(
    interaction: ChatInputCommandInteraction
  ) {
    const subcommand =
      interaction.options.getSubcommand();

    switch (subcommand) {
      case 'create':
        return await this.createPanel(
          interaction
        );
    }
  }

  async createPanel(
    interaction: ChatInputCommandInteraction
  ) {
    const embed =
      EmbedService.tactical(
        'O.C.S Notifications',
        [
          '## Notification Systems',
          '',
          'Select notification roles below.',
          '',
          '📢 Announcements',
          '🎮 Events',
          '🏆 Leaderboards',
          '⚔ Operations',
          '🚨 Emergency Alerts'
        ].join('\n')
      );

    const menu =
      new StringSelectMenuBuilder()
        .setCustomId(
          'notification-role-menu'
        )
        .setPlaceholder(
          'Select notification roles'
        )
        .setMinValues(0)
        .setMaxValues(5)
        .addOptions([
          {
            label: 'Announcements',
            value: 'announcements',
            emoji: '📢'
          },
          {
            label: 'Events',
            value: 'events',
            emoji: '🎮'
          },
          {
            label: 'Leaderboards',
            value: 'leaderboards',
            emoji: '🏆'
          },
          {
            label: 'Operations',
            value: 'operations',
            emoji: '⚔'
          },
          {
            label: 'Emergency Alerts',
            value: 'alerts',
            emoji: '🚨'
          }
        ]);

    const row =
      new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(menu);

    const channel = interaction.channel;

    if (!channel || !channel.isSendable()) {
      return await interaction.reply({
        embeds: [
          EmbedService.error(
            'Invalid Channel',
            'This channel cannot receive messages.'
          )
        ],

        flags: ['Ephemeral']
      });
    }

    const message = await channel.send({
      embeds: [embed],
      components: [row]
    });

    await prisma.panel.create({
      data: {
        guildId: interaction.guildId!,
        channelId: channel.id,
        messageId: message.id,
        type: 'notification_roles'
      }
    });

    await interaction.reply({
      embeds: [
        EmbedService.success(
          'Notification Panel Created',
          'Notification role panel deployed successfully.'
        )
      ],
      flags: ['Ephemeral']
    });
  }
}