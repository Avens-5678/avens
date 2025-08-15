import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  MessageSquare, 
  LogOut, 
  Home,
  Settings,
  Database 
} from "lucide-react";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalEvents: 0,
    totalServices: 0,
    totalRentals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const loadStats = async () => {
      try {
        const [submissionsRes, eventsRes, servicesRes, rentalsRes] = await Promise.all([
          supabase.from("form_submissions").select("id", { count: "exact", head: true }),
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("services").select("id", { count: "exact", head: true }),
          supabase.from("rentals").select("id", { count: "exact", head: true }),
        ]);

        setStats({
          totalSubmissions: submissionsRes.count || 0,
          totalEvents: eventsRes.count || 0,
          totalServices: servicesRes.count || 0,
          totalRentals: rentalsRes.count || 0,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user, navigate, toast]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Avens Events Admin
              </h1>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <Home className="mr-2 h-4 w-4" />
                  View Site
                </a>
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Form Submissions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">Total inquiries received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Types</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">Available event categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
              <p className="text-xs text-muted-foreground">Active services offered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rental Items</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRentals}</div>
              <p className="text-xs text-muted-foreground">Available rental equipment</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Content Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="submissions" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="submissions">Form Submissions</TabsTrigger>
                <TabsTrigger value="content">Website Content</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="submissions" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Form Submissions</h3>
                  <div className="bg-muted/50 p-8 rounded-lg text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Form submission management interface coming soon
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have {stats.totalSubmissions} submissions waiting for review
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Website Content Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Hero Banners</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage homepage carousel content
                      </p>
                      <Button variant="outline" size="sm" disabled>
                        Edit Banners
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Services</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Update service listings and descriptions
                      </p>
                      <Button variant="outline" size="sm" disabled>
                        Manage Services
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Rentals</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add and edit rental equipment
                      </p>
                      <Button variant="outline" size="sm" disabled>
                        Manage Rentals
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">About Content</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Update company information
                      </p>
                      <Button variant="outline" size="sm" disabled>
                        Edit About
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">News & Awards</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage achievements and news
                      </p>
                      <Button variant="outline" size="sm" disabled>
                        Edit News
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Client Logos</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Update trusted client logos
                      </p>
                      <Button variant="outline" size="sm" disabled>
                        Manage Logos
                      </Button>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="portfolio" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Portfolio Management</h3>
                  <div className="bg-muted/50 p-8 rounded-lg text-center">
                    <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Portfolio image management interface coming soon
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Organize and upload event photos for each service category
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">System Settings</h3>
                  <div className="bg-muted/50 p-8 rounded-lg text-center">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Advanced settings and configuration options coming soon
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email notifications, WhatsApp integration, and more
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button disabled>
                <Users className="mr-2 h-4 w-4" />
                Export Leads
              </Button>
              <Button variant="outline" disabled>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics Report
              </Button>
              <Button variant="outline" disabled>
                <Database className="mr-2 h-4 w-4" />
                Backup Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;