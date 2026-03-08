import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollIndicatorProps {
  className?: string;
}

export function ScrollIndicator({ className }: ScrollIndicatorProps) {
  return (
    <div
      className={cn(
        "absolute bottom-8 left-1/2 -translate-x-1/2 z-20",
        "flex flex-col items-center gap-2 animate-bounce cursor-pointer",
        className
      )}
      onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
    >
      <span className="text-white/60 text-xs uppercase tracking-wider font-medium">
        Scroll
      </span>
      <ChevronDown className="h-6 w-6 text-white/80" />
    </div>
  );
}
