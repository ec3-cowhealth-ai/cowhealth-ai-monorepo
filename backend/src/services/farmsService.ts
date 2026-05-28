import { prisma } from "../lib/prisma";
import { assertUnique, throwWithStatus } from "../helpers/serviceHelpers";
import type { CreateFarmInput, UpdateFarmInput } from "../types/farming";

export const getAllFarms = async (farmIds: number[] | null) => {
  const where = farmIds === null ? {} : { id: { in: farmIds || [] } };

  return prisma.farm.findMany({
    where,
    select: {
      id: true,
      name: true,
      cnpj: true,
      address: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      _count: { select: { cows: true } },
    },
    orderBy: { name: "asc" },
  });
};

export const getFarmById = async (farmId: number, farmIds: number[] | null) => {
  if (farmIds !== null && !farmIds.includes(farmId)) {
    throwWithStatus("Acesso negado a esta fazenda.", 403);
  }

  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    select: {
      id: true,
      name: true,
      cnpj: true,
      address: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      cows: {
        select: {
          id: true,
          tag: true,
          name: true,
          breed: true,
          status: true,
          collar: { select: { id: true, name: true, status: true } },
        },
      },
    },
  });

  if (!farm) throw new Error("Fazenda não encontrada.");
  return farm;
};

export const createFarm = async (data: CreateFarmInput) => {
  await assertUnique(prisma.farm, { cnpj: data.cnpj }, "Já existe uma fazenda com este CNPJ.");

  return prisma.farm.create({
    data,
    select: {
      id: true,
      name: true,
      cnpj: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      createdAt: true,
    },
  });
};

export const updateFarm = async (
  farmId: number,
  data: UpdateFarmInput,
  farmIds: number[] | null,
) => {
  if (farmIds !== null && !farmIds.includes(farmId)) {
    throwWithStatus("Sem acesso a esta fazenda.", 403);
  }

  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) throw new Error("Fazenda não encontrada.");

  if (data.cnpj && data.cnpj !== farm.cnpj) {
    await assertUnique(
      prisma.farm,
      { cnpj: data.cnpj },
      "Já existe uma fazenda com este CNPJ.",
      farmId,
    );
  }

  return prisma.farm.update({
    where: { id: farmId },
    data,
    select: {
      id: true,
      name: true,
      cnpj: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      updatedAt: true,
    },
  });
};

export const deleteFarm = async (farmId: number) => {
  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    include: { _count: { select: { cows: true } } },
  });

  if (!farm) throw new Error("Fazenda não encontrada.");

  if (farm._count.cows > 0) {
    throw new Error("Não é possível excluir uma fazenda com vacas vinculadas.");
  }

  await prisma.farm.delete({ where: { id: farmId } });
};
