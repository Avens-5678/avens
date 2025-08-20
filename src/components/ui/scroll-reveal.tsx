import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-in' | 'fade-in-up' | 'scale-in' | 'slide-in-right' | 'slide-in-left' | 'bounce-in' | 'rotate-in' | 'elastic';
  delay?: number;
  threshold?: number;
  once?: boolean;
  stagger?: number;
  childSelector?: string;
}

export const ScrollReveal = ({ 
  children, 
  className, 
  animation = 'fade-in-up',
  delay = 0,
  threshold = 0.1,
  once = true,
  stagger = 0,
  childSelector
}: ScrollRevealProps) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, once]);

  useEffect(() => {
    if (inView && stagger > 0 && childSelector && ref.current) {
      const children = ref.current.querySelectorAll(childSelector);
      children.forEach((child, index) => {
        const element = child as HTMLElement;
        element.style.animationDelay = `${delay + (index * stagger)}ms`;
      });
    }
  }, [inView, delay, stagger, childSelector]);

  const animationClass = inView ? `animate-${animation}` : 'opacity-0';
  const animationStyle = delay > 0 && !stagger ? { animationDelay: `${delay}ms` } : {};

  return (
    <div 
      ref={ref}
      className={cn(animationClass, className)}
      style={animationStyle}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;