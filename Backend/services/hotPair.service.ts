import { HotPair as HotPairType } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { attachLikeInfo } from "./like.service";

export const createHotPair = async (
  data: Omit<HotPairType, "id">
): Promise<HotPairType> => {
  const hotPair = await prisma.hotPair.create({
    data,
  });
  return hotPair;
};

export const getHotPairs = async (
  chain?: string,
  walletAddress?: string
): Promise<
  (HotPairType & { likedByMe: boolean; myCount: number; remainingLikes: number })[]
> => {
  const hotPairs = await prisma.hotPair.findMany({
    where: chain ? { chain, isVisible: true } : { isVisible: true },
  });
  return attachLikeInfo(hotPairs, "hotpair", walletAddress);
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
  try {
    const hotPair = await prisma.hotPair.update({
      where: { id },
      data,
    });
    return hotPair;
  } catch (err: any) {
    if (err?.code === "P2025") return null;
    throw err;
  }
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
