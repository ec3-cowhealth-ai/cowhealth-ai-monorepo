// Usuários

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  farmId?: number;
  roleId?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  farmId?: number;
}

// Roles

export interface CreateRoleInput {
  name: string;
  description?: string;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

// Permissões

export interface CreatePermissionInput {
  name: string;
  description?: string;
}

export interface UpdatePermissionInput {
  name?: string;
  description?: string;
}

// Grupos de permissões

export interface CreatePermissionGroupInput {
  name: string;
  description?: string;
}

export interface UpdatePermissionGroupInput {
  name?: string;
  description?: string;
}

export interface GrantRevokePermissionsInput {
  permissionIds: number[];
}
