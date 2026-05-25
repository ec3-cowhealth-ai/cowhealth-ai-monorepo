import { useMe } from "./useAuth";

// TODO[ANGELO] permissionName é uma string literal livre — uma typo silencia o guard sem erro de TS.
// Criar src/config/permissions.ts com um objeto constante de nomes:
//   export const PERMISSIONS = { VIEW_COW: "View Cow", CREATE_COW: "Create Cow", ... } as const;
//   export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];
// Então mudar a assinatura para: useHasPermission(permissionName: PermissionName)
// O mesmo objeto deve ser replicado no backend (backend/src/config/permissions.ts).

export const useHasPermission = (permissionName: string): boolean => {
  const { data: user } = useMe();
  return user?.permissions?.some((p) => p.name === permissionName) ?? false;
};
