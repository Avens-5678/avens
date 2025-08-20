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
    default: 'bg-background/80 backdrop-blur-md border border-border/50',
    subtle: 'bg-background/60 backdrop-blur-lg border border-border/30',
    strong: 'bg-background/90 backdrop-blur-xl border border-border/70'
  };

  const hoverEffect = hover ? 'hover:bg-background/90 hover:border-border/70 hover:shadow-2xl hover:-translate-y-1' : '';
  const glowEffect = glow ? 'shadow-lg shadow-primary/10' : '';

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl transition-all duration-300 ease-out',
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