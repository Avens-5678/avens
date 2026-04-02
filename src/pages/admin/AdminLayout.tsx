import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import { useToast } from "@/hooks/use-toast";

const AdminLayout = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAdminUser(null);
      return;
    }

    // Server-side admin verification — extra security layer beyond ProtectedRoute
    const verifyAdmin = async () => {
      setIsChecking(true);
      try {
        const { data: isAdmin, error } = await supabase.rpc("is_admin_secure");
        if (error) throw error;

        if (!isAdmin) {
          await signOut();
          toast({
            title: "Access Denied",
            description: "You do not have admin privileges.",
            variant: "destructive",
          });
          return;
        }

        setAdminUser({
          email: user.email,
          full_name: "Super Admin",
          role: "super_admin",
          is_active: true,
        });
      } catch (error: any) {
        console.error("Error verifying admin:", error);
        await signOut();
        toast({
          title: "Authentication Error",
          description: "Could not verify admin status.",
          variant: "destructive",
        });
      } finally {
        setIsChecking(false);
      }
    };

    verifyAdmin();
  }, [user?.id, authLoading]);

  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !adminUser) {
    return <AdminLogin onLoginSuccess={() => {}} />;
  }

  return <AdminDashboard adminUser={adminUser} onLogout={signOut} />;
};

export default AdminLayout;
