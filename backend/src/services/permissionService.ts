import { prisma } from "../lib/prisma";
import type { CreatePermissionInput, UpdatePermissionInput } from "../types/access";

export const getAllPermissions = async () => {
    return prisma.permission.findMany({
        select: {
            id:          true,
            name:        true,
            description: true,
            createdAt:   true,
            _count: { select: { roles: true, groups: true } },
        },
        orderBy: { name: "asc" },
    });
};

export const getPermissionById = async (permissionId: number) => {
    const permission = await prisma.permission.findUnique({
        where: { id: permissionId },
        select: {
            id:          true,
            name:        true,
            description: true,
            createdAt:   true,
            roles: {
                select: {
                    role: { select: { id: true, name: true } },
                },
            },
            groups: {
                select: {
                    group: { select: { id: true, name: true } },
                },
            },
        },
    });

    if (!permission) throw new Error("Permissão não encontrada.");
    return permission;
};

export const createPermission = async (
    { name, description }: CreatePermissionInput
) => {
    const existingPermission = await prisma.permission.findUnique({ where: { name } });
    if (existingPermission) throw new Error("Já existe uma permissão com este nome.");

    return prisma.permission.create({
        data: { name, description },
        select: { id: true, name: true, description: true, createdAt: true },
    });
};

export const updatePermission = async (
    permissionId: number,
    { name, description }: UpdatePermissionInput
) => {
    const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) throw new Error("Permissão não encontrada.");

    if (name && name !== permission.name) {
        const nameInUse = await prisma.permission.findUnique({ where: { name } });
        if (nameInUse) throw new Error("Já existe uma permissão com este nome.");
    }

    return prisma.permission.update({
        where: { id: permissionId },
        data:  { name, description },
        select: { id: true, name: true, description: true },
    });
};

export const deletePermission = async (permissionId: number) => {
    const permission = await prisma.permission.findUnique({
        where: { id: permissionId },
        include: { _count: { select: { roles: true, groups: true } } },
    });

    if (!permission) throw new Error("Permissão não encontrada.");

    // Regra: não deletar permissão vinculada a roles ou grupos
    if (permission._count.roles > 0 || permission._count.groups > 0) {
        throw new Error("Não é possível excluir uma permissão vinculada a roles ou grupos.");
    }

    await prisma.permission.delete({ where: { id: permissionId } });
};