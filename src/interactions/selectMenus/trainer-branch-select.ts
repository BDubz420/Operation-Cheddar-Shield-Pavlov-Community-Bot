import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';

import { prisma } from '../../services/DatabaseService';

export default {
  customId:
    'trainer-branch-select',

  async execute(
    interaction: any
  ) {
    const branch =
      interaction.values[0];

    const embed =
      new EmbedBuilder()

        .setColor('#d4af37')

        .setAuthor({
          name:
            'SPEC OPS PMC — Training Command'
        })

        .setTitle(
          `🎖 Trainer Request — ${branch}`
        )

        .setDescription(
          [
            `A member is requesting a certified ${branch} trainer.`,
            '',
            'An eligible trainer may claim this request below.',
            '',
            '⚠ Trainer must be CLEARED to claim.'
          ].join('\n')
        )

        .addFields(
          {
            name:
              '👤 Requesting Personnel',

            value:
              `${interaction.user}`,

            inline: true
          },

          {
            name:
              '✈ Branch',

            value: branch,

            inline: true
          },

          {
            name:
              '📌 Status',

            value:
              '🟡 AWAITING TRAINER'
          }
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
              'trainer-claim'
            )

            .setLabel(
              'Claim Request'
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
              'Decline'
            )

            .setStyle(
              ButtonStyle.Danger
            )
        );

    const existingRequest =
      await prisma.trainerRequest.findFirst({
        where: {
          guildId:
            interaction.guildId!,

          userId:
            interaction.user.id,

          status: {
            in: [
              'OPEN',
              'CLAIMED'
            ]
          }
        }
      });

    if (existingRequest) {
      return interaction.update({
        content:
          'You already have an active trainer request.',

        embeds: [],

        components: []
      });
    }

    const request =
      await prisma.trainerRequest.create({
        data: {
          guildId:
            interaction.guildId!,

          userId:
            interaction.user.id,

          username:
            interaction.user.username,

          branch,

          trainingType:
            'General Training',

          status:
            'OPEN',

          expiresAt:
            new Date(
              Date.now() +
              1000 * 60 * 15
            )
        }
      });

    const message =
      await interaction.channel.send({
        embeds: [embed],
        components: [row]
      });

    await prisma.trainerRequest.update({
      where: {
        id: request.id
      },

      data: {
        messageId:
          message.id
      }
    });

    await interaction.update({
      content:
        `✅ ${branch} trainer request submitted.`,

      embeds: [],

      components: []
    });
  }
};