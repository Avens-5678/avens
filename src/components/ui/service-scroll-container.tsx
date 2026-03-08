import { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ServiceScrollContainerProps {
  children: ReactNode;
  items: any[];
  className?: string;
}

export const ServiceScrollContainer = ({ children, items, className }: ServiceScrollContainerProps) => {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalDots = Math.min(items.length, 6);
  const isPausedRef = useRef(false);
  const animationRef = useRef<number>();

  // Infinite auto-scroll on mobile
  useEffect(() => {
    if (!isMobile || !scrollRef.current || items.length <= 1) return;

    let scrollPos = 0;
    const speed = 0.5;

    const animate = () => {
      if (!scrollRef.current || isPausedRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      scrollPos += speed;
      const maxScroll = scrollRef.current.scrollWidth / 2;
      if (scrollPos >= maxScroll) scrollPos = 0;
      scrollRef.current.scrollLeft = scrollPos;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isMobile, items.length]);

  const handleTouchStart = () => { isPausedRef.current = true; };
  const handleTouchEnd = () => {
    setTimeout(() => { isPausedRef.current = false; }, 2000);
  };

  // For mobile: triple items for seamless loop
  const mobileChildren = isMobile
    ? Array.from({ length: 3 }, (_, setIdx) =>
        (Array.isArray(children) ? children : [children]).map((child, i) => (
          <div key={`${setIdx}-${i}`} className="contents">{child}</div>
        ))
      ).flat()
    : children;

  return (
    <div>
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          isMobile
            ? "flex gap-4 overflow-x-hidden -mx-4 px-4 pb-4"
            : "grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
          className
        )}
        style={isMobile ? { scrollBehavior: "auto" } : undefined}
      >
        {mobileChildren}
      </div>

      {/* Navigation dots - mobile only (hidden when auto-scrolling) */}
      {false && isMobile && totalDots > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 md:hidden">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-6 h-2.5 bg-primary"
                  : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
