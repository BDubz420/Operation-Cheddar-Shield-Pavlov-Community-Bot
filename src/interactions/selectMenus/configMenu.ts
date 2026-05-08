import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuInteraction
} from 'discord.js';

import { SelectMenu } from '../../structures/SelectMenu';

import { EmbedService } from '../../services/EmbedService';

export default class ConfigMenu extends SelectMenu {
  customId = 'config-menu';

  async execute(
    interaction: StringSelectMenuInteraction
  ) {
    const selected =
      interaction.values[0];

    switch (selected) {
      case 'general':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'General Configuration',
              [
                '⚙ Core Bot Settings',
                '',
                'Use the buttons below to configure:',
                '',
                '• Branding',
                '• Embed Colors',
                '• Logging Channels',
                '• Command Permissions'
              ].join('\n')
            )
          ],

          components: [
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(
                    'config-branding'
                  )
                  .setLabel(
                    'Configure Branding'
                  )
                  .setStyle(
                    ButtonStyle.Primary
                  ),

                new ButtonBuilder()
                  .setCustomId(
                    'config-logs'
                  )
                  .setLabel(
                    'Logging Channels'
                  )
                  .setStyle(
                    ButtonStyle.Secondary
                  )
              )
          ]
        });

      case 'notifications':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'Notification Configuration',
              [
                '📡 Notification Systems',
                '',
                'Configure:',
                '',
                '• Role Menus',
                '• Ping Roles',
                '• Announcement Channels',
                '• Event Notifications'
              ].join('\n')
            )
          ]
        });

      case 'moderation':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'Moderation Configuration',
              [
                '🛡 Moderation Systems',
                '',
                'Configure:',
                '',
                '• Auto Moderation',
                '• Punishment Roles',
                '• Logging',
                '• Staff Permissions'
              ].join('\n')
            )
          ]
        });

      case 'antiraid':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'Anti Raid Configuration',
              [
                '🧠 Raid Protection',
                '',
                'Configure:',
                '',
                '• Join Thresholds',
                '• Captcha Systems',
                '• Auto Lockdowns',
                '• Quarantine Roles'
              ].join('\n')
            )
          ]
        });

      case 'leaderboards':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'Leaderboard Configuration',
              [
                '📊 Leaderboard Systems',
                '',
                'Configure:',
                '',
                '• Playtime Tracking',
                '• Reset Timers',
                '• Reward Roles',
                '• Auto Panels'
              ].join('\n')
            )
          ]
        });

      case 'alliances':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'Alliance Configuration',
              [
                '⚔ Alliance Systems',
                '',
                'Configure:',
                '',
                '• Alliance Panels',
                '• Status Categories',
                '• Diplomatic Boards',
                '• KOS Systems'
              ].join('\n')
            )
          ]
        });

      case 'tickets':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'Ticket Configuration',
              [
                '🎫 Ticket Systems',
                '',
                'Configure:',
                '',
                '• Ticket Panels',
                '• Support Categories',
                '• Logging',
                '• Claim Systems'
              ].join('\n')
            )
          ]
        });
    }
  }
}