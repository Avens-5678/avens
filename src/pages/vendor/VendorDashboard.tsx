import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Package, User, ArrowLeft, Bot, ClipboardList, FileText, TrendingUp, TrendingDown, BookOpen, MapPin, HandshakeIcon, Users, Star, UserCheck, ListTodo, IndianRupee, MessageSquare, Gift, Truck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Logo from "@/components/ui/logo";
import InventoryManager from "@/components/vendor/InventoryManager";
import VendorProfileSettings from "@/components/vendor/VendorProfileSettings";
import DashboardChatbot from "@/components/dashboard/DashboardChatbot";
import DashboardShell, { SidebarItem } from "@/components/admin/DashboardShell";
import OrderTracker from "@/components/vendor/OrderTracker";

import VendorOfflineBooking from "@/components/vendor/VendorOfflineBooking";
import VendorQuoteMaker from "@/components/vendor/VendorQuoteMaker";
import VendorEarnings from "@/components/vendor/VendorEarnings";
import VendorReviews from "@/components/vendor/VendorReviews";
import SiteVisitManager from "@/components/vendor/SiteVisitManager";
import B2BCrossHire from "@/components/vendor/B2BCrossHire";
import LaborTracker from "@/components/vendor/LaborTracker";
import EmployeeManager from "@/components/vendor/EmployeeManager";
import TaskManager from "@/components/vendor/TaskManager";
import PayrollManager from "@/components/vendor/PayrollManager";
import ChatManager from "@/components/vendor/ChatManager";
import SpendingTracker from "@/components/vendor/SpendingTracker";
import VendorBundleEvents from "@/components/vendor/VendorBundleEvents";
import DeliveryManager from "@/components/vendor/DeliveryManager";
import VendorOnboardingWizard from "@/components/vendor/VendorOnboardingWizard";
import { useUnreadChats } from "@/hooks/useUnreadChats";
import { supabase } from "@/integrations/supabase/client";

const baseSidebarItems: Omit<SidebarItem, "badge">[] = [
  { icon: Bot, label: "AI Assistant", value: "ai" },
  { icon: ClipboardList, label: "My Orders", value: "orders" },
  { icon: Gift, label: "Bundle Events", value: "bundle-events" },
  { icon: Truck, label: "Deliveries", value: "deliveries" },
  { icon: MessageSquare, label: "Chat", value: "chat" },
  { icon: Package, label: "Inventory", value: "inventory" },
  { icon: UserCheck, label: "Team", value: "team" },
  { icon: ListTodo, label: "Tasks", value: "tasks" },
  { icon: IndianRupee, label: "Payroll", value: "payroll" },
  { icon: MapPin, label: "Site Visits", value: "site-visits" },
  { icon: HandshakeIcon, label: "B2B Cross-Hire", value: "b2b" },
  { icon: Users, label: "Labor & Payroll", value: "labor" },
  { icon: BookOpen, label: "Offline Booking", value: "offline" },
  { icon: FileText, label: "Quotation Maker", value: "quotes" },
  { icon: TrendingDown, label: "Spending", value: "spending" },
  { icon: TrendingUp, label: "Earnings", value: "earnings" },
  { icon: Star, label: "Reviews", value: "reviews" },
  { icon: User, label: "Profile", value: "profile" },
];

const VendorDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "ai";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const unreadChats = useUnreadChats("vendor");
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("vendor_onboarding_progress").select("is_completed").eq("vendor_id", user.id).maybeSingle()
      .then(({ data }) => setOnboardingDone(data?.is_completed ?? null));
  }, [user]);

  const sidebarItems: SidebarItem[] = useMemo(() =>
    baseSidebarItems.map((item) => ({
      ...item,
      badge: item.value === "chat" ? unreadChats : undefined,
    })),
  [unreadChats]);

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
        return null;
      case "orders":
        return <OrderTracker />;
      case "bundle-events":
        return <VendorBundleEvents />;
      case "deliveries":
        return <DeliveryManager />;
      case "chat":
        return <ChatManager />;
      case "inventory":
        return <InventoryManager />;
      case "team":
        return <EmployeeManager />;
      case "tasks":
        return <TaskManager />;
      case "payroll":
        return <PayrollManager />;
      case "site-visits":
        return <SiteVisitManager />;
      case "b2b":
        return <B2BCrossHire />;
      case "labor":
        return <LaborTracker />;
      case "offline":
        return <VendorOfflineBooking />;
      case "quotes":
        return <VendorQuoteMaker />;
      case "spending":
        return <SpendingTracker />;
      case "earnings":
        return <VendorEarnings />;
      case "reviews":
        return <VendorReviews />;
      case "profile":
        return <VendorProfileSettings />;
      default:
        return null;
    }
  };

  // Show onboarding wizard if not completed (and not loading)
  if (onboardingDone === false) {
    return (
      <div className="min-h-screen bg-muted/30">
        {headerContent}
        <div className="p-4 sm:p-6">
          <VendorOnboardingWizard onComplete={() => setOnboardingDone(true)} />
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerContent={headerContent}
      mobilePrimaryItems={["ai", "orders", "chat", "team", "tasks"]}
    >
      <div className={activeTab === "ai" ? "h-full" : "hidden"}>
        <DashboardChatbot role="vendor" userName={userName} />
      </div>
      {activeTab !== "ai" && renderContent()}
    </DashboardShell>
  );
};

export default VendorDashboard;
