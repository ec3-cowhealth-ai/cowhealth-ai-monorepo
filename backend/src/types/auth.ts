export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface AuthPayload {
    sub: number;
    email: string;
    profile: string;
}

declare global {
    namespace Express {
        interface Request {
        user?: AuthPayload;
        }
    }
}