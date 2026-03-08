import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
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
import { ShoppingCart, Trash2, ArrowLeft, Send, Package, Plus, Minus, CalendarDays } from "lucide-react";
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
      return `₹${item.price_value.toLocaleString()} / ${item.pricing_unit || 'Per Day'}`;
    }
    if (item.price_range) return `₹${item.price_range}`;
    return "Quote on request";
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

      // Send WhatsApp rental confirmation
      if (normalizedPhone) {
        try {
          await supabase.functions.invoke("wati-rental-confirmation", {
            body: {
              phone: normalizedPhone,
              name: eventDetails.customer_name || "Customer",
              order_id: "CART",
            },
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

  return (
    <Layout>
      <section className="pt-8 pb-4 border-b border-border">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/ecommerce")} className="hover:text-foreground transition-colors">Shop</button>
            <span>/</span>
            <span className="text-foreground font-medium">Cart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Cart ({items.length})</h1>
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
                <ArrowLeft className="mr-2 h-4 w-4" />Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card className="rounded-2xl">
                  <CardContent className="p-0">
                    {items.map((item, index) => (
                      <div key={`${item.id}-${item.variant_id || ''}`}>
                        <div className="flex items-start gap-4 sm:gap-6 p-5 sm:p-6">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-border flex-shrink-0" />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2">{item.title}</h3>
                            {item.variant_label && <Badge variant="outline" className="mt-1 text-xs">{item.variant_label}</Badge>}
                            <p className="text-primary font-bold text-base sm:text-lg mt-1">{formatItemPrice(item)}</p>
                            {/* Quantity controls — dynamic based on pricing unit */}
                            <div className="mt-2">
                              {isMeasurableUnit(item.pricing_unit) ? (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2 max-w-[220px]">
                                    <div className="space-y-1">
                                      <Label className="text-[10px] text-muted-foreground">Length</Label>
                                      <Input
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={item.length || ""}
                                        onChange={e => updateDimensions(item.id, parseFloat(e.target.value) || 0, item.breadth || 0, item.variant_id)}
                                        className="h-7 text-sm"
                                        placeholder="L"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[10px] text-muted-foreground">Breadth</Label>
                                      <Input
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={item.breadth || ""}
                                        onChange={e => updateDimensions(item.id, item.length || 0, parseFloat(e.target.value) || 0, item.variant_id)}
                                        className="h-7 text-sm"
                                        placeholder="B"
                                      />
                                    </div>
                                  </div>
                                  {(item.length || 0) > 0 && (item.breadth || 0) > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Area: {item.quantity.toLocaleString()} {item.pricing_unit?.replace("Per ", "")}
                                      {item.price_value != null && (
                                        <> = <span className="font-semibold text-foreground">₹{(item.price_value * item.quantity).toLocaleString()}</span></>
                                      )}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant_id)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant_id)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeItem(item.id, item.variant_id)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {index < items.length - 1 && <Separator />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <div className="flex items-center justify-between mt-6">
                  <Button variant="outline" onClick={() => navigate("/ecommerce")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />Continue Shopping
                  </Button>
                  <Button variant="ghost" onClick={clearCart} className="text-muted-foreground hover:text-destructive">Clear Cart</Button>
                </div>
              </div>

              {/* Sidebar: Summary or Enquiry Form */}
              <div className="lg:col-span-1">
                {showEnquiry ? (
                  <Card className="rounded-2xl sticky top-24">
                    <CardContent className="p-5 sm:p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">Event Details</h3>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="customer_name">Full Name *</Label>
                          <Input id="customer_name" value={eventDetails.customer_name} onChange={e => setEventDetails(p => ({ ...p, customer_name: e.target.value }))} placeholder="Your name" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="email">Email *</Label>
                          <Input id="email" type="email" value={eventDetails.email} onChange={e => setEventDetails(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="contact_number">Phone</Label>
                          <Input id="contact_number" value={eventDetails.contact_number} onChange={e => setEventDetails(p => ({ ...p, contact_number: e.target.value }))} placeholder="+91 ..." />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="start_date">Start Date *</Label>
                            <Input id="start_date" type="date" value={eventDetails.event_start_date} onChange={e => setEventDetails(p => ({ ...p, event_start_date: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input id="end_date" type="date" value={eventDetails.event_end_date} onChange={e => setEventDetails(p => ({ ...p, event_end_date: e.target.value }))} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="location">City / Location *</Label>
                          <Input id="location" value={eventDetails.event_location} onChange={e => setEventDetails(p => ({ ...p, event_location: e.target.value }))} placeholder="Hyderabad" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="venue">Venue / Area</Label>
                          <Input id="venue" value={eventDetails.venue_area} onChange={e => setEventDetails(p => ({ ...p, venue_area: e.target.value }))} placeholder="Convention Center, etc." />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea id="notes" value={eventDetails.notes} onChange={e => setEventDetails(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requirements..." rows={3} />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleSendEnquiry} className="flex-1" disabled={submitting}>
                          <Send className="mr-2 h-4 w-4" />{submitting ? "Sending..." : "Send Enquiry"}
                        </Button>
                        <Button variant="outline" onClick={() => setShowEnquiry(false)}>Back</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="rounded-2xl sticky top-24">
                    <CardContent className="p-5 sm:p-6 space-y-5">
                       <h3 className="text-lg font-bold text-foreground">Order Summary</h3>
                      <Separator />
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={`${item.id}-${item.variant_id || ''}`} className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-muted-foreground line-clamp-1">{item.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {isMeasurableUnit(item.pricing_unit)
                                  ? ` — ${item.length || 0} × ${item.breadth || 0} = ${item.quantity} ${item.pricing_unit?.replace("Per ", "")}`
                                  : ` × ${item.quantity}`}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-foreground flex-shrink-0">
                              {item.price_value != null ? `₹${(item.price_value * item.quantity).toLocaleString()}` : "TBD"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      {(() => {
                        const { calculatedTotal, hasQuoteItems } = calculateCartTotal(items);
                        return (
                          <>
                            {calculatedTotal > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-foreground">Estimated Total</span>
                                <span className="text-lg font-bold text-primary">₹{calculatedTotal.toLocaleString()}</span>
                              </div>
                            )}
                            {hasQuoteItems && (
                              <p className="text-xs text-muted-foreground">* Some items require a quote. Final price will be confirmed by our team.</p>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Total Items</span>
                              <Badge variant="secondary" className="text-sm font-bold">{items.length}</Badge>
                            </div>
                          </>
                        );
                      })()}
                      <Button onClick={() => {
                        if (!user && !authLoading) {
                          toast({ title: "Please log in", description: "Sign in to send your enquiry.", variant: "destructive" });
                          navigate("/auth");
                          return;
                        }
                        setShowEnquiry(true);
                      }} className="w-full" size="lg">
                        <Send className="mr-2 h-4 w-4" />Send Enquiry
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">Our team will respond within 24 hours with pricing and availability.</p>
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
