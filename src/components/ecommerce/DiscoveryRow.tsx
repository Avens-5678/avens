import { useRef, useState, useEffect, ReactNode } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import EnhancedProductCard from "@/components/ecommerce/EnhancedProductCard";

interface DiscoveryRowProps {
  title: ReactNode;
  subtitle?: string;
  items: any[];
  accentColor?: string;
  onClear?: () => void;
}

const DiscoveryRow = ({ title, subtitle, items, accentColor, onClear }: DiscoveryRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [items]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="py-5 sm:py-10 border-b border-border/40 last:border-b-0">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-4 sm:mb-5">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-2xl font-bold text-foreground tracking-tight leading-tight truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`hidden sm:flex w-9 h-9 rounded-full border-2 items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "border-primary/30 bg-card text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
                  : "border-border/30 text-muted-foreground/20 cursor-default"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`hidden sm:flex w-9 h-9 rounded-full border-2 items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? "border-primary/30 bg-card text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
                  : "border-border/30 text-muted-foreground/20 cursor-default"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {onClear && (
              <button onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive font-medium transition-colors">
                Clear history
              </button>
            )}
            <button className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable row */}
        <div className="relative group">
          <div ref={scrollRef} className="overflow-x-auto scrollbar-hide scroll-smooth">
            <div className="flex gap-3 sm:gap-4 min-w-max pb-3">
              {items.map((rental) => (
                <div key={rental.id} className="w-40 sm:w-64 flex-shrink-0">
                  <EnhancedProductCard rental={rental} viewMode="one" />
                </div>
              ))}
            </div>
          </div>

          {/* Left fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-3 w-6 sm:w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          )}
          {/* Right fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-3 w-6 sm:w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </section>
  );
};

export default DiscoveryRow;
