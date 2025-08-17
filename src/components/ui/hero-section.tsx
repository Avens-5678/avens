import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  children: ReactNode
  className?: string
  backgroundImage?: string
  overlay?: boolean
  gradient?: boolean
}

export function HeroSection({ 
  children, 
  className, 
  backgroundImage,
  overlay = true,
  gradient = true
}: HeroSectionProps) {
  return (
    <section 
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden",
        className
      )}
      style={backgroundImage ? { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
    >
      {/* Gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 gradient-hero opacity-60" />
      )}
      
      {/* Dark overlay for readability */}
      {overlay && backgroundImage && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  )
}