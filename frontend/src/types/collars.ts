export const CollarStatusValues = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  MAINTENANCE: "MAINTENANCE",
  BATTERY: "BATTERY",
} as const;

export type CollarStatus = typeof CollarStatusValues[keyof typeof CollarStatusValues];

export const DataFrequencyValues = {
  HIGHER: "HIGHER",
  DEFAULT: "DEFAULT",
  LOWER: "LOWER",
} as const;

export type DataFrequency = typeof DataFrequencyValues[keyof typeof DataFrequencyValues];

export interface Collar {
  id: string;
  identifier: string;
  status: CollarStatus;
  dataFrequency: DataFrequency;
  cowId?: string;
  batteryPercentage: number;
  lastSync: string;
  createdAt: string;
  updatedAt: string;
}

export type CollarListItem = Collar;

export interface CreateCollarInput {
  identifier: string;
  status?: CollarStatus;
  dataFrequency?: DataFrequency;
}

export type UpdateCollarInput = Partial<Omit<CreateCollarInput, "identifier">>;
