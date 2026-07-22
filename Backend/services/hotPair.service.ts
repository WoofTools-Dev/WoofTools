import { HotPair as HotPairType } from "@prisma/client";
import prisma from "../configs/prisma.config";

export const createHotPair = async (
  data: Omit<HotPairType, "id">
): Promise<HotPairType> => {
  const hotPair = await prisma.hotPair.create({
    data,
  });
  return hotPair;
};

export const getHotPairs = async (): Promise<HotPairType[]> => {
  const hotPairs = await prisma.hotPair.findMany();
  return hotPairs;
};

export const getHotPairById = async (
  id: number
): Promise<HotPairType | null> => {
  const hotPair = await prisma.hotPair.findUnique({
    where: { id },
  });
  return hotPair;
};

export const updateHotPair = async (
  id: number,
  data: Partial<HotPairType>
): Promise<HotPairType | null> => {
  const hotPair = await prisma.hotPair.update({
    where: { id },
    data,
  });
  return hotPair;
};

export const deleteHotPair = async (id: number): Promise<void> => {
  await prisma.hotPair.delete({
    where: { id },
  });
};

export default {
  createHotPair,
  getHotPairs,
  getHotPairById,
  updateHotPair,
  deleteHotPair,
};
