import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma";
import type { CreateCowInput, UpdateCowInput, SensorQueryInput } from "../types/cows";

const MAX_PHOTOS = 3;

// CRUD

export const getAllCows = async () => {
    return prisma.cow.findMany({
        select: {
            id:        true,
            tag:       true,
            name:      true,
            breed:     true,
            weight:    true,
            status:    true,
            createdAt: true,
            farm:      { select: { id: true, name: true } },
            collar:    { select: { id: true, name: true, status: true } },
        },
        orderBy: { tag: "asc" },
    });
};

export const getCowById = async (cowId: number) => {
    const cow = await prisma.cow.findUnique({
        where: { id: cowId },
        select: {
            id:        true,
            tag:       true,
            name:      true,
            breed:     true,
            birthDate: true,
            weight:    true,
            photos:    true,
            status:    true,
            createdAt: true,
            updatedAt: true,
            farm:      { select: { id: true, name: true, city: true, state: true } },
            collar:    { select: { id: true, name: true, status: true, dataFrequency: true } },
        },
    });

    if (!cow) throw new Error("Vaca não encontrada.");
    return cow;
};

export const createCow = async (data: CreateCowInput) => {
    const existingCow = await prisma.cow.findUnique({ where: { tag: data.tag } });
    if (existingCow) throw new Error("Já existe uma vaca com esta tag.");

    const farm = await prisma.farm.findUnique({ where: { id: data.farmId } });
    if (!farm) throw new Error("Fazenda não encontrada.");

    if (data.collarId) {
        const collar = await prisma.collar.findUnique({ where: { id: data.collarId } });
        if (!collar) throw new Error("Colar não encontrado.");

        const collarInUse = await prisma.cow.findFirst({ where: { collarId: data.collarId } });
        if (collarInUse) throw new Error("Este colar já está vinculado a outra vaca.");
    }

    return prisma.cow.create({
        data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        },
        select: {
            id:     true,
            tag:    true,
            name:   true,
            status: true,
            farm:   { select: { id: true, name: true } },
        },
    });
};

export const updateCow = async (cowId: number, data: UpdateCowInput) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    if (data.tag && data.tag !== cow.tag) {
        const tagInUse = await prisma.cow.findUnique({ where: { tag: data.tag } });
        if (tagInUse) throw new Error("Já existe uma vaca com esta tag.");
    }

    if (data.collarId) {
        const collarInUse = await prisma.cow.findFirst({
        where: { collarId: data.collarId, id: { not: cowId } },
        });
        if (collarInUse) throw new Error("Este colar já está vinculado a outra vaca.");
    }

    return prisma.cow.update({
        where: { id: cowId },
        data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        },
        select: {
            id:        true,
            tag:       true,
            name:      true,
            status:    true,
            updatedAt: true,
        },
    });
};

export const deleteCow = async (cowId: number) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    await prisma.cow.delete({ where: { id: cowId } });
    };

// Fotos

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export const addCowPhoto = async (cowId: number, filename: string) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    const currentPhotos = (cow.photos as string[]) ?? [];

    if (currentPhotos.length >= MAX_PHOTOS) {
        throw new Error(`Limite de ${MAX_PHOTOS} fotos por vaca atingido.`);
    }

    const updatedPhotos = [...currentPhotos, filename];

    return prisma.cow.update({
        where: { id: cowId },
        data:  { photos: updatedPhotos },
        select: { id: true, photos: true },
    });
};

export const removeCowPhoto = async (cowId: number, filename: string) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    const currentPhotos = (cow.photos as string[]) ?? [];
    if (!currentPhotos.includes(filename)) throw new Error("Foto não encontrada.");

    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const updatedPhotos = currentPhotos.filter((photo) => photo !== filename);

    return prisma.cow.update({
        where: { id: cowId },
        data:  { photos: updatedPhotos },
        select: { id: true, photos: true },
    });
};

// Sensores — listagem paginada

export const getCowHeartRate = async (cowId: number, query: SensorQueryInput) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    return prisma.heartRateData.findMany({
        where: {
        cowId,
        measuredAt: {
            gte: query.startDate ? new Date(query.startDate) : undefined,
            lte: query.endDate   ? new Date(query.endDate)   : undefined,
        },
        },
        select: { id: true, bpm: true, measuredAt: true, receivedAt: true },
        orderBy: { measuredAt: "desc" },
        take: query.limit ?? 100,
    });
};

export const getCowTemperature = async (cowId: number, query: SensorQueryInput) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    return prisma.temperatureData.findMany({
        where: {
        cowId,
        measuredAt: {
            gte: query.startDate ? new Date(query.startDate) : undefined,
            lte: query.endDate   ? new Date(query.endDate)   : undefined,
        },
        },
        select: { id: true, celsius: true, measuredAt: true, receivedAt: true },
        orderBy: { measuredAt: "desc" },
        take: query.limit ?? 100,
    });
};

export const getCowAccelerometer = async (cowId: number, query: SensorQueryInput) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    return prisma.accelerometerData.findMany({
        where: {
        cowId,
        measuredAt: {
            gte: query.startDate ? new Date(query.startDate) : undefined,
            lte: query.endDate   ? new Date(query.endDate)   : undefined,
        },
        },
        select: {
            id: true, accelX: true, accelY: true, accelZ: true,
            gyroX: true, gyroY: true, gyroZ: true,
            measuredAt: true, receivedAt: true,
        },
        orderBy: { measuredAt: "desc" },
        take: query.limit ?? 100,
    });
};

// Sensores — média diária para gráficos
// Agrupa os dados por dia e retorna a média de cada dia nos últimos 7 dias

export const getCowHeartRateDaily = async (cowId: number) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const records = await prisma.heartRateData.findMany({
        where: {
            cowId,
            measuredAt: { gte: sevenDaysAgo },
        },
        select: { bpm: true, measuredAt: true },
        orderBy: { measuredAt: "asc" },
    });

    return aggregateDailyAverage(records, "bpm");
};

export const getCowTemperatureDaily = async (cowId: number) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const records = await prisma.temperatureData.findMany({
        where: {
            cowId,
            measuredAt: { gte: sevenDaysAgo },
        },
        select: { celsius: true, measuredAt: true },
        orderBy: { measuredAt: "asc" },
    });

    return aggregateDailyAverage(records, "celsius");
};

/**
 * Agrupa registros de sensores por dia e calcula a média do campo informado.
 * Retorna um array com label (dd/MM) e valor médio.
 */
const aggregateDailyAverage = (
    records: Array<{ measuredAt: Date; [key: string]: any }>,
    field: string
    ): Array<{ date: string; average: number }> => {
    const dailyGroups = new Map<string, number[]>();

    for (const record of records) {
        const dateLabel = record.measuredAt.toLocaleDateString("pt-BR", {
            day:   "2-digit",
            month: "2-digit",
        });

        if (!dailyGroups.has(dateLabel)) {
        dailyGroups.set(dateLabel, []);
        }

        dailyGroups.get(dateLabel)!.push(record[field]);
    }

    return Array.from(dailyGroups.entries()).map(([date, values]) => ({
        date,
        average: parseFloat(
            (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)
        ),
    }));
};