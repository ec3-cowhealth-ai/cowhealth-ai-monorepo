// Fazendas
export interface CreateFarmInput {
  name: string;
  cnpj: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateFarmInput {
  name?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

// Colares
export interface CreateCollarInput {
  name: string;
  status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "BATTERY";
  dataFrequency?: "HIGHER" | "DEFAULT" | "LOWER";
  farmId?: number;
}

export interface UpdateCollarInput {
  name?: string;
  status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "BATTERY";
  dataFrequency?: "HIGHER" | "DEFAULT" | "LOWER";
  farmId?: number;
}
