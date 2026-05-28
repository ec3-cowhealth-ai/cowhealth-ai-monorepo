export interface CreateCowInput {
  tag: string;
  name?: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  farmId: number;
  collarId?: number;
}

export interface UpdateCowInput {
  tag?: string;
  name?: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  status?: "HEALTHY" | "CALVING" | "HEAT_STRESS" | "ALERT";
  farmId?: number;
  collarId?: number | null;
}

export interface SensorQueryInput {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface CreateMedicalRecordInput {
  type:       "CHECKUP" | "PROCEDURE" | "MEDICATION";
  title:      string;
  notes?:     string;
  recordedAt: string;
}

export interface UpdateMedicalRecordInput {
  type?:       "CHECKUP" | "PROCEDURE" | "MEDICATION";
  title?:      string;
  notes?:      string;
  recordedAt?: string;
}
