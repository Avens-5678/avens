import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Calendar, FileText, User, ArrowLeft, Plus, Bot, FolderOpen, MessageSquare, Gift, Award, Home, HelpCircle } from "lucide-react";
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
import ClientBundleEvents from "@/components/client/ClientBundleEvents";
import LoyaltyDashboard from "@/components/client/LoyaltyDashboard";
import ClientDashboardHome from "@/components/client/ClientDashboardHome";
import ClientHelpGuide from "@/components/client/ClientHelpGuide";
import { useUnreadChats } from "@/hooks/useUnreadChats";

const baseSidebarItems: Omit<SidebarItem, "badge">[] = [
  { icon: Home, label: "Home", value: "home" },
  { icon: Bot, label: "AI Assistant", value: "ai" },
  { icon: FolderOpen, label: "Event Hub", value: "workspace" },
  { icon: Gift, label: "My Events", value: "events" },
  { icon: MessageSquare, label: "Messages", value: "messages" },
  { icon: FileText, label: "My Requests", value: "tracker" },
  { icon: Plus, label: "New Request", value: "request" },
  { icon: Calendar, label: "Past Orders", value: "past-orders" },
  { icon: Award, label: "Loyalty", value: "loyalty" },
  { icon: User, label: "Profile", value: "profile" },
  { icon: HelpCircle, label: "Help & Guide", value: "help" },
];

const ClientDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "home";
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
    <header className="bg-evn-950 text-white px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-base font-brand font-bold italic tracking-tight uppercase">
              Evnting<span className="text-coral-500">.com</span>
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40 bg-white/8 px-2 py-0.5 rounded">
            My Dashboard
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            to="/"
            className="flex items-center gap-1 text-white/50 hover:text-white/80 transition-colors text-[11px] px-2 py-1 rounded-lg hover:bg-white/8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back to Site</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 ml-1 pl-2 border-l border-white/10">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-[11px] font-bold">
              {user?.email?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/90 leading-tight">{user?.user_metadata?.full_name || user?.email}</p>
              <p className="text-[9px] text-white/40">Client</p>
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

  const userName = useMemo(() => user?.user_metadata?.full_name || user?.email || "", [user?.user_metadata?.full_name, user?.email]);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <ClientDashboardHome onTabChange={setActiveTab} />;
      case "ai":
        return null; // Rendered persistently below
      case "workspace":
        return <EventWorkspace />;
      case "events":
        return <ClientBundleEvents />;
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
      case "loyalty":
        return <LoyaltyDashboard />;
      case "profile":
        return <ClientProfileSettings />;
      case "help":
        return <ClientHelpGuide />;
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
      mobilePrimaryItems={["home", "events", "messages", "tracker"]}
    >
      <div className={activeTab === "ai" ? "h-full" : "hidden"}>
        <DashboardChatbot role="client" userName={userName} />
      </div>
      {activeTab !== "ai" && renderContent()}
    </DashboardShell>
  );
};

export default ClientDashboard;
