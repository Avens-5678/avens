import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PageHeroProps {
  children?: ReactNode
  className?: string
  badge?: ReactNode
  title: ReactNode
  description?: ReactNode
  variant?: "default" | "gradient" | "minimal"
  size?: "default" | "large" | "compact"
}

export function PageHero({ 
  children,
  className,
  badge,
  title,
  description,
  variant = "gradient",
  size = "default"
}: PageHeroProps) {
  const variantClasses = {
    default: "",
    gradient: "bg-gradient-to-br from-primary/10 to-accent/10",
    minimal: "bg-muted/30"
  }

  const sizeClasses = {
    compact: "py-12 lg:py-16",
    default: "py-16 lg:py-20",
    large: "py-20 lg:py-24"
  }

  return (
    <section className={cn(
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      <div className="container-responsive text-center">
        {badge && (
          <div className="mb-4">
            {badge}
          </div>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient-primary">
          {title}
        </h1>
        {description && (
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}