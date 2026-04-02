import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import VendorDashboardShell, { NavSection } from "@/components/vendor/VendorDashboardShell";
import VendorOverview from "@/components/vendor/VendorOverview";
import VendorOnboardingWizard from "@/components/vendor/VendorOnboardingWizard";
import DashboardChatbot from "@/components/dashboard/DashboardChatbot";
import { useUnreadChats } from "@/hooks/useUnreadChats";

// Lazy-ish imports (still eagerly loaded but could be React.lazy later)
import OrderTracker from "@/components/vendor/OrderTracker";
import InventoryManager from "@/components/vendor/InventoryManager";
import EmployeeManager from "@/components/vendor/EmployeeManager";
import TaskManager from "@/components/vendor/TaskManager";
import PayrollManager from "@/components/vendor/PayrollManager";
import ChatManager from "@/components/vendor/ChatManager";
import SpendingTracker from "@/components/vendor/SpendingTracker";
import VendorEarnings from "@/components/vendor/VendorEarnings";
import VendorReviews from "@/components/vendor/VendorReviews";
import VendorProfileSettings from "@/components/vendor/VendorProfileSettings";
import VendorBundleEvents from "@/components/vendor/VendorBundleEvents";
import DeliveryManager from "@/components/vendor/DeliveryManager";
import SiteVisitManager from "@/components/vendor/SiteVisitManager";
import B2BCrossHire from "@/components/vendor/B2BCrossHire";
import LaborTracker from "@/components/vendor/LaborTracker";
import VendorOfflineBooking from "@/components/vendor/VendorOfflineBooking";
import VendorQuoteMaker from "@/components/vendor/VendorQuoteMaker";

import {
  LayoutDashboard, ClipboardList, Package, MessageSquare,
  UserCheck, ListTodo, IndianRupee, TrendingUp, TrendingDown,
  Star, User, Gift, Truck, MapPin, HandshakeIcon, Users,
  BookOpen, FileText, Bot, Loader2,
} from "lucide-react";

const VendorDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user } = useAuth();
  const { toast } = useToast();
  const unreadChats = useUnreadChats("vendor");
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("vendor_onboarding_progress").select("is_completed").eq("vendor_id", user.id).maybeSingle()
      .then(({ data }) => setOnboardingDone(data?.is_completed ?? null));
  }, [user]);

  // Fetch vendor profile for name
  const [vendorName, setVendorName] = useState("");
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("company_name, full_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setVendorName(data?.company_name || data?.full_name || ""));
  }, [user]);

  const sections: NavSection[] = useMemo(() => [
    {
      title: "",
      items: [
        { icon: LayoutDashboard, label: "Overview", value: "overview" },
        { icon: Bot, label: "AI Assistant", value: "ai" },
      ],
    },
    {
      title: "Operations",
      items: [
        { icon: ClipboardList, label: "Orders", value: "orders" },
        { icon: Gift, label: "Bundle Events", value: "bundle-events" },
        { icon: Truck, label: "Deliveries", value: "deliveries" },
        { icon: MessageSquare, label: "Chat", value: "chat", badge: unreadChats || undefined },
        { icon: Package, label: "Inventory", value: "inventory" },
      ],
    },
    {
      title: "Team",
      items: [
        { icon: UserCheck, label: "Employees", value: "team" },
        { icon: ListTodo, label: "Tasks", value: "tasks" },
        { icon: IndianRupee, label: "Payroll", value: "payroll" },
        { icon: Users, label: "Labor", value: "labor" },
      ],
    },
    {
      title: "Finance",
      items: [
        { icon: TrendingUp, label: "Earnings", value: "earnings" },
        { icon: TrendingDown, label: "Spending", value: "spending" },
        { icon: FileText, label: "Quotes", value: "quotes" },
        { icon: BookOpen, label: "Offline Booking", value: "offline" },
      ],
    },
    {
      title: "More",
      items: [
        { icon: Star, label: "Reviews", value: "reviews" },
        { icon: MapPin, label: "Site Visits", value: "site-visits" },
        { icon: HandshakeIcon, label: "B2B Cross-Hire", value: "b2b" },
        { icon: User, label: "Profile", value: "profile" },
      ],
    },
  ], [unreadChats]);

  const userName = useMemo(() => user?.user_metadata?.full_name || user?.email || "", [user]);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <VendorOverview onNavigate={setActiveTab} />;
      case "ai":
        return <DashboardChatbot role="vendor" userName={userName} />;
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
      case "labor":
        return <LaborTracker />;
      case "earnings":
        return <VendorEarnings />;
      case "spending":
        return <SpendingTracker />;
      case "quotes":
        return <VendorQuoteMaker />;
      case "offline":
        return <VendorOfflineBooking />;
      case "reviews":
        return <VendorReviews />;
      case "site-visits":
        return <SiteVisitManager />;
      case "b2b":
        return <B2BCrossHire />;
      case "profile":
        return <VendorProfileSettings />;
      default:
        return <VendorOverview onNavigate={setActiveTab} />;
    }
  };

  // Show onboarding wizard if not completed
  if (onboardingDone === false) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 pt-8">
          <VendorOnboardingWizard onComplete={() => setOnboardingDone(true)} />
        </div>
      </div>
    );
  }

  // Loading state
  if (onboardingDone === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <VendorDashboardShell
      sections={sections}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      vendorName={vendorName}
      mobilePrimaryItems={["overview", "orders", "chat", "inventory", "tasks"]}
    >
      {renderContent()}
    </VendorDashboardShell>
  );
};

export default VendorDashboard;
