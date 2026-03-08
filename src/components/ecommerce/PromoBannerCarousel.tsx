import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const banners = [
  {
    id: 1,
    title: "Mega Event Sale",
    subtitle: "Up to 40% off on Premium Structures & Hangars",
    cta: "Shop Now",
    gradient: "from-primary/90 via-primary/70 to-accent/80",
    accent: "bg-secondary text-secondary-foreground",
  },
  {
    id: 2,
    title: "Wedding Season Special",
    subtitle: "Exclusive décor packages starting ₹15,000",
    cta: "Explore Collection",
    gradient: "from-[hsl(330,60%,40%)] via-[hsl(340,50%,50%)] to-[hsl(350,60%,60%)]",
    accent: "bg-primary-foreground text-foreground",
  },
  {
    id: 3,
    title: "Corporate Event Kits",
    subtitle: "Sound + Lighting + Stage — bundled & ready to go",
    cta: "View Bundles",
    gradient: "from-foreground/90 via-foreground/70 to-muted-foreground/60",
    accent: "bg-secondary text-secondary-foreground",
  },
  {
    id: 4,
    title: "New Arrivals 🔥",
    subtitle: "LED Walls, Hydraulic Stages & AC Domes now available",
    cta: "See What's New",
    gradient: "from-accent/80 via-primary/60 to-secondary/70",
    accent: "bg-foreground text-primary-foreground",
  },
];

const PromoBannerCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c === 0 ? banners.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  return (
    <section className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={cn(
              "w-full flex-shrink-0 bg-gradient-to-r py-6 sm:py-8 px-6 sm:px-12",
              banner.gradient
            )}
          >
            <div className="container mx-auto flex items-center justify-between gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-lg sm:text-2xl font-bold text-primary-foreground drop-shadow-sm">
                  {banner.title}
                </h3>
                <p className="text-xs sm:text-sm text-primary-foreground/80 max-w-md">
                  {banner.subtitle}
                </p>
                <button
                  className={cn(
                    "mt-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all hover:scale-105 shadow-md",
                    banner.accent
                  )}
                >
                  {banner.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm rounded-full p-1.5 transition-colors"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-4 w-4 text-primary-foreground" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm rounded-full p-1.5 transition-colors"
        aria-label="Next banner"
      >
        <ChevronRight className="h-4 w-4 text-primary-foreground" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              current === i
                ? "w-6 bg-primary-foreground"
                : "w-1.5 bg-primary-foreground/40 hover:bg-primary-foreground/60"
            )}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PromoBannerCarousel;
