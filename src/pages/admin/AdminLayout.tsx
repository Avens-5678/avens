import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client"; // Ensure this path is correct
import { User } from "@supabase/supabase-js";
// FIX: Corrected the import path to be a relative path
import AdminDashboard from "./AdminDashboard"; // Your main dashboard component
import { useToast } from "@/hooks/use-toast";

// --- 1. Example AdminLogin Component ---
// This component uses Supabase to handle the login process.
// It remains unchanged as it correctly triggers the 'SIGNED_IN' event.

interface AdminLoginProps {
  // This prop is no longer needed as the parent listens to Supabase auth state
  onLoginSuccess: () => void; 
}

const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // On success, the onAuthStateChange listener in AdminLayout will handle verification.
      toast({ title: "Login Successful", description: "Verifying admin privileges..." });
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};


// --- 2. Corrected AdminLayout Component (formerly AdminDashboardPage) ---
// This component now securely manages the admin session.

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
      // This assumes you have an RPC function `get_admin_users_secure` in Supabase
      const { data: adminList, error } = await supabase.rpc('get_admin_users_secure');

      if (error) throw error;

      const adminData = adminList?.find((admin: any) => admin.email === email && admin.is_active);

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
