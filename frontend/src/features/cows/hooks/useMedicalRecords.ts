import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "@services/medicalRecordsService";
import type { CreateMedicalRecordInput } from "@/types/cows";

export const useMedicalRecords = (cowId: number) =>
  useQuery({
    queryKey: ["medical-records", cowId],
    queryFn: () => svc.getMedicalRecords(cowId),
    enabled: !!cowId,
  });

export const useCreateMedicalRecord = (cowId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedicalRecordInput) => svc.createMedicalRecord(cowId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medical-records", cowId] }),
  });
};

export const useDeleteMedicalRecord = (cowId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordId: number) => svc.deleteMedicalRecord(cowId, recordId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medical-records", cowId] }),
  });
};
