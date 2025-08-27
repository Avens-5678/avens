import { ReactNode, useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface StatsContainerProps {
  children: ReactNode
  className?: string
}

export function StatsContainer({ children, className }: StatsContainerProps) {
  return (
    <div className={cn(
      "bg-gradient-to-br from-background via-background to-muted/20 py-16 lg:py-24",
      className
    )}>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  )
}

interface StatCardProps {
  number: string
  label: string
  animated?: boolean
  className?: string
}

export function StatCard({ 
  number, 
  label,
  animated = true,
  className
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [displayNumber, setDisplayNumber] = useState("0")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          
          if (animated) {
            // Extract numeric part for animation
            const numericPart = number.match(/\d+/)?.[0]
            if (numericPart) {
              const targetNumber = parseInt(numericPart)
              const duration = 2000
              const startTime = performance.now()
              
              const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime
                const progress = Math.min(elapsed / duration, 1)
                const easeOutQuart = 1 - Math.pow(1 - progress, 4)
                
                const currentValue = Math.floor(easeOutQuart * targetNumber)
                setDisplayNumber(number.replace(/\d+/, currentValue.toString()))
                
                if (progress < 1) {
                  requestAnimationFrame(animate)
                }
              }
              
              requestAnimationFrame(animate)
            } else {
              setDisplayNumber(number)
            }
          } else {
            setDisplayNumber(number)
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
  }, [number, animated])

  return (
    <div 
      ref={ref}
      className={cn(
        "text-center",
        "transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {/* Label */}
      <div className="mb-4">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>

      {/* Number */}
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
        {displayNumber}
      </div>
    </div>
  )
}