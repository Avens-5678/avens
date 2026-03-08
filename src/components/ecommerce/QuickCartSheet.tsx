import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, ArrowRight, Package, Star, Minus, Plus } from "lucide-react";
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
      (r) => !cartIds.has(r.id) && r.is_active !== false && r.categories?.some((c: string) => currentCategories.includes(c))
    );
    const pool = sameCat.length >= 4 ? sameCat : allRentals.filter((r) => !cartIds.has(r.id) && r.is_active !== false);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
  }, [allRentals, items, currentCategories, currentProductId]);

  const subtotal = items.reduce((sum, item) => sum + (item.price_value ?? 0) * item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-border bg-muted/30">
          <SheetTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            Cart
            <Badge variant="secondary" className="text-[10px] ml-1">{items.length} {items.length === 1 ? "item" : "items"}</Badge>
          </SheetTitle>
          <SheetDescription className="sr-only">Your shopping cart items</SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Add items to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => {
                const key = item.variant_id ? `${item.id}__${item.variant_id}` : item.id;
                const lineTotal = item.price_value != null ? item.price_value * item.quantity : null;
                return (
                  <div key={key} className="flex gap-3 p-4 hover:bg-muted/20 transition-colors">
                    {/* Thumbnail */}
                    <button
                      onClick={() => { onOpenChange(false); navigate(`/ecommerce/${item.id}`); }}
                      className="flex-shrink-0"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <button
                        onClick={() => { onOpenChange(false); navigate(`/ecommerce/${item.id}`); }}
                        className="text-left"
                      >
                        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors">{item.title}</p>
                      </button>

                      {item.variant_label && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{item.variant_label}</Badge>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        {/* Quantity */}
                        <div className="flex items-center border border-border rounded-md overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant_id)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 h-7 flex items-center justify-center text-xs font-semibold border-x border-border">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant_id)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-sm font-bold text-foreground">
                          {lineTotal != null ? `₹${lineTotal.toLocaleString()}` : "TBD"}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id, item.variant_id)}
                      className="self-start p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 py-5 border-t border-border bg-muted/20">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">You May Also Like</h4>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                {suggestions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { onOpenChange(false); navigate(`/ecommerce/${r.id}`); }}
                    className="flex-shrink-0 w-28 text-left group"
                  >
                    <div className="w-28 h-28 rounded-lg overflow-hidden bg-muted border border-border mb-1.5">
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">{r.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {r.price_value != null && (
                        <span className="text-[11px] font-bold text-foreground">₹{r.price_value.toLocaleString()}</span>
                      )}
                      {r.rating && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary">
                          <Star className="h-2.5 w-2.5 fill-current" /> {r.rating}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3 bg-background">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">
                {subtotal > 0 ? `₹${subtotal.toLocaleString()}` : "On Request"}
              </span>
            </div>
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => { onOpenChange(false); navigate("/cart"); }}
            >
              View Cart & Enquire <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full text-sm" onClick={() => onOpenChange(false)}>
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default QuickCartSheet;
