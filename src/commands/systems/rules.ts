import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';
import { prisma } from '../../services/DatabaseService';
import { EmbedService } from '../../services/EmbedService';

import {
  createRulesBoard,
  refreshRulesBoards
} from '../../services/RulesService';

export default class RulesCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Rules management system')

    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Add a rule')
        .addIntegerOption(option =>
          option
            .setName('number')
            .setDescription('Rule number')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('title')
            .setDescription('Rule title')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('content')
            .setDescription('Rule content')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('category')
            .setDescription('Rule category')
            .setRequired(false)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription('Remove a rule')
        .addIntegerOption(option =>
          option
            .setName('number')
            .setDescription('Rule number')
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('list')
        .setDescription('List current rules')
    )

    .addSubcommand(sub =>
      sub
        .setName('post')
        .setDescription('Post persistent rules board')
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    );

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'add':
        return await this.addRule(interaction);

      case 'remove':
        return await this.removeRule(interaction);

      case 'list':
        return await this.listRules(interaction);

      case 'post':
        return await this.postRules(interaction);
    }
  }

  async addRule(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const number = interaction.options.getInteger('number', true);
    const title = interaction.options.getString('title', true);
    const content = interaction.options.getString('content', true);
    const category =
      interaction.options.getString('category') || 'General';

    await prisma.rule.upsert({
      where: {
        id: `${interaction.guildId}-${number}`
      } as any,

      update: {
        title,
        content,
        category
      },

      create: {
        guildId: interaction.guildId!,
        number,
        title,
        content,
        category
      }
    });

    await refreshRulesBoards(
      interaction.client,
      interaction.guildId!
    );

    await interaction.editReply({
      embeds: [
        EmbedService.success(
          'Rule Saved',
          `Rule ${number} has been saved.`
        )
      ]
    });
  }

  async removeRule(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const number = interaction.options.getInteger('number', true);

    await prisma.rule.deleteMany({
      where: {
        guildId: interaction.guildId!,
        number
      }
    });

    await refreshRulesBoards(
      interaction.client,
      interaction.guildId!
    );

    await interaction.editReply({
      embeds: [
        EmbedService.success(
          'Rule Removed',
          `Rule ${number} has been removed.`
        )
      ]
    });
  }

  async listRules(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const rules = await prisma.rule.findMany({
      where: {
        guildId: interaction.guildId!
      },
      orderBy: {
        number: 'asc'
      }
    });

    await interaction.editReply({
      embeds: [
        EmbedService.tactical(
          'Current Rules',
          rules.length
            ? rules
                .map(rule => `${rule.number}. ${rule.title}`)
                .join('\n')
            : 'No rules configured.'
        )
      ]
    });
  }

  async postRules(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel;

    if (!channel || !channel.isSendable()) {
      return await interaction.editReply({
        embeds: [
          EmbedService.error(
            'Invalid Channel',
            'This channel cannot receive messages.'
          )
        ]
      });
    }

    await createRulesBoard(
      channel as any,
      interaction.guildId!
    );

    await interaction.editReply({
      embeds: [
        EmbedService.success(
          'Rules Board Posted',
          'Persistent rules board deployed.'
        )
      ]
    });
  }
}