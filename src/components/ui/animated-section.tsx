import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-in' | 'fade-in-up' | 'scale-in' | 'slide-in-right';
}

export const AnimatedSection = ({ 
  children, 
  className, 
  delay = 0,
  animation = 'fade-in'
}: AnimatedSectionProps) => {
  const animationStyle = delay > 0 ? { animationDelay: `${delay}s` } : {};
  
  return (
    <div 
      className={cn(`animate-${animation}`, className)}
      style={animationStyle}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;