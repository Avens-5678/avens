import { useState, useEffect } from "react";
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
import { isMeasurableUnit, calculateCartTotal, calculateManpowerFee, isInstantBookable } from "@/utils/pricingUtils";
import { useLogisticsConfig } from "@/hooks/useLogisticsConfig";
import { useDynamicTransport } from "@/hooks/useDynamicTransport";
import MapPinPicker from "@/components/ecommerce/MapPinPicker";
import {
  ShoppingCart, Trash2, ArrowLeft, Send, Package, Plus, Minus,
  CalendarDays, Tag, ChevronRight, Zap, Truck, Users, Loader2, MapPin,
} from "lucide-react";
import { normalizePhoneNumber } from "@/utils/phoneUtils";

const Cart = () => {
  const { items, removeItem, updateQuantity, updateDimensions, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: logisticsConfig } = useLogisticsConfig();
  const { calculate: calcDynamicTransport, result: dynamicTransportResult, loading: transportLoading } = useDynamicTransport();

  const [showEnquiry, setShowEnquiry] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileData, setProfileData] = useState<{ full_name: string; email: string; phone: string } | null>(null);
  const [eventDetails, setEventDetails] = useState({
    event_start_date: "",
    event_end_date: "",
    venue_address_line1: "",
    venue_address_line2: "",
    venue_pincode: "",
    venue_lat: 0,
    venue_lng: 0,
    notes: "",
  });

  // Detect if cart has venue items — venue bookings skip venue address fields
  const hasVenueItem = items.some((item: any) => item.service_type === "venue");
  const isVenueOnlyCart = items.length > 0 && items.every((item: any) => item.service_type === "venue");
  const showVenueAddressFields = !isVenueOnlyCart && !hasVenueItem;

  // Instant booking logic
  const allItemsPriced = items.length > 0 && items.every(i => i.price_value != null);
  const minBookingHours = logisticsConfig?.min_booking_hours || 48;
  const dateIsSet = !!eventDetails.event_start_date;
  const canInstantBook = allItemsPriced && dateIsSet && isInstantBookable(eventDetails.event_start_date, minBookingHours);
  const showInstantBookFlow = allItemsPriced; // Show the flow if all items are priced, but enable button only if date qualifies

  // Calculate manpower fee
  const manpowerFee = logisticsConfig
    ? calculateManpowerFee(items, logisticsConfig.labor_units_per_loader, logisticsConfig.loader_daily_rate)
    : 0;

  // Calculate total volume units from cart
  const totalVolumeUnits = items.reduce((sum, i) => sum + ((i as any).volume_units || 1) * i.quantity, 0);

  // Auto-calc dynamic transport when venue location is set and we have a vendor with lat/lng
  useEffect(() => {
    if (eventDetails.venue_lat && eventDetails.venue_lng) {
      // Find vendor with lat/lng (from profile)
      const vendorItem = items.find(i => i.vendor_id);
      if (vendorItem?.vendor_id) {
        // Fetch vendor's warehouse lat/lng
        supabase.from("profiles").select("warehouse_lat, warehouse_lng").eq("user_id", vendorItem.vendor_id).single().then(({ data }) => {
          if (data && (data as any).warehouse_lat && (data as any).warehouse_lng) {
            calcDynamicTransport({
              warehouse_lat: (data as any).warehouse_lat,
              warehouse_lng: (data as any).warehouse_lng,
              venue_lat: eventDetails.venue_lat,
              venue_lng: eventDetails.venue_lng,
              total_volume_units: totalVolumeUnits,
            });
          }
        });
      } else if (eventDetails.venue_pincode && eventDetails.venue_pincode.length >= 5) {
        // Fallback: use pincode-based with volume
        const vendorPincodeItem = items.find(i => i.vendor_pincode);
        if (vendorPincodeItem?.vendor_pincode) {
          // Use old edge function as fallback
          supabase.functions.invoke("calculate-transport", {
            body: { vendor_pincode: vendorPincodeItem.vendor_pincode, client_pincode: eventDetails.venue_pincode },
          });
        }
      }
    }
  }, [eventDetails.venue_lat, eventDetails.venue_lng, totalVolumeUnits]);

  const transportFee = dynamicTransportResult?.fee || 0;

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

  // Fetch profile when user is available
  const fetchProfile = async () => {
    if (!user || profileLoaded) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", user.id)
      .single();
    if (data && data.full_name && data.phone) {
      setProfileData({ full_name: data.full_name, email: data.email || user.email || "", phone: data.phone });
    } else {
      setProfileData(null);
    }
    setProfileLoaded(true);
  };

  const handleSendEnquiry = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to sign in to send an enquiry.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!profileData?.full_name || !profileData?.phone) {
      toast({ title: "Complete your profile", description: "Please fill in your name and phone number first.", variant: "destructive" });
      navigate("/client");
      return;
    }
    // Derive dates from cart items
    const bookingFromDates = items.map(i => i.booking_from).filter(Boolean) as string[];
    const bookingTillDates = items.map(i => i.booking_till).filter(Boolean) as string[];
    const derivedStartDate = bookingFromDates.length > 0 ? bookingFromDates.sort()[0] : "";
    const derivedEndDate = bookingTillDates.length > 0 ? bookingTillDates.sort().reverse()[0] : "";
    if (!derivedStartDate) {
      toast({ title: "Missing dates", description: "Please add items with booking dates.", variant: "destructive" });
      return;
    }
    if (showVenueAddressFields && !eventDetails.venue_address_line1) {
      toast({ title: "Missing information", description: "Please fill in the venue address.", variant: "destructive" });
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
      const normalizedPhone = profileData.phone ? normalizePhoneNumber(profileData.phone) : null;
      const venueLocation = [eventDetails.venue_address_line1, eventDetails.venue_address_line2, eventDetails.venue_pincode].filter(Boolean).join(", ");
      const orderId = crypto.randomUUID();

      // Determine if instant book
      const isInstant = canInstantBook && showVenueAddressFields;

      // Determine the vendor from cart items (first vendor item found)
      const vendorItem = items.find(i => i.vendor_id);
      const assignedVendorId = vendorItem?.vendor_id || null;
      const vendorInventoryItemId = vendorItem ? vendorItem.id : null;

      const orderData: Record<string, any> = {
        id: orderId,
        title: `${isInstant ? "Instant Booking" : "Cart Enquiry"} - ${items.length} item(s)`,
        equipment_category: "Cart Order",
        equipment_details: JSON.stringify({ cart_items: cartPayload, event_details: { ...eventDetails, customer_name: profileData.full_name, email: profileData.email, contact_number: profileData.phone } }),
        client_name: profileData.full_name,
        client_email: profileData.email,
        client_phone: normalizedPhone,
        event_date: derivedStartDate || null,
        location: venueLocation,
        notes: eventDetails.notes || null,
        status: isInstant ? "confirmed" : "new",
        client_id: user.id,
        assigned_vendor_id: assignedVendorId,
        vendor_inventory_item_id: vendorInventoryItemId,
      };

      if (isInstant) {
        orderData.manpower_fee = manpowerFee;
        orderData.transport_fee = transportFee;
        orderData.platform_fee = calculatedTotal - items.reduce((s, i) => s + ((i as any).vendor_base_price || i.price_value || 0) * i.quantity, 0);
        orderData.vendor_payout = items.reduce((s, i) => s + ((i as any).vendor_base_price || i.price_value || 0) * i.quantity, 0) + transportFee + manpowerFee;
      }

      const { error } = await supabase.from("rental_orders").insert(orderData as any);
      if (error) throw error;

      if (normalizedPhone) {
        try {
          await supabase.functions.invoke("wati-rental-confirmation", {
            body: { phone: normalizedPhone, name: profileData.full_name || "Customer", order_id: orderId },
          });
        } catch (whatsappErr) {
          console.error("WhatsApp rental confirmation failed:", whatsappErr);
        }
      }

      toast({ title: isInstant ? "Booking Confirmed!" : "Enquiry Sent!", description: isInstant ? "Your booking is confirmed. Vendor will be notified." : "Our team will respond within 24 hours." });
      clearCart();
      setShowEnquiry(false);
      setEventDetails({ event_start_date: "", event_end_date: "", venue_address_line1: "", venue_address_line2: "", venue_pincode: "", venue_lat: 0, venue_lng: 0, notes: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send enquiry", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const { calculatedTotal, hasQuoteItems } = calculateCartTotal(items);
  const grandTotal = calculatedTotal + manpowerFee + transportFee;

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
                          <button onClick={() => navigate(`/ecommerce/${item.id}`)} className="flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.title} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-border" />
                            ) : (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground/40" />
                              </div>
                            )}
                          </button>

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

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{formatItemPrice(item)}</span>
                              {item.pricing_unit && (
                                <span className="text-xs text-muted-foreground">/ {item.pricing_unit}</span>
                              )}
                            </div>

                            {/* Show booking dates per item */}
                            {(item.booking_from || item.booking_till) && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5" />
                                <span>{item.booking_from} → {item.booking_till}</span>
                                {item.booking_slot && item.booking_slot !== "full_day" && (
                                  <Badge variant="outline" className="text-[10px] capitalize">{item.booking_slot.replace("_", " ")}</Badge>
                                )}
                              </div>
                            )}

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
                        <h3 className="text-base font-bold text-foreground">
                          {isVenueOnlyCart || hasVenueItem ? "Booking Details" : "Event Details"}
                        </h3>
                      </div>
                      <button onClick={() => setShowEnquiry(false)} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      {profileData && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                          <p className="font-medium text-foreground">{profileData.full_name}</p>
                          <p className="text-muted-foreground text-xs">{profileData.email}</p>
                          <p className="text-muted-foreground text-xs">{profileData.phone}</p>
                        </div>
                      )}
                      {/* Booking dates derived from cart items */}
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                        <p className="text-xs font-semibold text-foreground">Booking Dates (from cart)</p>
                        {items.map(item => (
                          item.booking_from ? (
                            <div key={`${item.id}-${item.variant_id || ''}-dates`} className="flex justify-between text-xs">
                              <span className="text-muted-foreground line-clamp-1">{item.title}</span>
                              <span className="font-medium text-foreground flex-shrink-0">{item.booking_from} → {item.booking_till}</span>
                            </div>
                          ) : null
                        ))}
                      </div>
                      {showVenueAddressFields && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs">Venue Address Line 1 *</Label>
                            <Input value={eventDetails.venue_address_line1} onChange={e => setEventDetails(p => ({ ...p, venue_address_line1: e.target.value }))} placeholder="Street address, building name" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Venue Address Line 2</Label>
                            <Input value={eventDetails.venue_address_line2} onChange={e => setEventDetails(p => ({ ...p, venue_address_line2: e.target.value }))} placeholder="Area, landmark" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Pin Code *</Label>
                            <Input value={eventDetails.venue_pincode} onChange={e => setEventDetails(p => ({ ...p, venue_pincode: e.target.value }))} placeholder="500001" maxLength={6} />
                          </div>
                        </>
                      )}
                      <div className="space-y-1">
                        <Label className="text-xs">Additional Notes</Label>
                        <Textarea value={eventDetails.notes} onChange={e => setEventDetails(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requirements..." rows={3} />
                      </div>

                      {/* Logistics breakdown for instant book */}
                      {showInstantBookFlow && dateIsSet && (
                        <div className="space-y-2 pt-2">
                          <Separator />
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Logistics Breakdown</h4>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="flex items-center gap-1.5 text-muted-foreground"><Package className="h-3.5 w-3.5" /> Items Subtotal</span>
                              <span className="font-medium">₹{calculatedTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-3.5 w-3.5" /> Manpower</span>
                              <span className="font-medium">₹{manpowerFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Truck className="h-3.5 w-3.5" /> Transport
                                {transportLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                              </span>
                              <span className="font-medium">
                                {transportResult ? `₹${transportFee.toLocaleString()}` : eventDetails.venue_pincode ? "Calculating..." : "Enter PIN"}
                              </span>
                            </div>
                            {transportResult && (
                              <p className="text-[10px] text-muted-foreground">
                                {transportResult.distance_km} km · {transportResult.vehicle_type}
                              </p>
                            )}
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="text-base font-bold">Grand Total</span>
                            <span className="text-lg font-bold text-primary">₹{grandTotal.toLocaleString()}</span>
                          </div>

                          {!canInstantBook && dateIsSet && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              ⚠ Event is less than {minBookingHours} hours away — falls back to enquiry mode.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {canInstantBook && showVenueAddressFields ? (
                      <Button onClick={handleSendEnquiry} className="w-full gap-2" size="lg" disabled={submitting}>
                        <Zap className="h-4 w-4" /> {submitting ? "Confirming..." : "Confirm & Book Instantly"}
                      </Button>
                    ) : (
                      <Button onClick={handleSendEnquiry} className="w-full gap-2" size="lg" disabled={submitting}>
                        <Send className="h-4 w-4" /> {submitting ? "Sending..." : "Send Enquiry"}
                      </Button>
                    )}
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

                      {/* Show logistics preview if all priced */}
                      {showInstantBookFlow && (
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>+ Manpower (est.)</span>
                            <span>₹{manpowerFee.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>+ Transport (est.)</span>
                            <span>Calculated at checkout</span>
                          </div>
                          <Separator />
                        </div>
                      )}

                      {calculatedTotal > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-foreground">Estimated Total</span>
                          <span className="text-lg font-bold text-primary">₹{calculatedTotal.toLocaleString()}</span>
                        </div>
                      )}
                      {hasQuoteItems && (
                        <p className="text-[11px] text-muted-foreground">* Some items require a custom quote. Final price confirmed by our team.</p>
                      )}

                      {showInstantBookFlow && (
                        <Badge variant="secondary" className="gap-1">
                          <Zap className="h-3 w-3" /> Instant Book eligible
                        </Badge>
                      )}

                      <Button
                        onClick={async () => {
                          if (!user && !authLoading) {
                            toast({ title: "Please log in", description: "Sign in to send your enquiry.", variant: "destructive" });
                            navigate("/auth");
                            return;
                          }
                          if (user) {
                            const { data } = await supabase
                              .from("profiles")
                              .select("full_name, email, phone")
                              .eq("user_id", user.id)
                              .single();
                            if (data && data.full_name && data.phone) {
                              setProfileData({ full_name: data.full_name, email: data.email || user.email || "", phone: data.phone });
                              setProfileLoaded(true);
                              setShowEnquiry(true);
                            } else {
                              toast({ title: "Complete your profile", description: "Please add your name and phone number to proceed.", variant: "destructive" });
                              navigate("/client");
                            }
                          }
                        }}
                        className="w-full gap-2"
                        size="lg"
                      >
                        {showInstantBookFlow ? (
                          <><Zap className="h-4 w-4" /> Proceed to Book</>
                        ) : (
                          <><Send className="h-4 w-4" /> Proceed to Enquiry</>
                        )}
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center">
                        {showInstantBookFlow ? "Instant booking with real-time pricing." : "Our team will respond within 24 hours."}
                      </p>
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
