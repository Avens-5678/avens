import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimatedTextProps {
  children: ReactNode
  className?: string
  variant?: "fade-in" | "fade-in-up" | "scale-in" | "slide-in-right"
  delay?: number
}

export function AnimatedText({ 
  children, 
  className, 
  variant = "fade-in-up",
  delay = 0
}: AnimatedTextProps) {
  const animationClasses = {
    "fade-in": "animate-fade-in",
    "fade-in-up": "animate-fade-in-up", 
    "scale-in": "animate-scale-in",
    "slide-in-right": "animate-slide-in-right"
  }

  return (
    <div 
      className={cn(
        animationClasses[variant],
        className
      )}
      style={delay > 0 ? { 
        animationDelay: `${delay}ms`,
        opacity: 0,
        animationFillMode: 'forwards'
      } : undefined}
    >
      {children}
    </div>
  )
}

interface GradientTextProps {
  children: ReactNode
  className?: string
  variant?: "primary" | "secondary"
}

export function GradientText({ 
  children, 
  className,
  variant = "primary"
}: GradientTextProps) {
  const gradientClasses = {
    primary: "text-gradient-primary",
    secondary: "text-gradient-secondary"
  }

  return (
    <span className={cn(gradientClasses[variant], className)}>
      {children}
    </span>
  )
}