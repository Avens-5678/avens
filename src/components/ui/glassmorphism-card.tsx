import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'strong';
  hover?: boolean;
  glow?: boolean;
}

export const GlassmorphismCard = forwardRef<
  HTMLDivElement,
  GlassmorphismCardProps
>(({ children, className, variant = 'default', hover = true, glow = false }, ref) => {
  const variants = {
    default: 'bg-card/90 backdrop-blur-sm border border-border/50',
    subtle: 'bg-card/70 backdrop-blur-md border border-border/30',
    strong: 'bg-card backdrop-blur-lg border border-border/60'
  };

  const hoverEffect = hover 
    ? 'hover:bg-card hover:border-border/80 hover:shadow-strong hover:-translate-y-1' 
    : '';
  const glowEffect = glow ? 'shadow-medium' : '';

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-all duration-400 ease-out',
        variants[variant],
        hoverEffect,
        glowEffect,
        className
      )}
    >
      {children}
    </div>
  );
});

GlassmorphismCard.displayName = 'GlassmorphismCard';

export default GlassmorphismCard;
