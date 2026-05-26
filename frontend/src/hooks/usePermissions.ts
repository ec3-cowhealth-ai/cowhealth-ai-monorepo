import { useMe } from "./useAuth";

/**
 * Hook to check if the current user has a specific permission.
 * 
 * @param permissionName The name of the permission to check (e.g., "ViewAny User")
 * @returns boolean
 */
export const useHasPermission = (permissionName: string) => {
  const { data: user } = useMe();

  if (!user) return false;

  // Checks if user has the specific permission in their permissions array
  return user.permissions.some((p) => p.name === permissionName);
};

/**
 * Hook to check if the user has ADMIN profile.
 */
export const useIsAdmin = () => {
  const { data: user } = useMe();
  return user?.profile === "ADMIN";
};

/**
 * Hook to check if the user has any of the provided permissions.
 */
export const useHasAnyPermission = (permissionNames: string[]) => {
  const { data: user } = useMe();

  if (!user) return false;

  return user.permissions.some((p) => permissionNames.includes(p.name));
};
