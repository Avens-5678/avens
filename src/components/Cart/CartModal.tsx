import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartModal = ({ open, onOpenChange }: CartModalProps) => {
  const { items, removeItem } = useCart();
  const navigate = useNavigate();

  const handleGoToCart = () => {
    onOpenChange(false);
    navigate("/cart");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({items.length} items)
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add equipment to your cart to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => (
              <div key={`${item.id}-${item.variant_id || ''}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground line-clamp-1">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.price_range && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.price_range}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => removeItem(item.id, item.variant_id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            {items.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">+ {items.length - 5} more items</p>
            )}

            <Button onClick={handleGoToCart} className="w-full gap-2" size="lg">
              Go to Cart <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
