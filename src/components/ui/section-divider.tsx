import { cn } from "@/lib/utils";

interface SectionDividerProps {
  variant?: "gradient" | "line" | "wave";
  className?: string;
}

export function SectionDivider({ variant = "gradient", className }: SectionDividerProps) {
  if (variant === "line") {
    return (
      <div className={cn("w-full h-px bg-gradient-to-r from-transparent via-border to-transparent", className)} />
    );
  }

  if (variant === "wave") {
    return (
      <div className={cn("w-full overflow-hidden", className)}>
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-12 fill-muted/30"
        >
          <path d="M0,0 C150,60 350,0 600,50 C850,100 1050,40 1200,80 L1200,120 L0,120 Z" />
        </svg>
      </div>
    );
  }

  // Gradient variant (default)
  return (
    <div className={cn("w-full h-32 bg-gradient-to-b from-transparent via-muted/20 to-transparent", className)} />
  );
}
