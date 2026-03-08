import { Truck, Shield, Headphones, RotateCcw, LucideIcon, Star, Heart, Zap, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const iconMap: Record<string, LucideIcon> = {
  Truck, Shield, Headphones, RotateCcw, Star, Heart, Zap, Package,
};

interface TrustItem {
  id: string;
  icon_name: string;
  text: string;
  display_order: number | null;
}

const TrustStrip = () => {
  const { data: items = [] } = useQuery({
    queryKey: ["trust-strip-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_strip_items")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as TrustItem[];
    },
  });

  if (items.length === 0) return null;

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-2.5 overflow-x-auto scrollbar-hide">
          {items.map((item) => {
            const Icon = iconMap[item.icon_name] || Shield;
            return (
              <div key={item.id} className="flex items-center gap-2 flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
