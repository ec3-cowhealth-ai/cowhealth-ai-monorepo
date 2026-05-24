import { prisma } from "../lib/prisma";
import { deleteFile } from "../helpers/fileStorage";
import { assertUnique, querySensorData, aggregateDailyAverage } from "../helpers/serviceHelpers";
import type { CreateCowInput, UpdateCowInput, SensorQueryInput } from "../types/cows";

const MAX_PHOTOS = 3;


// CRUD

export const getAllCows = async (farmId?: number) => {
    return prisma.cow.findMany({
        where: farmId ? { farmId } : undefined,
        select: {
            id:        true,
            tag:       true,
            name:      true,
            breed:     true,
            weight:    true,
            status:    true,
            createdAt: true,
            farm:   { select: { id: true, name: true } },
            collar: { select: { id: true, name: true, status: true } },
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
            farm:   { select: { id: true, name: true, city: true, state: true } },
            collar: { select: { id: true, name: true, status: true, dataFrequency: true } },
        },
    });

    if (!cow) throw new Error("Vaca não encontrada.");
    return cow;
};

export const createCow = async (data: CreateCowInput) => {
    await assertUnique(prisma.cow, { tag: data.tag }, "Já existe uma vaca com esta tag.");

    const farm = await prisma.farm.findUnique({ where: { id: data.farmId } });
    if (!farm) throw new Error("Fazenda não encontrada.");

    if (data.collarId) {
        const collar = await prisma.collar.findUnique({ where: { id: data.collarId } });
        if (!collar) throw new Error("Colar não encontrado.");

        await assertUnique(prisma.cow, { collarId: data.collarId }, "Este colar já está vinculado a outra vaca.");
    }

    return prisma.cow.create({
        data: { ...data, birthDate: data.birthDate ? new Date(data.birthDate) : undefined },
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
        await assertUnique(prisma.cow, { tag: data.tag }, "Já existe uma vaca com esta tag.");
    }

    if (data.collarId) {
        await assertUnique(
            prisma.cow,
            { collarId: data.collarId },
            "Este colar já está vinculado a outra vaca.",
            cowId
        );
    }

    return prisma.cow.update({
        where: { id: cowId },
        data:  { ...data, birthDate: data.birthDate ? new Date(data.birthDate) : undefined },
        select: { id: true, tag: true, name: true, status: true, updatedAt: true },
    });
};

export const deleteCow = async (cowId: number) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    await prisma.cow.delete({ where: { id: cowId } });
};

// Fotos

export const addCowPhoto = async (cowId: number, filename: string) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    const currentPhotos = (cow.photos as string[]) ?? [];
    if (currentPhotos.length >= MAX_PHOTOS) {
        throw new Error(`Limite de ${MAX_PHOTOS} fotos por vaca atingido.`);
    }

    return prisma.cow.update({
        where: { id: cowId },
        data:  { photos: [...currentPhotos, filename] },
        select: { id: true, photos: true },
    });
};

export const removeCowPhoto = async (cowId: number, filename: string) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    const currentPhotos = (cow.photos as string[]) ?? [];
    if (!currentPhotos.includes(filename)) throw new Error("Foto não encontrada.");

    deleteFile(filename);

    return prisma.cow.update({
        where: { id: cowId },
        data:  { photos: currentPhotos.filter((photo) => photo !== filename) },
        select: { id: true, photos: true },
    });
};

// Sensores — listagem paginada

export const getCowHeartRate = async (cowId: number, options: SensorQueryInput) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    return querySensorData(prisma.heartRateData, cowId, { bpm: true }, options);
};

export const getCowTemperature = async (cowId: number, options: SensorQueryInput) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    return querySensorData(prisma.temperatureData, cowId, { celsius: true }, options);
};

export const getCowAccelerometer = async (cowId: number, options: SensorQueryInput) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    return querySensorData(
        prisma.accelerometerData,
        cowId,
        { accelX: true, accelY: true, accelZ: true, gyroX: true, gyroY: true, gyroZ: true },
        options
    );
};

// Sensores - média diária para gráficos na última semana

const sevenDaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    date.setHours(0, 0, 0, 0);
    return date;
};

export const getCowHeartRateDaily = async (cowId: number) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    const records = await prisma.heartRateData.findMany({
        where:   { cowId, measuredAt: { gte: sevenDaysAgo() } },
        select:  { bpm: true, measuredAt: true },
        orderBy: { measuredAt: "asc" },
    });

    return aggregateDailyAverage(records, "bpm");
};

export const getCowTemperatureDaily = async (cowId: number) => {
    const cow = await prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new Error("Vaca não encontrada.");

    const records = await prisma.temperatureData.findMany({
        where:   { cowId, measuredAt: { gte: sevenDaysAgo() } },
        select:  { celsius: true, measuredAt: true },
        orderBy: { measuredAt: "asc" },
    });

    return aggregateDailyAverage(records, "celsius");
};