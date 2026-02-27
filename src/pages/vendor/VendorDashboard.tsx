import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Briefcase, Package, ShoppingBag, User, ArrowLeft, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/ui/logo";
import JobBoard from "@/components/vendor/JobBoard";
import InventoryManager from "@/components/vendor/InventoryManager";
import Marketplace from "@/components/vendor/Marketplace";
import VendorProfileSettings from "@/components/vendor/VendorProfileSettings";
import DashboardChatbot from "@/components/dashboard/DashboardChatbot";
import DashboardShell, { SidebarItem } from "@/components/admin/DashboardShell";

const sidebarItems: SidebarItem[] = [
  { icon: Bot, label: "AI Assistant", value: "ai" },
  { icon: Briefcase, label: "Job Board", value: "jobs" },
  { icon: Package, label: "Inventory", value: "inventory" },
  { icon: ShoppingBag, label: "Marketplace", value: "marketplace" },
  { icon: User, label: "Profile", value: "profile" },
];

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState("ai");
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
    <header className="bg-gradient-to-r from-foreground via-foreground/95 to-foreground/90 text-background px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Logo className="scale-75 brightness-0 invert" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight">Vendor Portal</h1>
            <p className="text-xs text-background/60">Manage your business</p>
          </div>
          <span className="sm:hidden text-lg font-bold">Vendor</span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/"
            className="flex items-center text-background/60 hover:text-background transition-colors text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Website</span>
          </Link>
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-background/20">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              {user?.email?.charAt(0)?.toUpperCase() || "V"}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-background/50">Vendor</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} size="sm" className="text-background/70 hover:text-background hover:bg-background/10">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );

  const userName = useMemo(() => user?.user_metadata?.full_name || user?.email || "", [user?.user_metadata?.full_name, user?.email]);

  const renderContent = () => {
    switch (activeTab) {
      case "ai":
        return null; // Rendered persistently below
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
      {/* Keep chatbot always mounted, toggle visibility */}
      <div className={activeTab === "ai" ? "h-full" : "hidden"}>
        <DashboardChatbot role="vendor" userName={userName} />
      </div>
      {activeTab !== "ai" && renderContent()}
    </DashboardShell>
  );
};

export default VendorDashboard;
