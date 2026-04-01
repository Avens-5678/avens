import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface LookbookItem {
  id: string;
  title: string;
  image_url: string;
  lookbook_description: string | null;
  linked_rental_ids: string[];
  tag: string | null;
}

interface LinkedRental {
  id: string;
  title: string;
  price_value: number | null;
  pricing_unit: string | null;
  image_url: string | null;
  service_type: string;
}

const LookbookSection = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: lookbookItems = [] } = useQuery({
    queryKey: ["lookbook-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio")
        .select("id, title, image_url, lookbook_description, linked_rental_ids, tag")
        .eq("is_lookbook", true)
        .order("display_order", { ascending: true })
        .limit(6);
      if (error) throw error;
      return (data || []).filter((d: any) => d.linked_rental_ids?.length > 0) as LookbookItem[];
    },
  });

  const allLinkedIds = lookbookItems.flatMap((i) => i.linked_rental_ids || []);

  const { data: linkedRentals = [] } = useQuery({
    queryKey: ["lookbook-linked-rentals", allLinkedIds],
    enabled: allLinkedIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rentals")
        .select("id, title, price_value, pricing_unit, image_url, service_type")
        .in("id", allLinkedIds);
      if (error) throw error;
      return (data || []) as LinkedRental[];
    },
  });

  if (lookbookItems.length === 0) return null;

  const rentalMap = new Map(linkedRentals.map((r) => [r.id, r]));

  const handleAddSetup = (item: LookbookItem) => {
    const rentals = (item.linked_rental_ids || []).map((rid) => rentalMap.get(rid)).filter(Boolean) as LinkedRental[];
    let added = 0;
    rentals.forEach((r) => {
      addItem({
        id: r.id,
        title: r.title,
        price_value: r.price_value,
        pricing_unit: r.pricing_unit || "Per Day",
        image_url: r.image_url || "",
        quantity: 1,
        service_type: r.service_type,
      });
      added++;
    });
    toast({
      title: `${added} items added to cart`,
      description: `From "${item.title}" lookbook setup`,
    });
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">✨ Lookbook</h2>
          <p className="text-sm text-muted-foreground">Real event setups you can rent instantly</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {lookbookItems.map((item) => {
          const rentals = (item.linked_rental_ids || []).map((rid) => rentalMap.get(rid)).filter(Boolean) as LinkedRental[];
          const totalPrice = rentals.reduce((sum, r) => sum + (r.price_value || 0), 0);
          const isExpanded = expandedId === item.id;

          return (
            <div key={item.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.tag && (
                  <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {item.tag}
                  </span>
                )}
                <span className="absolute bottom-3 right-3 bg-background/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {rentals.length} items · ₹{totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                {item.lookbook_description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.lookbook_description}</p>
                )}
                {isExpanded && (
                  <div className="space-y-1.5 border-t border-border pt-3">
                    {rentals.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs">
                        <button
                          onClick={() => navigate(`/ecommerce/${r.id}`)}
                          className="text-primary hover:underline truncate max-w-[60%] text-left"
                        >
                          {r.title}
                        </button>
                        <span className="text-muted-foreground">
                          ₹{(r.price_value || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddSetup(item)}
                    size="sm"
                    className="flex-1 text-xs h-9"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    Rent This Setup
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    {isExpanded ? "Less" : "Details"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LookbookSection;
