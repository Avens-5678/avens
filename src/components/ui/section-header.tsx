import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  children?: ReactNode
  className?: string
  centered?: boolean
  badge?: ReactNode
  title: ReactNode
  description?: ReactNode
  spacing?: "default" | "compact" | "large"
}

export function SectionHeader({ 
  children,
  className,
  centered = true,
  badge,
  title,
  description,
  spacing = "default"
}: SectionHeaderProps) {
  const spacingClasses = {
    compact: "mb-10 lg:mb-12",
    default: "mb-12 lg:mb-16", 
    large: "mb-16 lg:mb-20"
  }

  return (
    <div className={cn(
      spacingClasses[spacing],
      centered && "text-center",
      className
    )}>
      {badge && (
        <div className="mb-5">
          {badge}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  )
}
