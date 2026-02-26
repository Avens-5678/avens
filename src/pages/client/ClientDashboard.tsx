import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Calendar, FileText, User, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/ui/logo";
import EventRequestForm from "@/components/client/EventRequestForm";
import EventTracker from "@/components/client/EventTracker";
import ClientProfileSettings from "@/components/client/ClientProfileSettings";
import DashboardShell, { SidebarItem } from "@/components/admin/DashboardShell";

const sidebarItems: SidebarItem[] = [
  { icon: FileText, label: "My Events", value: "tracker" },
  { icon: Plus, label: "New Request", value: "request" },
  { icon: User, label: "Profile", value: "profile" },
];

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

  const headerContent = (
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
  );

  const renderContent = () => {
    switch (activeTab) {
      case "tracker":
        return <EventTracker />;
      case "request":
        return (
          <Card className="rounded-2xl">
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
        );
      case "profile":
        return <ClientProfileSettings />;
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
    >
      {renderContent()}
    </DashboardShell>
  );
};

export default ClientDashboard;
