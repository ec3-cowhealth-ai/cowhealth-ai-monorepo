import { useMe } from "./useAuth";
import type { PermissionName } from "@config/permissions";

export const useHasPermission = (permissionName: PermissionName): boolean => {
  const { data: user } = useMe();
  return user?.permissions?.some((p) => p.name === permissionName) ?? false;
};
