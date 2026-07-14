import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateUserInput {
  username: string;
  email: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

async function createUser(data: CreateUserInput): Promise<User> {
  const user = await prisma.user.create({
    data,
  });
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

async function getUserById(id: number): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

async function getUserByUsername(username: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

async function updateUser(
  id: number,
  data: Partial<User>
): Promise<User | null> {
  const user = await prisma.user.update({
    where: { id },
    data,
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

async function deleteUser(id: number): Promise<boolean> {
  const user = await prisma.user.delete({
    where: { id },
  });

  return !!user;
}

export {
  createUser,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  updateUser,
  deleteUser,
};
export function getUserList() {
  throw new Error("Function not implemented.");
}
