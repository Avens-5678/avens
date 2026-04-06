import { ReactNode, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  ChevronLeft, ChevronRight, Bell, LogOut, User, ExternalLink,
  MoreHorizontal, Search, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import NotificationCenter from "@/components/Layout/NotificationCenter";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  value: string;
  badge?: number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

interface VendorDashboardShellProps {
  sections: NavSection[];
  activeTab: string;
  onTabChange: (value: string) => void;
  children: ReactNode;
  vendorName?: string;
  mobilePrimaryItems?: string[];
}

const VendorDashboardShell = ({
  sections,
  activeTab,
  onTabChange,
  children,
  vendorName,
  mobilePrimaryItems,
}: VendorDashboardShellProps) => {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allItems = sections.flatMap((s) => s.items);
  const primaryValues = mobilePrimaryItems || allItems.slice(0, 5).map((i) => i.value);
  const primaryItems = allItems.filter((i) => primaryValues.includes(i.value));
  const activeInMore = !primaryValues.includes(activeTab);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayName = vendorName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const initials = (displayName[0] || "V").toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Desktop Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside
          className={cn(
            "hidden lg:flex flex-col border-r border-gray-200 bg-white shrink-0 transition-all duration-300 overflow-hidden",
            collapsed ? "w-[72px]" : "w-[240px]"
          )}
        >
          {/* Logo area */}
          <div className={cn("flex items-center h-16 border-b border-gray-100 shrink-0 px-4", collapsed ? "justify-center" : "gap-2.5")}>
            {!collapsed && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-evn-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate leading-tight">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Vendor</p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="w-9 h-9 rounded-xl bg-evn-600 flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
            )}
          </div>

          {/* Nav sections */}
          <ScrollArea className="flex-1 py-2">
            {sections.map((section, si) => (
              <div key={si} className="mb-1">
                {!collapsed && section.title && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    {section.title}
                  </p>
                )}
                {collapsed && si > 0 && <div className="mx-3 my-1.5 h-px bg-border" />}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => onTabChange(item.value)}
                      className={cn(
                        "relative flex items-center gap-2.5 w-full transition-all duration-150",
                        collapsed ? "justify-center px-2 py-2.5 mx-auto" : "px-3 py-2 mx-2 rounded-xl",
                        isActive
                          ? collapsed
                            ? "text-evn-600"
                            : "bg-evn-50 text-evn-700 font-medium"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
                      {!collapsed && (
                        <span className="text-[13px] truncate">{item.label}</span>
                      )}
                      {item.badge && item.badge > 0 && (
                        <span className={cn(
                          "bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center",
                          collapsed
                            ? "absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] px-0.5"
                            : "ml-auto h-4 min-w-[16px] px-1"
                        )}>
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </ScrollArea>

          {/* Collapse + Links */}
          <div className="border-t border-border p-2 shrink-0 space-y-1">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
                collapsed ? "justify-center py-2" : "px-2 py-1.5 text-[12px]"
              )}
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && <span>Back to website</span>}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-full",
                collapsed ? "justify-center py-2" : "px-2 py-1.5 text-[12px]"
              )}
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <><ChevronLeft className="h-3.5 w-3.5 shrink-0" /><span>Collapse</span></>}
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header bar */}
          <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>

            {/* Greeting (desktop) */}
            <div className="hidden lg:block">
              <p className="text-[13px] text-muted-foreground">
                {greeting}, <span className="font-medium text-foreground">{displayName}</span>
              </p>
            </div>

            {/* Mobile: logo */}
            <span className="lg:hidden text-sm font-bold text-foreground">Evnting</span>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <NotificationCenter />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full bg-evn-100 flex items-center justify-center text-evn-700 text-xs font-bold hover:bg-evn-200 transition-colors">
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onTabChange("profile")} className="gap-2 text-xs">
                    <User className="h-3.5 w-3.5" />Profile & Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-xs text-destructive">
                    <LogOut className="h-3.5 w-3.5" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            <div className="p-4 sm:p-5 lg:p-6 max-w-[1200px] mx-auto">{children}</div>
          </main>
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-40 px-1 py-1" style={{ paddingBottom: "var(--safe-area-bottom)" }}>
        <div className="flex items-center justify-around">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onTabChange(item.value)}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg min-w-[44px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-0 right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-0.5">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </button>
            );
          })}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button className={cn("flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg min-w-[44px] transition-colors", activeInMore ? "text-primary" : "text-muted-foreground")}>
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl px-2 pt-4">
              <SheetHeader className="px-4 pb-2"><SheetTitle>All Sections</SheetTitle></SheetHeader>
              <ScrollArea className="h-full">
                <div className="grid grid-cols-3 gap-2 p-2 pb-8">
                  {allItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.value;
                    return (
                      <button key={item.value} onClick={() => { onTabChange(item.value); setMoreOpen(false); }}
                        className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors", isActive ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* ── Mobile sidebar drawer ── */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[260px] p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">{initials}</div>
              <div className="min-w-0"><p className="text-sm font-semibold truncate">{displayName}</p><p className="text-[10px] text-muted-foreground">Vendor</p></div>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full py-2">
            {sections.map((section, si) => (
              <div key={si} className="mb-1">
                {section.title && <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{section.title}</p>}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.value;
                  return (
                    <button key={item.value} onClick={() => { onTabChange(item.value); setMobileMenuOpen(false); }}
                      className={cn("flex items-center gap-2.5 w-full px-4 py-2 text-[13px] transition-colors", isActive ? "text-primary bg-primary/[0.07] font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                      <Icon className="h-4 w-4 shrink-0" />{item.label}
                      {item.badge && item.badge > 0 && <span className="ml-auto bg-red-500 text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">{item.badge}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default VendorDashboardShell;
