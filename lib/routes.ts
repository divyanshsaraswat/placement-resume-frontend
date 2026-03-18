/**
 * Centralized route authorization configuration
 */

export const PUBLIC_ROUTES = [
  "/",
  "/demo",
];

export const AUTH_ROUTES = [
  "/login",
];

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * Maps roles to their respective base paths
 */
export const ROLE_PATHS: Record<string, string> = {
  student: "/dashboard/student",
  faculty: "/dashboard/faculty",
  spc: "/dashboard/spc",
  admin: "/dashboard/admin",
};

/**
 * Returns the default path for a given role
 */
export function getRolePath(role?: string) {
  if (!role) return DEFAULT_LOGIN_REDIRECT;
  return ROLE_PATHS[role.toLowerCase()] || DEFAULT_LOGIN_REDIRECT;
}
