import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  value: string;
  badge?: number;
}

interface DashboardShellProps {
  sidebarItems: SidebarItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  headerContent: ReactNode;
  children: ReactNode;
  /** Items to show in mobile bottom bar (max ~5). Rest go into "More" sheet. If not provided, all items shown. */
  mobilePrimaryItems?: string[];
}

const DashboardShell = ({
  sidebarItems,
  activeTab,
  onTabChange,
  headerContent,
  children,
  mobilePrimaryItems,
}: DashboardShellProps) => {
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryValues = mobilePrimaryItems || sidebarItems.map((i) => i.value);
  const primaryItems = sidebarItems.filter((i) => primaryValues.includes(i.value));
  const secondaryItems = sidebarItems.filter((i) => !primaryValues.includes(i.value));
  const needsMore = secondaryItems.length > 0;

  // Check if active tab is in secondary items (for "More" button highlight)
  const activeInSecondary = secondaryItems.some((i) => i.value === activeTab);

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      {/* Header */}
      {headerContent}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar — sleek dark */}
        <aside className="hidden lg:flex w-[68px] flex-col items-center py-3 gap-0.5 bg-evn-950 shrink-0">
          <TooltipProvider delayDuration={200}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.value;
              return (
                <Tooltip key={item.value}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onTabChange(item.value)}
                      className={cn(
                        "relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
                        isActive
                          ? "bg-white/15 text-white shadow-inner"
                          : "text-white/40 hover:bg-white/8 hover:text-white/70"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-coral-500 text-white text-[8px] font-bold rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-0.5">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar — glassmorphism */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 z-40 px-1 py-1" style={{ paddingBottom: "var(--safe-area-bottom)" }}>
        <div className="flex items-center justify-around">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onTabChange(item.value)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg min-w-[48px] transition-all",
                  isActive
                    ? "text-evn-600"
                    : "text-gray-400"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-0 right-0.5 bg-coral-500 text-white text-[8px] font-bold rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-0.5">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
                <span className={cn("text-[10px] font-medium leading-tight truncate max-w-[56px]", isActive && "font-semibold")}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {needsMore && (
            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg min-w-[48px] transition-colors",
                    activeInSecondary ? "text-evn-600" : "text-gray-400"
                  )}
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="text-[10px] font-medium leading-tight">More</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl px-2 pt-4">
                <SheetHeader className="px-4 pb-2">
                  <SheetTitle className="text-sm">All Sections</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-4 gap-2 p-2 pb-8">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.value;
                      return (
                        <button
                          key={item.value}
                          onClick={() => {
                            onTabChange(item.value);
                            setMoreOpen(false);
                          }}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
                            isActive
                              ? "bg-evn-600 text-white shadow-md"
                              : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-[10px] font-medium text-center leading-tight">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </nav>
    </div>
  );
};

export default DashboardShell;
