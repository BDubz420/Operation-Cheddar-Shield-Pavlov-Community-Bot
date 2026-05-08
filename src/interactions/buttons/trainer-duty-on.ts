import { prisma } from '../../services/DatabaseService';

export default {
  customId: 'trainer-duty-on',

  async execute(interaction: any) {
    await prisma.trainerStatus.upsert({
      where: {
        userId: interaction.user.id
      },

      update: {
        onDuty: true,
        username: interaction.user.username
      },

      create: {
        guildId: interaction.guildId,
        userId: interaction.user.id,
        username: interaction.user.username,
        onDuty: true
      }
    });

    await interaction.reply({
      content:
        'You are now ON DUTY.',

      ephemeral: true
    });
  }
};