import {
  ActionRowBuilder,
  StringSelectMenuBuilder
} from 'discord.js';

export default {
  customId: 'trainer-request',

  async execute(
    interaction: any
  ) {
    const menu =
      new StringSelectMenuBuilder()

        .setCustomId(
          'trainer-branch-select'
        )

        .setPlaceholder(
          'Select training branch'
        )

        .addOptions([
          {
            label: 'Army',
            value: 'Army',
            emoji: '🪖'
          },

          {
            label: 'Air Force',
            value: 'Air Force',
            emoji: '✈'
          },

          {
            label: 'Navy',
            value: 'Navy',
            emoji: '⚓'
          },

          {
            label: 'Marines',
            value: 'Marines',
            emoji: '🛡'
          }
        ]);

    const row =
      new ActionRowBuilder<
        StringSelectMenuBuilder
      >().addComponents(menu);

    await interaction.reply({
      content:
        'Select your training branch.',

      components: [row],

      ephemeral: true
    });
  }
};