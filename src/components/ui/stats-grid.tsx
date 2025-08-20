import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatsGridProps {
  children: ReactNode
  className?: string
  columns?: 2 | 3 | 4
}

export function StatsGrid({ 
  children, 
  className,
  columns = 4
}: StatsGridProps) {
  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4"
  }

  return (
    <div className={cn(
      "grid gap-4 lg:gap-6",
      columnClasses[columns],
      className
    )}>
      {children}
    </div>
  )
}

interface StatCardProps {
  icon: ReactNode
  value: string | number
  label: string
  className?: string
  color?: "emerald" | "orange" | "purple" | "blue"
}

export function StatCard({ 
  icon, 
  value, 
  label, 
  className,
  color = "blue"
}: StatCardProps) {
  const colorClasses = {
    emerald: {
      card: "hover:border-emerald-400/60 hover:shadow-emerald-500/20 hover:bg-emerald-950/20",
      bg: "bg-emerald-400/30",
      iconBg: "bg-emerald-500/20 border-emerald-400/30 group-hover:bg-emerald-500/30 group-hover:border-emerald-400/50",
      icon: "text-emerald-400 group-hover:text-emerald-300",
      text: "group-hover:text-emerald-200"
    },
    orange: {
      card: "hover:border-orange-400/60 hover:shadow-orange-500/20 hover:bg-orange-950/20",
      bg: "bg-orange-400/30",
      iconBg: "bg-orange-500/20 border-orange-400/30 group-hover:bg-orange-500/30 group-hover:border-orange-400/50",
      icon: "text-orange-400 group-hover:text-orange-300",
      text: "group-hover:text-orange-200"
    },
    purple: {
      card: "hover:border-purple-400/60 hover:shadow-purple-500/20 hover:bg-purple-950/20",
      bg: "bg-purple-400/30",
      iconBg: "bg-purple-500/20 border-purple-400/30 group-hover:bg-purple-500/30 group-hover:border-purple-400/50",
      icon: "text-purple-400 group-hover:text-purple-300",
      text: "group-hover:text-purple-200"
    },
    blue: {
      card: "hover:border-blue-400/60 hover:shadow-blue-500/20 hover:bg-blue-950/20",
      bg: "bg-blue-400/30",
      iconBg: "bg-blue-500/20 border-blue-400/30 group-hover:bg-blue-500/30 group-hover:border-blue-400/50",
      icon: "text-blue-400 group-hover:text-blue-300",
      text: "group-hover:text-blue-200"
    }
  }

  const colors = colorClasses[color]

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl p-4 lg:p-5 text-center",
      "bg-card/80 backdrop-blur-sm border border-border/60",
      "transition-all duration-500 hover:shadow-lg hover:-translate-y-1",
      colors.card,
      className
    )}>
      {/* Floating background elements */}
      <div className={cn(
        "absolute -top-4 -right-4 w-12 h-12 rounded-full blur-lg",
        "group-hover:scale-150 group-hover:rotate-45 transition-all duration-700",
        colors.bg
      )} />
      <div className={cn(
        "absolute -bottom-2 -left-2 w-8 h-8 rounded-full blur-md",
        "group-hover:scale-125 transition-all duration-500",
        colors.bg.replace("400/30", "400/20")
      )} />
      
      <div className="relative z-10">
        {/* Animated Icon Container */}
        <div className={cn(
          "inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14",
          "rounded-xl mb-3 lg:mb-4 border",
          "group-hover:scale-110 group-hover:rotate-6 transition-all duration-500",
          colors.iconBg
        )}>
          <div className={cn(
            "h-5 w-5 lg:h-6 lg:w-6 group-hover:scale-110 transition-all duration-300",
            colors.icon
          )}>
            {icon}
          </div>
        </div>
        
        {/* Value */}
        <div className="relative mb-1 text-2xl lg:text-3xl font-bold text-foreground font-mono tracking-wider drop-shadow-sm">
          {value}
        </div>
        
        {/* Label */}
        <div className={cn(
          "text-xs lg:text-sm font-semibold text-foreground/80",
          "transition-colors duration-300 font-mono tracking-wide",
          colors.text
        )}>
          {label}
        </div>
      </div>
    </div>
  )
}