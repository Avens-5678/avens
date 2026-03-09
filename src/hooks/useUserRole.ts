import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "client" | "vendor" | "employee";

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .rpc('get_user_role', { _user_id: user.id });

        console.log("Fetched user role:", data, "for user:", user.id);

        if (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        } else {
          setRole(data as AppRole);
        }
      } catch (error) {
        console.error("Error in useUserRole:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchRole();
    }
  }, [user?.id, authLoading]);

  const isAdmin = role === "admin";
  const isClient = role === "client";
  const isVendor = role === "vendor";
  const isEmployee = role === "employee";

  return {
    role,
    loading: authLoading || loading,
    isAdmin,
    isClient,
    isVendor,
    isEmployee,
  };
};
