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
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  // Framer Motion values for premium animations
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-100, 100], [10, -10])
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10])
  const scale = useSpring(1, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set((e.clientX - centerX) * 0.5)
    mouseY.set((e.clientY - centerY) * 0.5)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    scale.set(1.05)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    scale.set(1)
    mouseX.set(0)
    mouseY.set(0)
  }

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
              const duration = 3000
              const startTime = performance.now()
              
              const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime
                const progress = Math.min(elapsed / duration, 1)
                
                // Premium easing curve
                const easeOutCubic = 1 - Math.pow(1 - progress, 3)
                const bounceEffect = 1 - Math.cos(progress * Math.PI * 0.5)
                const finalEase = easeOutCubic * 0.8 + bounceEffect * 0.2
                
                const currentValue = Math.floor(finalEase * targetNumber)
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
        "text-center relative group cursor-pointer",
        className
      )}
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={isVisible ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: 100,
          damping: 12
        }
      } : {}}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating Particles Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={isHovered ? {
          background: [
            "radial-gradient(circle at 20% 80%, hsla(var(--primary) / 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, hsla(var(--primary) / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 40%, hsla(var(--primary) / 0.1) 0%, transparent 50%)"
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-lg -z-10"
        animate={isHovered ? {
          boxShadow: [
            "0 0 20px hsla(var(--primary) / 0.0)",
            "0 0 40px hsla(var(--primary) / 0.3)",
            "0 0 20px hsla(var(--primary) / 0.0)"
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Label */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={isVisible ? { 
          opacity: 1,
          transition: { delay: 0.3, duration: 0.6 }
        } : {}}
      >
        <motion.span 
          className="text-sm font-semibold text-muted-foreground uppercase tracking-wider"
          animate={isHovered ? { scale: 1.05, color: "hsl(var(--primary))" } : {}}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.span>
      </motion.div>

      {/* Number */}
      <motion.div 
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight relative"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isVisible ? { 
          opacity: 1, 
          scale: 1,
          transition: { 
            delay: 0.5, 
            duration: 0.8,
            type: "spring",
            stiffness: 200,
            damping: 15
          }
        } : {}}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Number Shadow Effect */}
        <motion.div
          className="absolute inset-0 text-primary/20 blur-sm"
          style={{ transform: "translateZ(-10px)" }}
          animate={isHovered ? { scale: 1.1 } : {}}
        >
          {displayNumber}
        </motion.div>
        
        {/* Main Number */}
        <motion.div
          style={{ transform: "translateZ(20px)" }}
          animate={isHovered ? { 
            textShadow: "0 0 20px hsla(var(--primary) / 0.5)" 
          } : {}}
        >
          {displayNumber}
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-0 right-0 w-2 h-2 bg-primary/30 rounded-full"
        animate={isHovered ? {
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.8, 0.3],
          y: [-5, -15, -5],
          x: [0, 5, 0]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <motion.div
        className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-primary/20 rounded-full"
        animate={isHovered ? {
          scale: [1, 2, 1],
          opacity: [0.2, 0.6, 0.2],
          y: [5, 15, 5],
          x: [0, -8, 0]
        } : {}}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>
  )
}