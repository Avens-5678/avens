import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { getOptimizedImageUrl } from "@/utils/imageAssets"

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
  // Serve a wide but compressed version for the hero background (1920w, 80q webp)
  const optimizedBg = backgroundImage ? getOptimizedImageUrl(backgroundImage, 1920, 80) : undefined;
  
  return (
    <div className="md:contents p-3 pt-4 sm:p-0">
      <section 
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          "min-h-[70vh] rounded-2xl md:rounded-none md:min-h-screen",
          className
        )}
        style={optimizedBg ? { 
          backgroundImage: `url(${optimizedBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : undefined}
        {...props}
      >
        {/* Hidden img for LCP preload discovery + fetchpriority */}
        {optimizedBg && (
          <img
            src={optimizedBg}
            alt=""
            fetchPriority="high"
            aria-hidden="true"
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
          />
        )}

        {/* Gradient overlay */}
        {gradient && !optimizedBg && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 to-secondary/4 rounded-2xl md:rounded-none" />
        )}
        
        {/* Dark overlay for readability over images */}
        {overlay && optimizedBg && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 rounded-2xl md:rounded-none" />
        )}
        
        {/* Ambient decoration — subtle, not distracting */}
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
