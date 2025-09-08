import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ViewOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface AnimatedViewToggleProps {
  options: ViewOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const AnimatedViewToggle = ({
  options,
  value,
  onValueChange,
  className
}: AnimatedViewToggleProps) => {
  return (
    <div className={cn("relative inline-flex p-1 bg-muted rounded-xl border border-border shadow-sm", className)}>
      {options.map((option, index) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg z-10",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg shadow-md"
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6
                }}
              />
            )}
            <Icon className="h-4 w-4 relative z-10" />
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AnimatedViewToggle;