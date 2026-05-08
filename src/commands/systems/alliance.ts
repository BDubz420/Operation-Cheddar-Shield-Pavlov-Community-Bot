import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { EmbedService } from '../../services/EmbedService';

import { prisma } from '../../services/DatabaseService';

import { createAllianceBoard, refreshAllianceBoards } from '../../services/AllianceBoardService';

export default class AllianceCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('alliance')
    .setDescription(
      'Alliance management system'
    )

    // ADD

    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription(
          'Add an alliance entry'
        )

        .addStringOption(option =>
          option
            .setName('name')
            .setDescription(
              'Alliance name'
            )
            .setRequired(true)
        )

        .addStringOption(option =>
          option
            .setName('status')
            .setDescription(
              'Alliance status'
            )
            .setRequired(true)

            .addChoices(
              {
                name: 'Allied',
                value: 'allied'
              },

              {
                name: 'Neutral',
                value: 'neutral'
              },

              {
                name: 'Negotiation',
                value: 'negotiation'
              },

              {
                name: 'Uneasy',
                value: 'uneasy'
              },

              {
                name: 'War',
                value: 'war'
              },

              {
                name: 'Blacklisted PMCs/Groups',
                value: 'raid'
              }
            )
        )
    )

    // REMOVE

    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription(
          'Remove alliance entry'
        )

        .addStringOption(option =>
          option
            .setName('name')
            .setDescription(
              'Alliance name'
            )
            .setRequired(true)
        )
    )

    // BOARD

    .addSubcommand(sub =>
      sub
        .setName('board')
        .setDescription(
          'Generate alliance board'
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
        return await this.addAlliance(
          interaction
        );

      case 'remove':
        return await this.removeAlliance(
          interaction
        );

      case 'board':
        return await this.generateBoard(
          interaction
        );
    }
  }

  async addAlliance(
    interaction: ChatInputCommandInteraction
  ) {
    const name =
      interaction.options.getString(
        'name',
        true
      );

    const status =
      interaction.options.getString(
        'status',
        true
      );

    await prisma.alliance.create({
      data: {
        guildId: interaction.guildId!,
        name,
        status
      }
    });

    await refreshAllianceBoards(
      interaction.client,
      interaction.guildId!
    );

    await interaction.reply({
      embeds: [
        EmbedService.success(
          'Alliance Added',
          `${name} added as ${status}.`
        )
      ],

      flags: ['Ephemeral']
    });
  }

  async removeAlliance(
    interaction: ChatInputCommandInteraction
  ) {
    const name =
      interaction.options.getString(
        'name',
        true
      );

    await prisma.alliance.deleteMany({
      where: {
        guildId: interaction.guildId!,
        name
      }
    });

    await refreshAllianceBoards(
      interaction.client,
      interaction.guildId!
    );

    await interaction.reply({
      embeds: [
        EmbedService.success(
          'Alliance Removed',
          `${name} removed successfully.`
        )
      ],

      flags: ['Ephemeral']
    });
  }

  async generateBoard(
    interaction: ChatInputCommandInteraction
  ) {
    const alliances =
      await prisma.alliance.findMany({
        where: {
          guildId: interaction.guildId!
        }
      });

    const grouped = {
      allied: alliances.filter(
        a => a.status === 'allied'
      ),

      neutral: alliances.filter(
        a => a.status === 'neutral'
      ),

      negotiation: alliances.filter(
        a => a.status === 'negotiation'
      ),

      uneasy: alliances.filter(
        a => a.status === 'uneasy'
      ),

      war: alliances.filter(
        a => a.status === 'war'
      ),

      raid: alliances.filter(
        a => a.status === 'raid'
      )
    };

    const embed =
      EmbedService.tactical(
        'O.C.S Alliance Status',
        [
          '🟢 **ALLIED**',
          grouped.allied.length
            ? grouped.allied
                .map(a => `• ${a.name}`)
                .join('\n')
            : '*None*',

          '',

          '⚪ **NEUTRAL**',
          grouped.neutral.length
            ? grouped.neutral
                .map(a => `• ${a.name}`)
                .join('\n')
            : '*None*',

          '',

          '🟡 **NEGOTIATION**',
          grouped.negotiation.length
            ? grouped.negotiation
                .map(a => `• ${a.name}`)
                .join('\n')
            : '*None*',

          '',

          '🟠 **UNEASY**',
          grouped.uneasy.length
            ? grouped.uneasy
                .map(a => `• ${a.name}`)
                .join('\n')
            : '*None*',

          '',

          '🔴 **WAR**',
          grouped.war.length
            ? grouped.war
                .map(a => `• ${a.name}`)
                .join('\n')
            : '*None*',

          '',

          '☠ **RAID GROUPS**',
          grouped.raid.length
            ? grouped.raid
                .map(a => `• ${a.name}`)
                .join('\n')
            : '*None*'
        ].join('\n')
      );

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

    await createAllianceBoard(
      channel as any,
      interaction.guildId!
    );

    await interaction.reply({
      embeds: [
        EmbedService.success(
          'Alliance Board Created',
          'Alliance board deployed successfully.'
        )
      ],

      flags: ['Ephemeral']
    });
  }
}