import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  linked_rental_ids: string[] | null;
  service_type: string | null;
  link_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
}

interface PromoBannerCarouselProps {
  serviceType?: string;
  onCtaClick?: (rentalIds: string[]) => void;
}

const PromoBannerCarousel = ({ serviceType, onCtaClick }: PromoBannerCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const { data: allBanners = [] } = useQuery({
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

  // Filter by service type, date range
  const banners = useMemo(() => {
    const now = new Date();
    const dateFiltered = allBanners.filter((b) => {
      if (b.starts_at && new Date(b.starts_at) > now) return false;
      if (b.ends_at && new Date(b.ends_at) < now) return false;
      return true;
    });
    if (serviceType) {
      return dateFiltered.filter((b) => (b.service_type || "rental") === serviceType);
    }
    return [...dateFiltered].sort(() => Math.random() - 0.5);
  }, [allBanners, serviceType]);

  useEffect(() => {
    setCurrent(0);
  }, [serviceType]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prev = () => setCurrent((c) => (c === 0 ? banners.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  const handleCtaClick = (banner: PromoBanner) => {
    if (banner.link_url) {
      if (banner.link_url.startsWith("http")) {
        window.open(banner.link_url, "_blank");
      } else {
        navigate(banner.link_url);
      }
    } else if (onCtaClick && banner.linked_rental_ids && banner.linked_rental_ids.length > 0) {
      onCtaClick(banner.linked_rental_ids);
    }
  };

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
            className="w-full flex-shrink-0 min-h-[180px] md:min-h-[220px] px-6 sm:px-12 relative overflow-hidden flex items-center"
            style={{
              background: `linear-gradient(135deg, ${banner.gradient_from || "hsl(var(--primary))"}, ${banner.gradient_to || "hsl(var(--accent))"})`,
            }}
          >
            {banner.image_url && (
              <img
                src={banner.image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30"
                loading="lazy"
              />
            )}
            {/* Decorative shape — desktop right side */}
            <div className="absolute right-0 top-0 bottom-0 w-[40%] hidden md:block pointer-events-none overflow-hidden">
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/10" />
              <div className="absolute right-16 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5" />
            </div>
            <div className="container mx-auto flex items-center gap-4 relative py-8 sm:py-10">
              <div className="w-full md:w-[60%] space-y-2.5 sm:space-y-3">
                <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                  {banner.linked_rental_ids?.length ? "Limited Time" : "New Arrivals"}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm leading-tight">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-sm text-white/80 max-w-md leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
                <button
                  onClick={() => handleCtaClick(banner)}
                  className="mt-1 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold bg-white text-gray-900 transition-all hover:scale-105 shadow-md"
                >
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

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
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
