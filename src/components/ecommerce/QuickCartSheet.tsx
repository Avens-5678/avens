import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, ArrowRight, X } from "lucide-react";
import { useMemo } from "react";

interface QuickCartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allRentals?: any[];
  currentCategories?: string[];
  currentProductId?: string;
}

const QuickCartSheet = ({
  open,
  onOpenChange,
  allRentals = [],
  currentCategories = [],
  currentProductId,
}: QuickCartSheetProps) => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity } = useCart();

  const suggestions = useMemo(() => {
    const cartIds = new Set(items.map((i) => i.id));
    if (currentProductId) cartIds.add(currentProductId);

    const sameCat = allRentals.filter(
      (r) =>
        !cartIds.has(r.id) &&
        r.is_active !== false &&
        r.categories?.some((c: string) => currentCategories.includes(c))
    );

    const pool = sameCat.length >= 4 ? sameCat : allRentals.filter((r) => !cartIds.has(r.id) && r.is_active !== false);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, [allRentals, items, currentCategories, currentProductId]);

  const subtotal = items.reduce((sum, item) => {
    const price = item.price_value ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Cart ({items.length} {items.length === 1 ? "item" : "items"})
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm font-medium">Your cart is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => {
                const key = item.variant_id ? `${item.id}__${item.variant_id}` : item.id;
                return (
                  <div key={key} className="flex gap-3 p-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">No img</div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{item.title}</p>
                      {item.price_value != null && (
                        <p className="text-xs text-muted-foreground">
                          ₹{item.price_value.toLocaleString()} / {item.pricing_unit || "Per Day"}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant_id)}
                          className="w-6 h-6 rounded border border-border flex items-center justify-center text-xs hover:bg-muted transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant_id)}
                          className="w-6 h-6 rounded border border-border flex items-center justify-center text-xs hover:bg-muted transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id, item.variant_id)}
                      className="self-start p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 py-5 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">You May Also Like</h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {suggestions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/ecommerce/${r.id}`);
                    }}
                    className="flex-shrink-0 w-28 text-left group"
                  >
                    <div className="w-28 h-28 rounded-lg overflow-hidden bg-muted border border-border mb-1.5">
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">No img</div>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">{r.title}</p>
                    {r.price_value != null && (
                      <p className="text-[11px] font-bold text-foreground mt-0.5">₹{r.price_value.toLocaleString()}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">
                {subtotal > 0 ? `₹${subtotal.toLocaleString()}` : "On Request"}
              </span>
            </div>
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => {
                onOpenChange(false);
                navigate("/cart");
              }}
            >
              View Cart & Enquire <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default QuickCartSheet;
