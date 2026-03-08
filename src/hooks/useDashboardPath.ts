import { useUserRole } from "./useUserRole";

/**
 * Returns the correct dashboard base path based on user role.
 * - admin → /admin
 * - vendor → /vendor/dashboard
 * - client → /client/dashboard
 * - unauthenticated → /auth
 */
export const useDashboardPath = () => {
  const { role, loading } = useUserRole();

  const getDashboardBase = () => {
    if (!role) return "/auth";
    switch (role) {
      case "admin":
        return "/admin";
      case "vendor":
        return "/vendor/dashboard";
      case "client":
      default:
        return "/client/dashboard";
    }
  };

  const getServiceRequestPath = (eventTypeSlug?: string) => {
    const base = getDashboardBase();
    const typeParam = eventTypeSlug ? `&type=${eventTypeSlug}` : '';
    if (base === "/auth") return `/auth?redirect=${encodeURIComponent(`/client/dashboard?tab=request${typeParam}`)}`;
    return `${base}?tab=request${typeParam}`;
  };

  return { getDashboardBase, getServiceRequestPath, role, loading };
};
