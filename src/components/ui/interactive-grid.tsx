import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import ScrollReveal from './scroll-reveal';

interface InteractiveGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  staggerDelay?: number;
  animation?: 'fade-in-up' | 'scale-in' | 'slide-in-right' | 'bounce-in';
}

export const InteractiveGrid = ({
  children,
  columns = 3,
  gap = 'md',
  className,
  staggerDelay = 100,
  animation = 'fade-in-up'
}: InteractiveGridProps) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6 md:gap-8',
    lg: 'gap-8 md:gap-12'
  };

  return (
    <ScrollReveal
      animation={animation}
      stagger={staggerDelay}
      childSelector=".grid-item"
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </ScrollReveal>
  );
};

export default InteractiveGrid;