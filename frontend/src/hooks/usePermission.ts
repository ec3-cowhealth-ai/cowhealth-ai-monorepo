import { useMe } from "./useAuth";

export const useHasPermission = (permissionName: string): boolean => {
  const { data: user } = useMe();
  return user?.permissions?.some((p) => p.name === permissionName) ?? false;
};
