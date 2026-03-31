import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

interface SmartRecommendationsProps {
  currentItem: any;
  allItems: any[];
  guestCount?: number;
}

const SmartRecommendations = ({ currentItem, allItems, guestCount }: SmartRecommendationsProps) => {
  const navigate = useNavigate();

  const recommendations = useMemo(() => {
    if (!currentItem || !allItems.length) return [];

    const currentPrice = currentItem.price_value || 0;
    const currentAddress = (currentItem.address || "").toLowerCase();

    return allItems
      .filter((item: any) => {
        if (item.id === currentItem.id) return false;
        if (item.is_active === false) return false;
        // Same service type
        if ((item.service_type || "rental") !== (currentItem.service_type || "rental")) return false;

        let score = 0;

        // Location match
        if (currentAddress && item.address?.toLowerCase().includes(currentAddress.split(",")[0]?.trim())) {
          score += 2;
        }

        // Price within ±30%
        if (item.price_value && currentPrice > 0) {
          const ratio = item.price_value / currentPrice;
          if (ratio >= 0.7 && ratio <= 1.3) score += 1;
        }

        // Guest capacity match
        if (guestCount && item.min_capacity && item.max_capacity) {
          if (guestCount >= item.min_capacity && guestCount <= item.max_capacity) score += 2;
        }

        // Same category
        const currentCats = currentItem.categories || [];
        const itemCats = item.categories || [];
        if (currentCats.some((c: string) => itemCats.includes(c))) score += 1;

        return score >= 1;
      })
      .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
  }, [currentItem, allItems, guestCount]);

  if (recommendations.length === 0) return null;

  return (
    <section className="py-6 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <h2 className="text-base font-bold text-foreground mb-1">Based on your requirements, we also recommend</h2>
        <p className="text-xs text-muted-foreground mb-4">Similar items matching your preferences</p>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {recommendations.map((r: any) => (
            <button
              key={r.id}
              onClick={() => navigate(`/ecommerce/${r.id}`)}
              className="flex-shrink-0 w-44 sm:w-52 rounded-xl border border-border bg-background overflow-hidden group text-left"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                )}
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{r.title}</p>
                <div className="flex items-center justify-between">
                  {r.price_value != null && (
                    <p className="text-sm font-bold text-foreground">₹{r.price_value.toLocaleString()}</p>
                  )}
                  {r.rating && (
                    <span className="inline-flex items-center gap-0.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {r.rating} <Star className="h-2.5 w-2.5 fill-current" />
                    </span>
                  )}
                </div>
                {r.address && (
                  <p className="text-[10px] text-muted-foreground truncate">📍 {r.address}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartRecommendations;
