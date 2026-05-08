import { prisma } from './DatabaseService';

export async function createPunishment(data: {
  guildId: string;
  userId: string;
  moderatorId: string;
  type: string;
  reason: string;
}) {
  return prisma.punishment.create({
    data
  });
}

export async function getPunishments(
  guildId: string,
  userId: string
) {
  return prisma.punishment.findMany({
    where: {
      guildId,
      userId
    },

    orderBy: {
      createdAt: 'desc'
    }
  });
}