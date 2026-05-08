import {
  StringSelectMenuInteraction
} from 'discord.js';

import { SelectMenu } from '../../structures/SelectMenu';

import { EmbedService } from '../../services/EmbedService';

export default class HelpMenu extends SelectMenu {
  customId = 'help-menu';

  async execute(
    interaction: StringSelectMenuInteraction
  ) {
    const selected =
      interaction.values[0];

    switch (selected) {
      case 'moderation':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'Moderation Systems',
              [
                '`/ban`',
                '`/kick`',
                '`/mute`',
                '`/warn`',
                '`/purge`',
                '`/lockdown`'
              ].join('\n')
            )
          ]
        });

      case 'leaderboards':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'Leaderboard Systems',
              [
                '`/playtime`',
                '`/leaderboard`',
                '`/stats`'
              ].join('\n')
            )
          ]
        });

      case 'alliances':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'Alliance Systems',
              [
                '`/alliance add`',
                '`/alliance remove`',
                '`/alliance list`',
                '`/kos add`',
                '`/kos remove`'
              ].join('\n')
            )
          ]
        });

      case 'config':
        return await interaction.update({
          embeds: [
            EmbedService.tactical(
              'Configuration Systems',
              [
                '`/config`',
                '`/panel`',
                '`/setup`'
              ].join('\n')
            )
          ]
        });
    }
  }
}