export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Payload de autenticação.
 * Contém as informações do usuário autenticado, como ID, email, permissões e IDs das fazendas associadas.
 * O campo `farmIds` pode ser `null`, indicando acesso irrestrito (para SuperAdmin), ou um array
 * de números, indicando acesso restrito às fazendas listadas.
 */
export interface AuthPayload {
  sub: number;
  id: number;
  email: string;
  permissions: string[];
  farmIds:     number[] | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
