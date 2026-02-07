import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Calendar, FileText, User, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/ui/logo";
import EventRequestForm from "@/components/client/EventRequestForm";
import EventTracker from "@/components/client/EventTracker";
import ClientProfileSettings from "@/components/client/ClientProfileSettings";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("tracker");
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Logo className="scale-75" />
            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Client Portal
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
            </Link>
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Client</p>
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
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="tracker" className="flex items-center space-x-2 py-3">
              <FileText className="h-4 w-4" />
              <span>My Events</span>
            </TabsTrigger>
            <TabsTrigger value="request" className="flex items-center space-x-2 py-3">
              <Plus className="h-4 w-4" />
              <span>New Request</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2 py-3">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Event Tracker */}
          <TabsContent value="tracker">
            <EventTracker />
          </TabsContent>

          {/* New Event Request */}
          <TabsContent value="request">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Request a New Event
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fill out the form below to submit an event request. Our team will review and assign a vendor.
                </p>
              </CardHeader>
              <CardContent>
                <EventRequestForm onSuccess={() => setActiveTab("tracker")} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <ClientProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
