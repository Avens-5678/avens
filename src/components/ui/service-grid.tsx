import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

interface ServiceGridProps {
  children?: ReactNode
  className?: string
  columns?: 2 | 3 | 4
  services?: any[]
}

export function ServiceGrid({ 
  children, 
  className,
  columns = 3,
  services = []
}: ServiceGridProps) {
  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }

  if (services.length > 0) {
    return (
      <div className={cn(
        "grid gap-6 lg:gap-8",
        columnClasses[columns],
        className
      )}>
        {services.map((service) => (
          <ServiceCard 
            key={service.id}
            title={service.title}
            description={service.short_description}
            href={`/events/${service.event_type.replace('_', '-')}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn(
      "grid gap-6 lg:gap-8",
      columnClasses[columns],
      className
    )}>
      {children}
    </div>
  )
}

interface ServiceCardProps {
  title: string
  description: string
  href: string
  className?: string
}

export function ServiceCard({ 
  title, 
  description, 
  href, 
  className 
}: ServiceCardProps) {
  return (
    <Card className={cn(
      "group hover:shadow-xl transition-all duration-300",
      "border-0 bg-background relative overflow-hidden",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
        <Button asChild variant="premium" className="w-full">
          <Link to={href}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}