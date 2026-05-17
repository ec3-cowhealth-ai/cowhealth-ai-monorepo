export const CowStatusValues = {
  HEALTHY: "HEALTHY",
  CALVING: "CALVING",
  HEAT_STRESS: "HEAT_STRESS",
  ALERT: "ALERT",
} as const;

export type CowStatus = typeof CowStatusValues[keyof typeof CowStatusValues];

export interface Cow {
  id: string;
  tag: string;
  name: string;
  status: CowStatus;
  breed: string;
  weight: number;
  dateOfBirth: string;
  farmId: string;
  collarId?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type CowListItem = Omit<Cow, "breed" | "weight" | "dateOfBirth">;

export interface CreateCowInput {
  tag: string;
  name: string;
  breed: string;
  weight: number;
  dateOfBirth: string;
  farmId: string;
  collarId?: string;
}

export type UpdateCowInput = Partial<CreateCowInput>;

export interface HeartRateDailyPoint {
  timestamp: string;
  value: number;
}

export interface TemperatureDailyPoint {
  timestamp: string;
  value: number;
}

export interface SensorPage<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
