import { cn } from "@/lib/utils";

interface BackgroundPatternProps {
  variant?: "dots" | "grid" | "noise";
  className?: string;
}

export function BackgroundPattern({ variant = "dots", className }: BackgroundPatternProps) {
  if (variant === "dots") {
    return (
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none opacity-[0.03]",
          className
        )}
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />
    );
  }

  if (variant === "grid") {
    return (
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none opacity-[0.02]",
          className
        )}
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px"
        }}
      />
    );
  }

  // Noise variant using CSS filter
  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none opacity-[0.015]",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }}
    />
  );
}
