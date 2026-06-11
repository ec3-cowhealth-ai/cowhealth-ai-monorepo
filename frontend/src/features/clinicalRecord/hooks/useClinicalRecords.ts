import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClinicalRecords,
  getClinicalRecord,
  createClinicalRecord,
  updateClinicalRecord,
  deleteClinicalRecord,
} from "@services/clinicalRecordService";
import type { CreateClinicalRecordInput, UpdateClinicalRecordInput } from "../types";

export const useClinicalRecords = (cowId: number) =>
  useQuery({
    queryKey: ["clinical-records", cowId],
    queryFn: () => getClinicalRecords(cowId),
    enabled: !!cowId,
  });

export const useClinicalRecord = (cowId: number, recordId: number) =>
  useQuery({
    queryKey: ["clinical-record", cowId, recordId],
    queryFn: () => getClinicalRecord(cowId, recordId),
    enabled: !!cowId && !!recordId,
  });

export const useCreateClinicalRecord = (cowId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClinicalRecordInput) => createClinicalRecord(cowId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinical-records", cowId] }),
  });
};

export const useUpdateClinicalRecord = (cowId: number, recordId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateClinicalRecordInput) => updateClinicalRecord(cowId, recordId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinical-records", cowId] });
      qc.invalidateQueries({ queryKey: ["clinical-record", cowId, recordId] });
    },
  });
};

export const useDeleteClinicalRecord = (cowId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordId: number) => deleteClinicalRecord(cowId, recordId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinical-records", cowId] }),
  });
};
