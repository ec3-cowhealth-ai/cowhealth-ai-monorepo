export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthPayload {
    sub:         number;
    email:       string;
    profile:     string;
    permissions: string[];
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
  }
}
