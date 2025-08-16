import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CrudInterface from "@/components/admin/CrudInterface";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { useServices, useRentals, useHeroBanners, useEvents, usePortfolio, useTrustedClients, useFormSubmissions } from "@/hooks/useData";
import { 
  LogOut, 
  Home, 
  Users, 
  Calendar, 
  Image, 
  MessageSquare, 
  Award,
  Settings,
  BarChart3
} from "lucide-react";
import EnhancedFormSubmissions from "@/components/admin/EnhancedFormSubmissions";
import EnhancedPortfolioManager from "@/components/admin/EnhancedPortfolioManager";
import GoogleAnalyticsDashboard from "@/components/admin/GoogleAnalyticsDashboard";

interface AdminDashboardProps {
  adminUser: any;
}

const AdminDashboard = ({ adminUser }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  
  // Data hooks
  const { data: services } = useServices();
  const { data: rentals } = useRentals();
  const { data: banners } = useHeroBanners();
  const { data: events } = useEvents();
  const { data: portfolio } = usePortfolio();
  const { data: clients } = useTrustedClients();
  const { data: formSubmissions } = useFormSubmissions();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "Successfully logged out of admin dashboard.",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Avens Events Admin
            </div>
            <Badge variant="secondary">Dashboard</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{adminUser.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{adminUser.role}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Banners</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="rentals" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Rentals</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Forms</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <GoogleAnalyticsDashboard />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                { name: "image_url", label: "Image URL", type: "image", required: true },
                { name: "button_text", label: "Button Text", type: "text" },
                { 
                  name: "event_type", 
                  label: "Event Type", 
                  type: "select", 
                  required: true,
                  options: [
                    { value: "wedding", label: "Wedding" },
                    { value: "corporate", label: "Corporate" },
                    { value: "birthday", label: "Birthday" },
                    { value: "government", label: "Government" },
                  ]
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
                  options: [
                    { value: "wedding", label: "Wedding" },
                    { value: "corporate", label: "Corporate" },
                    { value: "birthday", label: "Birthday" },
                    { value: "government", label: "Government" },
                  ]
                },
                { name: "display_order", label: "Display Order", type: "number" },
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
                  options: [
                    { value: "wedding", label: "Wedding" },
                    { value: "corporate", label: "Corporate" },
                    { value: "birthday", label: "Birthday" },
                    { value: "government", label: "Government" },
                  ]
                },
                { name: "hero_image_url", label: "Hero Image URL", type: "image" },
                { name: "location", label: "Location", type: "text" },
                { name: "is_active", label: "Active", type: "boolean" }
              ]}
            />
          </TabsContent>

          {/* Rentals Management */}
          <TabsContent value="rentals">
            <AdminDataTable
              title="Rentals"
              data={rentals || []}
              queryKey="rentals"
              tableName="rentals"
              fields={[
                { name: "title", label: "Title", type: "text", required: true },
                { name: "short_description", label: "Short Description", type: "text", required: true },
                { name: "description", label: "Description", type: "textarea", required: true },
                { name: "price_range", label: "Price Range", type: "text" },
                { name: "image_url", label: "Image URL", type: "image" },
                { name: "display_order", label: "Display Order", type: "number" },
                { name: "is_active", label: "Active", type: "boolean" }
              ]}
              defaultValues={{ is_active: true, display_order: 0 }}
            />
          </TabsContent>

          {/* Portfolio Management */}
          <TabsContent value="portfolio">
            <EnhancedPortfolioManager 
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
                { name: "logo_url", label: "Logo URL", type: "image", required: true },
                { name: "display_order", label: "Display Order", type: "number" },
                { name: "is_active", label: "Active", type: "boolean" }
              ]}
            />
          </TabsContent>

          {/* Form Submissions */}
          <TabsContent value="forms">
            <EnhancedFormSubmissions formSubmissions={formSubmissions || []} />
          </TabsContent>

          {/* Settings placeholder */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Settings management interface coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;