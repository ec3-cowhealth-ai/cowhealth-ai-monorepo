export interface Farm {
  id: string;
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
}

export type UpdateFarmInput = Partial<CreateFarmInput>;
