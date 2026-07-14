// Import the PrismaClient and Prisma type
import { DailyWinner as DailyWinnerType } from "@prisma/client";
import prisma from "../configs/prisma.config";

export const createDailyWinner = async (
  data: Omit<DailyWinnerType, "id">
): Promise<DailyWinnerType> => {
  const dailyWinner = await prisma.dailyWinner.create({
    data,
  });
  return dailyWinner;
};

export const getDailyWinners = async (): Promise<DailyWinnerType[]> => {
  const dailyWinners = await prisma.dailyWinner.findMany();
  return dailyWinners;
};

export const getDailyWinnerById = async (
  id: number
): Promise<DailyWinnerType | null> => {
  const dailyWinner = await prisma.dailyWinner.findUnique({
    where: { id },
  });
  return dailyWinner;
};

export const updateDailyWinner = async (
  id: number,
  data: Partial<DailyWinnerType>
): Promise<DailyWinnerType | null> => {
  const dailyWinner = await prisma.dailyWinner.update({
    where: { id },
    data,
  });
  return dailyWinner;
};

export const deleteDailyWinner = async (id: number): Promise<void> => {
  await prisma.dailyWinner.delete({
    where: { id },
  });
};
