import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';

import {
  createTrainingSession
} from '../../services/TrainingSessionService';

import { prisma } from '../../services/DatabaseService';

export default {
  customId: 'trainer-claim',

  async execute(
    interaction: any
  ) {
    const embed =
      EmbedBuilder.from(
        interaction.message.embeds[0]
      );

    const fields =
      embed.data.fields || [];

    const requesterField =
      fields.find(
        field =>
          field.name ===
          '👤 Requesting Personnel'
      );

    const branchField =
      fields.find(
        field =>
          field.name ===
          '✈ Branch'
      );

    const statusField =
      fields.find(
        field =>
          field.name ===
          '📌 Status'
      );

    const requesterId =
      requesterField?.value.replace(
        /[<@>]/g,
        ''
      );

    // Prevent self-claim

    if (
      requesterId === interaction.user.id
    ) {
      return interaction.reply({
        content:
          'You cannot claim your own training request.',

        ephemeral: true
      });
    }

    // Already claimed check

    if (
      statusField?.value.includes(
        'CLAIMED'
      )
    ) {
      return interaction.reply({
        content:
          'This request has already been claimed.',

        ephemeral: true
      });
    }

    const branch =
      branchField?.value || 'Unknown';

    if (!branchField?.value) {
      return interaction.reply({
        content:
          'Invalid training request data.',

        ephemeral: true
      });
    }

    // Trainer role lookup

    const trainerRole =
      await prisma.trainerRole.findUnique({
        where: {
          guildId_branch: {
            guildId:
              interaction.guildId!,
            branch
          }
        }
      });

    if (!trainerRole) {
      return interaction.reply({
        content:
          'No trainer role configured for this branch.',

        ephemeral: true
      });
    }

    // Permission check

    if (
      !interaction.member.roles.cache.has(
        trainerRole.roleId
      )
    ) {
      return interaction.reply({
        content:
          'You are not authorised to claim this training request.',

        ephemeral: true
      });
    }

    const request =
      await prisma.trainerRequest.findFirst({
        where: {
          messageId:
            interaction.message.id
        }
      });

    if (!request) {
      return interaction.reply({
        content:
          'Training request record missing.',

        ephemeral: true
      });
    }

    // Update status

    if (statusField) {
      statusField.value =
        `🟢 CLAIMED BY ${interaction.user}`;
    }

    // Remove old trainer field if exists

    const filteredFields =
      fields.filter(
        field =>
          field.name !==
          '🎖 Assigned Trainer'
      );

    filteredFields.push({
      name:
        '🎖 Assigned Trainer',

      value:
        `${interaction.user}`,

      inline: true
    });

    embed.setFields(filteredFields);

    embed.setColor('#57f287');

    // New action row

    const row =
      new ActionRowBuilder<ButtonBuilder>()

        .addComponents(
          new ButtonBuilder()

            .setCustomId(
              'trainer-complete'
            )

            .setLabel(
              'Complete Training'
            )

            .setEmoji('✅')

            .setStyle(
              ButtonStyle.Success
            ),

          new ButtonBuilder()

            .setCustomId(
              'trainer-cancel'
            )

            .setLabel(
              'Cancel'
            )

            .setStyle(
              ButtonStyle.Danger
            )
        );

    await prisma.trainerRequest.update({
      where: {
        id: request.id
      },

      data: {
        status: 'CLAIMED',

        trainerId:
          interaction.user.id,

        trainerName:
          interaction.user.username
      }
    });

    await createTrainingSession(
      interaction.channel,
      interaction.guildId,
      interaction.user.id,
      interaction.user.username,
      branch
    );

    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  }
};