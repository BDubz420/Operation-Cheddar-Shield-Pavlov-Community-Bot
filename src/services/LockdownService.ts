import {
  Guild,
  PermissionsBitField
} from 'discord.js';

import { EmbedService } from './EmbedService';

const STAFF_PERMISSIONS = [
  PermissionsBitField.Flags.Administrator,
  PermissionsBitField.Flags.ManageGuild,
  PermissionsBitField.Flags.ManageChannels,
  PermissionsBitField.Flags.ModerateMembers
];

function isStaffRole(role: any) {
  return STAFF_PERMISSIONS.some(permission =>
    role.permissions.has(permission)
  );
}

export async function lockdownGuild(
  guild: Guild,
  moderatorTag: string
) {
  let lockedChannels = 0;

  for (const channel of guild.channels.cache.values()) {
    if (
      !channel.isTextBased() ||
      channel.isDMBased() ||
      !('permissionOverwrites' in channel)
    ) {
      continue;
    }

    for (const role of guild.roles.cache.values()) {
      // Skip managed roles
      if (role.managed) continue;

      // Skip @everyone separately later
      if (isStaffRole(role)) continue;

      try {
        await channel.permissionOverwrites.edit(
          role,
          {
            SendMessages: false,
            AddReactions: false,
            SendMessagesInThreads: false,
            CreatePublicThreads: false,
            CreatePrivateThreads: false
          }
        );
      } catch {
        continue;
      }
    }

    // ALSO lock @everyone
    try {
      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        {
          SendMessages: false,
          AddReactions: false,
          SendMessagesInThreads: false,
          CreatePublicThreads: false,
          CreatePrivateThreads: false
        }
      );
    } catch {}

    lockedChannels++;
  }

  return EmbedService.error(
    'SERVER LOCKDOWN ENABLED',
    [
      '🚨 Aggressive lockdown activated.',
      '',
      `Moderator: ${moderatorTag}`,
      `Channels Locked: ${lockedChannels}`,
      '',
      'All non-staff communication disabled.'
    ].join('\n')
  );
}

export async function unlockGuild(
  guild: Guild,
  moderatorTag: string
) {
  let unlockedChannels = 0;

  for (const channel of guild.channels.cache.values()) {
    if (
      !channel.isTextBased() ||
      channel.isDMBased() ||
      !('permissionOverwrites' in channel)
    ) {
      continue;
    }

    for (const role of guild.roles.cache.values()) {
      if (role.managed) continue;

      if (isStaffRole(role)) continue;

      try {
        await channel.permissionOverwrites.edit(
          role,
          {
            SendMessages: null,
            AddReactions: null,
            SendMessagesInThreads: null,
            CreatePublicThreads: null,
            CreatePrivateThreads: null
          }
        );
      } catch {
        continue;
      }
    }

    try {
      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        {
          SendMessages: null,
          AddReactions: null,
          SendMessagesInThreads: null,
          CreatePublicThreads: null,
          CreatePrivateThreads: null
        }
      );
    } catch {}

    unlockedChannels++;
  }

  return EmbedService.success(
    'SERVER LOCKDOWN REMOVED',
    [
      '✅ Lockdown removed.',
      '',
      `Moderator: ${moderatorTag}`,
      `Channels Restored: ${unlockedChannels}`
    ].join('\n')
  );
}