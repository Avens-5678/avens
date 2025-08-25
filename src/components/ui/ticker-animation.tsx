import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TickerProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}

export function Ticker({ 
  children, 
  direction = 'left', 
  speed = 50,
  className,
  pauseOnHover = true 
}: TickerProps) {
  const isVertical = direction === 'up' || direction === 'down';
  const isReverse = direction === 'up' || direction === 'left';
  
  const animateProps = isVertical 
    ? {
        y: isReverse ? ['0%', '-100%'] : ['0%', '100%'],
        transition: {
          duration: speed,
          ease: 'linear' as const,
          repeat: Infinity,
        },
      }
    : {
        x: isReverse ? ['0%', '-100%'] : ['0%', '100%'],
        transition: {
          duration: speed,
          ease: 'linear' as const,
          repeat: Infinity,
        },
      };

  return (
    <div 
      className={cn(
        'overflow-hidden',
        isVertical ? 'h-full' : 'w-full',
        className
      )}
    >
      <motion.div
        animate={animateProps}
        whileHover={pauseOnHover ? { animationPlayState: 'paused' } : undefined}
        className={cn(
          'flex',
          isVertical ? 'flex-col' : 'flex-row',
          isVertical ? 'h-[200%]' : 'w-[200%]'
        )}
      >
        <div className={cn(
          'flex',
          isVertical ? 'flex-col h-1/2' : 'flex-row w-1/2'
        )}>
          {children}
        </div>
        <div className={cn(
          'flex',
          isVertical ? 'flex-col h-1/2' : 'flex-row w-1/2'
        )}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

interface TickerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function TickerItem({ children, className }: TickerItemProps) {
  return (
    <div className={cn('flex-shrink-0', className)}>
      {children}
    </div>
  );
}