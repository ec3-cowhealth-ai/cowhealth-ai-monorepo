export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthPayload {
  sub: number;
  email: string;
  profile: string;
  permissions: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
