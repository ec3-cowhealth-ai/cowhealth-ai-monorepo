export interface LoginInput {
  email: string;
  password: string;
}

export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  profile: "ADMIN" | "MANAGER" | "VIEWER";
  active: boolean;
  createdAt: string;
  roles: Role[];
  permissions: Permission[];
}
