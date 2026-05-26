/**
 * Auth Feature Types
 * TODO[ANGELO]: Expandir com tipos adicionais conforme necessário
 */

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  // TODO[ANGELO]: Adicionar campos adicionais conforme requisitos de negócio
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  active: boolean;
}
