import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
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

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="jobs" className="flex items-center space-x-2 py-3">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Job Board</span>
              <span className="sm:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center space-x-2 py-3">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">My Inventory</span>
              <span className="sm:hidden">Items</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center space-x-2 py-3">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Marketplace</span>
              <span className="sm:hidden">Shop</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2 py-3">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Job Board */}
          <TabsContent value="jobs">
            <JobBoard />
          </TabsContent>

          {/* Inventory Manager */}
          <TabsContent value="inventory">
            <InventoryManager />
          </TabsContent>

          {/* Marketplace */}
          <TabsContent value="marketplace">
            <Marketplace />
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <VendorProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
