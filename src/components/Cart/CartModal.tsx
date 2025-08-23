import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { Trash2, ShoppingCart } from "lucide-react";
import InquiryForm from "@/components/Forms/InquiryForm";

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartModal = ({ open, onOpenChange }: CartModalProps) => {
  const { items, removeItem, clearCart } = useCart();
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  const handleInquiry = () => {
    setShowInquiryForm(true);
  };

  const handleInquiryComplete = () => {
    setShowInquiryForm(false);
    clearCart();
    onOpenChange(false);
  };

  if (showInquiryForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquire About Your Selected Equipment</DialogTitle>
          </DialogHeader>
          <InquiryForm 
            formType="rental"
            title="Equipment Inquiry"
            rentalId={items.map(item => item.id).join(',')}
            rentalTitle={items.map(item => item.title).join(', ')}
            onSuccess={handleInquiryComplete}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Equipment Cart ({items.length} items)
          </DialogTitle>
        </DialogHeader>
        
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add equipment to your cart to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.price_range && (
                        <Badge variant="secondary" className="mt-1">
                          {item.price_range}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleInquiry}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                Send Inquiry for All Items
              </Button>
              <Button 
                variant="outline" 
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;