export const UserProfileValues = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  VIEWER: "VIEWER",
} as const;

export type UserProfile = typeof UserProfileValues[keyof typeof UserProfileValues];

export interface Permission {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  roles: Role[];
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
