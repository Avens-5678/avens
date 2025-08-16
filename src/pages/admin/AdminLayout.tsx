import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { useToast } from "@/hooks/use-toast";

const AdminLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await checkAdminUser(session.user.email!);
      }
      
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await checkAdminUser(session.user.email!);
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
      // Use the secure function instead of direct table access
      const { data: adminData, error } = await supabase
        .rpc('get_admin_users_secure')
        .then(result => ({
          data: result.data?.find((admin: any) => admin.email === email && admin.is_active),
          error: result.error
        }));

      if (error) {
        console.error('Error checking admin user:', error);
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "Admin privileges required.",
          variant: "destructive",
        });
        return;
      }

      if (!adminData) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "Admin privileges required.",
          variant: "destructive",
        });
        return;
      }

      setAdminUser(adminData);
    } catch (error) {
      console.error("Error checking admin user:", error);
      await supabase.auth.signOut();
    }
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

  return <AdminDashboard adminUser={adminUser} />;
};

export default AdminLayout;