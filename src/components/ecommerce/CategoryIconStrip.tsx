import { useRef, useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import all category images
import imgAll from "@/assets/categories/all.png";
import imgLighting from "@/assets/categories/lighting.png";
import imgSound from "@/assets/categories/sound.png";
import imgStage from "@/assets/categories/stage.png";
import imgFurniture from "@/assets/categories/furniture.png";
import imgDecor from "@/assets/categories/decor.png";
import imgTent from "@/assets/categories/tent.png";
import imgCatering from "@/assets/categories/catering.png";
import imgAv from "@/assets/categories/av.png";
import imgCamera from "@/assets/categories/camera.png";
import imgTransport from "@/assets/categories/transport.png";
import imgCooling from "@/assets/categories/cooling.png";
import imgParty from "@/assets/categories/party.png";
import imgLinen from "@/assets/categories/linen.png";
// Venue images
import imgBanquet from "@/assets/categories/banquet.png";
import imgFarmhouse from "@/assets/categories/farmhouse.png";
import imgHotel from "@/assets/categories/hotel.png";
import imgOutdoor from "@/assets/categories/outdoor.png";
import imgConvention from "@/assets/categories/convention.png";
import imgHeritage from "@/assets/categories/heritage.png";
import imgRooftop from "@/assets/categories/rooftop.png";
// Crew images
import imgMakeup from "@/assets/categories/makeup.png";
import imgDj from "@/assets/categories/dj.png";
import imgChoreographer from "@/assets/categories/choreographer.png";
import imgEventManager from "@/assets/categories/eventmanager.png";
import imgAnchor from "@/assets/categories/anchor.png";
import imgMehendi from "@/assets/categories/mehendi.png";
import imgFlorist from "@/assets/categories/florist.png";
import imgVideographer from "@/assets/categories/videographer.png";

interface CategoryIconStripProps {
  categories: { label: string; value: string }[];
  activeCategory: string;
  onCategoryChange: (value: string) => void;
  activeService?: string;
}

// Map category keywords to unique images — no repeats
const imageMap: Record<string, string> = {
  // Equipment
  lighting: imgLighting, lights: imgLighting,
  sound: imgSound, audio: imgSound,
  stage: imgStage, stages: imgStage,
  furniture: imgFurniture, sofa: imgFurniture,
  decor: imgDecor, decoration: imgDecor, floral: imgDecor,
  tent: imgTent, tents: imgTent, structure: imgTent, structures: imgTent,
  catering: imgCatering, food: imgCatering,
  av: imgAv, electronic: imgAv, electronics: imgAv, led: imgAv,
  camera: imgCamera, photography: imgCamera,
  transport: imgTransport, logistics: imgTransport,
  ac: imgCooling, cooling: imgCooling, chiller: imgCooling, power: imgCooling,
  linen: imgLinen, fabric: imgLinen,
  party: imgParty, entertainment: imgParty,
  // Venues
  "banquet halls": imgBanquet, banquet: imgBanquet,
  farmhouses: imgFarmhouse, farmhouse: imgFarmhouse,
  "hotels & resorts": imgHotel, hotels: imgHotel, hotel: imgHotel,
  "party halls": imgParty,
  "outdoor venues": imgOutdoor, outdoor: imgOutdoor,
  "convention centers": imgConvention, convention: imgConvention,
  "heritage venues": imgHeritage, heritage: imgHeritage,
  "rooftop venues": imgRooftop, rooftop: imgRooftop,
  // Crew
  photographers: imgCamera,
  decorators: imgDecor,
  "makeup artists": imgMakeup, makeup: imgMakeup,
  caterers: imgCatering,
  "djs & music": imgDj, dj: imgDj, music: imgDj,
  choreographers: imgChoreographer,
  "event managers": imgEventManager,
  "anchors & mcs": imgAnchor, anchor: imgAnchor,
  "mehendi artists": imgMehendi, mehendi: imgMehendi,
  florists: imgFlorist,
  videographers: imgVideographer,
  "lighting technicians": imgLighting,
};

const getImageForCategory = (category: string): string => {
  const lower = category.toLowerCase();
  // Exact match first
  if (imageMap[lower]) return imageMap[lower];
  // Partial match
  for (const [key, img] of Object.entries(imageMap)) {
    if (lower.includes(key)) return img;
  }
  return imgAll;
};

// Assign different subtle animations to each index so they feel alive
const animations = [
  "animate-[bounce_3s_ease-in-out_infinite]",
  "animate-[pulse_2.5s_ease-in-out_infinite]",
  "animate-[wiggle_2s_ease-in-out_infinite]",
  "animate-[float_3s_ease-in-out_infinite]",
  "animate-[bounce_3.5s_ease-in-out_infinite]",
  "animate-[pulse_3s_ease-in-out_infinite]",
  "animate-[wiggle_2.5s_ease-in-out_infinite]",
  "animate-[float_2.5s_ease-in-out_infinite]",
];

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

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  return (
    <section className="bg-background border-b border-border py-6 sm:py-8">
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6">
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

        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6"
        >
          <div className="flex gap-5 sm:gap-7 min-w-max pb-1 pr-4 sm:pr-6">
            {displayCategories.map((cat, idx) => {
              const isActive = (cat.value === "" && !activeCategory) || activeCategory === cat.value;
              const categoryImg = cat.value === "" ? imgAll : getImageForCategory(cat.value);
              const anim = animations[idx % animations.length];

              return (
                <button
                  key={cat.value}
                  onClick={() => onCategoryChange(cat.value === activeCategory ? "" : cat.value)}
                  className="flex flex-col items-center gap-1.5 group"
                  style={{ minWidth: 76 }}
                >
                  <div
                    className={`flex items-center justify-center w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full transition-all duration-200 overflow-hidden ${
                      isActive
                        ? "ring-2 ring-primary bg-primary/5 shadow-md"
                        : "bg-muted/50 group-hover:bg-primary/5 group-hover:shadow-sm"
                    }`}
                  >
                    <img
                      src={categoryImg}
                      alt={cat.label}
                      loading="lazy"
                      className={`w-10 h-10 sm:w-11 sm:h-11 object-contain ${anim}`}
                    />
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
