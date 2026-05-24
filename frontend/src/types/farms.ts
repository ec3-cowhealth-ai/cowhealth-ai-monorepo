// TODO[ANGELO] id está tipado como string, mas o backend retorna number (INTEGER no Prisma/MySQL).
// Corrigir para: id: number
// e remover os Number(id) / String(id) espalhados no código (buscar por "Number(.*id)" e "String(.*id)").
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