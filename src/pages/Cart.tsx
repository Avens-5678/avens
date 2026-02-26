import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Trash2, ArrowLeft, Send, Package } from "lucide-react";

const Cart = () => {
  const { items, removeItem, clearCart } = useCart();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const navigate = useNavigate();

  const handleInquiryComplete = () => {
    setShowInquiryForm(false);
    clearCart();
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <section className="pt-8 pb-4 border-b border-border">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/ecommerce")} className="hover:text-foreground transition-colors">
              Shop
            </button>
            <span>/</span>
            <span className="text-foreground font-medium">Cart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            My Cart ({items.length})
          </h1>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/40 mb-6" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Browse our equipment collection and add items to get started.</p>
              <Button onClick={() => navigate("/ecommerce")} size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card className="rounded-2xl">
                  <CardContent className="p-0">
                    {items.map((item, index) => (
                      <div key={item.id}>
                        <div className="flex items-center gap-4 sm:gap-6 p-5 sm:p-6">
                          {/* Image */}
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2">
                              {item.title}
                            </h3>
                            {item.price_range && (
                              <p className="text-primary font-bold text-base sm:text-lg mt-1">
                                ₹{item.price_range}
                              </p>
                            )}
                          </div>

                          {/* Remove */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline text-xs">Remove</span>
                          </Button>
                        </div>
                        {index < items.length - 1 && <Separator />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between mt-6">
                  <Button variant="outline" onClick={() => navigate("/ecommerce")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                  <Button variant="ghost" onClick={clearCart} className="text-muted-foreground hover:text-destructive">
                    Clear Cart
                  </Button>
                </div>
              </div>

              {/* Order Summary / Inquiry */}
              <div className="lg:col-span-1">
                {showInquiryForm ? (
                  <Card className="rounded-2xl">
                    <CardContent className="p-5 sm:p-6">
                      <InquiryForm
                        formType="rental"
                        title="Equipment Inquiry"
                        rentalId={items.map(i => i.id).join(",")}
                        rentalTitle={items.map(i => i.title).join(", ")}
                        onSuccess={handleInquiryComplete}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="rounded-2xl sticky top-24">
                    <CardContent className="p-5 sm:p-6 space-y-5">
                      <h3 className="text-lg font-bold text-foreground">Order Summary</h3>
                      <Separator />

                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between items-start gap-3">
                            <span className="text-sm text-muted-foreground line-clamp-1 flex-1">{item.title}</span>
                            {item.price_range && (
                              <span className="text-sm font-medium text-foreground flex-shrink-0">₹{item.price_range}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-foreground">Total Items</span>
                        <Badge variant="secondary" className="text-sm font-bold">{items.length}</Badge>
                      </div>

                      <Button
                        onClick={() => setShowInquiryForm(true)}
                        className="w-full"
                        size="lg"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Inquiry
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        Our team will respond within 24 hours with pricing and availability.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
