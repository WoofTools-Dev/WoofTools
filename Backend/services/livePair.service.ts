import { PrismaClient, LivePair as LivePairType } from "@prisma/client";

const prisma = new PrismaClient();

export const createLivePair = async (
  data: Omit<LivePairType, "id" | "createdAt">
): Promise<LivePairType> => {
  return prisma.livePair.create({ data });
};

export const getLivePairs = async (): Promise<LivePairType[]> => {
  return prisma.livePair.findMany({ orderBy: { createdAt: "desc" } });
};

export const getLivePairById = async (
  id: number
): Promise<LivePairType | null> => {
  return prisma.livePair.findUnique({ where: { id } });
};

export const deleteLivePair = async (id: number): Promise<void> => {
  await prisma.livePair.delete({ where: { id } });
};

export default {
  createLivePair,
  getLivePairs,
  getLivePairById,
  deleteLivePair,
};
