export interface Farm {
  id: number;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export type FarmListItem = Omit<Farm, "address" | "email" | "phone">;

export interface CreateFarmInput {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
}

export type UpdateFarmInput = Partial<CreateFarmInput>;