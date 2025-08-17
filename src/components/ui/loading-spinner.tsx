import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary"
}

export function LoadingSpinner({ 
  className, 
  size = "md", 
  variant = "default" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  const variantClasses = {
    default: "border-muted-foreground/20 border-t-muted-foreground",
    primary: "border-primary/20 border-t-primary animate-pulse-glow",
    secondary: "border-secondary/20 border-t-secondary animate-pulse-glow"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  )
}