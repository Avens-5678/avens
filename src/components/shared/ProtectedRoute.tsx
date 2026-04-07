import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

type AppRole = "admin" | "client" | "vendor" | "employee";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?redirect=${redirect}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && role) {
      if (!allowedRoles.includes(role as AppRole)) {
        switch (role) {
          case "admin":     navigate("/admin"); break;
          case "client":    navigate("/client/dashboard"); break;
          case "vendor":    navigate("/vendor/dashboard"); break;
          case "employee":  navigate("/employee/dashboard"); break;
          default:          navigate("/");
        }
      }
    }
  }, [user, role, loading, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role as AppRole)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
