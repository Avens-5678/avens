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
import VendorBundleManager from "@/components/vendor/VendorBundleManager";
import DeliveryManager from "@/components/vendor/DeliveryManager";
import SiteVisitManager from "@/components/vendor/SiteVisitManager";
import LaborTracker from "@/components/vendor/LaborTracker";
import VendorOfflineBooking from "@/components/vendor/VendorOfflineBooking";
import VendorQuoteMaker from "@/components/vendor/VendorQuoteMaker";
import EssentialsProductManager from "@/components/vendor/EssentialsProductManager";
import EssentialsOrderManager from "@/components/vendor/EssentialsOrderManager";
import RequestServiceAccess from "@/components/vendor/RequestServiceAccess";
import VendorHelpGuide from "@/components/vendor/VendorHelpGuide";

import {
  LayoutDashboard, ClipboardList, Package, MessageSquare,
  UserCheck, ListTodo, IndianRupee, TrendingUp, TrendingDown,
  Star, User, Gift, Truck, MapPin, Users,
  BookOpen, FileText, Bot, Loader2, Boxes, ShoppingBag, PartyPopper, HelpCircle,
} from "lucide-react";

const VendorDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user } = useAuth();
  const { toast } = useToast();
  const unreadChats = useUnreadChats("vendor");
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [vendorStatus, setVendorStatus] = useState<string | null>(null);
  const [services, setServices] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("vendor_onboarding_progress").select("is_completed").eq("vendor_id", user.id).maybeSingle()
      .then(({ data, error }) => {
        if (error) { console.error("Onboarding check failed:", error); setOnboardingDone(true); return; }
        setOnboardingDone(data?.is_completed ?? false);
      });
    supabase.from("profiles").select("vendor_status").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setVendorStatus(data?.vendor_status ?? "pending"));
    (supabase.from as any)("vendor_service_access").select("service,status").eq("vendor_id", user.id)
      .then(({ data }: any) => {
        const approved = (data || []).filter((r: any) => r.status === "approved").map((r: any) => r.service);
        setServices(approved);
      });
  }, [user]);

  // Fetch vendor profile for name
  const [vendorName, setVendorName] = useState("");
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("company_name, full_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setVendorName(data?.company_name || data?.full_name || ""));
  }, [user]);

  const has = (s: string) => services.includes(s);
  const allSections: NavSection[] = useMemo(() => [
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
        { icon: Boxes, label: "My Packages", value: "packages" },
        { icon: Gift, label: "Bundle Events", value: "bundle-events" },
        { icon: Truck, label: "Deliveries", value: "deliveries" },
        { icon: MessageSquare, label: "Chat", value: "chat", badge: unreadChats || undefined },
        { icon: Package, label: "Inventory", value: "inventory" },
      ],
    },
    {
      title: "Essentials",
      items: [
        { icon: ShoppingBag, label: "Shop Products", value: "shop-products" },
        { icon: PartyPopper, label: "Shop Orders", value: "shop-orders" },
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
        { icon: User, label: "Profile", value: "profile" },
        { icon: Package, label: "Request Services", value: "request-service" },
        { icon: HelpCircle, label: "Help & Guide", value: "help" },
      ],
    },
  ], [unreadChats]);

  const sections: NavSection[] = useMemo(() => {
    const filterValues = (vals: string[]) => allSections
      .map((sec) => ({ ...sec, items: sec.items.filter((it) => !vals.includes(it.value)) }))
      .filter((sec) => sec.items.length > 0);
    const hide: string[] = [];
    if (!has("rental") && !has("venue") && !has("crew")) hide.push("inventory","orders","deliveries","bundle-events","packages","quotes","offline","site-visits");
    if (!has("essentials")) hide.push("shop-products","shop-orders");
    return filterValues(hide);
  }, [allSections, services]);

  const userName = useMemo(() => user?.user_metadata?.full_name || user?.email || "", [user]);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <VendorOverview onNavigate={setActiveTab} />;
      case "ai":
        return <DashboardChatbot role="vendor" userName={userName} />;
      case "orders":
        return <OrderTracker />;
      case "packages":
        return <VendorBundleManager />;
      case "bundle-events":
        return <VendorBundleEvents />;
      case "deliveries":
        return <DeliveryManager />;
      case "chat":
        return <ChatManager />;
      case "inventory":
        return <InventoryManager />;
      case "shop-products":
        return <EssentialsProductManager />;
      case "shop-orders":
        return <EssentialsOrderManager />;
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
      case "profile":
        return <VendorProfileSettings />;
      case "request-service":
        return <RequestServiceAccess approved={services} onChange={(s) => setServices(s)} />;
      case "help":
        return <VendorHelpGuide />;
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

  // Pending approval gate
  if (onboardingDone === true && vendorStatus && vendorStatus !== "active") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4 border rounded-lg p-8 bg-card">
          <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
          <h1 className="text-2xl font-semibold">Pending Admin Approval</h1>
          <p className="text-muted-foreground text-sm">
            Your vendor application is under review. You'll get a WhatsApp notification once approved, then you can access your dashboard and inventory.
          </p>
          <p className="text-xs text-muted-foreground">Status: <span className="font-medium uppercase">{vendorStatus}</span></p>
        </div>
      </div>
    );
  }

  // Loading state
  if (onboardingDone === null || vendorStatus === null) {
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
