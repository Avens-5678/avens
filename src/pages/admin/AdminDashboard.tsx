import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CrudInterface from "@/components/admin/CrudInterface";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { useAllServices, useAllRentals, useHeroBanners, useEvents, usePortfolio, useTrustedClients, useFormSubmissions, useNewsAchievements, useAwards } from "@/hooks/useData";
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
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import EnhancedFormSubmissions from "@/components/admin/EnhancedFormSubmissions";
import NewEnhancedPortfolioManager from "@/components/admin/NewEnhancedPortfolioManager";
import GoogleAnalyticsDashboard from "@/components/admin/GoogleAnalyticsDashboard";
import AudioManager from "@/components/admin/AudioManager";
import ProfileManager from "@/components/admin/ProfileManager";
import TestimonialManager from "@/components/admin/TestimonialManager";
import EnhancedRentalManager from "@/components/admin/EnhancedRentalManager";
import Logo from "@/components/ui/logo";

interface AdminDashboardProps {
  adminUser: any;
  onLogout?: () => void;
}

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
  const { data: newsAchievements = [] } = useNewsAchievements();
  const { data: awards = [] } = useAwards();
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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Logo className="scale-75" />
            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              <span className="hidden sm:inline">Admin Dashboard</span>
              <span className="sm:hidden">Admin</span>
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
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{currentAdminUser.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentAdminUser.role}</p>
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-12 h-auto p-1 gap-1 overflow-x-auto">
            <TabsTrigger value="overview" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Home className="h-3 w-3" />
              <span className="hidden sm:inline">Banners</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="rentals" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Rentals</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image className="h-3 w-3" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-3 w-3" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="h-3 w-3" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-3 w-3" />
              <span className="hidden sm:inline">Forms</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Award className="h-3 w-3" />
              <span className="hidden sm:inline">Awards</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Volume2 className="h-3 w-3" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center justify-center space-x-1 px-2 py-2 text-xs whitespace-nowrap min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <GoogleAnalyticsDashboard />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Event types active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Form Submissions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Pending inquiries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Services</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Active services</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portfolio Items</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">11</div>
                  <p className="text-xs text-muted-foreground">Gallery images</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("banners")}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Manage Hero Banners
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("forms")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View Form Submissions
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("portfolio")}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Update Portfolio
                  </Button>
                </CardContent>
              </Card>

              <Card>
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
          </TabsContent>

          {/* Hero Banners Management */}
          <TabsContent value="banners">
            <CrudInterface
              title="Hero Banners"
              data={banners || []}
              tableName="hero_banners"
              fields={[
                { name: "title", label: "Title", type: "text", required: true },
                { name: "subtitle", label: "Subtitle", type: "text" },
                { name: "image_url", label: "Banner Image", type: "file", required: true },
                { name: "button_text", label: "Button Text", type: "text" },
                { 
                  name: "event_type", 
                  label: "Event Type", 
                  type: "select", 
                  required: true,
                  options: eventTypes
                },
                { name: "display_order", label: "Display Order", type: "number" },
                { name: "is_active", label: "Active", type: "boolean" }
              ]}
            />
          </TabsContent>

          {/* Services Management */}
          <TabsContent value="services">
            <CrudInterface
              title="Services"
              data={services || []}
              tableName="services"
              fields={[
                { name: "title", label: "Title", type: "text", required: true },
                { name: "short_description", label: "Short Description", type: "text", required: true },
                { name: "description", label: "Description", type: "textarea", required: true },
                { 
                  name: "event_type", 
                  label: "Event Type", 
                  type: "select", 
                  required: true,
                  options: eventTypes
                },
                { name: "display_order", label: "Display Order", type: "number" },
                { name: "show_on_home", label: "Show on Home Page", type: "boolean" },
                { name: "is_active", label: "Active", type: "boolean" }
              ]}
            />
          </TabsContent>

          {/* Events Management */}
          <TabsContent value="events">
            <CrudInterface
              title="Events"
              data={events || []}
              tableName="events"
              fields={[
                { name: "title", label: "Title", type: "text", required: true },
                { name: "description", label: "Description", type: "textarea", required: true },
                { name: "process_description", label: "Process Description", type: "textarea", required: true },
                { 
                  name: "event_type", 
                  label: "Event Type", 
                  type: "select", 
                  required: true,
                  options: eventTypes
                },
                { name: "hero_image_url", label: "Hero Image", type: "file" },
                { name: "location", label: "Location", type: "text" },
                { name: "is_active", label: "Active", type: "boolean" }
              ]}
            />
          </TabsContent>

          {/* Rentals Management */}
          <TabsContent value="rentals">
            <EnhancedRentalManager rentals={rentals || []} />
          </TabsContent>

          {/* Portfolio Management */}
          <TabsContent value="portfolio">
            <NewEnhancedPortfolioManager 
              portfolio={portfolio || []} 
              events={events || []}
            />
          </TabsContent>

          {/* Trusted Clients Management */}
          <TabsContent value="clients">
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
          </TabsContent>

          {/* Testimonials Management */}
          <TabsContent value="testimonials">
            <TestimonialManager />
          </TabsContent>

          {/* Form Submissions */}
          <TabsContent value="forms">
            <EnhancedFormSubmissions formSubmissions={formSubmissions || []} />
          </TabsContent>

          {/* News & Achievements and Awards */}
          <TabsContent value="settings">
            <div className="space-y-8">
              {/* News & Achievements Management */}
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
                  { name: "is_active", label: "Active", type: "boolean" }
                ]}
                defaultValues={{ is_active: true, display_order: 0 }}
              />

              {/* Awards Management */}
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
          </TabsContent>

          {/* Audio Management */}
          <TabsContent value="audio">
            <AudioManager />
          </TabsContent>

          {/* Profile Management */}
          <TabsContent value="profile">
            <ProfileManager 
              adminUser={currentAdminUser} 
              onProfileUpdate={handleProfileUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;