import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import EnhancedProductCard from "@/components/ecommerce/EnhancedProductCard";

interface DiscoveryRowProps {
  title: string;
  subtitle?: string;
  items: any[];
  accentColor?: string;
}

const DiscoveryRow = ({ title, subtitle, items, accentColor }: DiscoveryRowProps) => {
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
    <section className="py-6 sm:py-10 border-b border-border/40 last:border-b-0">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
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
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? "border-primary/30 bg-card text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
                  : "border-border/30 text-muted-foreground/20 cursor-default"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable row */}
        <div className="relative group">
          <div ref={scrollRef} className="overflow-x-auto scrollbar-hide scroll-smooth">
            <div className="flex gap-4 min-w-max pb-3">
              {items.map((rental) => (
                <div key={rental.id} className="w-56 sm:w-64 flex-shrink-0">
                  <EnhancedProductCard rental={rental} viewMode="one" />
                </div>
              ))}
            </div>
          </div>

          {/* Left fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-3 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          )}
          {/* Right fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </section>
  );
};

export default DiscoveryRow;
