import { ReactNode, useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ProfessionalStatsProps {
  children: ReactNode
  className?: string
}

export function ProfessionalStats({ children, className }: ProfessionalStatsProps) {
  return (
    <div className={cn(
      "bg-background py-16 lg:py-20",
      className
    )}>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  )
}

interface ProfessionalStatCardProps {
  percentage: number
  description: string
  animated?: boolean
  className?: string
}

export function ProfessionalStatCard({ 
  percentage, 
  description,
  animated = true,
  className
}: ProfessionalStatCardProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (animated) {
            const duration = 2000
            const startTime = performance.now()
            
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / duration, 1)
              const easeOutQuart = 1 - Math.pow(1 - progress, 4)
              
              setCount(Math.floor(easeOutQuart * percentage))
              
              if (progress < 1) {
                requestAnimationFrame(animate)
              }
            }
            
            requestAnimationFrame(animate)
          } else {
            setCount(percentage)
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
  }, [percentage, animated])

  return (
    <div 
      ref={ref}
      className={cn(
        "text-center space-y-4",
        "transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <div 
          className="bg-green-400 h-2 rounded-full transition-all duration-2000 ease-out"
          style={{ 
            width: isVisible ? `${percentage}%` : '0%',
            transitionDelay: '0.5s'
          }}
        />
      </div>

      {/* Percentage */}
      <div className="mb-4">
        <span className="text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
          {animated ? count : percentage}%
        </span>
      </div>

      {/* Description */}
      <p className="text-lg text-muted-foreground leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </div>
  )
}