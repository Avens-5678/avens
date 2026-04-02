import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Calendar, FileText, User, ArrowLeft, Plus, Bot, FolderOpen, MessageSquare } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Logo from "@/components/ui/logo";
import EventRequestForm from "@/components/client/EventRequestForm";
import EventTracker from "@/components/client/EventTracker";
import PastOrders from "@/components/client/PastOrders";
import ClientProfileSettings from "@/components/client/ClientProfileSettings";
import DashboardChatbot from "@/components/dashboard/DashboardChatbot";
import DashboardShell, { SidebarItem } from "@/components/admin/DashboardShell";
import EventWorkspace from "@/components/client/EventWorkspace";
import ClientMessages from "@/components/client/ClientMessages";
import { useUnreadChats } from "@/hooks/useUnreadChats";

const baseSidebarItems: Omit<SidebarItem, "badge">[] = [
  { icon: Bot, label: "AI Assistant", value: "ai" },
  { icon: FolderOpen, label: "Event Hub", value: "workspace" },
  { icon: MessageSquare, label: "Messages", value: "messages" },
  { icon: FileText, label: "My Requests", value: "tracker" },
  { icon: Plus, label: "New Request", value: "request" },
  { icon: Calendar, label: "Past Orders", value: "past-orders" },
  { icon: User, label: "Profile", value: "profile" },
];

const ClientDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "ai";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const unreadChats = useUnreadChats("client");

  const sidebarItems: SidebarItem[] = useMemo(() =>
    baseSidebarItems.map((item) => ({
      ...item,
      badge: item.value === "messages" ? unreadChats : undefined,
    })),
  [unreadChats]);

  // Read eventType from URL params for pre-filling
  const prefilledEventType = searchParams.get("type") || "";

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const headerContent = (
    <header className="bg-gradient-to-r from-foreground via-foreground/95 to-foreground/90 text-background px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Logo className="scale-75 brightness-0 invert" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight">Client Portal</h1>
            <p className="text-xs text-background/60">Track your events</p>
          </div>
          <span className="sm:hidden text-lg font-bold">Client</span>
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
              {user?.email?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-background/50">Client</p>
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

  const userName = useMemo(() => user?.user_metadata?.full_name || user?.email || "", [user?.user_metadata?.full_name, user?.email]);

  const renderContent = () => {
    switch (activeTab) {
      case "ai":
        return null; // Rendered persistently below
      case "workspace":
        return <EventWorkspace />;
      case "messages":
        return <ClientMessages />;
      case "tracker":
        return <EventTracker />;
      case "request":
        return (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                New Event Request
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill out the form below to submit an event request. Our team will review and assign a vendor.
              </p>
            </CardHeader>
            <CardContent>
              <EventRequestForm onSuccess={() => setActiveTab("tracker")} defaultEventType={prefilledEventType} />
            </CardContent>
          </Card>
        );
      case "past-orders":
        return <PastOrders />;
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
      mobilePrimaryItems={["ai", "workspace", "messages", "tracker"]}
    >
      <div className={activeTab === "ai" ? "h-full" : "hidden"}>
        <DashboardChatbot role="client" userName={userName} />
      </div>
      {activeTab !== "ai" && renderContent()}
    </DashboardShell>
  );
};

export default ClientDashboard;
