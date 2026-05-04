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
                permission: { select: { id: true, name: true, description: true } },
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
    const permissionGroup = await prisma.permissionGroup.findUnique({
        where: { id: groupId },
        include: { _count: { select: { permissions: true } } },
    });

    if (!permissionGroup) throw new Error("Grupo de permissões não encontrado.");

    // Regra: não deletar grupo que ainda possui permissões vinculadas
    if (permissionGroup._count.permissions > 0) {
        throw new Error("Não é possível excluir um grupo que possui permissões vinculadas.");
    }

    await prisma.permissionGroup.delete({ where: { id: groupId } });
};

// Permissões do grupo

/**
 * Adiciona uma permissão ao grupo.
 * Idempotente — ignora se já estiver vinculada.
 */
export const addPermissionToGroup = async (groupId: number, permissionId: number) => {
    const permissionGroup = await prisma.permissionGroup.findUnique({ where: { id: groupId } });
    if (!permissionGroup) throw new Error("Grupo de permissões não encontrado.");

    const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) throw new Error("Permissão não encontrada.");

    const alreadyLinked = await prisma.permissionGroupPermission.findUnique({
        where: { groupId_permissionId: { groupId, permissionId } },
    });
    if (alreadyLinked) throw new Error("Permissão já está vinculada a este grupo.");

    return prisma.permissionGroupPermission.create({ data: { groupId, permissionId } });
};

/**
 * Remove uma permissão do grupo.
 */
export const removePermissionFromGroup = async (groupId: number, permissionId: number) => {
    const link = await prisma.permissionGroupPermission.findUnique({
        where: { groupId_permissionId: { groupId, permissionId } },
    });
    if (!link) throw new Error("Vínculo não encontrado.");

    await prisma.permissionGroupPermission.delete({
        where: { groupId_permissionId: { groupId, permissionId } },
    });
};

// Grant / Revoke para Roles

/**
 * Concede todas as permissões do grupo às roles informadas.
 * Equivale ao botão "Conceder" do projeto original em Laravel/Filament:
 * seleciona roles e sincroniza todas as permissões do grupo sem remover as existentes.
 *
 * @param groupId  - ID do grupo cujas permissões serão concedidas
 * @param roleIds  - IDs das roles que receberão as permissões
 */
export const grantGroupPermissionsToRoles = async (
    groupId: number,
    { permissionIds: roleIds }: GrantRevokePermissionsInput
) => {
    const permissionGroup = await prisma.permissionGroup.findUnique({
        where: { id: groupId },
        include: { permissions: { select: { permissionId: true } } },
    });

    if (!permissionGroup) throw new Error("Grupo de permissões não encontrado.");
    if (permissionGroup.permissions.length === 0) {
        throw new Error("O grupo não possui permissões para conceder.");
    }

    const groupPermissionIds = permissionGroup.permissions.map((link) => link.permissionId);

    let totalGranted = 0;

    for (const roleId of roleIds) {
        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role) continue;

        const existingLinks = await prisma.rolePermission.findMany({
            where: { roleId },
            select: { permissionId: true },
        });

        const existingPermissionIds = new Set(existingLinks.map((link) => link.permissionId));

        const newPermissionIds = groupPermissionIds.filter(
        (permissionId) => !existingPermissionIds.has(permissionId)
        );

        if (newPermissionIds.length > 0) {
        await prisma.rolePermission.createMany({
            data: newPermissionIds.map((permissionId) => ({ roleId, permissionId })),
        });
        totalGranted += newPermissionIds.length;
        }
    }

    return { granted: totalGranted };
};

/**
 * Revoga todas as permissões do grupo das roles informadas.
 * Equivale ao botão "Revogar" do projeto original em Laravel/Filament.
 *
 * @param groupId  - ID do grupo cujas permissões serão revogadas
 * @param roleIds  - IDs das roles que perderão as permissões
 */
export const revokeGroupPermissionsFromRoles = async (
    groupId: number,
    { permissionIds: roleIds }: GrantRevokePermissionsInput
) => {
    const permissionGroup = await prisma.permissionGroup.findUnique({
        where: { id: groupId },
        include: { permissions: { select: { permissionId: true } } },
    });

    if (!permissionGroup) throw new Error("Grupo de permissões não encontrado.");

    const groupPermissionIds = permissionGroup.permissions.map((link) => link.permissionId);

    let totalRevoked = 0;

    for (const roleId of roleIds) {
        const { count } = await prisma.rolePermission.deleteMany({
        where: {
            roleId,
            permissionId: { in: groupPermissionIds },
        },
        });
        totalRevoked += count;
    }

    return { revoked: totalRevoked };
};