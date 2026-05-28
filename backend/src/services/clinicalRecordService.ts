import { prisma } from "../lib/prisma";
import type { CreateClinicalRecordInput, UpdateClinicalRecordInput } from "../schemas/clinicalRecordSchemas";

const summarySelect = {
  id: true,
  recordDate: true,
  clinicalStatus: true,
  diagnosis: true,
  followUpRequired: true,
  followUpDate: true,
  createdAt: true,
  veterinarian: { select: { id: true, name: true } },
} as const;

const detailSelect = {
  id: true,
  cowId: true,
  recordDate: true,
  clinicalStatus: true,
  alertOrigin: true,
  heartRate: true,
  spo2: true,
  bodyTemperature: true,
  ambientTemperature: true,
  activityLevel: true,
  postureNotes: true,
  weight: true,
  bodyConditionScore: true,
  feedingNotes: true,
  healthHistory: true,
  currentSymptoms: true,
  diagnosis: true,
  treatmentPlan: true,
  medicationsAdministered: true,
  vaccinationHistory: true,
  surgicalProcedures: true,
  allergyNotes: true,
  reproductiveStatus: true,
  breedingEligibility: true,
  estrusStatus: true,
  inseminationWindow: true,
  pregnancyStatus: true,
  lastCalvingDate: true,
  expectedCalvingDate: true,
  veterinaryRecommendations: true,
  followUpRequired: true,
  followUpDate: true,
  generalNotes: true,
  createdAt: true,
  updatedAt: true,
  cow: { select: { id: true, tag: true, name: true } },
  veterinarian: { select: { id: true, name: true } },
} as const;

export const getClinicalRecords = async (cowId: number) => {
  const cow = await prisma.cow.findUnique({ where: { id: cowId } });
  if (!cow) throw new Error("Vaca não encontrada.");

  return prisma.cowClinicalRecord.findMany({
    where: { cowId, deletedAt: null },
    select: summarySelect,
    orderBy: { recordDate: "desc" },
  });
};

export const getClinicalRecord = async (cowId: number, recordId: number) => {
  const record = await prisma.cowClinicalRecord.findUnique({
    where: { id: recordId },
    select: detailSelect,
  });

  if (!record) throw new Error("Prontuário não encontrado.");
  if (record.cowId !== cowId) throw new Error("Prontuário não pertence a esta vaca.");

  return record;
};

const syncCowReproductiveData = async (
  cowId: number,
  data: Pick<
    CreateClinicalRecordInput,
    "reproductiveStatus" | "lastCalvingDate" | "expectedCalvingDate"
  >,
) => {
  const updates: Record<string, unknown> = {};
  if (data.reproductiveStatus) updates.reproductiveStatus = data.reproductiveStatus;
  if (data.lastCalvingDate) updates.lastCalvingDate = new Date(data.lastCalvingDate);
  if (data.expectedCalvingDate) updates.expectedCalvingDate = new Date(data.expectedCalvingDate);

  if (Object.keys(updates).length > 0) {
    await prisma.cow.update({ where: { id: cowId }, data: updates });
  }
};

export const createClinicalRecord = async (
  cowId: number,
  veterinarianId: number,
  data: CreateClinicalRecordInput,
) => {
  const cow = await prisma.cow.findUnique({ where: { id: cowId } });
  if (!cow) throw new Error("Vaca não encontrada.");

  const record = await prisma.cowClinicalRecord.create({
    data: {
      cowId,
      veterinarianId,
      recordDate: new Date(data.recordDate),
      clinicalStatus: data.clinicalStatus,
      alertOrigin: data.alertOrigin,
      heartRate: data.heartRate,
      spo2: data.spo2,
      bodyTemperature: data.bodyTemperature,
      ambientTemperature: data.ambientTemperature,
      activityLevel: data.activityLevel,
      postureNotes: data.postureNotes,
      weight: data.weight,
      bodyConditionScore: data.bodyConditionScore,
      feedingNotes: data.feedingNotes,
      healthHistory: data.healthHistory,
      currentSymptoms: data.currentSymptoms,
      diagnosis: data.diagnosis,
      treatmentPlan: data.treatmentPlan,
      medicationsAdministered: data.medicationsAdministered,
      vaccinationHistory: data.vaccinationHistory,
      surgicalProcedures: data.surgicalProcedures,
      allergyNotes: data.allergyNotes,
      reproductiveStatus: data.reproductiveStatus,
      breedingEligibility: data.breedingEligibility,
      estrusStatus: data.estrusStatus,
      inseminationWindow: data.inseminationWindow,
      pregnancyStatus: data.pregnancyStatus,
      lastCalvingDate: data.lastCalvingDate ? new Date(data.lastCalvingDate) : undefined,
      expectedCalvingDate: data.expectedCalvingDate ? new Date(data.expectedCalvingDate) : undefined,
      veterinaryRecommendations: data.veterinaryRecommendations,
      followUpRequired: data.followUpRequired ?? false,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      generalNotes: data.generalNotes,
    },
    select: summarySelect,
  });

  await syncCowReproductiveData(cowId, data);

  return record;
};

export const updateClinicalRecord = async (
  cowId: number,
  recordId: number,
  data: UpdateClinicalRecordInput,
) => {
  const record = await prisma.cowClinicalRecord.findUnique({ where: { id: recordId } });
  if (!record || record.deletedAt) throw new Error("Prontuário não encontrado.");
  if (record.cowId !== cowId) throw new Error("Prontuário não pertence a esta vaca.");

  const updated = await prisma.cowClinicalRecord.update({
    where: { id: recordId },
    data: {
      ...data,
      recordDate: data.recordDate ? new Date(data.recordDate) : undefined,
      lastCalvingDate: data.lastCalvingDate ? new Date(data.lastCalvingDate) : undefined,
      expectedCalvingDate: data.expectedCalvingDate ? new Date(data.expectedCalvingDate) : undefined,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
    },
    select: summarySelect,
  });

  await syncCowReproductiveData(cowId, data);

  return updated;
};

export const deleteClinicalRecord = async (cowId: number, recordId: number) => {
  const record = await prisma.cowClinicalRecord.findUnique({ where: { id: recordId } });
  if (!record || record.deletedAt) throw new Error("Prontuário não encontrado.");
  if (record.cowId !== cowId) throw new Error("Prontuário não pertence a esta vaca.");

  await prisma.cowClinicalRecord.update({
    where: { id: recordId },
    data: { deletedAt: new Date() },
  });
};
