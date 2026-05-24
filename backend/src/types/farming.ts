// Fazendas

export interface CreateFarmInput {
  name: string;
  cnpj: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

export interface UpdateFarmInput {
  name?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

// Colares

export interface CreateCollarInput {
  name: string;
  status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  dataFrequency?: "HIGHER" | "DEFAULT" | "LOWER";
}

export interface UpdateCollarInput {
  name?: string;
  status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  dataFrequency?: "HIGHER" | "DEFAULT" | "LOWER";
}
