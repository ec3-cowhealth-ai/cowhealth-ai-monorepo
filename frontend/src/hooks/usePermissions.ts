import { useMe } from "./useAuth";
import { PERMISSIONS } from "@config/permissions";
import type { PermissionName } from "@config/permissions";

export const useHasPermission = (permissionName: PermissionName) => {
  const { data: user } = useMe();
  if (!user) return false;
  return user.permissions.some((p) => p.name === permissionName);
};

/**
 * @deprecated Use useHasPermission(PERMISSIONS.VIEW_ANY_USER) instead.
 */
export const useIsAdmin = () => {
  const { data: user } = useMe();
  return user?.permissions?.some((p) => p.name === PERMISSIONS.VIEW_ANY_USER) ?? false;
};

export const useHasAnyPermission = (permissionNames: PermissionName[]) => {
  const { data: user } = useMe();
  if (!user) return false;
  return user.permissions.some((p) => permissionNames.includes(p.name as PermissionName));
};
