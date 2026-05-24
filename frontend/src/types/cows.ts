export const CowStatusValues = {
  HEALTHY: "HEALTHY",
  CALVING: "CALVING",
  HEAT_STRESS: "HEAT_STRESS",
  ALERT: "ALERT",
} as const;

export type CowStatus = (typeof CowStatusValues)[keyof typeof CowStatusValues];

export interface Cow {
  id: number;
  tag: string;
  name: string;
  status: CowStatus;
  breed: string;
  weight: number;
  birthDate?: string;
  photos?: string[];
  farm: { id: number; name: string; city?: string; state?: string };
  collar?: { id: number; name: string; status: string; dataFrequency?: string };
  createdAt: string;
  updatedAt?: string;
}

// Lista nao retorna birthDate nem photos
export type CowListItem = Omit<Cow, "birthDate" | "photos" | "updatedAt">;

export interface CreateCowInput {
  tag: string;
  name: string;
  breed: string;
  weight: number;
  birthDate: string;
  farmId: number;
  collarId?: number;
}

export type UpdateCowInput = Partial<CreateCowInput>;

export interface SensorDailyPoint {
  date: string; // formato "dd/MM" ex: "17/05" — ja vem pronto do backend
  average: number;
}

// Aliases para retrocompatibilidade
export type HeartRateDailyPoint = SensorDailyPoint;
export type TemperatureDailyPoint = SensorDailyPoint;

export interface SensorPage<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
