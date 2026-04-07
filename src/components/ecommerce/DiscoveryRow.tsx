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
    <section className="py-3 sm:py-5 border-b border-border/40 last:border-b-0">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-2.5 sm:mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight leading-tight truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`hidden sm:flex w-7 h-7 rounded-full border items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "border-gray-300 bg-white text-gray-700 hover:bg-evn-600 hover:text-white hover:border-evn-600"
                  : "border-gray-200 text-gray-300 cursor-default"
              }`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`hidden sm:flex w-7 h-7 rounded-full border items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? "border-gray-300 bg-white text-gray-700 hover:bg-evn-600 hover:text-white hover:border-evn-600"
                  : "border-gray-200 text-gray-300 cursor-default"
              }`}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            {onClear && (
              <button onClick={onClear} className="text-[10px] text-muted-foreground hover:text-destructive font-medium transition-colors">
                Clear
              </button>
            )}
            <button className="flex items-center gap-0.5 text-[11px] font-semibold text-evn-600 hover:underline">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Scrollable row */}
        <div className="relative group">
          <div ref={scrollRef} className="overflow-x-auto scrollbar-hide scroll-smooth">
            <div className="flex gap-2 sm:gap-2.5 min-w-max pb-2">
              {items.map((rental) => (
                <div key={rental.id} className="w-36 sm:w-52 flex-shrink-0 h-[220px] sm:h-[280px]">
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
