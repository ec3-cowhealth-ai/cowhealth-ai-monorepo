export type ReproductiveStatus = "OPEN" | "INSEMINATED" | "PREGNANT" | "DRY" | "POSTPARTUM";
export type ClinicalStatus = "STABLE" | "MONITORING" | "CRITICAL" | "RECOVERED" | "REFERRED";
export type BreedingEligibility = "ELIGIBLE" | "INELIGIBLE" | "PENDING";
export type EstrusStatus = "IN_ESTRUS" | "NOT_IN_ESTRUS" | "UNKNOWN";
export type ActivityLevel = "Normal" | "Baixa" | "Alta";

export interface ClinicalRecordSummary {
  id: number;
  recordDate: string;
  clinicalStatus: ClinicalStatus;
  diagnosis: string | null;
  followUpRequired: boolean;
  followUpDate: string | null;
  createdAt: string;
  veterinarian: { id: number; name: string };
}

export interface ClinicalRecord {
  id: number;
  cowId: number;
  recordDate: string;
  clinicalStatus: ClinicalStatus;
  alertOrigin: string | null;
  heartRate: number | null;
  spo2: number | null;
  bodyTemperature: number | null;
  ambientTemperature: number | null;
  activityLevel: ActivityLevel | null;
  postureNotes: string | null;
  weight: number | null;
  bodyConditionScore: number | null;
  feedingNotes: string | null;
  healthHistory: string | null;
  currentSymptoms: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  medicationsAdministered: string | null;
  vaccinationHistory: string | null;
  surgicalProcedures: string | null;
  allergyNotes: string | null;
  reproductiveStatus: ReproductiveStatus | null;
  breedingEligibility: BreedingEligibility | null;
  estrusStatus: EstrusStatus | null;
  inseminationWindow: string | null;
  pregnancyStatus: boolean | null;
  lastCalvingDate: string | null;
  expectedCalvingDate: string | null;
  veterinaryRecommendations: string | null;
  followUpRequired: boolean;
  followUpDate: string | null;
  generalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  cow: { id: number; tag: string; name: string | null };
  veterinarian: { id: number; name: string };
}

export interface CreateClinicalRecordInput {
  recordDate: string;
  clinicalStatus: ClinicalStatus;
  alertOrigin?: string;
  heartRate?: number;
  spo2?: number;
  bodyTemperature?: number;
  ambientTemperature?: number;
  activityLevel?: ActivityLevel;
  postureNotes?: string;
  weight?: number;
  bodyConditionScore?: number;
  feedingNotes?: string;
  healthHistory?: string;
  currentSymptoms?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  medicationsAdministered?: string;
  vaccinationHistory?: string;
  surgicalProcedures?: string;
  allergyNotes?: string;
  reproductiveStatus?: ReproductiveStatus;
  breedingEligibility?: BreedingEligibility;
  estrusStatus?: EstrusStatus;
  inseminationWindow?: string;
  pregnancyStatus?: boolean;
  lastCalvingDate?: string;
  expectedCalvingDate?: string;
  veterinaryRecommendations?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  generalNotes?: string;
}

export type UpdateClinicalRecordInput = Partial<CreateClinicalRecordInput>;
