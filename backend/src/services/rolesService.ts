import { prisma } from "../lib/prisma";
import { assertUnique } from "../helpers/serviceHelpers";
import type { CreateRoleInput, UpdateRoleInput } from "../types/access";

export const getAllRoles = async () => {
  return prisma.role.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { users: true, permissions: true } },
    },
    orderBy: { name: "asc" },
  });
};

export const getRoleById = async (roleId: number) => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      permissions: {
        select: {
          permission: { select: { id: true, name: true } },
        },
      },
      users: {
        select: {
          user: { select: { id: true, name: true, email: true, active: true } },
        },
      },
    },
  });

  if (!role) throw new Error("Role não encontrada.");
  return role;
};

export const createRole = async ({ name, description }: CreateRoleInput) => {
  await assertUnique(
    prisma.role,
    { name },
    "Já existe uma role com este nome.",
  );

  return prisma.role.create({
    data: { name, description },
    select: { id: true, name: true, description: true, createdAt: true },
  });
};

export const updateRole = async (
  roleId: number,
  { name, description }: UpdateRoleInput,
) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error("Role não encontrada.");

  if (name && name !== role.name) {
    await assertUnique(
      prisma.role,
      { name },
      "Já existe uma role com este nome.",
      roleId,
    );
  }

  return prisma.role.update({
    where: { id: roleId },
    data: { name, description },
    select: { id: true, name: true, description: true, updatedAt: true },
  });
};

export const deleteRole = async (roleId: number) => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { _count: { select: { users: true } } },
  });

  if (!role) throw new Error("Role não encontrada.");

  // Regra: não deletar role com usuários vinculados
  if (role._count.users > 0) {
    throw new Error("Não é possível excluir uma role com usuários vinculados.");
  }

  await prisma.role.delete({ where: { id: roleId } });
};

export const assignPermissionToRole = async (
  roleId: number,
  permissionId: number,
) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error("Role não encontrada.");

  const permission = await prisma.permission.findUnique({
    where: { id: permissionId },
  });
  if (!permission) throw new Error("Permissão não encontrada.");

  const alreadyAssigned = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId, permissionId } },
  });
  if (alreadyAssigned) throw new Error("Role já possui esta permissão.");

  return prisma.rolePermission.create({ data: { roleId, permissionId } });
};

export const removePermissionFromRole = async (
  roleId: number,
  permissionId: number,
) => {
  const rolePermission = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId, permissionId } },
  });
  if (!rolePermission) throw new Error("Vínculo não encontrado.");

  await prisma.rolePermission.delete({
    where: { roleId_permissionId: { roleId, permissionId } },
  });
};
