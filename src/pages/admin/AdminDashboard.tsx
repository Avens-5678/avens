import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CrudInterface from "@/components/admin/CrudInterface";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { useAllServices, useAllRentals, useHeroBanners, useEvents, usePortfolio, useTrustedClients, useFormSubmissions, useAllNewsAchievements, useAllAwards, useAllFAQ } from "@/hooks/useData";
import { useEventTypes } from "@/hooks/useEventTypes";
import {
  LogOut, 
  Home, 
  Users, 
  Calendar, 
  Image, 
  MessageSquare, 
  Award,
  Settings,
  BarChart3,
  Volume2,
  UserCircle,
  ArrowLeft,
  Star,
  HelpCircle,
  ClipboardList,
  UsersRound,
  ShieldCheck,
  Truck,
  Briefcase,
  ShoppingBag,
  MessageCircle,
  Newspaper,
  PartyPopper
} from "lucide-react";
import { Link } from "react-router-dom";
import EnhancedFormSubmissions from "@/components/admin/EnhancedFormSubmissions";
import NewEnhancedPortfolioManager from "@/components/admin/NewEnhancedPortfolioManager";
import GoogleAnalyticsDashboard from "@/components/admin/GoogleAnalyticsDashboard";
import AudioManager from "@/components/admin/AudioManager";
import ProfileManager from "@/components/admin/ProfileManager";
import AboutContentManager from "@/components/admin/AboutContentManager";
import TestimonialManager from "@/components/admin/TestimonialManager";
import EnhancedRentalManager from "@/components/admin/EnhancedRentalManager";
import FAQManager from "@/components/admin/FAQManager";
import IntegrationTester from "@/components/admin/IntegrationTester";
import EventCenter from "@/components/admin/EventCenter";
import UserManagement from "@/components/admin/UserManagement";
import VendorInventoryAdmin from "@/components/admin/VendorInventoryAdmin";
import LiveRentalOrders from "@/components/admin/LiveRentalOrders";
import LiveServiceOrders from "@/components/admin/LiveServiceOrders";
import QuoteMaker from "@/components/admin/QuoteMaker";
import PromoBannerManager from "@/components/admin/PromoBannerManager";
import LogisticsConfigManager from "@/components/admin/LogisticsConfigManager";
import PricingRulesManager from "@/components/admin/PricingRulesManager";
import TrustStripManager from "@/components/admin/TrustStripManager";
import WhatsAppLiveChat from "@/components/admin/WhatsAppLiveChat";
import WhatsAppCampaigns from "@/components/admin/WhatsAppCampaigns";
import WhatsAppContacts from "@/components/admin/WhatsAppContacts";
import WhatsAppTemplates from "@/components/admin/WhatsAppTemplates";
import WhatsAppSettings from "@/components/admin/WhatsAppSettings";
import AdminReviewsManager from "@/components/admin/AdminReviewsManager";
import AdminBannerManager from "@/components/admin/AdminBannerManager";
import AdminCouponManager from "@/components/admin/AdminCouponManager";
import AdminFeaturedManager from "@/components/admin/AdminFeaturedManager";
import AdminSiteSettings from "@/components/admin/AdminSiteSettings";
import AdminChatModeration from "@/components/admin/AdminChatModeration";
import WhatsAppMessageLogs from "@/components/admin/WhatsAppMessageLogs";
import AdminLoyaltyManager from "@/components/admin/AdminLoyaltyManager";
import AdminSurgeManager from "@/components/admin/AdminSurgeManager";
import AdminCityManager from "@/components/admin/AdminCityManager";
import Logo from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import DashboardShell, { SidebarItem } from "@/components/admin/DashboardShell";
import AdminDashboardHome from "@/components/admin/AdminDashboardHome";
import AITestingAgent from "@/components/admin/AITestingAgent";
import AdminEssentials from "@/components/admin/AdminEssentials";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface AdminDashboardProps {
  adminUser: any;
  onLogout?: () => void;
}

interface SubTab {
  label: string;
  value: string;
}

interface MenuGroup {
  icon: any;
  label: string;
  value: string;
  subTabs?: SubTab[];
}

const menuGroups: MenuGroup[] = [
  { icon: BarChart3, label: "Overview", value: "overview" },
  {
    icon: Briefcase, label: "Operations", value: "operations",
    subTabs: [
      { label: "Event Center", value: "events-center" },
      { label: "Rental Orders", value: "rental-orders" },
      { label: "Event Requests", value: "service-orders" },
      { label: "Quote Maker", value: "quote-maker" },
      { label: "Reviews", value: "reviews" },
      { label: "Chat Moderation", value: "chat-moderation" },
      { label: "Loyalty Program", value: "loyalty" },
    ],
  },
  {
    icon: UsersRound, label: "Users", value: "user-mgmt",
    subTabs: [
      { label: "All Users", value: "users" },
      { label: "Vendor Inventory", value: "vendor-inventory" },
    ],
  },
  {
    icon: ShoppingBag, label: "Ecommerce", value: "ecommerce",
    subTabs: [
      { label: "Rentals", value: "rentals" },
      { label: "Vendor Inventory", value: "vendor-inventory" },
      { label: "Promo Banners", value: "promo-banners" },
      { label: "Trust Strip", value: "trust-strip" },
      { label: "Logistics Config", value: "logistics-config" },
      { label: "Pricing Rules", value: "pricing-rules" },
      { label: "Surge Pricing", value: "surge-pricing" },
      { label: "Service Cities", value: "service-cities" },
    ],
  },
  {
    icon: PartyPopper, label: "Essentials", value: "essentials",
    subTabs: [
      { label: "Overview", value: "ess-overview" },
      { label: "Categories", value: "ess-categories" },
      { label: "Bundles", value: "ess-bundles" },
    ],
  },
  {
    icon: Newspaper, label: "CMS", value: "cms",
    subTabs: [
      { label: "Promo Banners", value: "cms-banners" },
      { label: "Coupons", value: "cms-coupons" },
      { label: "Featured Items", value: "cms-featured" },
      { label: "Site Settings", value: "cms-settings" },
    ],
  },
  {
    icon: ClipboardList, label: "Content", value: "content",
    subTabs: [
      { label: "Portfolio", value: "portfolio" },
      { label: "Reviews", value: "testimonials" },
      { label: "Forms", value: "forms" },
      { label: "FAQ", value: "faq" },
    ],
  },
  {
    icon: Home, label: "Website", value: "website",
    subTabs: [
      { label: "Banners", value: "banners" },
      { label: "Services", value: "services" },
      { label: "Events", value: "events" },
      { label: "Clients", value: "clients" },
      { label: "About", value: "about" },
      { label: "Awards & News", value: "settings" },
      { label: "Audio", value: "audio" },
    ],
  },
  {
    icon: MessageCircle, label: "WhatsApp", value: "whatsapp",
    subTabs: [
      { label: "Live Chat", value: "wa-live-chat" },
      { label: "Campaigns", value: "wa-campaigns" },
      { label: "Message Logs", value: "wa-logs" },
      { label: "Contacts", value: "wa-contacts" },
      { label: "Templates", value: "wa-templates" },
      { label: "Settings", value: "wa-settings" },
    ],
  },
  {
    icon: Settings, label: "Settings", value: "settings-group",
    subTabs: [
      { label: "AI Testing", value: "ai-testing" },
      { label: "Integrations", value: "integrations" },
      { label: "Profile", value: "profile" },
    ],
  },
];

const sidebarItems: SidebarItem[] = menuGroups.map((g) => ({
  icon: g.icon,
  label: g.label,
  value: g.value,
}));

const mobilePrimaryItems = ["overview", "operations", "user-mgmt", "ecommerce", "whatsapp"];

const AdminDashboard = ({ adminUser, onLogout }: AdminDashboardProps) => {
  const [activeGroup, setActiveGroup] = useState("overview");
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [currentAdminUser, setCurrentAdminUser] = useState(adminUser);
  const { toast } = useToast();
  
  // Data hooks
  const { data: services } = useAllServices();
  const { data: rentals } = useAllRentals();
  const { data: banners } = useHeroBanners();
  const { data: events } = useEvents();
  const { data: portfolio } = usePortfolio();
  const { data: clients } = useTrustedClients();
  const { data: formSubmissions } = useFormSubmissions();
  const { data: newsAchievements = [] } = useAllNewsAchievements();
  const { data: awards = [] } = useAllAwards();
  const { data: faqs = [] } = useAllFAQ();
  const { eventTypes } = useEventTypes();

  const handleGroupChange = (groupValue: string) => {
    setActiveGroup(groupValue);
    const group = menuGroups.find((g) => g.value === groupValue);
    if (group?.subTabs) {
      setActiveSubTab(group.subTabs[0].value);
    } else {
      setActiveSubTab(groupValue);
    }
  };

  const handleLogout = async () => {
    try {
      if (onLogout) onLogout();
      toast({ title: "Logged Out", description: "Successfully logged out." });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setCurrentAdminUser(updatedUser);
  };

  const currentGroup = menuGroups.find((g) => g.value === activeGroup);

  const headerContent = (
    <header className="bg-evn-950 text-white px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-base font-brand font-bold italic tracking-tight uppercase">
              Evnting<span className="text-coral-500">.com</span>
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40 bg-white/8 px-2 py-0.5 rounded">
            <ShieldCheck className="h-3 w-3" /> Admin
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            to="/"
            className="flex items-center gap-1 text-white/50 hover:text-white/80 transition-colors text-[11px] px-2 py-1 rounded-lg hover:bg-white/8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Site</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 ml-1 pl-2 border-l border-white/10">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-evn-400 to-evn-600 flex items-center justify-center text-white text-[11px] font-bold">
              {currentAdminUser.full_name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/90 leading-tight">{currentAdminUser.full_name}</p>
              <p className="text-[9px] text-white/40 capitalize">{currentAdminUser.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1 text-white/40 hover:text-white/70 hover:bg-white/8 px-2 py-1.5 rounded-lg transition-all text-[11px]">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );

  const renderContent = () => {
    switch (activeSubTab) {
      case "overview":
        return (
          <AdminDashboardHome
            onNavigate={(group, subTab) => { setActiveGroup(group); setActiveSubTab(subTab); }}
          />
        );
      case "events-center":
        return <EventCenter />;
      case "users":
        return <UserManagement />;
      case "vendor-inventory":
        return <VendorInventoryAdmin />;
      case "rental-orders":
        return <LiveRentalOrders />;
      case "service-orders":
        return <LiveServiceOrders />;
      case "quote-maker":
        return <QuoteMaker />;
      case "reviews":
        return <AdminReviewsManager />;
      case "chat-moderation":
        return <AdminChatModeration />;
      case "loyalty":
        return <AdminLoyaltyManager />;
      case "banners":
        return (
          <CrudInterface
            title="Hero Banners"
            data={banners || []}
            tableName="hero_banners"
            fields={[
              { name: "title", label: "Title", type: "text", required: true },
              { name: "subtitle", label: "Subtitle", type: "text" },
              { name: "image_url", label: "Banner Image", type: "file", required: true },
              { name: "button_text", label: "Button Text", type: "text" },
              { name: "event_type", label: "Event Type", type: "select", required: true, options: eventTypes || [] },
              { name: "display_order", label: "Display Order", type: "number" },
              { name: "is_active", label: "Active", type: "boolean" }
            ]}
          />
        );
      case "services":
        return (
          <CrudInterface
            title="Services"
            data={services || []}
            tableName="services"
            fields={[
              { name: "title", label: "Title", type: "text", required: true },
              { name: "short_description", label: "Short Description", type: "text", required: true },
              { name: "description", label: "Description", type: "textarea", required: true },
              { name: "image_url", label: "Service Image", type: "file" },
              { name: "event_type", label: "Event Type", type: "select", required: true, options: eventTypes || [] },
              { name: "display_order", label: "Display Order", type: "number" },
              { name: "show_on_home", label: "Show on Home Page", type: "boolean" },
              { name: "is_active", label: "Active", type: "boolean" }
            ]}
          />
        );
      case "events":
        return (
          <CrudInterface
            title="Events"
            data={events || []}
            tableName="events"
            fields={[
              { name: "title", label: "Title", type: "text", required: true },
              { name: "description", label: "Description", type: "textarea", required: true },
              { name: "process_description", label: "Process Description", type: "textarea", required: true },
              { name: "event_type", label: "Event Type", type: "select", required: true, options: eventTypes || [] },
              { name: "hero_image_url", label: "Hero Image", type: "file" },
              { name: "location", label: "Location", type: "text" },
              { name: "is_active", label: "Active", type: "boolean" }
            ]}
          />
        );
      case "rentals":
        return <EnhancedRentalManager rentals={rentals || []} />;
      case "promo-banners":
        return <PromoBannerManager />;
      case "trust-strip":
        return <TrustStripManager />;
      case "logistics-config":
        return <LogisticsConfigManager />;
      case "pricing-rules":
        return <PricingRulesManager />;
      case "surge-pricing":
        return <AdminSurgeManager />;
      case "service-cities":
        return <AdminCityManager />;
      case "ess-overview":
      case "ess-categories":
      case "ess-bundles":
        return <AdminEssentials />;
      case "cms-banners":
        return <AdminBannerManager />;
      case "cms-coupons":
        return <AdminCouponManager />;
      case "cms-featured":
        return <AdminFeaturedManager />;
      case "cms-settings":
        return <AdminSiteSettings />;
      case "portfolio":
        return <NewEnhancedPortfolioManager portfolio={portfolio || []} events={events || []} />;
      case "clients":
        return (
          <CrudInterface
            title="Trusted Clients"
            data={clients || []}
            tableName="trusted_clients"
            fields={[
              { name: "name", label: "Client Name", type: "text", required: true },
              { name: "logo_url", label: "Client Logo", type: "file", required: true },
              { name: "display_order", label: "Display Order", type: "number" },
              { name: "is_active", label: "Active", type: "boolean" }
            ]}
          />
        );
      case "testimonials":
        return <TestimonialManager />;
      case "forms":
        return <EnhancedFormSubmissions formSubmissions={formSubmissions || []} />;
      case "settings":
        return (
          <div className="space-y-8">
            <AdminDataTable
              title="News & Achievements"
              data={newsAchievements || []}
              queryKey="news-achievements"
              tableName="news_achievements"
              fields={[
                { name: "title", label: "Title", type: "text", required: true },
                { name: "short_content", label: "Short Content", type: "text", required: true },
                { name: "content", label: "Full Content", type: "textarea", required: true },
                { name: "image_url", label: "Image URL", type: "image" },
                { name: "display_order", label: "Display Order", type: "number" },
                { name: "show_on_home", label: "Show on Home Screen", type: "boolean" },
                { name: "is_active", label: "Active", type: "boolean" }
              ]}
              defaultValues={{ is_active: true, display_order: 0, show_on_home: false }}
            />
            <AdminDataTable
              title="Awards"
              data={awards || []}
              queryKey="awards"
              tableName="awards"
              fields={[
                { name: "title", label: "Award Title", type: "text", required: true },
                { name: "description", label: "Description", type: "textarea", required: true },
                { name: "year", label: "Year", type: "number" },
                { name: "logo_url", label: "Logo URL", type: "image" },
                { name: "display_order", label: "Display Order", type: "number" },
                { name: "is_active", label: "Active", type: "boolean" }
              ]}
              defaultValues={{ is_active: true, display_order: 0 }}
            />
          </div>
        );
      case "faq":
        return <FAQManager />;
      case "ai-testing":
        return <AITestingAgent />;
      case "integrations":
        return <IntegrationTester />;
      case "audio":
        return <AudioManager />;
      case "about":
        return <AboutContentManager />;
      case "profile":
        return <ProfileManager adminUser={currentAdminUser} onProfileUpdate={handleProfileUpdate} />;
      case "wa-live-chat":
        return <WhatsAppLiveChat />;
      case "wa-campaigns":
        return <WhatsAppCampaigns />;
      case "wa-logs":
        return <WhatsAppMessageLogs />;
      case "wa-contacts":
        return <WhatsAppContacts />;
      case "wa-templates":
        return <WhatsAppTemplates />;
      case "wa-settings":
        return <WhatsAppSettings />;
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
      mobilePrimaryItems={mobilePrimaryItems}
    >
      {/* Sub-tabs — compact pill bar */}
      {currentGroup?.subTabs && (
        <div className="mb-5 -mt-1">
          <ScrollArea className="w-full">
            <div className="flex gap-1.5 pb-2">
              {currentGroup.subTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveSubTab(tab.value)}
                  className={cn(
                    "whitespace-nowrap flex-shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all",
                    activeSubTab === tab.value
                      ? "bg-evn-600 text-white shadow-sm"
                      : "bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200"
                  )}
                >
                  {tab.label}
                </button>
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

export default AdminDashboard;
