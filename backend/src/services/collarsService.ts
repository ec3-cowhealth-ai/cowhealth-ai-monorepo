import { prisma } from "../lib/prisma";
import { assertUnique } from "../helpers/serviceHelpers";
import type { CreateCollarInput, UpdateCollarInput } from "../types/farming";

export const getAllCollars = async () => {
    return prisma.collar.findMany({
        select: {
            id:            true,
            name:          true,
            status:        true,
            dataFrequency: true,
            createdAt:     true,
            cow: { select: { id: true, tag: true, name: true, status: true } },
        },
        orderBy: { name: "asc" },
    });
};

export const getCollarById = async (collarId: number) => {
    const collar = await prisma.collar.findUnique({
        where: { id: collarId },
        select: {
        id:            true,
        name:          true,
        status:        true,
        dataFrequency: true,
        createdAt:     true,
        updatedAt:     true,
        cow: {
            select: {
                id:     true,
                tag:    true,
                name:   true,
                breed:  true,
                status: true,
                farm:   { select: { id: true, name: true } },
            },
        },
        },
    });

    if (!collar) throw new Error("Colar não encontrado.");
    return collar;
};

export const createCollar = async (data: CreateCollarInput) => {
    await assertUnique(prisma.collar, { name: data.name }, "Já existe um colar com este nome.");

    return prisma.collar.create({
        data,
        select: { id: true, name: true, status: true, dataFrequency: true, createdAt: true },
    });
};

export const updateCollar = async (collarId: number, data: UpdateCollarInput) => {
    const collar = await prisma.collar.findUnique({ where: { id: collarId } });
    if (!collar) throw new Error("Colar não encontrado.");

    if (data.name && data.name !== collar.name) {
        await assertUnique(prisma.collar, { name: data.name }, "Já existe um colar com este nome.", collarId);
    }

    return prisma.collar.update({
        where: { id: collarId },
        data,
        select: { id: true, name: true, status: true, dataFrequency: true, updatedAt: true },
    });
};

export const deleteCollar = async (collarId: number) => {
    const collar = await prisma.collar.findUnique({
        where: { id: collarId },
        include: { cow: true },
    });

    if (!collar) throw new Error("Colar não encontrado.");

    if (collar.cow) {
        throw new Error("Não é possível excluir um colar vinculado a uma vaca.");
    }

    await prisma.collar.delete({ where: { id: collarId } });
};