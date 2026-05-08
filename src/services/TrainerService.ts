import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';

export function buildTrainerRequestEmbed(
  data: {
    username: string;

    branch: string;

    trainingType: string;

    notes?: string | null;

    trainerName?: string | null;

    status: string;
  }
) {
  return new EmbedBuilder()

    .setColor('#d4af37')

    .setAuthor({
      name:
        'SPEC OPS PMC — Training Command'
    })

    .setTitle(
      '🎖 Training Request'
    )

    .addFields(
      {
        name: '🪖 Recruit',
        value: data.username,
        inline: true
      },

      {
        name: '📂 Branch',
        value: data.branch,
        inline: true
      },

      {
        name: '📘 Training',
        value: data.trainingType,
        inline: true
      },

      {
        name: '📡 Status',
        value: data.status,
        inline: true
      },

      {
        name: '👨‍🏫 Assigned Trainer',
        value:
          data.trainerName ||
          'UNASSIGNED',
        inline: true
      },

      {
        name: '📝 Notes',
        value:
          data.notes ||
          'No notes provided.'
      }
    )

    .setFooter({
      text:
        'Spec Ops PMC • Training Division'
    })

    .setTimestamp();
}

export function buildTrainerButtons() {
  return [
    new ActionRowBuilder<ButtonBuilder>()

      .addComponents(
        new ButtonBuilder()
          .setCustomId(
            'trainer-claim'
          )
          .setLabel('Claim')
          .setStyle(
            ButtonStyle.Success
          ),

        new ButtonBuilder()
          .setCustomId(
            'trainer-complete'
          )
          .setLabel('Complete')
          .setStyle(
            ButtonStyle.Primary
          ),

        new ButtonBuilder()
          .setCustomId(
            'trainer-cancel'
          )
          .setLabel('Cancel')
          .setStyle(
            ButtonStyle.Danger
          )
      )
  ];
}