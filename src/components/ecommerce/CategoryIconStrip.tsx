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
  lighting: Lightbulb,
  lights: Lightbulb,
  sound: Speaker,
  audio: Speaker,
  dj: Music,
  stage: Theater,
  stages: Theater,
  furniture: Armchair,
  sofa: Sofa,
  decor: Flower2,
  decoration: Flower2,
  floral: Flower2,
  tent: Tent,
  tents: Tent,
  structure: Tent,
  structures: Tent,
  catering: UtensilsCrossed,
  food: UtensilsCrossed,
  av: Monitor,
  electronic: Monitor,
  electronics: Monitor,
  led: Projector,
  camera: Camera,
  photography: Camera,
  transport: Truck,
  logistics: Truck,
  ac: Wind,
  cooling: Wind,
  chiller: Wind,
  linen: Shirt,
  fabric: Shirt,
  party: PartyPopper,
  entertainment: PartyPopper,
  art: Palette,
};

const getIconForCategory = (category: string): LucideIcon => {
  const lower = category.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return icon;
  }
  return Sparkles;
};

const CategoryIconStrip = ({ categories, activeCategory, onCategoryChange }: CategoryIconStripProps) => {
  return (
    <section className="border-b border-border bg-card/80 sticky top-14 sm:top-16 z-40">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="overflow-x-auto scrollbar-hide py-3 sm:py-4">
          <div className="flex gap-4 sm:gap-6 justify-start sm:justify-center min-w-max">
            {categories.map((cat) => {
              const isActive = (cat.value === "" && !activeCategory) || activeCategory === cat.value;
              const Icon = cat.value === "" ? Sparkles : getIconForCategory(cat.value);

              return (
                <button
                  key={cat.value}
                  onClick={() => onCategoryChange(cat.value === activeCategory ? "" : cat.value)}
                  className="flex flex-col items-center gap-1.5 group min-w-[56px] sm:min-w-[64px]"
                >
                  <div
                    className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105"
                    }`}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.8} />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-medium text-center leading-tight max-w-[72px] truncate transition-colors ${
                      isActive ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </span>
                  {isActive && (
                    <div className="w-6 h-0.5 rounded-full bg-primary" />
                  )}
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
