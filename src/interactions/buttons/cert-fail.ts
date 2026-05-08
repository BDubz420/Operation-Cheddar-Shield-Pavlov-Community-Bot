import { prisma } from '../../services/DatabaseService';

export default {
  customId: /^cert-fail-/,

  async execute(
    interaction: any
  ) {
    const parts =
      interaction.customId.split(
        '-'
      );

    const traineeId =
      parts[3];

    const trainee =
      await prisma.sessionTrainee.update({
        where: {
          id: traineeId
        },

        data: {
          status:
            'FAILED'
        },

        include: {
          session: true
        }
      });

    const sessionTrainees =
      await prisma.sessionTrainee.findMany({
        where: {
          sessionId:
            trainee.session.id
        }
      });

    const pending =
      sessionTrainees.some(
        trainee =>
          trainee.status ===
          'PENDING'
      );

    if (!pending) {
      const {
        logTrainingSession
      } = await import(
        '../../services/TrainingLogService'
      );

      await logTrainingSession(
        interaction,
        trainee.session.id
      );
    }

    await prisma.certification.create({
      data: {
        guildId:
          trainee.session.guildId,

        userId:
          trainee.userId,

        username:
          trainee.username,

        branch:
          trainee.session.branch,

        trainerId:
          trainee.session.trainerId,

        trainerName:
          trainee.session.trainerName,

        sessionId:
          trainee.session.id,

        result:
          'FAILED'
      }
    });

    await interaction.reply({
      content:
        'Trainee failed.',

      ephemeral: true
    });
  }
};