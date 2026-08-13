import { DashboardData as DashboardDataType } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { attachLikeInfo } from "./like.service";

export const createDashboardData = async (
  data: Omit<DashboardDataType, "id" | "createdAt">
): Promise<DashboardDataType> => {
  return prisma.dashboardData.create({ data });
};

export const getDashboardData = async (
  chain?: string,
  walletAddress?: string
): Promise<
  (DashboardDataType & { likedByMe: boolean; myCount: number; remainingLikes: number })[]
> => {
  const records = await prisma.dashboardData.findMany({
    where: chain ? { chain, isVisible: true } : { isVisible: true },
    orderBy: { createdAt: "desc" },
  });
  return attachLikeInfo(records, "dashboard", walletAddress);
};

export const getDashboardDataById = async (
  id: number
): Promise<DashboardDataType | null> => {
  return prisma.dashboardData.findUnique({ where: { id } });
};

export const deleteDashboardData = async (id: number): Promise<void> => {
  await prisma.dashboardData.delete({ where: { id } });
};

export default {
  createDashboardData,
  getDashboardData,
  getDashboardDataById,
  deleteDashboardData,
};
