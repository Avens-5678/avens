import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoading = authLoading || roleLoading;

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated — send to /auth and remember where they were trying to go
    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?redirect=${redirect}`);
      return;
    }

    // Role-based access check
    if (allowedRoles && allowedRoles.length > 0 && role) {
      if (!allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on role
        switch (role) {
          case "admin":
            navigate("/admin");
            break;
          case "client":
            navigate("/client/dashboard");
            break;
          case "vendor":
            navigate("/vendor/dashboard");
            break;
          case "employee":
            navigate("/employee/dashboard");
            break;
          default:
            navigate("/");
        }
      }
    }
  }, [user, role, isLoading, allowedRoles, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If roles are specified and user doesn't have the right role, don't render
  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
