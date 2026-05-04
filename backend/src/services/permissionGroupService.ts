import { prisma } from "../lib/prisma";
import type {
    CreatePermissionGroupInput,
    UpdatePermissionGroupInput,
    GrantRevokePermissionsInput,
} from "../types/access";

export const getAllPermissionGroups = async () => {
    return prisma.permissionGroup.findMany({
        select: {
            id:          true,
            name:        true,
            description: true,
            createdAt:   true,
            _count: { select: { permissions: true } },
        },
        orderBy: { name: "asc" },
    });
};

export const getPermissionGroupById = async (groupId: number) => {
    const permissionGroup = await prisma.permissionGroup.findUnique({
        where: { id: groupId },
        select: {
            id:          true,
            name:        true,
            description: true,
            createdAt:   true,
            permissions: {
                select: {
                    permission: {
                        select: { id: true, name: true, description: true }
                    },
                },
            },
        },
    });

    if (!permissionGroup) throw new Error("Grupo de permissões não encontrado.");
    return permissionGroup;
};

export const createPermissionGroup = async (
    { name, description }: CreatePermissionGroupInput
) => {
    const existingGroup = await prisma.permissionGroup.findUnique({ where: { name } });
    if (existingGroup) throw new Error("Já existe um grupo com este nome.");

    return prisma.permissionGroup.create({
        data: { name, description },
        select: { id: true, name: true, description: true, createdAt: true },
    });
};

export const updatePermissionGroup = async (
    groupId: number,
    { name, description }: UpdatePermissionGroupInput
) => {
    const permissionGroup = await prisma.permissionGroup.findUnique({ where: { id: groupId } });
    if (!permissionGroup) throw new Error("Grupo de permissões não encontrado.");

    if (name && name !== permissionGroup.name) {
        const nameInUse = await prisma.permissionGroup.findUnique({ where: { name } });
        if (nameInUse) throw new Error("Já existe um grupo com este nome.");
    }

    return prisma.permissionGroup.update({
        where: { id: groupId },
        data:  { name, description },
        select: { id: true, name: true, description: true },
    });
};

export const deletePermissionGroup = async (groupId: number) => {
    const permissionGroup = await prisma.permissionGroup.findUnique({ where: { id: groupId } });
    if (!permissionGroup) throw new Error("Grupo de permissões não encontrado.");

    await prisma.permissionGroup.delete({ where: { id: groupId } });
};

/**
 * Concede uma lista de permissões ao grupo em lote.
 * Ignora permissões já concedidas (idempotente).
 */
export const grantPermissionsToGroup = async (
    groupId: number,
    { permissionIds }: GrantRevokePermissionsInput
) => {
    const permissionGroup = await prisma.permissionGroup.findUnique({ where: { id: groupId } });
    if (!permissionGroup) throw new Error("Grupo de permissões não encontrado.");

    const existingLinks = await prisma.permissionGroupPermission.findMany({
        where: { groupId },
        select: { permissionId: true },
    });

    const existingPermissionIds = new Set(existingLinks.map((link) => link.permissionId));

    const newPermissionIds = permissionIds.filter(
        (permissionId) => !existingPermissionIds.has(permissionId)
    );

    if (newPermissionIds.length === 0) return { granted: 0 };

    await prisma.permissionGroupPermission.createMany({
        data: newPermissionIds.map((permissionId) => ({ groupId, permissionId })),
    });

    return { granted: newPermissionIds.length };
};

/**
 * Revoga uma lista de permissões do grupo em lote.
 */
export const revokePermissionsFromGroup = async (
    groupId: number,
    { permissionIds }: GrantRevokePermissionsInput
) => {
    const permissionGroup = await prisma.permissionGroup.findUnique({ where: { id: groupId } });
    if (!permissionGroup) throw new Error("Grupo de permissões não encontrado.");

    const { count } = await prisma.permissionGroupPermission.deleteMany({
        where: {
            groupId,
            permissionId: { in: permissionIds },
        },
    });

    return { revoked: count };
};