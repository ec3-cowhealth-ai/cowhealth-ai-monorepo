export const CollarStatusValues = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  MAINTENANCE: "MAINTENANCE",
  BATTERY: "BATTERY",
} as const;

export type CollarStatus =
  (typeof CollarStatusValues)[keyof typeof CollarStatusValues];

export const DataFrequencyValues = {
  HIGHER: "HIGHER",
  DEFAULT: "DEFAULT",
  LOWER: "LOWER",
} as const;

export type DataFrequency =
  (typeof DataFrequencyValues)[keyof typeof DataFrequencyValues];

export interface Collar {
  id: number;
  name: string;
  status: CollarStatus;
  dataFrequency: DataFrequency;
  createdAt: string;
  updatedAt?: string;
  cow?: {
    id: number;
    tag: string;
    name: string;
    breed?: string;
    status: string;
    farm?: { id: number; name: string };
  };
}

export type CollarListItem = Collar;

export interface CreateCollarInput {
  name: string;
  status?: CollarStatus;
  dataFrequency?: DataFrequency;
}

export type UpdateCollarInput = Partial<Omit<CreateCollarInput, "name">>;
