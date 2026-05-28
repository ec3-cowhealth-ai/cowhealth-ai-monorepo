import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { AuthPayload, LoginInput } from "../types/auth";

// Helpers internos

const getUserPermissions = async (userId: number): Promise<string[]> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      roles: {
        select: {
          role: {
            select: {
              permissions: {
                select: { permission: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  });

  const permissionSet = new Set<string>();
  for (const userRole of user?.roles ?? []) {
    for (const rolePermission of userRole.role.permissions) {
      permissionSet.add(rolePermission.permission.name);
    }
  }

  return Array.from(permissionSet);
};

/**
 * Retorna os farmIds do usuário autenticado.
 *
 * Apenas o SuperAdmin tem acesso irrestrito (retorna null).
 * Todos os demais perfis — incluindo Administrador — são limitados
 * às fazendas vinculadas via UserFarm.
 *
 * @returns null para SuperAdmin (irrestrito) | number[] para os demais
 */
const getUserFarmIds = async (userId: number): Promise<number[] | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
      userFarms: true,
    },
  });

  if (!user) return [];

  const isSuperAdmin = user.roles.some((r) => r.role.name === "SuperAdmin");
  if (isSuperAdmin) return null;

  const farmIds = new Set<number>();
  if (user.farmId) farmIds.add(user.farmId);
  user.userFarms.forEach((uf) => farmIds.add(uf.farmId));

  return Array.from(farmIds);
};

const signToken = (payload: AuthPayload): string =>
  jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as `${number}${"s" | "m" | "h" | "d"}` | number,
  });

// Auth

export const login = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active) throw new Error("Credenciais invalidas.");

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) throw new Error("Credenciais invalidas.");

  const [permissions, farmIds] = await Promise.all([
    getUserPermissions(user.id),
    getUserFarmIds(user.id),
  ]);

  const payload: AuthPayload = {
    sub: user.id,
    id: user.id,
    email: user.email,
    permissions,
    farmIds,
  };

  return { token: signToken(payload) };
};

export const getMe = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      farmId: true,
      farm: {
        select: { id: true, name: true },
      },
      createdAt: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              permissions: {
                select: { permission: { select: { id: true, name: true } } },
              },
            },
          },
        },
      },
      userFarms: {
        select: { farm: { select: { id: true, name: true } } },
      },
    },
  });

  if (!user) throw new Error("Usuario nao encontrado.");

  const permissionSet = new Map<number, string>();
  for (const userRole of user.roles) {
    for (const rolePermission of userRole.role.permissions) {
      const { id, name } = rolePermission.permission;
      permissionSet.set(id, name);
    }
  }

  const farms = (user.userFarms ?? []).map((uf) => uf.farm);
  if (user.farmId && user.farm) {
    if (!farms.some((f) => f.id === user.farmId)) {
      farms.unshift(user.farm);
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    active: user.active,
    farmId: user.farmId,
    createdAt: user.createdAt,
    roles: (user.roles ?? []).map((userRole) => ({ id: userRole.role.id, name: userRole.role.name })),
    permissions: Array.from(permissionSet.entries()).map(([id, name]) => ({ id, name })),
    farms,
  };
};

export const userHasPermission = async (
  userId: number,
  permissionName: string,
): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionName);
};
