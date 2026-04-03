import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Package, Sparkles } from "lucide-react";

interface BundleItem {
  rental_id: string;
  title: string;
  quantity: number;
  price: number;
  image_url?: string;
}

const EventPackages = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: bundles = [] } = useQuery({
    queryKey: ["event-packages-homepage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_bundles")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (bundles.length === 0) return null;

  const handleBookBundle = (bundle: any) => {
    const items: BundleItem[] = Array.isArray(bundle.bundle_items) ? bundle.bundle_items : [];
    items.forEach((item) => {
      addItem({
        id: item.rental_id,
        title: item.title,
        price_value: item.price,
        pricing_unit: "Per Event",
        quantity: item.quantity || 1,
        image_url: item.image_url || bundle.image_url || "",
        service_type: "rental",
      });
    });
    localStorage.setItem("evnting_event_name", bundle.name);
    toast({ title: "Package added to cart!", description: `${items.length} items from "${bundle.name}"` });
    navigate("/cart");
  };

  return (
    <section className="py-6 sm:py-10 border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h3 className="text-base sm:text-2xl font-bold text-foreground tracking-tight inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> Event Packages
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Curated bundles — book everything you need in one click</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.map((bundle: any) => {
            const items: BundleItem[] = Array.isArray(bundle.bundle_items) ? bundle.bundle_items : [];
            const itemSum = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
            const savings = itemSum - (bundle.total_price || 0);
            const expanded = expandedId === bundle.id;

            return (
              <div key={bundle.id} className="bg-card border border-border/60 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Banner */}
                <div className="relative aspect-[2.5/1] bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 overflow-hidden">
                  {bundle.image_url ? (
                    <img src={bundle.image_url} alt={bundle.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-indigo-300" />
                    </div>
                  )}
                  {savings > 0 && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      Save {"\u20B9"}{savings.toLocaleString("en-IN")}
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2.5">
                  <h4 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">{bundle.name}</h4>
                  {bundle.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{bundle.description}</p>
                  )}

                  {/* Event type tags */}
                  {bundle.trigger_categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bundle.trigger_categories.map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Expandable items list */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : bundle.id)}
                    className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80 transition-colors w-full"
                  >
                    What&apos;s included ({items.length} items)
                    {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  {expanded && (
                    <div className="space-y-1 pl-1">
                      {items.map((item, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground">
                          &bull; {item.title} {item.quantity > 1 && `× ${item.quantity}`}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">{"\u20B9"}{(bundle.total_price || 0).toLocaleString("en-IN")}</span>
                    {savings > 0 && (
                      <span className="text-xs text-muted-foreground line-through">{"\u20B9"}{itemSum.toLocaleString("en-IN")}</span>
                    )}
                  </div>

                  {/* Book button */}
                  <button
                    onClick={() => handleBookBundle(bundle)}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors"
                  >
                    Book this package &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventPackages;
