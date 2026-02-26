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
  Truck
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
import Logo from "@/components/ui/logo";
import DashboardShell, { SidebarItem } from "@/components/admin/DashboardShell";

interface AdminDashboardProps {
  adminUser: any;
  onLogout?: () => void;
}

const sidebarItems: SidebarItem[] = [
  { icon: BarChart3, label: "Overview", value: "overview" },
  { icon: ClipboardList, label: "Event Center", value: "events-center" },
  { icon: UsersRound, label: "Users", value: "users" },
  { icon: ShieldCheck, label: "Vendors", value: "vendor-inventory" },
  { icon: Truck, label: "Orders", value: "rental-orders" },
  { icon: Home, label: "Banners", value: "banners" },
  { icon: Calendar, label: "Services", value: "services" },
  { icon: Calendar, label: "Events", value: "events" },
  { icon: Calendar, label: "Rentals", value: "rentals" },
  { icon: Image, label: "Portfolio", value: "portfolio" },
  { icon: Users, label: "Clients", value: "clients" },
  { icon: Star, label: "Reviews", value: "testimonials" },
  { icon: MessageSquare, label: "Forms", value: "forms" },
  { icon: HelpCircle, label: "FAQ", value: "faq" },
  { icon: Settings, label: "Integrations", value: "integrations" },
  { icon: Award, label: "Awards", value: "settings" },
  { icon: Volume2, label: "Audio", value: "audio" },
  { icon: UserCircle, label: "About", value: "about" },
  { icon: UserCircle, label: "Profile", value: "profile" },
];

const mobilePrimaryItems = ["overview", "events-center", "users", "rental-orders", "forms"];

const AdminDashboard = ({ adminUser, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
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

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      }
      toast({
        title: "Logged Out",
        description: "Successfully logged out of admin dashboard.",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setCurrentAdminUser(updatedUser);
  };

  const headerContent = (
    <header className="bg-gradient-to-r from-foreground via-foreground/95 to-foreground/90 text-background px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Logo className="scale-75 brightness-0 invert" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-background/60">Manage your platform</p>
          </div>
          <span className="sm:hidden text-lg font-bold">Admin</span>
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
              {currentAdminUser.full_name?.charAt(0) || "A"}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{currentAdminUser.full_name}</p>
              <p className="text-xs text-background/50 capitalize">{currentAdminUser.role}</p>
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

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <GoogleAnalyticsDashboard />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground border-none rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs opacity-80">Event types active</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Form Submissions</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-secondary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Pending inquiries</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Services</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Active services</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portfolio Items</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Image className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">11</div>
                  <p className="text-xs text-muted-foreground">Gallery images</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("banners")}>
                    <Home className="mr-2 h-4 w-4" />
                    Manage Hero Banners
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("forms")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View Form Submissions
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("portfolio")}>
                    <Image className="mr-2 h-4 w-4" />
                    Update Portfolio
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Website Status</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Update</span>
                    <span className="text-sm text-muted-foreground">Just now</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "events-center":
        return <EventCenter />;
      case "users":
        return <UserManagement />;
      case "vendor-inventory":
        return <VendorInventoryAdmin />;
      case "rental-orders":
        return <LiveRentalOrders />;
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
      case "integrations":
        return <IntegrationTester />;
      case "audio":
        return <AudioManager />;
      case "about":
        return <AboutContentManager />;
      case "profile":
        return <ProfileManager adminUser={currentAdminUser} onProfileUpdate={handleProfileUpdate} />;
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
      mobilePrimaryItems={mobilePrimaryItems}
    >
      {renderContent()}
    </DashboardShell>
  );
};

export default AdminDashboard;
