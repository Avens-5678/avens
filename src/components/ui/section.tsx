import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  children: ReactNode
  className?: string
  variant?: "default" | "muted" | "gradient"
  spacing?: "default" | "compact" | "large"
  container?: boolean
}

export function Section({ 
  children, 
  className, 
  variant = "default",
  spacing = "default",
  container = true
}: SectionProps) {
  const spacingClasses = {
    compact: "py-14 lg:py-18",
    default: "py-16 lg:py-24", 
    large: "py-20 lg:py-28"
  }

  const variantClasses = {
    default: "",
    muted: "bg-muted/40",
    gradient: "bg-gradient-to-br from-primary/4 via-background to-secondary/3"
  }

  return (
    <section 
      className={cn(
        spacingClasses[spacing],
        variantClasses[variant],
        className
      )}
    >
      {container ? (
        <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  )
}

interface SectionHeaderProps {
  children: ReactNode
  className?: string
  centered?: boolean
  badge?: ReactNode
  title: ReactNode
  description?: ReactNode
}

export function SectionHeader({ 
  children,
  className,
  centered = true,
  badge,
  title,
  description
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "mb-12 lg:mb-16",
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
