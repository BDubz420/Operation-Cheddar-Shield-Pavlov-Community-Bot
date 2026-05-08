import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import { Command } from '../../structures/Command';

import { prisma } from '../../services/DatabaseService';

import { postTrainerDashboard } from '../../services/TrainerDashboardService';

export default class TrainerCommand extends Command {
  data = new SlashCommandBuilder()

    .setName('trainer')

    .setDescription(
      'Trainer management system'
    )

    .addSubcommand(sub =>
      sub
        .setName('setup')

        .setDescription(
          'Setup trainer system'
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('panel')

        .setDescription(
          'Post trainer request panel'
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('setlogchannel')

        .setDescription(
          'Set training logs channel'
        )

        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription(
              'Training logs channel'
            )
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('setrole')
        .setDescription(
          'Set trainer role for branch'
        )

        .addStringOption(option =>
          option
            .setName('branch')

            .setDescription(
              'Training branch'
            )

            .setRequired(true)

            .addChoices(
              {
                name: 'Army',
                value: 'Army'
              },
              {
                name: 'Air Force',
                value: 'Air Force'
              },
              {
                name: 'Navy',
                value: 'Navy'
              },
              {
                name: 'Marines',
                value: 'Marines'
              }
            )
        )

        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription(
              'Trainer role'
            )
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('dashboard')

        .setDescription(
          'Post trainer dashboard'
        )
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    );

  async execute(
    interaction: ChatInputCommandInteraction
  ) {
    const sub =
      interaction.options.getSubcommand();

    switch (sub) {
      case 'setup':
        return await this.setup(
          interaction
        );

      case 'panel':
        return await this.panel(
          interaction
        );

      case 'setlogchannel':
        return await this.setLogChannel(
          interaction
        );

      case 'setrole':
        return await this.setRole(
          interaction
        );
      case 'dashboard':
        return await this.dashboard(
          interaction
        );
    }
  }

  async setup(
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.reply({
      content:
        'Trainer system setup coming online.',

      ephemeral: true
    });
  }

  async panel(
    interaction: ChatInputCommandInteraction
  ) {
    const embed =
      new EmbedBuilder()

        .setColor('#d4af37')

        .setAuthor({
          name:
            'SPEC OPS PMC — Training Command'
        })

        .setTitle(
          '🎖 Training Request Center'
        )

        .setDescription(
          [
            'Request a certified trainer.',
            '',
            'Personnel seeking branch training may submit a request below.',
            '',
            '━━━━━━━━━━━━━━━━━━',
            '',
            '📋 Rules & Restrictions',
            '',
            '🚫 Blacklisted personnel cannot submit requests.',
            '📌 One active request at a time.',
            '⏱ 15 minute cooldown between requests.',
            '',
            '━━━━━━━━━━━━━━━━━━',
            '',
            '🎖 Available Branches',
            '',
            '🪖 Army',
            '✈ Air Force',
            '⚓ Navy',
            '🛡 Marines',
            '',
            '━━━━━━━━━━━━━━━━━━',
            '',
            'Click the button below to request training.'
          ].join('\n')
        )

        .setFooter({
          text:
            'Spec Ops PMC • Training Division'
        })

        .setTimestamp();

    const row =
      new ActionRowBuilder<ButtonBuilder>()

        .addComponents(
          new ButtonBuilder()

            .setCustomId(
              'trainer-request'
            )

            .setLabel(
              'Request Trainer'
            )

            .setEmoji('🎖')

            .setStyle(
              ButtonStyle.Success
            )
        );

    const channel =
      interaction.channel;

    if (
      !channel ||
      !channel.isSendable()
    ) {
      return await interaction.reply({
        content:
          'Invalid channel.',

        ephemeral: true
      });
    }

    await channel.send({
      embeds: [embed],

      components: [row]
    });

    await interaction.reply({
      content:
        'Trainer panel deployed.',

      ephemeral: true
    });
  }

  async setRole(
    interaction: ChatInputCommandInteraction
  ) {
    const branch =
      interaction.options.getString(
        'branch',
        true
      );

    const role =
      interaction.options.getRole(
        'role',
        true
      );

    await prisma.trainerRole.upsert({
      where: {
        guildId_branch: {
          guildId:
            interaction.guildId!,
          branch
        }
      },

      update: {
        roleId: role.id
      },

      create: {
        guildId:
          interaction.guildId!,
        branch,
        roleId: role.id
      }
    });

    await interaction.reply({
      content:
        `✅ ${branch} trainer role set to ${role}.`,
      ephemeral: true
    });
  }

  async dashboard(
    interaction: ChatInputCommandInteraction
  ) {
    const channel =
      interaction.channel;

    if (
      !channel ||
      !channel.isSendable()
    ) {
      return;
    }

    await postTrainerDashboard(
      channel as any,
      interaction.guildId!
    );

    await interaction.reply({
      content:
        'Trainer dashboard deployed.',

      ephemeral: true
    });
  }

  async setLogChannel(
    interaction: ChatInputCommandInteraction
  ) {
    const channel =
      interaction.options.getChannel(
        'channel',
        true
      );

    await prisma.trainingLogConfig.upsert({
      where: {
        guildId:
          interaction.guildId!
      },

      update: {
        channelId:
          channel.id
      },

      create: {
        guildId:
          interaction.guildId!,

        channelId:
          channel.id
      }
    });

    await interaction.reply({
      content:
        'Training logs channel configured.',

      ephemeral: true
    });
  }
}