import { ReactNode, useState, useEffect, useRef } from "react"
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatsContainerProps {
  children: ReactNode
  className?: string
}

export function StatsContainer({ children, className }: StatsContainerProps) {
  return (
    <div className={cn(
      "py-16 lg:py-24",
      className
    )}>
      <div className="container mx-auto px-5 sm:px-6">
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
            const numericPart = number.match(/\d+/)?.[0]
            if (numericPart) {
              const targetNumber = parseInt(numericPart)
              const duration = 2200
              const startTime = performance.now()
              
              const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime
                const progress = Math.min(elapsed / duration, 1)
                const easeOut = 1 - Math.pow(1 - progress, 3)
                const currentValue = Math.floor(easeOut * targetNumber)
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
    <motion.div 
      ref={ref}
      className={cn(
        "text-center relative p-6 rounded-2xl bg-card/50 border border-border/30",
        className
      )}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1]
        }
      } : {}}
    >
      {/* Number */}
      <motion.div 
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isVisible ? { 
          opacity: 1, 
          scale: 1,
          transition: { 
            delay: 0.2, 
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }
        } : {}}
      >
        {displayNumber}
      </motion.div>

      {/* Label */}
      <motion.span 
        className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]"
        initial={{ opacity: 0 }}
        animate={isVisible ? { 
          opacity: 1,
          transition: { delay: 0.4, duration: 0.4 }
        } : {}}
      >
        {label}
      </motion.span>
    </motion.div>
  )
}
