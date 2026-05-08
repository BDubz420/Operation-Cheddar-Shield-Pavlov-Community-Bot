import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { prisma } from '../../services/DatabaseService';

import { EmbedService } from '../../services/EmbedService';

import {
  createDefconBoard,
  refreshDefconBoards
} from '../../services/DefconService';

export default class DefconCommand extends Command {
  data = new SlashCommandBuilder()

    .setName('defcon')

    .setDescription(
      'DEFCON management system'
    )

    .addSubcommand(sub =>
      sub
        .setName('post')

        .setDescription(
          'Post DEFCON board'
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('set')

        .setDescription(
          'Set DEFCON level'
        )

        .addIntegerOption(option =>
          option
            .setName('level')
            .setDescription(
              'DEFCON level 1-5'
            )
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(5)
        )

        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription(
              'Situation description'
            )
            .setRequired(false)
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
      case 'post':
        return await this.post(interaction);

      case 'set':
        return await this.set(interaction);
    }
  }

  async post(
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.deferReply({
      ephemeral: true
    });

    const channel =
      interaction.channel;

    if (
      !channel ||
      !channel.isSendable()
    ) {
      return;
    }

    await createDefconBoard(
      channel as any,
      interaction.guildId!
    );

    await interaction.editReply({
      embeds: [
        EmbedService.success(
          'DEFCON Board Created',
          'Persistent DEFCON board deployed.'
        )
      ]
    });
  }

  async set(
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.deferReply({
      ephemeral: true
    });

    const level =
      interaction.options.getInteger(
        'level',
        true
      );

    const reason =
      interaction.options.getString(
        'reason'
      ) ||
      'Operational status updated.';

    await prisma.defconStatus.upsert({
      where: {
        guildId:
          interaction.guildId!
      },

      update: {
        level,
        description: reason
      },

      create: {
        guildId:
          interaction.guildId!,

        level,

        title: `DEFCON ${level}`,

        description: reason
      }
    });

    await refreshDefconBoards(
      interaction.client,
      interaction.guildId!
    );

    await interaction.editReply({
      embeds: [
        EmbedService.success(
          'DEFCON Updated',
          `DEFCON level set to ${level}.`
        )
      ]
    });
  }
}