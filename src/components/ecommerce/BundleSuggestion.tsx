import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Sparkles } from "lucide-react";

interface BundleItem {
  rental_id: string;
  title: string;
  quantity: number;
  price: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  bundle_items: BundleItem[];
  discount_percent: number;
  total_price: number;
}

const BundleSuggestion = ({ serviceType, categories }: { serviceType: string; categories?: string[] }) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: bundles = [] } = useQuery({
    queryKey: ["product-bundles", serviceType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_bundles")
        .select("*")
        .eq("is_active", true)
        .eq("trigger_service_type", serviceType)
        .order("display_order", { ascending: true })
        .limit(3);
      if (error) throw error;
      return (data || []) as Bundle[];
    },
  });

  if (bundles.length === 0) return null;

  const handleAddBundle = (bundle: Bundle) => {
    (bundle.bundle_items || []).forEach((item) => {
      addItem({
        id: item.rental_id,
        title: item.title,
        price_value: item.price,
        pricing_unit: "Per Event",
        quantity: item.quantity,
        image_url: bundle.image_url || "",
        service_type: "rental",
      });
    });
    toast({
      title: "Bundle Added!",
      description: `"${bundle.name}" — ${bundle.bundle_items.length} items added to cart`,
    });
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">Recommended Bundles</h3>
        <Badge variant="secondary" className="text-[10px]">Save more</Badge>
      </div>
      <div className="grid gap-3">
        {bundles.map((bundle) => (
          <div key={bundle.id} className="flex items-center gap-4 bg-card rounded-xl border border-border p-3">
            {bundle.image_url && (
              <img src={bundle.image_url} alt={bundle.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm">{bundle.name}</h4>
              {bundle.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{bundle.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-foreground">₹{bundle.total_price.toLocaleString()}</span>
                {bundle.discount_percent > 0 && (
                  <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                    {bundle.discount_percent}% OFF
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {(bundle.bundle_items || []).length} items
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-9 shrink-0"
              onClick={() => handleAddBundle(bundle)}
            >
              <Package className="h-3.5 w-3.5 mr-1" />
              Add Kit
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BundleSuggestion;
