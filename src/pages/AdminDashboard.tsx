import AdminLayout from "./admin/AdminLayout";

// Re-export the AdminLayout as the main AdminDashboard page
// This uses proper Supabase authentication with OTP
const AdminDashboardPage = () => {
  return <AdminLayout />;
};

export default AdminDashboardPage;
