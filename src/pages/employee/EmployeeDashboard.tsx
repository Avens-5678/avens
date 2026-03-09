import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useEmployeePermissions, PermissionCategory } from "@/hooks/useEmployeePermissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2, LogOut, ArrowLeft, ShoppingBag, ClipboardList, Briefcase, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/ui/logo";
import DashboardShell, { SidebarItem } from "@/components/admin/DashboardShell";

// Import admin components (reused with restricted access)
import EnhancedRentalManager from "@/components/admin/EnhancedRentalManager";
import PromoBannerManager from "@/components/admin/PromoBannerManager";
import TrustStripManager from "@/components/admin/TrustStripManager";
import VendorInventoryAdmin from "@/components/admin/VendorInventoryAdmin";
import NewEnhancedPortfolioManager from "@/components/admin/NewEnhancedPortfolioManager";
import TestimonialManager from "@/components/admin/TestimonialManager";
import EnhancedFormSubmissions from "@/components/admin/EnhancedFormSubmissions";
import FAQManager from "@/components/admin/FAQManager";
import EventCenter from "@/components/admin/EventCenter";
import LiveRentalOrders from "@/components/admin/LiveRentalOrders";
import LiveServiceOrders from "@/components/admin/LiveServiceOrders";
import QuoteMaker from "@/components/admin/QuoteMaker";
import { useAllRentals, useEvents, usePortfolio, useFormSubmissions } from "@/hooks/useData";

interface SubTab {
  label: string;
  value: string;
  category: PermissionCategory;
}

interface MenuGroup {
  icon: any;
  label: string;
  value: string;
  category: PermissionCategory;
  subTabs: SubTab[];
}

const allMenuGroups: MenuGroup[] = [
  {
    icon: ShoppingBag, label: "Ecommerce", value: "ecommerce", category: "ecommerce",
    subTabs: [
      { label: "Rentals", value: "rentals", category: "ecommerce" },
      { label: "Vendor Inventory", value: "vendor-inventory", category: "ecommerce" },
      { label: "Promo Banners", value: "promo-banners", category: "ecommerce" },
      { label: "Trust Strip", value: "trust-strip", category: "ecommerce" },
    ],
  },
  {
    icon: ClipboardList, label: "Content", value: "content", category: "content",
    subTabs: [
      { label: "Portfolio", value: "portfolio", category: "content" },
      { label: "Reviews", value: "testimonials", category: "content" },
      { label: "Forms", value: "forms", category: "content" },
      { label: "FAQ", value: "faq", category: "content" },
    ],
  },
  {
    icon: Briefcase, label: "Operations", value: "operations", category: "operations",
    subTabs: [
      { label: "Event Center", value: "events-center", category: "operations" },
      { label: "Rental Orders", value: "rental-orders", category: "operations" },
      { label: "Event Requests", value: "service-orders", category: "operations" },
      { label: "Quote Maker", value: "quote-maker", category: "operations" },
    ],
  },
];

const EmployeeDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { permissions, isLoading: permLoading, hasPermission } = useEmployeePermissions(user?.id);

  const [activeGroup, setActiveGroup] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("");

  const { data: rentals } = useAllRentals();
  const { data: events } = useEvents();
  const { data: portfolio } = usePortfolio();
  const { data: formSubmissions } = useFormSubmissions();

  const isLoading = authLoading || roleLoading || permLoading;

  // Filter menu groups based on permissions
  const availableGroups = allMenuGroups.filter((g) => hasPermission(g.category, "view"));

  // Set default active group when permissions load
  useEffect(() => {
    if (!permLoading && availableGroups.length > 0 && !activeGroup) {
      setActiveGroup(availableGroups[0].value);
      setActiveSubTab(availableGroups[0].subTabs[0].value);
    }
  }, [permLoading, permissions]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
    if (!isLoading && role && role !== "employee") {
      navigate("/");
    }
  }, [isLoading, user, role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (availableGroups.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">No Access Granted</h2>
            <p className="text-sm text-muted-foreground">
              Your admin has not assigned any permissions yet. Please contact your administrator.
            </p>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGroupChange = (groupValue: string) => {
    setActiveGroup(groupValue);
    const group = availableGroups.find((g) => g.value === groupValue);
    if (group) {
      setActiveSubTab(group.subTabs[0].value);
    }
  };

  const currentGroup = availableGroups.find((g) => g.value === activeGroup);
  const canEdit = currentGroup ? hasPermission(currentGroup.category, "edit") : false;

  const sidebarItems: SidebarItem[] = availableGroups.map((g) => ({
    icon: g.icon,
    label: g.label,
    value: g.value,
  }));

  const headerContent = (
    <header className="bg-gradient-to-r from-foreground via-foreground/95 to-foreground/90 text-background px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Logo className="scale-75 brightness-0 invert" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight">Employee Dashboard</h1>
            <p className="text-xs text-background/60">
              {canEdit ? "View & Edit Access" : "View Only Access"}
            </p>
          </div>
          <span className="sm:hidden text-lg font-bold">Employee</span>
        </div>
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center text-background/60 hover:text-background transition-colors text-sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Website</span>
          </Link>
          <Button variant="ghost" onClick={() => signOut()} size="sm" className="text-background/70 hover:text-background hover:bg-background/10">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );

  const renderContent = () => {
    // If user doesn't have edit access, show read-only notice
    const readOnlyBanner = !canEdit ? (
      <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2">
        <Lock className="h-4 w-4 flex-shrink-0" />
        <span>You have view-only access to this section. Editing is disabled.</span>
      </div>
    ) : null;

    return (
      <div>
        {readOnlyBanner}
        {renderTab()}
      </div>
    );
  };

  const renderTab = () => {
    switch (activeSubTab) {
      case "rentals":
        return <EnhancedRentalManager rentals={rentals || []} />;
      case "vendor-inventory":
        return <VendorInventoryAdmin />;
      case "promo-banners":
        return <PromoBannerManager />;
      case "trust-strip":
        return <TrustStripManager />;
      case "portfolio":
        return <NewEnhancedPortfolioManager portfolio={portfolio || []} events={events || []} />;
      case "testimonials":
        return <TestimonialManager />;
      case "forms":
        return <EnhancedFormSubmissions formSubmissions={formSubmissions || []} />;
      case "faq":
        return <FAQManager />;
      case "events-center":
        return <EventCenter />;
      case "rental-orders":
        return <LiveRentalOrders />;
      case "service-orders":
        return <LiveServiceOrders />;
      case "quote-maker":
        return <QuoteMaker />;
      default:
        return null;
    }
  };

  return (
    <DashboardShell
      sidebarItems={sidebarItems}
      activeTab={activeGroup}
      onTabChange={handleGroupChange}
      headerContent={headerContent}
      mobilePrimaryItems={availableGroups.map((g) => g.value)}
    >
      {currentGroup?.subTabs && (
        <div className="mb-6 -mt-1">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {currentGroup.subTabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={activeSubTab === tab.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSubTab(tab.value)}
                  className="whitespace-nowrap flex-shrink-0 rounded-full text-xs"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
      {renderContent()}
    </DashboardShell>
  );
};

export default EmployeeDashboard;
