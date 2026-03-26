import { Lightbulb, Speaker, Theater, Flower2, Tent, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoryGridProps {
  onCategoryClick: (service: string, category: string) => void;
}

interface CategoryItem {
  label: string;
  category: string;
  service: string;
  image: string;
  Icon: LucideIcon;
}

const CATEGORIES: CategoryItem[] = [
  {
    label: "Lighting",
    category: "Lighting",
    service: "insta-rent",
    image: "https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=600&q=80",
    Icon: Lightbulb,
  },
  {
    label: "Sound & DJ",
    category: "Sound",
    service: "insta-rent",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    Icon: Speaker,
  },
  {
    label: "Stages",
    category: "Stages",
    service: "insta-rent",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    Icon: Theater,
  },
  {
    label: "Decor & Floral",
    category: "Decor",
    service: "insta-rent",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
    Icon: Flower2,
  },
  {
    label: "Tents & Structures",
    category: "Tents",
    service: "insta-rent",
    image: "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=600&q=80",
    Icon: Tent,
  },
  {
    label: "Catering",
    category: "Catering",
    service: "insta-rent",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80",
    Icon: UtensilsCrossed,
  },
];

const CategoryGrid = ({ onCategoryClick }: CategoryGridProps) => {
  return (
    <section className="py-8 sm:py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1.5">
            Shop by Category
          </h2>
          <p className="text-sm text-muted-foreground">
            Find exactly what you need for your event
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => onCategoryClick(cat.service, cat.category)}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] sm:aspect-[3/2] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {/* Background image */}
              <img
                src={cat.image}
                alt={cat.label}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-5">
                <cat.Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white/80 mb-1.5 transition-transform duration-300 group-hover:-translate-y-1" strokeWidth={1.5} />
                <span className="text-white font-semibold text-sm sm:text-base tracking-wide">
                  {cat.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
