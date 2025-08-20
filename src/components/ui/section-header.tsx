import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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
    compact: "mb-8 lg:mb-12",
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
        <div className="mb-4">
          {badge}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gradient-primary">
        {title}
      </h2>
      {description && (
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      )}
      {children}
    </div>
  )
}