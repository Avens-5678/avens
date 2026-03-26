import { useRef, useState, useEffect, useMemo } from "react";
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
  activeService?: string;
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

const VENUE_CATEGORIES = [
  "Banquet Halls", "Farmhouses", "Hotels & Resorts", "Party Halls",
  "Outdoor Venues", "Convention Centers", "Heritage Venues", "Rooftop Venues",
];

const CREW_CATEGORIES = [
  "Photographers", "Decorators", "Makeup Artists", "Caterers",
  "DJs & Music", "Choreographers", "Event Managers", "Anchors & MCs",
  "Mehendi Artists", "Florists", "Videographers", "Lighting Technicians",
];

const CategoryIconStrip = ({ categories, activeCategory, onCategoryChange, activeService }: CategoryIconStripProps) => {
  // Override categories based on active service
  const displayCategories = useMemo(() => {
    if (activeService === "venue") {
      return [{ label: "All Venues", value: "" }, ...VENUE_CATEGORIES.map(c => ({ label: c, value: c }))];
    }
    if (activeService === "crew") {
      return [{ label: "All Crew", value: "" }, ...CREW_CATEGORIES.map(c => ({ label: c, value: c }))];
    }
    return categories;
  }, [categories, activeService]);
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
  }, [displayCategories]);
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  return (
    <section className="bg-background border-b border-border py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header with arrows */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Browse our best equipment options
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "border-border bg-card text-foreground hover:bg-muted shadow-sm"
                  : "border-border/50 text-muted-foreground/30"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                canScrollRight
                  ? "border-border bg-card text-foreground hover:bg-muted shadow-sm"
                  : "border-border/50 text-muted-foreground/30"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable icons */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-5 sm:gap-7 min-w-max pb-1">
            {displayCategories.map((cat) => {
              const isActive = (cat.value === "" && !activeCategory) || activeCategory === cat.value;
              const Icon = cat.value === "" ? Sparkles : getIconForCategory(cat.value);

              return (
                <button
                  key={cat.value}
                  onClick={() => onCategoryChange(cat.value === activeCategory ? "" : cat.value)}
                  className="flex flex-col items-center gap-1.5 group"
                  style={{ minWidth: 72 }}
                >
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-primary/8 ring-2 ring-primary text-primary"
                        : "bg-muted/70 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs text-center leading-tight max-w-[80px] transition-colors ${
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground group-hover:text-foreground"
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
    </section>
  );
};

export default CategoryIconStrip;
