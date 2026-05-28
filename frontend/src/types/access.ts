export const USER_PROFILE_VALUES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  VIEWER: "VIEWER",
} as const;

export type UserProfile = (typeof USER_PROFILE_VALUES)[keyof typeof USER_PROFILE_VALUES];

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

// Retorno do GET /roles (lista)
export interface RoleListItem {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  _count: {
    users: number;
    permissions: number;
  };
}

// Retorno do GET /roles/:id (detalhe)
export interface RoleDetail {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: Array<{ permission: { id: number; name: string } }>;
  users: Array<{
    user: { id: number; name: string; email: string; active: boolean };
  }>;
}

// Manter Role para compatibilidade com código existente
export type Role = RoleDetail;

export interface User {
  id: number;
  name: string;
  email: string;
  profile: UserProfile;
  farmId: number | null;
  farm?: { id: number; name: string };
  roles: RoleListItem[];
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  profile: UserProfile;
  isActive: boolean;
  farmId: number | null;
  farm?: { id: number; name: string };
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
  farmId?: number;
  roleId?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  profile?: UserProfile;
  farmId?: number;
}

export interface CreateRoleInput {
  name: string;
  description: string;
}

export type UpdateRoleInput = Partial<CreateRoleInput>;

export interface PermissionGroup {
  id: number;
  name: string;
  permissions: Permission[];
}
