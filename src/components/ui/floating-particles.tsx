import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FloatingParticlesProps {
  count?: number;
  className?: string;
  colors?: string[];
  size?: 'sm' | 'md' | 'lg';
  speed?: 'slow' | 'normal' | 'fast';
}

export const FloatingParticles = ({
  count = 8, // Reduced default count for performance
  className,
  colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))'],
  size = 'md',
  speed = 'normal'
}: FloatingParticlesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const speedDurations = {
    slow: { min: 15, max: 25 },
    normal: { min: 10, max: 20 },
    fast: { min: 5, max: 15 }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion preference and reduce particles
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const actualCount = prefersReducedMotion ? 0 : isMobile ? Math.min(count, 5) : count;

    if (actualCount === 0) return;

    const particles = Array.from({ length: actualCount }, (_, i) => {
      const particle = document.createElement('div');
      particle.className = `absolute rounded-full opacity-20 animate-float ${sizeClasses[size]}`;
      particle.style.backgroundColor = colors[i % colors.length];
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${
        speedDurations[speed].min + Math.random() * (speedDurations[speed].max - speedDurations[speed].min)
      }s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.willChange = 'transform'; // Optimize for animations
      
      return particle;
    });

    particles.forEach(particle => {
      containerRef.current?.appendChild(particle);
    });

    return () => {
      particles.forEach(particle => {
        particle.remove();
      });
    };
  }, [count, colors, size, speed]);

  return (
    <div 
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
    />
  );
};

export default FloatingParticles;