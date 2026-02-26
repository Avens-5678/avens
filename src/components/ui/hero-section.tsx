import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
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
  gradient = true,
  ...props
}: HeroSectionProps) {
  const resolvedImage = backgroundImage;
  
  return (
    <section 
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden",
        className
      )}
      style={resolvedImage ? { 
        backgroundImage: `url(${resolvedImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
      {...props}
    >
      {/* Gradient overlay */}
      {gradient && !resolvedImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 to-secondary/4" />
      )}
      
      {/* Dark overlay for readability over images */}
      {overlay && resolvedImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/70" />
      )}
      
      {/* Ambient decoration — subtle, not distracting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-secondary/4 rounded-full blur-[100px]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  )
}
