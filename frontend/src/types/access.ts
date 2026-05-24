export const USER_PROFILE_VALUES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  VIEWER: "VIEWER",
} as const;

export type UserProfile =
  (typeof USER_PROFILE_VALUES)[keyof typeof USER_PROFILE_VALUES];

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

// Retorno do GET /roles (lista)
export interface RoleListItem {
  id: string;
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
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: Array<{ permission: { id: string; name: string } }>;
  users: Array<{
    user: { id: string; name: string; email: string; active: boolean };
  }>;
}

// Manter Role para compatibilidade com código existente
export type Role = RoleDetail;

export interface User {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  roles: RoleListItem[];
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  isActive: boolean;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  profile?: UserProfile;
}

export interface CreateRoleInput {
  name: string;
  description: string;
}

export type UpdateRoleInput = Partial<CreateRoleInput>;

export interface PermissionGroup {
  id: string;
  name: string;
  permissions: Permission[];
}
