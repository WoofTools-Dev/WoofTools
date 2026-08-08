import { SwapTransaction as SwapTransactionType } from "@prisma/client";
import prisma from "../configs/prisma.config";

export const createSwapTransaction = async (
  data: Omit<SwapTransactionType, "id" | "createdAt">
): Promise<SwapTransactionType> => {
  return prisma.swapTransaction.create({ data });
};

export const getSwapTransactions = async (chain?: string): Promise<SwapTransactionType[]> => {
  return prisma.swapTransaction.findMany({
    where: chain ? { chain } : undefined,
    orderBy: { createdAt: "desc" },
  });
};

export const getSwapTransactionById = async (
  id: number
): Promise<SwapTransactionType | null> => {
  return prisma.swapTransaction.findUnique({ where: { id } });
};

export const deleteSwapTransaction = async (id: number): Promise<void> => {
  await prisma.swapTransaction.delete({ where: { id } });
};

export default {
  createSwapTransaction,
  getSwapTransactions,
  getSwapTransactionById,
  deleteSwapTransaction,
};
