import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Briefcase, Package, ShoppingBag, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/ui/logo";
import JobBoard from "@/components/vendor/JobBoard";
import InventoryManager from "@/components/vendor/InventoryManager";
import Marketplace from "@/components/vendor/Marketplace";
import VendorProfileSettings from "@/components/vendor/VendorProfileSettings";
import DashboardShell, { SidebarItem } from "@/components/admin/DashboardShell";

const sidebarItems: SidebarItem[] = [
  { icon: Briefcase, label: "Job Board", value: "jobs" },
  { icon: Package, label: "Inventory", value: "inventory" },
  { icon: ShoppingBag, label: "Marketplace", value: "marketplace" },
  { icon: User, label: "Profile", value: "profile" },
];

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const headerContent = (
    <header className="bg-background border-b border-border px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Logo className="scale-75" />
          <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Vendor Portal
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">Dashboard</Badge>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            to="/"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Website</span>
          </Link>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Vendor</p>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "jobs":
        return <JobBoard />;
      case "inventory":
        return <InventoryManager />;
      case "marketplace":
        return <Marketplace />;
      case "profile":
        return <VendorProfileSettings />;
      default:
        return null;
    }
  };

  return (
    <DashboardShell
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerContent={headerContent}
    >
      {renderContent()}
    </DashboardShell>
  );
};

export default VendorDashboard;
