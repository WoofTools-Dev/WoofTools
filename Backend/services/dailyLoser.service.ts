import { DailyLoser as DailyLoserType } from "@prisma/client";
import prisma from "../configs/prisma.config";

export const createDailyLoser = async (
  data: Omit<DailyLoserType, "id">
): Promise<DailyLoserType> => {
  const dailyLoser = await prisma.dailyLoser.create({
    data,
  });
  return dailyLoser;
};

export const getDailyLosers = async (): Promise<DailyLoserType[]> => {
  const dailyLosers = await prisma.dailyLoser.findMany();
  return dailyLosers;
};

export const getDailyLoserById = async (
  id: number
): Promise<DailyLoserType | null> => {
  const dailyLoser = await prisma.dailyLoser.findUnique({
    where: { id },
  });
  return dailyLoser;
};

export const updateDailyLoser = async (
  id: number,
  data: Partial<DailyLoserType>
): Promise<DailyLoserType | null> => {
  const dailyLoser = await prisma.dailyLoser.update({
    where: { id },
    data,
  });
  return dailyLoser;
};

export const deleteDailyLoser = async (id: number): Promise<void> => {
  await prisma.dailyLoser.delete({
    where: { id },
  });
};

export default {
  createDailyLoser,
  getDailyLosers,
  getDailyLoserById,
  updateDailyLoser,
  deleteDailyLoser,
};
