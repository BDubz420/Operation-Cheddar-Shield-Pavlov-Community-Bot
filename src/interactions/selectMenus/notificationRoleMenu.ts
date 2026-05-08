import {
  StringSelectMenuInteraction
} from 'discord.js';

import { SelectMenu } from '../../structures/SelectMenu';

import { EmbedService } from '../../services/EmbedService';

export default class NotificationRoleMenu extends SelectMenu {
  customId = 'notification-role-menu';

  async execute(
    interaction: StringSelectMenuInteraction
  ) {
    const roleMap = {
      announcements:
        process.env.ROLE_ANNOUNCEMENTS,

      events: process.env.ROLE_EVENTS,

      leaderboards:
        process.env.ROLE_LEADERBOARDS,

      operations:
        process.env.ROLE_OPERATIONS,

      alerts: process.env.ROLE_ALERTS
    };

    const member =
      interaction.guild?.members.cache.get(
        interaction.user.id
      );

    if (!member) return;

    for (const roleId of Object.values(
      roleMap
    )) {
      if (!roleId) continue;

      const role =
        interaction.guild?.roles.cache.get(
          roleId
        );

      if (role) {
        await member.roles.remove(role);
      }
    }

    for (const selected of interaction.values) {
      const roleId =
        roleMap[
          selected as keyof typeof roleMap
        ];

      if (!roleId) continue;

      const role =
        interaction.guild?.roles.cache.get(
          roleId
        );

      if (role) {
        await member.roles.add(role);
      }
    }

    await interaction.reply({
      embeds: [
        EmbedService.success(
          'Roles Updated',
          'Your notification roles were updated.'
        )
      ],

      flags: ['Ephemeral']
    });
  }
}