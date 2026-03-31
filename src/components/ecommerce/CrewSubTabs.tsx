import { useState } from "react";
import { Zap, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrewSubTabsProps {
  activeTab: "commodity" | "creative";
  onTabChange: (tab: "commodity" | "creative") => void;
}

const CrewSubTabs = ({ activeTab, onTabChange }: CrewSubTabsProps) => {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
      <button
        onClick={() => onTabChange("commodity")}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all",
          activeTab === "commodity"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Zap className="h-3.5 w-3.5" /> Quick Hire
      </button>
      <button
        onClick={() => onTabChange("creative")}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all",
          activeTab === "creative"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Palette className="h-3.5 w-3.5" /> Creative Pros
      </button>
    </div>
  );
};

export default CrewSubTabs;
