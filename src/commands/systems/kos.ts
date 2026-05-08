import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { prisma } from '../../services/DatabaseService';

import { EmbedService } from '../../services/EmbedService';

import {
  createKOSBoard,
  refreshKOSBoards
} from '../../services/KOSBoardService';

export default class KOSCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('kos')
    .setDescription(
      'KOS / Blacklist management'
    )

    // ADD

    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription(
          'Blacklist a player'
        )

        .addStringOption(option =>
          option
            .setName('player')
            .setDescription(
              'Player name'
            )
            .setRequired(true)
        )

        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription(
              'Blacklist reason'
            )
            .setRequired(true)
        )
    )

    // REMOVE

    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription(
          'Remove blacklist entry'
        )

        .addStringOption(option =>
          option
            .setName('player')
            .setDescription(
              'Player name'
            )
            .setRequired(true)
        )
    )

    // LOOKUP

    .addSubcommand(sub =>
      sub
        .setName('lookup')
        .setDescription(
          'Lookup blacklist entry'
        )

        .addStringOption(option =>
          option
            .setName('player')
            .setDescription(
              'Player name'
            )
            .setRequired(true)
        )
    )

    // BOARD

    .addSubcommand(sub =>
      sub
        .setName('board')
        .setDescription(
          'Deploy KOS board'
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
      case 'add':
        return await this.addEntry(
          interaction
        );

      case 'remove':
        return await this.removeEntry(
          interaction
        );

      case 'lookup':
        return await this.lookupEntry(
          interaction
        );

      case 'board':
        return await this.createBoard(
          interaction
        );
    }
  }

  async addEntry(
    interaction: ChatInputCommandInteraction
  ) {
    const player =
      interaction.options.getString(
        'player',
        true
      );

    const reason =
      interaction.options.getString(
        'reason',
        true
      );

    await prisma.kOS.create({
      data: {
        guildId: interaction.guildId!,
        target: player,
        reason,
        addedBy: interaction.user.id
      }
    });

    await refreshKOSBoards(
      interaction.client,
      interaction.guildId!
    );

    await interaction.reply({
      embeds: [
        EmbedService.success(
          'KOS Entry Added',
          `${player} blacklisted successfully.`
        )
      ],

      flags: ['Ephemeral']
    });
  }

  async removeEntry(
    interaction: ChatInputCommandInteraction
  ) {
    const player =
      interaction.options.getString(
        'player',
        true
      );

    await prisma.kOS.deleteMany({
      where: {
        guildId: interaction.guildId!,
        target: player
      }
    });

    await refreshKOSBoards(
      interaction.client,
      interaction.guildId!
    );

    await interaction.reply({
      embeds: [
        EmbedService.success(
          'KOS Entry Removed',
          `${player} removed successfully.`
        )
      ],

      flags: ['Ephemeral']
    });
  }

  async lookupEntry(
    interaction: ChatInputCommandInteraction
  ) {
    const player =
      interaction.options.getString(
        'player',
        true
      );

    const entry =
      await prisma.kOS.findFirst({
        where: {
          guildId: interaction.guildId!,
          target: player
        }
      });

    if (!entry) {
      return await interaction.reply({
        embeds: [
          EmbedService.error(
            'No Entry Found',
            `${player} is not blacklisted.`
          )
        ],

        flags: ['Ephemeral']
      });
    }

    await interaction.reply({
      embeds: [
        EmbedService.tactical(
          `KOS Lookup: ${player}`,
          [
            `Reason: ${entry.reason}`,
            `Added By: <@${entry.addedBy}>`
          ].join('\n')
        )
      ],

      flags: ['Ephemeral']
    });
  }

  async createBoard(
    interaction: ChatInputCommandInteraction
  ) {
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

    await createKOSBoard(
      channel as any,
      interaction.guildId!
    );

    await interaction.reply({
      embeds: [
        EmbedService.success(
          'KOS Board Created',
          'Persistent blacklist board deployed.'
        )
      ],

      flags: ['Ephemeral']
    });
  }
}