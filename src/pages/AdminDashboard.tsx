import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
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
  Package,
  Newspaper
} from "lucide-react";
import { 
  useEvents, 
  useServices, 
  useFormSubmissions,
  useHeroBanners,
  useRentals,
  useTrustedClients,
  useAwards,
  useNewsAchievements,
  usePortfolio,
  useAboutContent
} from "@/hooks/useData";
import CrudInterface from "@/components/admin/CrudInterface";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Data hooks
  const { data: events } = useEvents();
  const { data: services } = useServices();
  const { data: submissions } = useFormSubmissions();
  const { data: heroBanners } = useHeroBanners();
  const { data: rentals } = useRentals();
  const { data: trustedClients } = useTrustedClients();
  const { data: awards } = useAwards();
  const { data: newsAchievements } = useNewsAchievements();
  const { data: portfolio } = usePortfolio();
  const { data: aboutContent } = useAboutContent();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "Successfully logged out of admin dashboard.",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const stats = [
    {
      title: "Total Events",
      value: events?.length || 0,
      icon: Calendar,
      description: "Event types active"
    },
    {
      title: "Form Submissions", 
      value: submissions?.length || 0,
      icon: MessageSquare,
      description: "Pending inquiries"
    },
    {
      title: "Services",
      value: services?.length || 0,
      icon: Award,
      description: "Active services"
    },
    {
      title: "Portfolio Items",
      value: portfolio?.length || 0,
      icon: Image,
      description: "Gallery images"
    }
  ];

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
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
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
                  <CardTitle>Recent Form Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submissions?.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{submission.name}</p>
                          <p className="text-sm text-muted-foreground">{submission.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">{submission.form_type}</p>
                        </div>
                        <Badge variant={submission.status === 'new' ? 'default' : 'secondary'}>
                          {submission.status}
                        </Badge>
                      </div>
                    )) || (
                      <p className="text-muted-foreground text-center py-4">No submissions yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forms Tab - Show actual form submissions */}
          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions?.map((submission) => (
                    <Card key={submission.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="font-semibold">{submission.name}</p>
                            <p className="text-sm text-muted-foreground">{submission.email}</p>
                            {submission.phone && (
                              <p className="text-sm text-muted-foreground">{submission.phone}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Form Type:</p>
                            <Badge variant="outline" className="capitalize">{submission.form_type}</Badge>
                            {submission.event_type && (
                              <p className="text-sm text-muted-foreground mt-2 capitalize">
                                Event: {submission.event_type}
                              </p>
                            )}
                          </div>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Status:</p>
                              <Badge variant={submission.status === 'new' ? 'default' : 'secondary'}>
                                {submission.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(submission.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {submission.message && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm">{submission.message}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )) || (
                    <p className="text-muted-foreground text-center py-8">No form submissions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder tabs - will be implemented as full CRUD later */}
          {["banners", "services", "events", "portfolio", "clients", "settings"].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{tab} Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      {tab.charAt(0).toUpperCase() + tab.slice(1)} management interface coming soon.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This feature will allow you to manage {tab} content dynamically.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;