import api from "@lib/api";
import type { MedicalRecord, CreateMedicalRecordInput } from "@/types/cows";

const base = (cowId: number) => `/cows/${cowId}/medical-records`;

export const getMedicalRecords = (cowId: number) =>
  api.get<MedicalRecord[]>(base(cowId)).then((r) => r.data);

export const createMedicalRecord = (cowId: number, data: CreateMedicalRecordInput) =>
  api.post<MedicalRecord>(base(cowId), data).then((r) => r.data);

export const updateMedicalRecord = (
  cowId: number,
  recordId: number,
  data: Partial<CreateMedicalRecordInput>,
) => api.put<MedicalRecord>(`${base(cowId)}/${recordId}`, data).then((r) => r.data);

export const deleteMedicalRecord = (cowId: number, recordId: number) =>
  api.delete(`${base(cowId)}/${recordId}`);
