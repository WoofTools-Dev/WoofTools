import { PrismaClient, UpdatedRRSS as UpdatedRRSSType } from "@prisma/client";

const prisma = new PrismaClient();

export const createUpdatedRRSS = async (
  data: Omit<UpdatedRRSSType, "id">
): Promise<UpdatedRRSSType> => {
  const updatedRRSS = await prisma.updatedRRSS.create({
    data,
  });
  return updatedRRSS;
};

export const getUpdatedRRSSList = async (): Promise<UpdatedRRSSType[]> => {
  const updatedRRSSList = await prisma.updatedRRSS.findMany();
  return updatedRRSSList;
};

export const getUpdatedRRSSById = async (
  id: number
): Promise<UpdatedRRSSType | null> => {
  const updatedRRSS = await prisma.updatedRRSS.findUnique({
    where: { id },
  });
  return updatedRRSS;
};

export const updateUpdatedRRSS = async (
  id: number,
  data: Partial<UpdatedRRSSType>
): Promise<UpdatedRRSSType | null> => {
  const updatedRRSS = await prisma.updatedRRSS.update({
    where: { id },
    data,
  });
  return updatedRRSS;
};

export const deleteUpdatedRRSS = async (id: number): Promise<void> => {
  await prisma.updatedRRSS.delete({
    where: { id },
  });
};

export default {
  createUpdatedRRSS,
  getUpdatedRRSSList,
  getUpdatedRRSSById,
  updateUpdatedRRSS,
  deleteUpdatedRRSS,
};
