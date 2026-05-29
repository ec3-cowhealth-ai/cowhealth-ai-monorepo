import api from "../lib/api";
import type {
  ClinicalRecord,
  ClinicalRecordSummary,
  CreateClinicalRecordInput,
  UpdateClinicalRecordInput,
} from "../features/clinicalRecord/types";

export const getClinicalRecords = async (cowId: number): Promise<ClinicalRecordSummary[]> => {
  const { data } = await api.get(`/cows/${cowId}/clinical-records`);
  return data;
};

export const getClinicalRecord = async (cowId: number, recordId: number): Promise<ClinicalRecord> => {
  const { data } = await api.get(`/cows/${cowId}/clinical-records/${recordId}`);
  return data;
};

export const createClinicalRecord = async (
  cowId: number,
  input: CreateClinicalRecordInput,
): Promise<ClinicalRecordSummary> => {
  const { data } = await api.post(`/cows/${cowId}/clinical-records`, input);
  return data;
};

export const updateClinicalRecord = async (
  cowId: number,
  recordId: number,
  input: UpdateClinicalRecordInput,
): Promise<ClinicalRecordSummary> => {
  const { data } = await api.put(`/cows/${cowId}/clinical-records/${recordId}`, input);
  return data;
};

export const deleteClinicalRecord = async (cowId: number, recordId: number): Promise<void> => {
  await api.delete(`/cows/${cowId}/clinical-records/${recordId}`);
};
