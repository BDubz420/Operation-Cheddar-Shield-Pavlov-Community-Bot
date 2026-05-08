import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { prisma } from '../../services/DatabaseService';

import { EmbedService } from '../../services/EmbedService';

import {
  createCodeBoard,
  refreshCodeBoards
} from '../../services/CodeStatusService';

export default class CodeCommand extends Command {
  data = new SlashCommandBuilder()

    .setName('code')

    .setDescription(
      'Operational code management'
    )

    .addSubcommand(sub =>
      sub
        .setName('post')

        .setDescription(
          'Post operational code board'
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('set')

        .setDescription(
          'Set operational code'
        )

        .addStringOption(option =>
          option
            .setName('code')
            .setDescription(
              'Operational code'
            )
            .setRequired(true)

            .addChoices(
              {
                name: 'GREEN',
                value: 'GREEN'
              },

              {
                name: 'YELLOW',
                value: 'YELLOW'
              },

              {
                name: 'ORANGE',
                value: 'ORANGE'
              },

              {
                name: 'RED',
                value: 'RED'
              },

              {
                name: 'BLACK',
                value: 'BLACK'
              }
            )
        )

        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription(
              'Operational notes'
            )
            .setRequired(false)
        )

        .addIntegerOption(option =>
          option
            .setName('duration')

            .setDescription(
              'Duration in minutes'
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

    await createCodeBoard(
      channel as any,
      interaction.guildId!
    );

    await interaction.editReply({
      embeds: [
        EmbedService.success(
          'Code Board Created',
          'Operational code board deployed.'
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

    const code =
      interaction.options.getString(
        'code',
        true
      );

    const duration =
      interaction.options.getInteger(
        'duration'
      );

    const reason =
      interaction.options.getString(
        'reason'
      ) ||
      'Operational status updated.';

    await prisma.codeStatus.upsert({
      where: {
        guildId:
          interaction.guildId!
      },

      update: {
        code,
        description: reason
      },

      create: {
        guildId:
          interaction.guildId!,

        code,

        title: `CODE ${code}`,

        description: reason
      }
    });

    if (duration) {
      const expires =
        new Date(
          Date.now() +
          duration * 60000
        );

      await prisma.timedState.create({
        data: {
          guildId:
            interaction.guildId!,

          system: 'CODE',

          previous: 'GREEN',

          active: code,

          expiresAt: expires
        }
      });
    }

    await refreshCodeBoards(
      interaction.client,
      interaction.guildId!
    );

    await interaction.editReply({
      embeds: [
        EmbedService.success(
          'Operational Code Updated',
          `CODE ${code} activated.`
        )
      ]
    });
  }
}