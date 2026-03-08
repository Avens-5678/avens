import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
  image_url: string | null;
  display_order: number | null;
}

const PromoBannerCarousel = () => {
  const [current, setCurrent] = useState(0);

  const { data: banners = [] } = useQuery({
    queryKey: ["promo-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as PromoBanner[];
    },
  });

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prev = () => setCurrent((c) => (c === 0 ? banners.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  if (banners.length === 0) return null;

  return (
    <section className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full flex-shrink-0 py-6 sm:py-8 px-6 sm:px-12"
            style={{
              background: `linear-gradient(135deg, ${banner.gradient_from || "hsl(var(--primary))"}, ${banner.gradient_to || "hsl(var(--accent))"})`,
            }}
          >
            <div className="container mx-auto flex items-center justify-between gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-lg sm:text-2xl font-bold text-primary-foreground drop-shadow-sm">
                  {banner.title}
                </h3>
                <p className="text-xs sm:text-sm text-primary-foreground/80 max-w-md">
                  {banner.subtitle}
                </p>
                <button className="mt-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold bg-background text-foreground transition-all hover:scale-105 shadow-md">
                  {banner.cta_text || "Shop Now"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
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
        </>
      )}
    </section>
  );
};

export default PromoBannerCarousel;
