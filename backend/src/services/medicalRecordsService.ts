import { prisma } from "../lib/prisma";
import type { CreateMedicalRecordInput, UpdateMedicalRecordInput } from "../types/cows";

export const getMedicalRecords = async (cowId: number) => {
  const cow = await prisma.cow.findUnique({ where: { id: cowId } });
  if (!cow) throw new Error("Vaca não encontrada.");

  return prisma.medicalRecord.findMany({
    where: { cowId, deletedAt: null },
    select: {
      id: true,
      type: true,
      title: true,
      notes: true,
      recordedAt: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { recordedAt: "desc" },
  });
};

export const getMedicalRecord = async (cowId: number, recordId: number) => {
  const record = await prisma.medicalRecord.findFirst({
    where: { id: recordId, deletedAt: null },
    select: {
      id: true,
      type: true,
      title: true,
      notes: true,
      recordedAt: true,
      createdAt: true,
      updatedAt: true,
      cow: { select: { id: true, tag: true, name: true } },
      user: { select: { id: true, name: true } },
    },
  });

  if (!record) throw new Error("Registro não encontrado.");
  if (record.cow.id !== cowId) throw new Error("Registro não pertence a esta vaca.");

  return record;
};

export const createMedicalRecord = async (
  cowId: number,
  userId: number,
  data: CreateMedicalRecordInput,
) => {
  const cow = await prisma.cow.findUnique({ where: { id: cowId } });
  if (!cow) throw new Error("Vaca não encontrada.");

  return prisma.medicalRecord.create({
    data: {
      cowId,
      userId,
      type: data.type,
      title: data.title,
      notes: data.notes,
      recordedAt: new Date(data.recordedAt),
    },
    select: {
      id: true,
      type: true,
      title: true,
      notes: true,
      recordedAt: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  });
};

export const updateMedicalRecord = async (
  cowId: number,
  recordId: number,
  data: UpdateMedicalRecordInput,
) => {
  const record = await prisma.medicalRecord.findFirst({
    where: { id: recordId, deletedAt: null },
  });
  if (!record) throw new Error("Registro não encontrado.");
  if (record.cowId !== cowId) throw new Error("Registro não pertence a esta vaca.");

  return prisma.medicalRecord.update({
    where: { id: recordId },
    data: {
      ...data,
      recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined,
    },
    select: {
      id: true,
      type: true,
      title: true,
      notes: true,
      recordedAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true } },
    },
  });
};

export const deleteMedicalRecord = async (cowId: number, recordId: number) => {
  const record = await prisma.medicalRecord.findFirst({
    where: { id: recordId, deletedAt: null },
  });
  if (!record) throw new Error("Registro não encontrado.");
  if (record.cowId !== cowId) throw new Error("Registro não pertence a esta vaca.");

  await prisma.medicalRecord.update({
    where: { id: recordId },
    data: { deletedAt: new Date() },
  });
};
