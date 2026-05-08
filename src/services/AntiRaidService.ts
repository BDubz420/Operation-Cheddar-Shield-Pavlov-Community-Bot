import {
  GuildMember,
  TextChannel
} from 'discord.js';

import { prisma } from './DatabaseService';

import { EmbedService } from './EmbedService';

const joinMap = new Map<
  string,
  number[]
>();

export async function handleMemberJoin(
  member: GuildMember
) {
  const guildId = member.guild.id;

  const config =
    await prisma.guildConfig.upsert({
      where: { guildId },

      update: {},

      create: {
        guildId
      }
    });

  if (!config.antiRaidEnabled) return;

  const now = Date.now();

  const joins =
    joinMap.get(guildId) || [];

  joins.push(now);

  const validJoins = joins.filter(
    timestamp =>
      now - timestamp <
      config.raidWindowSeconds * 1000
  );

  joinMap.set(guildId, validJoins);

  // RAID DETECTED

  if (
    validJoins.length >=
    config.raidThreshold
  ) {
    await triggerRaidAlert(
      member,
      validJoins.length
    );
  }

  // SUSPICIOUS ACCOUNT

  const age =
    now -
    member.user.createdTimestamp;

  const oneDay =
    1000 * 60 * 60 * 24;

  if (age < oneDay) {
    await flagSuspiciousAccount(
      member
    );
  }
}

async function triggerRaidAlert(
  member: GuildMember,
  joins: number
) {
  const config =
    await prisma.guildConfig.findUnique({
      where: {
        guildId: member.guild.id
      }
    });

  if (!config?.raidAlertChannelId)
    return;

  const channel =
    member.guild.channels.cache.get(
      config.raidAlertChannelId
    ) as TextChannel;

  if (!channel) return;

  await channel.send({
    embeds: [
      EmbedService.error(
        'RAID DETECTED',
        [
          `🚨 Join flood detected.`,
          '',
          `Guild: ${member.guild.name}`,
          `Recent joins: ${joins}`,
          `Threshold: ${config.raidThreshold}`,
          '',
          `Latest user: ${member.user.tag}`
        ].join('\n')
      )
    ]
  });
}

async function flagSuspiciousAccount(
  member: GuildMember
) {
  const config =
    await prisma.guildConfig.findUnique({
      where: {
        guildId: member.guild.id
      }
    });

  if (!config?.raidAlertChannelId)
    return;

  const channel =
    member.guild.channels.cache.get(
      config.raidAlertChannelId
    ) as TextChannel;

  if (!channel) return;

  await channel.send({
    embeds: [
      EmbedService.warning(
        'Suspicious Account',
        [
          `⚠️ Newly created account joined.`,
          '',
          `User: ${member.user.tag}`,
          `Created: <t:${Math.floor(
            member.user.createdTimestamp /
              1000
          )}:R>`
        ].join('\n')
      )
    ]
  });
}