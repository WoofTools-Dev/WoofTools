import { DashboardData as DashboardDataType } from "@prisma/client";
import prisma from "../configs/prisma.config";

export const createDashboardData = async (
  data: Omit<DashboardDataType, "id" | "createdAt">
): Promise<DashboardDataType> => {
  return prisma.dashboardData.create({ data });
};

export const getDashboardData = async (): Promise<DashboardDataType[]> => {
  return prisma.dashboardData.findMany({ orderBy: { createdAt: "desc" } });
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
