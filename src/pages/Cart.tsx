import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import EcommerceHeader from "@/components/ecommerce/EcommerceHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isMeasurableUnit, calculateCartTotal } from "@/utils/pricingUtils";
import {
  ShoppingCart, Trash2, ArrowLeft, Send, Package, Plus, Minus,
  CalendarDays, ShieldCheck, Truck, RotateCcw, Tag, ChevronRight,
} from "lucide-react";
import { normalizePhoneNumber } from "@/utils/phoneUtils";

const Cart = () => {
  const { items, removeItem, updateQuantity, updateDimensions, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showEnquiry, setShowEnquiry] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    customer_name: "",
    contact_number: "",
    email: "",
    event_start_date: "",
    event_end_date: "",
    event_location: "",
    venue_area: "",
    notes: "",
  });

  const formatItemPrice = (item: any) => {
    if (item.price_value != null) {
      return `₹${item.price_value.toLocaleString()}`;
    }
    if (item.price_range) return `₹${item.price_range}`;
    return "Quote on request";
  };

  const getItemTotal = (item: any) => {
    if (item.price_value != null) return item.price_value * item.quantity;
    return null;
  };

  const handleSendEnquiry = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to sign in to send an enquiry.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!eventDetails.customer_name || !eventDetails.email || !eventDetails.event_start_date) {
      toast({ title: "Missing information", description: "Please fill in name, email, and start date.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const cartPayload = items.map(item => ({
        rental_id: item.id,
        title: item.title,
        variant_id: item.variant_id || null,
        variant_label: item.variant_label || null,
        quantity: item.quantity,
        length: item.length || null,
        breadth: item.breadth || null,
        price_value: item.price_value,
        pricing_unit: item.pricing_unit,
      }));
      const normalizedPhone = eventDetails.contact_number ? normalizePhoneNumber(eventDetails.contact_number) : null;
      const orderId = crypto.randomUUID();
      const { error } = await supabase.from("rental_orders").insert({
        id: orderId,
        title: `Cart Enquiry - ${items.length} item(s)`,
        equipment_category: "Cart Order",
        equipment_details: JSON.stringify({ cart_items: cartPayload, event_details: eventDetails }),
        client_name: eventDetails.customer_name,
        client_email: eventDetails.email,
        client_phone: normalizedPhone,
        event_date: eventDetails.event_start_date || null,
        location: `${eventDetails.event_location}${eventDetails.venue_area ? ' - ' + eventDetails.venue_area : ''}`,
        notes: eventDetails.notes || null,
        status: "new",
      });
      if (error) throw error;
      if (normalizedPhone) {
        try {
          await supabase.functions.invoke("wati-rental-confirmation", {
            body: { phone: normalizedPhone, name: eventDetails.customer_name || "Customer", order_id: orderId },
          });
        } catch (whatsappErr) {
          console.error("WhatsApp rental confirmation failed:", whatsappErr);
        }
      }
      toast({ title: "Enquiry Sent!", description: "Our team will respond within 24 hours." });
      clearCart();
      setShowEnquiry(false);
      setEventDetails({ customer_name: "", contact_number: "", email: "", event_start_date: "", event_end_date: "", event_location: "", venue_area: "", notes: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send enquiry", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const { calculatedTotal, hasQuoteItems } = calculateCartTotal(items);

  return (
    <Layout hideNavbar>
      <EcommerceHeader
        searchTerm=""
        onSearchChange={(v) => { if (v) navigate(`/ecommerce?search=${encodeURIComponent(v)}`); }}
        categories={[]}
        selectedSearchCategory=""
        onSearchCategoryChange={() => {}}
      />

      {/* Breadcrumb */}
      <div className="bg-muted/40 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <button onClick={() => navigate("/ecommerce")} className="hover:text-primary transition-colors">Home</button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => navigate("/ecommerce")} className="hover:text-primary transition-colors">Shop</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Cart ({items.length})</span>
          </div>
        </div>
      </div>

      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          {items.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground mb-6">Browse our equipment collection and add items to get started.</p>
              <Button onClick={() => navigate("/ecommerce")} size="lg" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">Shopping Cart</h1>
                  <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                    Remove all
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => {
                    const itemTotal = getItemTotal(item);
                    return (
                      <div key={`${item.id}-${item.variant_id || ''}`} className="bg-background border border-border rounded-xl p-4 sm:p-5">
                        <div className="flex gap-4">
                          {/* Image */}
                          <button onClick={() => navigate(`/ecommerce/${item.id}`)} className="flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.title} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-border" />
                            ) : (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground/40" />
                              </div>
                            )}
                          </button>

                          {/* Details */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <button onClick={() => navigate(`/ecommerce/${item.id}`)} className="text-sm sm:text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 text-left">
                                  {item.title}
                                </button>
                                {item.variant_label && (
                                  <Badge variant="secondary" className="mt-1 text-[10px]">{item.variant_label}</Badge>
                                )}
                              </div>
                              <button onClick={() => removeItem(item.id, item.variant_id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Price per unit */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{formatItemPrice(item)}</span>
                              {item.pricing_unit && (
                                <span className="text-xs text-muted-foreground">/ {item.pricing_unit}</span>
                              )}
                            </div>

                            {/* Quantity / Dimensions */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              {isMeasurableUnit(item.pricing_unit) ? (
                                <div className="space-y-1.5">
                                  <div className="grid grid-cols-2 gap-2 max-w-[200px]">
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-muted-foreground">Length</span>
                                      <Input
                                        type="number" min={0} step="any"
                                        value={item.length || ""}
                                        onChange={e => updateDimensions(item.id, parseFloat(e.target.value) || 0, item.breadth || 0, item.variant_id)}
                                        className="h-8 text-sm"
                                        placeholder="L"
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-muted-foreground">Breadth</span>
                                      <Input
                                        type="number" min={0} step="any"
                                        value={item.breadth || ""}
                                        onChange={e => updateDimensions(item.id, item.length || 0, parseFloat(e.target.value) || 0, item.variant_id)}
                                        className="h-8 text-sm"
                                        placeholder="B"
                                      />
                                    </div>
                                  </div>
                                  {(item.length || 0) > 0 && (item.breadth || 0) > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Area: <span className="font-medium text-foreground">{item.quantity.toLocaleString()} {item.pricing_unit?.replace("Per ", "")}</span>
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                  <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant_id)} className="px-3 py-1.5 hover:bg-muted transition-colors text-sm font-medium">−</button>
                                  <span className="px-3 py-1.5 text-sm font-semibold border-x border-border min-w-[40px] text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant_id)} className="px-3 py-1.5 hover:bg-muted transition-colors text-sm font-medium">+</button>
                                </div>
                              )}

                              {/* Line total */}
                              {itemTotal != null && (
                                <span className="text-base font-bold text-foreground">₹{itemTotal.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button variant="outline" onClick={() => navigate("/ecommerce")} size="sm" className="gap-2 text-sm">
                  <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
                </Button>
              </div>

              {/* Sidebar */}
              <div className="lg:sticky lg:top-20 space-y-4 self-start">
                {showEnquiry ? (
                  <div className="bg-background border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <h3 className="text-base font-bold text-foreground">Event Details</h3>
                      </div>
                      <button onClick={() => setShowEnquiry(false)} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Full Name *</Label>
                        <Input value={eventDetails.customer_name} onChange={e => setEventDetails(p => ({ ...p, customer_name: e.target.value }))} placeholder="Your name" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email *</Label>
                        <Input type="email" value={eventDetails.email} onChange={e => setEventDetails(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Phone</Label>
                        <Input value={eventDetails.contact_number} onChange={e => setEventDetails(p => ({ ...p, contact_number: e.target.value }))} placeholder="+91 ..." />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Start Date *</Label>
                          <Input type="date" value={eventDetails.event_start_date} onChange={e => setEventDetails(p => ({ ...p, event_start_date: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">End Date</Label>
                          <Input type="date" value={eventDetails.event_end_date} onChange={e => setEventDetails(p => ({ ...p, event_end_date: e.target.value }))} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">City / Location</Label>
                        <Input value={eventDetails.event_location} onChange={e => setEventDetails(p => ({ ...p, event_location: e.target.value }))} placeholder="Hyderabad" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Venue / Area</Label>
                        <Input value={eventDetails.venue_area} onChange={e => setEventDetails(p => ({ ...p, venue_area: e.target.value }))} placeholder="Convention Center, etc." />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Additional Notes</Label>
                        <Textarea value={eventDetails.notes} onChange={e => setEventDetails(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requirements..." rows={3} />
                      </div>
                    </div>
                    <Button onClick={handleSendEnquiry} className="w-full gap-2" size="lg" disabled={submitting}>
                      <Send className="h-4 w-4" /> {submitting ? "Sending..." : "Send Enquiry"}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Price Summary */}
                    <div className="bg-background border border-border rounded-xl p-5 space-y-4">
                      <h3 className="text-base font-bold text-foreground">Price Details</h3>
                      <Separator />
                      <div className="space-y-2.5">
                        {items.map((item) => {
                          const total = getItemTotal(item);
                          return (
                            <div key={`${item.id}-${item.variant_id || ''}`} className="flex justify-between gap-3 text-sm">
                              <span className="text-muted-foreground line-clamp-1 flex-1">
                                {item.title}
                                <span className="text-xs ml-1">
                                  {isMeasurableUnit(item.pricing_unit)
                                    ? `(${item.quantity} ${item.pricing_unit?.replace("Per ", "")})`
                                    : `× ${item.quantity}`}
                                </span>
                              </span>
                              <span className="font-medium text-foreground flex-shrink-0">
                                {total != null ? `₹${total.toLocaleString()}` : "TBD"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <Separator />
                      {calculatedTotal > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-foreground">Estimated Total</span>
                          <span className="text-lg font-bold text-primary">₹{calculatedTotal.toLocaleString()}</span>
                        </div>
                      )}
                      {hasQuoteItems && (
                        <p className="text-[11px] text-muted-foreground">* Some items require a custom quote. Final price confirmed by our team.</p>
                      )}
                      <Button
                        onClick={() => {
                          if (!user && !authLoading) {
                            toast({ title: "Please log in", description: "Sign in to send your enquiry.", variant: "destructive" });
                            navigate("/auth");
                            return;
                          }
                          setShowEnquiry(true);
                        }}
                        className="w-full gap-2"
                        size="lg"
                      >
                        <Send className="h-4 w-4" /> Proceed to Enquiry
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center">Our team will respond within 24 hours.</p>
                    </div>

                    {/* Trust signals */}
                    <div className="bg-background border border-border rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { icon: ShieldCheck, label: "Assured Quality" },
                          { icon: Truck, label: "Free Delivery" },
                          { icon: RotateCcw, label: "Easy Returns" },
                        ].map(({ icon: Icon, label }) => (
                          <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground leading-tight">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
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
