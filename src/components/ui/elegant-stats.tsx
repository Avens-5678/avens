import { ReactNode, useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ElegantStatsProps {
  children: ReactNode
  className?: string
}

export function ElegantStats({ children, className }: ElegantStatsProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl border border-border/30",
      "shadow-2xl shadow-primary/5",
      className
    )}>
      {/* Elegant background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 grid-rows-6 h-full w-full">
          {Array.from({ length: 72 }).map((_, i) => (
            <div key={i} className="border border-foreground/10" />
          ))}
        </div>
      </div>
      
      <div className="relative z-10 p-8 lg:p-12">
        {children}
      </div>
    </div>
  )
}

interface ElegantStatCardProps {
  icon: ReactNode
  value: string | number
  label: string
  description?: string
  color?: "primary" | "emerald" | "orange" | "purple"
  animated?: boolean
}

export function ElegantStatCard({ 
  icon, 
  value, 
  label, 
  description,
  color = "primary",
  animated = true
}: ElegantStatCardProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const colorSchemes = {
    primary: {
      icon: "text-primary",
      gradient: "from-primary/20 to-primary/5",
      border: "border-primary/20",
      glow: "shadow-primary/10"
    },
    emerald: {
      icon: "text-emerald-500",
      gradient: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10"
    },
    orange: {
      icon: "text-orange-500",
      gradient: "from-orange-500/20 to-orange-500/5",
      border: "border-orange-500/20",
      glow: "shadow-orange-500/10"
    },
    purple: {
      icon: "text-purple-500",
      gradient: "from-purple-500/20 to-purple-500/5",
      border: "border-purple-500/20",
      glow: "shadow-purple-500/10"
    }
  }

  const scheme = colorSchemes[color]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (animated && typeof value === 'number') {
            const duration = 2000
            const startTime = performance.now()
            
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / duration, 1)
              const easeOutQuart = 1 - Math.pow(1 - progress, 4)
              
              setCount(Math.floor(easeOutQuart * value))
              
              if (progress < 1) {
                requestAnimationFrame(animate)
              }
            }
            
            requestAnimationFrame(animate)
          }
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [value, animated])

  return (
    <div 
      ref={ref}
      className={cn(
        "group relative p-6 rounded-xl border backdrop-blur-sm",
        "transition-all duration-500 hover:scale-105 hover:shadow-lg",
        "bg-gradient-to-br",
        scheme.gradient,
        scheme.border,
        scheme.glow,
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4",
        "bg-background/80 border border-border/50",
        "group-hover:scale-110 transition-transform duration-300"
      )}>
        <div className={cn("w-6 h-6", scheme.icon)}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
          {animated && typeof value === 'number' ? count.toLocaleString() : value}
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-semibold text-foreground/80 uppercase tracking-wider mb-1">
        {label}
      </div>

      {/* Description */}
      {description && (
        <div className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </div>
      )}

      {/* Hover effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}