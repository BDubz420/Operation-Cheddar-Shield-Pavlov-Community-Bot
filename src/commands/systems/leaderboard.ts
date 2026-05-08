import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { EmbedService } from '../../services/EmbedService';

import {
  createLeaderboardBoard,
  refreshLeaderboardBoards,
  updatePlayerPlaytime
} from '../../services/LeaderboardService';

export default class LeaderboardCommand extends Command {
  data = new SlashCommandBuilder()

    .setName('leaderboard')

    .setDescription(
      'Leaderboard management'
    )

    // ADD TIME

    .addSubcommand(sub =>
      sub
        .setName('addtime')
        .setDescription(
          'Add player playtime'
        )

        .addStringOption(option =>
          option
            .setName('player')
            .setDescription(
              'Player name'
            )
            .setRequired(true)
        )

        .addIntegerOption(option =>
          option
            .setName('minutes')
            .setDescription(
              'Minutes to add'
            )
            .setRequired(true)
        )
    )

    // BOARD

    .addSubcommand(sub =>
      sub
        .setName('board')
        .setDescription(
          'Deploy leaderboard board'
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
      case 'addtime':
        return await this.addTime(
          interaction
        );

      case 'board':
        return await this.createBoard(
          interaction
        );
    }
  }

  async addTime(
    interaction: ChatInputCommandInteraction
  ) {
    const player =
      interaction.options.getString(
        'player',
        true
      );

    const minutes =
      interaction.options.getInteger(
        'minutes',
        true
      );

    await updatePlayerPlaytime(
      interaction.guildId!,
      player,
      minutes
    );

    await refreshLeaderboardBoards(
      interaction.client,
      interaction.guildId!
    );

    await interaction.reply({
      embeds: [
        EmbedService.success(
          'Leaderboard Updated',
          `${minutes} mins added to ${player}.`
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

    await createLeaderboardBoard(
      channel as any,
      interaction.guildId!
    );

    await interaction.reply({
      embeds: [
        EmbedService.success(
          'Leaderboard Created',
          'Persistent leaderboard deployed.'
        )
      ],

      flags: ['Ephemeral']
    });
  }
}