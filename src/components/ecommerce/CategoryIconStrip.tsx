import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Lightbulb, Speaker, Theater, Armchair, Flower2, Tent,
  UtensilsCrossed, Monitor, Sparkles, Camera, Truck, Wind,
  Shirt, PartyPopper, Music, Projector, Sofa, Palette,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoryIconStripProps {
  categories: { label: string; value: string }[];
  activeCategory: string;
  onCategoryChange: (value: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  lighting: Lightbulb, lights: Lightbulb,
  sound: Speaker, audio: Speaker, dj: Music,
  stage: Theater, stages: Theater,
  furniture: Armchair, sofa: Sofa,
  decor: Flower2, decoration: Flower2, floral: Flower2,
  tent: Tent, tents: Tent, structure: Tent, structures: Tent,
  catering: UtensilsCrossed, food: UtensilsCrossed,
  av: Monitor, electronic: Monitor, electronics: Monitor,
  led: Projector, camera: Camera, photography: Camera,
  transport: Truck, logistics: Truck,
  ac: Wind, cooling: Wind, chiller: Wind,
  linen: Shirt, fabric: Shirt,
  party: PartyPopper, entertainment: PartyPopper, art: Palette,
};

const getIconForCategory = (category: string): LucideIcon => {
  const lower = category.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return icon;
  }
  return Sparkles;
};

const CategoryIconStrip = ({ categories, activeCategory, onCategoryChange }: CategoryIconStripProps) => {
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
  }, [categories]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -250 : 250, behavior: "smooth" });
  };

  return (
    <section className="bg-background py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header with arrows */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            Browse our best equipment options
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-9 h-9 rounded-full border border-border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "bg-card text-foreground hover:bg-muted shadow-sm cursor-pointer"
                  : "bg-muted/50 text-muted-foreground/30 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-9 h-9 rounded-full border border-border flex items-center justify-center transition-all ${
                canScrollRight
                  ? "bg-card text-foreground hover:bg-muted shadow-sm cursor-pointer"
                  : "bg-muted/50 text-muted-foreground/30 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable category icons */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide"
          >
            <div className="flex gap-6 sm:gap-8 min-w-max pb-2">
              {categories.map((cat) => {
                const isActive = (cat.value === "" && !activeCategory) || activeCategory === cat.value;
                const Icon = cat.value === "" ? Sparkles : getIconForCategory(cat.value);

                return (
                  <button
                    key={cat.value}
                    onClick={() => onCategoryChange(cat.value === activeCategory ? "" : cat.value)}
                    className="flex flex-col items-center gap-2 group"
                    style={{ minWidth: 80 }}
                  >
                    <div
                      className={`flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-primary/10 text-primary ring-2 ring-primary shadow-lg scale-105"
                          : "bg-muted/60 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary group-hover:scale-105"
                      }`}
                    >
                      <Icon className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.5} />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-medium text-center leading-tight max-w-[88px] transition-colors ${
                        isActive ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryIconStrip;
