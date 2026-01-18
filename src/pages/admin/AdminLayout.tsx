import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import { useToast } from "@/hooks/use-toast";

const AdminLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await checkAdminUser(session.user.email!);
      }
      setIsLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // Defer the admin check to avoid deadlock
          setTimeout(() => {
            checkAdminUser(session.user.email!);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAdminUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminUser = async (email: string) => {
    try {
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, role, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!adminData) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You do not have admin privileges.",
          variant: "destructive",
        });
        return;
      }
      setAdminUser(adminData);
    } catch (error: any) {
      console.error("Error checking admin user:", error);
      await supabase.auth.signOut();
      toast({
        title: "Authentication Error",
        description: "Could not verify admin status.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !adminUser) {
    return <AdminLogin onLoginSuccess={() => {}} />;
  }

  return <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />;
};

export default AdminLayout;
