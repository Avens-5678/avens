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

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !isMobile) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const scrollPercent = scrollLeft / (scrollWidth - clientWidth);
    const index = Math.round(scrollPercent * (totalDots - 1));
    setActiveIndex(Math.max(0, Math.min(index, totalDots - 1)));
  }, [isMobile, totalDots]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const scrollTo = (index / (totalDots - 1)) * (scrollWidth - clientWidth);
    scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={scrollRef}
        className={cn(
          "flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scroll-smooth scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pb-4 md:pb-0",
          className
        )}
      >
        {children}
      </div>

      {/* Navigation dots - mobile only */}
      {isMobile && totalDots > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 md:hidden">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
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
