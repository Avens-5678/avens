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
  return (
    <div className="md:contents p-3 pt-4 sm:p-0">
      <section 
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          "min-h-[70vh] rounded-2xl md:rounded-none md:min-h-screen",
          className
        )}
        style={backgroundImage ? { 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : undefined}
        {...props}
      >
        {/* Hidden img for LCP preload discovery + fetchpriority */}
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            // @ts-ignore - fetchpriority is valid HTML but React 18 types don't include it
            fetchpriority="high"
            aria-hidden="true"
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
          />
        )}

        {/* Gradient overlay */}
        {gradient && !backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 to-secondary/4 rounded-2xl md:rounded-none" />
        )}
        
        {/* Dark overlay for readability over images */}
        {overlay && backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 rounded-2xl md:rounded-none" />
        )}
        
        {/* Ambient decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl md:rounded-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-secondary/4 rounded-full blur-[100px]" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full">
          {children}
        </div>
      </section>
    </div>
  )
}
