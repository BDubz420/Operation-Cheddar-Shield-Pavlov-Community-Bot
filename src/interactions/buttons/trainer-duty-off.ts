import { prisma } from '../../services/DatabaseService';

export default {
  customId: 'trainer-duty-off',

  async execute(interaction: any) {
    await prisma.trainerStatus.updateMany({
      where: {
        userId: interaction.user.id
      },

      data: {
        onDuty: false,
        activeSession: false
      }
    });

    await interaction.reply({
      content:
        'You are now OFF DUTY.',

      ephemeral: true
    });
  }
};