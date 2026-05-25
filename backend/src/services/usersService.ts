import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { assertUnique } from "../helpers/serviceHelpers";
import type { CreateUserInput, UpdateUserInput } from "../types/access";
import type { Prisma } from "@prisma/client";

const SUPER_ADMIN_USER_ID = 1;

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
      active: true,
      createdAt: true,
      roles: {
        select: {
          role: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
};

export const getUserById = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              permissions: {
                select: {
                  permission: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) throw new Error("Usuário não encontrado.");
  return user;
};

export const createUser = async ({
  name,
  email,
  password,
  profile,
}: CreateUserInput) => {
  await assertUnique(prisma.user, { email }, "Email já cadastrado.");

  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.create({
    data: { name, email, passwordHash, profile: profile ?? "VIEWER" },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
      active: true,
      createdAt: true,
    },
  });
};

export const updateUser = async (
  userId: number,
  { name, email, password, profile }: UpdateUserInput,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuário não encontrado.");

  if (email && email !== user.email) {
    await assertUnique(prisma.user, { email }, "Email já cadastrado.", userId);
  }

  const updatedData: Prisma.UserUpdateInput = { name, email, profile };

  if (password) {
    updatedData.passwordHash = await bcrypt.hash(password, 12);
  }

  return prisma.user.update({
    where: { id: userId },
    data: updatedData,
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
      active: true,
      updatedAt: true,
    },
  });
};

export const toggleUserActive = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuário não encontrado.");

  return prisma.user.update({
    where: { id: userId },
    data: { active: !user.active },
    select: { id: true, name: true, active: true },
  });
};

export const deleteUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { select: { role: { select: { name: true } } } } },
  });

  if (!user) throw new Error("Usuário não encontrado.");

  const isSuperAdmin = user.roles.some(
    (userRole) => userRole.role.name === "SuperAdmin",
  );
  if (isSuperAdmin) {
    throw new Error("Não é possível excluir o usuário SuperAdmin.");
  }

  await prisma.user.delete({ where: { id: userId } });
};

export const assignRoleToUser = async (userId: number, roleId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuário não encontrado.");

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error("Role não encontrada.");

  const alreadyAssigned = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId, roleId } },
  });
  if (alreadyAssigned) throw new Error("Usuário já possui esta role.");

  return prisma.userRole.create({ data: { userId, roleId } });
};

export const removeRoleFromUser = async (userId: number, roleId: number) => {
  if (userId === SUPER_ADMIN_USER_ID) {
    throw new Error("Não é possível remover roles do usuário SuperAdmin.");
  }

  const userRole = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId, roleId } },
  });
  if (!userRole) throw new Error("Vínculo não encontrado.");

  await prisma.userRole.delete({
    where: { userId_roleId: { userId, roleId } },
  });
};
